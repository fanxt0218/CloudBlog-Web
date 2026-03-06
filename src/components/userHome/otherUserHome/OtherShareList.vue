<template>
  <div class="shareList" ref="scrollContainer">
    <div class="share-item" v-for="item in shareList" :key="item.id" @click="handleJumpToShareDetail(item.id)">
      <!-- 内容区域：title靠上，meta靠下 -->
      <div class="share-content">
        <p id="share-brief">{{ item.brief }}</p>
        <!-- 靠底的元数据 -->
        <div class="share-meta">
          <span>发布时间&nbsp;&nbsp;{{ item.createTime }}</span>
          <span>浏览· {{ item.browseCount }}</span>
          <span>点赞· {{ item.likeCount }}</span>
        </div>
        <!-- <div class="edit-wrapper">
          <span id="edit">编辑</span>
        </div> -->
      </div>

      <!-- 图片区域：单独垂直居中 -->
      <div class="share-image" v-if="item.image">
        <img :src="`/api${item.image}`" alt="分享图片" />
      </div>
    </div>

    <div class="loading" v-if="isLoading">加载中...</div>
    <div class="finished" v-if="!isLoading && isFinished">已经到底啦</div>
  </div>
</template>
<script lang="ts" setup name="OtherShareList">
import { ref, onMounted, onUnmounted } from 'vue';
import { getUserShareList } from '@/api/userInfo/homePage';
import type { UserShare, UserShareItem } from '@/types/index';
import { useRoute } from 'vue-router';

let route = useRoute();
const userId = Number(route.params.userId);

// 1. 响应式变量定义（匹配游标查询逻辑）
const scrollContainer = ref<HTMLDivElement | null>(null); // 滚动容器
const shareList = ref<UserShareItem[]>([]); // 分享列表数据
const currentCursor = ref<string | null>(null); // 当前游标
const pageSize = ref(10); // 每页条数
const shareCount = ref(0); // 总条数
const isLoading = ref(false); // 加载中状态
const isFinished = ref(false); // 加载完成状态
const sortBy = ref('createTime'); // 排序字段
const tag = ref(''); // 标签

// 2. 数据加载函数（游标查询核心逻辑）
const loadData = async () => {
  // 避免重复加载或已加载完成
  if (isLoading.value || isFinished.value) return;

  isLoading.value = true;
  try {
    // 接口参数（与PostList游标逻辑一致）
    const params = {
      userId: userId,
      cursor: currentCursor.value,
      size: pageSize.value,
      sortBy: sortBy.value,
      tag: tag.value,
    };

    // 调用分享列表接口
    const response = await getUserShareList(params);
    const result = response.data as UserShare;

    console.log('获取分享列表数据:', result);
    // 有数据则追加，更新游标
    if (result.content && result.content.length > 0) {
      shareList.value = [...shareList.value, ...result.content];
      shareCount.value = result.totalElements || 0;
      // 存在下一页则更新游标，否则标记完成
      if (result.hasNext && result.nextCursor) {
        currentCursor.value = result.nextCursor;
      } else {
        isFinished.value = true;
      }
    } else {
      isFinished.value = true; // 无数据则标记完成
    }
  } catch (error) {
    console.error('加载分享列表失败:', error);
  } finally {
    isLoading.value = false; // 无论成功失败，关闭加载状态
  }
};

// 3. 滚动加载监听
const handleScroll = () => {
  if (!scrollContainer.value) return;

  const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;
  // 距离底部200px时触发加载（与PostList一致）
  if (scrollHeight - scrollTop - clientHeight <= 200) {
    loadData();
  }
};

/**
 * 处理跳转分享详情页
 * @param shareId 
 */
const handleJumpToShareDetail = (shareId: number) => {
  window.open(`/shareView/${shareId}`, '_blank');
}

// 4. 生命周期钩子
onMounted(() => {
  loadData(); // 初始加载
  scrollContainer.value?.addEventListener('scroll', handleScroll); // 绑定滚动事件
});

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll); // 解绑滚动事件
});
</script>
<style scoped>
* { box-sizing: border-box; }

.shareList {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 1rem 0;
  min-height: 100%;
  overflow-y: auto;
  border: none;
  transition: all 0.3s ease;
  z-index: 0;
}

/* 滚动条样式（无修改） */
.shareList::-webkit-scrollbar { width: 0.4rem; }
.shareList::-webkit-scrollbar-track { background: transparent; border-radius: 0.6rem; }
.shareList::-webkit-scrollbar-thumb { background-color: rgba(156,156,156,0); border-radius: 0.6rem; transition: background-color 0.3s ease; }
.shareList:hover::-webkit-scrollbar-thumb, .shareList.scrolling::-webkit-scrollbar-thumb { background-color: rgba(156,156,156,0.6); }
.shareList::-webkit-scrollbar-thumb:hover { background-color: rgba(100,100,100,0.8); }
.shareList::-webkit-scrollbar-button { display: none; }

/* 核心修改1：item主容器改为“内容靠上，图片单独居中” */
.share-item {
  padding: 1rem;
  margin-bottom: 0.7rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  transition: box-shadow 0.3s;
  display: flex;
  gap: 1rem;
  align-items: flex-start; /* 让内容区域（share-content）靠上 */
  width: 99%;
  cursor: pointer;
  min-height: 8.4rem; /* 保持固定高度，确保有无图片一致 */
}
.share-item:hover { box-shadow: 0 0.15rem 0.5rem rgba(0,0,0,0.1); }

/* 核心修改2：内容区域内部“title靠上，meta靠下” */
.share-content {
  flex: 1; /* 占满剩余宽度 */
  min-width: 0;
  padding: 0.15rem 3rem 0.15rem 0; /* 上下留小间距，避免内容贴边 */
  position: relative;
  display: flex;
  flex-direction: column; /* 垂直排列title和meta */
  height: 100%; /* 占满item高度，为“meta靠下”提供基础 */
}

/* title样式：靠上显示（自然顶在flex容器顶部） */
#share-brief {
  font-size: 1rem;
  font-weight: 380;
  color: #555;
  margin: 0 0 0.55rem 0; /* 仅底部留间距，确保靠上 */
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 限制3行，避免内容过长撑高容器 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 核心修改3：meta靠下（通过flex自动顶开上方内容） */
.share-meta {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  gap: 1.1rem;
  flex-wrap: wrap;
  position: absolute;
  z-index: 1;
  margin-top: auto; /* 关键：自动向上顶，实现靠底 */
  margin-bottom: 0.5rem; /* 底部留小间距，避免贴边 */
  transform: translateY(400%);
}

/* 核心修改4：图片单独垂直居中（不影响内容区域） */
.share-image {
  width: 25%;
  max-width: 160px;
  min-width: 100px;
  aspect-ratio: 1.6; /* 固定宽高比，避免图片变形 */
  flex-shrink: 0;
  border-radius: 0.3rem;
  overflow: hidden;
  background-color: #f5f5f5;
  margin-left: auto; /* 保持靠右对齐 */
  align-self: center; /* 关键：图片在item内单独垂直居中 */
}
.share-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* 加载状态（无修改） */
.loading, .finished {
  text-align: center;
  padding: 0.7rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: -1.3rem;
}

/* 编辑按钮（位置微调，适配内容布局） */
.edit-wrapper {
  position: absolute;
  right: 0.2rem;
  transform: translateY(340%);
  opacity: 0;
  transition: opacity 0.05s ease;
}
.share-item:hover .edit-wrapper { opacity: 1; }
#edit {
  color: #555;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  transition: background-color 0.05s;
}
#edit:hover { color: #000; }
</style>