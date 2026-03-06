<template>
    <div class="home-index">
        <div class="header">
            <TagBar @tag-change="handleTagChange" />
        </div>
        <div class="main-content">
            <MainContent :selectedTagId="selectedTagId" />  
        </div>
    </div>
</template>
<script setup lang="ts" name="HomeIndex">
import { ref, onMounted } from 'vue'
import TagBar from '@/components/homePage/TagBar.vue'
import MainContent from '@/components/homePage/MainContent.vue';
import UserLevelBadge from '@/components/public/UserLevelBadge.vue'

let selectedTagId = ref<number>(0)

/** 标签栏切换事件 */
function handleTagChange(tagId: number) {
  selectedTagId.value = tagId
}

onMounted(() => {
    document.title = 'CloudBlog_智能云博客平台_已接入Qwen'
})
</script>
<style scoped>
.header {
    width: 62%;
    position: fixed;
    margin-top: -5rem;
    z-index:100;
    margin-left: 20px;
}
.main-content {
    padding: 0 5px;
    margin-top: 4rem;
    margin-left: 20px;
}
</style>
