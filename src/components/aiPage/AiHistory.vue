<template>
  <div class="ai-history" :class="{ collapsed: isCollapsed }">
    <!-- Header -->
    <div class="sidebar-header" :class="{ 'collapsed-header': isCollapsed }">
      <div class="brand">
        <span class="brand-text" v-if="!isCollapsed">CloudBlog <span class="highlight">AI</span></span>
        <span class="brand-text-collapsed" v-else>AI</span>
      </div>
    </div>

    <!-- New Chat Button -->
    <div class="new-chat-section">
      <div class="new-chat-btn" :class="{ 'collapsed-btn': isCollapsed }" @click="$emit('new-chat')">
        <el-icon><Plus /></el-icon>
        <span v-if="!isCollapsed">新建会话</span>
      </div>
    </div>

    <!-- History List -->
    <div class="history-label" v-if="!isCollapsed">历史记录</div>
    <div class="history-list">
      <div 
        v-for="item in conversations" 
        :key="item.conversationId" 
        class="history-item"
        :class="{ active: currentId === item.conversationId }"
        @click="$emit('select', item.conversationId)"
      >
        <div class="item-icon">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div v-if="!isCollapsed" class="item-content">
          <div class="item-row">
            <span class="item-title">{{ item.title || '新对话' }}</span>
          </div>
          <div class="item-row">
            <span class="item-time">{{ formatTime(item.createTime) }}</span>
          </div>
        </div>
        <div v-if="!isCollapsed" class="delete-btn" @click.stop="$emit('delete', item.conversationId)">
          <el-icon><Delete /></el-icon>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <!-- Collapse Toggle -->
      <div class="collapse-toggle" @click="toggleCollapse">
        <el-icon v-if="!isCollapsed"><ArrowLeft /></el-icon>
        <el-icon v-else><ArrowRight /></el-icon>
        <span v-if="!isCollapsed" style="margin-left: 8px; font-size: 14px;">收起</span>
      </div>

      <!-- User Info -->
      <div class="user-info">
        <el-avatar :size="32" :src="`/api${userAvatar}` || defaultAvatar" />
        <span v-if="!isCollapsed" class="user-name">{{ userName }}</span>
        <el-icon v-if="!isCollapsed" class="more-icon"><MoreFilled /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, ChatDotRound, Delete, ArrowLeft, ArrowRight, MoreFilled } from '@element-plus/icons-vue'
import { useAiStore } from '@/stores/aiStore';

import type { AIChatList } from '@/types/index'

const props = defineProps<{
  conversations: AIChatList[]
  currentId: string | null
  userName?: string
  userAvatar?: string
}>()

const emit = defineEmits(['select', 'delete', 'new-chat'])

const isCollapsed = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${date.getFullYear()}/${month}/${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.ai-history {
  width: 260px;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0,0,0,0.02);
}

.ai-history.collapsed {
  width: 68px;
}

/* Header */
.sidebar-header {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  height: 50px;
}

.sidebar-header.collapsed-header {
  justify-content: center;
  align-items: center;
}

.brand-text {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.brand-text .highlight {
  color: #2a94fe;
}

.brand-text-collapsed {
  font-size: 22px;
  font-weight: bold;
  color: #2a94fe;
}

/* New Chat Btn */
.new-chat-section {
  padding: 10px 15px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #333;
  padding: 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  border: 1px solid transparent;
}

.new-chat-btn:hover {
  background-color: #ecf5ff;
  color: #409EFF;
  border-color: #c6e2ff;
}

.new-chat-btn.collapsed-btn {
  padding: 10px 0;
  border-radius: 50%;
  width: 36px;
  height: 20px;
  margin: 0 auto;
}

.history-label {
  padding: 15px 20px 5px;
  font-size: 12px;
  color: #999;
}

/* List */
.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-list::-webkit-scrollbar {
  width: 4px;
}
.history-list::-webkit-scrollbar-thumb {
  background: #eee;
  border-radius: 2px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  margin-bottom: 5px;
  position: relative;
  height: 50px;
  box-sizing: border-box;
  color: #606266;
  border: 1px solid transparent;
}

.ai-history.collapsed .history-item {
  justify-content: center;
  padding: 10px 0;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item.active {
  background-color: #ecf5ff;
  border-color: #d9ecff; 
  color: #409EFF;
}

.item-icon {
  display: flex;
  align-items: center;
  font-size: 18px;
}

.item-content {
  margin-left: 12px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 1.4;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.item-time {
  font-size: 12px;
  color: #999;
  transform: scale(0.9);
  transform-origin: left center;
}

.delete-btn {
  display: none;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #f56c6c;
  padding: 4px;
}

.history-item:hover .delete-btn {
  display: block;
}

/* Bottom */
.sidebar-bottom {
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  color: #909399;
  border-radius: 6px;
  margin-bottom: 10px;
  transition: background-color 0.2s;
  background-color: #f9f9f9;
}

.collapse-toggle:hover {
  background-color: #f0f2f5;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 5px 0;
  cursor: pointer;
  border-radius: 6px;
}

.ai-history.collapsed .user-info {
  justify-content: center;
}

.user-name {
  margin-left: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-icon {
  color: #999;
  transform: rotate(90deg);
}
</style>
