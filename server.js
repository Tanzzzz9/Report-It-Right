const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static('public'));

app.post('/submit', upload.single('evidence'), async (req, res) => {
  const { issueType, description, location } = req.body;
  const file = req.file;

  // Email setup (replace with your credentials)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'authority@example.com',
    subject: `New Anonymous Report - ${issueType}`,
    text: `Description: ${description}\nLocation: ${location || 'Not provided'}`,
    attachments: file ? [{
      filename: file.originalname,
      content: file.buffer
    }] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("✅ Report submitted and forwarded successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error sending report.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
