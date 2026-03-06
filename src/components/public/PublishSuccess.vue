<template>
  <div class="success-page">
    <div class="card">
      <div class="icon-wrapper">
        <svg viewBox="0 0 1024 1024" class="check-icon" aria-hidden="true">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-55.1 640.5L257.4 505c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l154.2 154.2 264.6-264.6c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L456.9 704.5z" />
        </svg>
      </div>

      <h2 class="title">发布成功</h2>
      <p class="desc">文章正在审核中，感谢您为社区做出的贡献！</p>

      <div class="actions">
        <button class="btn primary" @click="goDetail">查看文章</button>
        <button class="btn" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="PublishSuccess">
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'

const route = useRoute()
const postId = route.params.postId
const userId = route.params.userId

const router = useRouter()

const goDetail = () => {
    // TODO: 跳转至文章预览页postId
  router.push(`/postView/${userId}/${postId}`)
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  console.log('Published postId:', postId)
  document.title = '发布成功 - CloudBlog'
})
</script>

<style scoped>
.success-page {
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fac5, #e4ecf593);
}

/* 让卡片整体视觉上靠上一点 */

.card {
  margin-top: -250px;
  width: 420px;
  padding: 40px 32px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  animation: popIn 0.6s ease-out;
}

.icon-wrapper {
  width: 96px;
  height: 96px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #e8f7ee;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.6s ease-out;
}

.check-icon {
  width: 56px;
  height: 56px;
  fill: #3bb273;
}

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 28px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  min-width: 120px;
  height: 40px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #f0f2f5;
  color: #333;
}

.btn:hover {
  background: #e6e8eb;
}

.btn.primary {
  background: #3bb273;
  color: #fff;
}

.btn.primary:hover {
  background: #34a468;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
