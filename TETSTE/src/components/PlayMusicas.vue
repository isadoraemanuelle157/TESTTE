<template>

<div class="player" v-if="currentMusic">

  <div class="player-left">

    <img :src="currentMusic?.cover" class="player-cover"/>

    <div>
      <h4>{{ currentMusic.title }}</h4>
      <p>{{ currentMusic.artist }}</p>
    </div>

    <button @click="toggleLike" class="like">
      <i :class="liked ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
    </button>

  </div>

  <div class="player-center">

    <div class="controls">

      <button @click="$emit('prev')">
        <i class="fa fa-backward"></i>
      </button>

      <button class="play" @click="togglePlay">
        <i :class="isPlaying ? 'fa fa-pause' : 'fa fa-play'"></i>
      </button>

      <button @click="$emit('next')">
        <i class="fa fa-forward"></i>
      </button>

      <button @click="toggleRepeat">
        <i :class="repeat ? 'fa fa-repeat' : 'fa fa-arrow-right'"></i>
      </button>

    </div>

    <div class="progress">

      <span>{{ formatTime(currentTime) }}</span>

      <input
        type="range"
        min="0"
        :max="duration"
        v-model="currentTime"
        @input="seekMusic"
      />

      <span>{{ formatTime(duration) }}</span>

    </div>

  </div>

  <div class="player-right">

    <i class="fa fa-volume-up"></i>

    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      v-model="volume"
      @input="updateVolume"
    />

  </div>

  <audio
    ref="audio"
    :src="currentMusic?.src"
    @timeupdate="updateProgress"
    @loadedmetadata="setDuration"
    @ended="handleEnded"
  ></audio>

</div>

</template>

<script>
export default {

props:[
"currentMusic",
"isPlaying",
"liked"
],

data(){
return{
volume:0.5,
currentTime:0,
duration:0,
repeat:false
}
},

mounted(){
this.$refs.audio.volume = this.volume
},

methods:{

togglePlay(){
this.$emit("togglePlay", this.$refs.audio)
},

toggleLike(){
this.$emit("toggleLike")
},

updateVolume(){
this.$refs.audio.volume = this.volume
},

updateProgress(){
this.currentTime = this.$refs.audio.currentTime
},

setDuration(){
this.duration = this.$refs.audio.duration
},

seekMusic(){
this.$refs.audio.currentTime = this.currentTime
},

toggleRepeat(){
this.repeat = !this.repeat
},

handleEnded(){
if(this.repeat){
this.$refs.audio.play()
}else{
this.$emit("next")
}
},

formatTime(t){
if(!t) return "0:00"
const m = Math.floor(t/60)
const s = Math.floor(t%60)
return `${m}:${s<10?'0':''}${s}`
}

}

}
</script>

<style scoped>

.player{
height:100px;
background:#0a0a0a;
border-top:1px solid #111;
display:flex;
align-items:center;
justify-content:space-between;
padding:0 30px;
}

.player-left,
.player-right{
display:flex;
align-items:center;
gap:15px;
width:30%;
}

.player-center{
width:40%;
text-align:center;
}

.player-cover{
width:60px;
height:60px;
border-radius:8px;
}

.controls button{
background:none;
border:none;
color:white;
margin:0 10px;
font-size:18px;
cursor:pointer;
}

.play{
font-size:24px;
}

.progress{
display:flex;
align-items:center;
gap:10px;
}

.progress input{
flex:1;
}

.like{
background:none;
border:none;
font-size:18px;
cursor:pointer;
}

</style>