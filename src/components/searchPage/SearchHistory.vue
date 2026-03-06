<template>
    <div class="combined-search-pane">
        <!-- Left Pane: Search History -->
        <div class="search-history-section">
            <div class="pane-header">
                <span class="pane-title">搜索历史</span>
                <div class="header-clear" v-if="searchHistoryList.length > 0" @click="clearUserSearchHistory">
                    <el-icon><Delete /></el-icon>
                    <span>清空</span>
                </div>
            </div>
            <div class="pane-content">
                <div 
                    class="history-item" 
                    v-for="item in searchHistoryList" 
                    :key="item.id"
                    @click="handleSearch(item.keyword)"
                >
                    <div class="keyword-info">
                        <el-icon class="history-icon"><Clock /></el-icon>
                        <span class="keyword-text">{{ item.keyword }}</span>
                    </div>
                    <div class="delete-icon" @click.stop="deleteUserSearchHistory(item.id)">
                        <el-icon><Close /></el-icon>
                    </div>
                </div>
                <div class="empty-state" v-if="searchHistoryList.length === 0">
                    暂无搜索历史
                </div>
            </div>
        </div>

        <!-- Vertical Divider -->
        <div class="pane-divider"></div>

        <!-- Right Pane: Hot Search -->
        <div class="hot-search-section">
            <div class="pane-header">
                <span class="pane-title hot-title">搜索热榜</span>
                <!-- <div class="header-refresh" @click="fetchHotSearch">
                    <el-icon><Refresh /></el-icon>
                    <span>换一换</span>
                </div> -->
            </div>
            <div class="pane-content">
                <div 
                    class="hot-item" 
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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="SearchHistory">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSearchHistory, deleteSearchHistory, clearSearchHistory, getHotSearch } from '@/api/index/searchPage'
import type { SearchHistory, HotSearch } from '@/types/index'
import { Delete, Close, Refresh, Clock } from '@element-plus/icons-vue'
import { useHomePageStore } from '@/stores/homePage'

const router = useRouter()
const route = useRoute()
const searchHistoryList = ref<SearchHistory[]>([])
const hotSearchList = ref<HotSearch[]>([])

const fetchSearchHistory = () => {
    if (!localStorage.getItem('userId') || localStorage.getItem('userId') == '0') {
        searchHistoryList.value = []
        return
    }
    getSearchHistory(Number(localStorage.getItem('userId'))).then(res => {
        searchHistoryList.value = res.data
    })
}

const fetchHotSearch = () => {
    getHotSearch().then(res => {
        hotSearchList.value = res.data
    })
}

const handleSearch = (keyword: string) => {
    if (route.name === 'search') {
      router.replace({ name: 'search', query: { q: keyword } })
    } else {
      console.log('push')
      // 另起标签页
      window.open('/search?q=' + keyword, '_blank')
    }
    useHomePageStore().setSearchKey(keyword)
}

const deleteUserSearchHistory = (id: number) => {
    if (!localStorage.getItem('userId') || localStorage.getItem('userId') == '0') {
        searchHistoryList.value = []
        return
    }
    deleteSearchHistory([id]).then(res => {
        fetchSearchHistory()
    })
}

const clearUserSearchHistory = () => {
    if (!localStorage.getItem('userId') || localStorage.getItem('userId') == '0') {
        searchHistoryList.value = []
        return
    }
    clearSearchHistory(Number(localStorage.getItem('userId'))).then(res => {
        fetchSearchHistory()
    })
}

onMounted(() => {
    fetchSearchHistory()
    fetchHotSearch()
})
</script>

<style scoped>
.combined-search-pane {
    display: flex;
    background-color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.search-history-section, .hot-search-section {
    flex: 1;
    padding: 12px 0;
    min-width: 0;
}

.pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 10px;
    /* margin-bottom: 4px; */
}

.pane-title {
    font-size: 14px;
    font-weight: 500;
    color: #222;
}

.hot-title {
    position: relative;
    padding-left: 10px;
}

.hot-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    background: linear-gradient(180deg, #ff4d4f 0%, #ff7a45 100%);
    border-radius: 2px;
}

.header-clear, .header-refresh {
    font-size: 12px;
    color: #999;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
}

.header-clear:hover, .header-refresh:hover {
    color: #fc5531;
}

.pane-content {
    max-height: 360px;
    overflow-y: auto;
}

/* History Items */
.history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.history-item:hover {
    background-color: #f7f7f9;
}

.history-icon {
    font-size: 14px;
    color: #bbb;
    margin-right: 8px;
}

.keyword-info {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
}

.keyword-text {
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.delete-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.2s;
}

.history-item:hover .delete-icon {
    opacity: 1;
}

.delete-icon:hover {
    background-color: #eee;
    color: #666;
}

/* Hot Items */
.hot-item {
    display: flex;
    align-items: center;
    padding: 7px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.hot-item:hover {
    background-color: #f7f7f9;
}

.rank-index {
    width: 20px;
    font-size: 13px;
    font-weight: 700;
    color: #99a2aa;
    margin-right: 12px;
    text-align: center;
}

.rank-1 { color: #ff4d4f; }
.rank-2 { color: #ff7a45; }
.rank-3 { color: #ffa940; }

.hot-tag {
    font-size: 10px;
    color: #fff;
    background: linear-gradient(90deg, #ff4d4f 0%, #ff7a45 100%);
    padding: 0 4px;
    border-radius: 2px;
    margin-left: 6px;
    transform: scale(0.85);
}

.pane-divider {
    width: 1px;
    background-color: #f0f0f2bb;
    margin: 12px 0;
}

.empty-state {
    padding: 24px 0;
    text-align: center;
    color: #999;
    font-size: 13px;
}

/* Scrollbar */
.pane-content::-webkit-scrollbar {
    width: 5px;
}
.pane-content::-webkit-scrollbar-thumb {
    background-color: #e8e8e8;
    border-radius: 3px;
}
</style>
