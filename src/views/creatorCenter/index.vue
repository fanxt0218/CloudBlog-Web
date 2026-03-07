<template>
    <div class="creator-center">
        <BasicData />
        <ContentList />
    </div>
</template>
<script lang="ts" setup name="CreatorCenter">
import { onMounted } from 'vue';
import BasicData from '@/components/creatorCenter/BasicData.vue';
import ContentList from '@/components/creatorCenter/ContentList.vue';

onMounted(() => {
    document.title = 'CloudBlog - 创作者中心';
})
</script>
<style scoped>
.creator-center {
    width: 100%;
    min-height: 100vh;
    padding: 20px;
    background-color: #fcfcfc;
    box-sizing: border-box;
}
</style>