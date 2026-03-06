<template>
    <div class="hot-post-bar">
        <div class="title">
            大家都在看
        </div>
        <div class="post-list">
            <div v-for="post in hotPostList.slice(0, 5)" :key="post.id" class="post-item" @click="handleViewPost(post)">
                <div class="post-info">
                    <div class="post-content">
                        <span class="post-title">{{ post.title }}</span>
                        <span class="post-view-count">
                            <img src="/assests/icon/readCountWhite.png" width="14" height="14" alt="">
                            {{ post.browseCount }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts" name="HotPostBar">
import { ref, onMounted, watch } from 'vue';
import { getBrowseTopPostList } from '@/api/index/viewPage';
import type { BrowseTopPosts } from '@/types/index';

const props = defineProps<{
    postType: number;
}>();

const hotPostList = ref<BrowseTopPosts>([]);

/**
 * 处理点击查看文章事件
 * @param post 点击的文章
 */
const handleViewPost = (post: BrowseTopPosts[0]) => {
  // 跳转到文章详情页
  window.open(`/postView/${post.authorId}/${post.id}`, '_blank');
};

watch(() => props.postType, (newType) => {
  console.log('热榜文章类型已更新为:', newType);
  getBrowseTopPostList({
    postType: props.postType,
  }).then((res) => {
    hotPostList.value = res.data;
  });
});

onMounted(async () => {
  console.log('获取热榜文章列表，文章类型:', props.postType);
  const response = await getBrowseTopPostList({
    postType: props.postType,
  });
  hotPostList.value = response.data;
});
</script>
<style scoped>
.hot-post-bar {
  top: 90px; /* 根据你的 header 高度调整 */
  width: 290px;
  background: #fff;
  /* padding: 8px 8px; */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-size: 14px;
}

.title {
  font-size: 15px;
  padding: 8px 12px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: #eee 1px solid;
  color: #fff;
  background: #09093b;
}

.post-list {
  display: flex;
  flex-direction: column;
  padding: 0 12px 18px;
  gap: 14px;
}

.post-item {
  cursor: pointer;
}

.post-info {
  position: relative;
}

.post-content {
  font-size: 15px;
  color: #575757;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-title {
  display: inline;
}

.post-view-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #8a8a8a;
  white-space: nowrap;
  margin-left: 8px;
  transform: translateY(1px);
}

/* hover 小细节 */
.post-item:hover .post-title {
  color: #ff7f6e;
}
</style>