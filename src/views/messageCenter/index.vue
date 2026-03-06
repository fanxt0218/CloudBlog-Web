<template>
    <div class="card">
        <MessageCenter/>
    </div>
</template>
<script lang="ts" setup name="MessageCenterIndex">
import MessageCenter from '@/components/messageCenter/MessageCenter.vue' 
</script>
<style scoped>
.card {
  width: 60%;
  max-width: 1200px;
  min-width: 320px;
  min-height: 800px;
  margin: 2rem auto;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid #e0e0e0;
  border-radius: 8px; /* 圆角增强视觉效果 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); /* 轻微阴影提升层次感 */
  background-color: #fff; /* 白色背景突出内容 */
  overflow: hidden; /* 避免内部元素溢出圆角 */
}
</style>