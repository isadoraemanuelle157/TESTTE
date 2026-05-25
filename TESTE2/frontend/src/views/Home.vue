<template>
<section>

  <!-- TOPO -->
  <div class="top-bar">

    <div class="top-actions">

      <router-link to="/registrar" class="login-btn">
            <i class="fa fa-user"></i> Entrar
          </router-link>

      <!-- PESQUISA -->
      <i
        class="fa fa-search top-search-icon"
        @click="goSearch"
      ></i>

      <!-- NOTIFICAÇÃO -->
      <div class="notification-icon">
        <i class="fa fa-bell"></i>
        <span v-if="notifications > 0" class="notification-badge">
          {{ notifications }}
        </span>
      </div>

    </div>

    <h2 class="welcome-title">
      <i class="fa fa-fire"></i> Explore o Som no SoundUp
    </h2>

  </div>


  <!-- CAIXA DESCUBRA -->
  <div class="discover-box" @click="toggleDiscover">

    <div>
      <h3>🎧 Descubra novos sons</h3>
      <p>Clique para explorar músicas novas</p>
    </div>

    <i class="fa" :class="showDiscover ? 'fa-angle-up' : 'fa-angle-down'"></i>

  </div>


  <!-- MUSICAS DESCOBERTA -->
  <div v-if="showDiscover" class="grid">

    <div
      v-for="(music,index) in musics.slice(0,3)"
      :key="'discover'+index"
      class="card"
      @click="playMusic(index)"
    >
      <img :src="music.cover" />

      <h3>{{ music.title }}</h3>
      <p>{{ music.artist }}</p>

    </div>

  </div>


  <!-- FEITO PARA VOCÊ -->
  <h3 class="section-title">✨ Feito para você</h3>

  <div class="grid">

    <div
      v-for="(music,index) in recommended"
      :key="index"
      class="card"
      @click="playMusic(index)"
    >

      <img :src="music.cover" />

      <h3>{{ music.title }}</h3>
      <p>{{ music.artist }}</p>

    </div>

  </div>


  <!-- ARTISTAS -->
  <h3 class="section-title">🎤 Artistas populares</h3>

  <div class="grid">

    <div class="card">
      <img src="https://picsum.photos/300?artist1">
      <h3>DJ Neon</h3>
      <p>Electronic</p>
    </div>

    <div class="card">
      <img src="https://picsum.photos/300?artist2">
      <h3>Dark Pulse</h3>
      <p>Synthwave</p>
    </div>

    <div class="card">
      <img src="https://picsum.photos/300?artist3">
      <h3>Nova Beats</h3>
      <p>Future Bass</p>
    </div>

  </div>


  <!-- TODAS AS MÚSICAS -->
  <h3 class="section-title">🎵 Todas as músicas</h3>

  <div class="grid">

    <div
      v-for="(music,index) in musics"
      :key="'all'+index"
      class="card"
      @click="playMusic(index)"
    >

      <img :src="music.cover" />

      <h3>{{ music.title }}</h3>
      <p>{{ music.artist }}</p>

      <div class="card-buttons">

        <button @click.stop="playMusic(index)">
          <i class="fa fa-play"></i>
        </button>

        <button @click.stop="toggleLikeMusic(music)">
          <i :class="isLiked(music) ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
        </button>

        <button @click.stop="addToPlaylist(music)">
          <i class="fa fa-plus"></i>
        </button>

      </div>

    </div>

  </div>

</section>
</template>

<script>
export default {

name:"Home",

props:{
musics:{
type:Array,
default:()=>[]
},

likedSongs:{
type:Array,
default:()=>[]
}
},

data(){
return{
showDiscover:false,
notifications:1
}
},

computed:{

recommended(){

if(!this.musics) return []

return [...this.musics]
.sort(()=>0.5-Math.random())
.slice(0,3)

}

},

methods:{

playMusic(index){
this.$emit("playMusic",index)
},

toggleLikeMusic(song){
this.$emit("toggleLikeMusic",song)
},

addToPlaylist(song){
this.$emit("addToPlaylist",song)
},

isLiked(song){
return this.likedSongs.some(m=>m.title===song.title)
},

toggleDiscover(){
this.showDiscover = !this.showDiscover
},

goSearch(){
this.$router.push("/search")
}

}

}
</script>

<style scoped>

.top-bar{
display:flex;
flex-direction:column;
gap:20px;
margin-bottom:10px;
}

.top-actions{
display:flex;
justify-content:flex-end;
align-items:center;
gap:20px;
}

.login-btn{
background:transparent;
border:1px solid #1DB954;
color:#1DB954;
padding:8px 18px;
border-radius:30px;
cursor:pointer;
font-weight:bold;
transition:0.3s;
}

.login-btn:hover{
background:#1DB954;
color:#000;
}

.notification-icon{
position:relative;
font-size:20px;
cursor:pointer;
color:#1DB954;
}

.notification-badge{
position:absolute;
top:-8px;
right:-8px;
background:red;
color:white;
font-size:11px;
padding:3px 6px;
border-radius:50%;
font-weight:bold;
}

.welcome-title{
font-size:28px;
display:flex;
align-items:center;
gap:10px;
}

.welcome-title i{
color:#1DB954;
}
section {
  width: 100%;
  min-height: 100vh;
}

.section-title{
margin-top:40px;
margin-bottom:10px;
font-size:20px;
color:#1DB954;
}

.grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
  gap:20px;
  margin-top:20px;
}

.card{
background:#111;
padding:20px;
border-radius:12px;
cursor:pointer;
transition:0.3s;
}

.card:hover{
background:#1a1a1a;
transform:scale(1.05);
}

.card img{
width:100%;
border-radius:10px;
margin-bottom:10px;
}

.card-buttons{
display:flex;
justify-content:space-between;
margin-top:10px;
}

.card-buttons button{
background:none;
border:none;
color:#1DB954;
font-size:18px;
cursor:pointer;
}

.top-search-icon{
font-size:20px;
cursor:pointer;
color:#1DB954;
}

/* CAIXA DESCUBRA */

.discover-box{
margin-top:20px;
background:linear-gradient(135deg,#1DB954,#0c6e2c);
padding:20px;
border-radius:14px;
display:flex;
justify-content:space-between;
align-items:center;
cursor:pointer;
transition:.3s;
}

.discover-box:hover{
transform:scale(1.03);
}

</style>