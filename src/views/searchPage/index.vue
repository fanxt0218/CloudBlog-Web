<template>
    <div class="search-page-index">
        <div class="main-content">
            <SearchFilterBar :searchResultCount="searchResultCount"/>
            <div class="content-area">
                <SearchUserResult v-if="currentTab === 'user'" @searchResultCount="handleSearchResultCount" />
                <SearchResultList v-else @searchResultCount="handleSearchResultCount"  />
                <div class="right-area">
                    <HotSearch />
                    <!-- <HotSearch /> -->
                </div>
            </div>
        </div>
        <div class="back-top">
            <el-backtop :right="100" :bottom="60" />
        </div>
    </div>
</template>
<script setup lang="ts" name="SearchPageIndex">
import SearchFilterBar from '@/components/searchPage/SearchFilterBar.vue'
import SearchResultList from '@/components/searchPage/SearchResultList.vue'
import SearchUserResult from '@/components/searchPage/SearchUserResult.vue'
import HotSearch from '@/components/searchPage/searchPageCards/hotSearch.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute();
const currentTab = computed(() => route.query.tab as string || 'all');
const searchResultCount = ref(0);

const handleSearchResultCount = (count: number) => {
    console.log('搜索结果数量', count);
    searchResultCount.value = count;
}

// 监听搜索关键词变化，标签赋值
watch(() => route.query.q, () => {
    console.log('newKeyword', route.query.q);
    document.title = route.query.q + ' -CloudBlog搜索'
})

onMounted(() => {
    document.title = route.query.q + ' -CloudBlog搜索'
})
</script>
<style scoped>
.search-page-index {
    width: 100%;
    height: 100%;
    background-color: #f0f0f048;
}
.main-content {
    width: 70%;
    height: 100%;
    margin: 0 auto;
}
.content-area {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
}
/* 让搜索结果列表占据剩余空间 */
:deep(.search-result-list) {
    flex: 1;
    min-width: 0;
}
.right-area {
    width: 25%;
    flex-shrink: 0;
}

:deep(.el-backtop) {
    color: #fc5531;
}
</style>