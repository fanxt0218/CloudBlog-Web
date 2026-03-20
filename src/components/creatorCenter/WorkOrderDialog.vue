<template>
  <el-dialog
    v-model="visible"
    title="我的工单"
    width="900px"
    @closed="handleClosed"
    append-to-body
  >
    <div class="work-order-container">
      <el-table :data="workOrderList" v-loading="loading" style="width: 100%" border stripe>
        <el-table-column prop="orderId" label="工单编号" width="180" align="center" />
        <el-table-column label="工单类型" width="100" align="center">
          <template #default="{ row }">
            {{ getOrderTypeText(row.orderType) }}
          </template>
        </el-table-column>
        <el-table-column label="内容类型" width="100" align="center">
          <template #default="{ row }">
            {{ getTargetTypeText(row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="反馈原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="handleReason" label="处理结果" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.handleReason">{{ row.handleReason }}</span>
            <span v-else class="text-secondary">暂无处理结果</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup name="WorkOrderDialog">
import { ref } from 'vue';
import { queryWorkOrderList } from '@/api/userInfo/creatorCenter';
import type { WorkOrder, ApiResponse, WorkOrderList } from '@/types';

const props = defineProps<{
  userId: number;
}>();

const visible = ref(false);
const loading = ref(false);
const workOrderList = ref<WorkOrder[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await queryWorkOrderList({
      userId: props.userId,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }) as unknown as ApiResponse<WorkOrderList>;

    if (res.code === 200 && res.data) {
      workOrderList.value = res.data.records;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error('Failed to fetch work orders:', error);
  } finally {
    loading.value = false;
  }
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchData();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchData();
};

const handleClosed = () => {
  workOrderList.value = [];
  total.value = 0;
  currentPage.value = 1;
};

const open = () => {
  visible.value = true;
  fetchData();
};

// 映射函数
const getTargetTypeText = (type: number) => {
  const map: Record<number, string> = {
    0: '文章',
    1: '动态',
    2: '评论',
    3: '账号'
  };
  return map[type] || '未知';
};

const getOrderTypeText = (type: number) => {
  const map: Record<number, string> = {
    0: '举报',
    1: 'BUG',
    2: '建议'
  };
  return map[type] || '未知';
};

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '未处理',
    1: '处理中',
    2: '处理完成'
  };
  return map[status] || '未知';
};

const getStatusTagType = (status: number) => {
  const map: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success'
  };
  return map[status] || 'info';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

defineExpose({
  open
});
</script>

<style scoped>
.work-order-container {
  padding: 10px 0;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-secondary {
  color: #909399;
  font-style: italic;
}
</style>
