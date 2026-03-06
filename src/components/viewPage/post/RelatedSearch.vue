<template>
  <div class="related-search">
    <div class="header">
      <span class="title">相关文章</span>
    </div>
    
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="list && list.length > 0" class="result-list">
      <div v-for="item in list" :key="item.id" class="result-item" @click="handleJumpToPost(item)">
        <div class="item-header">
          <div class="item-title" v-html="item.title"></div>
          <div class="item-meta-container">
            <span class="author-name">{{ item.authorName }}</span>
            <div class="meta-toggle">
               <span class="view-count">
                  <el-icon><View /></el-icon> {{ item.viewCount }}
               </span>
               <span class="publish-date">
                  {{ formatTimeYMD(item.createTime) }}
               </span>
            </div>
          </div>
        </div>
        <div class="item-intro" v-html="item.introduction"></div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty :image-size="100" description="暂无相关内容" />
    </div>
  </div>
</template>

<script setup lang="ts" name="RelatedSearch">
import { ref, watch } from 'vue';
import { search } from '@/api/index/searchPage';
import { formatTimeYMD } from '@/utils/timeUtil';
import { View } from '@element-plus/icons-vue';

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  },
  postId: {
    type: Number,
    default: 0
  }
});

const list = ref<any[]>([]);
const loading = ref(false);

const fetchRelatedContent = async () => {
  if (!props.keyword) return;
  
  loading.value = true;
  try {
    // Calling search API: keyword, time, level, sort, isVip, size, cursor
    const res = await search(
      props.keyword,
      null,
      null,
      null,
      null,
      '10', // Limit to 10
      null
    ) as any;
    
    if (res.code === 200) {
      // Filter out current post if API returns it? 
      // For now just show what API returns as "related"
      list.value = res.data.content || [];
      list.value = list.value.filter((item: any) => item.id !== props.postId); // 过滤当前文章
    }
  } catch (error) {
    console.error('Failed to fetch related content:', error);
  } finally {
    loading.value = false;
  }
};

const handleJumpToPost = (item: any) => {
  window.open(`/postView/${item.authorId}/${item.id}`, '_blank');
};

watch(() => props.keyword, (newVal) => {
  if (newVal) {
    fetchRelatedContent();
  }
}, { immediate: true });

</script>

<style scoped>
.related-search {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  margin-top: 20px;
}

.header {
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  /* border-left: 4px solid #1e80ff;  */
  /* padding-left: 10px; */
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.result-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  font-size: 16px;
  color: #1d2129;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
  margin-right: 15px;
}

.item-title:hover {
  color: #f56c6c;
}

/* Red highlight for matched keywords if backend returns HTML */
:deep(em) {
  color: #f56c6c;
  font-style: normal;
}

.item-meta-container {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #86909c;
  flex-shrink: 0;
  min-width: 120px; /* Ensure space for toggle */
  justify-content: flex-end;
}

.author-name {
  margin-right: 15px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-toggle {
  position: relative;
  width: 80px; /* Fixed width to prevent jumping */
  height: 20px;
  overflow: hidden; 
}

.view-count, .publish-date {
  position: absolute;
  top: 0;
  right: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

/* Default state: View count visible, Date hidden (moved down/up) */
.view-count {
  transform: translateY(0);
  opacity: 1;
}

.publish-date {
  transform: translateY(100%);
  opacity: 0;
}

.result-item:hover .view-count {
  transform: translateY(-100%);
  opacity: 0;
}

.result-item:hover .publish-date {
  transform: translateY(0);
  opacity: 1;
}

.item-intro {
  font-size: 14px;
  color: #86909c;
  line-height: 22px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.empty-state {
  padding: 40px 0;
}
</style>
