<template>

<div class="app">

  <Sidebar />

  <div class="main">
    <Navbar/>

    <div class="content">
      <router-view />
    </div>
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

/* layout geral */
.app {
  display: flex;
  height: 100vh; /* melhor que min-height */
}

/* lado direito */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* conteúdo que rola */
.content {
  flex: 1;
  overflow-y: auto;
}
</style>