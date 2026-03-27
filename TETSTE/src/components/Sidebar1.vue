<template>

<aside class="sidebar">

  <div>

    <div class="logo-icon">
      <i class="fa fa-headphones"></i>
    </div>

    <h1 class="logo">SoundUp</h1>

    <div class="divider"></div>

    <nav>
      <ul>

        <li>
          <router-link to="/" class="nav-link">
            <i class="fa fa-home"></i>
            <span>Home</span>
          </router-link>
        </li>

        <li>
          <router-link to="/search" class="nav-link">
            <i class="fa fa-search"></i>
            <span>Pesquisar</span>
          </router-link>
        </li>

        <li>
          <router-link to="/curtidas" class="nav-link">
            <i class="fa fa-heart"></i>
            <span>Curtidas</span>
          </router-link>
        </li>

        <li>
          <router-link to="/playlist" class="nav-link">
            <i class="fa fa-list"></i>
            <span>Playlists</span>
          </router-link>
        </li>
        <li>
          <router-link to="/salademusica" class="nav-link">
            <i class="fa fa-list"></i>
            <span>Sala de Música</span>
          </router-link>
        </li>
        <li>
          <router-link to="/karaoke" class="nav-link">
            <i class="fa fa-list"></i>
            <span>Karaoke</span>
          </router-link>
        </li>
        <li>
          <router-link to="/desafiomusical" class="nav-link">
            <i class="fa fa-list"></i>
            <span>Desafio Musical</span>
          </router-link>
        </li>
        <li>
          <router-link to="/carregamento2" class="nav-link">
            <i class="fa fa-list"></i>
            <span>Carregamento 1</span>
          </router-link>
        </li>
        <li>
          <router-link to="/carregamento1" class="nav-link">
            <i class="fa fa-list"></i>
            <span>Carregamento 2</span>
          </router-link>
        </li>
         <li>
          <router-link to="/chatiamusica" class="nav-link">
            <i class="fa fa-list"></i>
            <span>Chat IA</span>
          </router-link>
        </li>

     <li>
  <router-link to="/matchmusical" class="nav-link">
    <img src="@/assets/icon-match.png" class="icon-match">
    <span>Match Musical</span>
  </router-link>
</li>

      </ul>
    </nav>

  </div>

</aside>

</template>

<script>
export default {
name: "Sidebar"
}
</script>

<style scoped>

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.sidebar{
  width:260px;
  height:100vh;
  background: linear-gradient(180deg, #000000, #0a1a3f);
  padding:30px 0;
  border-right:1px solid #0a1a3f;
  position:fixed;
  left:0;
  top:0;
}

.logo-icon{
  font-size:42px;
  color:#ffffff;
  text-align:center;
  margin-bottom:8px;
  text-shadow:0 0 10px rgba(10,26,63,0.8);
}

.logo{
  color:#ffffff;
  text-align:center;
  margin-bottom:22px;
  font-weight:700;
  letter-spacing:2px;
  font-size:22px;
  text-shadow:0 0 12px rgba(10,26,63,0.7);
}

.divider{
  height:1px;
  background:#0a1a3f;
  margin:20px 0;
}

.sidebar ul{
  list-style:none;
  padding:0;
  margin:0;
}

.nav-link{
  display:flex;
  align-items:center;
  gap:12px;
  padding:14px 20px;
  text-decoration:none;
  color:white;
  position:relative;
  transition:all 0.25s ease;
}

/* animação hover */
.nav-link:hover{
  background:#0a1a3f;
  padding-left:28px;
}

/* item ativo */
.router-link-active{
  background:#0a1a3f;
}

/* indicador lateral */
.router-link-active::before{
  content:"";
  position:absolute;
  left:0;
  top:0;
  height:100%;
  width:4px;
  background:#0a1a3f;
  border-radius:0 4px 4px 0;
}

.nav-link i{
  width:20px;
  text-align:center;
  font-size:16px;
}
.icon-match{
  width:18px;
  height:18px;
  object-fit:contain;

  /* transforma o ícone em branco */
  filter: brightness(0) invert(1);
}
</style>    