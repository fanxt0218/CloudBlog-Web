<template>
  <!-- 模板部分保持不变 -->
  <div class="postList" ref="scrollContainer">
    <!-- 文章列表 -->
    <div class="post-item" v-for="item in postList" :key="item.id" @click="handleJumpToPostDetail(item.id)">
      <!-- 图片区域 -->
      <div class="post-image">
        <img 
          v-if="item.image" 
          :src="`/api${item.image}`" 
          alt="文章图片"
        >
        <div v-else class="image-placeholder"></div>
      </div>
      
      <!-- 内容区域 -->
      <div class="post-content">
        <h3 id="post-title">{{ item.title }}</h3>
        <p id="post-intro">{{ item.introduction }}</p>
        <div class="post-meta">
          <span>发布时间&nbsp;&nbsp;{{ item.createTime }}</span>
          <span>浏览· {{ item.browseCount }}</span>
          <span>点赞· {{ item.likeCount }}</span>
          <span>收藏· {{ item.collectCount }}</span>
        </div>
        <!-- <div class="edit-wrapper">
           <span id="edit">编辑</span>
        </div> -->
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading" v-if="isLoading">加载中...</div>
    <div class="finished" v-if="!isLoading && isFinished">已经到底啦</div>
  </div>
</template>

<script lang="ts" setup name="OtherPostList">
// 脚本部分保持不变
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { getUserPostList } from '@/api/userInfo/homePage';
import type { UserPostItem } from '@/types/index';
import { eventBus } from '@/utils/eventBus';
import { useRoute } from 'vue-router';
import { pa } from 'element-plus/es/locales.mjs';

const route = useRoute();
const userId = ref<number>(Number(route.params.userId));

const loginUserId = Number(localStorage.getItem('userId'));

const scrollContainer = ref<HTMLDivElement | null>(null);
const postList = ref<UserPostItem[]>([]);
const currentCursor = ref<string | null>(null);
const pageSize = ref(10);
const postCount = ref(0);
const isLoading = ref(false);
const isFinished = ref(false);
const sortBy = ref('createTime');
const tag = ref('');

const loadData = async () => {
  if (isLoading.value || isFinished.value) return;

  isLoading.value = true;
  try {
    const params = {
      userId: userId.value,
      loginUserId: loginUserId == 0 ? null : loginUserId,
      cursor: currentCursor.value,
      size: pageSize.value,
      sortBy: sortBy.value,
      tag: tag.value,
    };

    console.log('当前登录人id', loginUserId, params)
    const response = await getUserPostList(params);
    const result = response.data;

    console.log('获取文章列表数据:', result);
    if (result.content && result.content.length > 0) {
      postList.value = [...postList.value, ...result.content];
      postCount.value = result.totalElements;
      if (result.hasNext && result.nextCursor) {
        currentCursor.value = result.nextCursor;
      } else {
        isFinished.value = true;
      }
    } else {
      isFinished.value = true;
    }
  } catch (error) {
    console.error('加载文章列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleScroll = () => {
  if (!scrollContainer.value) return;

  const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;
  if (scrollHeight - scrollTop - clientHeight <= 200) {
    loadData();
  }
};

/**
 * 处理跳转文章详情页
 * @param postId 
 */
const handleJumpToPostDetail = (postId: number) => {
    console.log('跳转文章详情页, 文章id:', postId);
    window.open(`/postView/${userId.value}/${postId}`, '_blank');
}

onMounted(() => {
  loadData();
  scrollContainer.value?.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* 基础设置：继承盒模型，确保尺寸计算一致 */
* {
  box-sizing: border-box;
}

.postList {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 1rem 0; /* 原15px，改用rem */
  height: 117.5vh; /* 保留vh单位（相对视口高度），缩放时同步变化 */
  overflow-y: auto;
  border: none;
  transition: all 0.3s ease;
  z-index: 0;
}

/* 滚动条样式保持，但尺寸用相对单位 */
.postList::-webkit-scrollbar {
  width: 0.4rem; /* 原6px */
}

.postList::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 0.6rem; /* 原10px */
}

.postList::-webkit-scrollbar-thumb {
  background-color: rgba(156, 156, 156, 0);
  border-radius: 0.6rem; /* 原10px */
  transition: background-color 0.3s ease;
}

.postList:hover::-webkit-scrollbar-thumb,
.postList.scrolling::-webkit-scrollbar-thumb {
  background-color: rgba(156, 156, 156, 0.6);
}

.postList::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 100, 100, 0.8);
}

.postList::-webkit-scrollbar-button {
  display: none;
}

/* 文章项：用相对单位控制间距和边框 */
.post-item {
  padding: 1rem; /* 原15px */
  margin-bottom: 0.7rem; /* 原15px */
  border: 1px solid #eee;
  border-radius: 0.5rem; /* 原8px */
  transition: box-shadow 0.3s;
  display: flex;
  gap: 1rem; /* 原15px，控制图片与内容的间距 */
  align-items: flex-start;
  width: 99%; /* 保持相对父容器宽度 */
  cursor: pointer;
}

.post-item:hover {
  box-shadow: 0 0.15rem 0.5rem rgba(0, 0, 0, 0.1); /* 原2px 8px */
}

/* 鼠标悬停到文章项时，显示编辑按钮 */
.post-item:hover .edit-wrapper {
  opacity: 1; /* 显示按钮 */
}

/* 图片区域：关键优化！用相对尺寸保持宽高比 */
.post-image {
  width: 25%; /* 原160px，改用相对父容器宽度的百分比 */
  max-width: 160px; /* 限制最大宽度，避免大屏幕图片过大 */
  min-width: 100px; /* 限制最小宽度，避免小屏幕图片过窄 */
  aspect-ratio: 1.6; /* 固定宽高比（160:100=1.6），替代固定height */
  flex-shrink: 0;
  border-radius: 0.3rem; /* 原4px */
  overflow: hidden;
  background-color: #f5f5f5;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 图片占位符：文字大小用rem */
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.8rem; /* 原12px */
}

/* 内容区域：保持弹性布局 */
.post-content {
  flex: 1;
  min-width: 0;
  padding-top: 0.15rem;
  position: relative; /* 关键：让编辑按钮相对于内容区定位 */
  padding-right: 3rem; /* 右侧预留编辑按钮的空间，避免内容被遮挡 */
}

/* 标题和简介：文字大小用rem，间距用相对单位 */
.post-content h3 {
  margin: 0 0 0.5rem 0; /* 原8px */
  line-height: 1.3;
}

.post-content p {
  margin: 0 0 0.55rem 0; /* 原10px */
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 限制两行，避免内容过长破坏布局 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 元数据区域：间距和文字大小用相对单位 */
.post-meta {
  margin: 0.3rem 0 0 0;
  color: #666;
  font-size: 0.86rem;
  display: flex;
  gap: 1.1rem;
  flex-wrap: wrap;
  transform: translateY(0.7rem);
  position: relative;
  z-index: 1; /* 确保元数据在按钮下方，不被遮挡 */
}

#post-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 1.3rem; /* 原21px */
  font-weight: 400;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 限制一行，避免标题过长 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

#post-title:hover {
  color: rgb(233, 55, 24);
}

#post-intro {
  font-size: 0.86rem; /* 原15px */
  font-weight: 380;
  color: #555;
}

/* 加载状态：文字大小和间距用rem */
.loading, .finished {
  text-align: center;
  padding: 0.7rem; /* 原10px */
  color: #666;
  font-size: 0.9rem; /* 原14px */
  margin-bottom: -1.3rem; /* 原-20px */
}

/* 编辑按钮容器：默认隐藏，靠右定位 */
.edit-wrapper {
  position: absolute; /* 绝对定位，脱离文档流 */
  right: 0.2rem; /* 靠右距离 */
  top: 5.05rem; /* 靠上距离 */
  opacity: 0; /* 默认透明（隐藏） */
  transition: opacity 0.05s ease; /* 显示/隐藏过渡动画 */
}

/* 编辑按钮样式：美化并添加交互反馈 */
#edit {
  color: #555;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  transition: background-color 0.05s;
}

#edit:hover {
  color: #000;
}
</style>