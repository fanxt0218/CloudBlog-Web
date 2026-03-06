<template>
    <div class="my-likes">
        <div class="search-content">
            <div class="demo-datetime-picker">
                <span class="like-text">点赞时间</span>
                <div class="block">
                  <el-date-picker
                    v-model="value1"
                    type="datetimerange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :default-time="defaultTime"
                    format="YYYY-MM-DD"
                  />
                </div>
            </div>
            <button  @click="loadUserLikeList" class="search-btn">查询</button>
        </div>
        <div class="likes-list">
            <div v-for="item in likesList?.records || []" :key="item.postId" class="like-item" @click="handleJumpToPostDetail(item.authorId, item.postId)">
                <div class="like-item-content">
                    <div class="like-item-info">
                        <div class="vip-content">
                            <span v-if="item.isVip === 1" class="vip-tag">VIP</span>
                        </div>
                        <span class="like-item-title">{{ item.title }}</span>
                    </div>
                    <span class="like-item-time">{{ formatDate(item.createTime) }}</span>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="likesList && likesList.records.length === 0" class="empty-state">
                <p>暂无点赞记录</p>
            </div>

            <!-- 数据未加载状态 -->
            <div v-if="!likesList" class="empty-state">
                <p>暂无数据</p>
            </div>

            <!-- 分页组件 -->
            <div v-if="likesList && likesList.total > 0" class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="likesList.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
        </div>    
    </div>
</template>

<script lang="ts" setup name="MyLikes">
import { ref, onMounted } from 'vue'
import { getUserLikeList } from '@/api/userInfo/homePage'
import type { UserLike } from '@/types/index'
import { ElMessage } from 'element-plus'

const value1 = ref(['', ''])
const defaultTime = new Date(2000, 1, 1, 12, 0, 0) // '12:00:00'

let likesList = ref<UserLike | null>(null);

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

//加载点赞列表
const loadUserLikeList = async () => {
    loading.value = true;
    try {
        const param = {
            userId: Number(localStorage.getItem('userId')),
            beginTime: value1.value && value1.value[0] ? value1.value[0] : null,
            endTime: value1.value && value1.value[1] ? value1.value[1] : null,
            pageNum: currentPage.value,
            pageSize: pageSize.value
        };
        // 执行查询
        const response = await getUserLikeList(param);

        if (response && response.data && response.data.records) {
            likesList.value = response.data;
        } else {
            likesList.value = {
                records: [],
                total: 0,
                size: pageSize.value,
                current: currentPage.value,
                pages: 0
            };
            ElMessage.warning('未获取到有效数据');
        }
    } catch (error) {
        console.error('获取点赞列表失败:', error);
        ElMessage.error('获取点赞列表失败，请稍后重试');
        // 设置默认空数据，避免白屏
        likesList.value = {
            records: [],
            total: 0,
            size: pageSize.value,
            current: currentPage.value,
            pages: 0
        };
    } finally {
        loading.value = false;
    }
}

// 格式化日期
const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
};

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
    currentPage.value = newPage;
    loadUserLikeList();
};

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize;
    currentPage.value = 1; // 重置为第一页
    loadUserLikeList();
};

/**
 * 处理跳转文章详情页
 * @param authorId 
 * @param postId 
 */
const handleJumpToPostDetail = (authorId: number, postId: number) => {
    window.open(`/postView/${authorId}/${postId}`, '_blank');
}


onMounted(() => {
    getUserLikeList({
        userId: Number(localStorage.getItem('userId')),
        beginTime: value1.value[0] || null,
        endTime: value1.value[1] || null,
        pageNum: 1,
        pageSize: 10,
    }).then(res => {
        likesList.value = res.data;
    })
})
</script>

<style scoped>
.my-likes {
    max-width: 100%;
    margin-bottom: -2rem;
    padding: 20px;
    min-height: 800px;
}

.search-content {
    display: flex;
    gap: 1rem;
    border-bottom: solid 1px var(--el-border-color);
}

.demo-datetime-picker {
  display: flex;
  padding: 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.like-text {
  font-size: 15px;
  margin-bottom: 15px;
  margin-top: 1rem;
}

.block {
  padding: 10px 0;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
  min-width: 0px;
}

.block:last-child {
  border-right: none;
}

.search-btn {
    height: 30px;
    width: 60px;
    margin-top: 0.6rem;
    border-radius: 10px;
    border: none;
    background-color: rgb(21, 154, 243);
    text-align: center;
    color: rgb(255, 255, 255);
    cursor: pointer;
}

.search-btn:hover {
    background-color: rgb(18, 134, 224);
}

.likes-list {
    /* padding: 10px; */
    margin-top: 20px;
    /* border: 1px solid #eee; */
}

.like-item {
    display: flex;
    padding: 15px 0;
    /* border-bottom: 1px solid #eee; */
    cursor: pointer;
    border: 1px solid #f5f5f5;
    background-color: #fdfcfc;
    border-radius: 8px;
    margin-top: 0.5rem;
}

.like-item:hover {
    background-color: #eee;
}

.like-item-content {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.like-item-info {
    display: flex;
    align-items: center;
    min-width: 80px;  /* 固定VIP图标位置 */
}

.like-item-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-left: 3px;
    flex-grow: 1;  /* 标题占据剩余空间 */
}

.like-item-time {
    font-size: 13px;
    color: #999;
    margin-right: 5px;
    margin-top: 3px;
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
    visibility: visible;  /* 默认为可见 */
    margin-left: 0;
    margin-right: 10px;
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
