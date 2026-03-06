<template>
    <div class="categoryList">
        <div class="category-item" v-for="item in categoryList?.categoryInfoList" :key="item.categoryId" @click="handleJump(item.categoryId)">
            <div class="category-image">
                <img 
                    v-if="item.image" 
                    :src="`/api${item.image}`" 
                    alt="分类图片"
                >
                <div v-else class="image-placeholder"></div>
            </div>
            <div class="category-content">
                <h3 class="title">{{ item.categoryName }}</h3>
                <p class="meta">{{ item.postCount }} 篇内容 · 阅读数待对接</p>
            </div>
        </div>
        <div v-if="categoryInfoList.length === 0" class="no-category">
            暂无分类
        </div>
    </div>
</template>
<script lang="ts" setup name="OtherCategoryList">
import { ref } from 'vue'
import { onMounted } from 'vue';
import { getUserCategory } from '@/api/userInfo/homePage'
import type { UserCategory } from '@/types';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

let router = useRouter();

let route = useRoute();
const userId = Number(route.params.userId);

let categoryList = ref<UserCategory | null>(null)

let categoryInfoList = ref([]);

// 分类跳转
const handleJump = (categoryId: number) => {
    router.push(`/otherCategoryDetail/${userId}/${categoryId}`)
}



onMounted(async () => {
    const res = await getUserCategory(userId).then(res=>{
        categoryList.value = res.data
        categoryInfoList.value = res.data.categoryInfoList || [];
    })
})
</script>
<style scoped>
/* 外层容器：设置最大高度和滚动条 */
.categoryList {
  height: 100%;
  overflow-y: auto;
  padding: 0.5rem;
  box-sizing: border-box;
}

/* 分类项：flex布局，项之间分隔 */
.category-item {
  display: flex;
  align-items: flex-start;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.category-item:last-child {
  border-bottom: none;
}

/* 分类图片：固定尺寸，保持比例 */
.category-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片占位符 */
.image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.8rem;
}

/* 分类内容：标题和元信息 */
.category-content {
  flex: 1;
}

.title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 0.3rem 0;
}

.title:hover {
  color: #135cf9;
}

.meta {
  font-size: 0.9rem;
  color: #666;
}

/* 滚动条样式优化 */
.categoryList::-webkit-scrollbar {
  width: 6px;
}

.categoryList::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.categoryList::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.categoryList::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.no-category {
  text-align: center;
  color: #999;
  margin-top: 2rem;
}
</style>