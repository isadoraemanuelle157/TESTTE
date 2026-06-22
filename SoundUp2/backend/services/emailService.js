const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const SUPPORT_RECEIVER = process.env.SUPPORT_RECEIVER || 'isa@gmail.com, pablo@gmail.com'

async function enviarEmailSuporte({ nome, email, assunto, mensagem }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return

  await transporter.sendMail({
    from: `"SoundUp Suporte" <${process.env.EMAIL_USER}>`,
    to: SUPPORT_RECEIVER,
    subject: `Novo contato de suporte: ${assunto}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>Novo contato enviado</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <p><strong>Mensagem:</strong></p>
        <div style="background:#f4f4f4;padding:12px;border-radius:8px">
          ${mensagem}
        </div>
      </div>
    `
  })
}

async function enviarEmailRespostaUsuario({ email, assunto, mensagem }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !email) return

  await transporter.sendMail({
    from: `"SoundUp Suporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Resposta do suporte: ${assunto}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>Você recebeu uma resposta do suporte</h2>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <p><strong>Mensagem:</strong></p>
        <div style="background:#f4f4f4;padding:12px;border-radius:8px">
          ${mensagem}
        </div>
      </div>
    `
  })
}

module.exports = {
  enviarEmailSuporte,
  enviarEmailRespostaUsuario
}
