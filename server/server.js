require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = 'https://beyond-chats-chatbot.netlify.app';
const CALLBACK_URL = 'https://beyondchats-dqoh.onrender.com/auth/google/callback';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  return done(null, profile);
}));

// Middleware to protect routes
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// Auth Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ],
  accessType: 'offline',
  prompt: 'consent',
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed', session: true }),
  (req, res) => {
    req.session.tokens = {
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken,
    };
    res.redirect(`${CLIENT_ORIGIN}/dashboard`);
  }
);

// User Info
app.get('/userinfo', ensureAuthenticated, (req, res) => {
  res.json({ email: req.user.emails[0].value });
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.redirect(CLIENT_ORIGIN);
  });
});

// Gmail Fetch Route
app.get('/emails', ensureAuthenticated, async (req, res) => {
  const tokens = req.session.tokens;
  if (!tokens) return res.status(401).send('Unauthorized');

  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const emails = await Promise.all(data.messages.map(async (msg) => {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const headers = message.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const rawFrom = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const messageId = headers.find(h => h.name === 'Message-ID')?.value || '';
      const snippet = message.data.snippet;
      const threadId = message.data.threadId;

      let fromName = '', fromEmail = '';
      const match = rawFrom.match(/^(.*)<(.*)>$/);
      if (match) {
        fromName = match[1].trim();
        fromEmail = match[2].trim();
      } else {
        fromName = rawFrom.trim();
        fromEmail = rawFrom.trim();
      }

      return {
        id: msg.id,
        subject,
        from: fromName,
        email: fromEmail,
        date,
        snippet,
        threadId,
        messageId,
      };
    }));

    res.json({ messages: emails });
  } catch (error) {
    console.error('Email fetch error:', error);
    res.status(500).send('Failed to fetch emails');
  }
});

// Reply Route
app.post('/reply', ensureAuthenticated, async (req, res) => {
  const { to, subject, body, threadId } = req.body;
  const tokens = req.session.tokens;

  if (!to || !subject || !body || !threadId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth });

  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    body,
  ];

  const email = emailLines.join('\n');
  const base64EncodedEmail = Buffer.from(email).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64EncodedEmail,
        threadId,
      },
    });
    res.send({ success: true });
  } catch (error) {
    console.error('Failed to send reply:', error);
    res.status(500).send('Failed to send reply');
  }
});

// File Upload
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

let extractedText = '';

app.post('/upload', ensureAuthenticated, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text;
    res.status(200).json({ message: '✅ PDF uploaded and parsed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Failed to parse PDF' });
  }
});

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ask Question
app.post('/ask', ensureAuthenticated, async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  if (!extractedText) {
    return res.json({ answer: 'I don’t have any reference document uploaded. Please upload a PDF first.' });
  }

  try {
    const prompt = `Here is a document:\n${extractedText}\n\nAnswer the following question:\n"${question}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get answer from OpenAI' });
  }
});

// Clear PDF Text
app.post('/clear', ensureAuthenticated, (req, res) => {
  extractedText = '';
  res.json({ message: 'Extracted text cleared' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
