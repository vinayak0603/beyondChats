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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'https://beyond-chats-chatbot.netlify.app',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://beyondchats-dqoh.onrender.com/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  return done(null, profile);
}));

// ✅ This is the FIXED route
app.get('/auth/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    accessType: 'offline',
    prompt: 'consent',
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed', session: true }),
  (req, res) => {
    req.session.tokens = {
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken,
    };
    res.redirect('https://beyond-chats-chatbot.netlify.app/dashboard');
  }
);

app.get('/userinfo', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('Not logged in');
  res.json({ email: req.user.emails[0].value });
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.redirect('https://beyond-chats-chatbot.netlify.app/');
  });
});

app.get('/emails', async (req, res) => {
  if (!req.session.tokens) return res.status(401).send('Unauthorized');

  const auth = new google.auth.OAuth2();
  auth.setCredentials(req.session.tokens);
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
      } else if (rawFrom.includes('@')) {
        fromName = rawFrom.trim();
        fromEmail = rawFrom.trim();
      } else {
        fromName = rawFrom.trim() || 'Unknown Sender';
        fromEmail = 'unknown@example.com';
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

app.post('/reply', express.json(), async (req, res) => {
  if (!req.session.tokens) return res.status(401).send('Unauthorized');
  const { to, subject, body, threadId } = req.body;

  const auth = new google.auth.OAuth2();
  auth.setCredentials(req.session.tokens);
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
        threadId: threadId,
      },
    });
    res.send({ success: true });
  } catch (error) {
    console.error('Failed to send reply:', error);
    res.status(500).send('Failed to send reply');
  }
});

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let extractedText = '';

app.post('/upload', upload.single('file'), async (req, res) => {
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

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const prompt = extractedText
      ? `Here is a document:\n${extractedText}\n\nAnswer the following question based on the document:\n"${question}"`
      : `I don't have any reference document uploaded. Please upload a PDF to ask based on it.`;

    if (!extractedText) {
      return res.json({ answer: prompt });
    }

    return res.json({ answer: 'OpenAI API is disabled. Please configure your API key to get real answers.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process the question' });
  }
});

app.post('/clear', (req, res) => {
  extractedText = '';
  res.json({ message: 'Extracted text cleared' });
});



app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

