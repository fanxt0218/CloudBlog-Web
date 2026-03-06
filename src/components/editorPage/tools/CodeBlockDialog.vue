<template>
  <el-dialog
    v-model="visible"
    width="650px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
  >
    <!-- 遮罩 -->
    <div class="mask" @click="close"></div>

    <!-- 弹窗 -->
    <div class="dialog">
      <div class="header">
        <span>插入代码</span>
        <button class="close" @click="close">✕</button>
      </div>

      <!-- 美化代码输入器 -->
      <textarea
        v-model="code"
        class="code-editor"
        placeholder="在此输入代码..."
      ></textarea>

      <div class="footer">
        <button class="btn cancel" @click="close">取消</button>
        <button class="btn ok" @click="confirm">确定</button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts" name="CodeBlockDialog">
import { ref, watch } from 'vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const code = ref('')

watch(() => props.modelValue, v => visible.value = v)

const close = () => emit('update:modelValue', false)

const confirm = () => {
  emit('confirm', code.value)
  emit('update:modelValue', false)
  code.value = ''
}
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  animation: fade .2s;
  z-index: 999999;
}

.dialog {
  width: 650px;
  background: #fff;
  border-radius: 8px; /* 减小边框圆角 */
  padding: 12px; /* 减小弹窗内边距 */
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  animation: pop .22s ease-out;
  z-index: 999999;
  box-sizing: border-box; /* 确保边框和内边距包含在宽度内 */
}

.header {
  display: flex;
  justify-content: space-between;
  font-size: 16px; /* 减小标题字体大小 */
  font-weight: bold;
  margin-bottom: 10px; /* 减小标题与代码编辑器的间距 */
}

.close {
  border: none;
  background: transparent;
  font-size: 18px; /* 减小关闭按钮大小 */
  cursor: pointer;
  padding: 0; /* 移除关闭按钮内边距 */
  width: 24px; /* 设置固定宽度 */
  height: 24px; /* 设置固定高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-editor {
  width: 100%;
  min-height: 220px;
  max-height: 400px;
  padding: 12px; /* 减小代码编辑器内边距 */
  font-family: Consolas, monospace;
  font-size: 14px; /* 调整字体大小 */
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px; /* 减小边框圆角 */
  border: 1px solid #333;
  outline: none;
  resize: vertical;
  white-space: pre;
  box-sizing: border-box; /* 确保内边距包含在宽度内 */
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px; /* 减小按钮间距 */
  margin-top: 12px; /* 减小代码编辑器与按钮的间距 */
}

.btn {
  padding: 6px 14px; /* 减小按钮内边距 */
  border-radius: 12px; /* 减小按钮圆角 */
  border: none;
  cursor: pointer;
  font-size: 14px; /* 调整按钮字体大小 */
}

.cancel {
  background: #e5e7eb;
}

.ok {
  background: #f68c3b;
  color: #fff;
}

@keyframes fade {
  from { opacity: 0 } to { opacity: 1 }
}

@keyframes pop {
  from { transform: translateX(-50%) scale(.8) }
  to { transform: translateX(-50%) scale(1) }
}
</style>