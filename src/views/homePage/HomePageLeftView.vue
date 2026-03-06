<template>
    <div class="home-page-left-view">
        <SideBar />
        <div class="hot-information">
            <HotInformation v-if="whichTagStore.whichTag !== 'news'"/>
        </div>
    </div>
</template>
<script setup lang="ts" name="HomePageLeftView">
import { onMounted } from 'vue'
import SideBar from '@/components/homePage/SideBar.vue'
import HotInformation from '@/components/homePage/HotInformation.vue'
import { useWhichTagStore } from '@/stores/indexWhichTag'

const whichTagStore = useWhichTagStore()

</script>
<style scoped>
.hot-information {
    margin-right: 7px;
}
</style>