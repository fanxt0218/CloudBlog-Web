<template>
    <div class="left-info">
        <div class="author-info">
            <div class="avatar" @click="jumpToAuthorProfile">
                <img :src="`/api${authorInfo?.image}`" alt="">
            </div>
            <div class="author-info-right">
                <div class="author-name" @click="jumpToAuthorProfile">{{ authorInfo?.userName }}</div>
                <div class="author-level">
                    <div class="level-info">
                        等级
                        <img class="level-icon" :src="`../../../../public/assests/icon/level${authorInfo?.level}.png`" alt="">
                    </div>
                    <div class="blog-age">
                        博龄 {{ authorInfo?.blogAge }} 年
                    </div>
                </div>
            </div>
        </div>
        <div class="data-info">
            <div class="data-item">
                <span>{{ authorInfo?.postCount }}</span>
                <span>文章</span>
            </div>
            <div class="data-item">
                <span>{{ authorAchievement?.likeCount }}</span>
                <span>点赞</span>
            </div>
            <div class="data-item">
                <span>{{ authorAchievement?.collectCount }}</span>
                <span>收藏</span>
            </div>
            <div class="data-item">
                <span>{{ authorInfo?.fanCount }}</span>
                <span>粉丝</span>
            </div>
        </div>
        <div class="action-line" v-if="props.authorId !== userId">
            <div class="follow-btn" :class="{'focused': isFocused}" @click="handleFollow">{{ isFocused? '已':''}}关注</div>
            <div class="message-btn" @click="handlePrivateMessage">私信</div>
        </div>
    </div>
</template>
<script setup lang="ts" name="LeftAuthorInfo">
import { ref, onMounted } from 'vue';
import { getUserInfo, getUserAchievement } from '@/api/userInfo/homePage';
import type { UserInfo, UserAchievement } from '@/types/index'
import { getFocusStatus, focusUser } from '@/api/userInfo/otherHomePage';
import { ElMessage } from 'element-plus'
import { useMessageStore } from '@/stores/messageStore';
import { useRouter } from 'vue-router';
import router from '@/router';

const props = defineProps<{
    authorId: number;
    postTitle?: string;
}>()

const userId = Number(localStorage.getItem('userId') || null);

let authorInfo = ref<UserInfo | null>(null);
let authorAchievement = ref<UserAchievement | null>(null);

let isFocused = ref(false);

// 引入消息中心store
const messageStore = useMessageStore();

/**
 * 关注/取消关注用户
 */
const handleFollow = async() => {
    const param = {
        userId: userId,
        focusUserId: props.authorId,
        status: isFocused.value ? 1 : 0,
        source: '文章 ['+props.postTitle+']'
    }
    const res = await focusUser(param);
    if(res.code === 200) {
        isFocused.value = !isFocused.value;
    } else {
        ElMessage.error('操作失败');
        console.error('操作失败');
    }
}

/**
 * 处理私信按钮点击
 */
const handlePrivateMessage = () => {
  // 设置目标用户ID到store
  messageStore.setTargetUserId(props.authorId)
  // 跳转到消息中心
//   window.open('/messageCenter/myMessage', '_blank');
  router.push('/messageCenter/myMessage')
}

/**
 * 跳转作者主页
 */
const jumpToAuthorProfile = () => {
  window.open(`/otherUserHome/${props.authorId}`, '_blank')
}

onMounted(async () => {
    const res = await getUserInfo(props.authorId);
    authorInfo.value = res.data;
    const achievementRes = await getUserAchievement(props.authorId);
    authorAchievement.value = achievementRes.data;
    // 获取关注状态
    const focusRes = await getFocusStatus({
        userId: userId,
        focusUserId: props.authorId
    });
    isFocused.value = focusRes.data;
})
</script>
<style scoped>
.left-info {
  /* position: sticky; */
  top: 80px; /* 根据你的 header 高度调整 */
  width: 260px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-size: 14px;
}

/* ===== 作者信息 ===== */
.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info-right {
  margin-left: 12px;
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 6px;
  cursor: pointer;
}

.author-level {
  display: flex;
  gap: 6px;
}

.level-info,
.blog-age {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #f2f3f5;
  color: #6b7280;
}

.level-icon {
  width: 20px;
  height: 20px;
  margin-left: 1px;
  margin-top: -5px;
  vertical-align: middle;
  align-items: center;
}

/* ===== 数据区 ===== */
.data-info {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #f0f0f03f;
  border-bottom: 1px solid #f0f0f038;
  background: #f0f0f03b;
  border-radius: 6px;
  margin-bottom: 14px;
}

.data-item {
  flex: 1;
  text-align: center;
}

.data-item span:first-child {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.data-item span:last-child {
  display: block;
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

/* ===== 操作按钮 ===== */
.action-line {
  display: flex;
  gap: 10px;
}

.follow-btn {
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  background: #ff6a00;
  color: #fff;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.follow-btn:hover {
  background: #ff7d1a;
}

.follow-btn.focused {
  background: #e0e0e0;
  color: #888888;
}

.message-btn {
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.message-btn:hover {
  border-color: #ff6a00;
  color: #ff6a00;
}

</style>
