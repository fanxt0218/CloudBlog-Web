<template> 
  <div class="recommend-user">
    <div class="header" :style="{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }">
        <div class="top-three">
            <div 
              class="user second"
              v-if="topThree[1]"
              @click="handleJumpToUserProfile(topThree[1].userId)"
            >
              <div class="crown silver"></div>
              <img :src="`/api${topThree[1].avatar}`" class="avatar" />
              <div class="top-name">{{ formatUserName(topThree[1].userName) }}</div>
              <div class="value top2" v-if="topThree[1].value">{{ topThree[1].value }}</div>
              <div class="base"></div>
            </div>
        
            <div 
              class="user first"
              v-if="topThree[0]"
              @click="handleJumpToUserProfile(topThree[0].userId)"
            >
              <div class="crown gold"></div>
              <img :src="`/api${topThree[0].avatar}`" class="avatar" />
              <div class="top-name">{{ formatUserName(topThree[0].userName) }}</div>
              <div class="value top1" v-if="topThree[0].value">{{ topThree[0].value }}</div>
              <div class="base"></div>
            </div>
        
            <div 
              class="user third"
              v-if="topThree[2]"
              @click="handleJumpToUserProfile(topThree[2].userId)"
            >
              <div class="crown bronze"></div>
              <img :src="`/api${topThree[2].avatar}`" class="avatar" />
              <div class="top-name">{{ formatUserName(topThree[2].userName) }}</div>
              <div class="value top3" v-if="topThree[2].value">{{ topThree[2].value }}</div>
              <div class="base"></div>
            </div>
        </div>
    </div>

    <!-- 排序标签 -->
      <div class="tag-bar">
          <div 
            class="tag-item" 
            :class="{ active: type === 0 }"
            @click="changeType(0)">
            综合排名
          </div>
          <div 
            class="tag-item" 
            :class="{ active: type === 1 }"
            @click="changeType(1)">
            文章数
          </div>
          <div 
            class="tag-item" 
            :class="{ active: type === 2 }"
            @click="changeType(2)">
            经验值
          </div>
          <div 
            class="tag-item" 
            :class="{ active: type === 3 }"
            @click="changeType(3)">
            粉丝数
          </div>
      </div>

      <!-- 列表滚动容器 -->
      <div class="user-list" ref="scrollContainer">
          <div 
            class="user-item" 
            v-for="user in recommendUsers" 
            :key="user.userId"
            @click="handleJumpToUserProfile(user.userId)"
          >
              <div class="avatar-box">
                  <img class="avatar" :src="`/api${user.avatar}`" alt="avatar" />
              </div>

              <img 
                :src="`../../../public/assests/icon/level${user.level}.png`" 
                class="level-icon"
              />

              <div class="info">
                  <div class="name">{{ user.userName }}</div>
              </div>

              <div v-if="type === 1">
                <div  class="value-item">文章数&nbsp;{{ user.postCount }}</div>
              </div>
               <div v-if="type === 2">
                <div  class="value-item">经验值&nbsp;{{ user.exp }}</div>
              </div>
               <div v-if="type === 3">
                <div  class="value-item">粉丝数&nbsp;{{ user.fanCount }}</div>
              </div>

          </div>

          <div class="loading" v-if="isLoading">加载中...</div>
          <div class="finished" v-if="!isLoading && isFinished">已经到底啦~</div>
      </div>
  </div>
</template>
<script setup lang="ts" name="RecommendUser">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecommendUsers } from '@/api/index/indexPage'
import type { RecommendUsers } from '@/types/index'

let type = ref(0)
let recommendUsers = ref<RecommendUsers>([])

const scrollContainer = ref<HTMLDivElement | null>(null);
const currentCursor = ref<string | null>(null);
const pageSize = ref(10);
const userCount = ref(0);
const isLoading = ref(false);
const isFinished = ref(false);

const topThree = ref<any[]>([]);

let bgUrl = ref("/api/profile/system/recommend-user-bg/background.jpg");

const changeType = (value: number) => {
  if (type.value === value) return;
  type.value = value;

  // 重置分页
  recommendUsers.value = [];
  currentCursor.value = null;
  isFinished.value = false;

  loadUserList();
};

const loadUserList = async () => {
  if (isLoading.value || isFinished.value) return;

  isLoading.value = true;
  try {
    const response = await getRecommendUsers({
      cursor: currentCursor.value,
      size: pageSize.value,
      type: type.value
    });

    const result = response.data;

    if (result.content && result.content.length > 0) {
        // 如果是第一次加载，则提取前三名
        if (recommendUsers.value.length === 0) {
            topThree.value = result.content.slice(0, 3).map((u: any) => ({
            ...u,
            value: getUserSortValue(u), // 根据不同 type 展示不同数值
            }));
        }
      recommendUsers.value.push(...result.content);

      if (result.hasNext && result.nextCursor) {
        currentCursor.value = result.nextCursor;
      } else {
        isFinished.value = true;
      }
    } else {
      isFinished.value = true;
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * 处理跳转用户主页
 * @param userId 
 */
const handleJumpToUserProfile = (userId: number) => {
    router.push(`/otherUserHome/${userId}`)
}

const handleScroll = () => {
  if (!scrollContainer.value) return;

  const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;

  if (scrollHeight - scrollTop - clientHeight < 150) {
    loadUserList();
  }
};

// 根据排序类型展示不同的数据
const getUserSortValue = (u: any) => {
  switch (type.value) {
    case 1:
      return '文章数: ' + u.postCount;
    case 2:
      return 'EXP: ' + u.exp;
    case 3:
      return '粉丝数: ' + u.fanCount;
    default:
      return null;
  }
};

/**
 * 格式化用户昵称
 * @param userName 
 * @returns 
 */
const formatUserName = (userName: string) => {
  if (!userName) return '';
  if (userName.length <= 11) return userName;
  return userName.slice(0, 11) + '...';
}



onMounted(() => {
  loadUserList();
  scrollContainer.value?.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll);
});

const router = useRouter();
</script>
<style scoped>
.recommend-user {
  width: 60%;
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}

/* Header */
.header {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  min-height: 200px;
}

/* 总容器：上 1，下 2 的布局 */
.top-three {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 40px;
  position: relative;
  margin-top: 1.5rem;
}

/* 每个用户块 */
.top-three .user {
  text-align: center;
  position: relative;
  cursor: pointer;
}

.top-three .user .avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: white;
}

/* 中间第一名更大一些 */
.top-three .user.first .avatar {
  width: 90px;
  height: 90px;
}

.top-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.value {
  margin-top: 5px;
  color: #333;
  padding: 2px 5px;
  border-radius: 6px;
}

.top-name {
    font-size: 13px;
    font-weight: 500;
    /* color: #1169db; */
    border-radius: 10px;
    background: #a0a0a049;
}

.top1 {
    color: #fc3535;
    font-size: 13px;
    /* border: 0.5px solid #e5e7eb; */
    background: #ffe570;
}

.top2 {
    color: #333;
    font-size: 13px;
    /* border: 0.5px solid #e5e7eb; */
    background: #f5f5f5;
}

.top3 {
    color: #333;
    font-size: 13px;
    /* border: 0.5px solid #e5e7eb; */
    background: #fa8b4a;
}

/* ===== 王冠图标 ===== */
.crown {
  width: 26px;
  height: 26px;
  background-size: cover;
  background-repeat: no-repeat;
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

/* 替换为你的图标路径 */
.crown.gold {
  background-image: url('/public/assets/crown/gold.png');
}

.crown.silver {
  background-image: url('/public/assets/crown/silver.png');
}

.crown.bronze {
  background-image: url('/public/assets/crown/bronze.png');
}

/* 第二名 & 第三名稍微下移 */
.user.second {
  transform: translateY(10px);
}

.user.third {
  transform: translateY(10px);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

/* Tab 标签 */
.tag-bar {
  display: flex;
  gap: 10px;
  padding: 10px 15px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.tag-item {
  padding: 6px 14px;
  margin: 0 auto;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  background: #eaeaea;
}

.tag-item.active {
  background: #3a3a3a;
  color: #fff;
}

/* 绑定滚动条容器 */
.user-list {
  height: 550px;
  overflow-y: auto;
  padding: 10px 15px;

  /* 让滚动条淡入淡出 */
  scrollbar-gutter: stable; /* 避免闪动布局 */
}

/* ===== Chrome / Edge / Safari ===== */
.user-list::-webkit-scrollbar {
  width: 6px;
  transition: opacity 0.3s;
}

/* 默认隐藏滚动条 */
.user-list::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
}

/* 鼠标滚动时显示滚动条 */
.user-list:hover::-webkit-scrollbar-thumb,
.user-list:active::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
}

/* 滚动条轨道隐藏 */
.user-list::-webkit-scrollbar-track {
  background: transparent;
}

/* ===== Firefox ===== */
.user-list {
  scrollbar-width: thin;      /* 细 */
  scrollbar-color: transparent transparent; 
}

.user-list:hover {
  scrollbar-color: rgba(0,0,0,0.25) transparent;
}


/* 单个用户 */
.user-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f5f5f5;
}

/* 头像 */
.avatar-box {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* 等级图标 */
.level-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

/* 用户名 */
.name {
  font-size: 14px;
  font-weight: 500;
  color: #222;
}

.value-item {
  /* margin-right: 10px; */
  border: 0.5px solid #f5f4f4;
  padding: 2px 5px;
  border-radius: 6px;
  font-size: 12px;
  align-items: center;
  margin-left: 0.8rem;
  background: #f5f4f4;
}

/* 加载提示 */
.loading,
.finished {
  text-align: center;
  padding: 10px;
  font-size: 13px;
  color: #777;
}

.base {
  width: 60px;
  height: 20px;
  background: #99989856;
  border-radius: 8px 8px 0 0;
  margin: 6px auto 0 auto;
}
</style>
