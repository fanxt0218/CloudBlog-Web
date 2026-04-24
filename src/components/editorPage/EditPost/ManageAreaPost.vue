d:\CloudBlog-Web\src\components\editorPage\ManageArea.vue
<template>
  <div class="manage-area">
    <div class="item-line">
      <span class="item-text">
        选择标签
      </span>
      <div class="item-right">
        <div v-for="tag in tags" :key="tag.id" class="selected-tags">
          {{ tag.tagName }}
          <span class="remove-tag-btn" @click.stop="removeTag(tag.id)">×</span>
        </div>
        <span class="tag-selector-btn" @click="isShowTagSelector = !isShowTagSelector">＋&nbsp;添加文章标签</span>
      </div>
    </div>
    <div class="tag-selector-wrapper" v-if="isShowTagSelector">
      <TagSelector
        @select-tag="selectTag"
        @close-selector="closeSelector"
        class="tag-selector-com"
        :selected-tags="tags"
      >
      </TagSelector>
    </div>
    <div class="item-line">
      <span class="item-text">
        添加封面
      </span>
      <div class="item-right">
          <el-upload
            ref="uploadRef"
            class="cover-uploader"
            :limit="1"
            :show-file-list="false"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
            :on-exceed="handleExceed"
          >
            <div v-if="!coverUrl" class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <span>上传封面</span>
            </div>
          
            <div v-else class="cover-preview">
              <img :src="`/api${coverUrl}`" />
              <div class="cover-mask">
                <el-icon @click.stop="previewCover"><ZoomIn /></el-icon>
                <el-icon @click.stop="removeCover"><Delete /></el-icon>
              </div>
            </div>
          </el-upload>
      </div>
    </div>

    <!-- 预览 -->
    <el-dialog v-model="previewVisible" width="40%" append-to-body>
      <img :src="`/api${coverUrl}`" style="width: 100%" />
    </el-dialog>

    <div class="item-line">
      <span class="item-text">
        文章摘要
      </span>
      <div class="item-right">
          <el-input
            v-model="abstract"
            style="width: 710px"
            :autosize="{minRows:2,maxRows:6}"
            maxlength="256"
            show-word-limit="true"
            word-limit-position="inside"
            type="textarea"
            placeholder="摘要:帮助读者快速了解文章内容"
          />
      </div>
    </div>
    <div 
      class="ai-auto-abstract" 
      :class="{ 'is-loading': isSummarizing }"
      @click="!isSummarizing && aiSumarry()"
    >
      <svg v-if="!isSummarizing" t="1767967603029" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8587" width="19" height="19">
        <path d="M362.8 553.9c23.5 0 42.6-19.1 42.6-42.6V213.4c0-46.9 38.2-85.1 85.1-85.1s85.1 38.2 85.1 85.1V245c0 23.5 19 42.6 42.6 42.6 23.5 0 42.6-19.1 42.6-42.6v-31.5c0-93.9-76.3-170.2-170.2-170.2s-170.2 76.4-170.2 170.2v297.9c-0.2 23.5 18.8 42.5 42.4 42.5zM660.7 468.8c-23.5 0-42.6 19.1-42.6 42.6v297.9c0 46.9-38.2 85.1-85.1 85.1s-85.1-38.2-85.1-85.1v-31.5c0-23.5-19-42.6-42.6-42.6-23.5 0-42.6 19.1-42.6 42.6v31.5c0 93.9 76.3 170.2 170.2 170.2s170.2-76.4 170.2-170.2V511.4c0.1-23.5-18.9-42.6-42.4-42.6z" fill="#0066FF" p-id="8588"></path><path d="M809.6 319.8H511.7c-23.5 0-42.6 19.1-42.6 42.6s19 42.6 42.6 42.6h297.9c46.9 0 85.1 38.2 85.1 85.1s-38.2 85.1-85.1 85.1h-31.5c-23.5 0-42.6 19.1-42.6 42.6s19 42.6 42.6 42.6h31.5c93.9 0 170.2-76.4 170.2-170.2s-76.3-170.4-170.2-170.4zM554.3 660.3c0-23.5-19-42.6-42.6-42.6H213.8c-46.9 0-85.1-38.2-85.1-85.1s38.2-85.1 85.1-85.1h31.5c23.5 0 42.6-19.1 42.6-42.6s-19-42.6-42.6-42.6h-31.5c-93.9 0-170.2 76.4-170.2 170.2s76.3 170.2 170.2 170.2h297.9c23.5 0.2 42.6-18.9 42.6-42.4z" fill="#0066FF" p-id="8589"></path>
      </svg>
      <div v-else class="loading-spinner"></div>
      {{ isSummarizing ? '正在提取摘要...' : 'AI自动提取摘要' }}
    </div>
    <div class="item-line">
      <span class="item-text">
        分类专栏
      </span>
      <div class="item-right">
        <el-select
          v-model="selectedCategoryId"
          multiple="true"
          multiple-limit="1"
          placeholder="请选择文章分类"
          style="width: 240px"
        >
          <el-option
            v-for="item in categories"
            :key="item.categoryId"
            :label="item.categoryName"
            :value="item.categoryId"
          />
        </el-select>
      </div>
    </div>
    <div class="item-line">
      <span class="item-text">
        文章类型
      </span>
      <div class="item-right">
          <el-radio v-model="contentType" value="0">文章/博客</el-radio>
          <el-radio v-model="contentType" value="1">
            资讯
          </el-radio>
      </div>
    </div>
    <div class="item-line">
      <span class="item-text">
        可见范围
      </span>
      <div class="item-right">
          <el-radio v-model="visibilityScope" value="0">公开</el-radio>
          <el-radio v-model="visibilityScope" value="1">
            仅自己可见
          </el-radio>
          <el-radio v-model="visibilityScope" value="2">
            粉丝可见
          </el-radio>
      </div>
    </div>
    <div class="item-line">
      <span class="item-text">
        限制VIP可读
      </span>
      <div class="item-right">
        <el-checkbox v-model="isLimitVipRead" value="1" name="type">
        </el-checkbox>
      </div>
    </div>
    <div class="foot-area">
      <!-- <div class="action-item save-draft" @click="saveHtmlDraft" :disabled="!editor">保存草稿</div> -->
      <div class="action-item publish"  @click="saveAsHtml" :disabled="!editor">发布</div>
    </div>
  </div>
</template>
<script setup lang="ts" name="ManageArea">
import { ElMessage, genFileId } from 'element-plus'
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Tag } from '@/types'
import { uploadImage, publishPost, saveDraft } from '@/api/create';
import { upload as uploadResource, editResource } from '@/api/create/resource';
import { getPostViewPage } from '@/api/index/viewPage';
import TagSelector from '../tools/TagSelector.vue';
import { getUserCategory } from '@/api/userInfo/homePage';
import type { UserCategoryItem, PostView } from '@/types/index';
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue'
import type { UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { summaryAbstract } from '@/api/ai';
import { useRouter } from 'vue-router';
import { useResourceContext } from '@/utils/editor/useResourceContext';

const { pendingResource, isResourceChanged, clearPendingResource } = useResourceContext();

const router = useRouter();

// 用户id
const userId = ref<number>(Number(localStorage.getItem('userId')));
// 接收编辑器实例作为props
const props = defineProps<{
  editor?: any,
  title?: string,
  selectedDraftId?: number | null,
  postId?: number | null,
}>()

// 文章标题
const title = ref('')

// 文章内容
const content = ref('')

// 文章标签
const tags = ref<Tag[]>([])
// 标签选择器
let isShowTagSelector = ref(false)

// 文件上传
const uploadRef = ref<UploadInstance>()
const coverUrl = ref<string>('')
const previewVisible = ref(false)

// 文章摘要
const abstract = ref('')

// 分类专栏
const selectedCategoryId = ref<number[]>([])
let categories = ref<UserCategoryItem[]>([])

// 文章类型
const contentType = ref("0")

// 可见范围
const visibilityScope = ref("0")

// AI 提取状态
const isSummarizing = ref(false)

// 是否限制VIP可读
const isLimitVipRead = ref(false)

// 是否是草稿
const isDraft = ref(false)
// 草稿id
const draftId = ref<number>(0)


// 保存为HTML文件的功能
const saveAsHtml = async() => {
  if (!props.editor) {
    ElMessage.error('编辑器未准备好')
    return
  }

  if(!validateParams()){
    return
  }
  // 获取编辑器内容的HTML格式
  const htmlContent = props.editor.getHTML()
  // 获取标题
  title.value = props.title || `文章-${new Date().getTime()}`
  // 创建完整的HTML页面(读取外部模板文件)
  const response = await fetch('/external-html.html') // 修改路径为public目录下的相对路径
  const template = await response.text()
  const fullHtml = template.replace('${title}', title.value).replace('${htmlContent}', htmlContent)
  // 文章内容
  content.value = fullHtml

  const postData = {
    userId: userId.value,
    postId: draftId.value || null,
    title: title.value,
    content: content.value,
    cover: coverUrl.value,
    intro: abstract.value,
    tagIds: tags.value.map(tag => tag.id),
    categoryId: selectedCategoryId.value[0] || null,
    postType: contentType.value,
    type: visibilityScope.value,
    vip: isLimitVipRead.value ? 1 : 0
  }
  // 发布文章
  publishPost(postData).then((res: any) => {
    if(res.code === 200){
      // 跳转页面,不允许返回该页面
      // 使用router.replace()替换当前路由，防止用户通过返回按钮回到编辑页面
      // 假设发布成功后返回了文章ID，我们可以将其作为参数传递
      const postId = res.data || null;
      console.log('发布成功，文章ID:', postId, res)
      
      // ✅ 处理资源绑定
      if (postId && isResourceChanged.value && pendingResource.value) {
        const resourceData = { ...pendingResource.value, resourceBindContentId: String(postId) }
        
        // 逻辑审视：
        // 1. 如果是新文章 (发布前 postId 为空)，无论是否有旧 resourceId，都按新增处理 (调用 upload)
        // 2. 如果是修改文章 (发布前 already had postId)，根据 hasNewFile 决定是新增还是修改
        
        const isNewPost = !props.postId // 这里的 props.postId 代表进入编辑页时的 ID
        
        if (isNewPost || pendingResource.value.hasNewFile || !pendingResource.value.id) {
          uploadResource(resourceData).then(() => {
            console.log('资源自动绑定成功(新增)')
            clearPendingResource()
          }).catch(err => console.error('资源自动绑定失败', err))
        } else {
          editResource({ ...resourceData, id: pendingResource.value.id }).then(() => {
            console.log('资源自动绑定成功(修改)')
            clearPendingResource()
          }).catch(err => console.error('资源自动修改失败', err))
        }
      }

      if (postId) {
        router.replace(`/publishSuccess/${userId.value}/${postId}`);
      } else {
        router.replace('/userHome/postList');
      }
    }else if(res.code === 500){
      console.error('发布失败：', res)
      ElMessage.error(res.msg || '发布失败')
    }
  })
  
  // try {
  //   // 获取编辑器内容的HTML格式
  //   const htmlContent = props.editor.getHTML()
  //   // 获取标题
  //   title.value = props.title || `文章-${new Date().getTime()}`
    
  //   // 创建完整的HTML页面(读取外部模板文件)
  //   const response = await fetch('/external-html.html') // 修改路径为public目录下的相对路径
  //   const template = await response.text()
  //   const fullHtml = template.replace('${title}', title.value).replace('${htmlContent}', htmlContent)
  //   // 文章内容
  //   content.value = fullHtml

  //   // 创建Blob对象
  //   const blob = new Blob([fullHtml], { type: 'text/html' })
    
  //   // 创建下载链接
  //   const url = URL.createObjectURL(blob)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.download = `${title.value.replace(/[^\w\s]/gi, '')}-${new Date().getTime()}.html`
    
  //   // 触发下载
  //   document.body.appendChild(link)
  //   link.click()
    
  //   // 清理
  //   document.body.removeChild(link)
  //   URL.revokeObjectURL(url)
    
  //   ElMessage.success('文件已保存')
  //   console.log('保存的html为', fullHtml)
  // } catch (error) {
  //   console.error('保存文件失败:', error)
  //   ElMessage.error('保存文件失败')
  // }
}

// 参数校验
function validateParams(): boolean {
  if (!props.title || props.title.trim() === '') {
    ElMessage.warning('文章标题不能为空')
    return false
  }
  const plainText = props.editor.getText() || props.editor.state.doc.textContent
  if (!plainText || plainText.trim() === '') {
    ElMessage.warning('文章内容不能为空')
    return false
  }
    if (tags.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return false
  }
  if (!abstract.value || abstract.value.trim() === '') {
    ElMessage.warning('文章摘要不能为空')
    return false
  }
  if (!selectedCategoryId.value) {
    ElMessage.warning('请选择分类专栏')
    return false
  }
  if (!contentType.value || contentType.value === null || contentType.value === undefined) {
    ElMessage.warning('请选择文章类型')
    return false
  }
  if (!visibilityScope.value) {
    ElMessage.warning('请选择可见范围')
    return false
  }
  return true
}

/**
 * 保存草稿
 */
const saveHtmlDraft = async() => {
  // 获取编辑器内容的HTML格式
  const htmlContent = props.editor.getHTML()
  // 获取标题
  title.value = props.title || ''
  // 创建完整的HTML页面(读取外部模板文件)
  const response = await fetch('/external-html.html') // 修改路径为public目录下的相对路径
  const template = await response.text()
  const fullHtml = template.replace('${title}', title.value).replace('${htmlContent}', htmlContent)
  // 文章内容
  content.value = fullHtml
  const plainText = props.editor.getText() || props.editor.state.doc.textContent
  if ((!plainText || plainText.trim() === '') && (!props.title || props.title.trim() === '')) {
    ElMessage.warning('文章标题或内容不能为空')
    return false
  }
  const postData = {
    userId: userId.value,
    postId: draftId.value || null,
    title: title.value,
    content: content.value,
  }
  saveDraft(postData).then((res: any) => {
    if(res.code === 200){
      ElMessage.success('草稿保存成功')
      // 保存草稿id
      draftId.value = res.data || 0
      // 标记为草稿
      isDraft.value = true
      console.log('草稿保存成功，草稿id为', res.data || 0,'，当前草稿id：', draftId.value)
      // 关闭标签页
      setTimeout(() => {
        window.close()
      }, 1000)
    }else if(res.code === 500){
      console.error('草稿保存失败：', res)
      ElMessage.error(res.msg || '草稿保存失败')
    }
  })
}

/**
 * 处理点击外部区域隐藏评论栏
 */
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  // 如果标签选择器显示中，且点击的元素不在标签选择器或添加标签按钮内
  if (isShowTagSelector.value) {
    const tagSelector = document.querySelector('.tag-selector') as HTMLElement;
    const tagSelectorBtn = document.querySelector('.tag-selector-btn') as HTMLElement;
    const removeTagBtn = document.querySelector('.remove-tag-btn') as HTMLElement;
    
    if (!tagSelector || !tagSelectorBtn) return

    const clickInsideTagSelector =(
      tagSelector.contains(target) ||
      tagSelectorBtn.contains(target) ||
      (removeTagBtn && removeTagBtn.contains(target))
    )

    if (!clickInsideTagSelector) {
      isShowTagSelector.value = false
      console.log('点击了标签选择器外部区域')
    }
  }
}

// 监听键盘事件，关闭标签选择器
const onEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isShowTagSelector.value) {
    isShowTagSelector.value = false;
  }
};

// 选择标签
const selectTag = (tag: Tag) => {
  console.log('选择标签：', tag)
  if (tags.value.some(t => t.id === tag.id)) {
    ElMessage.info('标签已存在')
    return
  }
  tags.value.push(tag)
}

// 删除标签
const removeTag = (tagId: number) => {
  tags.value = tags.value.filter(tag => tag.id !== tagId)
}

// 关闭标签选择器
const closeSelector = () => {
  console.log('关闭标签选择器')
  isShowTagSelector.value = false
}

// 处理封面上传
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

// 只允许上传一张封面
const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value?.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value?.handleStart(file)
}

const handleUpload = async (options: any) => {
  const { file } = options

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await uploadImage(formData)
    // 假设接口返回：{ data: 'http://xxx/xxx.png' }
    coverUrl.value = res.data
    ElMessage.success('封面上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const previewCover = () => {
  previewVisible.value = true
}

const removeCover = () => {
  coverUrl.value = ''
  uploadRef.value?.clearFiles()
}

const aiSumarry = async () => {
  if (isSummarizing.value) return
  
  if (!props.editor) {
    ElMessage.warning('编辑器内容为空，无法提取摘要')
    return
  }

  let content = props.editor.getHTML()
  // 获取标题
  if (!title.value) {
    title.value = props.title || `暂无标题`
  }
  let re = '标题:'+ title.value + '\n' + '正文:' + content
  
  isSummarizing.value = true
  try {
    const res = await summaryAbstract({ content: re })
    abstract.value = res.data
    console.log('摘要提取结果：', res)
    ElMessage.success('摘要提取成功')
  } catch (e) {
    ElMessage.error('摘要提取失败')
  } finally {
    isSummarizing.value = false
  }
}

// 数据回填
/**
 * 刷新文章详情
 */
const refreshPostDetail = async (postId: number) => {
  try {
    const res: any = await getPostViewPage({
        postId
    })
    if (res.code === 200) {
      const post = res.data || {}
      tags.value = (post.tagList || []).map((item: any) => ({
        ...item,
        id: item.tagId
      }))
      coverUrl.value = post.image || ''
      abstract.value = post.introduction || ''
      selectedCategoryId.value = [post.categoryId]
      contentType.value = String(post.postType) || '0'
      visibilityScope.value = String(post.type) || '0'
      isLimitVipRead.value = Boolean(post.isVip) || false

      // 设置文章id
      draftId.value = postId
      isDraft.value = true
      console.log('文章详情刷新成功：', post)
    } else {
      ElMessage.error(res.msg || '文章详情刷新失败')
    }
  } catch (e) {
    ElMessage.error('文章详情刷新失败')
  }
}



// 监听selectedDraftId变化
watch(() => props.selectedDraftId, (newDraftId) => {
  if (newDraftId) {
    draftId.value = newDraftId
    isDraft.value = true
    console.log('ManageArea组件选择草稿：', newDraftId, '设置为草稿状态', isDraft.value)
  }
}, { immediate: true })

// 监听postId变化，触发数据回显
watch(() => props.postId, (newPostId) => {
  if (newPostId) {
    console.log('ManageArea组件选择文章：', newPostId)
    // 调用接口获取文章详情
    refreshPostDetail(newPostId)
  }
}, { immediate: true })


// 挂载时添加事件监听器
onMounted(() => {
  document.addEventListener('keydown', onEsc);
  document.addEventListener('click', handleClickOutside);
  // 获取用户分类专栏
  getUserCategory(userId.value).then(res => {
    categories.value = res.data.categoryInfoList || []
  })
});

// 卸载时移除事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', onEsc);
  document.removeEventListener('click', handleClickOutside);
});
</script>
<style scoped>
.manage-area {
  justify-content: space-between;
  align-items: center;
  padding: 25px 25px;
  background: #fff;
  width: 19%;
  min-height: 200px;
  position: relative; /* 添加相对定位，作为绝对定位的参考 */
}

.item-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2rem;
}

.item-text {
  font-size: 14px;
  color: #525151;
  font-weight: 300;
  font-family: SF Pro Display, Roboto, Noto, Arial, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.selected-tags {
  align-items: center;
  color: #006fff;
  background: #267dcc0d;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid #80B7FF;
  font-size: 14px;
  gap: 2px;
  cursor: default;
}

.remove-tag-btn {
  cursor: pointer;
  font-size: 10px;
  color: #006effd0;
}

.tag-selector-btn {
  border: 1px solid #cacbce;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #000000;
  font-weight: 400;
  cursor: pointer;

  &:hover {
    background-color: #e0e2e6b9;
  }
}

.tag-selector-wrapper {
  position: absolute;
  /* top: 100%; */
  left: 90px;
  margin-top: 10px;
  z-index: 1000;
}

.tag-selector-com {
  width: 500px;
  min-height: 200px;
  max-height: 500px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
  overflow: hidden;
}

/* 封面上传 */
.cover-uploader {
  cursor: pointer;
}

.upload-placeholder {
  width: 140px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  gap: 4px;
}

.cover-preview {
  position: relative;
  width: 140px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-preview:hover .cover-mask {
  opacity: 1;
}

.cover-mask .el-icon {
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

/* 提高 el-dialog 遮罩层 */
.el-overlay {
  z-index: 99999 !important;
}

/* 提高 dialog 本体 */
.el-dialog {
  z-index: 100000 !important;
}

.ai-auto-abstract {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #ececec94;
  border: 1px solid #dbdada;
  /* color: #0066ff; */
  padding: 6px 12px;
  border-radius: 6px;
  width: fit-content;
  font-size: 13px;
  margin-top: -20px;
  margin-left: 4rem;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  &:hover {
    color: #006fff;
    background-color: #aab2fa75;
    border-color: #8ca7ff9f;
    /* transform: translateY(-1px); */
    box-shadow: 0 2px 8px rgba(0, 102, 255, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &.is-loading {
    cursor: not-allowed;
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #909399;
    transform: none;
    box-shadow: none;
  }
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #909399;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
  margin-right: 4px;
}

@keyframes spinner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.foot-area {
  display: flex;
  gap: 20px;
  /* 靠右展示 */
  justify-content: flex-end;
  margin-right: 3.5rem;
}

.action-item {
  font-size: 17px;
  border-radius: 5px;
  padding: 6px 16px;
  font-weight: 400;
  cursor: pointer;
}

.save-draft {
  color: #000000;
  border: 1px solid #cacbce;
  &:hover {
    background-color: #e0e2e6b9;
  }
}

.publish {
  color: #ffffff;
  background-color: #fc5531;
  border: 1px solid #fc5531;
  &:hover {
    background-color: #e64a19;
  }
}
</style>