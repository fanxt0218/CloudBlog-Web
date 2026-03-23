<template>
    <div class="view-page" :style="pageStyle">
        <div class="page-container">
            <!-- 左侧作者信息 -->
            <div class="left-column">
                <LeftAuthorInfo :authorId="authorId" />
                <HotPostBar :postType="postType" />
            </div>
            
            <!-- 中间文章内容 -->
            <div class="middle-column">
              <div class="post-wrapper" :class="{blocked: displayType !== null}">
                <div
                  class="post-content"
                  :class="{ blurred: displayType !== null }"
                >
                  <PostView
                    :postId="postId"
                    :authorId="authorId"
                    @postName="setPostName"
                    @postType="setPostType"
                    @permission="usePostPermission"
                    @addViewCount="addBrowseCount"
                  />
                </div>
              
                <!-- 固定在视口的拦截层 -->
                <PostPermissionOverlay
                  v-if="displayType !== null"
                  :type="displayType"
                />
              </div>

              <!-- 相关搜索 -->
              <RelatedSearch :keyword="postName" :postId="postId" />
            </div>
            
            <!-- 右侧边栏 -->
            <div class="right-column">
                <!-- 可以在这里添加右侧边栏内容 -->
                <!-- <LeftAuthorInfo :authorId="authorId" /> -->
                <!-- 目录 -->
                <Panel content-selector="#post-content"/>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts" name="ViewPage">
import LeftAuthorInfo from '@/components/viewPage/post/leftAuthorInfo.vue';
import HotPostBar from '@/components/viewPage/post/HotPostBar.vue';
import PostView from '@/components/viewPage/post/PostView.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import PostPermissionOverlay from '@/components/viewPage/post/overlay/PostPermissionOverlay.vue';
import { addPostViewCount } from '@/api/index/viewPage';
import Panel from '@/components/viewPage/post/Panel.vue';
import RelatedSearch from '@/components/viewPage/post/RelatedSearch.vue';
import { getWebsiteComponentInfo } from '@/utils/websiteComponent';
import type { WebsiteComponentDefine } from '@/types';

const route = useRoute();
const authorId = ref(Number(route.params.authorId));
const postId = ref(Number(route.params.postId));

// 登录用户id
const userId = ref(Number(localStorage.getItem('userId')));

// 文章标题
const postName = ref('');
// 文章类型
const postType = ref(0);

// 拦截显示类型
const displayType = ref<number | null>(null);

const bgUrl = ref('');

const DEFAULT_BG = '';

const pageStyle = computed(() => {
  if (!bgUrl.value) return {}; // 如果没有图片，就不加背景
  return {
    backgroundImage: `url(${bgUrl.value})`,
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

// 设置文章标题
const setPostName = (name: string) => {
    postName.value = name;
}

// 设置文章类型
const setPostType = (type: number) => {
    console.log('文章类型已更新并发送为:', type);
    postType.value = type;
}

watch(postName, (newName) => {
    console.log('文章标题已更新为:', newName);
    setPostName(newName);
    document.title = newName + ' - CloudBlog';
});

const usePostPermission = (permission: {isVip: number, type: number, currentUserVip: number, status: number}) => {
  console.log('检查文章权限:', permission);
  // 判断是否有访问权限
  const viewPer = viewPostPermission(permission);
  console.log('文章可见权限校验结果:', viewPer);
  if (!viewPer) {
    displayType.value = 0;
    ElMessage({
      message: '您没有权限查看该文章',
      type: 'warning',
    });
  } else {
    if (authorId.value === userId.value) {
      return;
    }
    // 判断vip权限
    if (permission.isVip === 0) {
      return;
    } else {
      if (permission.currentUserVip === 0) {
        displayType.value = 1;
      }
    }
  }
}

const viewPostPermission = (permission: {isVip: number, type: number, currentUserVip: number, status: number}): boolean => {
  if (permission.status !== 2) {
    if (permission.status === 0 && authorId.value !== userId.value) {
      console.log('文章权限校验失败,不是作者或不是公开状态，当前用户id', userId.value, '文章作者id', authorId.value);
      return false;
    }
  }
  // 检查访问权限
  if (permission.type === 0) {
    return true;
  } else {
    // 仅自己可见
    if (permission.type === 1) {
      console.log('检查仅自己可见权限');
      if (!userId) {
        return false;
      }
      // 判断是否为作者
      if (authorId.value !== userId.value) {
        return false;
      }
      return true;
    }
    // 仅粉丝可见
    if (permission.type === 2) {
      if (!userId) {
        return false;
      }
      // TODO 判断是否为作者粉丝
      return true;
    }
  }
  return false;
}

// 增加文章浏览量
const addBrowseCount = (data: {postId: number, userId: number, contentType: number}) => {
  console.log('增加文章浏览量参数:', data, displayType.value);
  if (displayType.value !== null) {
    console.log('增加文章浏览量失败, 文章类型不是公开状态');
    return;
  }
  if (!userId.value || userId.value == 0) {
    console.log('增加文章浏览量失败, 用户未登录');
    return;
  }
  addPostViewCount(data).then(res => {
    if (res.code === 200) {
      console.log('增加文章浏览量成功');
    } else {
      console.log('增加文章浏览量失败');
    }
  })
}

onMounted(async () => {
  // console.log('设置文章标题为:', postName.value);
  // setPostName(postName.value);
  try {
    const res = await getWebsiteComponentInfo('VIEW', 'viewpage_bg');
    if (res && res.length > 0) {
      const url = res[0].contentValue;
      bgUrl.value = url.startsWith('http') ? url : `/api${url}`;
    } else {
      bgUrl.value = DEFAULT_BG;
    }
  } catch (e) {
    console.error('Failed to load login background', e);
    bgUrl.value = DEFAULT_BG; // 出错无背景图
  }
});

</script>
<style scoped>
.view-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f6f7;
  display: flex;
  justify-content: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.page-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;

  /* 页面主体最大宽度 */
  width: 100%;
  max-width: 1470px;

  padding: 24px 16px;
  box-sizing: border-box;
}

/* ===== 左栏 ===== */
.left-column {
  /* width: 260px; */
  top: 80px;
  position: sticky;
  flex-shrink: 0;
  display: grid;
  gap: 10px;
}

/* ===== 中栏（核心内容） ===== */
.middle-column {
  margin: 0 auto;
  width: 950px;
  /* flex-shrink: 0; */
}

/* ===== 右栏 ===== */
.right-column {
  top: 80px;
  /* width: 260px; */
  position: sticky;
  flex-shrink: 0;
  display: grid;
  gap: 10px;
}

.post-wrapper {
  position: relative;
}

.permission-overlay {
  position: fixed;
  top: 50%;
  left: 50%;

  /* 关键：宽度等于中栏 */
  width: 850px;
  max-width: calc(100vw - 32px);

  transform: translate(-50%, -50%);
  z-index: 1000;

  pointer-events: none;
}

/* .blurred {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
} */

.post-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;

  backdrop-filter: blur(6px);
  background: rgba(20,20,20,0.35);

  pointer-events: none;
  z-index: 5;
}

.post-wrapper::after {
  opacity: 0;
}

.post-wrapper.blocked::after {
  opacity: 1;
}


</style>