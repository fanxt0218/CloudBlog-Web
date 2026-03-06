<template>
  <div class="html-renderer">
    <div
      ref="contentRef"
      class="html-content"
      v-html="bodyHtml"
      @click="handleImageClick"
    />

    <!-- 图片预览 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="previewVisible"
          class="image-preview-mask"
          @click.self="closePreview"
        >
          <img
            class="preview-image"
            :src="previewSrc"
            alt="preview"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts" name="HtmlRenderer">
import { computed, onMounted, watch, ref, nextTick, onBeforeUnmount } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'

const props = defineProps<{
  content: string
}>()

const contentRef = ref<HTMLElement | null>(null)

/* ===== 图片预览状态 ===== */
const previewVisible = ref(false)
const previewSrc = ref('')

/**
 * 提取 body 内容
 */
const bodyHtml = computed(() => {
  if (!props.content) return ''

  if (!props.content.includes('<html')) {
    return props.content
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(props.content, 'text/html')
    return doc.body.innerHTML || ''
  } catch {
    return props.content
  }
})

/**
 * 代码高亮
 */
const highlight = async () => {
  await nextTick()
  if (!contentRef.value) return

  contentRef.value.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block as HTMLElement)
  })
}

/**
 * 图片点击（事件委托）
 */
const handleImageClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    previewSrc.value = (target as HTMLImageElement).src
    previewVisible.value = true
    document.body.style.overflow = 'hidden'
  }
}

/**
 * 关闭预览
 */
const closePreview = () => {
  previewVisible.value = false
  previewSrc.value = ''
  document.body.style.overflow = ''
}

/**
 * ESC 关闭
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && previewVisible.value) {
    closePreview()
  }
}

onMounted(() => {
  highlight()
  window.addEventListener('keydown', handleKeydown)
})

watch(() => props.content, highlight)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.html-renderer {
  width: 100%;
  line-height: 1.75;
  color: #333;
  font-size: 15px;
}

/* ===== 基础排版（同之前） ===== */

/* 关键修改：确保p标签保留空白字符 */
.html-content :deep(p) {
  margin: 12px 0;
  white-space: pre-wrap; /* 保留空白符和换行 */
}

.html-content :deep(h1),
.html-content :deep(h2),
.html-content :deep(h3) {
  margin: 24px 0 16px;
  font-weight: 600;
  white-space: pre-wrap; /* 保留空白符 */
}

.html-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px auto;
  border-radius: 6px;
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

/* 链接样式 */
.html-content :deep(a) {
  color: inherit;
  text-decoration: none;
}

.html-content :deep(a:hover) {
  color: #409eff;
  text-decoration: underline;
}

.html-content :deep(a:active) {
  color: #1a7afe;
}

.html-content :deep(a:visited) {
  color: #7eb1f8;
}

.html-content :deep(a:visited:hover) {
  color: #409eff;
}

/* .html-content :deep(img:hover) {
  transform: scale(1.02);
} */

/* ===== 图片预览层 ===== */

.image-preview-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

/* ===== 动画 ===== */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>