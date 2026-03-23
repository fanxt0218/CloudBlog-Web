<template>
    <div class="right-content">
        <div class="advertisement">
            <el-carousel trigger="click" height="370px" style="border-radius: 12px;" interval="2000">
              <el-carousel-item v-for="item in advertisements" :key="item">
                <img :src="`/api${item.contentValue}`" alt="advertisement" class="carousel-image"/>
              </el-carousel-item>
            </el-carousel>
        </div>
        <div class="recommend-users">
          <div class="header">
            <div class="title">精选博主</div>
            <div class="more" @click="$router.push('/recommendUser')">更多优质创作者 &gt;</div>
          </div>
          <div class="user-list">
            <div class="user-item" v-for="user in recommendUsers" :key="user.userId" @click="handleJumpToUserProfile(user.userId)">
              <div class="avatar-box">
                <img class="avatar" :src="`/api${user.avatar}`" alt="avatar" />
                <!-- <div class="badge">红</div> -->
              </div>
              <img :src="`../../../public/assests/icon/level${user.level}.png`" class="level-icon"/>
              <div class="info">
                <div class="name">{{ user.userName }}</div>
              </div>
            </div>
          </div>
        </div>  
    </div> 
</template>
<script setup lang="ts" name="RightContent">
import { ref, onMounted } from 'vue'
import { getRecommendUsers } from '@/api/index/indexPage'
import type { RecommendUsers } from '@/types/index'
import { useRouter } from 'vue-router'
import { getWebsiteComponentInfo } from '@/utils/websiteComponent';
import type { WebsiteComponentDefine } from '@/types';

const recommendUsers = ref<RecommendUsers>([])
const router = useRouter()

let advertisements = ref<WebsiteComponentDefine[]>([])

/**
 * 处理跳转用户主页
 * @param userId 
 */
const handleJumpToUserProfile = (userId: number) => {
    router.push(`/otherUserHome/${userId}`)
}

/**
 * 加载广告轮播图
 */
async function loadAdvertisements() {
  try {
    const res = await getWebsiteComponentInfo('HOME', 'advertise');
    if (res && res.length > 0) {
      advertisements.value = res
    }
  } catch (error) {
    console.error('加载广告轮播图失败:', error);
  }
}


onMounted(() => {
    getRecommendUsers({
        cursor: null,
        size: 5,
        type: 0, // 默认是综合排序
    }).then(res => {
        recommendUsers.value = res.data.content || []
    })
    loadAdvertisements()
})
</script>
<style scoped>
.right-content {
    padding: 10px 0;
    width: 100%;
    position: fixed;
}

.advertisement {
    max-width: 80%;
    margin: 0 auto;
    cursor: pointer;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  padding: 0 10px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.more {
  font-size: 13px;
  color: #999;
  cursor: pointer;
}

.more:hover {
  color: #666;
}

.recommend-users {
  margin-top: 15px;
  max-width: 85%;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  padding: 10px;
}

.user-list {
  margin-top: 10px;
  padding: 0 10px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  /* margin-top: -5px; */
}

.user-item:hover {
  background: #f7f7f7;
}

.avatar-box {
  position: relative;
  width: 36px;
  height: 36px;
  margin-right: 10px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}

/* 角标（可换成图片） */
.badge {
  position: absolute;
  top: -2px;
  left: -2px;
  background: #ff3e3e;
  color: #fff;
  font-size: 10px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 用户名 */
.info .name {
  font-size: 14px;
  color: #222;
  font-weight: 500;
}

.level-icon {
  width: 23px;
  height: 23px;
  margin-left: -5px;
  /* margin-bottom: 4px; */
  margin-right: 5px;
  cursor: pointer;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>