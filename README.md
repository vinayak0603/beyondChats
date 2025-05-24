
# 📄 BeyondChats Assignment

BeyondChats assignment is a Node.js + Express backend server designed to extract text from uploaded PDF files and respond to user queries based on the content of the uploaded document. It supports authentication and includes routes for uploading PDFs and asking questions.

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js
- **Authentication**: Express-Session, Passport.js
- **File Upload**: Multer
- **PDF Parsing**: pdf-parse
- **CORS Support**: For frontend integration
- **(Optional)**: OpenAI API for question answering (currently not integrated)

---

## 🚀 Features

- ✅ PDF upload and text extraction
- ✅ User authentication (protected routes)
- ✅ Ask questions based on uploaded document
- ✅ Secure cookie configuration for deployment
- 🔒 Uses session-based auth with cookie support

---

## 📁 Project Structure

```
project-root/
├── server
├── client
├── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in your root directory and add:

```env
SESSION_SECRET=your_secure_secret_here
CLIENT_URL=https://your-frontend.netlify.app
```

---

## ⚙️ How to Run Locally

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/beyondchats.git
   cd beyondchats
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the server:**
   ```bash
   node server.js
   ```

---

## 🔒 Secure Cookies on Netlify

When deploying to Netlify, ensure you use:

```js
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}));
```

---

## 🛠 API Endpoints

| Method | Endpoint      | Description                     |
|--------|---------------|---------------------------------|
| POST   | `/login`      | Logs in a user                  |
| POST   | `/logout`     | Logs out a user                 |
| GET    | `/user`       | Checks auth status              |
| POST   | `/upload`     | Uploads and parses a PDF file   |
| POST   | `/ask`        | Responds to a question using parsed text (OpenAI integration placeholder) |

---

## 🤖 Future Features

- 🔄 Integrate OpenAI API for intelligent Q&A
- 🧠 Improve document chunking and memory
- 🌐 Upload multiple files and maintain session context

---

## 📢 Notes

- Make sure to use **HTTPS** in production since cookies are `secure: true`.
- The OpenAI integration is currently **commented out** for safety. Replace the placeholder with actual API logic when ready.

---

## 📬 Contact

For suggestions or bugs, feel free to reach out or open an issue.

---

## 📝Live Link

https://beyond-chats-chatbot.netlify.app/

---

## 📝Video Link

https://drive.google.com/file/d/17riYz2r_befsCncoeKBD00ilysSM1k_1/view?usp=drivesdk

---

