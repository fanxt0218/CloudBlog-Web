<template>
  <div class="login-page" :style="pageStyle">
    <SimpleLoginCard />
  </div>
</template>

<script setup lang="ts">
import SimpleLoginCard from '@/components/loginPage/SimpleLoginCard.vue'
import { onMounted, ref, computed } from 'vue';
import { getWebsiteComponentInfo } from '@/utils/websiteComponent';
import type { WebsiteComponentDefine } from '@/types';

const bgUrl = ref('');

// 默认背景
const DEFAULT_BG = '';

const pageStyle = computed(() => {
  if (!bgUrl.value) return {}; // 如果没有图片，就不加背景
  return {
    backgroundImage: `url(${bgUrl.value})`
  }
})

onMounted(async () => {
  document.title = 'CloudBlog-登录'
  try {
    const res = await getWebsiteComponentInfo('LOGIN', 'login_bg');
    if (res && res.length > 0) {
      const url = res[0].contentValue;
      bgUrl.value = url.startsWith('http') ? url : `/api${url}`;
    } else {
      bgUrl.value = DEFAULT_BG;
    }
  } catch (e) {
    console.error('Failed to load login background', e);
    bgUrl.value = DEFAULT_BG; // 出错也使用默认图
  }
})
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: flex-end;
  padding-right: 5%; /* 向右侧偏移 */
  align-items: center;
  min-height: calc(100vh - 60px); /* 减去 Header 的高度 */
  background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(loginPageBg[0].content);
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
