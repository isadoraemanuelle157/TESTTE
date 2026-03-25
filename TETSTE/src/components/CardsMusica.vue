<template>
<div class="card">

  <img :src="music.cover" />

  <h3>{{ music.title }}</h3>
  <p>{{ music.artist }}</p>

  <div v-if="showButtons" class="card-buttons">

    <button @click.stop="play">
      <i class="fa fa-play"></i>
    </button>

    <button v-if="showLike" @click.stop="toggleLike">
      <i :class="liked ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
    </button>

    <button v-if="showPlaylist" @click.stop="showAddModal = true">
      ➕ playlist
    </button>

  </div>

  <AddToPlaylistModal
    v-model="showAddModal"
    :music="music"
  />

</div>
</template>

<script>
import { playMusic } from "@/stores/playerStore"
import AddToPlaylistModal from "@/components/AddToPlaylistModal.vue"

export default {

name:"CardsMusica",

components:{
AddToPlaylistModal
},

props:{
music:Object,
liked:Boolean,

showButtons:{
type:Boolean,
default:true
},

showLike:{
type:Boolean,
default:true
},

showPlaylist:{
type:Boolean,
default:true
}

},

data(){
return{
showAddModal:false
}
},

methods:{

play(){
playMusic(this.music)
this.$emit("play")
},

toggleLike(){
this.$emit("toggleLike")
},

addToPlaylist(){
this.$emit("addToPlaylist")
}

}

}
</script>

<style scoped>

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

</style>