<template>
  <div class="toolbar-btn-wrapper">
    <button
      class="toolbar-btn"
      :class="{ active: active, disabled: disabled }"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <component :is="iconComponent" class="icon" />
    </button>
    <span v-if="tooltip" class="toolbar-tooltip">{{ tooltip }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Undo, Redo, Bold, Italic, Underline, List, ListOrdered, Code, Link, Image } from 'lucide-vue-next'

const props = defineProps<{
  icon: string
  active?: boolean
  disabled?: boolean
  tooltip?: string  // 添加tooltip属性
}>()

// 关键修复：定义点击事件
const emit = defineEmits(['click'])

// 创建图标映射对象
const iconMap = {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Link,
  Image
}

const iconComponent = computed(() => iconMap[props.icon as keyof typeof iconMap] || null)
</script>

<style scoped>
.toolbar-btn-wrapper {
  position: relative;
  display: inline-block;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f7;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: .15s;
}

.toolbar-btn:hover {
  background: #e5e7eb;
}

.toolbar-btn.active {
  background: #dbeafe;
  color: #2563eb;
}

.toolbar-btn.disabled {
  opacity: .4;
  cursor: not-allowed;
}

.icon {
  width: 18px;
  height: 18px;
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