<template>
  <div class="content-list-container card">
    <div class="list-tabs">
      <div 
        :class="['tab-item', type === 2 ? 'active' : '']" 
        @click="switchTab(2)"
      >
        已发布 ({{ publishedCount }})
      </div>
      <div 
        :class="['tab-item', type === 1 ? 'active' : '']" 
        @click="switchTab(1)"
      >
        审核中 ({{ reviewCount }})
      </div>
    </div>

    <div class="list-body">
      <template v-if="contentList?.records && contentList.records.length > 0">
        <div v-for="item in contentList.records" :key="item.id" class="content-item">
          <div class="item-left">
            <h4 class="item-title" @click="handlePostView(item)">{{ item.title }}</h4>
            <div class="item-meta">
              <span>{{ formatDate(item.createTime) }}</span>
              <!-- <span v-if="item.postType === 1" class="post-type-tag">文章</span>
              <span v-else class="post-type-tag">动态</span> -->
            </div>
          </div>
          <div class="item-right">
            <div class="stat-group">
              <div class="stat-unit" title="阅读">
                <Eye :size="16" />
                <span>{{ item.browseCount }}</span>
              </div>
              <div class="stat-unit" title="评论">
                <MessageSquare :size="16" />
                <span>{{ item.commentCount }}</span>
              </div>
              <div class="stat-unit" title="点赞">
                <Heart :size="16" />
                <span>{{ item.likeCount }}</span>
              </div>
              <div class="stat-unit" title="收藏">
                <Star :size="16" />
                <span>{{ item.collectCount }}</span>
              </div>
            </div>
            <div class="item-ops">
                <el-button type="primary" link @click="handleEdit(item)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(item)">删除</el-button>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">
        <Inbox :size="48" class="empty-icon" />
        <p>暂无相关内容</p>
      </div>

      <!-- 分页组件 -->
      <div v-if="contentList && contentList.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="contentList.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ContentList">
import { ref, onMounted } from 'vue';
import { Eye, MessageSquare, Heart, Star, Inbox } from 'lucide-vue-next';
import { getContentList, deleteContent } from '@/api/userInfo/creatorCenter';
import type { CreatorContentItem, CreatorContentList, ApiResponse } from '@/types';
import { useUserInfoStore } from '@/stores/userInfo';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

const type = ref<number>(2); // 1:审核中 2:已发布
const pageNum = ref<number>(1);
const pageSize = ref<number>(10);
const userInfoStore = useUserInfoStore();

const contentList = ref<CreatorContentList>();
const publishedCount = ref<number>(0); 
const reviewCount = ref<number>(0);

const fetchData = async (singleType: number = type.value) => {
    const param = {
        userId: userInfoStore.userId,
        type: singleType,
        pageNum: pageNum.value,
        pageSize: pageSize.value
    }
    try {
        const res = await getContentList(param) as unknown as ApiResponse<CreatorContentList>;
        if (res.code === 200) {
            contentList.value = res.data;
            if (singleType === 2) publishedCount.value = contentList.value?.total || 0;
            if (singleType === 1) reviewCount.value = contentList.value?.total || 0;
        }
    } catch (error) {
        console.error('Failed to fetch content list:', error);
    }
}

const switchTab = (newType: number) => {
    if (type.value === newType) return;
    type.value = newType;
    pageNum.value = 1;
    fetchData();
}

const handleCurrentChange = (val: number) => {
    pageNum.value = val;
    fetchData();
}

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    pageNum.value = 1;
    fetchData();
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 预览文章
 */
const handlePostView = (item: CreatorContentItem) => {
    window.open(`/postView/${item.userId}/${item.id}`, '_blank');
}

/**
 * 编辑文章
 */
const handleEdit = (item: CreatorContentItem) => {
    window.open(`/editPost/${item.id}`, '_blank');
}

/**
 * 删除文章
 */
const handleDelete = async (item: CreatorContentItem) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除该文章吗？删除后不可恢复。',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        
        const res = await deleteContent({
            postId: item.id,
            userId: userInfoStore.userId
        }) as unknown as ApiResponse<any>;

        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchData();
        } else {
            ElMessage.error(res.msg || '删除失败');
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('Delete error:', error);
            ElMessage.error('操作失败');
        }
    }
}

onMounted(() => {
    fetchData();
    fetchData(1);
})
</script>

<style scoped>
.content-list-container {
  background: #fff;
  border-radius: 8px;
  padding: 0;
  margin-top: 20px;
  overflow: hidden;

  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
}

.list-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
}

.tab-item {
  padding: 16px 0;
  margin-right: 32px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #1a1a1a;
}

.tab-item.active {
  color: #1a1a1a;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1a1a1a;
}

.list-body {
  padding: 0 24px;
}

.content-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.content-item:last-child {
  border-bottom: none;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  cursor: pointer;
}

.item-title:hover {
  color: #409eff;
}

.item-meta {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-type-tag {
  background: #f0f2f5;
  color: #666;
  padding: 0 6px;
  border-radius: 2px;
  font-size: 11px;
}

.item-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.stat-group {
  display: flex;
  gap: 24px;
}

.stat-unit {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
}

.stat-unit svg {
  color: #bfbfbf;
}

.item-ops {
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
}

.content-item:hover .item-ops {
    opacity: 1;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
  color: #bfbfbf;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.pagination-container {
    margin-top: 10px;
}
</style>