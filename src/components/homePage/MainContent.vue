<template>
  <div class="main-content">
    <div class="revolving-lantern">
      <el-carousel height="170px" style="border-radius: 12px;" indicator-position="none">
        <el-carousel-item v-for="item in lanternImages" :key="item">
          <img :src="item" class="content-image" />
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="recommend-tools">
      <div class="title-line">
        <span class="title-line-text">热门推荐</span>
        <hr></hr>
      </div>
      <RecommendTools />
    </div>

    <div class="title-line">
      <span class="title-line-text">精选博客</span>
      <hr></hr>
    </div>

    <div v-if="postList.length === 0" class="no-data">
      <el-empty :image-size="200" description="这里空空如也~" />
    </div>
    <div class="content-list" v-else>
      <div v-for="item in postList" :key="item.id" class="content-item">

        <!-- 左侧内容区 -->
        <div class="left-content">
          <!-- 作者信息 -->
          <div class="content-author" @click="handleJumpToUserProfile(item.userId)">
            <img :src="`/api${item.avatar}`" class="author-avatar" />
            <span class="author-name">{{ item.userName }}</span>
          </div>

          <!-- 文章标题 -->
          <div class="content-title" @click="handleJumpToPostDetail(item)">{{ item.title }}</div>

          <!-- 简介摘要 -->
          <div class="content-intro">{{ item.introduction }}</div>

          <!-- 元信息 -->
          <div class="meta-data">
            <div class="meta-icon">
              <svg t="1764945963741" class="icon" viewBox="0 0 1228 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3228" width="16" height="16">
                <path d="M614.4 1024C276.48 1024 0 798.72 0 512S276.48 0 614.4 0s614.4 225.28 614.4 512-276.48 512-614.4 512z m0-102.4c286.72 0 512-184.32 512-409.6s-225.28-409.6-512-409.6S102.4 286.72 102.4 512s225.28 409.6 512 409.6z m0-153.6c-143.36 0-256-112.64-256-256s112.64-256 256-256 256 112.64 256 256-112.64 256-256 256z m0-102.4c87.04 0 153.6-66.56 153.6-153.6s-66.56-153.6-153.6-153.6-153.6 66.56-153.6 153.6 66.56 153.6 153.6 153.6z" fill="#8a8a8a" p-id="3229">
                </path>
              </svg>
              <span>{{ item.browseCount }} 浏览</span>
            </div>
            <div class="meta-icon liking" style="cursor: pointer;">
              <svg t="1764946521735" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5143" width="16" height="16">
                <path d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z" p-id="5144" fill="#8a8a8a"></path>
              </svg>
              <span>{{ item.likeCount }} 点赞</span>
            </div>
            <div class="meta-icon collecting" style="cursor: pointer;">
              <svg t="1764946630152" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10491" width="15" height="15"><path d="M512.118374 131.072L603.766374 317.44c20.48 41.472 59.392 70.144 104.96 76.8l205.824 30.208-148.992 145.92c-32.768 32.256-47.616 78.336-39.936 123.392l35.328 205.824-183.296-96.768c-19.968-10.752-42.496-16.384-65.024-16.384-22.528 0-45.056 5.632-65.024 16.384l-183.296 96.768 35.328-205.824c7.68-45.056-7.168-91.136-39.936-123.392L109.686374 424.448 314.998374 394.24c45.568-6.656 84.992-35.328 104.96-76.8l92.16-186.368m0-112.64c-20.48 0-41.472 10.752-51.712 32.256L346.742374 281.6c-8.192 16.896-24.576 29.184-43.52 31.744L49.270374 350.208C2.166374 357.376-16.777626 415.232 17.526374 449.024l183.808 180.224c13.312 13.312 19.968 32.256 16.384 51.2l-43.52 253.952c-6.144 37.376 23.552 67.584 56.832 67.584 8.704 0 17.92-2.048 27.136-6.656L484.982374 875.52c8.192-4.608 17.92-6.656 27.136-6.656 9.216 0 18.432 2.048 27.136 6.656l226.816 119.808c8.704 4.608 17.92 6.656 27.136 6.656 33.792 0 63.488-30.208 56.832-67.584l-43.52-253.952c-3.072-18.944 3.072-37.888 16.384-51.2l183.808-180.224c34.304-33.28 15.36-91.648-32.256-98.304l-253.952-36.864c-18.944-2.56-35.328-14.848-43.52-31.744L563.830374 50.688c-10.752-21.504-31.232-32.256-51.712-32.256z" p-id="10492" fill="#8a8a8a"></path></svg>
              <span>{{ item.collectCount }} 收藏</span>
            </div>
          </div>
        </div>

        <!-- 右侧封面区 -->
        <div class="right-content" v-if="item.image" @click="handleJumpToPostDetail(item)">
          <img :src="`/api${item.image}`" class="content-image" />
        </div>
      </div>
    </div>
  </div>

  <div class="loading" v-if="isLoading">加载中...</div>
  <div class="finished" v-if="!isLoading && isFinished && postList.length > 0">已经到底啦~</div>
</template>

<script setup lang="ts" name="MainContent">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getIndexPostList } from '@/api/index/indexPage'
import  RecommendTools from '@/components/homePage/RecommendTools.vue'
import type { IndexPostList, IndexPost } from '@/types/index'
import { de, lo, pa } from 'element-plus/es/locales.mjs';
import router from '@/router';
import { useUserInfoStore } from '@/stores/userInfo';

const routerInstance = router;
const userInfoStore = useUserInfoStore();

let postList = ref<IndexPostList>([]);

let lanternImages = ref([
  "/api/profile/system/index-revolving-lantern/lantern"+Math.floor(Math.random()*3+1)+".png",
])

const scrollContainer = ref<HTMLDivElement | null>(null);
const currentCursor = ref<string | null>(null);
const pageSize = ref(10);
const postCount = ref(0);
const isLoading = ref(false);
const isFinished = ref(false);
const sortBy = ref('createTime');
const tag = ref('');

const props = defineProps<{
  selectedTagId: number
}>()

/**
 * 获取主页文章列表
 */
async function loadIndexPostList() {
  if (isLoading.value || isFinished.value) return;

  isLoading.value = true;

  try {
    const po = {
      userId: userInfoStore.userId || null,
      tagId: props.selectedTagId,
      postType: null
    };
    const params = {
      cursor: currentCursor.value,
      size: pageSize.value,
      sortBy: sortBy.value,
      tag: tag.value
    }
    const response =  await getIndexPostList(po, params);
    const result = response.data;
    
    if (result.content && result.content.length > 0) {
      postList.value.push(...result.content);
      if ( result.hasNext && result.nextCursor) {
        currentCursor.value = result.nextCursor;
      } else {
        isFinished.value = true;
      }
    } else {
      isFinished.value = true;
    }
  } catch (error) {
    console.error('获取主页文章列表失败:', error);
  } finally {
    isLoading.value = false;
  }
}

let scrolling = false;
const handleScroll = () => {
  if (scrolling) return;
  scrolling = true;

  setTimeout(() => {
    scrolling = false;

    if (isLoading.value || isFinished.value) return;

    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;

    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadIndexPostList();
    }

  }, 100);
};

/**
 * 处理跳转用户主页
 * @param userId 
 */
const handleJumpToUserProfile = (userId: number) => {
    // router.push(`/otherUserHome/${userId}`)
    window.open(`/otherUserHome/${userId}`, '_blank');
}

/**
 * 处理跳转文章详情页
 * @param postId 
 */
const handleJumpToPostDetail = (post: IndexPost) => {
    console.log('跳转文章详情页, 文章id:', post.id);
    window.open(`/postView/${post.userId}/${post.id}`, '_blank');
}

watch(() => props.selectedTagId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    postList.value = [];
    currentCursor.value = null;
    isFinished.value = false;
    loadIndexPostList();
  }
})

onMounted(() => {
    loadIndexPostList();
    window.addEventListener("scroll", handleScroll);
})

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>
<style scoped>
.main-content {
  padding: 10px 0;
  width: 100%;
  /* height: 80%; */
}

/* ------- 轮播区域 ------- */
.revolving-lantern {
  max-height: 170px;
  margin-bottom: 20px;
  cursor: pointer;
}

.revolving-lantern :deep(.el-carousel__arrow) {
  display: none !important;
}

.recommend-tools {
  width: 100%;
}

/* ------- 标题行 ------- */
.title-line {
  /* margin: 20px 0 10px; */
  font-size: 18px;
  font-weight: bold;
  padding-left: 4px;
}

/* ------- 列表整体 ------- */
.content-list {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 0 5px;
  /* border-top: 1px solid #d3d2d2; */
}

/* ------- 单个内容项（参考 GitCode 样式） ------- */
.content-item {
  display: flex;
  justify-content: space-between;
  padding: 18px 0;
  border-bottom: 1px solid #f0f0f0;
}

.content-item:last-child {
  border-bottom: none;
}

/* 左侧内容区域 */
.left-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-right: 20px;
}

/* 作者行 */
.content-author {
  display: flex;
  align-items: center;
  margin-bottom: 6px;

  &:hover {
    .author-name {
      color: #1680eb;
    }
  }
}

.author-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ddd;
  margin-right: 8px;
  cursor: pointer;
}

.author-name {
  color: #282829;
  font-size: 14px;
  cursor: pointer;
}

.author-name:hover {
  color: #1680eb;
}

/* 标题，和 GitCode 一样粗体并靠上 */
.content-title {
  font-size: 18px;
  font-weight: 550;
  margin-bottom: 6px;
  color: #333;
  cursor: pointer;
}

.content-title:hover {
  color: #1680eb;
}

/* 摘要/简介 */
.content-intro {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
  line-height: 1.5;
  /* 最多两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 元信息行 */
.meta-data {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: #909399;
  /* margin-bottom: -1px; */
}

/* 右侧封面图 */
.right-content {
  width: 140px;
  height: 90px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid #eeeeee70;
  border-radius: 6px;
}

.content-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  background: #f5f7fa;
}

.meta-icon {
  display: flex;
  align-items: center;
  gap: 4px;
}

.liking:hover .collecting:hover {
  color: #333;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: #909399;
}

.finished {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: #434344;
}

.no-data {
  margin-top: 4rem;
}

hr {
  margin-top: 10px;
  margin-bottom: 0;
  border: none;
  height: 1px;
  background-color: #dadada;
}
</style>
