<template>
    <div class="userContent">
        <div class="head">
            <span class="tab-group">
                <router-link to="/userHome/postList" class="tab-link" active-class="active">文章</router-link>
                <span class="tab-number">{{ userHomeStore.postCount }}</span>
            </span>
            <span class="tab-group">
                <router-link to="/userHome/categoryList" class="tab-link" active-class="active">专栏</router-link>
                <span class="tab-number">{{ userHomeStore.categoryCount }}</span>
            </span>
            <span class="tab-group">
                <router-link to="/userHome/shareList" class="tab-link" active-class="active">动态</router-link>
            </span>
            <span class="tab-group">
                <router-link to="/userHome/resourceList" class="tab-link" active-class="active">资源</router-link>
                <span class="tab-number">{{ userHomeStore.resourceCount }}</span>
            </span>
            <span class="tab-group">
                <router-link to="/userHome/collectList" class="tab-link" active-class="active">收藏</router-link>
            </span>
            <span class="tab-group">
                <router-link to="/userHome/likeList" class="tab-link" active-class="active">点赞</router-link>
            </span>
            <span class="tab-group">
                <router-link to="/userHome/browseList" class="tab-link" active-class="active">浏览</router-link>
            </span>
        </div>
        
        <div class="content">
            <RouterView/>
        </div>
    </div>
</template>
<script lang="ts" setup name="UserContent">
import PostList from '@/components/userHome/PostList.vue';
import { eventBus } from '@/utils/eventBus';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useUserHomeStore } from '@/stores/userHome';

let userHomeStore = useUserHomeStore();

</script>
<style scoped>
/* 核心：移除固定宽度，改用100%继承父容器宽度 */
.userContent {
    border: 1px solid #e5e7eb;
    border-radius: 0.4rem; /* 相对单位（原6px，1rem≈15px时） */
    padding: 1rem 0.7rem; /* 相对单位（原16px 10px） */
    height: 98.7%;
    width: 100%; /* 关键：占满父容器宽度，不再硬编码735px */
    box-sizing: border-box; /* 确保border and padding不增加总宽度 */
    display: flex; /* 添加flex布局 */
    flex-direction: column; /* 垂直排列子元素 */
    background-color: #ffffff;
}

.head {
    padding-bottom: 0.5rem; /* 原8px */
    border-bottom: 1px solid #e5e7eb;
    margin-left: 0.5rem; /* 原7px，相对单位 */
}

/* 内容区保持100%宽度，避免溢出 */
.content {
    width: 100%;
    padding: 0 0.4rem; /* 原6px，相对单位 */
    flex: 1; /* 关键：让内容区域充满剩余空间 */
    min-height: 0; /* 修复flex子元素的最小高度问题 */
    z-index: 1;
}

/* 文字大小用rem，随全局字体缩放 */
.tab-link {
    font-size: 1.2rem; /* 原18px，1rem≈15px时 */
    font-weight: 400;
    color: #374151;
    text-decoration: none;
    padding-bottom: 0.3rem; /* 原4px */
}

/* 间距用rem，避免固定像素 */
.tab-group {
    margin-right: 2.5rem; /* 原40px，相对单位 */
}

.tab-number {
    font-weight: 350;
    margin-left: 0.15rem; /* 原2px */
}

/* 激活状态的样式也用相对单位 */
.active {
    font-weight: 550;
    padding-bottom: 0.35rem; /* 原5px */
    border-bottom: 0.15rem solid #000000; /* 原2px */
}
</style>