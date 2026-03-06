<template>
  <div class="hot-information">
    <!-- 头部 -->
    <div class="header">
      <div class="title">资讯头条</div>
      <div class="more" @click="handleJumpToMoreNews">更多资讯 &gt;</div>
    </div>

    <!-- 资讯列表（固定 3 条） -->
    <div class="list">
      <div
        v-for="(item, index) in newsList.slice(0, 3)"
        :key="index"
        class="news-item"
      >
        <img :src="`/api${item.image}`" class="cover" />

        <!-- 底部渐变遮罩 -->
        <div class="mask"></div>

        <!-- 标题 -->
        <div class="news-title">
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="HotInformation">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWhichTagStore } from '@/stores/indexWhichTag'
import { getIndexPostList } from '@/api/index/indexPage'
import type { IndexPostList } from '@/types/index'

const whichTagStore = useWhichTagStore()
const router = useRouter()

let newsList = ref<IndexPostList>([])
/**
 * 处理跳转更多资讯
 */
const handleJumpToMoreNews = () => {
  router.push('/homePage/news')
  whichTagStore.setWhichTag('news')
}

/**
 * 加载推荐资讯
 */
const loadHotNewsList = async () => {
  try {
    const po = {
      userId: null,
      tagId: null,
      postType: 1
    }
    const param = {

    }
    const res = await getIndexPostList(po, param)
    if (res.code === 200) {
      newsList.value = res.data.content
    }
  } catch (error) {
    console.error('加载资讯失败:', error)
  }
}

onMounted(() => {
  loadHotNewsList()
})
</script>

<style scoped>
.hot-information {
  width: 110%;
  padding: 0 12px;
  box-sizing: border-box;
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
}

.more {
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.more:hover {
  color: #222;
}

/* 列表 */
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 单条卡片 */
.news-item {
  position: relative;
  width: 100%;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease; 
}

.news-item:hover .cover {
  transform: scale(1.22);
}

/* 底部黑色渐变遮罩 */
.mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
  pointer-events: none;
}

/* 标题文字 */
.news-title {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  font-size: 13px;
  color: #fff;
  line-height: 1.4;
  font-weight: 500;
  pointer-events: none;
}
</style>
