<template>
  <div class="category-detail">
    <div class="head">
      <div class="head-content">
        <div class="image">
          <img :src="`/api${categoryDetail?.category?.image}`" alt="分类封面">
        </div>
        <div class="intro">
          <div class="title">{{ categoryDetail?.category?.categoryName }}</div>
          <div class="description">{{ categoryDetail?.category?.description }}</div>
        </div>
      </div>
      <div class="head-meta">
        <span>文章数: {{ categoryDetail?.category?.postCount }}</span>
        <span>文章阅读量: {{ postReadCount }}</span>
        <span>文章收藏数: {{ postCollectCount }}</span>
      </div>
      <div class="search-area">
        <div class="content-intro">
          专栏文章
        </div>
        <div class="search-box">
            <el-input
              v-model="input"
              style="width: 240px"
              placeholder="搜索文章"
              clearable
            />
            <el-button type="primary" @click="handleSearch" class="search-button">搜索</el-button>
        </div>
      </div>
    </div>
    <div class="content">
      <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-loading-spinner></el-loading-spinner>
          <p>加载中...</p>
        </div>

        <div v-else class="post-list">
            <div v-for="item in categoryDetail?.posts?.records || []" :key="item.id" class="post-item" @click="handleJumpToPostDetail(item.id)">
                <div v-if="item.image" class="post-image">
                  <img :src="`/api${item.image}`" alt="文章封面" />
                </div>
                <div class="post-content">
                    <h3 class="post-title">{{ item.title }}</h3>
                    <div class="meta-data">
                        <div class="post-meta">
                            <span class="post-time">{{ formatDate(item.createTime) }}&nbsp;·</span>
                            <span class="post-time">{{ item.browseCount || 0 }}&nbsp;阅读&nbsp;·</span>
                            <span class="post-time">{{ item.collectCount || 0 }}&nbsp;收藏</span>

                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="categoryDetail?.posts?.records.length === 0" class="empty-state">
              <p>暂无文章内容</p>
            </div>

            <!-- 数据未加载状态 -->
            <div v-if="!categoryDetail?.posts" class="empty-state">
                <p>暂无数据</p>
            </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="categoryDetail?.posts && categoryDetail?.posts.total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="categoryDetail?.posts?.total || 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getUserCategoryDetail } from '@/api/userInfo/homePage'
import type { CategoryDetail } from '@/types/index'
import { ElMessage } from 'element-plus'

let route = useRoute()
let categoryId = ref(route.params.categoryId)
let categoryDetail = ref<CategoryDetail>()

let userId = ref(Number(localStorage.getItem('userId')))

let postReadCount = ref(0)
let postCollectCount = ref(0)

let input = ref('')

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);


/**
 * 获取分类下的文章阅读量
 */
function getPostReadCount() {
  let readCount = 0
  categoryDetail.value?.posts?.records.forEach(post => {
    readCount += post.browseCount || 0
  })
  return readCount
}

/**
 * 获取分类下的文章收藏数
 */
function getPostCollectCount() {
  let collectCount = 0
  categoryDetail.value?.posts?.records.forEach(post => {
    collectCount += post.collectCount || 0
  })
  return collectCount
}

// 格式化日期,以-分隔
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 搜索文章
 */
const handleSearch = () => {
  currentPage.value = 1; // 重置为第一页
  loadCategoryInfo();
}

// 加载分类详情
const loadCategoryInfo = async () => {
    loading.value = true;
    try {
        const param = {
            userId:Number(localStorage.getItem('userId')) == 0 ? null : Number(localStorage.getItem('userId')),
            categoryId:Number(categoryId.value),
            postName: input.value,  // Using search query for filtering
            pageNum:currentPage.value,
            pageSize:pageSize.value
        };
        // 执行查询
        const response = await getUserCategoryDetail(param);

        if (response && response.data) {
          categoryDetail.value = response.data;
        } else {
          // 设置默认空数据结构
          categoryDetail.value = {
            category: null,
            posts: {
              records: [],
              total: 0,
              size: pageSize.value,
              current: currentPage.value,
              pages: 0
            }
          };
        }
    }catch (error) {
    console.error('获取分类详情失败:', error);
    ElMessage.error('获取分类详情失败，请稍后重试');
    // 设置默认空数据，避免白屏
    if(categoryDetail.value){
      categoryDetail.value.posts = {
        records: [],
        total: 0,
        size: pageSize.value,
        current: currentPage.value,
        pages: 0
      };
    }
  } finally {
    loading.value = false;
  }
}

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  loadCategoryInfo();
};

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 重置为第一页
  loadCategoryInfo();
};

/**
 * 处理跳转文章详情页
 * @param postId 
 */
const handleJumpToPostDetail = (postId: number) => {
    console.log('跳转文章详情页, 文章id:', postId);
    window.open(`/postView/${userId.value}/${postId}`, '_blank');
}

onMounted(async () => {
  console.log('挂载了CategoryDetail')
  await loadCategoryInfo()
  postReadCount.value = getPostReadCount()
  postCollectCount.value = getPostCollectCount()

  document.title = categoryDetail.value?.category?.categoryName as string + '-分类专栏'
})
</script>

<style scoped>
.category-detail {
  width: 60%;
  height: 100%;
  margin: 0 auto;
  border: 1px solid #e5e5e5;
}

.head {
  width: 100%;
  /* border: 1px solid #e5e5e5; */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.head-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.image img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.intro {
  margin-left: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 2rem;
}

.description {
  font-size: 14px;
  color: #666;
}

.search-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;
}

.content-intro {
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 18px;
  color: #3d3d3d;
}

.search-button {
  margin-left: 10px;
}

.content {
  width: 100%;
  height: auto; /* Adjust height based on content */
  min-height: 600px;
  /* border: 1px solid #e5e5e5; */
  border-top: 1px solid #e5e5e5;
  /* padding: 10px; */
  overflow: hidden; /* Ensure no overflow */
  display: flex;
  flex-direction: column;
}

.head-meta {
  display: flex;
  gap: 30px;
  padding: 5px;
  margin-left: 7.8rem;
  color: #666;
  font-size: 14px;
  font-weight: 350;
  margin-top: -0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  flex: 1;
}

.post-list {
  margin-top: 0; /* Removed unnecessary margin-top */
  padding: 10px;
  flex: 1;
}

.post-item {
  display: flex;
  padding: 15px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  position: relative;
  margin-bottom: 1rem; /* Adjusted margin between items */
}

.post-item:hover {
  background-color: #faf8f8;
}

.post-image {
  width: 25%;
  max-width: 130px;
  aspect-ratio: 1.6;
  flex-shrink: 0;
  border-radius: 0.3rem;
  overflow: hidden;
  background-color: #f5f5f5;
}

.post-image img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.post-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
}

.post-meta {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.post-time {
  margin-top: 1.5rem;
}

.meta-data {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.pagination-container {
  margin-top: auto; /* 自动填充上方空间，将自己推到底部 */
  margin-bottom: 1rem;
  margin-right: 1rem;
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background: #fff; /* 确保背景色，防止内容穿过 */
}
</style>
