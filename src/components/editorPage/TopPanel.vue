<template>
  <div class="toc" @wheel.stop>
    <div class="toc-title">目录</div>
    <div class="toc-content">
      <div
        v-for="item in headings"
        :key="item.id"
        class="toc-item"
        :style="{ paddingLeft: (item.level - 1) * 12 + 'px' }"
        @click="scrollTo(item.id)"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="TopPanel">
defineProps<{ headings: any[] }>()

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.toc {
  position: fixed;
  top: 130px; 
  left: 30px;
  width: 300px;
  max-height: calc(100vh - 160px); /* 限制最大高度 */
  min-height: 300px;
  z-index: 99; /* 极高层级，确保不被任何东西遮挡 */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
}

.toc-title {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px 8px 0 0;
}

.toc-content {
  flex: 1;
  overflow-y: auto !important; /* 强制显示滚动逻辑 */
  overflow-x: hidden;
  padding: 10px 10px; /* 垂直内边距 */
  min-height: 0;
}

/* 装饰性滚动条 */
.toc-content::-webkit-scrollbar {
  width: 6px;
}

.toc-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.toc-content::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.toc-item {
  cursor: pointer;
  font-size: 13px;
  line-height: 1.2;
  color: #555;
  padding: 10px 20px; /* 增加点击区域 */
  transition: all 0.2s;
  word-break: break-all;
}

.toc-item:hover {
  color: #409eff;
  background: #f5f7fa;
}
</style>

