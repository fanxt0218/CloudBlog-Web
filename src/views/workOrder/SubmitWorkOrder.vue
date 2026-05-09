<template>
  <div class="submit-work-order-container">
    <div class="form-card">
      <div class="header">
        <h2>问题反馈</h2>
        <p class="subtitle">您的反馈是我们进步的动力</p>
      </div>

      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-position="top"
        class="work-order-form"
      >
        <el-form-item label="反馈类型" prop="orderType">
          <el-radio-group v-model="form.orderType">
            <el-radio-button :label="1">BUG反馈</el-radio-button>
            <el-radio-button :label="2">功能建议</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="问题描述" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="6"
            placeholder="请详细描述您遇到的问题或您的建议..."
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="附件 (可选)" prop="filePath">
          <el-upload
            class="upload-demo"
            drag
            action=""
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleRemove"
            :file-list="fileList"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持单个附件，图片或文档均可
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <div class="form-footer">
          <el-button
            type="primary"
            class="submit-btn"
            :loading="submitting"
            @click="handleSubmit"
          >
            提交反馈
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import { submitWorkOrder } from '@/api/index/workOrder'
import { uploadResource } from '@/api/create/resource'
import { useUserInfoStore } from '@/stores/userInfo'

const userInfoStore = useUserInfoStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const fileList = ref<UploadFiles>([])

const form = reactive({
  orderType: 1,
  reason: '',
  filePath: ''
})

const rules = reactive<FormRules>({
  orderType: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  reason: [{ required: true, message: '请详细描述您的问题', trigger: 'blur' }]
})

const handleFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  fileList.value = uploadFiles
}

const handleRemove = () => {
  fileList.value = []
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let uploadedPath = ''
        
        // 1. 如果有文件，先上传文件
        if (fileList.value.length > 0) {
          const file = fileList.value[0].raw
          if (file) {
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await uploadResource(formData)
            if (uploadRes.code === 200) {
              uploadedPath = uploadRes.data
            } else {
              throw new Error(uploadRes.msg || '文件上传失败')
            }
          }
        }

        // 2. 提交工单
        const res = await submitWorkOrder({
          userId: userInfoStore.userId,
          orderType: form.orderType,
          reason: form.reason,
          filePath: uploadedPath,
          targetType: 0 // 业务上先不用
        })

        if (res.code === 200) {
          ElMessage.success('工单提交成功，我们会尽快处理！')
          // 重置表单
          formRef.value.resetFields()
          fileList.value = []
          // 提交成功后可以考虑延迟关闭页面或引导用户
          setTimeout(() => {
            window.close()
          }, 1500)
        } else {
          ElMessage.error(res.msg || '提交失败，请重试')
        }
      } catch (error: any) {
        console.error('Submit work order error:', error)
        ElMessage.error(error.message || '网络错误，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  document.title = '问题反馈'
})
</script>

<style scoped>
.submit-work-order-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.form-card {
  width: 100%;
  max-width: 700px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 40px;
  height: fit-content;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h2 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  font-size: 14px;
}

.work-order-form {
  margin-top: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #606266;
}

.form-footer {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.submit-btn {
  width: 200px;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
  background: linear-gradient(135deg, #409eff 0%, #1d82e6 100%);
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
}

.submit-btn:active {
  transform: translateY(0);
}

:deep(.el-radio-button__inner) {
  padding: 12px 30px;
}

:deep(.el-textarea__inner) {
  padding: 12px;
  border-radius: 8px;
}

:deep(.el-upload-dragger) {
  border-radius: 8px;
  transition: border-color 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}
</style>
