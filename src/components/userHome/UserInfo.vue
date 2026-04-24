<template>
  <div class="user-card">
    <!-- 头像区域 -->
    <div class="avatar-area">
      <div class="avatar-placeholder">
        <img :src="user_avatar" class="user-avatar-image"></img>
      </div>
      <div class="blog-age">博龄 {{ blogAge }} 年</div>
    </div>

    <!-- 信息区域 -->
    <div class="info-area">
      <div class="name-line">
        <h1 class="username">{{ userName }}</h1>
        <img :src="`../../../public/assests/icon/level${level}.png`" class="level-icon"/>
      </div>
      <div class="stats">
        <span class="stat-item">
          <span class="stat-number">{{ visitCount }}</span>
          <span class="stat-text">总访问量</span>
        </span>
        <span class="stat-item">
          <span class="stat-number">{{ originalCount }}</span>
          <span class="stat-text">原创</span>
        </span>
        <span class="stat-item" @click="$router.push(`/focusAndFansList/fans/${userId}`)">
          <span class="stat-number">{{ fansCount }}</span>
          <span class="stat-text">粉丝</span>
        </span>
        <span class="stat-item" @click="$router.push(`/focusAndFansList/focus/${userId}`)">
          <span class="stat-number">{{ focusCount }}</span>
          <span class="stat-text">关注</span>
        </span>
      </div>
      <div class="meta-info">
        <span>IP属地: {{backendRegionToCascader(region)}}</span>
        <span>加入CloudBlog时间:</span>
        <span style=" font-size: 1.1em; margin-left: -8px; margin-top: -0px;">{{ joinTime }}</span>
      </div>
      <p class="intro">个人简介：{{ introduction }}</p>
    </div>

    <!-- 编辑按钮 -->
    <button @click="$router.push('/personal/editProfile')" class="edit-btn">编辑资料</button>
  </div>
</template>

<script setup lang="ts" name="UserInfo">
import { ref } from 'vue';
import { onMounted } from 'vue';
import { getUserInfo } from '@/api/userInfo/homePage';
import { eventBus } from '@/utils/eventBus';
import { useUserHomeStore } from '@/stores/userHome';
import { useUserInfoStore } from '@/stores/userInfo';
import { getChatList } from '@/api/ai';
import { getResourceList } from '@/api/create/resource';

let visitCount = ref();
let originalCount = ref(0);
let fansCount = ref(0);
let focusCount = ref(0);
let user_avatar = ref('');
let joinTime = ref('');
let userName = ref('');
let region = ref('');
let introduction = ref('这个人很懒，什么都没有留下。');
let blogAge = ref(0);
let level = ref(1);
let userId = localStorage.getItem('userId');

/**
 * 将后端地区字符串转换为前端地区选择器数组
 * @param region 后端地区字符串（例如："中国/北京"）
 * @returns 前端地区选择器数组（例如：["中国", "北京"]）
 */
const backendRegionToCascader = (region?: string) => {
  if (!region) return '未知地区'
  return region.split('/').filter(Boolean)[0]
}

onMounted(async()=>{
  await getChatList(Number(localStorage.getItem('userId'))).then((response)=>{
    console.log('发送了请求', response);
    // 这里暂时实现，加上被权限控制的方法，检测登录
  })
    await getUserInfo(Number(localStorage.getItem('userId'))).then((response)=>{
        console.log('发送了请求', response);
        visitCount.value = response.data.visits;
        originalCount.value = response.data.postCount;
        fansCount.value = response.data.fanCount;
        focusCount.value = response.data.focusCount;
        user_avatar.value = '/api' + response.data.image;
        joinTime.value = new Date(response.data.joinTime).toLocaleDateString();
        userName.value = response.data.userName;
        region.value = response.data.region;
        introduction.value = formatText(response.data.introduction);
        blogAge.value = response.data.blogAge;
        level.value = response.data.level;
    });
    await getResourceList({userId:Number(localStorage.getItem('userId'))}).then((response)=>{
        console.log('发送了请求', response);
        useUserHomeStore().resourceCount = response.data.length;
    })

    useUserHomeStore().postCount = originalCount.value;
    console.log('设置了用户名', userName.value);
    useUserInfoStore().setUserInfo({ userName: userName.value });
})


/**
 * 格式化文本简介，超过60字符添加省略号
 * @param text 
 */
function formatText(text:string) {
    if (!text || text.trim() === '' || text == null) return '这个人很懒，什么都没有留下。';
    // 如果超过60个字符，截断并添加省略号
    if (text.length > 60) {
        return text.slice(0, 60) + '...';
    }
    return text;
}

/**
 * 格式化访问量数字（1万以上显示为X.W格式）
 * @param count 原始访问量数字
 * @returns 格式化后的字符串
 */
const formatVisitCount = (count: number): string => {
  // 小于1万直接返回原数字
  if (count < 10000) {
    return count.toString();
  }
  
  // 1万及以上，计算并保留合适的小数位数
  const value = count / 10000;
  
  // 若为整数（如20000 → 2W），不保留小数
  if (value % 1 === 0) {
    return `${value.toFixed(0)} W`;
  }
  
  // 非整数（如22000 → 2.2W，23456 → 2.3W）保留一位小数
  return `${value.toFixed(1)} W`;
};

</script>

<style scoped>
.user-card {
  display: flex;
  align-items: flex-start;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px; /* 缩减内边距 */
  gap: 12px; /* 缩减元素间距 */
  background-color: #ffffff;
}

.avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-placeholder {
  width: 80px; /* 缩小头像尺寸 */
  height: 80px; 
  border-radius: 50%;
  border: 4px solid #ffffff;
  margin-bottom: 6px; /* 缩减头像与文字间距 */
  overflow: hidden; /* 确保图片不会超出圆形边界 */
  display: flex; /* 使用flex布局确保图片居中 */
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5; /* 当图片未加载时显示的背景色 */
  transform: translateY(-22px);
}

/* 为头像图片添加样式 */
.user-avatar-image {
  width: 100%; /* 图片宽度充满容器 */
  height: 100%; /* 图片高度充满容器 */
  object-fit: cover; /* 保持图片比例并填充整个容器 */
  border-radius: 50%; /* 确保图片也是圆形的 */
}

.name-line {
  display: flex;
  align-items: center;
}

.level-icon {
  width: 25px;
  height: 25px;
  margin-left: 6px;
  margin-bottom: 4px;
  cursor: pointer;
}

.blog-age {
  background-color: #f3f4f6;
  padding: 2px 6px; /* 缩减内边距 */
  border-radius: 3px;
  font-size: 12px; /* 缩小字体 */
  transform: translateY(-20px);
}

.info-area {
  flex: 1;
}

.username {
  font-size: 24px; /* 缩小用户名字体 */
  margin: 0 0 8px 0; /* 缩减间距 */
  /* 粗细 */
  font-weight: 550;
}

.stats {
  display: flex;
  gap: 8px; /* 缩减统计项间距 */
  margin-bottom: 8px; /* 缩减间距 */
  font-size: 13px; /* 缩小字体 */
}

.stat-item {
  font-weight: 500;
  padding: 0 12px;
  position: relative;
  margin-left: -10px;
  cursor: pointer;
  transition: color 0.2s ease; /* 添加过渡效果，使颜色变化更平滑 */
}

.stat-item:not(:first-child) {
  border-left: 1px solid #e0dfdf;
}

.stat-item:hover {
  color: rgb(233, 55, 24);
}

/* 添加这段代码，确保鼠标悬浮时内部元素也改变颜色 */
.stat-item:hover .stat-number,
.stat-item:hover .stat-text {
  color: rgb(233, 55, 24);
}

/* 数字样式 */
.stat-number {
  font-size: 20px; /* 更大的字体 */
  font-weight: 600; /* 更粗的字重 */
  color: #111827; /* 更深的颜色 */
  line-height: 1.2;
  transition: color 0.1s ease; /* 添加过渡效果 */
}

/* 文本样式 */
.stat-text {
  /* font-size: 12px; 较小的字体 */
  color: #6b7280; /* 较浅的颜色 */
  margin-top: 2px;
  margin-left: 5px;
  margin-right: 5px;
  transition: color 0.1s ease; /* 添加过渡效果 */
}

.meta-info {
  display: flex;
  gap: 16px; /* 缩减元信息间距 */
  margin-bottom: 6px; /* 缩减间距 */
  font-size: 12px; /* 缩小字体 */
  color: #6b7280;
}

.intro {
  font-size: 13px; /* 调整简介字体 */
  color: #4b5563;
  line-height: 1.4; /* 缩减行高 */
  margin: 0;
}

.edit-btn {
  margin-left: auto;
  padding: 4px 10px; /* 缩减按钮内边距 */
  border: 1px solid #d1d5db;
  border-radius: 16px;
  background-color: #fff;
  cursor: pointer;
  font-size: 13px; /* 缩小按钮字体 */
}

.edit-btn:hover {
  background-color: #f9fafb;
}
</style>