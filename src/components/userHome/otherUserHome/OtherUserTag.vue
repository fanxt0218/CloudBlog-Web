<template>
    <div class="tag-card">
        <div class="title-content">
            <h3 class="card-title">TA感兴趣</h3>
        </div>
        <div class="tag-list">
            <div class="tags-container">
                <img class="tag-icon" src="../../../../public/assests/icon/tag.png" alt="tag" />
                <div v-for="item in tagList" :key="item.id" class="tag-item">
                  {{item.tagName}}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts" name="OtherUserTag">
import {ref} from 'vue'
import { onMounted } from 'vue';
import {getUserTag} from '@/api/userInfo/homePage'
import type {UserInterests} from '@/types/index'

let tagList = ref<UserInterests|null>(null);

const props = defineProps<{ userId: number }>();
const userId = props.userId;

onMounted(()=>{
    getUserTag(userId).then(res=>{
        tagList.value = res.data;
    })
})
</script>
<style scoped>

.tag-card {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 16px;
    width: 86%;
    /* 移除固定高度，改为自动高度 */
    min-height: 233px;
    background-color: #ffffff;
}
.title-content {
    display: flex;
    /* padding-bottom: -5px; */
    border-bottom: 1px solid #e5e7eb;
}

.card-title {
    font-size: 18px;
    font-weight: 450;
    margin-top: 0px;
    margin-bottom: 8px;
}

.editTag {
    margin-left: auto;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    margin-top: 2px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
}

.tag-icon {
    height: 28px;
    vertical-align: middle;
}

.tag-list {
    margin-top: 10px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
    align-self: flex-start;
}

.tag-item {
    background-color: #f3f4f6;
    border-radius: 12px;
    padding: 3px 8px;
    font-size: 12px;
    margin-top: 1px;
    color: #6b7280;
    white-space: nowrap;
    transition: all 0.2s ease;
}

.tag-item:hover {
    background-color: #bebfc1;
    color: #374151;
    cursor: pointer;
}
</style>