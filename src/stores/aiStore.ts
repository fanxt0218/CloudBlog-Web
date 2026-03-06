
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getChatList, getChatDetail, chat, deleteChat, chatStream, uploadFile, setConversationTitle } from '@/api/ai'
import type { AIChatList, AIChatDetail } from '@/types/index'
import { generateUUID } from '@/utils/uuid'

export const useAiStore = defineStore('ai', () => {
    // State
    const conversations = ref<AIChatList[]>([])
    const activeChatId = ref<string | null>(null)
    const messages = ref<AIChatDetail[]>([])
    const isLoading = ref(false)
    const isSending = ref(false)

    // Getters
    const currentConversation = computed(() =>
        conversations.value.find(c => c.conversationId === activeChatId.value)
    )

    // Actions

    // Load chat list
    const loadChatList = async (userId: number) => {
        try {
            const res = await getChatList(userId)
            if (res.data) {
                conversations.value = res.data
                // If there are conversations but no active one, select the first one? 
                // Maybe better to let the component decide, or just leave it null (new chat state)
            }
        } catch (error) {
            console.error('Failed to load chat list:', error)
        }
    }

    // Load chat detail
    const loadChatDetail = async (conversationId: string) => {
        if (!conversationId) return

        isLoading.value = true
        // Keep messages for a moment or clear them if switching? 
        // Clearing is safer if switching to a new chat to avoid seeing old messages.
        messages.value = []

        try {
            const res = await getChatDetail(conversationId)
            if (res.data) {
                // Ensure correct type casting if needed, backend should return AIChatDetail[]
                // Adjust per actual backend response structure
                messages.value = (res.data as any).map((item: any) => ({
                    conversationId: item.conversationId,
                    content: item.content,
                    type: item.type, // 'user' or 'ai'
                    timestamp: item.timestamp,
                    file: item.file
                }))
            }
        } catch (error) {
            console.error('Failed to load chat detail:', error)
        } finally {
            isLoading.value = false
        }
    }

    // Set active chat
    const setActiveChat = async (conversationId: string) => {
        if (activeChatId.value === conversationId) return
        activeChatId.value = conversationId
        await loadChatDetail(conversationId)
    }

    // Start new chat
    const startNewChat = () => {
        activeChatId.value = null
        messages.value = []
    }

    // Generate UUID with fallback for non-secure contexts
    const generateId = () => {
        return generateUUID()
    }

    // Send message (Streaming version)
    const sendMessage = async (userId: number, text: string, file?: File | null) => {
        if (!text.trim() && !file) return

        isSending.value = true

        // If no active chat, generate a new ID
        let targetId = activeChatId.value
        let isNewChat = false

        if (!targetId) {
            targetId = generateId()
            isNewChat = true
            const newChat: AIChatList = {
                conversationId: targetId,
                title: text.slice(0, 20) || 'New Chat',
                createTime: new Date().toISOString()
            }
            conversations.value.unshift(newChat)
            activeChatId.value = targetId
        }

        // Add User Message
        const userMsg: AIChatDetail = {
            conversationId: targetId,
            content: text,
            type: 'USER',
            timestamp: new Date().toISOString(),
            file: file ? file.name : '' // Optimistically show file name
        }
        messages.value.push(userMsg)

        // Add "Thinking" message initially
        const thinkingMsg: AIChatDetail = {
            conversationId: targetId,
            content: '',
            type: 'AI-THINKING',
            timestamp: new Date().toISOString(),
            file: ''
        }
        messages.value.push(thinkingMsg)

        try {
            let filePath = ''

            // Upload file if exists
            if (file) {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('userId', userId.toString())
                formData.append('conversationId', targetId)

                const uploadRes = await uploadFile(formData) as any
                console.log('上传文件返回的结果', uploadRes)
                if (uploadRes.code === 200 && uploadRes.msg) {
                    filePath = uploadRes.msg
                    // Update user message with real path for rendering
                    userMsg.file = filePath
                } else {
                    throw new Error(uploadRes.msg || 'File upload failed')
                }
            }

            const stream = await chatStream(userId, text, targetId, filePath)
            if (!stream) throw new Error('No stream returned')

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let isFirstChunk = true

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })

                // On first chunk, switch from THINKING to ASSISTANT
                if (isFirstChunk && chunk) {
                    const lastMsg = messages.value[messages.value.length - 1]
                    if (lastMsg && lastMsg.type === 'AI-THINKING') {
                        lastMsg.type = 'ASSISTANT'
                        lastMsg.content = chunk
                        isFirstChunk = false
                    }
                } else {
                    // Update the last message
                    const lastMsg = messages.value[messages.value.length - 1]
                    if (lastMsg && lastMsg.type === 'ASSISTANT') {
                        lastMsg.content += chunk
                    }
                }
            }

            if (isNewChat) {
                // Set title asynchronously based on first message
                setConversationTitle(targetId).then(res => {
                    if ((res as any).code === 200) {
                        loadChatList(userId)
                    }
                }).catch(err => {
                    console.error('Failed to set conversation title:', err)
                    // Even if title fails, we should probably still load list if it's new
                    loadChatList(userId)
                })
            }
        } catch (error) {
            console.error('Send message failed:', error)
            const lastMsg = messages.value[messages.value.length - 1]
            if (lastMsg && lastMsg.type === 'AI-THINKING') {
                lastMsg.type = 'ASSISTANT'
                lastMsg.content = 'Failed to get response. Please try again.'
            } else if (lastMsg) {
                lastMsg.content += '\n\n[Error: Connection lost]'
            }
        } finally {
            isSending.value = false
        }
    }

    // Delete chat
    const handleDeleteChat = async (conversationId: string) => {
        try {
            await deleteChat(conversationId)
            conversations.value = conversations.value.filter(c => c.conversationId !== conversationId)

            if (activeChatId.value === conversationId) {
                startNewChat()
            }
        } catch (error) {
            console.error('Delete chat failed:', error)
        }
    }

    return {
        conversations,
        activeChatId,
        messages,
        isLoading,
        isSending,
        currentConversation,
        loadChatList,
        loadChatDetail,
        setActiveChat,
        startNewChat,
        sendMessage,
        deleteChat: handleDeleteChat
    }
})
