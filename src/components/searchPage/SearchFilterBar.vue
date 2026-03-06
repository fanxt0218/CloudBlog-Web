<template>
  <div class="filter-bar-container">
    <!-- Top Nav Tabs -->
    <div class="nav-tabs">
      <div class="tabs-left">
        <div 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeTab === tab.value }"
          @click="handleClickTab(tab)"
        >
          <img v-if="tab.icon" :src="tab.icon" class="tab-icon" />
          {{ tab.label }}
          <span v-if="tab.label === '更多'" class="arrow-down"></span>
        </div>
      </div>
      <div class="tabs-right" v-if="activeTab === 'all'">
        <div class="filter-toggle" @click="showFilters = !showFilters">
          筛选 
          <span class="toggle-icon" :class="{ rotated: showFilters }"></span>
        </div>
      </div>
    </div>

    <!-- Collapsible Filter Panel -->
    <div class="filter-panel" :class="{ open: showFilters }">
      <div class="filter-row">
        <span class="row-label">博主等级</span>
        <div class="row-options">
          <span 
            v-for="level in levels" 
            :key="level.value"
            class="option-item"
            :class="{ active: selectedLevel === level.value }"
            @click="selectedLevel = level.value"
          >
            {{ level.label }}
          </span>
        </div>
      </div>
      <div class="filter-row">
        <span class="row-label">时间</span>
        <div class="row-options">
          <span 
            v-for="time in times" 
            :key="time.value"
            class="option-item"
            :class="{ active: selectedTime === time.value }"
            @click="selectedTime = time.value"
          >
            {{ time.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Sort Bar -->
    <div class="sort-bar">
      <div class="sort-options">
        <span 
          v-for="sort in sortOptions" 
          :key="sort.value"
          class="sort-item"
          :class="{ active: activeSort === sort.value }"
          @click="activeSort = sort.value"
        >
          {{ sort.label }}
        </span>
        <label class="vip-checkbox" v-if="activeTab !== 'user'">
          <input type="checkbox" v-model="isVipOnly" />
          <span class="checkbox-text">VIP内容</span>
        </label>
      </div>
      <div class="result-count">
        相关结果约{{ searchResultCount }}个
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="SearchFilterBar">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const props = defineProps({
    searchKey: {
        type: String,
        default: ''
    },
    searchResultCount: {
        type: Number,
        default: 0
    }
})

// 初始化本地状态
const searchKey = ref((route.query.q as string) || props.searchKey)
const showFilters = ref(false)
const activeTab = ref((route.query.tab as string) || 'all')
const selectedLevel = ref((route.query.l as string) || 'all')
const selectedTime = ref((route.query.t as string) || 'all')
const activeSort = ref((route.query.s as string) || 'comp')
const isVipOnly = ref(route.query.vco === '1')

const tabs = [
  { label: '全站', value: 'all' },
  { label: '', value: 'ai', icon: '/assests/logo-word.png' },
  { label: '博客', value: 'blog' },
  { label: '下载', value: 'download' },
  { label: '课程', value: 'course' },
  { label: '用户', value: 'user' },
  { label: '专栏', value: 'column' },
  { label: '更多', value: 'more' },
]

const levels = [
    { label: '不限', value: 'all' },
    { label: '二级及以上', value: '2' },
    { label: '五级及以上', value: '5' },
    { label: '八级及以上', value: '8' },
    { label: '九级及以上', value: '9' },
]
const times = [
    { label: '不限', value: 'all' },
    { label: '一周内', value: 'week' },
    { label: '一月内', value: 'month' },
    { label: '三月内', value: 'quarter' },
    { label: '一年内', value: 'year' },
]
const sortOptions = [
    { label: '综合', value: 'comp' },
    { label: '最新', value: 'new' },
    { label: '热门', value: 'hot' },
]

// 更新路由参数
function updateSearchParams() {
    const query: Record<string, string | null> = {
        q: searchKey.value || null,
        t: selectedTime.value === 'all' ? null : selectedTime.value,
        l: selectedLevel.value === 'all' ? null : selectedLevel.value,
        s: activeSort.value === 'comp' ? null : activeSort.value,
        vco: isVipOnly.value ? '1' : null,
        tab: activeTab.value === 'all' ? null : activeTab.value
    }
    
    // 过滤掉 null 值以保持 URL 清洁
    const cleanQuery = Object.fromEntries(
        Object.entries(query).filter(([_, v]) => v !== null)
    )
    if (activeTab.value === 'user') {
        showFilters.value = false
    }

    // 更新路由参数，根据tab的值决定路径
    let path = '/search'
    router.replace({
        path: path,
        query: cleanQuery
    }).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
            console.error('Search navigation error:', err)
        }
    })
}

/**
 * 点击tab
 */
function handleClickTab(tab: any) {
    if (tab.value === 'ai') {
        window.open('/ai', '_blank')
    } else {
        activeTab.value = tab.value
        // updateSearchParams()
    }
}

// 监听各个状态的变化并更新 URL
watch([selectedLevel, selectedTime, activeSort, isVipOnly, activeTab], () => {
    updateSearchParams()
}, { flush: 'post' })

// 当 searchKey 变化时同步
watch(() => props.searchKey, (newVal) => {
    if (newVal !== undefined) {
        searchKey.value = newVal
        updateSearchParams()
    }
})

// 当 URL query 变化时同步本地状态（处理浏览器后退等情况）
watch(() => route.query, (newQuery) => {
    if (newQuery.q !== undefined) searchKey.value = newQuery.q as string
    selectedTime.value = (newQuery.t as string) || 'all'
    selectedLevel.value = (newQuery.l as string) || 'all'
    activeSort.value = (newQuery.s as string) || 'comp'
    isVipOnly.value = newQuery.vco === '1'
    activeTab.value = (newQuery.tab as string) || 'all'
}, { deep: true, flush: 'post' })


</script>

<style scoped>
.filter-bar-container {
  width: 100%;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  border-bottom: 1px solid #f5f5f5;
}

.tabs-left {
  display: flex;
  gap: 30px;
}

.tab-item {
  font-size: 16px;
  color: #555;
  cursor: pointer;
  height: 50px;
  line-height: 50px;
  position: relative;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-item.active {
  color: #222;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #222;
}

.tab-icon {
  width: 85px;
  height: 85px;
  object-fit: contain;
}

.arrow-down::after {
  content: '▼';
  font-size: 10px;
  margin-left: 2px;
  color: #ccc;
}

.tabs-right .filter-toggle {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-icon::after {
  content: '▲';
  font-size: 10px;
  transition: transform 0.3s;
  display: inline-block;
}

.toggle-icon.rotated::after {
  transform: rotate(180deg);
}

/* Filter Panel */
.filter-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  background: #fafafa7c;
}

.filter-panel.open {
  max-height: 200px;
  padding: 15px 20px;
  border-bottom: 1px dashed #eee;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.row-label {
  font-size: 14px;
  color: #999;
  width: 70px;
}

.row-options {
  display: flex;
  gap: 25px;
}

.option-item {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.option-item:hover {
  color: #ff6a00;
}

.option-item.active {
  color: #ff6a00;
}

/* Sort Bar */
.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #fff;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sort-item {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.sort-item.active {
  background: #f0f0f5;
  color: #2b2bb9;
  font-weight: 500;
}

.vip-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  margin-left: 10px;
}

.result-count {
  font-size: 12px;
  color: #999;
}
</style>