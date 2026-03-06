<template>
    <div class="my-comment">
      <div class="comment-list">
        <div v-for="item in commentList" :key="item.id" class="comment-item" :class="{'read_item': item.isRead == 0}">
          <div class="comment-item-header">
            <img :src="`/api${item.userImage}`" alt="" class="comment-item-avatar" @click="jumpToHome(item.userId)">
            <div class="comment-item-info">
              <div class="comment-item-name">{{ item.userName }}</div>
              <div class="comment-item-time">{{ item.createTime }}</div>
            </div>
          </div>
          <div class="comment-item-content">{{ item.content }}</div>
          <div v-if="item.isRead === 0" class="comment-item-dot"></div>
        </div>
      </div>
    </div>
</template>
<script lang="ts" setup name="MyComment">
import { ref, onMounted } from 'vue'
import { getMessageList, readCommentMessage } from '@/api/userInfo/messageCenter'
import type { CommentNotification, CommentNotifications } from '@/types/index'
import { useRouter } from 'vue-router'

const router = useRouter()

let commentList = ref<CommentNotifications>([])

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
    notificationId: 2,
  })
  // 过滤逻辑：排除当前用户自己的通知
  const currentUserId = Number(localStorage.getItem('userId'))
  commentList.value = res.data.filter((item: CommentNotification) => 
    item.userId !== currentUserId
  )

  res.data.forEach(async (item: CommentNotification) => {
    if (item.isRead == 0) {
      await readCommentMessage({
        userId: Number(localStorage.getItem('userId')),
        targetUserId: item.userId,
      })
    }
  })
})
</script>
<style scoped>
.my-comment {
  display: flex;
  height: 720px;
  border-radius: 8px;
  background-color: #fff;
  padding: 16px;
  box-sizing: border-box;
}

/* 列表本身滚动，隐藏滚动条 */
.comment-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px; /* 防止滚动条占位 */
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 隐藏滚动条（Chrome） */
.comment-list::-webkit-scrollbar {
  display: none;
}

/* 隐藏滚动条（Firefox） */
.comment-list {
  scrollbar-width: none;
}

/* 单条通知卡片 */
.comment-item {
  padding: 14px;
  background: #f8f9fa;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: background 0.2s;
  cursor: pointer;
}
/* 
.read_item {
  background: #fdfdfd;
} */

/* 鼠标悬浮轻度提升 */
.comment-item:hover {
  background: #f1f3f5;
}

/* 顶部头像 + 用户名 + 时间 */
.comment-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 头像 */
.comment-item-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

/* 文本信息 */
.comment-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-item-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.comment-item-time {
  font-size: 12px;
  color: #999;
}

/* 评论内容 */
.comment-item-content {
  font-size: 14px;
  color: #444;
  line-height: 1.45;
  padding: 10px 12px;
  background: #f1f1f1;
  border: 1px solid #f1f1f1;
  border-radius: 8px;
}

/* 让右上角能放红点 */
.comment-item {
  position: relative;
}

/* 未读红点 */
.comment-item-dot {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 10px;
  height: 10px;
  background: #ff4d4f;
  border-radius: 50%;
}


</style>