<template>
    <div class="news-content">
        <div class="news-content-header">
          <div
            class="news-header-item"
            v-for="item in newsList.slice(0, 4)"
            :key="item.id"
            @click="handleJumpToNewsDetail(item)"
          >
            <img :src="`/api${item.image}`">
            <div class="news-header-title">{{ item.title }}</div>
          </div>
        </div>
        <div class="news-top-small-list">
          <div
            v-for="item in newsList.slice(4, 8)"
            :key="item.id"
            class="small-item"
          >
            <div class="dot"></div>
            <div class="small-title" @click="handleJumpToNewsDetail(item)">{{ item.title }}</div>
          </div>
        </div>
        <div class="title-line">
          <span class="title-line-text">热门资讯</span>
          <hr></hr>
        </div>
        <div class="news-content-list">
            
        </div>
        <div v-if="newsList.length === 0" class="no-data">
          <el-empty :image-size="200" description="这里空空如也~" />
        </div>
        <div class="content-list" v-else>
          <div v-for="item in newsList.slice(8)" :key="item.id" class="content-item">

            <!-- 左侧内容区 -->
            <div class="left-content">
              <!-- 资讯标题 -->
              <div class="content-title" @click="handleJumpToNewsDetail(item)">{{ item.title }}</div>

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
            <div class="right-content" v-if="item.image" @click="handleJumpToNewsDetail(item)">
              <img :src="`/api${item.image}`" class="content-image" />
            </div>
          </div>
        </div>
    </div>

    <div class="loading" v-if="isLoading">加载中...</div>
    <div class="finished" v-if="!isLoading && isFinished && newsList.length > 0">已经到底啦~</div>
</template>
<script setup lang="ts" name="NewsContent">
import { ref, onMounted, onUnmounted } from 'vue'
import { getIndexPostList } from '@/api/index/indexPage'
import type { IndexPostList, IndexPost } from '@/types/index'
import { de } from 'element-plus/es/locales.mjs';
import { useUserInfoStore } from '@/stores/userInfo';

const userInfoStore = useUserInfoStore()
const scrollContainer = ref<HTMLDivElement | null>(null);
const currentCursor = ref<string | null>(null);
const pageSize = ref(10);
const postCount = ref(0);
const isLoading = ref(false);
const isFinished = ref(false);
const sortBy = ref('createTime');
const tag = ref('');

const defaultPageSize = 20;

let newsList = ref<IndexPostList>([])

/**
 * 获取主页文章列表
 */
async function loadIndexPostList(pageSizeParam?: number) {
  if (isLoading.value || isFinished.value) return;

  isLoading.value = true;

  try {
    const po = {
      userId: userInfoStore.userId || null,
      tagId: null,
      postType: 1
    };
    const params = {
      cursor: currentCursor.value,
      size: pageSizeParam? pageSizeParam : pageSize.value,
      sortBy: sortBy.value,
      tag: tag.value
    }
    const response =  await getIndexPostList(po, params);
    const result = response.data;
    
    if (result.content && result.content.length > 0) {
      newsList.value.push(...result.content);
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
 * 处理跳转文章详情页
 * @param postId 
 */
const handleJumpToNewsDetail = (post: IndexPost) => {
    console.log('跳转文章详情页, 文章id:', post.id);
    window.open(`/postView/${post.userId}/${post.id}`, '_blank');
}

onMounted(() => {
    loadIndexPostList(defaultPageSize);
    window.addEventListener("scroll", handleScroll);
})

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});


</script>
<style scoped>
.news-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  /* gap: 5px; */
}

/* ===== 顶部四条资讯 ===== */
.news-content-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 10px;
  /* border-bottom: 1px solid #eee; */
}

.news-header-item {
  width: 100%;
  height: 145px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #f5f5f5;
}

.news-header-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
    transition: all .5s;
    transition-behavior: normal;
    transition-duration: 0.5s;
    transition-timing-function: ease;
    transition-delay: 0s;

}

.news-header-item:hover img {
  transform: scale(1.40);
}

/* 关键：标题底部居中 */
.news-header-title {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  
  /* 标题样式 */
  font-size: 13px;
  line-height: 1.5;            /* 缩小行间距 */
  color: #fff;
  font-weight: 500;
  text-align: center;
  padding: 10px 12px 6px;

  /* 渐变背景 */
  background: linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0));

  /* 限制两行 + 超出省略号 */
  display: -webkit-box;
  -webkit-line-clamp: 2;        /* 限制 2 行 */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  /* 为了兼容多行省略保持居中 */
  justify-content: center;
  align-items: flex-end;

  /* 避免文字贴边 */
  box-sizing: border-box;
  
  /* 最大字符长度（30 左右字符） */
  max-height: calc(1.2em * 2 + 20px); /* 保留两行高度 */
}
/* ===== 顶部四条资讯下的小列表 ===== */
/* ===== 顶部小资讯列表 (2 列 × 2 行) ===== */
.news-top-small-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 30px;   /* 行、列间距 */
  margin: 10px 0;
  padding: 4px 2px;
  padding-top: 10px;
  border-top: 1px solid #eeeeee9a;
}

/* 每条小资讯 */
.small-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  /* margin-bottom: 5px; */
  padding-bottom: 6px;
  border-bottom: 1px solid #eeeeee9a;
}

.small-item:hover .small-title {
  color: #228efa;
}

/* 左侧小圆点 */
.dot {
  width: 7px;
  height: 7px;
  background: #c7c7c7;
  /* border-radius: 50%; */
}

/* 标题文本样式 */
.small-title {
  font-size: 15px;
  color: #0f0f0f;
  /* 字间距 */
  letter-spacing: 0.5px;

  /* 单行省略号 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* ===== 标题行样式 ===== */
.title-line {
  display: flex;
  align-items: center;
  margin: 10px 0 10px;
}

.title-line-text {
  font-size: 18px;
  font-weight: 600;
  margin-right: 10px;
}

.title-line hr {
  flex: 1;
  height: 1px;
  border: none;
  background: #e5e5e5;
}

/* ===== 列表内容区 ===== */
.content-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 每条内容 */
.content-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  /* padding: 14px; */
  /* border-radius: 10px; */
  /* border: 1px solid #eee; */
  background: #fff;
  /* transition: .2s ease; */
  border-bottom: 1px solid #f0f0f0;
}


/* 左边内容 */
.left-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-title {
  font-size: 17px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  cursor: pointer;

  &:hover {
    color: #1680eb;
  }
}

.content-intro {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-right: 12px;
}

/* 元信息(浏览赞收藏) */
.meta-data {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.meta-icon {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #888;
}

.meta-icon svg {
  fill: #8a8a8a;
}

/* 右边封面 */
.right-content {
  width: 135px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 9px;
  overflow: hidden;
  /* transform: translateY(-10%); */
  cursor: pointer;
  border: 1px solid #eeeeee70;
}

.content-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 空状态 */
.no-data {
  margin-top: 30px;
}

/* 加载 & 结束文案 */
.loading,
.finished {
  text-align: center;
  padding: 16px 0;
  color: #888;
  font-size: 14px;
}

</style>
