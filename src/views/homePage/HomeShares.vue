<template>
    <div class="home-shares">
        <div class="header">
            <TopicBar @topic-change="handleTopicChange" />
        </div>
        <div class="main-content">
            <ShareContent :selectedTagId="selectedTopicId" />
        </div>
    </div>
</template>
<script setup lang="ts" name="HomeShares">
import { ref } from 'vue'
import TopicBar from '@/components/homePage/TopicBar.vue'
import ShareContent from '@/components/homePage/ShareContent.vue'

const selectedTopicId = ref(0)

function handleTopicChange(topicId: number) {
    selectedTopicId.value = topicId
}

</script>
<style scoped>
.header {
    width: 62%;
    position: fixed;
    margin-top: -5rem;
    z-index:100;
    /* margin: 0 auto; */
}
.main-content {
    padding: 0 5px;
    margin-top: 4rem;
}

</style>
