<template>
    <div class="message-center">
        <div class="message-center-header">
            <span>消息中心</span>
        </div>
        <div class="message-links">
            <span class="tab-group">
                <router-link to="/messageCenter/myMessage" class="tab-link" active-class="active">我的消息</router-link>
            </span>
            <span class="tab-group">
                <router-link to="/messageCenter/myComment" class="tab-link" active-class="active">评论</router-link>
            </span>
            <span class="tab-group">
                <router-link to="/messageCenter/myNewFan" class="tab-link" active-class="active">新增粉丝</router-link>
            </span>
            <span class="tab-group">
                <router-link to="/messageCenter/myLikeAndCollect" class="tab-link" active-class="active">赞和收藏</router-link>
            </span>
        </div>
        <div class="message-content">
            <RouterView/>
        </div>
    </div>
</template>
<script lang="ts" setup name="MessageCenter">
import {ref,onMounted} from 'vue'

</script>
<style scoped>

.message-center {
    padding: 10px ;
}

.message-center-header {
    font-size: 1.5rem;
    margin-left: 0.5rem;
    margin-bottom: 1rem;
}

.message-links {
    padding-bottom: 1rem; /* 原8px */
    border-bottom: 1px solid #e5e7eb;
    margin-left: 0.5rem; /* 原7px，相对单位 */
    /* margin-right: 0.1rem; */
}

.tab-link {
    font-size: 1.1rem; /* 原18px，1rem≈15px时 */
    font-weight: 400;
    color: #374151;
    text-decoration: none;
    padding-bottom: 0.3rem; /* 原4px */
}

.tab-group {
    margin-right: 2.5rem; /* 原40px，相对单位 */
}

.active {
    font-weight: 550;
    padding-bottom: 0.35rem; /* 原5px */
    border-bottom: 0.15rem solid #000000; /* 原2px */
}

.message-content {
    margin-left: 0.5rem;
}
</style>