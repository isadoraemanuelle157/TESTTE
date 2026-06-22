<template>
  <div class="loading-screen">

    <div class="loading-container">

      <!-- LOGO -->
      <div class="logo">
        <i class="fa fa-music"></i>
        <h1>MusicApp</h1>
      </div>

      <!-- ANIMAÇÃO -->
      <div class="loader"></div>

      <!-- TEXTO -->
      <p>Carregando sua experiência musical...</p>

    </div>

  </div>
</template>

<script>
export default {
  name: "LoadingScreen",

  mounted(){

    // simulação de carregamento
    setTimeout(()=>{
      this.$router.push("/home")
    },3000)

  }
}
</script>

<style scoped>

.loading-screen{
  height:100vh;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(180deg,#0f0f0f,#151515);
  color:white;
  font-family:Segoe UI;
}



/* CONTAINER */

.loading-container{
  text-align:center;
  animation:fadeIn 1s ease;
}



/* LOGO */

.logo{
  margin-bottom:40px;
}

.logo i{
  font-size:60px;
  color:#1db954;
}

.logo h1{
  font-size:32px;
  margin-top:10px;
}



/* LOADER */

.loader{
  width:200px;
  height:6px;
  background:#333;
  border-radius:10px;
  overflow:hidden;
  margin:auto;
  position:relative;
}

.loader::before{
  content:"";
  position:absolute;
  left:-50%;
  width:50%;
  height:100%;
  background:#1db954;
  animation:loading 1.5s infinite;
}



/* TEXTO */

p{
  margin-top:20px;
  color:#aaa;
}



/* ANIMAÇÕES */

@keyframes loading{
  0%{
    left:-50%;
  }
  100%{
    left:100%;
  }
}

@keyframes fadeIn{
  from{
    opacity:0;
    transform:translateY(20px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}

</style>