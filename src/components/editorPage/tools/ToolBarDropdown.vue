<template>
  <div class="dropdown" ref="dropdownRef">
    <button class="dropdown-btn" @click="toggle">
      {{ label }}
    </button>

    <div 
      v-if="open" 
      class="dropdown-menu"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{ label: string }>()
const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggle = () => {
  open.value = !open.value
}

const onClickOutside = (event: MouseEvent) => {
  if (!dropdownRef.value) return
  if (!dropdownRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-btn {
  height: 32px;
  background: #f5f5f7;
  border: none;
  padding: 0 10px;
  border-radius: 6px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 38px;
  left: 0;
  min-width: 130px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,.1);
  padding: 6px 0;
  z-index: 99999;
}

.dropdown-menu > * {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-menu > *:hover {
  background: #f5f5f7;
}
</style>
