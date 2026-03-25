<template>
<section>

  <h2><i class="fa fa-heart"></i> Suas Curtidas</h2>

  <div class="grid">
    <div
      v-for="(music,index) in likedSongs"
      :key="index"
      class="card"
      @click="playLiked(index)"
    >
      <img :src="music.cover" />
      <MusicCard
  v-for="music in likedMusics"
  :key="music.id"
  :music="music"
/>
    </div>
  </div>

</section>
</template>

<script>
export default {

props:[
"likedSongs"
],

methods:{

playLiked(index){
this.$emit("playLiked",index)
}

}

}
</script>

<style scoped>

.grid{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
gap:20px;
margin-top:30px;
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

</style>