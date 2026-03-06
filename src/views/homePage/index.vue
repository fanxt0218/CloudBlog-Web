<template>
    <div class="home-page-index">
        <div class="left-content">
            <HomePageLeftView />
        </div>
        <div class="mid-content">
            <div class="content">
                <HomePageView />
            </div>
        </div>
        <div class="right-content">
            <RightContent />
        </div>
    </div>
</template>
<script setup lang="ts" name="HomePageIndex">
import HomePageLeftView from '@/views/homePage/HomePageLeftView.vue'
import HomePageView from '@/views/homePage/HomePageView.vue'
import RightContent from '@/components/homePage/RightContent.vue';
</script>
<style>
.home-page-index {
    display: flex;
    justify-content: center; /* 添加此属性使内容居中 */
}
.left-content {
    width: 195px;
    max-height: calc(100vh - 60px); 
    overflow-y: auto; /* 保持滚动功能 */
    position: sticky; 
    top: 60px; 
    /* padding: 0 10px; */
    box-sizing: border-box;
    scrollbar-width: none; /* Firefox：隐藏滚动条 */
    -ms-overflow-style: none; /* IE/Edge：隐藏滚动条 */
}

/* Chrome/Safari/Opera：默认隐藏滚动条 */
.left-content::-webkit-scrollbar {
    width: 0;
}

/* 鼠标悬停时显示滚动条（可选） */
.left-content:hover::-webkit-scrollbar {
    width: 6px;
}

/* 自定义滚动条样式 */
.left-content:hover::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.left-content:hover::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.left-content:hover::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.mid-content {
    flex: 1;
    max-width: 60%; 
    margin: 0 auto;
    display: flex;
    /* flex-direction: column; */
}

.content {
    max-width: 1220px;
    margin: 0 auto;
    flex: 1;
    /* gap: 1rem; */
    /* border: 1px solid #ccc; */
}

.right-content {
    max-width: 400px;
    width: 100%;
    /* border: 1px solid #ccc; */
    margin: 0 auto;
    margin-right: 1rem;
}

</style>