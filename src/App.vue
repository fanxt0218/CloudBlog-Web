<template>
    <div class="sticky-header" v-if="route.path !== '/ai'">
      <Head/>
    </div>
    <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import Head from '@/components/Head.vue';
import { wsService } from './service/SocketManager';
import { useRoute } from 'vue-router';
import { useUserInfoStore } from '@/stores/userInfo';
import { checkLoginStatus } from './api/index/indexPage';

const route = useRoute()
const userInfoStore = useUserInfoStore()

onMounted(() => {
  userInfoStore.init()
  // 按照初始化结果尝试建立 WebSocket 连接
  if (userInfoStore.isLoggedIn) {
    console.log('尝试建立webSocket连接', userInfoStore.userId);
    wsService.connect(userInfoStore.userId);
  }
  // checkLoginStatus().then((res: any) => {
  //   if (!res.data) {
  //     userInfoStore.logout();
  //   }
  // })

  // 监听登录状态变化，自动建立/断开 WebSocket 连接
  watch(() => userInfoStore.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
      console.log('登录成功，建立 WebSocket 连接');
      wsService.connect(userInfoStore.userId);
    } else {
      console.log('登出成功，断开 WebSocket 连接');
      wsService.disconnect();
    }
  })
})
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
}
</style>
