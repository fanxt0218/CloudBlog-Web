<template>
  <div class="login-page">
    <SimpleLoginCard />
  </div>
</template>

<script setup lang="ts">
import SimpleLoginCard from '@/components/loginPage/SimpleLoginCard.vue'
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'CloudBlog-登录'
})
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: flex-end;
  padding-right: 5%; /* 向右侧偏移 */
  align-items: center;
  min-height: calc(100vh - 60px); /* 减去 Header 的高度 */
  background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.5s ease;
}

@media (max-width: 1024px) {
  .login-page {
    justify-content: center;
    padding-right: 0;
  }
}
</style>
