<template>
  <div class="file-upload-plugin">
    <el-tooltip content="上传文件" placement="top" :show-after="500">
      <el-button 
        circle 
        class="plugin-btn" 
        @click="triggerFileInput"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </el-tooltip>
    <input 
      type="file" 
      ref="fileInputRef" 
      class="hidden-input" 
      @change="handleFileChange" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits<{
  (e: 'add-attachment', file: File): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Basic validation example
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      ElMessage.warning('文件大小不能超过10MB')
      target.value = '' // Reset
      return
    }
    
    emit('add-attachment', file)
    target.value = '' // Reset to allow selecting the same file again
  }
}
</script>

<style scoped>
.file-upload-plugin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.plugin-btn {
  border: none;
  background-color: transparent;
  color: #1c1c1c;
  font-size: 19px;
  width: 33px;
  height: 33px;
  transition: all 0.3s;
}

.plugin-btn:hover {
  background-color: #f0f2f5;
  color: #1a1a1a;
}

.hidden-input {
  display: none;
}
</style>
