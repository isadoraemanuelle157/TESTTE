<template>

<div v-if="show" class="playlist-modal">

  <div class="playlist-box add-box">

    <h3>Adicionar à Playlist</h3>

    <div class="playlist-select">

      <div
        v-for="(pl,index) in playlists"
        :key="index"
        class="playlist-option"
        :class="{selected: selectedPlaylistName === pl.name}"
        @click="selectPlaylist(pl.name)"
      >

        <img
          :src="pl.songs.length ? pl.songs[0].cover : 'https://picsum.photos/100?random='+index"
        />

        <span>{{ pl.name }}</span>

      </div>

    </div>

    <div class="modal-buttons">

      <button @click="confirmAdd">Adicionar</button>

      <button @click="$emit('close')">
        Cancelar
      </button>

    </div>

  </div>

</div>

</template>

<script>
export default {

name:"AddToPlaylistModal",

props:[
"show",
"playlists",
"song"
],

data(){
return{
selectedPlaylistName:''
}
},

methods:{

selectPlaylist(name){
this.selectedPlaylistName = name
},

confirmAdd(){

if(!this.selectedPlaylistName){
this.$emit("error","Selecione uma playlist")
return
}

this.$emit("confirm",{
playlistName:this.selectedPlaylistName,
song:this.song
})

this.selectedPlaylistName = ""

}

}

}
</script>

<style scoped>

.playlist-modal{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.85);
display:flex;
justify-content:center;
align-items:center;
z-index:999;
}

.playlist-box{
background:#111;
padding:30px;
border-radius:12px;
width:400px;
text-align:center;
}

.playlist-select{
max-height:300px;
margin:20px 0;
display:flex;
flex-direction:column;
gap:12px;
}

.playlist-option{
display:flex;
align-items:center;
gap:15px;
background:#1a1a1a;
padding:12px;
border-radius:10px;
cursor:pointer;
transition:0.2s;
border:1px solid transparent;
}

.playlist-option:hover{
background:#222;
}

.playlist-option.selected{
border:1px solid #1DB954;
box-shadow:0 0 10px #1DB95466;
}

.playlist-option img{
width:50px;
height:50px;
border-radius:8px;
}

.modal-buttons{
display:flex;
justify-content:space-between;
margin-top:20px;
}

.modal-buttons button{
padding:8px 15px;
border:none;
border-radius:6px;
cursor:pointer;
background:#1DB954;
color:#000;
}

</style>