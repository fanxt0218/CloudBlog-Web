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
      <ManageAreaPost 
      :editor="editor" 
      :title="title" 
      :selected-draft-id="props.selectedDraftId" 
      :post-id="props.postId" />
    </div>
  </div>
</template>
<script setup lang="ts" name="EditMainPost">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import ManageAreaPost from '@/components/editorPage/EditPost/ManageAreaPost.vue'
import { createEditor } from '@/utils/editor/useEditor'
import { getPostViewPage } from '@/api/index/viewPage';
import type { PostView } from '@/types/index';
import { ElMessage } from 'element-plus'
import router from '@/router';

// 定义props
const props = defineProps<{
  selectedDraftId?: number | null,
  selectedDraftTitle?: string | null,
  postId?: number | null,
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

const refreshPostDetail = async (postId: number) => {
  try {
    const param = {
        postId: postId,
    }
    const res = await getPostViewPage(param)
    if (res.data.authorId !== Number(localStorage.getItem('userId'))) {
      ElMessage.error('您没有权限编辑此文章')
      setTimeout(() => {
        router.back()
      }, 500);
    }
    title.value = res.data?.title || ''
    emit('update:title', title.value)
    editor.value?.commands.setContent(res.data?.content || '')
    document.title = title.value + ' - 编辑文章'
    console.log('文章详情刷新成功：', res.data)
    console.log('回显数据，标题，正文：', title.value, editor.value?.state.doc.textContent)
  } catch (e) {
    console.log('文章详情刷新失败')
  }
}

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

watch(() => props.postId, (newPostId) => {
  if (newPostId) {
    console.log('EditMainPost组件选择文章：', newPostId)
    // 调用接口获取文章详情
    refreshPostDetail(newPostId)
  }
}, { immediate: true })

onMounted(() => {
    console.log('EditMainPost组件选择文章：', props.postId)
    refreshPostDetail(props.postId as number)
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
  /* margin-bottom: 20px; */
  /* position: sticky; */
  /* top: 56px; */
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

/* 其他现有样式保持不变 */
:deep(.ProseMirror) {
  min-height: 500px;
  outline: none;
  white-space: pre-wrap; /* 保留空白符和换行 */
  word-break: break-word;
}

:deep(.ProseMirror p) {
  line-height: 1.8;
  font-size: 15px;
  white-space: pre-wrap; /* 保留空白符 */
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
  border: 1px solid #333;
  margin: 12px 0; /* 增加代码块与前后内容的间距，便于点击 */
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
  color: inherit;
  text-decoration: none;
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