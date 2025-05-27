// mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter = null;

// Solo configurar el transporter si hay credenciales
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  console.warn('EMAIL_USER o EMAIL_PASS no están definidas. El envío de correos está deshabilitado.');
}

const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn('Transporte de correo no configurado. No se enviará ningún correo.');
    return Promise.resolve(); // o `return Promise.reject(new Error(...));` si quieres marcarlo como fallo
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
