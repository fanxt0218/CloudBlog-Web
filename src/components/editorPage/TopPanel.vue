<template>
  <div class="toc">
    <div class="toc-title">目录</div>
    <div
      v-for="item in headings"
      :key="item.id"
      class="toc-item"
      :style="{ paddingLeft: item.level * 12 + 'px' }"
      @click="scrollTo(item.id)"
    >
      {{ item.text }}
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
  bottom: 20px;
  z-index: 99;
  height: 450px;
  padding: 12px 20px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 12px 28px rgba(112, 112, 112, 0.12);
  width: 17%;
  left: 70px;
}
.toc-title {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.toc-item {
  cursor: pointer;
  font-size: 14px;
  line-height: 28px;
  color: #555;
  word-wrap: break-word;
  word-break: break-all;
  padding-right: 10px;
  overflow: hidden;
}
</style>