<template>
    <div class="search-user-result">
        <div class="user-item" v-for="user in searchUsers" :key="user.userId">
            <div class="user-avatar" @click="handleJumpToUserProfile(user.userId)">
                <img :src="`/api${user.image}` || '/assets/default-avatar.png'" alt="avatar">
            </div>
            
            <div class="user-main-info">
                <div class="user-name-row">
                    <span class="user-name" v-html="highlightKeyword(user.userName)" @click="handleJumpToUserProfile(user.userId)"></span>
                </div>
                <div class="user-stats">
                    <span>原创 {{ user.contentCount }}</span>
                    <span>阅读 {{ formatCount(user.viewCount) }}</span>
                    <span>点赞 {{ user.likedCount }}</span>
                </div>
                <div class="user-bio" v-html="highlightKeyword(user.introduction)"></div>
            </div>

            <div class="user-action" v-if="user.userId !== userId">
                <button class="follow-btn" :class="{ followed: user.follow }" @click="handleFollow(user)">
                    {{ user.follow ? '已关注' : '关注' }}
                </button>
            </div>
        </div>
        
        <div class="empty-result" v-if="searchUsers.length === 0">
            <el-empty :image-size="200" description="没有找到相关的用户" />
        </div>
    </div>
</template>

<script setup lang="ts" name="SearchUserResult">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { searchUser } from '@/api/index/searchPage'
import type { SearchUser } from '@/types/index'
import { focusUser } from '@/api/userInfo/otherHomePage'
import { ElMessage } from 'element-plus'

const route = useRoute()
const emit = defineEmits(['searchResultCount'])

const searchUsers = ref<SearchUser[]>([])
const userId = ref<number>(Number(localStorage.getItem('userId')))

/** 搜索关键词 */
const searchKey = computed(() => route.query.q as string || '')

/** 格式化数字 (如 5.3万+) */
function formatCount(count: number | string) {
    const num = Number(count)
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万+'
    }
    return num
}

/** 关键词高亮 */
function highlightKeyword(text: string) {
    if (!searchKey.value || !text) return text
    const reg = new RegExp(`(${searchKey.value})`, 'gi')
    return text.replace(reg, '<em class="highlight">$1</em>')
}

/** 搜索用户 */
async function searchUserResult(key: string) {
    try {
        const res = await searchUser(key, userId.value == 0 ? null : userId.value)
        if (res.code === 200) {
            searchUsers.value = res.data
            emit('searchResultCount', res.data.length)
        }
    } catch (error) {
        console.error('搜索用户失败:', error)
    }
}

/** 跳转用户主页 */
const handleJumpToUserProfile = (userId: number) => {
    window.open(`/otherUserHome/${userId}`, '_blank');
}

/** 关注/取消关注 (占位) */
const handleFollow = (user: SearchUser) => {
    console.log('关注用户:', user.userId)
    focusUser({
        userId:userId.value,
        focusUserId:user.userId,
        status: user.follow === 0 ? 0 : 1,
        source:'用户搜索'
    }).then(res => {
        if (res.code === 200) {
            user.follow = user.follow === 1 ? 0 : 1
            ElMessage.success(user.follow === 1 ? '关注成功' : '取消关注成功')
        }
    })
}

onMounted(() => {
    if (searchKey.value) {
        searchUserResult(searchKey.value)
    }
})

watch(() => searchKey.value, (newKey) => {
    if (newKey) {
        searchUserResult(newKey)
    } else {
        searchUsers.value = []
        emit('searchResultCount', 0)
    }
})
</script>

<style scoped>
.search-user-result {
    background-color: #fff;
    padding: 0 20px;
    margin-top: 0.7rem;
    flex: 1;
}

.user-item {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
    gap: 16px;
}

.user-item:last-child {
    border-bottom: none;
}

.user-avatar {
    width: 60px;
    height: 60px;
    cursor: pointer;
    flex-shrink: 0;
}

.user-avatar img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
}

.user-main-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

.user-name {
    font-size: 17px;
    color: #222;
    font-weight: 500;
    cursor: pointer;
    line-height: 1.4;
}

.user-name:hover {
    color: #fc5531;
}

.user-stats {
    display: flex;
    gap: 15px;
    font-size: 14px;
    font-weight: 350;
    color: #666;
}

.user-bio {
    font-size: 14px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height:1.6;
}

.user-action {
    margin-left: 20px;
}

.follow-btn {
    min-width: 88px;
    height: 32px;
    border-radius: 16px;
    border: 1px solid #e0e0e0;
    background: #fff;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
}

.follow-btn:hover {
    border-color: #fc5531;
    color: #fc5531;
}

.follow-btn.followed {
    background: #f5f5f5;
    color: #999;
    border-color: transparent;
}

.empty-result {
    padding: 40px 0;
}

/* 高亮样式 */
:deep(.highlight) {
    color: #fc5531;
    font-style: normal;
}
</style>
