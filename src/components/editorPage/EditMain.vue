<template>
  <div class="editor-main" @wheel.stop>
    <div class="edit_content">
      <!-- ✅ 标题 -->
      <input
          v-model="title"
          class="title-input"
          placeholder="请输入文章标题（5~100字）"
      />

      <!-- ✅ 正文编辑器 -->
      <EditorContent :editor="editor" class="editor-content" />
    </div>
    <!-- ✅ 底部操作栏 -->
    <div class="manage-area">
      <ManageArea :editor="editor" :title="title" :selected-draft-id="props.selectedDraftId" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import ManageArea from '@/components/editorPage/ManageArea.vue'
import { createEditor } from '@/utils/editor/useEditor'

// 定义props
const props = defineProps<{
  selectedDraftId?: number | null,
  selectedDraftTitle?: string | null,
}>()

const emit = defineEmits(['update-headings', 'editor-ready', 'update:title'])

let title = ref('')

const editor = createEditor((editor) => {
  const headings: any[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      headings.push({
        id: `h-${pos}`,
        level: node.attrs.level,
        text: node.textContent,
      })
    }
  })
  emit('update-headings', headings)
})

// ✅ 把编辑器实例抛给父组件（工具栏控制它）
watch(
    () => editor.value,
    (val) => {
      if (val) emit('editor-ready', val)
    },
    { immediate: true }
)


// 监听草稿选择变化
watch([() => props.selectedDraftId, () => props.selectedDraftTitle], ([newDraftId, newTitle]) => {
  if (newDraftId && newTitle) {
    title.value = newTitle
    emit('update:title', newTitle)
  }
}, { immediate: true })

// 监听标题变化并同步给父组件
watch(title, (newTitle) => {
  emit('update:title', newTitle)
})

watch(
  () => editor.value,
  (val) => {
    if (val) {
      ;(window as any).__editor = val
      console.log('✅ editor 已挂载到 window.__editor')
    }
  },
  { immediate: true }
)

onMounted(() => {

})


onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.editor-main {
  min-height: 700px;
  width: 850px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  top: 70px;
  margin: 0 auto;
}

.edit_content {
  /* padding: 10px 0px; */
}

.editor-content {
  padding: 24px;
  background: #fff;
}

/* 标题 */
.title-input {
  width: 100%;
  height: 35px;
  font-size: 27px;
  font-weight: bold;
  color: #333333d5;
  border: none;
  outline: none;
  padding: 15px 20px;
  background: #fff;
  padding-top: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  z-index: 2;

  /* 标题输入框 placeholder 样式 */
  ::placeholder {
    color: #3333336c;
  }
}

/* 正文最关键样式 */
.editor-content {
  min-height: 500px;
  cursor: text;
  padding-bottom: 100px;
}

/* 编辑器内容区域样式 - 关键：保留空白字符 */
:deep(.ProseMirror) {
  min-height: 500px;
  outline: none;
  white-space: pre-wrap; /* 保留空白符和换行 */
  word-break: break-word;
  font-family: inherit;
}

/* 段落样式也应用相同规则 */
:deep(.ProseMirror p) {
  line-height: 1.8;
  font-size: 16px;
  white-space: pre-wrap; /* 保留空白符 */
  margin: 1.2em 0; /* 默认段落间距 */
}

/* 标题字号调优 */
:deep(.ProseMirror h1) {
  font-size: 24px;
  font-weight: 700;
  margin: 1.5em 0 0.8em;
  color: #222;
}

:deep(.ProseMirror h2) {
  font-size: 20px;
  font-weight: 700;
  margin: 1.4em 0 0.7em;
  color: #333;
}

:deep(.ProseMirror h3) {
  font-size: 18px;
  font-weight: 700;
  margin: 1.3em 0 0.6em;
  color: #444;
}

.manage-area {
  width: 100%;
  margin-top: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
}

/* 修复颜色和背景颜色共存的问题 */
:deep(.ProseMirror span[data-color]) {
  color: attr(data-color);
}

:deep(.ProseMirror span[data-text-color]) {
  color: attr(data-text-color);
}

:deep(.ProseMirror mark[data-color]),
:deep(.ProseMirror mark.highlight) {
  background-color: attr(data-color);
  padding: 0 2px;
  border-radius: 2px;
}

/* 更具体地处理颜色和高亮共存的样式 */
:deep(.ProseMirror span[data-color]) {
  color: attr(data-color);
}

:deep(.ProseMirror span[data-highlight]) {
  background-color: attr(data-highlight);
  padding: 0 2px;
  border-radius: 2px;
}

/* 当颜色和高亮同时存在时，确保两个属性都生效 */
:deep(.ProseMirror span[data-color][data-highlight]) {
  color: attr(data-color);
  background-color: attr(data-highlight);
  padding: 0 2px;
  border-radius: 2px;
}

/* 如果attr()函数不起作用，则使用更通用的类名方式 */
:deep(.ProseMirror span.text-color-red) { color: #ef4444; }
:deep(.ProseMirror span.text-color-orange) { color: #f97316; }
:deep(.ProseMirror span.text-color-yellow) { color: #facc15; }
:deep(.ProseMirror span.text-color-green) { color: #22c55e; }
:deep(.ProseMirror span.text-color-blue) { color: #0ea5e9; }
:deep(.ProseMirror span.text-color-indigo) { color: #6366f1; }
:deep(.ProseMirror span.text-color-purple) { color: #a855f7; }
:deep(.ProseMirror span.text-color-pink) { color: #f43f5e; }
:deep(.ProseMirror span.text-color-gray) { color: #475569; }

/* 背景色类名 */
:deep(.ProseMirror span.bg-yellow) { background-color: #fff7e6; }
:deep(.ProseMirror span.bg-orange) { background-color: #ffe7ba; }
:deep(.ProseMirror span.bg-red) { background-color: #ffccc7; }
:deep(.ProseMirror span.bg-pink) { background-color: #ffd6e7; }
:deep(.ProseMirror span.bg-blue) { background-color: #e6f7ff; }
:deep(.ProseMirror span.bg-teal) { background-color: #e6fffb; }
:deep(.ProseMirror span.bg-green) { background-color: #f6ffed; }
:deep(.ProseMirror span.bg-purple) { background-color: #f9f0ff; }

/* 黑色代码块主题 */
:deep(pre) {
  background: #1e1e1e !important;
  color: #d4d4d4 !important;
  padding: 14px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0; /* 增加代码块与前后内容的间距，便于点击 */
}

/* 美化代码块滚动条 */
:deep(pre::-webkit-scrollbar) {
  height: 8px;
  width: 8px;
  background: transparent;
}

:deep(pre::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

:deep(pre::-webkit-scrollbar-thumb:hover) {
  background: rgba(255, 255, 255, 0.25);
}

:deep(pre::-webkit-scrollbar-track) {
  background: transparent;
}

/* 代码高亮（highlight.js 的 token） */
:deep(.hljs-keyword) { color: #569cd6; }
:deep(.hljs-string) { color: #ce9178; }
:deep(.hljs-comment) { color: #6a9955; }
:deep(.hljs-number) { color: #b5cea8; }
:deep(.hljs-title) { color: #4ec9b0; }
:deep(.hljs-function) { color: #dcdcaa; }

/* 优化代码块的选择和交互体验 */
:deep(.ProseMirror pre) {
  position: relative;
  transition: box-shadow 0.2s;
}

:deep(.ProseMirror pre:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 为代码块添加视觉提示，帮助用户定位 */
:deep(.ProseMirror pre:before) {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 16px;
  background: transparent;
}

:deep(.ProseMirror pre:after) {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 16px;
  background: transparent;
}

/* 图片节点样式 */
:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}

/* 图片基础样式 */
.editor-content img {
  max-width: 100%;
  cursor: pointer;
}

/* 图片被选中时（ProseMirror 会加这个 class） */
.editor-content img.ProseMirror-selectednode {
  outline: 2px solid #409eff;
  border-radius: 4px;
}

/* 自定义链接样式 - 默认无下划线，悬浮时有下划线和颜色变化 */
:deep(.ProseMirror a) {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
}

:deep(.ProseMirror a:hover) {
  color: #409eff;
  text-decoration: underline;
}

/* 链接在激活状态时的样式 */
:deep(.ProseMirror a:active) {
  color: #1a7afe;
}

/* 链接在访问过之后的样式 */
:deep(.ProseMirror a:visited) {
  color: #7eb1f8;
}

:deep(.ProseMirror a:visited:hover) {
  color: #409eff;
}

.img-resizable {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.img-resizable img {
  width: 100%;
  display: block;
}

.resize-handle {
  position: absolute;
  top: 50%;
  right: -6px;
  width: 12px;
  height: 12px;
  background: #409eff;
  border-radius: 50%;
  cursor: ew-resize;
  transform: translateY(-50%);
  opacity: 0;
}

.img-resizable:hover .resize-handle {
  opacity: 1;
}

</style>

<style>
/* 全局样式确保编辑器中的滚动条美化生效 */
.ProseMirror pre::-webkit-scrollbar {
  height: 8px !important;
  width: 8px !important;
  background: transparent !important;
}

.ProseMirror pre::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px !important;
}

.ProseMirror pre::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.ProseMirror pre::-webkit-scrollbar-track {
  background: transparent !important;
}

/* Firefox 支持 */
.ProseMirror pre {
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent !important;
}
</style>
