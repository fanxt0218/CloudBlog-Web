<template>
  <div class="draft-lib">
    <div class="drafts">
        <div v-for="item in draftItems" :key="item.id" class="draft-item" @click="selectDraft(item.id)">
            <div class="draft-item-title">{{ item.title }}</div>
            <div class="right-info">
                最后更新时间
                <div class="draft-item-time">{{ item.lastUpdateTime }}</div>
            </div>
        </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="DraftLib">
import { ref,onMounted } from 'vue'
import { getDraftList } from '@/api/create'
import type { DraftItems } from '@/types'

const emit = defineEmits(['draft-selected'])

const userId = Number(localStorage.getItem('userId'))

let draftItems = ref<DraftItems>([])

// 当用户点击某个草稿时触发事件
const selectDraft = (draftId : number) => {
  emit('draft-selected', draftId)
}

onMounted(() => {
  getDraftList({ userId: userId }).then((res) => {
    draftItems.value = res.data
  })
})
</script>
<style scoped>
.draft-lib {
    min-height: 200px;
    padding: 5px;
}

.drafts {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.draft-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    background: #f5f5f5;
    cursor: pointer;
    transition: background 0.3s ease;
}

.draft-item:hover {
    background: #e8e8e8;
}

.draft-item-title {
    font-size: 16px;
    /* font-weight: bold; */
}

.right-info {
    display: flex;
    font-size: 13px;
    gap: 10px;
    color: #969494;
}

.draft-item-time {
    font-size: 14px;
    color: #666666;
}
</style>
