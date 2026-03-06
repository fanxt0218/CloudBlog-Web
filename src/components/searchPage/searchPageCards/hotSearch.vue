<template>
    <div class="hot-search-container">
        <div class="hot-search-header">
            <span class="hot-search-title">搜索热榜</span>
            <div class="header-refresh" @click="fetchHotSearch">
                <el-icon><Refresh /></el-icon>
                <span>换一换</span>
            </div>
        </div>
        <div class="hot-search-content">
            <div 
                class="hot-search-item" 
                v-for="(item, index) in hotSearchList" 
                :key="item.keyword"
                @click="handleSearch(item.keyword)"
            >
                <div class="rank-index" :class="'rank-' + (index + 1)">
                    {{ index + 1 }}
                </div>
                <div class="keyword-info">
                    <span class="keyword-text">{{ item.keyword }}</span>
                    <span class="hot-tag" v-if="index < 3">HOT</span>
                </div>
                <!-- <div class="hot-count">
                    {{ formatCount(item.count) }}
                </div> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="HotSearch">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHotSearch } from '@/api/index/searchPage'
import type { HotSearch } from '@/types/index'
import { Refresh } from '@element-plus/icons-vue'
import { useHomePageStore } from '@/stores/homePage'

const router = useRouter()
const hotSearchList = ref<HotSearch[]>([])

const fetchHotSearch = () => {
    getHotSearch().then(res => {
        hotSearchList.value = res.data
    })
}

const handleSearch = (keyword: string) => {
    router.push({
        path: '/search',
        query: { q: keyword }
    })
    useHomePageStore().setSearchKey(keyword)
}

// function formatCount(count: number) {
//     if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
//     return count
// }

onMounted(() => {
    fetchHotSearch()
})
</script>

<style scoped>
.hot-search-container {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    margin-top: 0.7rem;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.hot-search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f2;
}

.hot-search-title {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    position: relative;
    padding-left: 12px;
}

.hot-search-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #ff4d4f 0%, #ff7a45 100%);
    border-radius: 2px;
}

.header-refresh {
    font-size: 13px;
    color: #999;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
}

.header-refresh:hover {
    color: #fc5531;
}

.hot-search-content {
    padding: 10px 0;
}

.hot-search-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.hot-search-item:hover {
    background-color: #f8f8fa;
}

.rank-index {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #99a2aa;
    margin-right: 12px;
    flex-shrink: 0;
}

.rank-1 { color: #ff4d4f; font-size: 16px; }
.rank-2 { color: #ff7a45; font-size: 15px; }
.rank-3 { color: #ffa940; font-size: 14px; }

.keyword-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.keyword-text {
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.2s;
}

.hot-search-item:hover .keyword-text {
    color: #fc5531;
}

.hot-tag {
    font-size: 10px;
    color: #fff;
    background: linear-gradient(90deg, #ff4d4f 0%, #ff7a45 100%);
    padding: 1px 4px;
    border-radius: 2px;
    transform: scale(0.85);
    font-weight: 600;
}

.hot-count {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
}
</style>