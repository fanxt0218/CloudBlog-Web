<template>
    <div class="comment-bar">
        <div class="head-line">
            <div class="title">
                评论
            </div>
            <div class="comment-count">
                ({{ commentCount }})
            </div>
        </div>
        <div class="comment-content">
            <!-- 空状态 -->
            <div v-if="commentItems.length === 0" class="empty-comment">
                <el-empty :image-size="120" description="暂无评论，快来抢沙发吧~" />
            </div>
            
            <div
                v-for="item in commentItems"
                :key="item.commentId"
                class="comment-root"
            >
                <!-- 根评论 -->
                <CommentItem
                    :item="item"
                    :level="0"
                    :author-id="authorId"
                    @load-child="toggleChildComments"
                    @del-comment="toggleDelComment"
                    @reply-comment="replyComment"
                />
            </div>
        </div>

        <div class="input-area">
            <!-- 未登录状态提示 -->
            <div v-if="!isLoggedIn" class="login-prompt">
                <span class="prompt-text">登录后参与评论，分享你的想法</span>
                <button class="login-btn" @click="toLogin">立即登录</button>
            </div>

            <!-- 已登录状态输入框 -->
            <template v-else>
                <!-- 输入框 -->
                <textarea
                    v-model="commentText"
                    class="comment-textarea"
                    :placeholder="commentPlaceholder"
                    maxlength="1000"
                    @keydown="handleKeyDown"
                ></textarea>
            
                <!-- 底部工具栏 -->
                <div class="input-toolbar">
                    <div class="tool-left">
                        <span class="tool-icon"  @click="handleClick('emoji')" :class="{active:isEmojiWindowVisible}">
                            <svg t="1766305741355" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18173" width="25" height="25">
                                <path d="M510.944 960c-247.04 0-448-200.96-448-448s200.992-448 448-448c247.008 0 448 200.96 448 448S757.984 960 510.944 960zM510.944 128c-211.744 0-384 172.256-384 384 0 211.744 172.256 384 384 384 211.744 0 384-172.256 384-384C894.944 300.256 722.688 128 510.944 128zM512 773.344c-89.184 0-171.904-40.32-226.912-110.624-10.88-13.92-8.448-34.016 5.472-44.896 13.888-10.912 34.016-8.48 44.928 5.472 42.784 54.688 107.136 86.048 176.512 86.048 70.112 0 134.88-31.904 177.664-87.552 10.784-14.016 30.848-16.672 44.864-5.888 14.016 10.784 16.672 30.88 5.888 44.864C685.408 732.32 602.144 773.344 512 773.344zM368 515.2c-26.528 0-48-21.472-48-48l0-64c0-26.528 21.472-48 48-48s48 21.472 48 48l0 64C416 493.696 394.496 515.2 368 515.2zM656 515.2c-26.496 0-48-21.472-48-48l0-64c0-26.528 21.504-48 48-48s48 21.472 48 48l0 64C704 493.696 682.496 515.2 656 515.2z" fill="currentColor" p-id="18174">
                                </path>
                            </svg>
                        </span>
                        <span class="tool-icon">{ }</span>
                    </div>
                
                    <button
                        class="submit-btn"
                        :disabled="!commentText.trim()"
                        @click="submitComment"
                    >
                        评论
                    </button>
                </div>
                <EmojiWindow
                    v-if="isEmojiWindowVisible"
                    @emoji-selected="insertEmoji"
                    class="emoji-windows"
                />
            </template>
        </div>

    </div>
</template>
<script setup lang="ts" name="CommentBar">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getCommentList, comment, calcCommentCount } from '@/api/index/viewPage';
import type { CommentItems } from '@/types/index';
import CommentItem from './CommentItem.vue'
import EmojiWindow from '@/components/messageCenter/EmojiWindow.vue'
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useUserInfoStore } from '@/stores/userInfo';
import { storeToRefs } from 'pinia';

const router = useRouter()
const userInfoStore = useUserInfoStore()
const { isLoggedIn } = storeToRefs(userInfoStore)

const props = defineProps({
    contentId: {
        type: Number,
        default: 0
    },
    authorId: {
        type: [Number, null],
        default: null
    },
    type: {
        type: Number,
        default: 0
    }
})

let commentItems = ref<CommentItems>([]);

let commentCount = ref<number>(0)

let selectedCommentId = ref<number | null>(null);

const commentText = ref('')

const isEmojiWindowVisible = ref(false)

// 回复评论id
const replyCommentId = ref<number | null>(null)

let commentPlaceholder = ref('说点什么吧～')

/**
 * 获取评论列表
 */
const fetchCommentList = async () => {
    const res = await getCommentList({
        contentId: props.contentId,
        type: props.type,
        parentId: null,
        userId: localStorage.getItem('userId')
            ? Number(localStorage.getItem('userId'))
            : null
    })

    if (res.code === 200) {
        commentItems.value = res.data || []
    }
}

const toggleChildComments = async (item: any) => {
    console.log('要展开的评论', item)
  // 已展开 → 只收起
  if (item.isExpanded) {
    item.isExpanded = false
    
    return
  }

  // 第一次展开 → 拉数据
  if (!item.children) {
    const res = await getCommentList({
        contentId: props.contentId,
        type: props.type,
        parentId: item.commentId,
        userId: localStorage.getItem('userId')
            ? Number(localStorage.getItem('userId'))
            : null
    })
    if (res.code === 200) {
      item.children = res.data || []
    }
  }

  item.isExpanded = true
}

/**
 * 删除评论
 */
const toggleDelComment = async (commentId: number, currentItems: CommentItems = commentItems.value) => {
    // 递归从评论列表中删除该评论
    if (currentItems == null || currentItems.length === 0) {
        return false;
    }
    for (let index = 0; index < currentItems.length; index++) {
        const item = currentItems[index];
        if (item?.commentId === commentId) {
            // 删除该评论
            currentItems.splice(index, 1);
            
            // 刷新子组件
            // CommentItem.update()
            return true;
        }
        if (item?.children) {
            const isDeleted = await toggleDelComment(commentId, item.children);
            if (isDeleted) {
                item.childCount--;
                commentCount.value--
            }
        }
    }
}

// 处理选中的表情
const insertEmoji = (emoji: string) => {
  commentText.value += emoji; // 在输入框中添加表情
  isEmojiWindowVisible.value = false; // 隐藏表情弹窗
};

// 处理点击表情弹窗
const handleClick = (type:string) => {
  isEmojiWindowVisible.value = !isEmojiWindowVisible.value
}

// 点击空白区域隐藏弹窗
const handleClickOutside = (event: MouseEvent) => {
  // console.log('点击了空白区域，弹窗的状态', isEmojiWindowVisible.value)
  const target = event.target as HTMLElement;
  // 如果表情弹窗可见，且点击的元素不是表情弹窗、表情按钮或其内部元素
  if (isEmojiWindowVisible.value) {
    const emojiWindow = document.querySelector('.emoji-windows');
    const toolbarBtn = document.querySelector('.tool-left');
    // console.log('点击了空白区域，进入了一层', isEmojiWindowVisible.value)
    if (emojiWindow && toolbarBtn) {
      // 检查点击是否在表情弹窗或工具栏按钮内
      if (!emojiWindow.contains(target) && !toolbarBtn.contains(target)) {
        isEmojiWindowVisible.value = false;
      }
    }
  }
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
    // 检查是否是回退键(Backspace)并且输入框为空
    if (event.key === 'Backspace' && !commentText.value.trim()) {
        // 重置回复状态
        replyCommentId.value = null;
        commentPlaceholder.value = '说点什么吧～';
    }
}

/**
 * 查找根评论
 */
/**
 * 查找根评论
 */
function findRootComment(commentId: number) {
    let rootComment: any = null
    commentItems.value.forEach(e => {
        console.log('查找一级根评论', e.commentId)
        if (e.commentId === commentId) {
            rootComment = e
            return e;
        } else if (e.children){
            e.children.forEach(child => {
                console.log('查找二级根评论', child.commentId)
                if (child.commentId == commentId) {
                    rootComment = e
                    return e;
                }
            })
        }
    });
    return rootComment;
}


/**
 * 发布/回复评论
 */
const replyComment = (item: any) => {
    if (!isLoggedIn.value) {
        ElMessage.warning('请先登录再进行回复');
        router.push('/login');
        return;
    }
    console.log('回复评论1', item)
    replyCommentId.value = item.commentId
    commentPlaceholder.value = `@${item.userName} `
}

const toLogin = () => {
    router.push('/login');
};

const submitComment = () => {
    if (Number(localStorage.getItem('userId')) == 0) {
        ElMessage.error('请先登录')
        router.push('/login')
        return
    }
    if (!commentText.value.trim()) return

    // 发布评论
    const param = {
        userId: Number(localStorage.getItem('userId')),
        targetCommentId: replyCommentId.value,
        contentId: props.contentId,
        content: commentText.value,
        type: props.type
    }
    comment(param).then(res => {
        if (res.code === 200) {
            // 刷新评论列表
            // fetchCommentList()

            // 临时增加评论内容
            if (replyCommentId.value) {
                console.log('提交评论后，经检查，回复了评论', replyCommentId.value)
                const rootComment = findRootComment(replyCommentId.value) as any
                if (rootComment) {
                    rootComment.children = rootComment.children || []
                    rootComment.children.push(res.data)
                    // 增加评论数量
                    rootComment.childCount++

                    // 展开评论
                    console.log('自动展开评论',rootComment)
                    rootComment.isExpanded = true
                }
            } else {
                console.log('提交评论后，经检查，发布了根评论')
                commentItems.value.push(res.data)
            }
            // 增加评论总数
            commentCount.value++
            // 清空输入框
            commentText.value = ''
            // 重置回复状态
            replyCommentId.value = null
            commentPlaceholder.value = '说点什么吧～'
        }
    })
    console.log('提交评论：', commentText.value)

    commentText.value = ''
}

onMounted(() => {
    fetchCommentList();
    // 计算评论数
    calcCommentCount({
        contentId: props.contentId,
        type: props.type
    }).then(res => {
        if (res.code === 200) {
            commentCount.value = res.data
        }
    })

    // 添加点击空白区域隐藏表情弹窗的事件监听
    document.addEventListener('click', handleClickOutside);

    console.log('作者id', props.authorId)
})

onUnmounted(() => {
    // 移除点击空白区域隐藏表情弹窗的事件监听
    document.removeEventListener('click', handleClickOutside);
})
</script>
<style scoped>
.comment-bar {
    position: fixed;
    top: 0;
    right: 0;
    width: 500px;
    max-width: 90vw;
    height: 100vh;
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    border-left: 1px solid #e5e5e5;

    display: flex;
    flex-direction: column; /* ⭐️ 核心 */
}


.head-line {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    padding: 14px 18px;
    gap: 5px;
    border-bottom: 1px solid #e5e5e5;
}

.title {
    font-size: 17px;
    color: #333333e1;
}

.comment-count {
    font-size: 16px;
    color: #333333e1;
}

/* 评论内容区域 */
.comment-content {
    flex: 1;                 /* ⭐️ 吃掉剩余高度 */
    padding: 12px 18px;
    overflow-y: auto;

    /* Firefox */
    scrollbar-width: none;

    /* IE / Edge (旧) */
    -ms-overflow-style: none;
}

/* Chrome / Safari / 新 Edge */
.comment-content::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.comment-root {
    display: flex;
    gap: 12px;
    /* padding: 14px 0; */
    /* border-bottom: 1px solid #f0f0f0; */
}

/* 子评论只是缩进，不改样式 */
.comment-root.is-child {
    border-bottom: none;
}

/* 底部输入区 */
.input-area {
    position: relative;      /* ❌ 不要 fixed */
    width: 100%;
    padding: 8px 15px 10px;
    box-sizing: border-box;
    /* border-top: 1px solid #e5e5e5b0; */
    background: #fff;
    z-index: 1;
}

.emoji-windows {
    position: absolute;
    bottom: 110%;       /* 输入框上方 */
    left: 0;
    z-index: 10;
}

/* 提示文字 */
.input-tip {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
}

/* 输入框 */
.comment-textarea {
    width: 100%;
    min-height: 120px;
    max-height: 120px;
    resize: none;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    line-height: 1.6;
    outline: none;
    box-sizing: border-box;
    /* background: rgba(248, 249, 251, 0.8); */
}

.comment-textarea:focus {
    border-color: #ff7a45;
}

/* 工具栏 */
.input-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    background-color: #fff;
}

/* 左侧 icon */
.tool-left {
    display: flex;
    gap: 10px;
    padding: 0 5px
}

.tool-icon {
    font-size: 16px;
    color: #666;
    cursor: pointer;
    user-select: none;
}

.tool-icon:hover {
    color: #ff7a45;
}

/* 评论按钮 */
.submit-btn {
    background: #ff7a45;
    color: #fff;
    border: none;
    border-radius: 16px;
    padding: 6px 16px;
    font-size: 14px;
    cursor: pointer;
}

.submit-btn:disabled {
    background: #ffd1c2;
    cursor: not-allowed;
}

/* 空状态样式 */
.empty-comment {
    margin-top: 15vh;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.8;
}

:deep(.el-empty__description p) {
    color: #999;
    font-size: 14px;
}


/* 登录提示 */
.login-prompt {
    width: 100%;
    height: 120px;
    background: #f8f9fb;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    border: 1px dashed #e5e5e5;
}

.prompt-text {
    font-size: 14px;
    color: #666;
}

.login-btn {
    background: #ff7a45;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 6px 24px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
}

.login-btn:hover {
    background: #e66a3a;
}
</style>
