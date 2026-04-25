<template>
    <div class="download-container">
        <!-- 1. 顶部横幅 Banner -->
        <div class="banner-wrapper">
            <div class="banner-content">
                <div class="banner-text">
                    <h1>AI学习季 会员大额直降 ⚡️ 返利50元助学金</h1>
                    <p>年卡最低到手价¥159 · 抽千元豪礼</p>
                </div>
                <!-- 搜索框 -->
                <div class="search-bar-container">
                    <div class="search-input-box">
                        <input type="text" placeholder="everything claude code" v-model="searchInput" @keyup.enter="resetAndFetch">
                        <div class="search-btn" @click="resetAndFetch">
                            <el-icon><Search /></el-icon>
                        </div>
                    </div>
                    <div class="hot-search">
                        <span>热门搜索：</span>
                        <a href="#">红黑树的原理</a>
                        <a href="#">gitee关闭了github...</a>
                        <a href="#">mysql隔离级别和...</a>
                    </div>
                </div>
            </div>
        </div>
        <!-- 2. 主体内容区 -->
        <div class="main-layout">
            <!-- 左侧内容 -->
            <div class="content-left">
                <!-- 分类网格 -->
                <div class="category-grid-container">
                    <div class="category-grid" :class="{ 'is-expanded': isExpanded }">
                        <div class="category-item" v-for="([title, links], index) in displayEntries" :key="title">
                            <div class="category-icon">
                                <el-icon><component :is="getCategoryIcon(index)" /></el-icon>
                            </div>
                            <div class="category-info">
                                <el-popover
                                    placement="bottom"
                                    :width="minWidthForPopover"
                                    trigger="hover"
                                    popper-class="category-popover"
                                >
                                    <template #reference>
                                        <div class="category-title" @click="handleTagSelect(title)">
                                            <span>{{ title }}</span>
                                        </div>
                                    </template>
                                    <div class="popover-content">
                                        <div class="popover-title">{{ title }}</div>
                                        <div class="popover-links">
                                            <a v-for="link in links" :key="link" href="#" @click.prevent="handleTagSelect(link)">{{ link }}</a>
                                        </div>
                                    </div>
                                </el-popover>
                                <div class="sub-links">
                                    <a v-for="link in links.slice(0, 2)" :key="link" href="#" @click.prevent="handleTagSelect(link)">{{ link }}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 展开按钮 -->
                    <div class="expand-wrapper" v-if="Object.keys(resourceCategories).length > 6">
                        <div class="expand-btn" @click="isExpanded = !isExpanded" :title="isExpanded ? '收起' : '展开更多'">
                            <el-icon :class="{ 'rotate-180': isExpanded }"><ArrowDown /></el-icon>
                        </div>
                    </div>
                </div>
                <!-- C知道精选 -->
                <div class="section-container selection-section">
                    <div class="section-header">
                        <h2>C知道精选</h2>
                        <div class="header-extra" @click="querySelectedResource">
                            <el-icon><Refresh /></el-icon>
                            <span>换一换</span>
                        </div>
                    </div>
                    <div class="selection-grid">
                        <div class="selection-card" v-for="item in selectedResource" :key="item.id">
                            <h3>{{ item.resourceName }}</h3>
                            <p>{{ item.resourceDescription }}</p>
                            <div class="card-footer">
                                <a href="#">查看</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 精选资源 -->
                <div class="section-container resource-section">
                    <div class="section-header">
                        <h2>精选资源</h2>
                        <div class="header-tabs">
                            <span v-for="item in categoryKeys?.slice(0, 5)" :class="{ 'active': activeTab === item }" @click="activeTab = item">
                                {{ item }}
                            </span>
                        </div>
                        <div class="header-extra" @click="handleTagSelect('全部')">
                            <span>更多 ></span>
                        </div>
                    </div>
                    <div class="resource-list">
                        <div class="resource-card" v-for="item in resourceList" :key="item.id">
                            <div class="doc-preview">
                                <div class="doc-content">
                                    <div class="doc-tag">{{ item.resourceTags?.split(',')[0] || 'Unknown' }}</div>
                                    <div class="doc-size">大小: {{ item.resourceSize }}</div>
                                    <div class="doc-desc">{{ item.resourceDescription }}</div>
                                </div>
                                <div class="file-type-badge">
                                    <span class="ext-text">{{ item.resourceFormat?.toUpperCase() || 'FILE' }}</span>
                                </div>
                                <div v-if="item.vipResource === 1" class="vip-tag">
                                    <el-icon><GoldMedal /></el-icon>
                                    <span>VIP</span>
                                </div>
                            </div>
                            <div class="resource-info">
                                <h3 class="resource-name" :title="item.resourceName">{{ item.resourceName }}</h3>
                                <div class="resource-meta">
                                    <div class="rating">
                                        <el-icon><StarFilled /></el-icon>
                                        <span>5.0</span>
                                    </div>
                                    <div class="views">
                                        <span>{{ formatViews(item.downloadCount) }} 下载</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 滚动加载监听器 -->
                    <div ref="loadMoreRef" class="load-more-trigger">
                        <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
                        <span v-else-if="!hasNext">没有更多资源了~</span>
                    </div>
                </div>
            </div>
            <!-- 右侧侧边栏 -->
            
        </div>
    </div>
</template>
<script lang="ts" setup name="DownLoadContent">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getResourceCategory, getSelectedResource, getIndexResource } from '@/api/create/resource'
import type { Resource, IndexResource, IndexResourceItem } from '@/types'
import { 
    Search, Monitor, Reading, Briefcase, ShoppingCart, 
    HotWater, VideoPlay, Refresh, Trophy, GoldMedal,
    ChatDotSquare, PriceTag, Notebook, Upload, Fold, ArrowRight,
    ArrowDown, Collection, Files, Connection, SetUp, Management,
    StarFilled, Loading
} from '@element-plus/icons-vue'
import { useUserInfoStore } from '@/stores/userInfo'

const userInfoStore = useUserInfoStore()

const headerImage = ref<string>('/api/profile/system/index-resource-header/header.png')

const resourceCategories = ref<Record<string, string[]>>({})
const categoryKeys = ref<string[]>()
const isExpanded = ref(false)
const minWidthForPopover = ref(300)

const selectedResource = ref<Resource[]>([])

const activeTab = ref('全部')

// 首页资源分页相关
const resourceList = ref<IndexResourceItem[]>([])
const cursor = ref<string | null>(null)
const hasNext = ref(true)
const loading = ref(false)
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const searchInput = ref('')

/**
 * 计算当前显示的分类
 */
const displayEntries = computed(() => {
    const entries = Object.entries(resourceCategories.value)
    return isExpanded.value ? entries : entries.slice(0, 6)
})

/**
 * 获取分类图标
 */
const getCategoryIcon = (index: number) => {
    const icons = [
        Monitor, Reading, Briefcase, ShoppingCart, 
        HotWater, VideoPlay, Trophy, GoldMedal,
        ChatDotSquare, PriceTag, Notebook, Upload, Collection, Files, Connection, SetUp, Management
    ]
    return icons[index % icons.length]
}

/**
 * 格式化浏览量
 */
const formatViews = (count: number) => {
    if (count > 10000) return (count / 10000).toFixed(1) + 'w+'
    return count
}

/**
 * 处理分类/标签选择
 */
const handleTagSelect = (tag: string) => {
    activeTab.value = tag
    resetAndFetch()
}

/**
 * 重置列表并重新抓取
 */
const resetAndFetch = () => {
    resourceList.value = []
    cursor.value = null
    hasNext.value = true
    queryIndexResource()
}

/**
 * 获取资源分类
 */
const getResourceCategories = async () => {
    try {
        const res: any = await getResourceCategory()
        if (res.code === 200) {
            resourceCategories.value = res.data
            
            const keys = ['全部', ...Object.keys(res.data)]
            categoryKeys.value = keys
        }
    } catch (error) {
        console.error('获取资源分类失败:', error)
    }
}

/**
 * 获取首页精选资源 (C知道精选)
 */
const querySelectedResource = async () => {
    try {
        const res: any = await getSelectedResource()
        if (res.code === 200) {
            selectedResource.value = res.data
        }
    } catch (error) {
        console.error('获取精选资源失败:', error)
    }
}

/**
 * 获取底部精选资源列表 (支持游标分页)
 */
const queryIndexResource = async () => {
    if (loading.value || !hasNext.value) return
    
    loading.value = true
    const po = {
        userId: userInfoStore.userId || null,
        name: searchInput.value || null,
        tagName: activeTab.value === '全部' ? null : activeTab.value,
    }
    const params = {
        cursor: cursor.value,
        size: 8
    }

    try {
        const res: any = await getIndexResource({ po, params })
        if (res.code === 200) {
            const data = res.data as IndexResource
            resourceList.value.push(...data.content)
            cursor.value = data.nextCursor
            hasNext.value = data.hasNext
        }
    } catch (error) {
        console.error('获取资源列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 监听标签切换
watch(activeTab, () => {
    resetAndFetch()
})

const initObserver = () => {
    if (loadMoreRef.value) {
        observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading.value && hasNext.value) {
                queryIndexResource()
            }
        }, { threshold: 0.1 })
        observer.observe(loadMoreRef.value)
    }
}

onMounted(() => {
    getResourceCategories()
    querySelectedResource()
    queryIndexResource()
    initObserver()
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
})
</script>

<style scoped>
.download-container {
    width: 100%;
    background-color: #f8f9fa;
    min-height: 100vh;
}

/* 1. Banner Styling */
.banner-wrapper {
    width: 100%;
    height: 230px;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.banner-content {
    width: 100%;
    max-width: 1200px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    z-index: 1;
    padding: 0 20px;
    box-sizing: border-box;
}

.banner-text h1 {
    font-size: 36px;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.banner-text p {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 30px;
    text-align: center;
}
/* 搜索框 */
.search-bar-container {
    width: 100%;
    max-width: 600px;
}
.search-input-box {
    width: 100%;
    height: 48px;
    background: white;
    border-radius: 24px;
    display: flex;
    align-items: center;
    padding: 0 4px 0 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-top: -10px;
}
.search-input-box input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    color: #333;
}
.search-btn {
    width: 40px;
    height: 40px;
    background: #e67e22;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background 0.3s;
}
.search-btn:hover {
    background: #d35400;
}
.hot-search {
    margin-top: 10px;
    font-size: 13px;
    display: flex;
    gap: 15px;
}
.hot-search a {
    color: white;
    text-decoration: none;
    opacity: 0.8;
}
.hot-search a:hover {
    opacity: 1;
}
/* 2. Layout */
.main-layout {
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    display: flex;
    gap: 20px;
    padding: 0 15px;
    box-sizing: border-box;
}
.content-left {
    flex: 1;
}
.sidebar-right {
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
/* Category Grid */
.category-grid-container {
    background: white;
    padding: 20px 20px 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    position: relative;
}
.category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
}
.category-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding-bottom: 10px;
}
.expand-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;
}
.expand-btn {
    cursor: pointer;
    color: #999;
    padding: 2px 10px;
    transition: color 0.3s;
}
.expand-btn:hover {
    color: #e67e22;
}
.rotate-180 {
    transform: rotate(180deg);
}
.category-title {
    cursor: pointer;
}
.category-title span:hover {
    color: #e67e22;
}

/* Popover Content Styles */
.popover-content {
    padding: 5px;
}
.popover-title {
    font-weight: bold;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
}
.popover-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.popover-links a {
    font-size: 13px;
    color: #666;
    text-decoration: none;
    padding: 4px 8px;
    background: #f8f9fa;
    border-radius: 4px;
    transition: all 0.3s;
}
.popover-links a:hover {
    background: #fff5eb;
    color: #e67e22;
}
.category-icon {
    width: 40px;
    height: 40px;
    background: #fff5eb;
    color: #e67e22;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
}
.category-title span {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
}
.sub-links {
    display: flex;
    gap: 10px;
}
.sub-links a {
    font-size: 12px;
    color: #999;
    text-decoration: none;
}
.sub-links a:hover {
    color: #e67e22;
}

/* Resource List Grid */
.resource-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 10px 0;
}

/* Card Styling: Premium & Concise */
.resource-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    height: 100%;
    cursor: pointer;
}

.resource-card:hover {
    /* transform: translateY(-6px); */
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: rgba(230, 126, 34, 0.2);
}

.doc-preview {
    background: #f8fafc;
    height: 140px;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.02);
    background-image: 
        radial-gradient(circle at 100% 0%, rgba(230, 126, 34, 0.05) 0%, transparent 70%);
}

.doc-tag {
    font-size: 11px;
    font-weight: 600;
    color: #e67e22;
    background: rgba(230, 126, 34, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    align-self: flex-start;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.doc-desc {
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 4px;
}

.file-type-badge {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 700;
    color: #334155;
    font-size: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    gap: 4px;
}

.file-type-badge::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #e67e22;
    border-radius: 50%;
}

.vip-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    /* 字符间距 */
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 2px;
    box-shadow: 0 2px 4px rgba(255, 140, 0, 0.3);
    z-index: 2;
}

.vip-tag .el-icon {
    font-size: 12px;
}

.resource-info {
    padding: 12px 16px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.resource-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 2.8em;
    transition: color 0.3s;
}

.resource-card:hover .resource-name {
    color: #e67e22;
}

.resource-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
}

.resource-meta .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #f59e0b;
    font-size: 12px;
    font-weight: 600;
}

.resource-meta .views {
    font-size: 11px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 4px;
}

.doc-size {
    display: none; /* Concise design: hide size in preview, show on detail or hover if needed */
}

.load-more-trigger {
    text-align: center;
    padding: 30px 0;
    color: #a0aec0;
    font-size: 14px;
    width: 100%;
}

.is-loading {
    animation: rotating 2s linear infinite;
    font-size: 24px;
    color: #e67e22;
}

@keyframes rotating {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
/* Section Common */
.section-container {
    background: white;
    padding: 0px 20px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}
.section-header {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
}
.section-header h2 {
    font-size: 18px;
}
.header-extra {
    font-size: 13px;
    color: #999;
    display: flex;
    /* 靠右 */
    margin-left: auto;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}
/* Selection Grid */
.selection-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
.selection-card {
    padding: 5px 15px 15px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    transition: transform 0.3s;
}
.selection-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}
.selection-card h3 {
    font-size: 15px;
    margin-bottom: 10px;
    line-height: 1.4;
}
.selection-card p {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
}
.card-footer a {
    font-size: 12px;
    color: #e74c3c;
    text-decoration: none;
    border: 1px solid #e74c3c;
    padding: 2px 8px;
    border-radius: 2px;
}
/* Resource Tabs */
.header-tabs {
    display: flex;
    margin-left: 2.5rem;
    gap: 24px;
    font-size: 14px;
    color: #64748b;
    align-items: center;
}
.header-tabs span {
    cursor: pointer;
    position: relative;
    padding: 4px 0;
    transition: all 0.3s ease;
}
.header-tabs span:hover {
    color: #e67e22;
}
.header-tabs span.active {
    color: #e67e22;
    font-weight: 600;
}
.header-tabs span.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #e67e22;
    border-radius: 2px;
}
/* Sidebar Cards */
.member-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ffffff 0%, #fffbf0 100%);
    border: 1px solid #ffeaa7;
}
.member-info {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}
.member-text h4 {
    font-size: 16px;
    margin-bottom: 4px;
}
.member-text p {
    font-size: 12px;
    color: #999;
}
.member-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
}
.stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #666;
}
.member-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.price-info {
    font-size: 12px;
    color: #e67e22;
}
/* Inspiration Card */
.inspiration-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
}
.card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}
.inspiration-list {
    margin-bottom: 20px;
}
.ins-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 12px;
}
.ins-item a {
    color: #e74c3c;
    text-decoration: none;
    font-size: 12px;
}
/* Manage Item */
.content-manage {
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
}
.manage-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    cursor: pointer;
}
.item-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 3. Responsive Adjustments */
@media (max-width: 1024px) {
    .banner-text h1 {
        font-size: 28px;
    }
    .category-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .selection-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .resource-list {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .banner-wrapper {
        height: auto;
        padding: 40px 0;
    }
    .banner-text h1 {
        font-size: 24px;
    }
    .banner-text p {
        font-size: 14px;
    }
    .hot-search {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .category-grid {
        grid-template-columns: 1fr;
    }
    
    .selection-grid {
        grid-template-columns: 1fr;
    }
    .resource-list {
        grid-template-columns: 1fr;
    }
    
    .header-tabs {
        overflow-x: auto;
        white-space: nowrap;
        padding-bottom: 5px;
        scrollbar-width: none; /* Firefox */
    }
    .header-tabs::-webkit-scrollbar {
        display: none; /* Chrome, Safari */
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}

@media (max-width: 480px) {
    .banner-text h1 {
        font-size: 20px;
    }
    .search-input-box {
        padding: 0 4px 0 15px;
    }
    .search-input-box input {
        font-size: 14px;
    }
}

</style>