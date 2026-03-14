<template>
    <div class="category-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <div class="title-content">
            <h3 class="card-title">分类专栏</h3>
            <span class="editTag" v-show="isHovered" @click="handleManageCategories">编辑</span>
        </div>
        <div class="category-list">
            <div class="category-item" v-for="item in CategoryList?.categoryInfoList || []" :key="item.categoryId" @click="jumpToCategory(item.categoryId)">
                <img :src="`/api${item.image}`" class="category-icon" alt="category icon">
                <span class="category-name">{{ item.categoryName }}</span>
                <span class="post-count">{{ item.postCount }}篇</span>
            </div>
            <div v-if="!CategoryList || CategoryList.categoryInfoList.length === 0" class="no-category">
                暂无分类信息
            </div>
        </div>

        <!-- 管理分类弹窗 -->
        <el-dialog 
            v-model="dialogVisible" 
            title="管理分类" 
            width="600px" 
            :close-on-click-modal="false"
        >
            <div class="dialog-actions">
                <el-button type="primary" @click="openAddDialog">
                    新建分类
                </el-button>
            </div>
            
            <el-table :data="CategoryList?.categoryInfoList" style="width: 100%" height="400px" empty-text="暂无分类">
                <el-table-column label="封面" width="80">
                    <template #default="{ row }">
                        <img v-if="row.image" :src="`/api${row.image}`" class="table-cover" />
                        <div v-else class="table-cover-placeholder"></div>
                    </template>
                </el-table-column>
                <el-table-column prop="categoryName" label="分类名称" width="150" show-overflow-tooltip/>
                <el-table-column prop="description" label="描述" show-overflow-tooltip/>
                <el-table-column label="操作" width="150" align="center">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
                        <el-popconfirm title="确定要删除此分类吗？" @confirm="handleDelete(row.categoryId)">
                            <template #reference>
                                <el-button link type="danger">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <!-- 编辑/新增 分类弹窗 -->
        <el-dialog
            v-model="editDialogVisible"
            :title="isEditMode ? '编辑分类' : '新建分类'"
            width="400px"
            :close-on-click-modal="false"
            append-to-body
        >
            <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
                <el-form-item label="名称" prop="categoryName">
                    <el-input v-model="formData.categoryName" placeholder="请输入分类名称" maxlength="20" show-word-limit />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="formData.description" type="textarea" placeholder="请输入分类描述" maxlength="100" show-word-limit />
                </el-form-item>
                <el-form-item label="封面图" prop="image">
                    <el-upload
                        class="category-uploader"
                        action="#"
                        :show-file-list="false"
                        :http-request="handleUpload"
                        accept="image/*"
                    >
                        <img v-if="formData.image" :src="`/api${formData.image}`" class="category-preview" />
                        <div v-else class="uploader-icon-placeholder">
                            <span class="plus-icon">+</span>
                            <span class="upload-text">点击上传</span>
                        </div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitLoading" @click="submitForm">
                        确定
                    </el-button>
                </span>
            </template>
        </el-dialog>

    </div>
</template>
<script lang="ts" setup name="UserCategory">
import { ref, onMounted } from 'vue';
import type { UserCategory } from '@/types';
import { getUserCategory, addCategory, updateCategory, deleteCategory } from '@/api/userInfo/homePage';
import { uploadImage } from '@/api/create/index';
import { useUserHomeStore } from '@/stores/userHome';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';

let CategoryList = ref<UserCategory| null>(null);
const isHovered = ref(false);

// 第一层弹窗
const dialogVisible = ref(false);

// 第二层弹窗 (新增/编辑)
const editDialogVisible = ref(false);
const isEditMode = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const formData = ref({
    categoryId: 0,
    categoryName: '',
    description: '',
    image: ''
});

const rules = {
    categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
};

const currentUserId = Number(localStorage.getItem('userId'));

const router = useRouter();

/**
 * 跳转分类专栏
 */
const jumpToCategory = (categoryId: number) => {
    // 防止点击弹窗事件传播或在管理时跳转
    if (!dialogVisible.value) {
        router.push(`/userHome/categoryList`);
    }
}

/**
 * 获取分类数据
 */
const fetchCategoryData = async () => {
    try {
        const res = (await getUserCategory(currentUserId)) as any;
        if (res.code === 200) {
            CategoryList.value = res.data;
            useUserHomeStore().categoryCount = CategoryList.value?.categoryInfoList?.length || 0;
        }
    } catch (error) {
        console.error('Failed to fetch category list', error);
    }
}

/**
 * 打开管理分类弹窗
 */
const handleManageCategories = () => {
    dialogVisible.value = true;
}

/**
 * 打开新增弹窗
 */
const openAddDialog = () => {
    isEditMode.value = false;
    formData.value = {
        categoryId: 0,
        categoryName: '',
        description: '',
        image: ''
    };
    editDialogVisible.value = true;
    if (formRef.value) formRef.value.clearValidate();
}

/**
 * 自定义上传封面图
 */
const handleUpload = async (options: any) => {
    const file = options.file;
    if (!file.type.startsWith('image/')) {
        ElMessage.error('请上传图片文件!');
        return;
    }
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    try {
        const res = (await uploadImage(uploadFormData)) as any;
        if (res.code === 200) {
            // 根据通用的后端返回值，res.data 通常就是相对路径的图片地址
            formData.value.image = res.data;
            ElMessage.success('上传封面成功');
        } else {
            ElMessage.error(res.message || '上传封面失败');
        }
    } catch (error) {
        console.error('Upload error', error);
        ElMessage.error('上传封面出错了');
    }
}

/**
 * 打开编辑弹窗
 */
const openEditDialog = (row: any) => {
    isEditMode.value = true;
    formData.value = {
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        description: row.description || '',
        image: row.image || ''
    };
    editDialogVisible.value = true;
    if (formRef.value) formRef.value.clearValidate();
}

/**
 * 删除分类
 */
const handleDelete = async (categoryId: number) => {
    try {
        const res = (await deleteCategory({ categoryId })) as any;
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchCategoryData();
        } else {
            ElMessage.error(res.message || '删除失败');
        }
    } catch (error) {
        console.error('Delete error', error);
    }
}

/**
 * 提交增改表单
 */
const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true;
            try {
                let res;
                if (isEditMode.value) {
                    res = (await updateCategory({
                        id: formData.value.categoryId,
                        categoryName: formData.value.categoryName,
                        description: formData.value.description,
                        image: formData.value.image
                    })) as any;
                } else {
                    res = (await addCategory({
                        userId: currentUserId,
                        categoryName: formData.value.categoryName,
                        categoryDesc: formData.value.description,
                        image: formData.value.image
                    })) as any;
                }
                
                if (res.code === 200) {
                    ElMessage.success(isEditMode.value ? '修改成功' : '新增成功');
                    editDialogVisible.value = false;
                    fetchCategoryData();
                } else {
                    ElMessage.error(res.message || (isEditMode.value ? '修改失败' : '新增失败'));
                }
            } catch (error) {
                console.error('Submit error:', error);
            } finally {
                submitLoading.value = false;
            }
        }
    });
}

onMounted(() => {
    fetchCategoryData();
})
</script>
<style scoped>

.category-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.4rem; /* 原6px */
    padding: 1rem; /* 原16px，用rem减少冗余内边距 */
    width: 99%; /* 关键：填满父容器（.left-section）的宽度 */
    min-height: 100%; /* 移除固定min-height，由内容撑开高度 */
    box-sizing: border-box; /* 确保padding不增加总宽度 */
}

.title-content {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
}

/* 标题样式：用相对单位，减少底部边框间距 */
.card-title {
    font-size: 1.2rem; /* 原18px */
    font-weight: 450;
    margin: 0;
}

.editTag {
    margin-left: auto;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    margin-top: 2px;
    transition: all 0.2s ease;
}

.editTag:hover {
    color: #374151;
}

.category-list {
    margin-top: 0;
}

.category-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    cursor: pointer;
    /* border-bottom: 1px dashed #e5e7eb; */
}

.category-icon {
    width: 24px;
    height: 24px;
    object-fit: cover;
    margin-right: 0.5rem;
    background-color: #f0f0f0;
}

.category-name {
    flex: 1;
    margin-right: 0.5rem;
    color: #333;
}

.category-name:hover {
    color: #000;
}

.post-count {
    color: #666;
    font-size: 15px;
}

.no-category {
    text-align: center;
    color: #999;
    font-size: 14px;
    margin-top: 1rem;
}

.dialog-actions {
  margin-bottom: 16px;
}

.table-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.table-cover-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

/* 封面上传框样式 */
.category-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}
.category-uploader:hover {
  border-color: #409eff;
}
.category-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.uploader-icon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}
.plus-icon {
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 8px;
}
.upload-text {
  font-size: 13px;
}
</style>
