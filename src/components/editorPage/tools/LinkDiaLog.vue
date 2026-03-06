<template>
  <div class="link-dialog-container">
    <el-dialog
      v-model="visible"
      title="插入链接"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-item">
        <label class="form-label">链接文本</label>
        <el-input
          v-model="linkText"
          :disabled="hasSelection"
          placeholder="请输入链接文本"
          ref="textInputRef"
        />
      </div>
      <div class="form-item">
        <label class="form-label">链接地址</label>
        <el-input
          v-model="linkUrl"
          placeholder="https://"
          ref="urlInputRef"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="confirm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="LinkDialog">
import { ref, watch, nextTick } from 'vue'
import { ElDialog, ElButton, ElInput } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  selectedText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const linkText = ref('')
const linkUrl = ref('')
const hasSelection = ref(false)

// 输入框引用
const textInputRef = ref<InstanceType<typeof ElInput>>()
const urlInputRef = ref<InstanceType<typeof ElInput>>()

// 监听props变化
watch(() => props.modelValue, async (val) => {
  visible.value = val
  if (val) {
    // 弹窗打开时初始化数据
    hasSelection.value = !!props.selectedText
    linkText.value = props.selectedText || ''
    linkUrl.value = ''
    
    // 等待DOM更新后再聚焦
    await nextTick()
    
    // 如果有选中文本，则聚焦到URL输入框；否则聚焦到文本输入框
    if (hasSelection.value) {
      urlInputRef.value?.$el.querySelector('input').focus()
    } else {
      textInputRef.value?.$el.querySelector('input').focus()
    }
  }
})

// 监听visible变化同步给父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
})

const close = () => {
  visible.value = false
}

const confirm = () => {
  if (!linkUrl.value.trim()) {
    alert('请输入链接地址')
    return
  }
  
  // 验证URL格式
  try {
    new URL(linkUrl.value.startsWith('http') ? linkUrl.value : `https://${linkUrl.value}`)
  } catch (e) {
    alert('请输入有效的链接地址')
    return
  }
  
  emit('confirm', {
    text: linkText.value,
    url: linkUrl.value.startsWith('http') ? linkUrl.value : `https://${linkUrl.value}`
  })
  close()
}
</script>

<style scoped>
.link-dialog-container {
    border-radius: 16px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>