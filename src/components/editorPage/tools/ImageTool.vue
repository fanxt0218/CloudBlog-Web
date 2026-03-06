<template>
  <div class="image-tool">
    <ToolbarButton
        icon="Image"
        @click="triggerFileSelect"
        tooltip="插入图片"
    />

    <!-- 隐藏的文件输入框 -->
    <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ToolbarButton from './ToolBarButton.vue'
import type { Editor } from '@tiptap/vue-3'
import { uploadImage } from '@/api/create'

const props = defineProps<{
  editor: Editor
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    try {
      // 创建 FormData 对象用于上传
      const formData = new FormData()
      formData.append('file', file)

      // 调用上传接口
      const response = await uploadImage(formData)

      // 使用 commands.insertContent 插入图片，而不是 setImage
      // props.editor.commands.insertContent({
      //   type: 'image',
      //   attrs: {
      //     src: '/api' + response.data,
      //     align: 'left'
      //   }
      // })
      props.editor.chain().focus().insertContent({
        type: 'imageResize',
        attrs: {
          src: '/api' + response.data,
          width: 400
        }
      }).run()


      props.editor.commands.focus()
    } catch (error) {
      console.error('图片上传失败:', error)
      // 如果上传失败，使用本地预览
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        props.editor.chain().focus().insertContent({
          type: 'imageResize',
          attrs: {
            src: imageUrl,
            width: 400
          }
        }).run()
        props.editor.commands.focus()
      }
      reader.readAsDataURL(file)
    }

    // 清空input值以便下次选择同一文件也能触发change事件
    input.value = ''
  }
}
</script>

<style scoped>
.image-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-settings-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 350px;
  max-width: 90vw;
}

.image-settings-modal h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.alignment-options {
  display: flex;
  gap: 10px;
}

.alignment-options button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.alignment-options button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.size-input {
  width: 80px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: 5px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}
</style>
