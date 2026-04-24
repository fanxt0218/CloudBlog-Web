<template>
  <div class="editor-root">
    <!-- ✅ 工具栏 -->
    <div class="tool-bar">
        <EditorToolbar v-if="editor"
                       :editor="editor"
                       :selected-draft-id="selectedDraftId"
                       @selectDraft="selectDraft"
        />
    </div>
    <!-- ✅ 三栏主体 -->
    <div class="editor-body">
      <TocPanel :headings="headings" />
      <EditorMain
        @update-headings="headings = $event"
        @editor-ready="editor = $event"
        @update:title="title = $event"
        :selected-draft-id="selectedDraftId"
        :selected-draft-title="selectedDraftTitle"
      />
      <AiPanel 
        :messages="assistantMessages" 
        :loading="isAssistantLoading" 
        @createAssist="aiCreateAssist"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EditorToolbar from '@/components/editorPage/tools/EditorToolBar.vue'
import EditorMain from '@/components/editorPage/EditMain.vue'
import TocPanel from '@/components/editorPage/TopPanel.vue'
import AiPanel from '@/components/editorPage/AiAssistant.vue'
import type { Editor } from '@tiptap/vue-3'
import { createAssist, createAssistStream } from '@/api/ai'
import { generateUUID } from '@/utils/uuid'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const headings = ref([])
const editor = ref(null)
const title = ref('')

const assistantMessages = ref<Message[]>([])
const isAssistantLoading = ref(false)
const tempConversationId = ref(generateUUID())

const selectedDraftId = ref<number | null>(null)
const selectedDraftTitle = ref<string | null>(null)

const emit = defineEmits(['selectDraft'])

const selectDraft = (singleDraftId: number, singleTitle: string) => {
  console.log('选择草稿：', singleDraftId, singleTitle)
  selectedDraftId.value = singleDraftId
  selectedDraftTitle.value = singleTitle
}

const aiCreateAssist = async (params: {
  message: string,
  type: string | null
}) => {
  console.log('createAssist', params)
  
  // 1. 添加用户消息
  assistantMessages.value.push({
    role: 'user',
    content: params.message
  })
  
  isAssistantLoading.value = true
  
  // 提取正文 HTML
  const content = (editor.value as any)?.getHTML() || ''
  
  try {
    const stream = await createAssistStream({
      message: params.message,
      title: title.value,
      content: content,
      type: params.type,
      currentConversation: tempConversationId.value
    })

    if (!stream) throw new Error('No stream returned')

    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let isFirstChunk = true

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      if (!chunk) continue

      if (isFirstChunk) {
        // 收到第一个数据块，停止加载状态并添加 AI 消息
        isAssistantLoading.value = false
        assistantMessages.value.push({
          role: 'assistant',
          content: chunk
        })
        isFirstChunk = false
      } else {
        // 后续数据块追加到最后一条消息
        const lastMsg = assistantMessages.value[assistantMessages.value.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content += chunk
        }
      }
    }
  } catch (err) {
    console.error('AI 辅助请求失败:', err)
    isAssistantLoading.value = false
    assistantMessages.value.push({
      role: 'assistant',
      content: '很抱歉，请求出错了。请稍后再试。'
    })
  }
}

onMounted(() => {
  console.log('EditorPage 挂载完成')
  document.title = '写文章 - CloudBlog创作'
})
</script>


<style scoped>
.editor-root {
  /* height: 100vh; */
  /* display: flex; */
  flex-direction: column;
  /* overflow: hidden;  */
  /* background-color: #cecfcf; */
}

/* ✅ 工具栏 */
.tool-bar {
  background: #fff;
  top: 0;
}

/* ✅ 三栏区域高度 = 视口 - 顶部工具栏 */
.editor-body {
  flex: 1;
  display: flex;
  /* grid-template-columns: 260px 1fr 320px; */
  width: 100%;
  overflow: hidden;
  background: #f7f8fa;
}
</style>
