import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Curtidas from '../views/Curtidas.vue'
import Search from '../views/Search.vue'
import Playlist from '../views/Playlist.vue'
import Notificacoes from '@/components/Notificacoes.vue'
import Artistas from '@/components/Artistas.vue'
import ChatIAMusica from '@/components/ChatIAMusica.vue'
import Carregamento1 from '@/components/Carregamento1.vue'
import Carregamento2 from '@/components/Carregamento2.vue'
import DesafioMusical from '@/components/DesafioMusical.vue'
import Karaoke from '@/components/Karaoke.vue'
import SaladeMusica from '@/components/SaladeMusica.vue'
import MatchMusical from '@/components/MatchMusical.vue'
import Registrar from '@/banco/Registrar.vue'
import Login from '@/banco/Login.vue'
import EditarUsuario from '@/banco/EditarUsuario.vue'
import Generos from '@/banco/Generos.vue'
import Musicas from '@/banco/Musicas.vue'
import Albuns from '@/banco/Albuns.vue'
import Cantor from '@/banco/Cantor.vue'
import TabelaUsuario from '@/banco/tabelas/TabelaUsuario.vue'
import Dashboard from '@/views/Dashboard.vue'
import Registrar2 from '@/banco/Registrar2.vue'
import Perfil from '@/views/Perfil.vue'
import Favoritas from '@/views/Favoritas.vue'
import FeitoParaVoce from '@/components/FeitoParaVoce.vue'
import Vibe from '@/banco/Vibe.vue'
import SelecionarAvatar from '@/components/SelecionarAvatar.vue'
import PerfilUsuario from '@/views/PerfilUsuario.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import DetalheCantor from '@/views/DetalheCantor.vue'
import RecuperarSenha from '@/banco/RecuperarSenha.vue'
import Termos from '@/components/Termos.vue'
import Privacidade from '@/components/Privacidade.vue'
import Contato from '@/components/Contato.vue'
import Ajuda from '@/components/Ajuda.vue'
import Suporte from '@/components/Suporte.vue'
import SpotifyConnected from '@/components/SpotifyConnected.vue'
import LocalPlaylist from '@/views/LocalPlaylist.vue'
import RoomCreation from '@/components/RoomCreation.vue'
import DecadasPlaylist from '@/views/DecadasPlaylist.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/curtidas',
      name: 'curtidas',
      component: Curtidas,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/favoritas',
      name: 'favoritas',
      component: Favoritas,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
    },
    {
      path: '/playlist',
      name: 'playlist',
      component: Playlist,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/musicplayer',
      name: 'musicplayer',
      component: MusicPlayer,
    },
    {
      path: '/feitoparavoce',
      name: 'feitoparavoce',
      component: FeitoParaVoce,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/notificacoes',
      name: 'notificacoes',
      component: Notificacoes,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
       {
  path: '/recuperar-senha',
  name: 'RecuperarSenha',
  component: RecuperarSenha
},
    {
      path: '/artistas',
      name: 'artistas',
      component: Artistas,
    },
    {
      path: '/chatiamusica',
      name: 'chatiamusica',
      component: ChatIAMusica,
    },
    {
      path: '/carregamento1',
      name: 'carregamento1',
      component: Carregamento1,
    },
    {
      path: '/carregamento2',
      name: 'carregamento2',
      component: Carregamento2,
    },
    {
      path: '/desafiomusical',
      name: 'desafiomusical',
      component: DesafioMusical,
    },
    {
      path: '/karaoke',
      name: 'karaoke',
      component: Karaoke,
    },
     {
      path: '/rooms/create',
      name: 'RoomCreation',
      component: RoomCreation,
       meta: { requiresAuth: false }
    },
    {
      path: '/room',
      name: 'salademusica',
      component: SaladeMusica,
      meta: { requiresAuth: false }
    },
     {
      path: '/local/:nome',
      name: 'LocalPlaylist',
      component: LocalPlaylist,
    },
      {
      path: '/decada/:nome',
      name: 'DecadePlaylist',
      component: DecadasPlaylist,
    },
    {
      path: '/matchmusical',
      name: 'matchmusical',
      component: MatchMusical,
    },
    {
      path: '/registrar',
      name: 'registrar',
      component: Registrar,
      meta: { guestOnly: true }, // 🔥 Só para não logados
    },
    {
      path: '/registrar2',
      name: 'registrar2',
      component: Registrar2,
      meta: { guestOnly: true }, // 🔥 Só para não logados
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true }, // 🔥 Só para não logados
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: Perfil,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
  path: '/usuario/:id',
  name: 'PerfilUsuario',
  component: PerfilUsuario
},
    {
      path: '/selecionaravatar',
      name: 'selecionaravatar',
      component: SelecionarAvatar,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/tabelausuario',
      name: 'tabelausuario',
      component: TabelaUsuario,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/editarusuario/:id',
      name: 'editarusuario',
      component: EditarUsuario,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/generos',
      name: 'generos',
      component: Generos,
    },
    {
      path: '/vibe',
      name: 'vibe',
      component: Vibe,
      meta: { requiresAuth: true }, // 🔥 Protege a rota
    },
    {
      path: '/musicas',
      name: 'musicas',
      component: Musicas,
    },
    {
      path: '/albuns',
      name: 'albuns',
      component: Albuns,
    },
    {
      path: '/cantor',
      name: 'cantor',
      component: Cantor,
    },
     {
      path: '/cantor/:id',
      name: 'DetalheCantor',
      component: DetalheCantor,
      props: true,
    },
    {
      path: '/termos',
      name: 'termos',
      component: Termos,
    },
    {
      path: '/privacidade',
      name: 'privacidade',
      component: Privacidade,
    },
    {
      path: '/contato',
      name: 'contato',
      component: Contato,
    },
    {
      path: '/ajuda',
      name: 'ajuda',
      component: Ajuda,
    },
        {
      path: '/suporte',
      name: 'suporte',
      component: Suporte,
    },
      {
      path: '/spotify-connected',
      name: 'SpotifyConnected',
      component: SpotifyConnected,
    },
  ],
})

// 🔥 NOVO: Guarda de navegação global
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const token = localStorage.getItem('token')

  // Verifica se rota requer autenticação
  if (to.meta.requiresAuth) {
    if (!isLoggedIn || !token) {
      // Não está logado, redireciona para login
      next('/login')
      return
    }
  }

  // Verifica se rota é só para visitantes (não logados)
  if (to.meta.guestOnly) {
    if (isLoggedIn && token) {
      // Já está logado, redireciona para dashboard
      next('/dashboard')
      return
    }
  }

  // Continua normalmente
  next()
})

export default router