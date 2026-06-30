const ContatoMensagem = require('../models/ContatoMensagem')
const Usuario = require('../models/Usuario')
const notificacaoService = require('./notificacaoService')

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

  const contato = await ContatoMensagem.create({
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
          tipo: 'contact_message',
          mensagem: `${usuario.nome || 'Usuário'} enviou uma nova mensagem de contato`,
          meta: {
            contatoId: contato._id,
            assunto: contato.assunto
          }
        }))
      )
    } catch (err) {
      console.error('❌ Erro ao criar notificações de contato:', err.message)
    }
  }

  return await ContatoMensagem.findById(contato._id)
    .populate('usuario', 'nome email role')
    .populate('mensagens.autor', 'nome email avatar role')
}

async function listarMinhasMensagens(userId) {
  return ContatoMensagem.find({ usuario: userId })
    .sort({ ultimaMensagemEm: -1 })
    .populate('mensagens.autor', 'nome email avatar role')
}

async function listarTodasMensagens() {
  return ContatoMensagem.find()
    .sort({ ultimaMensagemEm: -1 })
    .populate('usuario', 'nome email role')
    .populate('mensagens.autor', 'nome email avatar role')
}

async function responderMensagem({ contatoId, user, mensagem }) {
  const usuario = await buscarUsuarioAutenticado(user)

  const contato = await ContatoMensagem.findById(contatoId)
    .populate('usuario', 'nome email role')

  if (!contato) {
    throw new Error('Conversa de contato não encontrada')
  }

  const isAdmin = usuario.role === 'admin'

  if (!isAdmin && String(contato.usuario._id) !== String(usuario._id)) {
    throw new Error('Sem permissão para responder esta conversa')
  }

  contato.mensagens.push({
    autor: usuario._id,
    autorTipo: isAdmin ? 'admin' : 'user',
    nomeAutor: usuario.nome || (isAdmin ? 'Administrador' : 'Usuário'),
    mensagem
  })

  contato.status = isAdmin ? 'respondido' : 'aberto'
  contato.ultimaMensagemEm = new Date()

  await contato.save()

  if (isAdmin) {
    try {
      await notificacaoService.criar({
        usuarioDestino: contato.usuario._id,
        usuarioOrigem: usuario._id,
        tipo: 'contact_reply',
        mensagem: `O suporte respondeu sua mensagem de contato: ${contato.assunto}`,
        meta: {
          contatoId: contato._id,
          assunto: contato.assunto
        }
      })
    } catch (err) {
      console.error('❌ Erro ao notificar usuário:', err.message)
    }
  } else {
    const admins = await buscarAdmins()

    if (admins.length) {
      try {
        await notificacaoService.criarMuitas(
          admins.map(admin => ({
            usuarioDestino: admin._id,
            usuarioOrigem: usuario._id,
            tipo: 'contact_reply',
            mensagem: `${usuario.nome || 'Usuário'} respondeu a conversa de contato`,
            meta: {
              contatoId: contato._id,
              assunto: contato.assunto
            }
          }))
        )
      } catch (err) {
        console.error('❌ Erro ao notificar admins:', err.message)
      }
    }
  }

  return await ContatoMensagem.findById(contato._id)
    .populate('usuario', 'nome email role')
    .populate('mensagens.autor', 'nome email avatar role')
}

async function excluirMensagem({ contatoId, user }) {
  const usuario = await buscarUsuarioAutenticado(user)

  const contato = await ContatoMensagem.findById(contatoId)

  if (!contato) {
    throw new Error('Conversa não encontrada')
  }

  const isAdmin = usuario.role === 'admin'

  if (!isAdmin && String(contato.usuario) !== String(usuario._id)) {
    throw new Error('Sem permissão')
  }

  await ContatoMensagem.findByIdAndDelete(contatoId)

  return true
}

module.exports = {
  criarMensagem,
  listarMinhasMensagens,
  listarTodasMensagens,
  responderMensagem,
  excluirMensagem
}