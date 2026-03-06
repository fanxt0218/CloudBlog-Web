<template>
  <div class="my-collect">
    <div class="search-content">
      <span class="like-text">文章名称</span>
      <el-input
        v-model="input"
        style="width: 240px; height: 30px;"
        placeholder="搜索文章标题"
        clearable
        class="search-input"
        @keyup.enter="loadCollectDetail"
      />
      <button @click="loadCollectDetail" class="search-btn">查询</button>

      <!-- ✅ 收藏夹下拉框 -->
      <el-dropdown
        trigger="click"
        @command="selectFavorite"
        class="collector-dropdown"
      >
        <span class="collector">
          {{ getCurrentFavoriteName() }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-if="!collectors"
            >
              暂无收藏夹
            </el-dropdown-item>
            <el-dropdown-item
              v-else
              v-for="fav in collectors || []"
              :key="fav.id"
              :command="fav.id"
              :active="fav.id === favoritesId"
            >
              {{ fav.favoritesName }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 收藏列表 -->
    <div class="collect-list">
      <div
        v-for="item in collectList?.records || []"
        :key="item.postId"
        class="collect-item"
        @click="handleJumpToPostDetail(item.authorId, item.postId)"
      >
        <div class="collect-item-content">
          <div class="collect-item-info">
            <div class="vip-content">
              <span v-if="item.isVip === 1" class="vip-tag">VIP</span>
            </div>
            <span class="collect-item-title">{{ item.title }}</span>
          </div>
          <span class="collect-item-time">{{ formatDate(item.createTime) }}</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="collectList && collectList.records.length === 0" class="empty-state">
        <p>暂无收藏记录</p>
      </div>

      <div v-if="!collectList" class="empty-state">
        <p>暂无数据</p>
      </div>

      <!-- 分页 -->
      <div v-if="collectList && collectList.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="collectList.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="MyCollect">
import { ref, onMounted } from 'vue'
import { getUserCollectDetail, getUserCollectList, getUserDefaultCollect } from '@/api/userInfo/homePage'
import type { UserCollects, UserCollectDetail } from '@/types/index'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

let collectList = ref<UserCollectDetail | null>(null)
let collectors = ref<UserCollects | null>(null)
let favoritesId = ref<number | null>(null)
let input = ref('')

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 加载收藏夹详情
const loadCollectDetail = async () => {
  loading.value = true
  try {
    const params = {
      userId: Number(localStorage.getItem('userId')),
      favoritesId: favoritesId.value,
      postName: input.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    }

    const response = await getUserCollectDetail(params)
    if (response && response.data && response.data.records) {
      collectList.value = response.data
    } else {
      collectList.value = {
        records: [],
        total: 0,
        size: pageSize.value,
        current: currentPage.value,
        pages: 0,
      }
      ElMessage.warning('未获取到有效数据')
    }
  } catch (error) {
    console.error('获取收藏夹详情失败:', error)
    ElMessage.error('获取收藏夹详情失败，请稍后重试')
    collectList.value = {
      records: [],
      total: 0,
      size: pageSize.value,
      current: currentPage.value,
      pages: 0,
    }
  } finally {
    loading.value = false
  }
}

// 当前收藏夹名称
const getCurrentFavoriteName = () => {
  if (!collectors.value || collectors.value.length === 0) return ''
  const current = collectors.value.find(item => item.id === favoritesId.value)
  return current ? current.favoritesName : collectors.value[0]?.favoritesName || ''
}

// 选择收藏夹
const selectFavorite = (id: number) => {
  if (favoritesId.value == id) {
    return;
  }
  favoritesId.value = id
  loadCollectDetail()
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  loadCollectDetail()
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadCollectDetail()
}

/**
 * 处理跳转文章详情页
 * @param authorId 
 * @param postId 
 */
const handleJumpToPostDetail = (authorId: number, postId: number) => {
    window.open(`/postView/${authorId}/${postId}`, '_blank');
}

onMounted(async () => {
  await getUserCollectList(Number(localStorage.getItem('userId'))).then(res => {
    collectors.value = res.data
  })
  await getUserDefaultCollect(Number(localStorage.getItem('userId'))).then(res => {
    favoritesId.value = res.data.id
  })
  loadCollectDetail()
})
</script>

<style scoped>
.my-collect {
    max-width: 100%;
    margin-bottom: -2rem;
    padding: 20px;
    min-height: 800px;
}

.search-content {
  display: flex;
  gap: 1rem;
  border-bottom: solid 1px var(--el-border-color);
  margin-top: 0.6rem;
  align-items: center;
  padding-bottom: 0.65rem;
}

.search-btn {
  height: 30px;
  width: 60px;
  border-radius: 6px;
  border: none;
  background-color: rgb(21, 154, 243);
  color: #fff;
  cursor: pointer;
}
.search-btn:hover {
  background-color: rgb(18, 134, 224);
}

/* ✅ 收藏夹下拉样式 */
.collector-dropdown {
  margin-left: auto;
  margin-right: 0.5rem;
}
.collector {
  border: 1px solid #808080;
  padding: 4px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}

/* ✅ 修改下拉选项颜色 */
::v-deep(.el-dropdown-menu__item:hover) {
  background-color: #f2f2f2 !important;
  color: #333 !important;
}

::v-deep(.el-dropdown-menu__item.active) {
  background-color: #e0e0e0 !important;
  color: #333 !important;
  font-weight: 500;
}

::v-deep(.el-dropdown-menu__item) {
  transition: background-color 0.2s;
}

/* 鼠标悬停时浅灰色 */
::v-deep(.el-dropdown-menu__item:hover) {
  background-color: #f2f2f2 !important;
  color: #333 !important;
}

/* 移出时恢复默认（防止停留蓝色） */
::v-deep(.el-dropdown-menu__item:not(:hover):not(.active)) {
  background-color: transparent !important;
  color: #333 !important;
}

/* 选中项灰色 */
::v-deep(.el-dropdown-menu__item.active),
::v-deep(.el-dropdown-menu__item.is-active) {
  background-color: #e0e0e0 !important;
  color: #333 !important;
  font-weight: 500;
}

/* 列表样式保持不变 */

.collect-list {
    margin-top: 20px;
}

.collect-item {
  display: flex;
  padding: 15px 0;
  border: 1px solid #f5f5f5;
  background-color: #fdfcfc;
  border-radius: 8px;
  margin-top: 0.5rem;
}
.collect-item:hover {
  background-color: #eee;
}
.collect-item-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.collect-item-info {
  display: flex;
  align-items: center;
  min-width: 80px;
}
.collect-item-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-left: 3px;
  flex-grow: 1;
}
.collect-item-time {
  font-size: 13px;
  color: #999;
  margin-right: 5px;
}
.vip-content {
  min-width: 41px;
  margin-left: 0.5rem;
}
.vip-tag {
  background: linear-gradient(135deg, #fcd80c 0%, #fdee60 100%);
  color: rgb(197, 123, 12);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
}
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
