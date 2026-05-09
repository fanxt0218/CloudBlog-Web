<template>
    <div class="search-result-list">
        <div class="result-item" v-for="item in list?.content" :key="item.id" v-if="list?.content.length !== 0">
            <div class="content-title" v-html="item.title" @click="handleJumpToPostDetail(item)"></div>
            <div class="content-intro" v-html="item.introduction"></div>
            <div class="meta-data">
                <div class="statistics-info">
                    <div class="meta-icon">
                        <svg t="1764945963741" class="icon" viewBox="0 0 1228 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3228" width="16" height="16">
                          <path d="M614.4 1024C276.48 1024 0 798.72 0 512S276.48 0 614.4 0s614.4 225.28 614.4 512-276.48 512-614.4 512z m0-102.4c286.72 0 512-184.32 512-409.6s-225.28-409.6-512-409.6S102.4 286.72 102.4 512s225.28 409.6 512 409.6z m0-153.6c-143.36 0-256-112.64-256-256s112.64-256 256-256 256 112.64 256 256-112.64 256-256 256z m0-102.4c87.04 0 153.6-66.56 153.6-153.6s-66.56-153.6-153.6-153.6-153.6 66.56-153.6 153.6 66.56 153.6 153.6 153.6z" fill="#8a8a8a" p-id="3229">
                          </path>
                        </svg>
                        <span>{{ item.viewCount }} </span>
                    </div>
                    <div class="meta-icon liking" style="cursor: pointer;">
                        <svg t="1764946521735" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5143" width="16" height="16">
                          <path d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z" p-id="5144" fill="#8a8a8a"></path>
                        </svg>
                        <span>{{ item.likeCount }} </span>
                    </div>
                    <div class="meta-icon collecting" style="cursor: pointer;">
                        <svg t="1764946630152" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10491" width="15" height="15"><path d="M512.118374 131.072L603.766374 317.44c20.48 41.472 59.392 70.144 104.96 76.8l205.824 30.208-148.992 145.92c-32.768 32.256-47.616 78.336-39.936 123.392l35.328 205.824-183.296-96.768c-19.968-10.752-42.496-16.384-65.024-16.384-22.528 0-45.056 5.632-65.024 16.384l-183.296 96.768 35.328-205.824c7.68-45.056-7.168-91.136-39.936-123.392L109.686374 424.448 314.998374 394.24c45.568-6.656 84.992-35.328 104.96-76.8l92.16-186.368m0-112.64c-20.48 0-41.472 10.752-51.712 32.256L346.742374 281.6c-8.192 16.896-24.576 29.184-43.52 31.744L49.270374 350.208C2.166374 357.376-16.777626 415.232 17.526374 449.024l183.808 180.224c13.312 13.312 19.968 32.256 16.384 51.2l-43.52 253.952c-6.144 37.376 23.552 67.584 56.832 67.584 8.704 0 17.92-2.048 27.136-6.656L484.982374 875.52c8.192-4.608 17.92-6.656 27.136-6.656 9.216 0 18.432 2.048 27.136 6.656l226.816 119.808c8.704 4.608 17.92 6.656 27.136 6.656 33.792 0 63.488-30.208 56.832-67.584l-43.52-253.952c-3.072-18.944 3.072-37.888 16.384-51.2l183.808-180.224c34.304-33.28 15.36-91.648-32.256-98.304l-253.952-36.864c-18.944-2.56-35.328-14.848-43.52-31.744L563.830374 50.688c-10.752-21.504-31.232-32.256-51.712-32.256z" p-id="10492" fill="#8a8a8a"></path></svg>
                        <span>{{ item.commentCount }} </span>
                    </div>
                </div>
                <div class="author-info">
                    <span @click="handleJumpToUserProfile(item.authorId)" class="author-name">{{ item.authorName }}</span>
                    <span>{{ formatTimeYMD(item.createTime) }}</span>
                </div>
            </div>
        </div>
        <div class="loading" v-if="isLoading">加载中...</div>
        <div class="finished" v-if="isFinished && list?.content.length !== 0">没有更多了</div>
        <div class="empty-result" v-if="!isLoading && isFinished && list?.content.length === 0">
            <!-- 预留高度，后续添加图标 -->
             <el-empty :image-size="200" :description="'这个星球似乎没有你要找的内容'"/>
        </div>
    </div>
</template>

<script setup lang="ts" name="SearchResultList">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { search, addSearchHistory } from '@/api/index/searchPage'
import type { SearchResultList } from '@/types'
import { formatTimeYMD } from '@/utils/timeUtil'

const route = useRoute()
const router = useRouter()

const emit = defineEmits(['searchResultCount'])

// 路由参数
// q: 搜索关键词
const searchKey = computed(() => route.query.q as string)
// t: 时间
const publishTime = computed(() => route.query.t as string)
// l: 等级
const level = computed(() => route.query.l as string)
// s: 排序
const sort = computed(() => route.query.s as string)
// vco: VIP内容
const isVipOnly = computed(() => route.query.vco as string)

const list = ref<SearchResultList>()

const scrollContainer = ref<HTMLDivElement | null>(null);
const currentCursor = ref<string | null>(null);
const pageSize = ref(10);
const postCount = ref(0);
const isLoading = ref(false);
const isFinished = ref(false);
const hasNext = ref(true);
const userId = ref<number>(Number(localStorage.getItem('userId')));
let totalSearchResultCount = ref(0);

/**
 * 加载数据
 */
const loadData = async() => {
    console.log('触发搜索Result')
    if (isLoading.value || isFinished.value) return;
    isLoading.value = true;
    console.log('查询前currentCursor', currentCursor.value);
    try {
        const res = await search(
            searchKey.value,
            publishTime.value,
            level.value,
            sort.value,
            isVipOnly.value,
            pageSize.value.toString(),
            currentCursor.value
        );
        if (res.code === 200) {
            // console.log('查询结果', res.data);
            if (!list.value) {
                list.value = res.data;
            } else {
                list.value.content.push(...res.data.content);
            }
            postCount.value += res.data.content.length;
            isFinished.value = !res.data.hasNext;
            hasNext.value = res.data.hasNext;
            if (res.data.nextCursor) {
                // 处理游标,将数组字符串格式的游标转换为字符串，例[1.2314,3]=>1.2314,3
                // 先将字符串转为数组
                const cursorArray = JSON.parse(res.data.nextCursor);
                // 将数组转为字符串
                // console.log('准备赋值cursor', res.data.nextCursor);
                currentCursor.value = cursorArray.join(',');
            }
            // 发送搜索结果数量
            totalSearchResultCount.value = res.data.totalElements;
            emit('searchResultCount', totalSearchResultCount.value);
        }
    } catch (error) {
        console.error('加载数据失败:', error);
    } finally {
        isLoading.value = false;
        // console.log('查询后currentCursor', currentCursor.value);
    }
}

/**
 * 监听页面滚动
 */
const handleScroll = () => {
    if (isLoading.value || isFinished.value || !hasNext.value) return;
    
    // 获取滚动高度、窗口高度和总高度
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    
    // 距离底部 100px 时加载更多
    if (scrollTop + windowHeight >= scrollHeight - 100) {
        loadData();
    }
}

/**
 * 处理跳转用户主页
 * @param userId 
 */
const handleJumpToUserProfile = (userId: number) => {
    // router.push(`/otherUserHome/${userId}`)
    window.open(`/otherUserHome/${userId}`, '_blank');
}

/**
 * 处理跳转文章详情页
 * @param postId 
 */
const handleJumpToPostDetail = (item: any) => {
    console.log('跳转文章详情页, 文章id:', item.id);
    window.open(`/postView/${item.authorId}/${item.id}`, '_blank');
}

onMounted(() => {
    loadData();
    window.addEventListener('scroll', handleScroll);
    // 添加搜索记录
    if (userId.value && userId.value != 0) {
        addSearchHistory(userId.value, searchKey.value, '文章');
    }
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
})

/**
 * 监听路由参数变化，重置并重新加载数据
 */
watch(() => route.query, () => {
    // 重置状态
    list.value = undefined;
    currentCursor.value = null;
    isFinished.value = false;
    hasNext.value = true;
    postCount.value = 0;
    
    // 重新加载
    loadData();
    // 柔和回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    // 添加搜索记录
    addSearchHistory(userId.value, searchKey.value, '文章');
}, { deep: true });
</script>

<style scoped>
.search-result-list {
    background-color: #fff;
    padding: 5px 20px;
    margin-top: 0.7rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);

}

.result-item {
    display: flex;
    flex-direction: column;
    gap: 7px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
    padding-top: 10px;
}

.result-item:last-child {
    border-bottom: none;
}

.content-title {
    font-size: 17px;
    color: #181818;
    line-height: 1.5;
    cursor: pointer;
    &:hover {
        color: #fc5531;
    }
}

/* 关键字高亮样式 */
.result-item :deep(em) {
    color: #fc5531;
    font-style: normal;
}

.content-intro {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

.meta-data {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.statistics-info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #696868;
    font-weight: 350;
}

.meta-icon {
    display: flex;
    align-items: center;
    gap: 5px;
}

.author-info {
    display: flex;
    gap: 20px;
    color: #696868;
    font-weight: 350;
    font-size:15px
}

.author-name {
    cursor: pointer;
    &:hover {
        color: #fc5531;
    }
}

.empty-result {
    min-height: calc(100vh - 200px);
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: #909399;
}

.finished {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: #434344;
}
</style>