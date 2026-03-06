<template>
  <div class="collect-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-loading-spinner></el-loading-spinner>
      <p>加载中...</p>
    </div>
    
    <!-- 收藏列表 -->
    <div v-else class="collect-list">
      <div v-for="item in collectDetail?.records || []" :key="item.postId" class="collect-item" @click="handleJumpToPostDetail(item.authorId, item.postId)">
        <div v-if="item.image" class="collect-image">
          <img :src="`/api${item.image}`" alt="文章封面" />
        </div>
        <div class="collect-content">
          <h3 class="collect-title">{{ item.title }}</h3>
          <div class="meta-data">
            <div class="collect-meta">
              <span class="create-time">收藏于&nbsp;{{ formatDate(item.createTime) }}</span>
              <span v-if="item.isVip === 1" class="vip-tag">VIP</span>
            </div>
            <!-- 替换为星星图标表示收藏状态 -->
            <!-- <div class="status" @click="toggleCollect(item)">
              <svg
                class="star-icon"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
              >
                <path
                  d="M908.1 353.1L661.3 314 541.9 92c-3.5-6.4-10.2-10.4-17.6-10.4s-14.1 4-17.6 10.4L362.7 314 115.9 353.1c-7.2 1.1-13.3 6-15.6 12.9s-0.4 14.5 4.8 19.6L302 602.3l-43.6 253.6c-1.2 7.2 1.7 14.5 7.6 18.9 3.4 2.5 7.5 3.8 11.7 3.8 3.1 0 6.3-0.7 9.1-2.1l226.2-118.9 226.2 118.9c6.5 3.4 14.3 2.8 20.2-1.7s8.8-11.7 7.6-18.9L746 602.3l196.9-216.6c5.2-5.1 7.1-12.8 4.8-19.6-2.3-6.9-8.4-11.8-15.6-12.9z"
                  :fill="item.status === 0 ? '#FFD700' : '#bfbfbf'"
                />
              </svg>
            </div> -->
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="collectDetail && collectDetail.records.length === 0" class="empty-state">
        <p>该收藏夹暂无内容</p>
      </div>
      
      <!-- 数据未加载状态 -->
      <div v-if="!collectDetail" class="empty-state">
        <p>暂无数据</p>
      </div>
    </div>
    
    <!-- 分页组件 -->
    <div v-if="collectDetail && collectDetail.total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="collectDetail.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="OtherCollectDetail">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getUserCollectDetail, changeCollectStatus } from '@/api/userInfo/homePage';
import type { ApiResponse, UserCollectDetail, UserCollectDetailItem } from '@/types';
import { ElMessage, ElIcon } from 'element-plus';

// 获取路由参数
const route = useRoute();
const favoritesId = Number(route.params.favoriteId);
const userId = Number(route.params.userId);


// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const collectDetail = ref<UserCollectDetail | null>(null);
const loading = ref(false);

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 加载收藏夹详情数据
const loadCollectDetail = async () => {
  loading.value = true;
  try {
    // 构建请求参数
    const params = {
      userId: Number(userId), // 这里使用固定用户ID，实际应用中应该从用户登录信息中获取
      favoritesId: favoritesId,
      postName: '', // 搜索关键词，目前为空
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };
    
    const response = await getUserCollectDetail(params);
    
    // 确保返回的数据结构正确
    if (response && response.data && response.data.records) {
      collectDetail.value = response.data;
    } else {
      collectDetail.value = {
        records: [],
        total: 0,
        size: pageSize.value,
        current: currentPage.value,
        pages: 0
      };
      ElMessage.warning('未获取到有效数据');
    }
  } catch (error) {
    console.error('获取收藏夹详情失败:', error);
    ElMessage.error('获取收藏夹详情失败，请稍后重试');
    // 设置默认空数据，避免白屏
    collectDetail.value = {
      records: [],
      total: 0,
      size: pageSize.value,
      current: currentPage.value,
      pages: 0
    };
  } finally {
    loading.value = false;
  }
};

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  loadCollectDetail();
};

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 重置为第一页
  loadCollectDetail();
};

// 收藏/取消收藏
async function toggleCollect(item: UserCollectDetailItem) {
  const srcStatus = item.status;
  // 状态设置为收藏/取消收藏
  item.status = item.status === 0 ? 1 : 0;
  // 发送请求，但不刷新页面
  const data = {
    userId:Number(userId),
    postId:item.postId,
    status:item.status
  }
  try{
    const res = await changeCollectStatus(data);
  } catch(e) {
    item.status = srcStatus;
    ElMessage.error('操作失败');
    return;
  }
}

/**
 * 处理跳转文章详情页
 * @param postId 
 */
const handleJumpToPostDetail = (authorId: number, postId: number) => {
  window.open(`/postView/${authorId}/${postId}`, '_blank');
}

// 页面挂载时加载数据
onMounted(() => {
  loadCollectDetail();
});
</script>

<style scoped>
.collect-detail-container {
  padding: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.collect-list {
  margin-top: -1rem;
}

.collect-item {
  display: flex;
  padding: 15px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  position: relative; /* 为右侧的星星图标提供定位参考 */
}

.collect-item:hover {
  background-color: #faf8f8;
}

.collect-image {
  width: 25%; /* 原160px，改用相对父容器宽度的百分比 */
  max-width: 130px; 
  max-height: 80px;
  /* min-width: 60px;  */
  aspect-ratio: 1.6; /* 固定宽高比（160:100=1.6），替代固定height */
  flex-shrink: 0;
  border-radius: 0.3rem; /* 原4px */
  overflow: hidden;
  background-color: #f5f5f5;
}

.collect-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;

}

.collect-content {
  flex: 1;
  margin-left: 10px;
  display: flex; /* 添加flex布局 */
  flex-direction: column; /* 垂直排列 */
}

.collect-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  /* margin-left: 10px; */
}

.collect-meta {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.vip-tag {
  background: linear-gradient(135deg, #fcd80c 0%, #fdee60 100%);
  color: rgb(197, 123, 12);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 10px;
  margin-top: 1.5rem;
}

.create-time {
  margin-top: 1.5rem; /* 移除不必要的上外边距 */
}

.meta-data {
  display: flex;
  justify-content: space-between; /* 确保内容和星星图标分开 */
  align-items: center; /* 垂直居中对齐 */
  position: relative;
  flex: 1;
}

.status {
  margin-left: 24rem;
  margin-bottom: 2rem;
  /* 保持原有位置 */
}

.status {
  /* 移除固定的 margin-left: 24rem; */
  position: absolute; /* 使用绝对定位 */
  right: 0; /* 靠右对齐 */
  cursor: pointer;
  transition: transform 0.15s ease;
  z-index: 1;
}

.status:hover {
  transform: scale(1.1);
}

.star-icon {
  display: inline-block;
  vertical-align: middle;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
</style>