<template>

<div class="app">

  <div>
    <Navbar/>
  </div>

  <!-- SIDEBAR -->
  <Sidebar />

  <!-- CONTEÚDO DAS PÁGINAS -->
  <div class="content">
    <router-view />
  </div>

</div>

</template>

<script>
import Sidebar from "@/components/Sidebar.vue"
import Navbar from "@/components/Navbar.vue"

export default {
components:{
Sidebar,
Navbar
}
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
.app{
  display:flex;
  height:100vh;
  background:#000;
  color:white;
}

.content{
  flex:1;
  padding:30px;
  min-height:100vh;
  overflow-y:auto;
}

</style>