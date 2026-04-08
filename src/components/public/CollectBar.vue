<template>
    <div class="collect-bar">
        <div class="collect-header">
            <div class="title">添加收藏夹</div>
            <el-icon class="close-btn" @click="$emit('close')"><Close /></el-icon>
        </div>
        <div class="page-type" v-if="pageTypeNum === 0">
            <div class="collect-content">
                <div class="create-new" @click="handleCreateNewCollection">
                    <el-icon class="plus-icon"><CirclePlusFilled /></el-icon>
                    <div class="text">创建收藏夹</div>
                </div>
                <div class="list-label">我的收藏夹</div>
                <div class="collector-list custom-scrollbar">
                    <div class="collector-item" v-for="item in collectList" :key="item.id">
                        <div class="collector-info">
                            <div class="collector-name">{{ item.favoritesName }}</div>
                            <div class="collector-meta">{{ item.collectCount }}条内容 · 公开</div>
                        </div>
                        <div class="collector-action">
                            <button class="collect-btn" :class="{active: targetHasCollected.includes(item.id)}" @click="handleCollect(item.id)">{{ targetHasCollected.includes(item.id) ? '已收藏' : '收藏' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-type" v-else>
            <div class="create-new-main">
                <div class="new-title">
                    <el-input 
                        v-model="newTitle"
                        placeholder="收藏夹名称"
                        :maxlength="15"
                        show-word-limit
                    ></el-input>
                </div>
                <div class="new-intro">
                    <el-input
                     v-model="newIntro" 
                     type="textarea"
                     placeholder="收藏夹简介(可选)"
                     show-word-limit
                     maxlength="200"
                     :rows="5"
                     ></el-input>
                </div>
                <div class="setting-item">
                    <div class="setting-label">
                        <span>私密</span>
                        <el-icon class="help-icon"><QuestionFilled /></el-icon>
                    </div>
                    <el-switch v-model="isPrivate" active-color="#ff5c38"></el-switch>
                </div>
                <div class="setting-item">
                    <div class="setting-label">
                        <span>默认</span>
                        <el-icon class="help-icon"><QuestionFilled /></el-icon>
                    </div>
                    <el-switch v-model="isDefault" active-color="#ff5c38"></el-switch>
                </div>
            </div>
            <div class="create-new-footer">
                <div class="action-btn back-btn" @click="handleBack">返回</div>
                <div class="action-btn create-btn" :class="{disabled: !newTitle}" @click="handleCreate">确认创建</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CirclePlusFilled, Close, QuestionFilled } from '@element-plus/icons-vue'
import { getUserCollectList, changeCollectStatus } from '@/api/userInfo/homePage'
import type { UserCollects } from '@/types'
import { createCollect, getTargetHasCollected } from '@/api/index/viewPage'
import { ElMessage } from 'element-plus';

const props = defineProps<{
    contentId: number;
    type: number;
}>();

const emit = defineEmits(['close', 'success']);

const collectList = ref<UserCollects>([]);

let pageTypeNum = ref<number>(0);

let newTitle = ref<string>('');
let newIntro = ref<string>('');
let isPrivate = ref<boolean>(false);
let isDefault = ref<boolean>(false);

let targetHasCollected = ref<number[]>([]);

/**
 * 加载收藏夹列表
 */
const loadUserCollectList = () => {
    getUserCollectList(Number(localStorage.getItem('userId'))).then(res => {
        collectList.value = res.data;
    });
}

/**
 * 获取目标内容已收藏的收藏夹
 */
const loadTargetHasCollected = () => {
    return getTargetHasCollected({
        userId: Number(localStorage.getItem('userId')),
        postId: props.contentId
    }).then(res => {
        targetHasCollected.value = res.data;
    });
}

/**
 * 处理收藏
 */
const handleCollect = (favoritesId: number) => {
    const isCollected = targetHasCollected.value.includes(favoritesId);
    changeCollectStatus({
        userId: Number(localStorage.getItem('userId')),
        postId: props.contentId,
        status: isCollected ? 1 : 0,
        favoriteId: favoritesId
    }).then((res: any) => {
        if (res.code === 200) {
            ElMessage.success(isCollected ? '已取消收藏' : '已收藏');
            // 计算更新后的数量：如果之前是已收藏，现在取消，则总数-1；反之+1
            // 第二个参数是当前文章还被多少个收藏夹收藏
            const lastActiveFavNum = isCollected ? targetHasCollected.value.length - 1 : targetHasCollected.value.length + 1;
            emit('success', isCollected ? 1 : 0, lastActiveFavNum);
            
            // 重新加载状态
            loadTargetHasCollected();
            loadUserCollectList();
        }
    });
}

/**
 * 处理跳转创建新收藏夹页
 */
const handleCreateNewCollection = () => {
    pageTypeNum.value = 1;
}

/**
 * 返回
 */
const handleBack = () => {
    pageTypeNum.value = 0;
}

/**
 * 处理创建新收藏夹页
 */
const handleCreate = () => {
        createCollect({
        userId: Number(localStorage.getItem('userId')),
        name: newTitle.value,
        description: newIntro.value,
        isPrivate: isPrivate.value,
        isDefault: isDefault.value
    }).then((res: any) => {
        if (res.code === 200) {
            ElMessage.success('已创建');
            pageTypeNum.value = 0;
            // 重置表单
            newTitle.value = '';
            newIntro.value = '';
            isPrivate.value = false;
            isDefault.value = false;
            loadUserCollectList();
            loadTargetHasCollected();
        } else {
            ElMessage.warning(res.msg);
        }
    });
}

onMounted(() => {
    Promise.all([
        loadUserCollectList(),
        loadTargetHasCollected()
    ]).then(() => {
        console.log('搜藏该文章的收藏夹', targetHasCollected.value, '用户收藏夹列表', collectList.value);
    });
});

</script>

<style scoped>
.collect-bar {
    width: 500px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.collect-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-bottom: 1px solid #f0f0f0;
}

.collect-header .title {
    font-size: 18px;
    font-weight: 500;
    color: #1a1a1a;
}

.close-btn {
    position: absolute;
    right: 16px;
    font-size: 20px;
    color: #bfbfbf;
    cursor: pointer;
    transition: all 0.2s;
}

.close-btn:hover {
    color: #666;
    /* transform: rotate(90deg); */
}

.collect-content {
    padding: 20px;
    padding-top: 10px;
    flex: 1;
}

.create-new {
    background-color: #f7f8f9;
    padding: 14px 16px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 18px;
}

.create-new:hover {
    background-color: #f0f1f2;
    /* transform: translateY(-1px); */
}

.plus-icon {
    font-size: 22px;
    color: #ff5c38;
}

.create-new .text {
    font-size: 15px;
    color: #333;
    font-weight: 500;
}

.list-label {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 12px;
    padding-left: 4px;
}

.collector-list {
    max-height: 280px;
    overflow-y: auto;
    padding-right: 4px;
}

.collector-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.collector-item:hover {
    background-color: #fafafa;
}

.collector-name {
    font-size: 15px;
    color: #262626;
    font-weight: 500;
    margin-bottom: 4px;
}

.collector-meta {
    font-size: 12px;
    color: #bfbfbf;
}

.collect-btn {
    background: #fff;
    border: 1px solid #d9d9d9;
    color: #595959;
    padding: 5px 16px;
    border-radius: 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.collect-btn:hover {
    border-color: #ff5c38;
    color: #ff5c38;
    background: #fff5f3;
}

.collect-btn.active {
    border: 1px solid #d9d9d9;
    color: #595959;
    background: #f5f5f5;

    &:hover {
        border-color: #7c7c7c;
        color: #595959;
        background: #ececec;
    }
}

/* 自定义滚动条 */
.collector-list::-webkit-scrollbar {
  width: 4px;
}

.collector-list::-webkit-scrollbar-thumb {
  background-color: #e8e8e8;
  border-radius: 2px;
}

.collector-list::-webkit-scrollbar-track {
  background-color: transparent;
}

/**
 * 创建新收藏夹
 */
.create-new-main {
    padding: 20px;
    padding-top: 10px;
    flex: 1;
}

.create-new-main .new-title {
    margin-bottom: 16px;
}

.create-new-main .new-intro {
    margin-bottom: 20px;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 0 4px;
}

.setting-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #666;
}

.help-icon {
    font-size: 14px;
    color: #bfbfbf;
    cursor: help;
}

.el-input {
    height: 40px;
}

.create-new-footer {
    padding: 20px;
    padding-top: 10px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.action-btn {
    padding: 6px 16px;
    border-radius: 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    /* 字体 */
    font-family: 'Microsoft YaHei', sans-serif;
}

.back-btn {
    border: 1px solid #d9d9d9;
    color: #595959;
    background: #fff;
}

.back-btn:hover {
    border-color: #7c7c7c;
    color: #7c7c7c;
    background: #f5f5f5;
}

.create-btn {
    /* border: 1px solid #d9d9d9; */
    color: #fff;
    background: #ff5c38;
}

.create-btn:hover {
    border-color: #ff5c38;
    color: #fff;
    background: #f8390e;
}

.create-btn.disabled {
    border-color: #d9d9d9;
    color: #fff;
    background: #ffa591;
    &:hover {
        cursor: not-allowed;
    }
}
</style>