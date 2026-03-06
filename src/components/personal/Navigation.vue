<template>
    <div class="navigation">
        <div class="nav-list">
            <router-link to="/personal/profile" class="nav-item" active-class="active">个人资料</router-link>
            <router-link to="/personal/account" class="nav-item" active-class="active">账号设置</router-link>
            <router-link to="/personal/myLikes" class="nav-item" active-class="active">我的点赞</router-link>
            <router-link to="/personal/myCollect" class="nav-item" active-class="active">我的收藏</router-link>
            <router-link to="/personal/myBrowse" class="nav-item" active-class="active">浏览历史</router-link>
        </div>
    </div>
</template>
<script lang="ts" setup name="Navigation"></script>
<style scoped>
.navigation {
    width: 180px;
    padding: 2px;
    margin: 0;
}

.nav-list {
    list-style: none;
    padding: 4px 8px;
    margin: 0;
    display: flex;
    flex-direction: column;
    width: 100%;

}

.nav-item {
    display: block;
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    text-decoration: none;
    box-sizing: border-box;
    text-align: center;
    transition: background-color 0.3s ease;
    border-radius: 6px;
}

.nav-item:hover {
    background-color: #f0f0f0;
}

.active {
    background-color: #dddcdc;
    font-weight: 500;
}
</style>
