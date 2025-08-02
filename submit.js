const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST requests allowed');
  }

  const busboy = require('busboy');
  const bb = busboy({ headers: req.headers });

  let data = {};
  let fileBuffer = null;
  let fileName = '';

  bb.on('file', (name, file, info) => {
    fileName = info.filename;
    const chunks = [];
    file.on('data', (chunk) => chunks.push(chunk));
    file.on('end', () => {
      fileBuffer = Buffer.concat(chunks);
    });
  });

  bb.on('field', (name, val) => {
    data[name] = val;
  });

  bb.on('finish', async () => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.APP_PASSWORD,
        }
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.TO_EMAIL,
        subject: `New Anonymous Report - ${data.issueType}`,
        text: `Description: ${data.description}\nLocation: ${data.location || 'Not provided'}`,
        attachments: fileBuffer ? [{
          filename: fileName,
          content: fileBuffer
        }] : []
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send("✅ Report submitted and forwarded!");
    } catch (error) {
      console.error(error);
      res.status(500).send("❌ Failed to send report.");
    }
  });

  req.pipe(bb);
}
