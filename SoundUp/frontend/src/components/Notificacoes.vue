<template>

<div class="notification-icon">

  <i class="fa fa-bell"></i>

  <span v-if="count > 0" class="notification-badge">
    {{ count }}
  </span>

</div>

</template>

<script>
export default {
name: "Notificacoes",

props:{
count:{
type:Number,
default:0
}
}

}
</script>

<style scoped>

.notification-icon{
position:relative;
font-size:20px;
cursor:pointer;
color:#1DB954;
transition:.2s;
}

.notification-icon:hover{
transform:scale(1.1);
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

</style>