<template>
    <div class="share-view">
        <!-- 左侧内容区 -->
        <div class="left-content" v-if="shareView">
            <div class="avatar-container" @click="handleJumpToUserHome(shareView.authorId)">
              <img class="avatar" :src="`/api${shareView.userImage}`" />
            </div>

            <!-- 头部信息 -->
            <div class="info-container">
                <div class="head-line">
                    <div class="author-info">
                        <div class="author-name" @click="handleJumpToUserHome(shareView.authorId)">{{ shareView.userName }}</div>
                        <div class="publish-time">{{formatRelativeTime(shareView.createTime) }}</div>
                    </div>
                </div>

                <!-- 内容 -->
                <div class="content">
                    <p class="text-content">{{ shareView.content }}</p>

                    <!-- 媒体容器 -->
                    <div
                      class="media-wrapper"
                      v-if="shareView.imageUrl || shareView.videoUrl"
                    >
                      <img
                        v-if="shareView.imageUrl"
                        class="media"
                        :src="`/api${shareView.imageUrl}`"
                        @click="previewImage(`/api${shareView.imageUrl}`)"
                      />
                      <video
                        v-if="shareView.videoUrl"
                        class="media"
                        controls
                        :src="`/api${shareView.videoUrl}`"
                      ></video>
                    </div>
                </div>

                <!-- 话题 -->
                <div class="topic-sign" v-if="shareView.topicId">
                    <svg t="1766305924725" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19491" id="mx_n_1766305924725" width="20" height="20">
                        <path d="M476.021333 544h63.424l8.533334-64h-63.424l-8.533334 64zM512 85.333333c235.637333 0 426.666667 191.029333 426.666667 426.666667S747.637333 938.666667 512 938.666667a424.778667 424.778667 0 0 1-219.125333-60.501334 2786.56 2786.56 0 0 0-20.053334-11.765333l-104.405333 28.48c-23.893333 6.506667-45.802667-15.413333-39.285333-39.296l28.437333-104.288c-11.008-18.688-18.218667-31.221333-21.802667-37.909333A424.885333 424.885333 0 0 1 85.333333 512C85.333333 276.362667 276.362667 85.333333 512 85.333333z m89.557333 234.944a32 32 0 0 0-35.946666 27.498667L556.512 416h-63.424l7.968-59.776a32 32 0 0 0-63.445333-8.448L428.512 416H352a32 32 0 0 0 0 64h67.978667l-8.533334 64H352a32 32 0 0 0 0 64h50.912l-7.968 59.776a32 32 0 0 0 63.445333 8.448L467.488 608h63.424l-7.968 59.776a32 32 0 0 0 63.445333 8.448L595.488 608H672a32 32 0 0 0 0-64h-67.978667l8.533334-64H672a32 32 0 0 0 0-64h-50.912l7.968-59.776a32 32 0 0 0-27.498667-35.946667z" fill="#1e80ff" p-id="19492">
                        </path>
                    </svg>
                    <span class="topic-tag">
                        {{ getTopicName(shareView.topicId) }}
                    </span>
                </div>

                <!-- 工具栏 -->
                <div class="tool-bar">
                    <div class="tool-item">
                        <svg t="1766849502278" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9632" width="20" height="20">
                            <path d="M883.037 512.652h23.273c-18.781 0-23.273 4.352-23.273 23.272v325.819c-1.792 5.445 1.466 21.9 0 23.272H138.31c-6.144-5.027 0.163-0.721 0 0V163.561c0-6.307 3.351-24.553 9.588-24.553l362.775 1.28c18.782 0 24.134-21.923 23.273-23.273-1.303-2.024-0.116-31.022-23.273-23.272H171.171c-43.776 0-79.407 35.886-79.407 79.965v677.864c0 44.102 35.63 79.965 79.407 79.965h676.887c43.776 0 81.525-25.716 81.525-69.818V535.901c8.005-29.068-27.742-23.25-46.546-23.25zM650.31 140.288h209.454C736.861 267.753 570.112 419.095 447.232 546.56c-30.348 31.488 9.775 67.444 40.169 35.91 122.344-126.883 273.291-268.754 395.636-395.637v209.455c2.91 31.535 49.687 30.557 46.546 0v-266.17c0-10.566 5.957-7.634 0-13.103 3.072-6.586-13.406-22.62-23.273-23.272-3.282-0.21-19.945-0.49-23.273 0H650.31c-30.115-0.14-32.093 46.429 0 46.545z" fill="currentColor" p-id="9633">    
                            </path>
                        </svg>
                        分享
                    </div>
                    <div class="tool-item comment-bar-btn" @click="toggleCommentBar()">
                        <svg t="1766848961248" class="icon" viewBox="0 0 1058 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7092" width="18" height="18">
                                <path d="M330.744242 885.372121l194.779798-129.861818 16.665859-11.106263h383.844848c36.486465 0 66.19798-29.659798 66.19798-66.146262v-529.19596c0-36.434747-29.711515-66.107475-66.19798-66.107475H132.305455c-36.486465 0-66.146263 29.659798-66.146263 66.107475v529.19596c0 36.486465 29.659798 66.146263 66.146263 66.146262h198.438787v140.968081m-66.146262 123.578182V810.550303H132.305455c-73.024646 0-132.305455-59.216162-132.305455-132.292525v-529.19596C0 76.024242 59.267879 16.808081 132.305455 16.808081h793.742222c73.076364 0 132.357172 59.216162 132.357171 132.240808v529.195959c0 73.076364-59.267879 132.292525-132.357171 132.292526h-363.830303L264.59798 1008.950303z m0 0" p-id="7093" fill="currentColor">
                                </path>
                        </svg>
                        {{ shareView.commentCount === 0 ? '评论' : shareView.commentCount }}
                    </div>
                    <div class="tool-item" @click="handleLikeClick(shareView.id)"  :class="{active: shareView.like === true}">
                        <svg t="1766849215043" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8163" width="21" height="21">
                            <path d="M190.193225 471.411583c14.446014 0 26.139334-11.718903 26.139334-26.13831 0-14.44499-11.69332-26.164916-26.139334-26.164916-0.271176 0-0.490164 0.149403-0.73678 0.149403l-62.496379 0.146333c-1.425466-0.195451-2.90005-0.295735-4.373611-0.295735-19.677155 0-35.621289 16.141632-35.621289 36.114522L86.622358 888.550075c0 19.949354 15.96767 35.597753 35.670407 35.597753 1.916653 0 3.808746 0.292666 5.649674 0l61.022819 0.022513c0.099261 0 0.148379 0.048095 0.24764 0.048095 0.097214 0 0.146333-0.048095 0.24457-0.048095l0.73678 0 0-0.148379c13.413498-0.540306 24.174586-11.422144 24.174586-24.960485 0-13.55983-10.760065-24.441669-24.174586-24.981974l0-0.393973-50.949392 0 1.450025-402.275993L190.193225 471.409536z" fill="currentColor" p-id="8164"></path><path d="M926.52241 433.948343c-19.283182-31.445176-47.339168-44.172035-81.289398-45.546336-1.77032-0.246617-3.536546-0.39295-5.380544-0.39295l-205.447139-0.688685c13.462616-39.059598 22.698978-85.58933 22.698978-129.317251 0-28.349675-3.193739-55.962569-9.041934-82.542948l-0.490164 0.049119c-10.638291-46.578852-51.736315-81.31498-100.966553-81.31498-57.264215 0-95.466282 48.15065-95.466282 106.126063 0 3.241834-0.294712 6.387477 0 9.532097-2.996241 108.386546-91.240027 195.548698-196.23636 207.513194l0 54.881958-0.785899 222.227314 0 229.744521 10.709923 0 500.025271 0.222057 8.746198-0.243547c19.35686 0.049119 30.239721-4.817726 47.803749-16.116049 16.682961-10.761088 29.236881-25.50079 37.490869-42.156122 2.260483-3.341095 4.028757-7.075139 5.106298-11.20111l77.018118-344.324116c1.056052-4.053316 1.348718-8.181333 1.056052-12.160971C943.643346 476.446249 938.781618 453.944769 926.52241 433.948343zM893.82573 486.837924l-82.983993 367.783411-0.099261-0.049119c-2.555196 6.141884-6.879688 11.596106-12.872169 15.427364-4.177136 2.727111-8.773827 4.351098-13.414521 4.964058-1.49812-0.195451-3.046383 0-4.620227 0l-477.028511-0.540306-0.171915-407.408897c89.323375-40.266076 154.841577-79.670527 188.596356-173.661202 0.072655 0.024559 0.124843 0.049119 0.195451 0.072655 2.99931-9.137101 6.313799-20.73423 8.697079-33.164331 5.551436-29.185716 5.258771-58.123792 5.258771-58.123792-4.937452-37.98001 25.940812-52.965306 44.364417-52.965306 25.304316 0.860601 50.263777 33.656541 50.263777 52.326762 0 0 5.600555 27.563776 5.649674 57.190537 0.048095 37.366026-4.6673 56.847729-4.6673 56.847729l-0.466628 0c-5.872754 30.879288-16.214287 60.138682-30.464849 86.964654l0.36839 0.342808c-2.358721 4.815679-3.709485 10.220782-3.709485 15.943111 0 19.922748 19.088754 21.742187 38.765909 21.742187l238.761895 0.270153c0 0 14.666024 0.465604 14.690584 0.465604l0 0.100284c12.132318-0.638543 24.221658 5.207605 31.100322 16.409738 5.504364 9.016351 6.437619 19.6045 3.486404 28.988218L893.82573 486.837924z" fill="currentColor" p-id="8165"></path><path d="M264.827039 924.31872c0.319272 0.024559 0.441045 0.024559 0.295735-0.024559 0.243547-0.048095 0.367367-0.074701-0.295735-0.074701s-0.539282 0.026606-0.271176 0.074701C264.43409 924.343279 264.532327 924.343279 264.827039 924.31872z" fill="currentColor" p-id="8166">
                            </path>
                        </svg>
                        {{ shareView.likeCount === 0 ? '点赞' : shareView.likeCount }}
                    </div>
                    <div class="tool-item">
                        <div class="more-options-wrapper">
                            <svg t="1766849818698" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11068" width="21" height="21">
                                  <path d="M227.84 535.04m-51.2 0a51.2 51.2 0 1 0 102.4 0 51.2 51.2 0 1 0-102.4 0Z" fill="#515151" p-id="11069"></path><path d="M504.32 535.04m-51.2 0a51.2 51.2 0 1 0 102.4 0 51.2 51.2 0 1 0-102.4 0Z" fill="#515151" p-id="11070"></path><path d="M796.16 535.04m-51.2 0a51.2 51.2 0 1 0 102.4 0 51.2 51.2 0 1 0-102.4 0Z" fill="#515151" p-id="11071">
                                  </path>
                            </svg>
                            <!-- 弹出框 -->
                            <div class="popup-box">
                                <div class="popup-item" @click="handleReport">
                                    <svg t="1766852549056" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12307" width="19" height="19">
                                        <path d="M512 358.555826c-12.288 0-22.26087 9.97287-22.26087 22.26087l0 268.221217c0 12.288 9.97287 22.26087 22.26087 22.26087s22.26087-9.97287 22.26087-22.26087L534.26087 380.816696C534.26087 368.528696 524.288 358.555826 512 358.555826zM512 716.176696c-12.288 0-22.26087 9.97287-22.26087 22.26087l0 44.699826c0 12.288 9.97287 22.26087 22.26087 22.26087s22.26087-9.97287 22.26087-22.26087l0-44.699826C534.26087 726.149565 524.288 716.176696 512 716.176696zM998.912 867.394783 575.688348 131.33913C559.972174 104.025043 536.754087 88.33113 512 88.33113S464.027826 104.025043 448.311652 131.33913L25.088 867.394783c-8.859826 15.426783-13.356522 30.675478-13.356522 45.345391 0 32.456348 23.908174 65.224348 77.312 65.224348l845.913043 0c53.381565 0 77.289739-32.768 77.312-65.224348C1012.268522 898.070261 1007.771826 882.821565 998.912 867.394783zM934.956522 933.420522 89.043478 933.420522c-9.861565 0-32.790261-2.025739-32.790261-20.702609 0-6.678261 2.56-14.669913 7.41287-23.129043L486.912 153.533217c15.137391-26.290087 35.06087-26.290087 50.198261 0l423.223652 736.033391c4.85287 8.45913 7.41287 16.450783 7.41287 23.129043C967.746783 931.394783 944.818087 933.420522 934.956522 933.420522z" fill="currentColor" p-id="12308">
                                        </path>
                                    </svg>
                                    <span>举报</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧话题榜 -->
        <div class="topic-list">
            <div class="topic-title"># 热门话题</div>
            <div class="topic-item" v-for="topic in topicList" :key="topic.id">
                <img class="topic-avatar" :src="`/api${topic.cover}`" />
                <div class="topic-info">
                    <div class="topic-name">{{ topic.topicName }}</div>
                    <div class="topic-meta">{{ topic.participateCount }} 参与</div>
                </div>
            </div>
        </div>
    </div>
    <!-- 评论栏 -->
    <Teleport to="body">
        <!-- 遮罩 -->
      <Transition name="fade">
        <div
          v-if="showCommentBar"
          class="comment-mask"
          @click="toggleCommentBar"
        />
      </Transition>
      <Transition name="slide-right">
        <CommentBar
          v-if="showCommentBar"
          class="comment-bar"
          :content-id="shareId"
          :type="1"
        />
      </Transition>
    </Teleport>
    <!-- 举报弹窗 -->
    <ContentReport
      ref="reportRef"
      :target-id="shareId"
      :target-type="1"
      :title="shareView?.content || ''"
    />
</template>
<script lang="ts" setup name="ShareView">
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { getPublishPageTopicList } from '@/api/create/index';
import { getShareViewPage, addPostViewCount } from '@/api/index/viewPage';
import type { PublishTopics } from '@/types/index';
import type { ShareView } from '@/types/index';
import { useRoute} from 'vue-router';
import { formatRelativeTime } from '@/utils/timeUtil';
import { ElMessage } from 'element-plus';
import { changeLikeStatus } from '@/api/userInfo/homePage';
import CommentBar from '@/components/viewPage/comment/CommentBar.vue';
import ContentReport from '@/components/public/ContentReport.vue';
import { useUserInfoStore } from '@/stores/userInfo';

const route = useRoute();

const shareId = Number(route.params.shareId);

let topicList = ref<PublishTopics>([]);

const userInfoStore = useUserInfoStore()
const shareView = ref<any>(null);

// 控制更多选项弹窗显示状态
const showMoreOptions = ref(false)

// 评论栏
const showCommentBar = ref(false);

// 举报弹窗
const reportRef = ref();

/**
 * id转化话题名称
 */
function getTopicName(topicId: number) {
  const topic = topicList.value.find(t => t.id === topicId);
  return topic ? topic.topicName : '未知话题';
}

/**
 * 处理跳转用户主页
 * @param userId 
 */
const handleJumpToUserHome = (userId: number) => {
  // 新开启标签页
  window.open(`/otherUserHome/${userId}`, '_blank');
}

/**
 * 切换评论栏显示状态
 */
const toggleCommentBar = () => {
  showCommentBar.value = !showCommentBar.value;
}

/**
 * 处理点击外部区域隐藏评论栏
 */
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  // 如果评论栏显示中，且点击的元素不在评论栏或评论按钮内
  if (showCommentBar.value) {
    const commentBar = document.querySelector('.comment-bar') as HTMLElement;
    const commentBarBtn = document.querySelector('.comment-bar-btn') as HTMLElement;
    const emojiWindow = document.querySelector('.emoji-windows') as HTMLElement
    
    if (!commentBar || !commentBarBtn) return

    const clickInsideComment =
      commentBar.contains(target) ||
      commentBarBtn.contains(target) ||
      (emojiWindow && emojiWindow.contains(target))

    if (!clickInsideComment) {
      showCommentBar.value = false
      console.log('点击了评论栏外部区域')
    }
  }
}


// 监听shareView数据变化，设置页面标题
watch(shareView, (newShareView) => {
  if (newShareView && newShareView.content) {
    // 使用分享内容的前30个字符作为标题，如果内容太长则截断并添加省略号
    let title = newShareView.content.length > 30 
      ? newShareView.content.substring(0, 30) + '...' 
      : newShareView.content;
    
    // 设置页面标题
    document.title = `${title} - 动态详情`;
  } else {
    // 如果没有内容，则使用默认标题
    document.title = '动态详情 - CloudBlog';
  }
}, { immediate: true });

// 监听键盘事件，按下 ESC 键时关闭评论栏
const onEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showCommentBar.value) {
    toggleCommentBar();
  }
};

// 预览图片
const previewImage = (imgUrl: string) => {
  // 创建一个隐藏的图片预览元素或调用现有的图片预览功能
  // 这里假设你有一个图片预览组件或方法
  window.open(imgUrl, '_blank'); // 简单的实现，直接在新窗口打开图片
}

/**
 * 处理举报点击
 */
const handleReport = () => {
  reportRef.value?.open();
}

/**
 * 处理点赞点击
 * @param shareId 
 */
const handleLikeClick = (shareId: number) => {
  if (!shareView.value) { ElMessage.error('分享不存在'); return};
  console.log(shareView.value);
  console.log(shareView.value.like)

  // 发送点赞请求
  changeLikeStatus({
    userId: userInfoStore.userId,
    targetId: shareId,
    status: shareView.value?.like ? 1 : 0,
    type: 1
  }).then((res: any) => {
    if (res.code === 200 && shareView.value) {
      // 点赞成功，更新点赞数
      shareView.value.likeCount = shareView.value?.like ? shareView.value.likeCount - 1 : shareView.value.likeCount + 1;
      // 更新点赞状态
      shareView.value.like = !shareView.value.like;
    }
  });
}

onMounted(() => {
  getPublishPageTopicList().then(res => {
    topicList.value = res.data;
  });
  getShareViewPage({
    shareId: shareId,
    userId: userInfoStore.userId || undefined
  }).then(res => {
    shareView.value = res.data;
    console.log(shareView.value);
  });
  // 添加点击外部区域隐藏评论栏的事件监听
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', onEsc);

  // 增加文章浏览量
  if (userInfoStore.userId !== 0) {
    addPostViewCount({
      postId: shareId,
      userId: userInfoStore.userId,
      contentType: 1
    }).then((res: any) => {
      if (res.code === 200) {
        console.log('增加文章浏览量成功');
      } else {
        console.log('增加文章浏览量失败');
      }
    });
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('keydown', onEsc);
  document.body.style.overflow = '';
});
</script>
<style scoped>
.share-view {
  display: flex;
  gap: 24px;
  padding: 20px;
  width: 60%;
  margin: 40px auto;
  /* background: #f6f7f8; */
}

/* 左侧卡片 */
.left-content {
  /* position: relative; */
  display: flex;
  gap: 20px;
  flex: 1;
  background: #fff;
  padding: 20px 20px 20px 20px;
  border-radius: 8px;
  overflow: visible; /* 确保头像可溢出 */
  border: 1px solid #eeeeee70;
  /* 阴影 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  align-self: flex-start;
}

/* 头部 */
.head-line {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.avatar-float {
  position: absolute;
  left: -22px; 
  top: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-container {
  flex: 1;
}


.author-info {
  display: flex;
  flex-direction: column;
}


.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

/* 内容区 */
.content {
  margin-top: 8px;
  min-height: 50px;
}

.media-wrapper {
  margin-top: 12px;
  max-width: 420px;
  max-height: 240px;
  overflow: hidden;
  border-radius: 8px;
  /* background: #000; */
  border: 1px solid #eeeeee70;
}


.text-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.media {
  width: 100%;
  height: 100%;
  max-height: 240px;
  object-fit: cover; /* 关键 */
  display: block;
  cursor: pointer;
}


/* 图片 */
.media-image {
  margin-top: 12px;
  width: 100%;
  border-radius: 6px;
}

/* 视频 */
.media-video {
  margin-top: 12px;
  width: 100%;
  border-radius: 6px;
}

/* 话题 */
.topic-sign {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}

.topic-tag {
  font-size: 13px;
  color: #1e80ff;
}

/* 工具栏 */
.tool-bar {
  display: flex;
  /* gap: 24px; */
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  justify-content: space-between
}

.tool-item {
  font-size: 13px;
  color: #515151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tool-item:hover {
  color: #ff7f6e;
}

.tool-item.active {
  color: #ff7f6e;
}

.no-active {
    color: #f86f14;
    border-color: #f86f14;
}

/* 更多选项弹出框 */
.more-options-wrapper {
  position: relative;
  display: inline-block;
}

.popup-box {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 120px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 100;
}

.more-options-wrapper:hover .popup-box {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.popup-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #515151;
  font-size: 13px;
}

.popup-item:hover {
  background: #f5f5f5;
  color: #ff7f6e;
}

/* 右侧话题榜 */
.topic-list {
  width: 260px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eeeeee70;
  /* 阴影 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.topic-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
}

.topic-item:hover {
  background: #fafafa;
}

.topic-avatar {
  width: 36px;
  height: 36px;
  margin-left: 5px;
  border-radius: 6px;
  object-fit: cover;
}

.topic-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.topic-name {
  font-size: 14px;
  color: #333;
}

.topic-meta {
  font-size: 12px;
  color: #999;
}

/* -------------评论栏滑入动画------------------- */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

/* 初始：在屏幕右侧外 */
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100vw);
}

/* 进入完成 & 离开开始 */
.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}

.slide-right-enter-from {
  transform: translateX(calc(100vw + 20px));
}

.comment-bar {
  position: fixed;
  top: 0;
  right: 0;              /* 最终停靠位置 */
  height: 100vh;
  z-index: 999999;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  will-change: transform; /* 小优化 */
}

.comment-mask {
  position: fixed;
  inset: 0; /* top/right/bottom/left = 0 */
  background: rgba(0, 0, 0, 0.45);
  z-index: 99999; /* 比内容高，比评论栏低 */
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

</style>