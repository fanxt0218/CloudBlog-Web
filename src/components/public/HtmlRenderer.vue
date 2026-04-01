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
  
  // 增强代码块功能：复制 + 展开/折叠
  enhanceCodeBlocks()
}

/**
 * 增强代码块：添加复制按钮和展开/折叠功能
 */
const enhanceCodeBlocks = () => {
  if (!contentRef.value) return

  const pres = contentRef.value.querySelectorAll('pre')
  pres.forEach((pre) => {
    // 防止重复初始化
    if (pre.parentElement?.classList.contains('code-block-wrapper')) return

    // 1. 创建包装容器
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'
    pre.parentNode?.insertBefore(wrapper, pre)
    
    // 2. 创建头部（包含语言标识和复制按钮）
    const header = document.createElement('div')
    header.className = 'code-block-header'
    
    // 尝试获取语言 (Tiptap code-block-lowlight 产生的类名为 language-xxxx)
    const code = pre.querySelector('code')
    let lang = 'code'
    if (code) {
      const langClass = Array.from(code.classList).find(c => c.startsWith('language-'))
      if (langClass) lang = langClass.replace('language-', '')
    }
    
    const langSpan = document.createElement('span')
    langSpan.className = 'code-lang'
    langSpan.innerText = lang
    
    const copyBtn = document.createElement('button')
    copyBtn.className = 'copy-code-btn'
    copyBtn.innerText = '复制'
    copyBtn.onclick = (e) => {
      e.preventDefault()
      const codeText = pre.querySelector('code')?.innerText || ''
      navigator.clipboard.writeText(codeText).then(() => {
        copyBtn.innerText = '已复制'
        setTimeout(() => { copyBtn.innerText = '复制' }, 2000)
      })
    }
    
    header.appendChild(langSpan)
    header.appendChild(copyBtn)
    wrapper.appendChild(header)

    // 3. 将 pre 放入容器
    wrapper.appendChild(pre)
    pre.style.margin = '0'

    // 4. 展开/折叠逻辑
    const maxHeight = 400
    // 使用 setTimeout 确保 DOM 渲染完成
    setTimeout(() => {
      if (pre.scrollHeight > maxHeight + 50) {
        wrapper.classList.add('collapsed')
        
        const footer = document.createElement('div')
        footer.className = 'code-block-footer'
        footer.innerHTML = '<span>展开</span>'
        
        const toggleExpand = () => {
          if (wrapper.classList.contains('collapsed')) {
            wrapper.classList.remove('collapsed')
            footer.innerHTML = '<span>收起</span>'
            footer.classList.add('is-expanded')
          } else {
            wrapper.classList.add('collapsed')
            footer.innerHTML = '<span>展开</span>'
            footer.classList.remove('is-expanded')
            // 如果收起后代码块不在视野内，滚动回顶部
            const rect = wrapper.getBoundingClientRect()
            if (rect.top < 0) {
              wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
          }
        }
        
        footer.onclick = toggleExpand
        wrapper.appendChild(footer)
      }
    }, 0)
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
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

/* ===== 基础排版（同之前） ===== */

/* 关键修改：确保p标签保留空白字符 */
.html-content :deep(p) {
  margin: 12px 0;
  white-space: pre-wrap; /* 保留空白符和换行 */
}

.html-content :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  margin: 1.5em 0 0.8em;
  color: #222;
}

.html-content :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  margin: 1.4em 0 0.7em;
  color: #333;
}

.html-content :deep(h3) {
  font-size: 18px;
  font-weight: 700;
  margin: 1.3em 0 0.6em;
  color: #444;
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
  color: #409eff;
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

/* ===== 代码块增强样式 ===== */
.html-content :deep(.code-block-wrapper) {
  position: relative;
  margin: 20px 0;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.html-content :deep(.code-block-wrapper pre) {
  margin: 0;
  background: transparent !important;
  border: none;
  padding: 16px;
  overflow-x: auto;
  overflow-y: visible; /* 允许展开时完全可见 */
}

.html-content :deep(.code-block-wrapper.collapsed pre) {
  max-height: 420px; /* 稍微增加一点以包含 padding */
  padding-bottom: 30px; /* 为脚部的“展开”按钮留出空间，防止遮挡滚动条 */
  overflow-y: hidden;
}

.html-content :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
}

.html-content :deep(.code-lang) {
  color: #999;
  font-size: 12px;
  text-transform: uppercase;
}

.html-content :deep(.copy-code-btn) {
  background: transparent;
  border: none;
  color: #999;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.html-content :deep(.copy-code-btn:hover) {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.html-content :deep(.code-block-footer) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  background: #1e1e1e;
  cursor: pointer;
  color: #f4f4f4;
  font-size: 14px;
  font-weight: 500;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
  margin-top: -15px;
}

.html-content :deep(.code-block-footer:hover) {
  background: rgba(255, 255, 255, 0.02);
}

.html-content :deep(.code-block-wrapper.collapsed .code-block-footer) {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to top, #1e1e1e 70%, transparent);
  border-top: none;
}

.html-content :deep(.code-block-footer span) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.html-content :deep(.code-block-footer span::after) {
  content: "▼";
  font-size: 10px;
  transition: transform 0.3s;
}

.html-content :deep(.code-block-footer.is-expanded span::after) {
  content: "▲";
}

/* ===== 滚动条美化 ===== */
.html-content :deep(pre::-webkit-scrollbar) {
  height: 8px !important;
  width: 8px !important;
}

.html-content :deep(pre::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.html-content :deep(pre::-webkit-scrollbar-thumb:hover) {
  background: rgba(255, 255, 255, 0.3);
}

.html-content :deep(pre::-webkit-scrollbar-track) {
  background: transparent;
}
</style>

<style>
/* 全局样式确保滚动条美化生效 */
.html-content pre::-webkit-scrollbar {
  height: 8px !important;
  width: 8px !important;
  background: transparent !important;
}

.html-content pre::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px !important;
}

.html-content pre::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.html-content pre::-webkit-scrollbar-track {
  background: transparent !important;
}

/* Firefox 支持 */
.html-content pre {
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent !important;
}
</style>
