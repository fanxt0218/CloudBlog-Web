import { defineStore } from 'pinia'

export const useMessageStore = defineStore('message', {
  state: () => ({
    // 目标用户ID，用于指定要聊天的用户
    targetUserId: null as number | null,
    // 是否已处理过自动选择聊天
    autoSelectProcessed: false
  }),
  actions: {
    // 设置目标用户ID
    setTargetUserId(userId: number | null) {
      this.targetUserId = userId
      this.autoSelectProcessed = false
    },
    // 标记自动选择已处理
    markAutoSelectProcessed() {
      this.autoSelectProcessed = true
    },
    // 清除目标用户ID
    clearTargetUserId() {
      this.targetUserId = null
      this.autoSelectProcessed = false
    }
  }
})