<template>
  <div class="ai-message-list-container">
    <div class="ai-message-list" ref="listRef" @scroll="handleScroll">
    <div v-if="messages.length === 0 && loading" class="list-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    
    <div v-for="(msg, index) in messages" :key="index" class="message-wrapper" :class="{ 'is-user': msg.type === 'USER', 'is-thinking': msg.type === 'AI-THINKING' }">
      <div class="avatar">
        <el-avatar :size="36" :src="msg.type === 'USER' ? '/api' + userAvatar : aiAvatar" />
      </div>
      <div class="message-content" :class="{ 'has-file': msg.file }">
        <!-- Attachment Preview (Outside Bubble) -->
        <div v-if="msg.file" class="message-attachment" :class="{ 'is-image': isImage(msg.file) }">
          <template v-if="isImage(msg.file)">
            <el-image 
              class="attachment-image" 
              :src="getFileUrl(msg.file)" 
              :preview-src-list="[getFileUrl(msg.file)]"
              fit="cover"
              preview-teleported
            />
          </template>
          <template v-else>
            <div class="attachment-file-card">
              <el-icon class="file-icon"><Document /></el-icon>
              <div class="file-info">
                <span class="file-name">{{ getFileName(msg.file) }}</span>
              </div>
            </div>
          </template>
        </div>

        <div v-if="msg.content || msg.type === 'AI-THINKING'" class="bubble" :class="{ 'user-bubble': msg.type === 'USER', 'ai-bubble': msg.type !== 'USER' }">
          <div v-if="msg.type === 'AI-THINKING'" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <div v-else class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
        </div>

        <!-- AI Actions Row -->
        <div v-if="msg.type !== 'USER' && msg.type !== 'AI-THINKING' && !(index === messages.length - 1 && isSending)" class="ai-actions">
          <el-tooltip content="复制" placement="top" :show-after="500">
            <div class="action-btn" @click="handleCopy(msg.content)">
              <el-icon><CopyDocument /></el-icon>
            </div>
          </el-tooltip>
          <!-- <div class="action-btn"><el-icon><Pointer/></el-icon></div>
          <div class="action-btn" style="transform: rotate(180deg)"><el-icon><Pointer /></el-icon></div> -->
          <div class="action-btn">
            <svg t="1770974181548" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2843" width="20" height="20">
              <path d="M160 906.666667a64 64 0 0 1-64-64v-384a64 64 0 0 1 64-64h145.024c17.664-36.864 51.690667-101.888 113.834667-219.648 31.296-55.146667 100.970667-74.133333 155.434666-42.154667 54.186667 31.786667 77.44 98.688 55.082667 157.802667l-28.437333 75.093333h213.504c62.826667 0 113.557333 51.562667 113.557333 114.922667 0 6.570667-0.554667 13.141333-1.664 19.626666l-44.373333 259.477334c-14.506667 84.8-87.104 146.88-172.181334 146.88H160zM474.986667 205.738667a16255.445333 16255.445333 0 0 0-94.976 182.122666c-10.453333 20.48-18.24 36.096-23.36 46.762667a371.626667 371.626667 0 0 0-4.650667 10.069333l0.042667 397.973334h357.738666c53.717333 0 99.818667-39.424 109.098667-93.653334l44.373333-259.498666c0.490667-2.922667 0.746667-5.866667 0.746667-8.832 0-28.245333-22.314667-50.922667-49.578667-50.922667h-306.133333l61.226667-161.749333c11.370667-30.037333-0.426667-64-27.605334-79.957334a48.64 48.64 0 0 0-66.922666 17.706667zM288 458.666667h-128v384h128v-384z" fill="currentColor" p-id="2844">
              </path>
            </svg>          
          </div>
          <div class="action-btn" style="transform: rotate(180deg)">
            <svg t="1770974181548" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2843" width="20" height="20">
              <path d="M160 906.666667a64 64 0 0 1-64-64v-384a64 64 0 0 1 64-64h145.024c17.664-36.864 51.690667-101.888 113.834667-219.648 31.296-55.146667 100.970667-74.133333 155.434666-42.154667 54.186667 31.786667 77.44 98.688 55.082667 157.802667l-28.437333 75.093333h213.504c62.826667 0 113.557333 51.562667 113.557333 114.922667 0 6.570667-0.554667 13.141333-1.664 19.626666l-44.373333 259.477334c-14.506667 84.8-87.104 146.88-172.181334 146.88H160zM474.986667 205.738667a16255.445333 16255.445333 0 0 0-94.976 182.122666c-10.453333 20.48-18.24 36.096-23.36 46.762667a371.626667 371.626667 0 0 0-4.650667 10.069333l0.042667 397.973334h357.738666c53.717333 0 99.818667-39.424 109.098667-93.653334l44.373333-259.498666c0.490667-2.922667 0.746667-5.866667 0.746667-8.832 0-28.245333-22.314667-50.922667-49.578667-50.922667h-306.133333l61.226667-161.749333c11.370667-30.037333-0.426667-64-27.605334-79.957334a48.64 48.64 0 0 0-66.922666 17.706667zM288 458.666667h-128v384h128v-384z" fill="currentColor" p-id="2844">
              </path>
            </svg>          
          </div>
          <!-- <div class="action-btn"><el-icon><Share /></el-icon></div> -->
          <div class="action-btn" style="margin-top: -2px;">
            <svg t="1770974707323" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6155" width="15" height="15"><path d="M468.710497 16.129075A62.053283 62.053283 0 0 1 511.990784 0.018432a64.783901 64.783901 0 0 1 43.212022 16.110643l249.988034 232.102489a44.713862 44.713862 0 0 1 0 65.125228 53.247042 53.247042 0 0 1-70.313401 0L560.937103 152.455154v620.054973a48.195399 48.195399 0 0 1-49.492442 46.283967 47.376214 47.376214 0 0 1-48.946319-46.283967V152.455154L289.035864 313.356792a53.247042 53.247042 0 0 1-70.313401 0 44.782127 44.782127 0 0 1 0-65.125228z m510.966802 495.607079a43.894677 43.894677 0 0 1 44.236004 45.806109v306.102223A160.696841 160.696841 0 0 1 864.035647 1024H159.877656A160.355514 160.355514 0 0 1 0 863.644486V557.542263a45.874374 45.874374 0 0 1 91.680483 0v306.102223a68.879827 68.879827 0 0 0 69.221154 69.221154h704.157992a68.879827 68.879827 0 0 0 69.289419-69.221154V557.542263a45.123454 45.123454 0 0 1 45.328251-45.806109z m0 0" fill="currentColor" p-id="6156"></path></svg>
          </div>
          <div class="action-btn">
            <svg t="1770974848502" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7158" width="17" height="17"><path d="M959.667298 800.651143l-33.843806-157.556409c-0.064468-0.224104 0-0.388856-0.029676-0.587378l-2.611477-10.637268c-1.434675-5.9055-5.15644-10.539031-9.918907-13.248745-4.767584-2.804882-10.638291-3.686972-16.416901-1.956561l-10.538007 3.067872c-0.164752 0.029676-0.328481 0.163729-0.557702 0.25992L729.110271 669.726278c-11.618619 3.362584-18.664082 15.634072-15.829524 27.412326l2.64627 8.879228c2.838651 11.743462 17.358343 15.370059 28.976962 12.006452l100.167351-32.18912c-2.316765 4.496407-4.728698 8.943696-7.227612 13.325493-50.845015 89.318258-137.646963 153.181775-238.125399 175.209464-94.868671 20.790512-225.597061 3.428076-307.410392-48.981574-81.779561-52.344159-137.517003-136.410809-158.308539-231.274364-3.551896-16.152888-19.510356-26.4013-35.668361-22.844288-16.152888 3.527336-26.400277 19.515473-22.809495 35.669384 24.178679 110.532419 89.252767 207.876468 184.510294 268.90031 95.257527 60.993143 242.041592 81.256652 352.540242 57.046251 116.955712-25.683962 218.022549-100.089579 277.32212-204.126051 0.652869-1.154289 1.288343-2.320858 1.932002-3.479241l18.071587 85.813434c2.870374 11.782348 14.618952 18.568914 26.237571 15.140839l8.384971-0.876973C956.17373 821.927725 962.502879 812.369022 959.667298 800.651143L959.667298 800.651143zM96.961844 395.962194l2.610454 10.654664c1.439792 5.90857 5.15644 10.525728 9.924024 13.252839 4.76349 2.787486 10.637268 3.669576 16.412808 1.957585l10.507308-3.086291c0.199545-0.029676 0.358157-0.177032 0.557702-0.2415l156.64055-49.751101c11.618619-3.393283 18.697851-15.634072 15.859199-27.41335l-2.871397-7.978718c-2.870374-11.747555-17.134239-16.300244-28.717042-12.906961l-100.582813 32.301683c5.130857-11.68411 10.870582-23.094998 17.173125-34.111912 50.90539-89.366354 136.895857-150.277632 237.309824-172.304298 94.863555-20.790512 225.595015-3.41068 307.374576 48.997947 81.814354 52.361555 138.299833 133.48927 159.121044 228.386594 3.558036 16.153912 19.48068 26.350135 35.668361 22.810518 11.294231-2.482541 19.709901-11.048637 22.485107-21.50478 1.206478-4.473895 1.404999-9.30083 0.323365-14.164604-24.213471-110.51093-90.030479-204.973348-185.288007-265.961374-95.291297-61.011562-242.045685-81.261769-352.543312-57.029878-116.891244 25.618471-217.210044 97.05036-276.470729 201.085808-4.179183 7.325849-8.151657 14.809287-11.908214 22.416546l-17.690918-84.010369c-2.905166-11.765975-13.900591-21.262256-25.51921-17.868973l-8.385994 0.916882c-11.618619 3.429099-18.697851 15.69547-15.859199 27.412326l33.805944 157.552316C96.996636 395.58664 96.896352 395.767765 96.961844 395.962194L96.961844 395.962194zM96.961844 395.962194" fill="currentColor" p-id="7159"></path></svg>
          </div>
          <div class="action-btn"><el-icon><More /></el-icon></div>
        </div>
      </div>
    </div>
    </div>

    <!-- Scroll to Bottom Button -->
    <transition name="fade">
      <div v-show="showScrollBottom" class="scroll-bottom-btn" @click="scrollToBottom('smooth')">
        <el-icon><ArrowDown /></el-icon>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Loading, Document, CopyDocument, Pointer, Share, RefreshRight, More, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { AIChatDetail } from '@/types/index'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{
  messages: AIChatDetail[] 
  activeChatId?: string | null
  loading?: boolean
  isSending?: boolean
  userAvatar?: string
  userName?: string
  aiAvatar?: string
}>()

const listRef = ref<HTMLElement | null>(null)
const showScrollBottom = ref(false)

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target) return
  
  const { scrollTop, scrollHeight, clientHeight } = target
  // If more than 300px away from bottom, show the button
  showScrollBottom.value = scrollHeight - (scrollTop + clientHeight) > 300
}

const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTo({
        top: listRef.value.scrollHeight,
        behavior
      })
    }
  })
}

const scrollToMessageTop = (index: number) => {
  nextTick(() => {
    if (listRef.value) {
      const messageElements = listRef.value.querySelectorAll('.message-wrapper')
      const targetElement = messageElements[index] as HTMLElement
      if (targetElement) {
        // 使用 offsetTop 获取元素相对于容器内容的位置
        const targetScrollTop = targetElement.offsetTop - 20 // 减去 padding，保持间距
        
        // 直接设置滚动位置，使目标元素位于容器顶部
        listRef.value.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        })
      }
    }
  })
}

const lastMessageCount = ref(0)

// 监听会话 ID 变化：切换会话时立即滚动到底部
watch(() => props.activeChatId, (newId) => {
  if (newId) {
    nextTick(() => {
      if (listRef.value) {
        // 临时禁用平滑滚动以实现即时跳转
        const originalBehavior = listRef.value.style.scrollBehavior
        listRef.value.style.scrollBehavior = 'auto'
        listRef.value.scrollTop = listRef.value.scrollHeight
        // 使用 timeout 确保 scrollTop 设置生效后再恢复
        setTimeout(() => {
          if (listRef.value) {
            listRef.value.style.scrollBehavior = originalBehavior
          }
        }, 50)
      }
    })
  }
}, { immediate: true })

watch(() => props.messages.length, (newLen, oldLen) => {
  // 首次加载或切换会话：如果 messages 有数据，执行 instant 滚动（双重保险）
  if (newLen > 0 && oldLen === 0) {
    nextTick(() => {
      if (listRef.value) {
        listRef.value.style.scrollBehavior = 'auto'
        listRef.value.scrollTop = listRef.value.scrollHeight
        setTimeout(() => {
          if (listRef.value) listRef.value.style.scrollBehavior = 'smooth'
        }, 50)
      }
    })
  } 
  // 消息真正增加时才滚动（发送/接收新消息）
  else if (newLen > oldLen && oldLen > 0) {
    const lastMessage = props.messages[newLen - 1]
    const secondLastMessage = newLen > 1 ? props.messages[newLen - 2] : null
    
    if (lastMessage && lastMessage.type === 'USER') {
      scrollToMessageTop(newLen - 1)
    } else if (lastMessage && lastMessage.type === 'AI-THINKING' && secondLastMessage && secondLastMessage.type === 'USER') {
      scrollToMessageTop(newLen - 2)
    } else {
      scrollToBottom()
    }
  }
  
  lastMessageCount.value = newLen
})

watch(() => props.messages[props.messages.length - 1]?.content, (newContent) => {
  const lastMessage = props.messages[props.messages.length - 1]
  if (lastMessage && lastMessage.type !== 'USER' && listRef.value) {
    const { scrollTop, scrollHeight, clientHeight } = listRef.value
    // Only scroll to bottom if the AI response has already filled the screen
    // We check if the scrollHeight is significantly larger than what's visible
    // This allows the user's message to remain at the top.
    if (scrollHeight > scrollTop + clientHeight + 20) {
      scrollToBottom()
    }
  }
})

onMounted(() => {
  // 不自动滚动，让 watch 处理
})

onUnmounted(() => {
  // Clean up if needed, though Vue handles event listeners on elements automatically
})

const isImage = (file: string) => {
  if (!file) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  const lowerFile = file.toLowerCase()
  return imageExtensions.some(ext => lowerFile.endsWith(ext))
}

const getFileName = (path: string) => {
  if (!path) return ''
  if (path.includes('/') || path.includes('\\')) {
    return path.split(/[/\\]/).pop() || path
  }
  return path
}

const getFileUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('blob:')) return path
  return '/api' + path
}

const handleCopy = (text: string) => {
  if (!text) return
  
  // Use clipboard API
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(err => {
    console.error('Failed to copy document:', err)
    ElMessage.error('复制失败')
  })
}



// No longer need local simple renderMarkdown

</script>

<style scoped>
.ai-message-list-container {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-message-list {
  flex: 1;
  overflow-y: auto;
  position: relative;
  padding: 20px;
  padding-bottom: 180px; /* Reduced from 150px as input box area is outside now? No, wait. */
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center children */
}

.message-wrapper {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  width: 60%; /* Restrict width to 60% */
}

.message-wrapper.is-user {
  flex-direction: row-reverse;
}

.message-wrapper.is-thinking {
  align-items: center;
}

.avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-wrapper.is-user .message-content {
  align-items: flex-end;
}

.bubble {
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.user-bubble {
  padding: 8px 16px;
  background-color: #ededed;
  color: #303133;
}

.ai-bubble {
  padding: 12px 16px;
  padding-bottom: 0;
  padding-left: 0;
  background-color: transparent;
  color: #303133;
}

/* AI Action Styles */
.ai-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  margin-left: -4px; /* Slight offset to align icons with text start */
  /* opacity: 0.6; */
  transition: opacity 0.3s;
}

.ai-actions:hover {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #121212d7;
  transition: all 0.2s;
  font-size: 16px;
}

.action-btn:hover {
  background-color: #f0f2f5;
  color: #121212;
}

.action-btn .el-icon {
  font-size: 17px;
}

/* Attachment Styles */

.message-attachment {
  margin-bottom: 8px; /* Spacing between attachment and bubble */
  max-width: 100%;
}


.message-attachment.is-image {
  max-width: 300px;
}

.attachment-image {
  display: block;
  width: 100%;
  max-height: 200px;
  border-radius: 8px;
  cursor: zoom-in;
  border: 1px solid #eee;
}

.attachment-file-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  max-width: 260px;
  transition: all 0.3s;
}

.attachment-file-card:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

.file-icon {
  font-size: 24px;
  color: #909399;
  flex-shrink: 0;
}

.file-info {
  overflow: hidden;
}

.file-name {
  display: block;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* Markdown Styles */
.markdown-body {
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  color: inherit;
}

.markdown-body :deep(h1), 
.markdown-body :deep(h2), 
.markdown-body :deep(h3), 
.markdown-body :deep(h4) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(h1) { font-size: 1.5em; }
.markdown-body :deep(h2) { font-size: 1.25em; }
.markdown-body :deep(h3) { font-size: 1.1em; }

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 8px;
}

.markdown-body :deep(ul), 
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin-top: 0;
  margin-bottom: 8px;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
}

.markdown-body :deep(pre) {
  margin-top: 8px;
  margin-bottom: 12px;
  padding: 12px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #282c34; /* Match atom-one-dark */
  border-radius: 6px;
}

.markdown-body :deep(pre code) {
  padding: 0;
  margin: 0;
  font-size: inherit;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
  color: #abb2bf;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 8px 0;
}

.markdown-body :deep(table) {
  display: block;
  width: 100%;
  overflow: auto;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.markdown-body :deep(table th), 
.markdown-body :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body :deep(table tr) {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-body :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.markdown-body :deep(img) {
  max-width: 100%;
  box-sizing: content-box;
}

.markdown-body :deep(hr) {
  height: 0.25em;
  padding: 0;
  margin: 16px 0;
  background-color: #e1e4e8;
  border: 0;
}
/* Typing Indicator */
.typing-indicator span {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #ccc;
  border-radius: 50%;
  margin: 0 2px;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

.list-loading .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

/* Scroll to Bottom Button Styles */
.scroll-bottom-btn {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  background-color: #fff;
  border: 1px solid #efefef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  z-index: 100;
  color: #606266;
  transition: all 0.3s;
}

.scroll-bottom-btn:hover {
  background-color: #f5f7fa;
  color: #121212;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.scroll-bottom-btn .el-icon {
  font-size: 18px;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
