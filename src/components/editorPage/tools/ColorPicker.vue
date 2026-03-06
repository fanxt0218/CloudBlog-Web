<template>
  <div class="color-picker" ref="pickerRef">
    <!-- 触发按钮 -->
    <div class="toolbar-btn-wrapper">
      <button class="color-btn" :style="currentColor ? { color: currentColor } : {}" @click="toggle">
        <component :is="iconComponent" class="icon" :style="currentColor ? { color: currentColor } : {}"/>
      </button>
      <span class="toolbar-tooltip">{{ tooltip || '选择颜色' }}</span>
    </div>

    <!-- 展开面板 -->
    <div v-if="open" class="color-panel">
      <!-- 取消颜色选项 -->
      <div
        class="color-item"
        :style="{ 
          background: 'transparent',
          border: '1px solid #ccc',
          position: 'relative'
        }"
        @click="applyColor('transparent')"
      >
        <div class="color-clear" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 2px;
          background: #666;
        "></div>
      </div>
      <div
        v-for="c in colors"
        :key="c"
        class="color-item"
        :style="{ background: c }"
        @click="applyColor(c)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as Icons from 'lucide-vue-next'

const props = defineProps<{
  icon: string
  colors: string[]
  tooltip?: string
  currentColor?: string
}>()

const open = ref(false)
const pickerRef = ref<HTMLElement | null>(null)

const iconComponent = computed(() => Icons[props.icon])

const toggle = () => (open.value = !open.value)

const applyColor = (color: string) => {
  open.value = false
  emit('change', color)
}

const emit = defineEmits(['change'])

const clickOutside = (e: MouseEvent) => {
  if (!pickerRef.value) return
  if (!pickerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', clickOutside))
onBeforeUnmount(() => document.removeEventListener('click', clickOutside))
</script>

<style scoped>
.color-picker {
  position: relative;
}
.color-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f7;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.color-panel {
  position: absolute;
  top: 38px;
  left: 0;
  width: 170px; /* 调整宽度以适应7个颜色块 */
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,.15);
  display: grid;
  grid-template-columns: repeat(7, 18px); /* 修改为每行7个颜色 */
  gap: 6px;
}
.color-item {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ccc;
}
/* 悬浮提示样式 */
.toolbar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  margin-bottom: 8px;
  pointer-events: none;
  z-index: 1000;
}

.toolbar-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

.toolbar-btn-wrapper:hover .toolbar-tooltip {
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 99999 !important; /* 确保在最上层 */
}
</style>