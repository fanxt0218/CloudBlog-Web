<template>
    <div class="home-news">
        <MainNewsContent />
    </div>
</template>
<script setup lang="ts" name="HomeNews">
import MainNewsContent from '@/components/homePage/NewsContent.vue';
import { useWhichTagStore } from '@/stores/indexWhichTag'
</script>
<style scoped>
.home-news {
    padding: 0 5px;
    margin-top: 1rem;
}
</style>