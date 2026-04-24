<template>
  <el-dialog
    v-model="visible"
    title="绑定资源"
    width="800px"
    append-to-body
    class="resource-bind-dialog"
    @open="handleOpen"
  >
    <div class="dialog-content">
      <el-tabs v-model="activeTab" class="resource-tabs">
        <el-tab-pane label="上传资源" name="upload">
          <div class="upload-section">
            <el-upload
              class="resource-uploader"
              drag
              :auto-upload="true"
              :http-request="handleFileUpload"
              :show-file-list="false"
              :before-upload="beforeUpload"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                <span v-if="!form.resourceUrl">点击或拖拽上传，小于1000MB</span>
                <span v-else class="upload-success-text">文件已就绪: {{ fileName }} ({{ form.resourceSize }})</span>
              </div>
            </el-upload>

            <div class="form-container">
              <div class="form-item required">
                <div class="label">资源名称</div>
                <el-input
                  v-model="form.resourceName"
                  type="textarea"
                  :rows="2"
                  placeholder="默认博客标题"
                  maxlength="64"
                  show-word-limit
                />
              </div>

              <div class="form-item">
                <div class="label">资源描述</div>
                <el-input
                  v-model="form.resourceDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="填写描述"
                  maxlength="500"
                  show-word-limit
                />
              </div>

              <div class="form-item required">
                <div class="label">所属分类</div>
                <el-cascader
                  v-model="form.resourceType"
                  :options="cascaderOptions"
                  :props="{ emitPath: false }"
                  placeholder="请选择"
                  style="width: 100%;"
                />
              </div>

              <div class="form-item required">
                <div class="label">资源标签</div>
                <div class="tag-selector-trigger">
                  <div class="selected-tags">
                    <el-tag
                      v-for="tag in selectedTags"
                      :key="tag.id"
                      closable
                      @close="removeTag(tag)"
                      class="mr-2 mb-2"
                    >
                      {{ tag.tagName }}
                    </el-tag>
                    <el-button
                      v-if="selectedTags.length < 5"
                      size="small"
                      @click="showTagSelector = !showTagSelector"
                    >
                      + 添加标签
                    </el-button>
                  </div>
                  <div class="tag-hint">按回车 Enter 创建标签</div>
                  <div class="tag-limit-tip">可修改或添加标签，最多可添加5个标签</div>

                  <div v-if="showTagSelector" class="tag-selector-popover">
                    <TagSelector
                      :selected-tags="selectedTags"
                      @select-tag="addTag"
                      @close-selector="showTagSelector = false"
                    />
                  </div>
                </div>
              </div>

              <div class="form-item">
                <div class="label">是否公开</div>
                <el-radio-group v-model="form.resourceIsPublic">
                  <el-radio label="1">公开</el-radio>
                  <el-radio label="0">不公开</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已有资源" name="existing">
          <div class="existing-resources">
            <el-table :data="existingResources" v-loading="loadingExisting" style="width: 100%">
              <el-table-column prop="resourceName" label="资源名称" />
              <el-table-column prop="resourceFormat" label="格式" width="100" />
              <el-table-column prop="updateTime" label="最后修改" width="180" />
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button link type="primary" @click="useExisting(scope.row)">选择</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" class="submit-btn" @click="handleSubmit" :loading="submitting">提 交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TagSelector from './TagSelector.vue'
import type { Tag } from '@/types'
import { uploadResource, upload, getResourceList, editResource, getResourceCategory } from '@/api/create/resource'
import { useResourceContext } from '@/utils/editor/useResourceContext'

const props = defineProps<{
  modelValue: boolean
  contentId?: number | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const { setPendingResource, isResourceChanged, markAsChanged } = useResourceContext()

const activeTab = ref('upload')
const submitting = ref(false)
const showTagSelector = ref(false)
const selectedTags = ref<Tag[]>([])
const fileName = ref('')
const existingResources = ref([])
const loadingExisting = ref(false)
const categoryOptions = ref<Record<string, string[]>>({})

const cascaderOptions = computed(() => {
  return Object.entries(categoryOptions.value).map(([mainCategory, subCategories]) => ({
    value: mainCategory,
    label: mainCategory,
    children: subCategories.map(sub => ({
      value: sub,
      label: sub
    }))
  }))
})
const resourceId = ref<number | null>(null)
const hasNewFile = ref(false)

const userId = localStorage.getItem('userId')

const form = reactive({
  resourceName: '',
  resourceUrl: '',
  resourceSize: '',
  resourceType: '',
  resourceFormat: '',
  resourceDescription: '',
  resourceTags: '',
  resourceCreator: userId || '',
  resourceIsPublic: '1',
  resourceBindContentId: '',
  resourceBindContentTyp: '0'
})

const handleOpen = () => {
    hasNewFile.value = false
    console.log('props.contentId',props.contentId)
    if (props.contentId) {
        fetchExisting()
    }
}

onMounted(async () => {
  try {
    const res = await getResourceCategory()
    categoryOptions.value = res.data || {}
  } catch (error) {
    console.error('获取资源分类失败', error)
  }
})

const fetchExisting = async () => {
    loadingExisting.value = true
    try {
        console.log('准备查询文章绑定资源')
        const res = await getResourceList({ contentId: props.contentId as number })
        existingResources.value = res.data || []
        
        // 如果有已有资源，自动回显第一个
        if (existingResources.value.length > 0) {
            const firstResource = existingResources.value[0]
            useExisting(firstResource)
            // 回显后重置修改状态，因为这不属于用户的操作
            isResourceChanged.value = false 
        }
    } catch (error) {
        console.error('获取资源列表失败', error)
    } finally {
        loadingExisting.value = false
    }
}

const beforeUpload = (file: File) => {
  const isLt1000M = file.size / 1024 / 1024 < 1000
  if (!isLt1000M) {
    ElMessage.error('上传资源大小不能超过 1000MB!')
  }
  return isLt1000M
}

const handleFileUpload = async (options: any) => {
  const { file } = options
  const formData = new FormData()
  formData.append('file', file)

  let fileSize = (file.size / 1024 / 1024).toFixed(2)
  if (Number(fileSize) < 1.0) {
    fileSize = (file.size / 1024).toFixed(2) + 'KB'
  } else {
    fileSize = fileSize + 'MB'
  }

  try {
    const res = await uploadResource(formData)
    form.resourceUrl = res.data // 假设返回的是url
    form.resourceSize = fileSize
    form.resourceFormat = file.name.split('.').pop() || ''
    fileName.value = file.name
    hasNewFile.value = true // 标记为重新上传了文件
    if (!form.resourceName) {
        form.resourceName = file.name.replace(/\.[^/.]+$/, "")
    }
    ElMessage.success('文件上传成功')
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  }
}

const addTag = (tag: Tag) => {
  if (selectedTags.value.length < 5 && !selectedTags.value.find(t => t.id === tag.id)) {
    selectedTags.value.push(tag)
  }
}

const removeTag = (tag: Tag) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id)
}

const useExisting = (resource: any) => {
    Object.assign(form, {
        resourceName: resource.resourceName,
        resourceUrl: resource.resourceUrl,
        resourceSize: resource.resourceSize,
        resourceType: String(resource.resourceType || ''),
        resourceFormat: resource.resourceFormat,
        resourceDescription: resource.resourceDescription,
        resourceIsPublic: String(resource.resourceIsPublic ?? '1'),
    })
    
    // 资源回显时，设置文件名
    if (resource.resourceUrl) {
        const parts = resource.resourceUrl.split('/')
        fileName.value = parts[parts.length - 1]
    }

    // 标签回显处理
    if (resource.resourceTags) {
        const tagsStr = resource.resourceTags as string
        selectedTags.value = tagsStr.split(',').filter(t => t).map((tagName, index) => ({
            id: -(index + 1), // 临时 ID，防止重复且避免与正 ID 冲突
            tagName: tagName
        })) as any
    } else {
        selectedTags.value = []
    }
    
    activeTab.value = 'upload'
    resourceId.value = resource.id || null
    isResourceChanged.value = true // 手动选择时标记为已修改
}

const handleSubmit = async () => {
  if (!form.resourceUrl) {
    ElMessage.warning('请先上传资源文件')
    return
  }
  if (!form.resourceName.trim()) {
    ElMessage.warning('资源名称为必填项')
    return
  }

  form.resourceTags = selectedTags.value.map(t => t.tagName).join(',')
  form.resourceBindContentId = props.contentId ? String(props.contentId) : ''

  if (props.contentId) {
    // 已经有文章ID，直接调用绑定/修改接口
    submitting.value = true
    try {
      if (hasNewFile.value) {
        // 重新上传了资源，认定为新资源，触发新增接口
        await upload({ ...form })
        ElMessage.success('资源重新绑定成功')
      } else if (resourceId.value) {
        // 仅修改相关信息，触发修改接口
        await editResource({ ...form, id: resourceId.value })
        ElMessage.success('资源信息修改成功')
      } else {
        // 兜底：既没有新文件也没有旧ID，按新增处理
        await upload({ ...form })
        ElMessage.success('资源绑定成功')
      }
      markAsChanged()
      visible.value = false
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  } else {
    // 没有文章ID，存入 pending，标志位一起存入
    setPendingResource({ ...form, id: resourceId.value || undefined, hasNewFile: hasNewFile.value })
    ElMessage.success('资源信息已保存，将在文章发布后自动处理')
    visible.value = false
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 0 10px;
}

.resource-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.resource-tabs :deep(.el-tabs__active-bar) {
  background-color: #fc5531;
}

.resource-tabs :deep(.el-tabs__item.is-active) {
  color: #fc5531;
}

.resource-tabs :deep(.el-tabs__content),
.resource-tabs :deep(.el-tab-pane) {
  overflow: visible;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 10px;
}

.resource-uploader :deep(.el-upload-dragger) {
  border: 1px dashed #dcdfe6;
  background-color: #f8f9fa;
  padding: 30px;
}

.upload-success-text {
    color: #409eff;
    font-weight: bold;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item .label {
  font-size: 14px;
  color: #606266;
  position: relative;
}

.form-item.required .label::before {
  content: '*';
  color: #fc5531;
  margin-right: 4px;
  position: absolute;
  left: -12px;
}

.tag-selector-trigger {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  position: relative;
  min-height: 40px;
}

.tag-hint {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.tag-limit-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.tag-selector-popover {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  z-index: 2000; /* 提高层级 */
  width: 520px; /* 增加宽度以适应 TagSelector content */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-bottom: 10px;
}

.submit-btn {
  background-color: #fc5531;
  border-color: #fc5531;
}

.submit-btn:hover {
  background-color: #e64a19;
  border-color: #e64a19;
}

.mr-2 { margin-right: 8px; }
.mb-2 { margin-bottom: 8px; }

:deep(.el-textarea__inner) {
    background-color: #f8f9fa;
}
</style>
