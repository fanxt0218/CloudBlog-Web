<template>
    <div class="user-home-container" :style="pageStyle">
        <div class="card">
            <div class="user">
                <UserInfo />
            </div>
            <!-- 创建一个flex容器，包含左侧和右侧内容 -->
            <div class="main-layout">
                <!-- 左侧区域 -->
                <div class="left-section">
                    <div class="achievement">
                        <UserAchievement/>
                    </div>
                    <div class="category">
                        <UserCategory/>
                    </div>
                    <div class="tag">
                        <UserTag/>
                    </div>
                </div>
                <!-- 右侧区域 -->
                <div class="right-section">
                    <div class="content">
                        <UserContent ></UserContent>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts" name="UserHome">
import Head from '@/components/Head.vue';
import UserInfo from '@/components/userHome/UserInfo.vue';
import UserAchievement from '@/components/userHome/UserAchievement.vue';
import UserTag from '@/components/userHome/UserTag.vue';
import UserContent from '@/components/userHome/UserContent.vue';
import UserCategory from '@/components/userHome/UserCategory.vue';
import { useUserInfoStore } from '@/stores/userInfo';
import { getWebsiteComponents } from '@/api/index/website';
import type { WebsiteComponentDefine } from '@/types/index'

import { ref, onMounted, watchEffect, watch, computed } from 'vue';
import { use } from 'echarts';

let currentUserName = ref('CloudBlog 用户');

// 左侧区域、右侧区域、头部组件的DOM引用
const leftSectionRef = ref<HTMLElement | null>(null);
const rightSectionRef = ref<HTMLElement | null>(null);
const headRef = ref<HTMLElement | null>(null);

let profileBgInfo = ref<WebsiteComponentDefine[] | []>([])

let bgUrl = ref('')

// 动态计算右侧高度：与左侧等高，且距离底部10px
const updateRightHeight = () => {
  if (!leftSectionRef.value || !rightSectionRef.value) return;

  // 左侧区域实际高度（由内容撑开）
  const leftHeight = leftSectionRef.value.offsetHeight;
  // 页面视口高度
  const viewportHeight = window.innerHeight;
  // 头部组件高度（用于计算顶部占用空间）
  const headHeight = headRef.value?.offsetHeight || 0;
  // 卡片顶部margin（2rem，假设1rem=16px）
  const cardTopMargin = 2 * 16;
  // 最大允许高度：视口高度 - 头部高度 - 顶部margin - 底部10px
  const maxHeight = viewportHeight - headHeight - cardTopMargin - 10;

  // 右侧高度 = 左侧高度与最大高度的较小值（确保不超出底部10px）
  const rightHeight = Math.min(leftHeight, maxHeight);
  rightSectionRef.value.style.height = `${rightHeight}px`;
};

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

/**
 * 获取用户背景图片
 */
const getProfileBgInfo = async () => {
  const res : any = await getWebsiteComponents({
    category: 'USER',
    contentType: 'profile_bg'
  })
  if (res.code === 200) {
    profileBgInfo.value = res.data
    bgUrl.value = `/api${res.data[0]?.contentValue}`
  }
}

// 初始化时计算高度，监听窗口resize和左侧内容变化
onMounted(() => {
  getProfileBgInfo()
  updateRightHeight();
  window.addEventListener('resize', updateRightHeight);
});

// 监听左侧内容变化（如数据加载导致高度变化）
watchEffect(() => {
  // 延迟执行，确保DOM更新完成
  setTimeout(updateRightHeight, 0);
});
</script>
<style scoped>
.user-home-container {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 根容器：使用相对宽度+最小宽度，避免过窄 */
.card {
  width: 60%;
  max-width: 1200px;
  min-width: 320px;
  margin: 0 auto;
  padding: 2rem 1rem;
  /* 确保卡片不限制内部高度 */
  box-sizing: border-box;
}

.user {
  width: 100%;
  margin: 0 auto;
}

/* Flex容器：左右区域高度联动核心 */
.main-layout {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.55rem;
  flex-wrap: wrap;
  /* 容器高度由内容和视口共同决定 */
  min-height: 0;
}

.left-section {
  flex: 0.8;
  min-width: 240px;
}

.right-section {
  flex: 2.5;
  min-width: 300px;
  /* 右侧高度由JS动态设置，与左侧对齐 */
  box-sizing: border-box;
}

/* 右侧内容区：填充父容器高度，超出时滚动 */
.content {
  width: 100%;
  height: 100%;
  padding: 0; /* 移除冗余内边距，避免高度计算偏差 */
}

.achievement, .tag, .category {
  margin-bottom: 0.7rem;
  width: 100%;
}
</style>