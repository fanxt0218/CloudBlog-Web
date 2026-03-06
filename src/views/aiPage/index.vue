<template>
  <div class="ai-page-container">
    <AiHistory 
      :conversations="conversations" 
      :current-id="activeChatId"
      :user-name="userName"
      :user-avatar="userAvatar"
      @select="handleSelectChat"
      @delete="handleDeleteChat"
      @new-chat="handleNewChat"
    />
    
    <div class="ai-main-content">
      <AiWelcome 
        :visible="!isChatStarted" 
        :user-name="userName"
      />
      
      <AiMessageList 
        v-if="isChatStarted"
        :messages="messages"
        :active-chat-id="activeChatId"
        :loading="isLoading"
        :is-sending="isSending"
        :user-avatar="userAvatar"
        :ai-avatar="aiAvatar"
      />
      
      <AiInput 
        :is-chat-started="isChatStarted"
        @send="handleSendMessage"
        @new-chat="handleNewChat"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="AiPage">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import AiHistory from '@/components/aiPage/AiHistory.vue'
import AiWelcome from '@/components/aiPage/AiWelcome.vue'
import AiInput from '@/components/aiPage/AiInput.vue'
import AiMessageList from '@/components/aiPage/AiMessageList.vue'
import { useAiStore } from '@/stores/aiStore'
import { getUserInfo } from '@/api/userInfo/homePage'

const aiStore = useAiStore()
const { 
  conversations, 
  activeChatId, 
  messages, 
  isLoading, 
  isSending 
} = storeToRefs(aiStore)

// State
const userName = ref('游客')
const userAvatar = ref('')
const aiAvatar = ref('/assests/avatar/ai-avatar.png') 

// Computed
const isChatStarted = computed(() => !!activeChatId.value)
const currentUserId = ref<number>(0)

// Actions
const handleSendMessage = (payload: string | { text: string, file: File | null }) => {
  if (!currentUserId.value) return
  
  let text = ''
  let file: File | null = null

  if (typeof payload === 'string') {
    text = payload
  } else {
    text = payload.text
    file = payload.file
  }

  aiStore.sendMessage(currentUserId.value, text, file)
}

const handleSelectChat = (id: string) => {
  console.log('当前选中的会话Id', id)
  aiStore.setActiveChat(id)
}

const handleNewChat = () => {
  aiStore.startNewChat()
}

const handleDeleteChat = (id: string) => {
  aiStore.deleteChat(id)
}

onMounted(async () => {
  document.title = 'CloudBlog AI-你的智能助手'
  // Fetch user info
  const storedName = localStorage.getItem('userName')
  if (storedName) userName.value = storedName
  
  const userId = Number(localStorage.getItem('userId'))
  if (userId) {
      currentUserId.value = userId
      const res = await getUserInfo(userId)
      if (res.data) {
          userAvatar.value = res.data.image
          userName.value = res.data.userName
      }
      await aiStore.loadChatList(userId)
  }
})
</script>

<style scoped>
.ai-page-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: #f7f7fa45;
}

.ai-main-content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
