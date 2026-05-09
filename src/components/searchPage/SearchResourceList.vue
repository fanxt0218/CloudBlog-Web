<template>
    <div class="search-resource-list">
        <div class="result-item" v-for="item in resourceList" :key="item.id" v-if="resourceList.length !== 0">
            <div class="item-format">{{ item.resourceFormat?.toUpperCase() || 'FILE' }}</div>
            <div class="item-content">
                <div class="resource-name" v-html="highlightKeyword(item.resourceName)" @click="handleJumpToDetail(item)"></div>
                <div class="resource-desc" v-if="item.resourceDescription">{{ item.resourceDescription }}</div>
                <div class="resource-meta">
                    <div class="statistics-info">
                        <span class="meta-item">{{ item.resourceSize }}</span>
                        <span class="meta-divider">·</span>
                        <span class="meta-item">{{ item.downloadCount || 0 }} 下载</span>
                    </div>
                    <div class="author-info">
                        <span class="meta-item author-name" @click.stop="handleJumpToUserProfile(item.resourceCreator)">{{ item.resourceCreatorName }}</span>
                        <span class="meta-divider">·</span>
                        <span class="meta-item">{{ formatTime(item.resourceCreateTime) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="loading" v-if="isLoading">加载中...</div>
        <div class="finished" v-if="isFinished && resourceList.length !== 0">没有更多了</div>
        <div class="empty-result" v-if="!isLoading && isFinished && resourceList.length === 0">
             <el-empty :image-size="200" :description="'没有找到相关的资源'"/>
        </div>
    </div>
</template>

<script setup lang="ts" name="SearchResourceList">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getIndexResource } from '@/api/create/resource'
import { addSearchHistory } from '@/api/index/searchPage'

const route = useRoute()
const router = useRouter()

const emit = defineEmits(['searchResultCount'])

const searchKey = computed(() => route.query.q as string)
// vco: VIP内容
const isVipOnly = computed(() => route.query.vco as string)
const resourceList = ref<any[]>([])
const isLoading = ref(false)
const isFinished = ref(false)
const hasNext = ref(true)
const currentCursor = ref<string | null>(null)
const pageSize = ref(10)
const userId = ref<number>(Number(localStorage.getItem('userId')))

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.split(' ')[0];
}

/**
 * 关键字高亮
 */
const highlightKeyword = (text: string) => {
    if (!text || !searchKey.value) return text;
    // 简单的客户端高亮
    const reg = new RegExp(searchKey.value, 'gi');
    return text.replace(reg, (match) => `<em>${match}</em>`);
}

/**
 * 加载数据
 */
const loadData = async () => {
    if (isLoading.value || isFinished.value) return;
    isLoading.value = true;
    
    try {
        const po = {
            name: searchKey.value || null,
            vip: isVipOnly.value === '1' ? 1 : null
        }
        const params = {
            cursor: currentCursor.value,
            size: pageSize.value
        }
        
        const res: any = await getIndexResource({ po, params });
        if (res.code === 200) {
            const data = res.data;
            const content = data.content || [];
            
            resourceList.value.push(...content);
            isFinished.value = !data.hasNext;
            hasNext.value = data.hasNext;
            
            if (data.nextCursor) {
                try {
                    const cursorArray = JSON.parse(data.nextCursor);
                    currentCursor.value = Array.isArray(cursorArray) ? cursorArray.join(',') : data.nextCursor;
                } catch (e) {
                    currentCursor.value = data.nextCursor;
                }
            }
            // 这里的总数需要后端返回 totalElements，如果没有则退而求其次使用当前列表长度
            emit('searchResultCount', data.totalElements !== undefined ? data.totalElements : resourceList.value.length);
        }
    } catch (error) {
        console.error('加载资源数据失败:', error);
    } finally {
        isLoading.value = false;
    }
}

/**
 * 监听页面滚动
 */
const handleScroll = () => {
    if (isLoading.value || isFinished.value || !hasNext.value) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= scrollHeight - 100) {
        loadData();
    }
}

const handleJumpToDetail = (item: any) => {
    window.open(`/resourceDetail/${item.id}`, '_blank');
}

const handleJumpToUserProfile = (creatorId: number) => {
    window.open(`/otherUserHome/${creatorId}`, '_blank');
}

onMounted(() => {
    loadData();
    window.addEventListener('scroll', handleScroll);
    if (userId.value && searchKey.value && route.query.tab === 'download') {
        addSearchHistory(userId.value, searchKey.value, '资源');
    }
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
})

watch(() => route.query, (newQuery, oldQuery) => {
    if (newQuery.tab !== 'download') return;
    
    // 检查核心查询参数是否发生变化
    const changed = 
        newQuery.q !== oldQuery.q || 
        newQuery.vco !== oldQuery.vco || 
        newQuery.t !== oldQuery.t || 
        newQuery.l !== oldQuery.l || 
        newQuery.s !== oldQuery.s ||
        oldQuery.tab !== 'download';

    if (changed) {
        resourceList.value = [];
        currentCursor.value = null;
        isFinished.value = false;
        hasNext.value = true;
        loadData();
        if (userId.value && searchKey.value) {
            addSearchHistory(userId.value, searchKey.value, '资源');
        }
    }
}, { deep: true });
</script>

<style scoped>
.search-resource-list {
    background-color: #fff;
    padding: 5px 20px;
    margin-top: 0.7rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);
}

.result-item {
    display: flex;
    gap: 16px;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
    border-bottom: none;
}

.item-format {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  background: rgba(230, 126, 34, 0.1);
  color: #e67e22;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 14px;
  /* 每行3字符 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
  box-sizing: border-box;
}

.item-content {
    flex: 1;
    min-width: 0;
}

.resource-name {
    font-size: 17px;
    color: #181818;
    line-height: 1.5;
    margin-bottom: 6px;
    cursor: pointer;
    transition: color 0.2s;
}

.resource-name:hover {
    color: #fc5531;
}

.resource-name :deep(em) {
    color: #fc5531;
    font-style: normal;
}

.resource-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.resource-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #696868;
}

.statistics-info, .author-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 350;
}

.meta-divider {
    color: #eee;
}

.author-name {
    cursor: pointer;
}

.author-name:hover {
    color: #fc5531;
}

.loading, .finished {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: #909399;
}

.finished {
    color: #434344;
}

.empty-result {
    min-height: calc(100vh - 200px);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>