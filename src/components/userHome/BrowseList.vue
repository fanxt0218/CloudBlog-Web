<template>
    <div class="browse-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-loading-spinner></el-loading-spinner>
          <p>加载中...</p>
        </div>

        <div v-else class="browse-list">
            <div v-for="item in browseList?.records || []" :key="item.postId" class="browse-item" @click="handleJumpToPostDetail(item.authorId,item.postId)">
                <div v-if="item.image" class="browse-image">
                  <img :src="`/api${item.image}`" alt="文章封面" />
                </div>
                <div class="browse-content">
                    <h3 class="browse-title">{{ item.title }}</h3>
                    <div class="meta-data">
                        <div class="browse-meta">
                            <span v-if="item.isVip === 1" class="vip-tag">VIP</span>
                            <span class="browse-time">浏览于&nbsp;{{ item.createTime }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="browseList && browseList.records.length === 0" class="empty-state">
              <p>暂无浏览记录</p>
            </div>

            <!-- 数据未加载状态 -->
            <div v-if="!browseList" class="empty-state">
                <p>暂无数据</p>
            </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="browseList && browseList.total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="browseList.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
            
    </div>
</template>
<script lang="ts" setup name="BrowseList">
import {ref, onMounted} from 'vue';
import {getUserBrowseList} from '@/api/userInfo/homePage';
import type {UserBrowse, UserBrowseItem} from '@/types/index';
import { ElMessage, ElIcon } from 'element-plus';

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const loginUserId = Number(localStorage.getItem('userId'));

let browseList = ref<UserBrowse | null>(null);

const loadUserBrowseList = async () => {
    loading.value = true;
    try {
        const param = {
            userId:Number(localStorage.getItem('userId')) == 0 ? null : Number(localStorage.getItem('userId')),
            beginTime:null,
            endTime:null,
            pageNum:currentPage.value,
            pageSize:pageSize.value
        };
        // 执行查询
        const response = await getUserBrowseList(param);

        if (response && response.data && response.data.records) {
          browseList.value = response.data;
        } else {
          browseList.value = {
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
    browseList.value = {
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
  loadUserBrowseList();
};

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 重置为第一页
  loadUserBrowseList();
};

/**
 * 处理跳转文章详情页
 * @param postId 
 */
const handleJumpToPostDetail = (authorId: number, postId: number) => {
  window.open(`/postView/${authorId}/${postId}`, '_blank');
}

// 页面挂载时加载数据
onMounted(() => {
  loadUserBrowseList();
});
</script>
<style scoped>
.browse-container {
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

.browse-list {
    margin-top: -1rem;
}

.browse-item {
  display: flex;
  padding: 15px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  position: relative;
}

.browse-item:hover {
    background-color: #faf8f8;
}

.browse-image {
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

.browse-image img{
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.browse-content {
  flex: 1;
  margin-left: 10px;
  display: flex; /* 添加flex布局 */
  flex-direction: column; /* 垂直排列 */
}

.browse-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  /* margin-left: 10px; */
}

.browse-meta {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
  gap: 5px;
}

.vip-tag {
  background: linear-gradient(135deg, #fcd80c 0%, #fdee60 100%);
  color: rgb(197, 123, 12);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  /* margin-left: 10px; */
  margin-top: 1.5rem;
}

.browse-time {
  margin-top: 1.5rem;
}

.meta-data {
  display: flex;
  justify-content: space-between; /* 确保内容和星星图标分开 */
  align-items: center; /* 垂直居中对齐 */
  position: relative;
  flex: 1;
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