import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Curtidas from '../views/Curtidas.vue'
import Search from '../views/Search.vue'
import Playlist from '../views/Playlist.vue'
import Sidebar from '@/components/Sidebar.vue'
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
import TabelaGenero from '@/banco/tabelas/TabelaGenero.vue'
import TabelaMusica from '@/banco/tabelas/TabelaMusica.vue'
import TabelaUsuario from '@/banco/tabelas/TabelaUsuario.vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar1 from '@/components/Sidebar1.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import TabelaAlbum from '@/banco/tabelas/TabelaAlbum.vue'
import TabelaCantor from '@/banco/tabelas/TabelaCantor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/curtidas',
      name: 'curtidas',
      component: Curtidas,
    },
       {
      path: '/search',
      name: 'search',
      component: Search,
    },
     {
      path: '/navbar',
      name: 'navbar',
      component: Navbar,
    },
       {
      path: '/playlist',
      name: 'playlist',
      component: Playlist,
    },
    {
      path: '/musicplayer',
      name: 'musicplayer',
      component: MusicPlayer,
    },
    {
      path: '/sidebar1',
      name: 'sidebar1',
      component: Sidebar1,
    },
    {
      path: '/sidebar',
      name: 'sidebar',
      component: Sidebar,
    },
    {
      path: '/notificacoes',
      name: 'notificacoes',
      component: Notificacoes,
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
      path: '/salademusica',
      name: 'salademusica',
      component: SaladeMusica,
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
    },
     {
      path: '/login',
      name: 'login',
      component: Login,
    },
     {
      path: '/tabelausuario',
      name: 'tabelausuario',
      component: TabelaUsuario,
    },
    {
      path: '/tabelagenero',
      name: 'tabelagenero',
      component: TabelaGenero,
    },
    {
      path: '/tabelamusica',
      name: 'tabelamusica',
      component: TabelaMusica,
    },
    {
      path: '/tabelaalbum',
      name: 'tabelaalbum',
      component: TabelaAlbum,
    },
    {
      path: '/tabelacantor',
      name: 'tabelacantor',
      component: TabelaCantor,
    },
    {
      path: '/editarusuario/:id',
      name: 'editarusuario',
      component: EditarUsuario,
    },
     {
      path: '/generos',
      name: 'generos',
      component: Generos,
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
  ],
})

export default router
