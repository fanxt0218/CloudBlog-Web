<template>
  <div class="dropdown" ref="refEl">
    <button class="dropdown-btn" @click="toggle">
      <component :is="Icons.AlignLeft" class="icon" />
    </button>

    <div v-if="open" class="dropdown-menu">
      <div class="item" @click="apply('left')">
        <component :is="Icons.AlignLeft" class="icon" /> 左对齐
      </div>
      <div class="item" @click="apply('center')">
        <component :is="Icons.AlignCenter" class="icon" /> 居中
      </div>
      <div class="item" @click="apply('right')">
        <component :is="Icons.AlignRight" class="icon" /> 右对齐
      </div>
      <div class="item" @click="apply('justify')">
        <component :is="Icons.AlignJustify" class="icon" /> 两端对齐
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AlignDropDown">
import * as Icons from 'lucide-vue-next'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['change'])
const open = ref(false)
const refEl = ref<HTMLElement | null>(null)

const toggle = () => {
  open.value = !open.value
}

const apply = (val: string) => {
  emit('change', val)
  open.value = false
}

const outside = (e: MouseEvent) => {
  if (refEl.value && !refEl.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', outside))
onBeforeUnmount(() => document.removeEventListener('click', outside))
</script>

<style scoped>
.dropdown {
  position: relative;
}
.dropdown-btn {
  width: 32px;
  height: 32px;
  background: #f5f5f7;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.dropdown-menu {
  position: absolute;
  top: 38px;
  left: 0;
  background: #fff;
  width: 150px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,.1);
}
.item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.item:hover {
  background: #f6f7f8;
}
.icon {
  width: 16px;
  height: 16px;
}
</style>
