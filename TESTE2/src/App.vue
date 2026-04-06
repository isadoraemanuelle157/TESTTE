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
  box-sizing: border-box;
}

html, body, #app {
  margin: 0;
  height: 100%;
}

/* LAYOUT PRINCIPAL */
.app {
  display: flex;
  min-height: 100vh;
  background: #fff; /* fundo global */
}

/* ÁREA DA DIREITA */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* CONTEÚDO */
.content {
  flex: 1;

  overflow-y: auto;
}
</style>