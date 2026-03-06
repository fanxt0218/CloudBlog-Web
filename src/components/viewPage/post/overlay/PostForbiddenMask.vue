<!-- components/viewPage/post/PostForbiddenMask.vue -->
<template>
  <div class="post-mask">
    <div class="mask-card">
      <div class="icon">🚫</div>
      <div class="title">该文章暂无访问权限</div>
      <div class="desc">
        可能是作者设置了可见范围，或文章尚未公开
      </div>
      <el-button type="primary" @click="goBack">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.post-mask {
  position: absolute;
  inset: 0;
  z-index: 10;

  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(4px);

  display: flex;
  align-items: center;
  justify-content: center;
}

.mask-card {
  text-align: center;
  padding: 32px 36px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}
</style>
