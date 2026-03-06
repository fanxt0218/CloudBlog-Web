<template>
  <div class="plugin-preview">
    <div v-for="(file, index) in attachments" :key="index" class="attachment-card">
      <div class="attachment-content">
        <!-- Image Preview -->
        <div v-if="isImage(file)" class="image-thumbnail">
          <img :src="getObjectUrl(file)" alt="preview" />
        </div>
        <!-- Generic File Icon -->
        <div v-else class="file-icon">
          <el-icon><Document /></el-icon>
        </div>
        
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatSize(file.size) }}</span>
        </div>
      </div>
      
      <div class="remove-btn" @click="$emit('remove-attachment', index)">
        <el-icon><Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Close } from '@element-plus/icons-vue'

defineProps<{
  attachments: File[]
}>()

defineEmits<{
  (e: 'remove-attachment', index: number): void
}>()

const isImage = (file: File) => {
  return file.type.startsWith('image/')
}

const getObjectUrl = (file: File) => {
  return URL.createObjectURL(file)
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.plugin-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 15px 0; /* Top padding to separate from input top border/spacing */
  width: 100%;
}

.attachment-card {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 12px;
  padding: 8px 12px;
  max-width: 260px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.attachment-card:hover {
  border-color: #edecec;
  background-color: #e8e7e79b;
}

.attachment-content {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.image-thumbnail {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #e6e8eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  flex-shrink: 0;
}

.file-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-name {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: #909399;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background-color: #909399;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  opacity: 0;
  transition: all 0.2s;
}

.attachment-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background-color: #f56c6c;
  transform: scale(1.1);
}
</style>
