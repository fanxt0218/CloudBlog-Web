<template>
  <div class="main-content">
    <div class="title-line">
      <div class="title-line-content">
          <span class="title-line-text">动态广场</span>
          <div class="create">
            <span class="create-new" @click="handleCreateShare">我也说两句</span>
            <svg t="1765630583902" class="icon create-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2487" width="20" height="20">
                <path d="M512 71.68c-242.688 0-440.32 197.632-440.32 440.32s197.632 440.32 440.32 440.32 440.32-197.632 440.32-440.32-197.632-440.32-440.32-440.32z m0 819.2c-208.896 0-378.88-169.984-378.88-378.88s169.984-378.88 378.88-378.88 378.88 169.984 378.88 378.88-169.984 378.88-378.88 378.88z" p-id="2488" fill="#ffffff">
                </path>
                <path d="M542.72 261.12H481.28v220.16H261.12v61.44h220.16v220.16h61.44v-220.16h220.16V481.28h-220.16z" p-id="2489" fill="#ffffff">
                </path>
            </svg>
          </div>
      </div>
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
            <img :src="`/api${item.userAvatar}`" class="author-avatar" />
            <span class="author-name">{{ item.userName }}</span>
          </div>

          <!-- 简介摘要 -->
          <div class="content-intro" @click="handleJumpToShareDetail(item.id)">{{ item.brief }}</div>

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
          </div>
        </div>

        <!-- 右侧封面区 -->
        <div class="right-content" v-if="item.image">
          <img :src="`/api${item.image}`" class="content-image" />
        </div>
      </div>
    </div>
  </div>

  <div class="loading" v-if="isLoading">加载中...</div>
  <div class="finished" v-if="!isLoading && isFinished && postList.length > 0">已经到底啦~</div>
</template>
<script setup lang="ts" name="ShareContent">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getIndexShareList } from '@/api/index/indexPage';
import type { IndexShares } from '@/types/index';
import router from '@/router';
import { useUserInfoStore } from '@/stores/userInfo';

const routerInstance = router;
const userInfoStore = useUserInfoStore()

let postList = ref<IndexShares>([]);

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
 * 获取主页分享列表
 */
async function loadIndexShareList() {
  if (isLoading.value || isFinished.value) return;

  isLoading.value = true;

  try {
    const params = {
      cursor: currentCursor.value,
      size: pageSize.value,
      topicId: props.selectedTagId,
    }
    const response =  await getIndexShareList(params);
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
    console.error('获取主页分享列表失败:', error);
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
      loadIndexShareList();
    }

  }, 100);
};

/**
 * 处理跳转用户主页
 * @param userId 
 */
const handleJumpToUserProfile = (userId: number) => {
    router.push(`/otherUserHome/${userId}`)
}

/**
 * 处理跳转分享详情页
 * @param shareId 
 */
const handleJumpToShareDetail = (shareId: number) => {
  // 新开启标签页
  window.open(`/shareView/${shareId}`, '_blank');
}

/**
 * 处理创建分享
 */
const handleCreateShare = () => {
  // 新开启标签页
  window.open(`/publishShare`, '_blank');
}

watch(() => props.selectedTagId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    postList.value = [];
    currentCursor.value = null;
    isFinished.value = false;
    loadIndexShareList();
  }
})

onMounted(() => {
    loadIndexShareList();
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

.title-line-content {
    display: flex;
    justify-content: space-between;
}

.create {
    border:1px solid #f39b28;
    background: #f39b28;
    border-radius: 14px;
    align-items: center;
    display: flex;
    justify-content: center;
    padding: 4px 4px;
    gap: 4px;
    cursor: pointer;

    &:hover {
        background: #e88a20;
    }
}

.create-new {
    font-size: 14px;
    font-weight: 400;
    color: #fff;
    border-radius: 12px;
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
  cursor: pointer;

  &:hover {
    color: #1680eb;
  }
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
  border: 1px solid #eeeeee70;
  border-radius: 6px;
}

.content-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  background: #f5f7fa;
  cursor: pointer;
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