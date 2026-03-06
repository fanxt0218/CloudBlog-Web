<template>
    <div class="like-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-loading-spinner></el-loading-spinner>
          <p>加载中...</p>
        </div>

        <div v-else class="like-list">
            <div v-for="item in likeList?.records || []" :key="item.postId" class="like-item" @click="handleJumpToPostDetail(item.authorId, item.postId)">
                <div v-if="item.image" class="like-image">
                  <img :src="`/api${item.image}`" alt="文章封面" />
                </div>
                <div class="like-content">
                    <h3 class="like-title">{{ item.title }}</h3>
                    <div class="meta-data">
                        <div class="like-meta">
                            <span class="like-time">点赞于&nbsp;{{ formatDate(item.createTime) }}</span>
                            <span v-if="item.isVip === 1" class="vip-tag">VIP</span>
                        </div>
                        <div class="status" @click.stop="toggleLike(item)">
                            <svg
                              class="like-icon"
                              viewBox="0 0 1024 1024"
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="22"
                            >
                              <path
                                d="M780.8 352H608V160c0-17.7-14.3-32-32-32H512c-11.6 0-22.4 6.2-28.3 16.3L296.4 352H160c-17.7 0-32 14.3-32 32v512c0 17.7 14.3 32 32 32h608c14.4 0 27.1-9.7 31-23.6l96-352c5.4-19.7-9.3-39.4-29.2-39.4zM224 864V416h96v448h-96z m416 0H384V416l128-192v160h224l-96 352z"
                                :fill="item.status === 0 ? '#f75297be' : '#bfbfbf'"
                              />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="likeList && likeList.records.length === 0" class="empty-state">
              <p>暂无点赞内容</p>
            </div>

            <!-- 数据未加载状态 -->
            <div v-if="!likeList" class="empty-state">
                <p>暂无数据</p>
            </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="likeList && likeList.total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="likeList.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
            
    </div>
</template>
<script lang="ts" setup name="LikeList">
import {ref, onMounted} from 'vue';
import {getUserLikeList, changeLikeStatus} from '@/api/userInfo/homePage';
import type {UserLike, UserLikeItem} from '@/types/index';
import { ElMessage, ElIcon } from 'element-plus';

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const loginUserId = Number(localStorage.getItem('userId'));

let likeList = ref<UserLike | null>(null);

const loadUserLikeList = async () => {
    loading.value = true;
    try {
        const param = {
            userId:Number(localStorage.getItem('userId')),
            beginTime:null,
            endTime:null,
            pageNum:currentPage.value,
            pageSize:pageSize.value
        };
        // 执行查询
        const response = await getUserLikeList(param);

        if (response && response.data && response.data.records) {
          likeList.value = response.data;
        } else {
          likeList.value = {
            records: [],
            total: 0,
            size: pageSize.value,
            current: currentPage.value,
            pages: 0
          };
          ElMessage.warning('未获取到有效数据');
        }
    }catch (error) {
    console.error('获取点赞列表失败:', error);
    ElMessage.error('获取点赞列表失败，请稍后重试');
    // 设置默认空数据，避免白屏
    likeList.value = {
      records: [],
      total: 0,
      size: pageSize.value,
      current: currentPage.value,
      pages: 0
    };
  } finally {
    loading.value = false;
  }
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  loadUserLikeList();
};

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 重置为第一页
  loadUserLikeList();
};

/**
 * 点赞/取消点赞
 */
async function toggleLike(item:UserLikeItem) {
    const srcStatus = item.status;
  // 状态设置为收藏/取消收藏
  item.status = item.status === 0 ? 1 : 0;
  // 发送请求，但不刷新页面
  const data = {
    userId:Number(localStorage.getItem('userId')),
    targetId:item.postId,
    status:item.status,
    type:0
  }
  try{
    const res = await changeLikeStatus(data);
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
  loadUserLikeList();
});
</script>
<style scoped>
.like-container {
  margin-top: 1.5rem;
  height: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.like-list {
    margin-top: -1rem;
}

.like-item {
  display: flex;
  padding: 15px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  position: relative; /* 为右侧的星星图标提供定位参考 */
}

.like-item:hover {
    background-color: #faf8f8;
}

.like-image {
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

.like-image img{
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.like-content {
  flex: 1;
  margin-left: 10px;
  display: flex; /* 添加flex布局 */
  flex-direction: column; /* 垂直排列 */
}

.like-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  /* margin-left: 10px; */
}

.like-meta {
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

.like-time {
  margin-top: 1.5rem;
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

.like-icon {
  display: inline-block;
  vertical-align: middle;
}

.like-icon:hover {
    fill:#f75297be;
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