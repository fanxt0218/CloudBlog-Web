<template>
    <div class="resource-list-container">
        <div class="resource-list">
            <div class="resource-item" v-for="item in resourceList" :key="item.id">
                <div class="item-content">
                    <!-- 资源名称 -->
                    <div class="resource-name" @click="handleJumpToDetail(item)">
                        {{ item.resourceName }}
                    </div>
                    
                    <!-- 元数据信息 -->
                    <div class="resource-meta">
                        <span class="meta-item">{{ formatTime(item.resourceCreateTime) }} 发布</span>
                        <span class="meta-divider">·</span>
                        <span class="meta-item">{{ item.resourceFormat }}</span>
                        <span class="meta-divider">·</span>
                        <span class="meta-item">{{ item.resourceSize }}</span>
                        <span class="meta-divider">·</span>
                        <span class="meta-item">{{ item.downloadCount || 0 }} 下载</span>
                    </div>
                </div>

                <!-- 操作区域 -->
                <div class="item-action">
                    <span class="edit-btn" @click="handleEdit(item)">编辑</span>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="resourceList.length === 0" class="no-data">
                <el-empty :image-size="120" description="这里还没有资源哦~" />
            </div>
        </div>

        <!-- 编辑资源弹窗 -->
        <el-dialog
            v-model="editDialogVisible"
            title="编辑资源信息"
            width="550px"
            destroy-on-close
            append-to-body
            class="resource-edit-dialog"
        >
            <el-form :model="editForm" label-width="100px" label-position="right">
                <el-form-item label="资源名称" required>
                    <el-input v-model="editForm.resourceName" placeholder="请输入标题" />
                </el-form-item>
                
                <el-form-item label="资源文件">
                    <div class="file-uploader-box">
                        <div v-if="!fileChanged" class="current-file-info">
                            <span class="filename" title="当前文件">{{ editForm.resourceName }}.{{ editForm.resourceFormat || 'file' }}</span>
                            <el-upload
                                action=""
                                :auto-upload="false"
                                :show-file-list="false"
                                :on-change="handleFileChange"
                            >
                                <el-button type="primary" link>更换素材</el-button>
                            </el-upload>
                        </div>
                        <div v-else class="new-file-info">
                            <el-tag type="success" closable @close="cancelFileChange">
                                已选择新文件: {{ (editForm.resourceFormat || '').toUpperCase() }} ({{ editForm.resourceSize }})
                            </el-tag>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="资源简介">
                    <el-input 
                        v-model="editForm.resourceDescription" 
                        type="textarea" 
                        :rows="3" 
                        placeholder="请输入资源的详细描述..."
                    />
                </el-form-item>

                <el-form-item label="资源分类">
                    <el-cascader
                      v-model="editForm.resourceType"
                      :options="cascaderOptions"
                      :props="{ emitPath: false }"
                      placeholder="请选择"
                      style="width: 100%;"
                    />
                </el-form-item>

                <el-form-item label="资源标签" class="required">
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
                </el-form-item>

                <el-form-item label="权限设置">
                    <div class="form-row">
                        <span class="row-label">公开展示：</span>
                        <el-radio-group v-model="editForm.resourceIsPublic">
                            <el-radio :label="1">公开</el-radio>
                            <el-radio :label="0">私有</el-radio>
                        </el-radio-group>
                    </div>
                </el-form-item>
                <el-form-item>
                    <div class="form-row" style="margin-top: 10px;">
                        <span class="row-label">VIP 专享：</span>
                        <el-radio-group v-model="editForm.vipResource">
                            <el-radio :label="1">是</el-radio>
                            <el-radio :label="0">否</el-radio>
                        </el-radio-group>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitting" @click="submitEdit">
                        保存修改
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup name="ResourceList">
import { ref, onMounted, reactive, computed } from 'vue'
import { useUserHomeStore } from '@/stores/userHome'
import { useUserInfoStore } from '@/stores/userInfo'
import { getResourceList, getResourceCategory, editResource, uploadResource } from '@/api/create/resource'
import type { Resource, Tag } from '@/types/index'
import { ElMessage, ElLoading } from 'element-plus'
import TagSelector from '@/components/editorPage/tools/TagSelector.vue'

let userInfoStore = useUserInfoStore()
let userHomeStore = useUserHomeStore()

let resourceList = ref<Resource[]>([])
let categories = ref<any[]>([])

const selectedTags = ref<Tag[]>([])
const showTagSelector = ref(false)

// 编辑相关状态
const editDialogVisible = ref(false)
const submitting = ref(false)
const fileChanged = ref(false)
let currentItem = ref<Resource | null>(null)

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

const editForm = reactive({
    resourceName: '',
    resourceDescription: '',
    resourceType: '',
    resourceTags: '',
    resourceIsPublic: 1,
    vipResource: 0,
    resourceUrl: '',
    resourceSize: '',
    resourceFormat: ''
})

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.split(' ')[0];
}

/**
 * 获取文章资源列表
 */
const fetchResourceList = () => {
    getResourceList({
        userId: userInfoStore.userId
    }).then((res: any) => {
        if (res.code === 200) {
            const data = res.data;
            if (Array.isArray(data)) {
                resourceList.value = data;
                userHomeStore.resourceCount = data.length;
            } else if (data.list) {
                resourceList.value = data.list;
                userHomeStore.resourceCount = data.total || data.list.length;
            }

        }
    })
}

/**
 * 处理编辑点击
 */
const handleEdit = (item: Resource) => {
    console.log('Edit clicked for item:', item);
    if (!item) return;

    currentItem.value = item;
    fileChanged.value = false;
    
    // 回显数据
    try {
        editForm.resourceName = item.resourceName || '';
        editForm.resourceDescription = item.resourceDescription || '';
        editForm.resourceType = item.resourceType?.toString() || '';
        editForm.resourceTags = item.resourceTags || '';
        editForm.resourceIsPublic = item.resourceIsPublic ?? 1;
        editForm.vipResource = item.vipResource ?? 0;
        editForm.resourceUrl = item.resourceUrl || '';
        editForm.resourceSize = item.resourceSize || '';
        editForm.resourceFormat = item.resourceFormat || '';
        
        editDialogVisible.value = true;

        // 标签回显处理
        if (item.resourceTags) {
            const tagsStr = item.resourceTags as string
            selectedTags.value = tagsStr.split(',').filter(t => t).map((tagName, index) => ({
                id: -(index + 1), // 临时 ID，防止重复且避免与正 ID 冲突
                tagName: tagName
            })) as any
        } else {
            selectedTags.value = []
        }
    } catch (e) {
        console.error('Error in handleEdit:', e);
        ElMessage.error('无法打开编辑窗口');
    }
}

/**
 * 处理文件更换
 */
const handleFileChange = async (file: any) => {
    const rawFile = file.raw;
    if (!rawFile) return;

    const loading = ElLoading.service({
        target: '.resource-edit-dialog',
        text: '正在上传新资源...'
    });

    try {
        const formData = new FormData();
        formData.append('file', rawFile);
        
        const res: any = await uploadResource(formData);
        if (res.code === 200) {
            editForm.resourceUrl = res.data.url;
            editForm.resourceSize = res.data.size;
            editForm.resourceFormat = res.data.format;
            fileChanged.value = true;
            ElMessage.success('新资源已就绪');
        }
    } catch (err) {
        console.error('更换资源失败:', err);
        ElMessage.error('资源上传失败');
    } finally {
        loading.close();
    }
}

/**
 * 撤销文件更换
 */
const cancelFileChange = () => {
    if (!currentItem.value) return;
    editForm.resourceUrl = currentItem.value.resourceUrl;
    editForm.resourceSize = currentItem.value.resourceSize;
    editForm.resourceFormat = currentItem.value.resourceFormat;
    fileChanged.value = false;
}

/**
 * 提交修改
 */
const submitEdit = async () => {
    if (!currentItem.value) return;
    if (!editForm.resourceName.trim()) {
        ElMessage.warning('资源名称不能为空');
        return;
    }

    submitting.value = true;
    try {
        const params = {
            id: currentItem.value.id,
            resourceName: editForm.resourceName,
            resourceDescription: editForm.resourceDescription,
            resourceType: editForm.resourceType,
            resourceTags: editForm.resourceTags,
            resourceIsPublic: editForm.resourceIsPublic.toString(),
            vipResource: editForm.vipResource,
            // 使用新上传或原有的资源信息
            resourceUrl: editForm.resourceUrl,
            resourceSize: editForm.resourceSize,
            resourceFormat: editForm.resourceFormat,
            resourceCreator: currentItem.value.resourceCreator.toString(),
            resourceBindContentId: currentItem.value.resourceBindContentId?.toString() || '',
            resourceBindContentTyp: currentItem.value.resourceBindContentType?.toString() || ''
        }
        
        const res: any = await editResource(params as any);
        if (res.code === 200) {
            ElMessage.success('修改成功');
            editDialogVisible.value = false;
            fetchResourceList(); // 刷新列表
        }
    } catch (err) {
        console.error('修改资源失败:', err);
    } finally {
        submitting.value = false;
    }
}

/**
 * 跳转详情
 */
const handleJumpToDetail = (item: Resource) => {
    console.log('跳转详情:', item.id);
}

const removeTag = (tag: Tag) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id)
}

const addTag = (tag: Tag) => {
  if (selectedTags.value.length < 5 && !selectedTags.value.find(t => t.id === tag.id)) {
    selectedTags.value.push(tag)
  }
}

onMounted(() => {
    fetchResourceList();
    // 获取分类列表用于下拉框
    getResourceCategory().then((res: any) => {
        if (res.code === 200) {
            categories.value = res.data;
            categoryOptions.value = res.data || {}
        }
    })
})
</script>

<style scoped>
.resource-list-container {
    padding: 0 10px;
}

.resource-list {
    margin-bottom: 20px;
}

.resource-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
    border-bottom: 1px solid #f2f2f2;
}

.resource-item:last-child {
    border-bottom: none;
}

.item-content {
    flex: 1;
    min-width: 0;
}

.resource-name {
    font-size: 17px;
    color: #333;
    margin-bottom: 14px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    transition: color 0.2s;
}

.resource-name:hover {
    color: #409eff;
}

.resource-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #7a7a7a;
    letter-spacing: 0.3px;
    font-family: PingFang SC, Hiragino Sans GB, Arial, Microsoft YaHei, Verdana, Roboto, Noto, Helvetica Neue, sans-serif;
}

.meta-divider {
    color: #5a5a5a;
    font-weight: bold;
}

.item-action {
    margin-right: 15px;
    flex-shrink: 0;
}

.edit-btn {
    color: #555;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s;
}

.edit-btn:hover {
    color: #409eff;
}

.no-data {
    padding: 60px 0;
}

/* 编辑弹窗样式 */
.file-uploader-box {
    width: 100%;
    padding: 10px;
    background-color: #f9f9f9;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
}

.current-file-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.filename {
    flex: 1;
    font-size: 13px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.form-row {
    display: flex;
    align-items: center;
}

.row-label {
    width: 80px;
    color: #606266;
    font-size: 13px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* .form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
} */

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
  min-height: 30px;
  width: 100%;
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
  max-height: 350px;
  overflow-y: auto;
}

.mr-2 { margin-right: 8px; }
.mb-2 { margin-bottom: 8px; }
</style>