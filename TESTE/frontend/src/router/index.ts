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
import TabelaGenero from '@/banco/tabelas/TabelaGenero.vue'
import TabelaMusica from '@/banco/tabelas/TabelaMusica.vue'
import TabelaUsuario from '@/banco/tabelas/TabelaUsuario.vue'

import MusicPlayer from '@/components/MusicPlayer.vue'
import TabelaAlbum from '@/banco/tabelas/TabelaAlbum.vue'
import TabelaCantor from '@/banco/tabelas/TabelaCantor.vue'
import Dashboard from '@/views/Dashboard.vue'
import Registrar2 from '@/banco/Registrar2.vue'
import Perfil from '@/views/Perfil.vue'
import Favoritas from '@/views/Favoritas.vue'
import FeitoParaVoce from '@/components/FeitoParaVoce.vue'
import Vibe from '@/banco/Vibe.vue'
import SelecionarAvatar from '@/components/SelecionarAvatar.vue'
// import SalasMusicais from '@/components/SalasMusicais.vue'

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
    },
    {
      path: '/curtidas',
      name: 'curtidas',
      component: Curtidas,
    },
    {
      path: '/favoritas',
      name: 'favoritas',
      component: Favoritas,
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
    //  {
    //   path: '/salasmusicais',
    //   name: 'salasmusicais',
    //   component: SalasMusicais,
    // },
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
      path: '/registrar2',
      name: 'registrar2',
      component: Registrar2,
    },
     {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: Perfil,
    },
      {
      path: '/selecionaravatar',
      name: 'selecionaravatar',
      component: SelecionarAvatar,
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
      path: '/vibe',
      name: 'vibe',
      component: Vibe,
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