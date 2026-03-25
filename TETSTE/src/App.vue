<template>

<div class="app">

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

export default {
components:{
Sidebar
}
}
</script>

<style>

.app{
  display:flex;
  height:100vh;
  background:#000;
  color:white;
}

.content{
  flex:1;
  margin-left:260px;
  padding:30px;
  min-height:100vh;
  overflow-y:auto;
}

</style>