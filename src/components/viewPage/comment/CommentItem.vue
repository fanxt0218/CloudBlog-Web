<template>
    <div
        class="comment-item"
        :class="{ 'is-child': level > 0 }"
        :style="{ paddingLeft: level * 2 + 'px' }"
    >
        <img class="avatar" :src="`/api${item.userAvatar}`" @click="jumpToHome(item.userId)"/>

        <div class="comment-main">
            <div class="comment-header">
                <span class="username"  @click="jumpToHome(item.userId)">{{ item.userName }}</span>
                <span class="author" v-if="authorId && authorId === item.userId">作者</span>
                <span class="reply-to" v-if="item.level >= 2 && item.parentCommentId">
                    <svg t="1767972710893" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16533" width="9" height="9">
                        <path d="M128.7552 496.64c0-56.4224 0.064-112.8512-0.0192-169.2736-0.0896-61.6512-0.384-123.3024-0.4672-184.9536-0.0512-36.704 23.0464-66.6368 58.4448-75.648 20.288-5.1648 39.5456-1.9648 57.6192 8.4672 66.176 38.176 132.3392 76.3712 198.5088 114.5536 138.8032 80.096 277.6 160.1984 416.416 240.2752 21.184 12.2176 34.6304 30.0928 38.8992 54.24 5.728 32.4224-9.0688 63.648-37.5872 80.0512-67.8912 39.0336-135.8336 77.9904-203.7568 116.9664-136.5888 78.3808-273.1648 156.7872-409.792 235.104-27.7184 15.8912-55.68 15.8976-82.5024-1.6128-22.3872-14.6112-34.208-36.1088-34.3488-62.9824-0.4672-89.8112-0.5632-179.616-0.7616-269.4272-0.064-28.5824-0.0128-57.1712-0.0128-85.7536-0.2112-0.0064-0.4288-0.0064-0.64-0.0064z" p-id="16534" fill="#8a8a8a">
                        </path></svg>
                    <span class="reply-to-user" @click="replyCommentP(item.parentCommentId, item.parentUserName)">
                        &nbsp;&nbsp;{{ item.parentUserName }}
                        <!-- <span class="author" v-if="authorId && authorId === item.userId">作者</span> -->
                    </span>
                </span>
                <span class="time">{{ formatRelativeTime(item.createTime) }}</span>
            </div>

            <div class="comment-text" @click="replyComment(item)">
                {{ item.content }}
            </div>

            <div class="comment-actions">
                <span class="action" @click="replyComment(item)">回复</span>
                <span class="action" :class="{active: item.isLike === true}" @click="toggleLike(item)">
                    <svg t="1766849215043" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8163" width="20" height="20">
                            <path d="M190.193225 471.411583c14.446014 0 26.139334-11.718903 26.139334-26.13831 0-14.44499-11.69332-26.164916-26.139334-26.164916-0.271176 0-0.490164 0.149403-0.73678 0.149403l-62.496379 0.146333c-1.425466-0.195451-2.90005-0.295735-4.373611-0.295735-19.677155 0-35.621289 16.141632-35.621289 36.114522L86.622358 888.550075c0 19.949354 15.96767 35.597753 35.670407 35.597753 1.916653 0 3.808746 0.292666 5.649674 0l61.022819 0.022513c0.099261 0 0.148379 0.048095 0.24764 0.048095 0.097214 0 0.146333-0.048095 0.24457-0.048095l0.73678 0 0-0.148379c13.413498-0.540306 24.174586-11.422144 24.174586-24.960485 0-13.55983-10.760065-24.441669-24.174586-24.981974l0-0.393973-50.949392 0 1.450025-402.275993L190.193225 471.409536z" fill="currentColor" p-id="8164"></path><path d="M926.52241 433.948343c-19.283182-31.445176-47.339168-44.172035-81.289398-45.546336-1.77032-0.246617-3.536546-0.39295-5.380544-0.39295l-205.447139-0.688685c13.462616-39.059598 22.698978-85.58933 22.698978-129.317251 0-28.349675-3.193739-55.962569-9.041934-82.542948l-0.490164 0.049119c-10.638291-46.578852-51.736315-81.31498-100.966553-81.31498-57.264215 0-95.466282 48.15065-95.466282 106.126063 0 3.241834-0.294712 6.387477 0 9.532097-2.996241 108.386546-91.240027 195.548698-196.23636 207.513194l0 54.881958-0.785899 222.227314 0 229.744521 10.709923 0 500.025271 0.222057 8.746198-0.243547c19.35686 0.049119 30.239721-4.817726 47.803749-16.116049 16.682961-10.761088 29.236881-25.50079 37.490869-42.156122 2.260483-3.341095 4.028757-7.075139 5.106298-11.20111l77.018118-344.324116c1.056052-4.053316 1.348718-8.181333 1.056052-12.160971C943.643346 476.446249 938.781618 453.944769 926.52241 433.948343zM893.82573 486.837924l-82.983993 367.783411-0.099261-0.049119c-2.555196 6.141884-6.879688 11.596106-12.872169 15.427364-4.177136 2.727111-8.773827 4.351098-13.414521 4.964058-1.49812-0.195451-3.046383 0-4.620227 0l-477.028511-0.540306-0.171915-407.408897c89.323375-40.266076 154.841577-79.670527 188.596356-173.661202 0.072655 0.024559 0.124843 0.049119 0.195451 0.072655 2.99931-9.137101 6.313799-20.73423 8.697079-33.164331 5.551436-29.185716 5.258771-58.123792 5.258771-58.123792-4.937452-37.98001 25.940812-52.965306 44.364417-52.965306 25.304316 0.860601 50.263777 33.656541 50.263777 52.326762 0 0 5.600555 27.563776 5.649674 57.190537 0.048095 37.366026-4.6673 56.847729-4.6673 56.847729l-0.466628 0c-5.872754 30.879288-16.214287 60.138682-30.464849 86.964654l0.36839 0.342808c-2.358721 4.815679-3.709485 10.220782-3.709485 15.943111 0 19.922748 19.088754 21.742187 38.765909 21.742187l238.761895 0.270153c0 0 14.666024 0.465604 14.690584 0.465604l0 0.100284c12.132318-0.638543 24.221658 5.207605 31.100322 16.409738 5.504364 9.016351 6.437619 19.6045 3.486404 28.988218L893.82573 486.837924z" fill="currentColor" p-id="8165"></path><path d="M264.827039 924.31872c0.319272 0.024559 0.441045 0.024559 0.295735-0.024559 0.243547-0.048095 0.367367-0.074701-0.295735-0.074701s-0.539282 0.026606-0.271176 0.074701C264.43409 924.343279 264.532327 924.343279 264.827039 924.31872z" fill="currentColor" p-id="8166">
                            </path>
                    </svg>
                    {{ item.likeCount }}</span>
                    <span class="del action" v-if="item.userId === userId" @click="toggleDelComment(item.commentId)">
                        删除
                    </span>
            </div>

            <!-- 子评论 -->
            <template v-if="item.isExpanded && item.children?.length">
              <CommentItem
                v-for="child in item.children"
                :key="child.commentId"
                :item="child"
                :level="level + 1"
                :author-id="authorId"
                @load-child="$emit('load-child', $event)"
                @del-comment="$emit('del-comment', $event)"
                @reply-comment="$emit('reply-comment', $event)"

              />
            </template>

            <!-- 展开 -->
            <div
              v-if="item.childCount > 0 && !item.isExpanded"
              class="expand-reply"
              @click.stop="toggleExpand"
            >
              展开 {{ item.childCount }} 条评论
            </div>

            <!-- 收起 -->
            <div
              v-if="item.isExpanded"
              class="expand-reply-collapse"
              @click.stop="toggleExpand"
            >
              收起评论
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '@/utils/timeUtil'
import { changeLikeStatus } from '@/api/userInfo/homePage'
import { delComment } from '@/api/index/viewPage'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const userId = Number(localStorage.getItem('userId'))

const props = defineProps<{
    item: any
    level: number
    authorId: number | null
}>()

const emit = defineEmits(['load-child', 'del-comment', 'reply-comment'])

const toggleExpand = () => {
    emit('load-child', props.item)
}

/**
 * 点赞评论
 */
const toggleLike = async (item: any) => {
    if (!userId ||userId == 0) {
        ElMessage.error('请先登录')
        return
    }
    changeLikeStatus({
        userId: userId,
        targetId: item.commentId,
        status: item.isLike ? 1 : 0,
        type: 2 
    })
    item.isLike = !item.isLike
    item.likeCount = item.isLike ? item.likeCount + 1 : item.likeCount - 1
}

/**
 * 删除评论
 */
const toggleDelComment = async (commentId: number, currentItems: any = props.item) => {
    const res = await delComment(commentId)
    emit('del-comment', commentId)
    if (res.code === 200) {
        ElMessage.success('删除成功')
    } else {
        ElMessage.error(res.msg || '删除失败')
    }
}

/**
 * 回复评论
 */
const replyComment = (item: any) => {
    console.log('回复评论', item)
    emit('reply-comment', item)
}

const replyCommentP = (parentCommentId: number, parentUserName: string) => {
    console.log('回复评论', parentCommentId, parentUserName)
    emit('reply-comment', {
        commentId: parentCommentId,
        userName: parentUserName
    })
}

/**
 * 跳转用户主页
 */
const jumpToHome = (userId: number) => {
    window.open(`/otherUserHome/${userId}`, '_blank')
}



</script>
<style scoped>
/* 单条评论 */
.comment-item {
    display: flex;
    gap: 12px;
    padding: 14px 0;
    /* border-bottom: 1px solid #f0f0f0; */
}

/* 头像 */
.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    cursor: pointer;
}

/* 评论主体 */
.comment-main {
    flex: 1;
}

/* 头部：用户名 + 时间 */
.comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.username {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
}

.author {
    font-size: 12px;
    color: #ff4830;
    /* margin-left: 4px; */
    background-color: #fdd7d2;
    padding: 1px 3px;
    border-radius: 4px;
}

.time {
    font-size: 12px;
    color: #7c7c7c;
}

/* 评论正文 */
.comment-text {
    margin-top: 6px;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    word-break: break-word;
    cursor: pointer;
}

/* 操作区 */
.comment-actions {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: 14px;
    font-weight: 350;
    color: #888;
}

.action {
    /* 居中 */
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 4px;
}

.action:hover {
    color: #ff7f6e;
}

.action.active {
    color: #ff7f6e;
}

/* 子评论 */
.child-comment-list {
    margin-top: 10px;
    padding: 8px 12px;
    background: #f7f7f7;
    border-radius: 6px;
}

.child-comment {
    font-size: 13px;
    color: #555;
    line-height: 1.5;
}

.child-comment + .child-comment {
    margin-top: 6px;
}

.child-username {
    font-weight: 500;
    color: #333;
    margin-right: 4px;
}

.expand-reply {
    margin-top: 8px;
    font-size: 13px;
    color: #9e9e9e;
    cursor: pointer;
    /* 居中 */
    display: flex;
    justify-content: center;
}

.expand-reply:hover {
    text-decoration: underline;
}

.expand-reply-collapse {
    /* margin-top: 8px; */
    font-size: 13px;
    color: #9e9e9e;
    cursor: pointer;
    /* 居中 */
    display: flex;
    justify-content: center;
}

.expand-reply-collapse:hover {
    text-decoration: underline;
}

/* .del {
  opacity: 0;
  transition: opacity 0.3s;
}

.comment-item:hover .del {
  opacity: 1;
} */

.reply-to {
    font-size: 13px;
    font-weight: 350;
    color: #5f5e5e;
}

.reply-to-user {
    font-weight: 500;
    color: #333;
    cursor: pointer;
}

/* 默认隐藏 */
.del {
  opacity: 0;
  transition: opacity 0.2s;
}

/* 只在 hover 当前 comment-item 时，显示它“自己的” reply */
.comment-item:hover > .comment-main > .comment-actions > .del {
  opacity: 1;
}

</style>
