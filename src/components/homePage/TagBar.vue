<template>
  <div
    class="tag-bar"
    ref="tagBarRef"
    @wheel.prevent="handleWheel"
  >
    <div
      v-for="tag in tags"
      :key="tag.id"
      class="tag-item"
      :class="{ 'tag-item-active': selectedTagId === tag.id }"
      @click="handleTagClick(tag)"
    >
      {{ tag.tagName }}
    </div>
  </div>
</template>

<script setup lang="ts" name="TagBar">
import { ref, onMounted } from 'vue'
import { getInterestTags } from '@/api/index/indexPage'
import type { Tags } from '@/types/index'
import { ta } from 'element-plus/es/locales.mjs'

const tags = ref<Tags>([])
const tagBarRef = ref<HTMLDivElement | null>(null)

let selectedTagId = ref<number>(0);

const emit = defineEmits<{
  'tag-change': [tagId: number]
}>()

let defaultTag = {
    id: 0,
    tagName: "全部",
    classId: 0,
    description: "全部",
    createTime: "",
    updateTime: ""
}

onMounted(async () => {
  const response = await getInterestTags(null)

  tags.value.push(defaultTag)
  tags.value.push(...response.data)

  
  // 初始化时触发一次事件，将默认选中的tag id传递给父组件
  emit('tag-change', selectedTagId.value)
})

/** ✅ 鼠标滚轮 → 横向滚动 */
function handleWheel(e: WheelEvent) {
  if (!tagBarRef.value) return

  tagBarRef.value.scrollLeft += e.deltaY
}

function handleTagClick(tag: any) {
  selectedTagId.value = tag.id
  emit('tag-change', tag.id)
}
</script>

<style scoped>
.tag-bar {
  display: flex;
  align-items: center;
  gap: 12px;

  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  padding: 10px 8px;

  scroll-behavior: smooth;

  /* ✅ 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  background-color: #fff;
  height: 50px;
}

.tag-bar::-webkit-scrollbar {
  display: none; /* Chrome / Edge / Safari */
}

.tag-item {
  flex-shrink: 0;
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -20px;
}

.tag-item:hover {
  background: #eaeaea;
}

.tag-item-active {
  background: #3a3a3a !important;
  color: #fff !important;
}
</style>
