<template>
  <div class="my-new-fan">
    <div class="fan-list">
      <div 
        class="fan-item"
        v-for="item in fanList"
        :key="item.userId"
      >
        <div class="fan-item-main">
          <img :src="`/api${item.userImage}`" class="fan-avatar" @click="jumpToHome(item.userId)"/>

          <div class="fan-info">
            <div class="fan-line">
              <span class="fan-name">{{ item.userName }}</span>
              <span class="fan-content">{{ handleFanMainContent(item) }}&nbsp;&nbsp;</span>
              <span class="fan-source">{{ handleFanSourceContent(item) }}</span>
            </div>
        
            <div class="fan-time">{{ item.createTime }}</div>
          </div>
        </div>
        <!-- ⭐ 未读红点：isRead = 0 -->
        <div v-if="item.isRead === 0" class="fan-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="MyNewFan">
import {ref,onMounted} from 'vue'
import { getMessageList, readNewFanMessage } from '@/api/userInfo/messageCenter'
import type { FanNotification, FanNotifications } from '@/types/index'
import { useRouter } from 'vue-router'

const router = useRouter()

let fanList = ref<FanNotifications>([])

/**
 * 处理通知内容
 */
function handleFanMainContent(item: FanNotification) {
  if (item.content.includes('关注了你')) {
    return '关注了你'
  }
}

function handleFanSourceContent(item: FanNotification) {
  if (item.content.includes('关注了你')) {
    return item.content.split('关注了你')[1]
  }
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
    notificationId: 3,
  })
  // 过滤逻辑：排除当前用户自己的通知
  const currentUserId = Number(localStorage.getItem('userId'))
  fanList.value = res.data.filter((item: FanNotification) => 
    item.userId !== currentUserId
  )

  res.data.forEach(async (item: FanNotification) => {
    if (item.isRead == 0) {
      await readNewFanMessage({
        userId: Number(localStorage.getItem('userId')),
        targetUserId: item.userId,
      })
    }
  })
})
</script>
<style scoped>
.my-new-fan {
  display: flex;
  height: 720px;
  border-radius: 8px;
  background-color: #fff;
  padding: 16px;
  box-sizing: border-box;
}

/* 列表区：支持滚动但隐藏滚动条 */
.fan-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 6px;
}

/* 隐藏滚动条 Chrome */
.fan-list::-webkit-scrollbar {
  display: none;
}
/* Firefox */
.fan-list {
  scrollbar-width: none;
}

/* 单条粉丝通知卡片 */
.fan-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px;
  position: relative;
  display: flex;
  transition: background 0.2s ease;
  cursor: pointer;
}
.fan-item:hover {
  background: #f1f3f5;
}

.fan-item-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 头像 */
.fan-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

/* 信息文本区 */
.fan-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fan-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

/* 用户名更醒目 */
.fan-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* 内容跟在后面 */
.fan-content {
  font-size: 15px;
  color: #444;
  white-space: normal;
}

/* 时间保持不变 */
.fan-time {
  font-size: 12px;
  color: #999;
}

/* ⭐ 未读红点 */
.fan-dot {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 10px;
  height: 10px;
  background: #ff4d4f;
  border-radius: 50%;
}

.fan-source {
  font-size: 12px;
  color: #6d6d6d;
  font-weight: 400;
}
</style>