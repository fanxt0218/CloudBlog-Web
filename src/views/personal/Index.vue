<template>
  <div class="card">
    <div class="main-content">
      <!-- 左侧导航区域 -->
      <div class="left-section">
        <Navigation />
      </div>
      <!-- 右侧内容区域 -->
      <div class="right-section">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="Personal">
import Navigation from '@/components/personal/Navigation.vue';
import Profile from '@/components/personal/Profile.vue'
import {RouterView} from 'vue-router'
</script>

<style scoped>
.card {
  width: 60%;
  max-width: 1200px;
  min-width: 320px;
  margin: 2rem auto;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid #e0e0e0;
  border-radius: 8px; /* 圆角增强视觉效果 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); /* 轻微阴影提升层次感 */
  background-color: #fff; /* 白色背景突出内容 */
  overflow: hidden; /* 避免内部元素溢出圆角 */
}

.main-content {
  display: flex; /* 使用Flex布局实现左右分离 */
  min-height: 500px; /* 确保容器有基础高度，避免内容过短时布局变形 */
}

/* 左侧导航区域 - 固定宽度 */
.left-section {
  width: 200px; /* 与导航组件宽度匹配 */
  flex-shrink: 0; /* 禁止收缩，保持固定宽度 */
  border-right: 1px solid #e0e0e0; /* 右侧边框分隔 */
}

/* 右侧内容区域 - 自适应剩余宽度 */
.right-section {
  flex: 1; /* 占据剩余所有空间 */
  box-sizing: border-box;
}

/* 响应式适配 - 小屏幕下堆叠显示 */
@media (max-width: 768px) {
  .card {
    width: 90%; /* 小屏幕占比更大 */
  }
  
  .main-content {
    flex-direction: column; /* 改为垂直布局 */
  }
  
  .left-section {
    width: 100%; /* 占满宽度 */
    border-right: none;
    border-bottom: 1px solid #e0e0e0; /* 底部边框分隔 */
  }
  
  .right-section {
    padding: 1rem; /* 减少内边距 */
  }
}
</style>