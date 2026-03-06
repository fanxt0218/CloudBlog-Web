<template>
  <div class="my-like-and-collect">

    <div class="lc-list">
      <div
        class="lc-item"
        v-for="item in likeAndCollectList"
        :key="item.objectId + '-' + item.userId"
      >
        <div class="lc-left">
          <img :src="`/api${item.userImage}`" class="lc-avatar" @click="jumpToHome(item.userId)"/>

          <div class="lc-info">
            <div class="lc-line">
              <span class="lc-name">{{ item.userName }}</span>
              <span class="lc-content">{{ item.content }}</span>
            </div>

            <!-- 博客标题 -->
            <div v-if="item.objectTitle" class="lc-title">
              {{ item.objectTitle }}
            </div>
          </div>
        </div>

        <div class="lc-right">
          <!-- 删除图标 -->
          <!-- <i class="lc-delete-icon">🗑</i> -->

          <div class="lc-time">{{ formatNoticeTime(item.createTime) }}</div>
        </div>

        <!-- 未读红点 -->
        <div v-if="item.isRead === 0" class="lc-dot"></div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts" name="MyLikeAndCollect">
import {ref,onMounted} from 'vue'
import { getMessageList, readLikeAndCollectMessage } from '@/api/userInfo/messageCenter'
import type { LikeAndCollectNotification, LikeAndCollectNotifications } from '@/types/index'
import { useRouter } from 'vue-router'

const router = useRouter()

let likeAndCollectList = ref<LikeAndCollectNotifications>([])

/**
 * 格式化通知时间
 * @param timeStr ]
 */
function formatNoticeTime(timeStr: string) {
  const date = new Date(timeStr);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  // 1. 24小时内
  if (diffHours < 24) {
    const h = Math.max(1, Math.floor(diffHours));
    return `${h}小时前`;
  }

  // 2. 3天内
  if (diffDays < 3) {
    return `${Math.floor(diffDays)}天前`;
  }

  // 3. 本周内（周一到周日）
  const weekDayNames = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const nowWeek = now.getDay();
  const dateWeek = date.getDay();
  const nowWeekStart = new Date(now);
  nowWeekStart.setHours(0, 0, 0, 0);
  nowWeekStart.setDate(now.getDate() - nowWeek); // 本周周日 00:00

  if (date.getTime() >= nowWeekStart.getTime()) {
    return weekDayNames[dateWeek];
  }

  // 4. 同一年内 → MM月DD日
  if (now.getFullYear() === date.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // 5. 跨年 → YYYY年MM月DD日
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 跳转他人用户主页
 */
const jumpToHome = (userId: number) => {
  // router.push(`/otherUserHome/${userId}`)
  window.open(`/otherUserHome/${userId}`, '_blank');
}



onMounted(async () => {
  const res = await getMessageList({
    userId: Number(localStorage.getItem('userId')),
    notificationId: 4,
  })
  // 过滤逻辑：排除当前用户自己的通知
  const currentUserId = Number(localStorage.getItem('userId'))
  likeAndCollectList.value = res.data.filter((item: LikeAndCollectNotification) => 
    item.userId !== currentUserId
  )

  // 标记为已读
  res.data.forEach((item: LikeAndCollectNotification) => {
    if (item.isRead == 0) {
        readLikeAndCollectMessage({
          userId: Number(localStorage.getItem('userId')),
          targetUserId: item.userId
        })
    }
  });
})
</script>
<style scoped>
.my-like-and-collect {
  display: flex;
  height: 720px;
  border-radius: 8px;
  background-color: #fff;
  padding: 16px;
  box-sizing: border-box;
}

/* 列表支持滚动，隐藏滚动条 */
.lc-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-right: 6px;
}

.lc-list::-webkit-scrollbar {
  display: none;
}
.lc-list {
  scrollbar-width: none;
}

/* 单条通知 */
.lc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  transition: background 0.2s ease;
  padding: 5px;
  cursor: pointer;
}
.lc-item:hover {
  background: #fafafa;
}

/* 左边：头像 + 信息 */
.lc-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

/* 头像 */
.lc-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

/* 信息区 */
.lc-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 第一行：用户名 + 内容 */
.lc-line {
  font-size: 15px;
  color: #333;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.lc-name {
  font-weight: 500;
  color: #333;
}

.lc-content {
  color: #727272;
}

/* 标题 */
.lc-title {
  font-size: 16px;
  font-weight: 450;
  color: #333;
  margin-top: 2px;
}

/* 右侧：时间 + 删除图标 */
.lc-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 120px;
}

/* 删除按钮 */
.lc-delete-icon {
  font-size: 16px;
  cursor: pointer;
  color: #ccc;
  transition: 0.2s;
}
.lc-delete-icon:hover {
  color: #ff4d4f;
}

/* 时间 */
.lc-time {
  font-size: 12px;
  color: #999;
  margin-top: 1rem;
}

/* 未读红点 */
.lc-dot {
  position: absolute;
  right: 0;
  top: 6px;
  width: 10px;
  height: 10px;
  background: #ff4d4f;
  border-radius: 50%;
}

</style>