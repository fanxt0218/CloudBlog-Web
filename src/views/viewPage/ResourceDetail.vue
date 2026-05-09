<template>
  <div class="resource-detail-page">
    <div class="content-wrapper" v-if="resourceData">
      
      <!-- 左侧主要内容 -->
      <div class="main-content">
        <!-- 资源头部信息卡片 -->
        <div class="resource-header-card">
          <div class="title-section">
            <h1 class="resource-title">{{ resourceData.resourceName }}</h1>
            <div class="tags-wrapper">
              <span class="tag-item" v-for="tag in tagList" :key="tag">{{ tag }}</span>
              <span class="vip-badge" v-if="resourceData.vipResource === 1">
                <el-icon><GoldMedal /></el-icon> VIP 资源
              </span>
            </div>
          </div>
          
          <div class="meta-info">
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ resourceData.resourceCreatorName || '匿名用户' }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>上传于 {{ formatDate(resourceData.resourceCreateTime) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><View /></el-icon>
              <span>{{ resourceData.downloadCount || 0 }} 次下载</span>
            </div>
          </div>
        </div>

        <!-- 资源描述卡片 -->
        <div class="resource-desc-card">
          <h3 class="section-title">资源描述</h3>
          <div class="desc-content">
            {{ resourceData.resourceDescription || '暂无详细描述' }}
          </div>
        </div>
        
        <!-- 相关资源 (当在主区域显示时) -->
        <div class="related-resource-card" v-if="relatedResources.length > 0">
          <h3 class="section-title">相关资源</h3>
          <div class="related-grid">
            <div 
              class="related-item" 
              v-for="item in relatedResources" 
              :key="item.id"
              @click="goToDetail(item.id)"
            >
              <div class="item-format">{{ item.resourceFormat?.toUpperCase() || 'FILE' }}</div>
              <div class="item-info">
                <h4 :title="item.resourceName">{{ item.resourceName }}</h4>
                <div class="item-meta">
                  <span>{{ item.resourceSize }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧侧边栏 -->
      <div class="sidebar">
        <div class="user_card">
          <div class="left_area">
            <div class="avatar" @click="jumpToUserProfile">
                <img :src="`/api${authorInfo?.image}`" alt="">
            </div>
            <!-- 用户元数据 -->
             <div class="meta-data">
              <span class="author-name" @click="jumpToUserProfile">
                {{ authorInfo?.userName }}
              </span>
              <span class="fan-count">
                粉丝:&nbsp;{{ authorInfo?.fanCount }}
              </span>
             </div>
          </div>
          <div class="right_area">
            <!-- 私信按钮 -->
            <div class="message-btn" @click="handlePrivateMessage">私信</div>
          </div>
        </div>
        <!-- 下载卡片 -->
        <div class="download-card">
          <div class="format-badge">
            <span class="ext">{{ resourceData.resourceFormat?.toUpperCase() || 'FILE' }}</span>
          </div>
          <div class="file-info-list">
            <div class="info-row">
              <span class="label">文件大小</span>
              <span class="value">{{ resourceData.resourceSize || '未知' }}</span>
            </div>
            <div class="info-row">
              <span class="label">文件类型</span>
              <span class="value">{{ resourceData.resourceFormat || '未知' }}</span>
            </div>
            <div class="info-row" v-if="resourceData.vipResource === 1">
              <span class="label">下载权限</span>
              <span class="value vip-text">VIP专属</span>
            </div>
          </div>
          
          <div class="action-btn-wrapper">
            <el-button
              type="primary" 
              class="download-btn" 
              :loading="downloading"
              @click="handleDownload"
              v-if="hasDownloadPer"
            >
              <el-icon><Download /></el-icon>
              <span>立即下载</span>
            </el-button>
            <el-button
              type="primary" 
              class="download-btn"
              @click="jumpToVipCenter"
              v-else
            >
              开通会员，立即下载
            </el-button>
          </div>
          <div class="action-tips">
            请遵守社区下载规范，切勿恶意下载。
          </div>
        </div>
      </div>

    </div>
    
    <!-- 加载状态 -->
    <div class="loading-wrapper" v-else-if="loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <!-- 空状态 -->
    <div class="empty-wrapper" v-else>
      <el-empty description="未找到该资源或资源已被删除"></el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getResourceDetail, checkResourceDownload, downloadResource, getIndexResource } from '@/api/create/resource'
import { getUserInfo } from '@/api/userInfo/homePage'
import { useUserInfoStore } from '@/stores/userInfo'
import { GoldMedal, User, Calendar, View, Download } from '@element-plus/icons-vue'
import type { IndexResourceItem, UserInfo } from '@/types'
import { useMessageStore } from '@/stores/messageStore'

const route = useRoute()
const router = useRouter()
const userInfoStore = useUserInfoStore()

const loading = ref(true)
const resourceData = ref<any>(null)
const downloading = ref(false)
const relatedResources = ref<any[]>([])

const authorInfo = ref<UserInfo>()
const messageStore = useMessageStore()

const hasDownloadPer = ref<Boolean>(false)

// 获取资源 ID
const resourceId = computed(() => route.params.resourceId as string)

// 标签列表
const tagList = computed(() => {
  if (!resourceData.value?.resourceTags) return []
  return resourceData.value.resourceTags.split(',').filter((t: string) => t)
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取详情
const fetchDetail = async () => {
  if (!resourceId.value) return
  
  loading.value = true
  try {
    const res: any = await getResourceDetail({ resourceId: resourceId.value })
    if (res.code === 200) {
      resourceData.value = res.data
      fetchRelatedResources()
    } else {
      ElMessage.error(res.message || '获取资源详情失败')
    }
  } catch (error) {
    console.error('获取详情出错:', error)
  } finally {
    loading.value = false
  }
}

// 获取相关资源
const fetchRelatedResources = async () => {
  if (!resourceData.value) return
  
  const mainTag = tagList.value[0] || null
  const po = {
    userId: null,
    name: null,
    tagName: mainTag
  }
  const params = {
    cursor: null,
    size: 6
  }
  
  try {
    const res: any = await getIndexResource({ po, params })
    if (res.code === 200) {
      // 过滤掉当前资源
      relatedResources.value = (res.data?.content || []).filter((item: any) => item.id !== Number(resourceId.value)).slice(0, 5)
    }
  } catch (error) {
    console.error('获取相关资源失败:', error)
  }
}

// 跳转到其他详情
const goToDetail = (id: number) => {
  router.push(`/resourceDetail/${id}`)
}

// 下载处理
const handleDownload = async () => {
  if (!userInfoStore.userId) {
    ElMessage.warning('请先登录后再下载')
    router.push('/login')
    return
  }
  
  downloading.value = true
  try {
    // 1. 校验是否可以下载
    const checkRes: any = await checkResourceDownload({
      userId: Number(userInfoStore.userId),
      resourceId: Number(resourceId.value)
    })
    
    if (checkRes.code !== 200) {
      ElMessage.error(checkRes.message || '无权下载该资源')
      downloading.value = false
      return
    }
    
    // 2. 发起下载请求
    const token = checkRes.data.token || ''
    const url = resourceData.value.resourceUrl
    const filename = resourceData.value.resourceName
    
    const downloadRes: any = await downloadResource({
      userId: Number(userInfoStore.userId),
      url,
      filename,
      token
    })
    
    // 3. 处理 blob 下载
    const blob = new Blob([downloadRes])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'downloaded_resource'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    ElMessage.success('开始下载')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

/**
 * 获取作者信息
 */
const getAuthorInfo = (authorId: number) => {
  getUserInfo(authorId).then(res => {
    authorInfo.value = res.data
  })
  console.log('资源作者信息',authorInfo)
}

/**
 * 处理私信按钮点击
 */
const handlePrivateMessage = () => {
  // 设置目标用户ID到store
  messageStore.setTargetUserId(resourceData.value.resourceCreator)
  // 跳转到消息中心
//   window.open('/messageCenter/myMessage', '_blank');
  router.push('/messageCenter/myMessage')
}

/**
 * 跳转用户主页
 */
const jumpToUserProfile = () => {
  window.open(`/otherUserHome/${resourceData.value.resourceCreator}`, '_blank')
}

/**
 * 校验下载权限
 */
const verifyDownloadPermission = () => {
  let resourcePer = resourceData.value.vipResource;
  let userPer = userInfoStore.isVip;
  console.log('用户VIP权限', userPer)
  console.log('资源会员权限', resourcePer)
  if (userPer == 1 || (resourceData.value.resourceCreator == userInfoStore.userId)) {
    hasDownloadPer.value = true
  }else if (resourcePer == 1) {
    hasDownloadPer.value = false
  }
  console.log('下载按钮权限',hasDownloadPer.value)
}

/**
 * 跳转会员中心
 */
const jumpToVipCenter = () => {
  window.open(`/vipCenter`, '_blank')
}

watch(resourceId, () => {
  if (route.name === 'ResourceDetail' || route.path.includes('/resourceDetail/')) {
    fetchDetail()
  }
})

onMounted(async () => {
  await fetchDetail()
  getAuthorInfo(resourceData.value.resourceCreator)
  verifyDownloadPermission()

  document.title = resourceData.value.resourceName + ' - CloudBlog下载'
})
</script>

<style scoped>
.resource-detail-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 30px 20px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左侧主要内容 */
.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.resource-header-card, .resource-desc-card, .related-resource-card {
  background: white;
  border-radius: 12px;
  padding: 5px 25px 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.title-section {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.resource-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  margin-bottom: 16px;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.tag-item {
  background: rgba(230, 126, 34, 0.1);
  color: #e67e22;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.vip-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-info {
  display: flex;
  gap: 24px;
  color: #64748b;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 20px;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #e67e22;
  border-radius: 2px;
}

.desc-content {
  font-size: 15px;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
}

/* 相关资源网格 */
.related-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  min-width: 0;
}

.related-item:hover {
  background: white;
  border-color: #e67e22;
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.1);
  transform: translateY(-2px);
}

.item-format {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  background: rgba(230, 126, 34, 0.1);
  color: #e67e22;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
  box-sizing: border-box;
}

.item-info {
  flex: 1;
  min-width: 0;
  /* 上下居中 */
  margin-bottom: 10px;
}

.item-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 12px;
  color: #94a3b8;
}

/* 右侧侧边栏 */
.sidebar {
  width: 320px;
  flex-shrink: 0;
}

.download-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 24px;
  text-align: center;
  margin-top: 1rem;
}

.format-badge {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #fef08a 0%, #f59e0b 100%);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
}

.format-badge .ext {
  color: white;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 1px;
}

.file-info-list {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px dashed #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: #64748b;
}

.info-row .value {
  font-weight: 600;
  color: #0f172a;
}

.info-row .vip-text {
  color: #f59e0b;
}

.action-btn-wrapper .download-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: #e67e22;
  border-color: #e67e22;
  transition: all 0.3s ease;
}

.action-btn-wrapper .download-btn:hover {
  background: #d35400;
  border-color: #d35400;
  /* transform: translateY(-2px); */
  box-shadow: 0 8px 16px rgba(230, 126, 34, 0.25);
}

.action-tips {
  margin-top: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.loading-wrapper, .empty-wrapper {
  max-width: 1200px;
  margin: 40px auto;
  background: white;
  padding: 40px;
  border-radius: 12px;
}

.user_card {
  background: white;
  border-radius: 12px;
  padding: 20px 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  /* position: sticky; */
  top: 24px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left_area {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meta-data {
  display: grid;
  gap: 6px;
}

.author-name {
  font-size: 18px;
  font-weight: 450;
  cursor: pointer;
}

.fan-count {
  font-size: 14px;
  color: #606266df;
  font-family: PingFangSC-Medium, PingFang SC;
}

.right_area {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.message-btn {
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  padding: 0 16px;
}

.message-btn:hover {
  border-color: #ff6a00;
  color: #ff6a00;
}
</style>
