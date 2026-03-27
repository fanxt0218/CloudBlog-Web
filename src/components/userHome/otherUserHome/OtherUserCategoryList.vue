<template>
    <div class="category-card">
        <h3 class="card-title">分类专栏</h3>
        <div class="category-list">
            <div class="category-item" v-for="item in CategoryList?.categoryInfoList || []" :key="item.categoryId">
                <img :src="`/api${item.image}`" class="category-icon" alt="category icon">
                <span class="category-name">{{ item.categoryName }}</span>
                <span class="post-count">{{ item.postCount }}篇</span>
            </div>
            <div v-if="!CategoryList || CategoryList.categoryInfoList.length === 0" class="no-category">
                暂无分类信息
            </div>
        </div>
    </div>
</template>
        
<script lang="ts" setup name="OtherUserCategory">
import {ref} from 'vue';
import { onMounted } from 'vue';
import type { UserCategory } from '@/types';
import { getUserCategory } from '@/api/userInfo/homePage';
import {useUserHomeStore} from '@/stores/userHome';

let CategoryList = ref<UserCategory| null>(null);

const props = defineProps<{ userId: number }>();
const userId = props.userId;

onMounted( async()=>{
    await getUserCategory(userId).then(res=>{
        CategoryList.value = res.data;
    })

   useUserHomeStore().categoryCount = CategoryList.value?.categoryInfoList?.length || 0;
})
</script>
<style scoped>

.category-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.4rem; /* 原6px */
    padding: 1rem; /* 原16px，用rem减少冗余内边距 */
    width: 99%; /* 关键：填满父容器（.left-section）的宽度 */
    min-height: 100%; /* 移除固定min-height，由内容撑开高度 */
    box-sizing: border-box; /* 确保padding不增加总宽度 */
    background-color: #ffffff;
}

/* 标题样式：用相对单位，减少底部边框间距 */
.card-title {
    font-size: 1.2rem; /* 原18px */
    font-weight: 450;
    margin-top: 0;
    padding-bottom: 0.5rem; /* 原8px */
    border-bottom: 1px solid #e5e7eb;
}

.category-list {
    margin-top: -0.5rem;
}

.category-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    cursor: pointer;
    /* border-bottom: 1px dashed #e5e7eb; */
}

.category-icon {
    width: 24px;
    height: 24px;
    object-fit: cover;
    margin-right: 0.5rem;
    background-color: #f0f0f0;
}

.category-name {
    flex: 1;
    margin-right: 0.5rem;
    color: #333;
}

.category-name:hover {
    color: #000;
}

.post-count {
    color: #666;
    font-size: 15px;
}

.no-category {
    text-align: center;
    color: #999;
    font-size: 14px;
    margin-top: 1rem;
}
</style>
