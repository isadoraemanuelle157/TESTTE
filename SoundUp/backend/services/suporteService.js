const SuporteMensagem = require('../models/SuporteMensagem')
const Usuario = require('../models/Usuario')
const notificacaoService = require('./notificacaoService')
const {
  enviarEmailSuporte,
  enviarEmailRespostaUsuario
} = require('./emailService')

async function buscarAdmins() {
  return Usuario.find({ role: 'admin' }).select('_id nome email role')
}

async function buscarUsuarioAutenticado(user) {
  const userId = user?.id || user?._id

  if (!userId) {
    throw new Error('Usuário autenticado inválido')
  }

  const usuario = await Usuario.findById(userId).select('_id nome email role')

  if (!usuario) {
    throw new Error('Usuário não encontrado')
  }

  return usuario
}

async function criarMensagem({ user, assunto, categoria, mensagem }) {
  const usuario = await buscarUsuarioAutenticado(user)

  const suporte = await SuporteMensagem.create({
    usuario: usuario._id,
    nome: usuario.nome || 'Usuário',
    email: usuario.email || '',
    assunto,
    categoria: categoria || 'geral',
    status: 'aberto',
    mensagens: [
      {
        autor: usuario._id,
        autorTipo: 'user',
        nomeAutor: usuario.nome || 'Usuário',
        mensagem
      }
    ],
    ultimaMensagemEm: new Date()
  })

  const admins = await buscarAdmins()

  if (admins.length) {
    try {
      await notificacaoService.criarMuitas(
        admins.map(admin => ({
          usuarioDestino: admin._id,
          usuarioOrigem: usuario._id,
          tipo: 'support_message',
          mensagem: `${usuario.nome || 'Usuário'} enviou uma nova mensagem de suporte`,
          meta: {
            suporteId: suporte._id,
            assunto: suporte.assunto
          }
        }))
      )
    } catch (err) {
      console.error('❌ Erro ao criar notificações de suporte:', err.message)
    }
  }

  // Não derrubar a API por causa do e-mail
  try {
    await enviarEmailSuporte({
      nome: usuario.nome || 'Usuário',
      email: usuario.email || '',
      assunto,
      mensagem
    })
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail de suporte:', err.message)
  }

  return await SuporteMensagem.findById(suporte._id)
    .populate('usuario', 'nome email role')
    .populate('mensagens.autor', 'nome email avatar role')
}

async function listarMinhasMensagens(userId) {
  return SuporteMensagem.find({ usuario: userId })
    .sort({ ultimaMensagemEm: -1 })
    .populate('mensagens.autor', 'nome email avatar role')
}

async function responderMensagem({ suporteId, user, mensagem }) {
  const usuario = await buscarUsuarioAutenticado(user)

  const suporte = await SuporteMensagem.findById(suporteId)
    .populate('usuario', 'nome email role')

  if (!suporte) {
    throw new Error('Conversa de suporte não encontrada')
  }

  const isAdmin = usuario.role === 'admin'

  if (!isAdmin && String(suporte.usuario._id) !== String(usuario._id)) {
    throw new Error('Sem permissão para responder esta conversa')
  }

  suporte.mensagens.push({
    autor: usuario._id,
    autorTipo: isAdmin ? 'admin' : 'user',
    nomeAutor: usuario.nome || (isAdmin ? 'Administrador' : 'Usuário'),
    mensagem
  })

  suporte.status = isAdmin ? 'respondido' : 'aberto'
  suporte.ultimaMensagemEm = new Date()

  await suporte.save()

  if (isAdmin) {
    try {
      await notificacaoService.criar({
        usuarioDestino: suporte.usuario._id,
        usuarioOrigem: usuario._id,
        tipo: 'support_reply',
        mensagem: `O suporte respondeu sua mensagem: ${suporte.assunto}`,
        meta: {
          suporteId: suporte._id,
          assunto: suporte.assunto
        }
      })
    } catch (err) {
      console.error('❌ Erro ao notificar usuário:', err.message)
    }

    try {
      await enviarEmailRespostaUsuario({
        email: suporte.email,
        assunto: suporte.assunto,
        mensagem
      })
    } catch (err) {
      console.error('❌ Erro ao enviar e-mail de resposta ao usuário:', err.message)
    }
  } else {
    const admins = await buscarAdmins()

    if (admins.length) {
      try {
        await notificacaoService.criarMuitas(
          admins.map(admin => ({
            usuarioDestino: admin._id,
            usuarioOrigem: usuario._id,
            tipo: 'support_reply',
            mensagem: `${usuario.nome || 'Usuário'} respondeu a conversa de suporte`,
            meta: {
              suporteId: suporte._id,
              assunto: suporte.assunto
            }
          }))
        )
      } catch (err) {
        console.error('❌ Erro ao notificar admins:', err.message)
      }
    }
  }

  return await SuporteMensagem.findById(suporte._id)
    .populate('usuario', 'nome email role')
    .populate('mensagens.autor', 'nome email avatar role')
}

async function excluirMensagem({ suporteId, user }) {
  const usuario = await buscarUsuarioAutenticado(user)

  const suporte = await SuporteMensagem.findById(suporteId)

  if (!suporte) {
    throw new Error('Conversa não encontrada')
  }

  const isAdmin = usuario.role === 'admin'

  if (!isAdmin && String(suporte.usuario) !== String(usuario._id)) {
    throw new Error('Sem permissão')
  }

  await SuporteMensagem.findByIdAndDelete(suporteId)

  return true
}

// ✅ ADICIONAR no suporteService.js, antes do module.exports:

async function listarTodasMensagens() {
  return SuporteMensagem.find()
    .sort({ ultimaMensagemEm: -1 })
    .populate('usuario', 'nome email role')
    .populate('mensagens.autor', 'nome email avatar role')
}

// ✅ CORRIGIDO - module.exports:
module.exports = {
  criarMensagem,
  listarMinhasMensagens,
  listarTodasMensagens,   // ← ADICIONAR
  responderMensagem,
  excluirMensagem
}
