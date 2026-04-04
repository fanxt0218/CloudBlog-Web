<template>
    <div class="post-view">
        <div class="head-info">
            <div class="post-title">{{ postData?.title }}</div>
            <div class="post-info">
                <span>{{ postData?.createTime }}发布</span>
                <span>·</span>
                <span>{{ postData?.browseCount }} 阅读</span>
                <span>·</span>
                <span>{{ postData?.likeCount }} 点赞</span>
                <span>·</span>
                <span>{{ postData?.collectCount }} 收藏</span>
                <span>·</span>
                <span>{{ postData?.commentCount }} 评论</span>
            </div>
            <div class="post-tag">
                <span>文章标签:</span>
                <div v-for="tag in postData?.tagList" :key="tag.tagId" class="tag-item">
                    #{{ tag.tagName }}
                </div>
            </div>
            <div class="post-category" v-if="postData?.categoryId" @click="JumpToTargetCategory">
                <div class="category-left">
                    <div class="category-cover">
                        <img :src="`/api${postData?.categoryCover}`" alt="分类封面" />
                    </div>
                    <div class="category-name">
                        {{ postData?.categoryName }}
                    </div>
                </div>
                <div class="category-right">
                    专栏收录该内容
                </div>
            </div>
        </div>
        <div class="render-area" id="post-content">
          <div class="post-content">
            <MarkdownRenderer
              v-if="postData?.storeType === 0"
              :content="postData?.content || ''"
            />
            <HtmlRenderer
              v-else
              :content="postData?.content || ''"
            />
          </div>
        </div>
        <el-affix position="bottom" :offset="0">
        <div class="footer-info">
            <div class="author-area">
                <div class="avatar">
                    <img :src="`/api${authorInfo?.image}`" alt="作者头像" />
                </div>
                <div class="author-name">{{ authorInfo?.userName }}</div>
            </div>
            <div class="tool-bar">
                <div class="tool-item" @click="handleLikeClick(postId)"  :class="{active: postData?.liked === 1}">
                    <svg t="1766849215043" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8163" width="21" height="21">
                        <path d="M190.193225 471.411583c14.446014 0 26.139334-11.718903 26.139334-26.13831 0-14.44499-11.69332-26.164916-26.139334-26.164916-0.271176 0-0.490164 0.149403-0.73678 0.149403l-62.496379 0.146333c-1.425466-0.195451-2.90005-0.295735-4.373611-0.295735-19.677155 0-35.621289 16.141632-35.621289 36.114522L86.622358 888.550075c0 19.949354 15.96767 35.597753 35.670407 35.597753 1.916653 0 3.808746 0.292666 5.649674 0l61.022819 0.022513c0.099261 0 0.148379 0.048095 0.24764 0.048095 0.097214 0 0.146333-0.048095 0.24457-0.048095l0.73678 0 0-0.148379c13.413498-0.540306 24.174586-11.422144 24.174586-24.960485 0-13.55983-10.760065-24.441669-24.174586-24.981974l0-0.393973-50.949392 0 1.450025-402.275993L190.193225 471.409536z" fill="currentColor" p-id="8164"></path><path d="M926.52241 433.948343c-19.283182-31.445176-47.339168-44.172035-81.289398-45.546336-1.77032-0.246617-3.536546-0.39295-5.380544-0.39295l-205.447139-0.688685c13.462616-39.059598 22.698978-85.58933 22.698978-129.317251 0-28.349675-3.193739-55.962569-9.041934-82.542948l-0.490164 0.049119c-10.638291-46.578852-51.736315-81.31498-100.966553-81.31498-57.264215 0-95.466282 48.15065-95.466282 106.126063 0 3.241834-0.294712 6.387477 0 9.532097-2.996241 108.386546-91.240027 195.548698-196.23636 207.513194l0 54.881958-0.785899 222.227314 0 229.744521 10.709923 0 500.025271 0.222057 8.746198-0.243547c19.35686 0.049119 30.239721-4.817726 47.803749-16.116049 16.682961-10.761088 29.236881-25.50079 37.490869-42.156122 2.260483-3.341095 4.028757-7.075139 5.106298-11.20111l77.018118-344.324116c1.056052-4.053316 1.348718-8.181333 1.056052-12.160971C943.643346 476.446249 938.781618 453.944769 926.52241 433.948343zM893.82573 486.837924l-82.983993 367.783411-0.099261-0.049119c-2.555196 6.141884-6.879688 11.596106-12.872169 15.427364-4.177136 2.727111-8.773827 4.351098-13.414521 4.964058-1.49812-0.195451-3.046383 0-4.620227 0l-477.028511-0.540306-0.171915-407.408897c89.323375-40.266076 154.841577-79.670527 188.596356-173.661202 0.072655 0.024559 0.124843 0.049119 0.195451 0.072655 2.99931-9.137101 6.313799-20.73423 8.697079-33.164331 5.551436-29.185716 5.258771-58.123792 5.258771-58.123792-4.937452-37.98001 25.940812-52.965306 44.364417-52.965306 25.304316 0.860601 50.263777 33.656541 50.263777 52.326762 0 0 5.600555 27.563776 5.649674 57.190537 0.048095 37.366026-4.6673 56.847729-4.6673 56.847729l-0.466628 0c-5.872754 30.879288-16.214287 60.138682-30.464849 86.964654l0.36839 0.342808c-2.358721 4.815679-3.709485 10.220782-3.709485 15.943111 0 19.922748 19.088754 21.742187 38.765909 21.742187l238.761895 0.270153c0 0 14.666024 0.465604 14.690584 0.465604l0 0.100284c12.132318-0.638543 24.221658 5.207605 31.100322 16.409738 5.504364 9.016351 6.437619 19.6045 3.486404 28.988218L893.82573 486.837924z" fill="currentColor" p-id="8165"></path><path d="M264.827039 924.31872c0.319272 0.024559 0.441045 0.024559 0.295735-0.024559 0.243547-0.048095 0.367367-0.074701-0.295735-0.074701s-0.539282 0.026606-0.271176 0.074701C264.43409 924.343279 264.532327 924.343279 264.827039 924.31872z" fill="currentColor" p-id="8166">
                        </path>
                    </svg>
                    {{ postData?.likeCount === 0 ? '点赞' : postData?.likeCount }}
                </div>
                <div class="tool-item"  @click="handleCollectClick(postId)" :class="{active: postData?.collected === 1}">
                    <svg t="1768123874806" class="icon" viewBox="0 0 1059 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3091" width="20" height="20">
                        <path d="M253.488042 1024c-16.9 0-33.2875-5.1125-47.6125-15.3625-26.625-18.425-39.425-49.6625-34.3125-81.925l40.9625-251.9c1.5375-10.2375-1.5375-20.475-8.7-27.65L28.213042 466.4375c-22.0125-22.525-29.1875-55.3-19.45-84.9875 9.725-29.7 35.325-51.2 66.05-55.8125l237.575-36.35c10.75-1.5375 19.4625-8.1875 24.0625-17.925L441.388042 48.125c13.825-29.7 42.5-48.125 75.2625-48.125s61.4375 18.4375 75.2625 48.125l104.45 223.2375c4.6125 9.725 13.825 16.375 24.0625 17.925L958.000542 325.625a82.355 82.355 0 0 1 66.05 55.8125c10.2375 29.7 2.5625 62.4625-19.45 84.9875l-175.625 180.7375c-7.1625 7.175-10.2375 17.925-8.7 27.65l40.9625 251.9c5.125 31.75-8.1875 63.4875-34.3 81.925-26.1125 18.4375-59.9 20.4875-88.0625 4.6125l-206.85-114.6875c-9.725-5.1125-20.9875-5.1125-30.7125 0l-207.3625 115.2c-12.8125 6.65-26.6375 10.2375-40.4625 10.2375zM516.650542 51.2c-12.8 0-23.55 7.1625-29.1875 18.4375L383.525542 292.875c-11.775 25.0875-35.325 43.0125-62.975 47.1l-237.575 36.35c-12.2875 2.05-21.5 9.7375-25.6 21.5-4.1 11.775-1.025 24.0625 7.675 32.775L240.688042 611.325c18.4375 18.95 26.625 45.5625 22.525 71.675L222.250542 934.9125c-2.05 12.8 3.075 24.575 13.3125 31.7375 10.2375 7.175 23.0375 7.6875 33.7875 1.5375l207.3625-115.2c25.0875-13.825 55.3-13.825 80.3875 0l207.3625 115.2c10.75 6.1375 23.55 5.625 33.8-1.5375 10.2375-7.1625 15.3625-18.95 13.3125-31.7375L770.625542 683.0125c-4.1-26.1125 4.1-52.7375 22.525-71.675l175.625-180.7375c8.7-8.7 11.2625-20.9875 7.675-32.775-4.0875-11.775-13.3125-19.9625-25.6-21.5l-237.5625-36.35c-27.65-4.0875-51.2-22.0125-62.975-47.1L545.838042 69.6375c-5.625-11.2625-16.375-18.4375-29.1875-18.4375z m0 0" p-id="3092" fill="currentColor">
                        </path>
                    </svg>
                    {{ postData?.collectCount === 0 ? '收藏' : postData?.collectCount }}
                </div>
                <div class="tool-item comment-bar-btn" @click="toggleCommentBar()">
                    <svg t="1766848961248" class="icon" viewBox="0 0 1058 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7092" width="18" height="18">
                            <path d="M330.744242 885.372121l194.779798-129.861818 16.665859-11.106263h383.844848c36.486465 0 66.19798-29.659798 66.19798-66.146262v-529.19596c0-36.434747-29.711515-66.107475-66.19798-66.107475H132.305455c-36.486465 0-66.146263 29.659798-66.146263 66.107475v529.19596c0 36.486465 29.659798 66.146263 66.146263 66.146262h198.438787v140.968081m-66.146262 123.578182V810.550303H132.305455c-73.024646 0-132.305455-59.216162-132.305455-132.292525v-529.19596C0 76.024242 59.267879 16.808081 132.305455 16.808081h793.742222c73.076364 0 132.357172 59.216162 132.357171 132.240808v529.195959c0 73.076364-59.267879 132.292525-132.357171 132.292526h-363.830303L264.59798 1008.950303z m0 0" p-id="7093" fill="currentColor">
                            </path>
                    </svg>
                    {{ postData?.commentCount === 0 ? '评论' : postData?.commentCount }}
                </div>
                <div class="tool-item">
                    <svg t="1766849502278" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9632" width="20" height="20">
                        <path d="M883.037 512.652h23.273c-18.781 0-23.273 4.352-23.273 23.272v325.819c-1.792 5.445 1.466 21.9 0 23.272H138.31c-6.144-5.027 0.163-0.721 0 0V163.561c0-6.307 3.351-24.553 9.588-24.553l362.775 1.28c18.782 0 24.134-21.923 23.273-23.273-1.303-2.024-0.116-31.022-23.273-23.272H171.171c-43.776 0-79.407 35.886-79.407 79.965v677.864c0 44.102 35.63 79.965 79.407 79.965h676.887c43.776 0 81.525-25.716 81.525-69.818V535.901c8.005-29.068-27.742-23.25-46.546-23.25zM650.31 140.288h209.454C736.861 267.753 570.112 419.095 447.232 546.56c-30.348 31.488 9.775 67.444 40.169 35.91 122.344-126.883 273.291-268.754 395.636-395.637v209.455c2.91 31.535 49.687 30.557 46.546 0v-266.17c0-10.566 5.957-7.634 0-13.103 3.072-6.586-13.406-22.62-23.273-23.272-3.282-0.21-19.945-0.49-23.273 0H650.31c-30.115-0.14-32.093 46.429 0 46.545z" fill="currentColor" p-id="9633">    
                        </path>
                    </svg>
                    分享
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
        </el-affix>
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
          :content-id="postId"
          :author-id="authorId"
          :type="0"
        />
      </Transition>
      <!-- 收藏弹窗 -->
      <Transition name="fade">
        <div
          v-if="showCollectBar"
          class="collect-mask"
          @click="showCollectBar = false"
        />
      </Transition>
      <div v-if="showCollectBar" class="collect-bar-wrapper">
        <CollectBar
            :content-id="postId"
            :type="0"
            @close="showCollectBar = false"
            @success="handleCollectSuccess"
        />
      </div>
    </Teleport>
    <!-- 举报弹窗 -->
    <ContentReport
      ref="reportRef"
      :target-id="postId"
      :target-type="0"
      :title="postData?.title || ''"
    />
</template>
<script setup lang="ts" name="PostView">
import { ref, onMounted } from 'vue';
import { getPostViewPage } from '@/api/index/viewPage';
import type { PostView } from '@/types/index'
import { getUserInfo, changeLikeStatus, changeCollectStatus } from '@/api/userInfo/homePage';
import type { UserInfo } from '@/types/index'
import { ElMessage } from 'element-plus';
import CommentBar from '@/components/viewPage/comment/CommentBar.vue';
import HtmlRenderer from '@/components/public/HtmlRenderer.vue';
import MarkdownRenderer from '@/components/public/MarkdownRenderer.vue';
import CollectBar from '@/components/public/CollectBar.vue';
import ContentReport from '@/components/public/ContentReport.vue';
import { useUserInfoStore } from '@/stores/userInfo';

const props = defineProps<{
    postId: number;
    authorId: number;
}>()

const emit = defineEmits(['postName', 'postType', 'permission', 'addViewCount']);

let postData = ref<PostView | null>(null);

let authorInfo = ref<UserInfo | null>(null);

const userInfoStore = useUserInfoStore()

// 评论栏
const showCommentBar = ref(false);

// 收藏栏
const showCollectBar = ref(false);

// 举报弹窗
const reportRef = ref();

/**
 * 处理点赞点击
 * @param postId 
 */
const handleLikeClick = (postId: number) => {
  if (!postData.value) { ElMessage.error('文章不存在'); return};
  console.log(postData.value);
  console.log(postData.value.liked)

  // 发送点赞请求
  changeLikeStatus({
    userId: userInfoStore.userId,
    targetId: postId,
    status: postData.value?.liked ? 1 : 0,
    type: 0
  }).then((res: any) => {
    if (res.code === 200 && postData.value) {
      // 点赞成功，更新点赞数
      postData.value.likeCount = postData.value?.liked ? postData.value.likeCount - 1 : postData.value.likeCount + 1;
      // 更新点赞状态
      postData.value.liked = postData.value?.liked ? 0 : 1;
    }
  });
}

/**
 * 处理收藏点击
 * @param postId 
 */
const handleCollectClick = (postId: number) => {
  if (!postData.value) { ElMessage.error('文章不存在'); return};
  console.log(postData.value);
  console.log(postData.value.collected)
  showCollectBar.value = true;
}

/**
 * 收藏成功回调
 */
const handleCollectSuccess = (type: number, lastActiveFavNum: number) => {
    if (postData.value) {
        postData.value.collectCount += type === 1 ? -1 : 1;
        postData.value.collected = lastActiveFavNum > 0 ? 1 : 0; // 当前用户剩余收藏该文章的收藏夹数量
    }
}

/**
 * 切换评论栏显示状态
 */
const toggleCommentBar = () => {
  showCommentBar.value = !showCommentBar.value;
}

/**
 * 处理举报点击
 */
const handleReport = () => {
  reportRef.value?.open();
}

/**
 * 跳转目标专栏
 */
const JumpToTargetCategory = () => {
  window.open('/otherCategoryDetail/'+ props.authorId + '/' + postData.value?.categoryId, '_blank');
}
/**
 * 获取文章预览页数据
 */
onMounted(async () => {
    const res = await getPostViewPage({
        postId: props.postId,
        userId: userInfoStore.userId || undefined
    });
    postData.value = res.data;

    // 获取作者信息
    const authorRes = await getUserInfo(props.authorId);
    authorInfo.value = authorRes.data;

    // 获取当前用户信息（仅登录时）
    let currentUserVip = 0;
    if (userInfoStore.isLoggedIn && userInfoStore.userId !== 0) {
        try {
            const userRes = await getUserInfo(userInfoStore.userId);
            currentUserVip = userRes.data.isVip;
            console.log('当前用户信息:', userRes.data);
        } catch (err) {
            console.error('获取当前用户信息失败:', err);
        }
    }

    // 发送文章标题给父组件
    console.log('发送文章标题给父组件:', postData.value?.title);
    emit('postName', postData.value?.title);
    console.log('发送文章类型给父组件:', postData.value?.postType);
    emit('postType', postData.value?.postType);
    // 发送权限给父组件
    emit(
      'permission', 
      {
        isVip: postData.value?.isVip,
        type: postData.value?.type,
        currentUserVip: currentUserVip,
        status: postData.value?.status
      }
    );

    // 延时5秒增加文章浏览量
    setTimeout(() => {
      emit('addViewCount', {
        postId: props.postId,
        userId: userInfoStore.userId || undefined,
        contentType: 0
      })
    }, 5000);
})
</script>
<style scoped>
.post-view {
    background-color: #fff;
    padding: 16px 20px 0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    /* height: 1000px; */
}

.post-title {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
}

.post-info {
    display: flex;
    gap: 4px;
    font-size: 13px;
    color: #7e7d7dd8;
    margin-bottom: 18px;
}

.post-tag {
    display: flex;
    gap: 4px;
    font-size: 15px;
    color: #7e7d7d;
}

.tag-item {
    border-radius: 4px;
    padding:0 4px;
    color: #006fff;
    cursor: pointer;
    margin-bottom: 15px;

    &:hover {
        background-color: #8bbaf750;
        /* color: #fff; */
    }
}

.post-category {
    padding: 8px 8px;
    display: flex;
    align-items: center;
    border-radius: 4px;
    border: 1px solid #eeeeeebd;
    transition: box-shadow 0.2s ease;
    /* 首尾展示 */
    justify-content: space-between;
    cursor: pointer;

    &:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
}

.category-cover {
  width: 40px;
  height: 40px;
  /* border-radius: 50%; */
  overflow: hidden;
  flex-shrink: 0;
}

.category-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.category-right {
    font-size: 14px;
    font-weight: bold;
    color: #333333cc;
}

.footer-info {
    background-color: #fdfdfd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 20px;
    height: 60px;
    border-top: 1px solid #eee;
}

.author-area {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-bar {
  display: flex;
  gap: 24px;
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
  padding: 6px 12px;
  cursor: pointer;
  color: #515151;
  font-size: 13px;
}

.popup-item:hover {
  background: #f5f5f5;
  color: #ff7f6e;
}

/* 渲染器 */
.render-area {
  margin-top: 20px;
  border-top: 1px solid #eee;
  /* border: 1px solid #eee; */
  /* border-radius: 6px; */
  padding: 0 5px;
  background: #fff;
  overflow: hidden;
}


.post-content {
  max-width: 820px;          /* 阅读最舒服的宽度 */
  margin: 0 auto;            /* 居中 */

  font-size: 16px;
  line-height: 1.9;
  color: #2c2c2c;
}

.post-content h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 1.5em 0 0.8em;
  color: #222;
}

.post-content h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 1.4em 0 0.7em;
  color: #333;
}

.post-content h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 1.3em 0 0.6em;
  color: #444;
}

.post-content p {
  line-height: 1.8;
  font-size: 16px;
  margin: 1.2em 0;
}

.post-content a {
  color: #409eff;
  text-decoration: none;
}

.post-content a:hover {
  text-decoration: underline;
}

/* .post-content img {
  display: block;
  margin: 20px auto;
  border-radius: 6px;
} */

.post-content pre {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
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

/**
 * 收藏栏居中
 */
.collect-bar-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.collect-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999998;
}
</style>