<template>
  <el-dialog
    v-model="visible"
    title="举报内容"
    width="500px"
    @closed="handleClosed"
    append-to-body
    :z-index="zIndex"
  >
    <div class="report-container">
      <div class="content-info">
        <span class="label">举报内容：</span>
        <span class="title">{{ title }}</span>
      </div>

      <el-form :model="form" :rules="rules" ref="reportFormRef" label-position="top">
        <el-form-item label="举报理由" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            placeholder="请输入举报理由（必填，限制255字符）"
            :maxlength="255"
            show-word-limit
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="相关图片（可选）" prop="filePath">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            list-type="picture-card"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持上传一张图片作为附件（可选）
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="submitReport">
          提交举报
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="ContentReport">
import { ref, reactive } from 'vue';
import { ElMessage, type FormInstance, type UploadFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { reportContent } from '@/api/index/workOrder';
import { uploadImage } from '@/api/create/index';

const props = defineProps<{
  targetId: number;
  targetType: number; // 0 为文章，1 为动态
  title: string;
  zIndex?: number;
}>();

const visible = ref(false);
const submitting = ref(false);
const reportFormRef = ref<FormInstance>();
const fileList = ref<any[]>([]);

const form = reactive({
  reason: '',
  filePath: ''
});

const rules = {
  reason: [
    { required: true, message: '请输入举报理由', trigger: 'blur' },
    { max: 255, message: '理由长度不能超过255个字符', trigger: 'blur' }
  ]
};

// 重置并清理
const handleClosed = () => {
  form.reason = '';
  form.filePath = '';
  fileList.value = [];
  reportFormRef.value?.resetFields();
};

const handleFileChange = (file: UploadFile) => {
  fileList.value = [file];
};

const handleFileRemove = () => {
  fileList.value = [];
};

const handleExceed = () => {
  ElMessage.warning('只能上传一张图片');
};

const submitReport = async () => {
  if (!reportFormRef.value) return;

  await reportFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        // 1. 如果有图片，先上传图片
        if (fileList.value.length > 0 && fileList.value[0].raw) {
          const formData = new FormData();
          formData.append('file', fileList.value[0].raw); // 通常后端接口文件字段名为 file 或 image
          const uploadRes: any = await uploadImage(formData);
          // 假设 uploadImage 返回 {code: 200, data: 'url'}
          if (uploadRes.code === 200) {
            form.filePath = uploadRes.data;
          } else {
            ElMessage.error(uploadRes.msg || '图片上传失败');
            submitting.value = false;
            return;
          }
        }

        // 2. 提交举报
        const res: any = await reportContent({
          targetId: props.targetId,
          targetType: props.targetType,
          reason: form.reason,
          filePath: form.filePath || undefined
        });

        // 接口返回值data有工单号，根据这个判断是否成功
        if (res.code === 200 && res.data) {
          ElMessage.success(`举报成功，工单号：${res.data}`);
          visible.value = false;
        } else {
          ElMessage.error(res.msg || '举报失败');
        }
      } catch (error: any) {
        console.error('举报提交出错:', error);
        ElMessage.error(error.message || '系统繁忙，请稍后再试');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 暴露方法给父组件
const open = () => {
  visible.value = true;
};

defineExpose({
  open
});
</script>

<style scoped>
.report-container {
  padding: 10px 5px;
}
.content-info {
  margin-bottom: 24px;
  background-color: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  border: 1px solid var(--el-border-color-lighter);
}
.content-info .label {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  font-weight: 600;
  margin-right: 8px;
}
.content-info .title {
  color: var(--el-text-color-primary);
  word-break: break-all;
  font-size: 15px;
  line-height: 1.4;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
}
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}
</style>
