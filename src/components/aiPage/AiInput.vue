<template>
  <div class="ai-input-container" :class="{ 'is-started': isChatStarted }">
    <div class="ai-input-wrapper">
      <div v-if="isChatStarted" class="new-chat-container">
        <!-- <el-button class="new-chat-btn-float" @click="$emit('new-chat')">
          <el-icon><Plus /></el-icon> 新建会话
        </el-button> -->
      </div>

      <div class="input-box-area" :class="{ 'has-attachments': attachments.length > 0 }">
        <!-- Plugin Preview Area -->
        <div v-if="attachments.length > 0" class="context-preview-area">
          <PluginPreview 
            :attachments="attachments"
            @remove-attachment="handleRemoveAttachment"
          />
        </div>

        <div class="input-row">
          <!-- Left Actions (Plugins) -->
          <div class="input-left-actions">
            <FileUploadPlugin @add-attachment="handleAddAttachment" />
            <!-- Future plugins like VoiceInputPlugin can go here -->
          </div>

          <el-input
            v-model="internalValue"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 8 }"
            class="custom-input"
            placeholder="有问题，尽管问"
            @keydown.enter="handleEnter"
          />
          
          <div class="input-actions">
            <el-button type="primary" style="height: 38px; width: 38px;" circle @click="handleSend" :disabled="!internalValue.trim() && attachments.length === 0">
              <el-icon style="font-size: 18px;"><Position /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <div v-if="!isChatStarted" class="suggestion-chips">
        <div class="chip" @click="quickAsk('起个网名')">你叫什么名字</div>
        <div class="chip" @click="quickAsk('讲一个故事')">讲一个故事</div>
        <div class="chip" @click="quickAsk('你的专业能力')">你的专业能力</div>
        <div class="chip" @click="quickAsk('生活建议')">生活建议</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Position, Plus } from '@element-plus/icons-vue'
import FileUploadPlugin from './plugins/FileUploadPlugin.vue'
import PluginPreview from './plugins/PluginPreview.vue'

const props = defineProps<{
  isChatStarted: boolean
}>()

const emit = defineEmits(['send', 'new-chat'])

const internalValue = ref('')
const attachments = ref<File[]>([])

const handleAddAttachment = (file: File) => {
  // Current logic enforces single file, but array structure allows future expansion
  attachments.value = [file] 
}

const handleRemoveAttachment = (index: number) => {
  attachments.value.splice(index, 1)
}


const handleSend = () => {
  if (!internalValue.value.trim() && attachments.value.length === 0) return
  
  // Emit text and attachments (currently only the first one if exists)
  // We pass the object { text, file } for flexibility
  emit('send', { 
    text: internalValue.value, 
    file: attachments.value[0] || null 
  })
  
  internalValue.value = ''
  attachments.value = []
}

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) { 
    e.preventDefault()
    handleSend()
  }
}

const quickAsk = (text: string) => {
  emit('send', text)
}
</script>

<style scoped>
.ai-input-container {
  position: absolute;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 20;
  background-color: #f7f7fa45;
}

/* Initial State: Centered but slightly higher to be closer to welcome */
.ai-input-container:not(.is-started) {
  top: 50%;
  transform: translateY(-50%);
}

/* Chat State: Bottom */
.ai-input-container.is-started {
  bottom: 0;
  top: auto;
  transform: translateY(0);
  /* background-color: #fff;  */
  /* border-top: 1px solid #f0f0f0; */
}

.ai-input-wrapper {
  width: 100%;
  max-width: 800px;
  position: relative;
  transition: all 0.6s ease;
}

.ai-input-container.is-started .ai-input-wrapper {
  max-width: 60%; /* Restrict width to 60% as requested */
}

/* New Chat Button Styles */
.new-chat-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  position: absolute;
  top: -45px; /* Position above the input box */
  left: 0;
  right: 0;
}

.new-chat-btn-float {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  color: #606266;
  border-radius: 20px;
  padding: 8px 20px;
  transition: all 0.3s;
}

.new-chat-btn-float:hover {
  color: #606266;
  border-color: #e4e3e3;
  background-color: #ecececa7;
}

.input-box-area {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08); /* Shadow moved to container */
  transition: all 0.3s;
  overflow: hidden; /* Ensure children don't pop out of rounded corners */
}

.input-row {
  position: relative;
  display: flex;
  align-items: flex-end; /* Align bottom for multiline input */
  width: 100%;
}

.input-left-actions {
  display: flex;
  align-items: center;
  padding-left: 15px;
  /* padding-bottom: 12px;  */
  height: 63px; /* Match min-height of input */
  flex-shrink: 0; /* Prevent shrinking */
  color: #1a1a1a;
}

:deep(.el-textarea__inner) {
  border-radius: 30px; /* Kept for focus outline shape */
  padding: 18px 60px 18px 10px; /* Reduced left padding, using flex layout mostly */
  box-shadow: none !important; /* Remove individual input shadow */
  background-color: transparent; /* Transparent to show container background */
  border: none;
  resize: none;
  font-size: 16px;
  line-height: 1.6;
  min-height: 60px !important;
}

.custom-input {
  flex: 1;
  width: 0; /* Prevents overflow in flex container */
}

:deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

/* Container focus state simulation could be added if needed, but simple shadow on container is often enough */

.input-actions {
  position: absolute;
  right: 12px;
  bottom: 11px; /* Fixed bottom position */
  display: flex;
  align-items: center;
  z-index: 5;
}

.input-actions .el-button {
  background-color: #1a1a1a;
  border-color: #1a1a1a;
  transition: all 0.3s;
}

.input-actions .el-button:hover:not(.is-disabled) {
  background-color: #333333;
  border-color: #333333;
  transform: scale(1.05);
}

.input-actions .el-button.is-disabled {
  background-color: #d5d5d5;
  border-color: #e4e7ed;
  color: #ffffff;
}

.suggestion-chips {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.chip {
  background-color: #f5f7fa;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
}

.chip:hover {
  background-color: #e6e8eb;
  color: #409EFF;
}
</style>
