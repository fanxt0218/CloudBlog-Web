<template>
  <div class="collect-container">
    <!-- 收藏夹列表：仅当没有路由参数时显示 -->
    <div class="favorites" v-if="!$route.params.favoriteId || $route.params.favoriteId === ''">
      <div 
        v-for="item in favorites || []" 
        :key="item.id" 
        class="favorite-item"
        @click="$router.push(`/userHome/collectList/${item.id}`)"
      >
        <div class="favorite-info">
          <h3 class="favorite-title">{{ item.favoritesName }}</h3>
          <p class="favorite-excerpt">{{ item.description }}</p>
          <span id="meta-data">创建时间：{{ item.createTime }}</span>
        </div>
      </div>
    </div>
    <!-- 分页查询组件：当有路由参数时，由子路由渲染 -->
    <router-view v-else class="collect-detail-container"/>
  </div>
</template>
<script lang="ts" setup name="CollectList">
import {ref,onMounted} from 'vue';
import { getUserCollectList } from '@/api/userInfo/homePage';
import type { UserCollects } from '@/types/index';

let favorites = ref<UserCollects | null>(null)

onMounted(()=>{
    getUserCollectList(Number(localStorage.getItem('userId'))).then((response)=>{
        // console.log('=====',response.data)
        favorites.value = response.data
    })
})
</script>
<style scoped>
.collect-container {
    height: 100%;
}
.favorites {
    height: 100%;
    overflow-y: auto;
    padding: 0.5rem;
    box-sizing: border-box;
    margin-top: -0.1rem;
    /* 添加滚动条样式 */
}
.favorite-item {
    display: flex;
    align-items: flex-start;
    padding: 0.3rem;
    /* 靠左 */
    margin-left: -0.3rem;
    /* 将错误的border-color改为正确的border-bottom */
    border-bottom: 1px solid #eee;
    border-radius: 12px;
    cursor: pointer;
}

.favorite-title {
    font-size: 1.2rem;
    font-weight: 500;
    margin-top: 0.4rem;
}

.favorite-excerpt {
    margin-top: -0.6rem;
    font-weight: 380;
}
.favorite-item:hover {
    background-color: #f9f9f9;
}
/* 添加滚动条样式 */
.favorites::-webkit-scrollbar {
    width: 6px;
}
.favorites::-webkit-scrollbar-track {
    background: #d6d3d3;
    border-radius: 3px;
}
.favorites::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}
.favorites::-webkit-scrollbar-thumb:hover {
    background: #555;
}

#meta-data {
    font-size: 0.8rem;
    color: #888;
}

.collect-detail-container {
    width: 100%;
    margin-left: -1.5rem;
}
</style>