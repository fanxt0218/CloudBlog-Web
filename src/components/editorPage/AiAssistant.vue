<template>
  <div 
    class="ai-panel" 
    @wheel.stop
    :style="{ width: panelWidth + 'px' }"
  >
    <!-- Resize Handle -->
    <div class="resize-handle" @mousedown="startResizing"></div>
    <!-- Header -->
    <div class="ai-header">
      <span class="title">CloudBlog&nbsp;<span style="color: #3b82f6;">AI</span></span>
      <span class="subtitle">创作辅助</span>
    </div>

    <!-- 历史记录区域 -->
    <div class="chat-history" ref="chatHistoryRef">
      <template v-if="messages.length === 0">
        <div class="placeholder-content">
          <div class="welcome-text">
            <span class="emoji">✨</span>
            <p>我是你的创作助手</p>
            <p class="desc">你可以试着这样问我：</p>
          </div>
          <div class="action-grid">
            <button class="action-btn" @click="handleAction('大纲生成', '1')">📄 大纲生成</button>
            <button class="action-btn" @click="handleAction('代码生成', '2')">💻 代码生成</button>
            <button class="action-btn" @click="handleAction('修改建议', '3')">🔍 修改建议</button>
          </div>
        </div>
      </template>
      <div v-else class="message-list">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <div v-if="msg.role === 'user'" class="message-bubble">{{ msg.content }}</div>
          <div v-else class="message-bubble markdown-body" v-html="renderMarkdown(msg.content)"></div>
        </div>
        <!-- Loading state -->
        <div v-if="loading" class="message assistant loading">
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea
          v-model="inputText"
          placeholder="输入创作要求，AI 帮你写"
          @keydown.enter.prevent="sendMessage"
        />
        <button 
          class="tool-toggle-btn" 
          :class="{ active: cmdType }" 
          :title="cmdType ? '切换/取消工具' : '选择工具'" 
          @click="showToolMenu = !showToolMenu"
        >
          <svg t="1771054511992" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3478" width="19" height="19"><path d="M942.4 289.088c0 0-127.36 128.384-140.352 141.504-12.992 13.056-56.96 11.712-56.96 11.712S628.8 429.12 611.968 412.416C595.328 395.648 583.808 273.92 583.808 273.92S580.544 240.064 597.312 223.232c16.704-16.768 141.056-141.184 141.056-141.184S754.304 64.128 731.2 64C656.64 63.744 505.152 65.472 431.808 139.008L416.576 154.048c-84.736 85.376-92.224 213.184-27.52 307.072L104.64 712.96c-34.176 34.176-71.104 135.168 0 206.4 71.104 71.232 171.776 34.176 205.824-0.064 0 0 203.264-228.928 252.608-283.2 93.568 67.136 222.336 60.48 308.096-25.6l15.104-15.104C957.376 524.032 959.68 373.76 960 297.728 960.192 273.472 942.4 289.088 942.4 289.088zM229.312 878.976c-46.656 0-84.352-37.632-84.352-84.288 0-46.528 37.76-84.288 84.352-84.288 46.592 0 84.224 37.824 84.224 84.288C313.536 841.344 275.904 878.976 229.312 878.976z" fill="currentColor" p-id="3479"></path></svg>
        </button>
        <button class="send-icon" :disabled="loading" :class="{ disabled: !inputText.trim() || inputText === '' }" title="发送" @click="sendMessage">
          ➤
        </button>

        <!-- Tool Selection Menu -->
        <div v-if="showToolMenu" class="tool-menu">
          <div 
            v-for="tool in tools" 
            :key="tool.id" 
            class="tool-item" 
            :class="{ selected: cmdType === tool.id }"
            @click="selectTool(tool.id)"
          >
            <span class="tool-icon">{{ tool.icon }}</span>
            <span class="tool-name">{{ tool.name }}</span>
          </div>
        </div>
      </div>

      <div class="input-footer">
        <!-- <button class="mode-btn">🧠 深度思考 (R1)</button> -->
        <span class="tip">内容由 AI 生成，仅供参考</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AiAssistant">
import { ref, watch, nextTick } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps<{
  messages: Message[],
  loading: boolean
}>()

const emit = defineEmits(['createAssist'])

const inputText = ref('')
const chatHistoryRef = ref<HTMLElement | null>(null)
let cmdType = ref<string | null>(null)
const showToolMenu = ref(false)

const tools = [
  { id: '1', name: '大纲生成', icon: '📄' },
  { id: '2', name: '代码生成', icon: '💻' },
  { id: '3', name: '修改建议', icon: '🔍' }
]

const selectTool = (toolId: string) => {
  if (cmdType.value === toolId) {
    cmdType.value = null
  } else {
    cmdType.value = toolId
  }
  showToolMenu.value = false
}

// --- Resizing Logic ---
const panelWidth = ref(340)
const isResizing = ref(false)
let startX = 0
let startWidth = 0

const startResizing = (e: MouseEvent) => {
  isResizing.value = true
  startX = e.clientX
  startWidth = panelWidth.value
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResizing)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none' // Prevent text selection while dragging
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) return
  
  // Since the panel is fixed to the right, moving left (smaller clientX) increases width
  const deltaX = startX - e.clientX
  const newWidth = startWidth + deltaX
  
  // Constraints
  if (newWidth >= 340 && newWidth <= 800) {
    panelWidth.value = newWidth
  }
}

const stopResizing = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResizing)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

// 监听消息变化实时滚动
watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

// 监听加载状态变化（开始回复时也滚动一下）
watch(() => props.loading, (val) => {
  if (val) scrollToBottom()
})

const handleAction = (action: string, type: string | null = null) => {
  cmdType.value = type
  inputText.value = `帮我进行${action}:`
}

const sendMessage = () => {
  if (!inputText.value.trim() || props.loading) return
  
  emit('createAssist', {
    message: inputText.value,
    type: cmdType.value
  })
  
  inputText.value = ''
  cmdType.value = null
}
</script>

<style scoped>
.ai-panel {
  position: fixed;
  top: 125px;
  right: 20px;
  width: 340px;
  height: calc(100vh - 170px);
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 12px 32px rgba(61, 61, 61, 0.12);
  z-index: 100;
  animation: slideIn 0.4s ease-out;
  transition: width 0.05s linear; /* Very short transition for smoother visual but responsive drag */
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 101;
  transition: background 0.2s;
}

.resize-handle:hover {
  background: rgba(59, 130, 246, 0.1);
}

.resize-handle:active {
  background: rgba(59, 130, 246, 0.2);
}

/* Header */
.ai-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.subtitle {
  font-size: 12px;
  color: #999;
}

/* Actions & History */
.chat-history {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #e5e7ebac;
}

.placeholder-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
}

.welcome-text {
  text-align: center;
  margin-bottom: 24px;
}

.emoji {
  font-size: 32px;
  display: block;
  margin-bottom: 12px;
}

.welcome-text p {
  margin: 4px 0;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.welcome-text .desc {
  font-size: 13px;
  color: #999;
  font-weight: normal;
}

.action-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.action-btn {
  padding: 10px 16px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #eef0f2;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: #4b5563;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: -0.5rem;
  margin-top: 10px;
}

.message {
  display: flex;
  width: 100%;
}

.message.user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}

.user .message-bubble {
  background: #ededed;
  color: #333;
  /* border-bottom-right-radius: 2px; */
}

.assistant .message-bubble {
  /* background: #f3f4f6; */
  color: #333;
  /* border-bottom-left-radius: 2px; */
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Markdown Styles in Side Panel */
.markdown-body {
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  word-break: break-word;
}

:deep(.markdown-body p) {
  margin-bottom: 8px;
}

:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
  font-size: 1.1em;
  margin: 12px 0 8px;
  font-weight: 600;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.2em;
  margin-bottom: 8px;
}

:deep(.markdown-body code) {
  padding: 2px 4px;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

:deep(.markdown-body pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 12px;
}

:deep(.markdown-body blockquote) {
  border-left: 3px solid #e5e7eb;
  padding-left: 10px;
  color: #666;
  margin: 8px 0;
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  border: 1px solid #e5e7eb;
  padding: 4px 8px;
  text-align: left;
}

/* Input */
.input-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
}

textarea {
  box-sizing: border-box;
  resize: none;
  width: 100%;
  min-height: 96px;
  padding: 12px 44px 12px 12px;
  font-size: 13px;
  line-height: 1.5;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  outline: none;
  background: #fff;
}


textarea:focus {
  border-color: #c7dbfa;
}

.send-icon {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #4a91fb;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-icon:hover {
  background: #3b82f6;
}

.send-icon.disabled {
  background: #c7dbfa;
  cursor: not-allowed;
}

/* Tool Menu & Toggle */
.tool-toggle-btn {
  position: absolute;
  right: 50px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 10;
}

.tool-toggle-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.tool-toggle-btn.active {
  background: #eff6ff;
  /* border-color: #3b82f6; */
  color: #3b82f6;
  /* box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); */
}

.tool-menu {
  position: absolute;
  bottom: 50px;
  right: 10px;
  width: 140px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 6px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.tool-item:hover {
  background: #f1f5f9;
}

.tool-item.selected {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

.tool-icon {
  font-size: 14px;
}

.tool-name {
  font-size: 13px;
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}

.mode-btn {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
}

.mode-btn:hover {
  background: #f3f4f6;
}

.tip {
  font-size: 11px;
  color: #9ca3af;
}

.send {
  height: 36px;
  border-radius: 18px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  background: #3bb273;
  color: #fff;
  transition: background 0.2s ease;
}

.send:hover {
  background: #34a468;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
