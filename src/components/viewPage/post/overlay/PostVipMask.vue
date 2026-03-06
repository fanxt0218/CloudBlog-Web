<!-- components/viewPage/post/PostVipMask.vue -->
<template>
<div class="post-mask" @click="openVip">
  <div class="mask-card vip">
    <img src="/assests/icon/lock.png" alt="vip-icon" class="lock-icon" />
    <span class="mask-text">开通 VIP 即可阅读全文</span>
  </div>
</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const openVip = () => {
  window.open('/vipCenter', '_blank');
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.post-mask {
  position: absolute;
  inset: 0;
  z-index: 10;

  background: linear-gradient(
    rgba(255, 255, 255, 0.85),
    rgba(255, 255, 255, 0.95)
  );
  backdrop-filter: blur(4px);

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 🔥 关键：让内容真正“中轴对齐” */
.mask-card {
  display: flex;
  align-items: center;       /* 垂直居中 */
  justify-content: center;   /* 水平居中 */
  gap: 10px;

  padding: 12px 18px;
  font-size: 18px;
  line-height: 1;

  border: 1px solid #fc5531;
  color: #fc5531;
  border-radius: 999px; /* 胶囊感更强 */

  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

.lock-icon {
  width: 20px;
  display: block; /* 防止 img 基线对齐问题 */
}

.mask-text {
  white-space: nowrap;
}

</style>
