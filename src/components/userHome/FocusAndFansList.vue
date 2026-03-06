<template>
    <div class="focus-and-fan">
        <div class="bar-content">
            <div v-for="item in barBtn" :key="item.id" class="bar-item" :class="{ 'bar-item-active': item.id === barId }" @click="barId = item.id">
                {{ item.name }}
            </div>
        </div>
        <hr></hr>
        <div class="user-list">
          <div
            v-for="item in userList"
            :key="item.userId"
            class="user-item"
          >
            <!-- 左侧信息 -->
            <div
              class="user-info"
              @click="handleJumpToUserProfile(item.userId)"
            >
              <div class="user-avatar">
                <img :src="`/api${item.avatar}`" alt="" />
              </div>
          
              <div class="meta-data">
                <div class="user-name">{{ item.userName }}</div>
                <div class="user-signature">
                  {{ item.introduction || '这个人很懒，什么都没有写' }}
                </div>
              </div>
            </div>
        
            <!-- 右侧操作 -->
            <div class="action-button" :class="{'active' : item.followStatus === 1}" @click="handleFollow(item)">
              <template v-if="barId === 0">
                {{ item.followStatus === 0 ? '关注' : '已关注' }}
              </template>
              <template v-else>
                {{ item.followStatus === 0 ? '回关' : '互关' }}
              </template>
            </div>
          </div>
        </div>
    </div>
</template>
<script setup lang="ts" name="FocusAndFansList">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getFocusAndFansList } from '@/api/userInfo/homePage'
import { focusUser } from '@/api/userInfo/otherHomePage'
import type { FocusAndFansInfos, FocusAndFansInfo} from '@/types'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const router = useRouter();

const scrollContainer = ref<HTMLDivElement | null>(null);
const currentCursor = ref<string | null>(null);
const pageSize = ref(10);
const postCount = ref(0);
const isLoading = ref(false);
const isFinished = ref(false);
const sortBy = ref('createTime');
const tag = ref('');

const userId = useRoute().params.userId

const type = useRoute().params.type || 'focus'

const barBtn = ref([
    { id: 0, name: '关注' },
    { id: 1, name: '粉丝' }
])

let userList = ref<FocusAndFansInfos>([])

let barId = ref(type === 'focus' ? 0 : 1);

/**
 * 获取关注或粉丝列表
 */
const loadUserList = async() => {
  if (isLoading.value || isFinished.value) return;

  isLoading.value = true;

  try {
    const params = {
      cursor: currentCursor.value,
      size: pageSize.value,
      userId: userId? Number(userId) : Number(localStorage.getItem('userId')),
      type: barId.value
    }
    const response =  await getFocusAndFansList(params);
    const result = response.data;
    
    if (result.content && result.content.length > 0) {
      userList.value.push(...result.content);
      if ( result.hasNext && result.nextCursor) {
        currentCursor.value = result.nextCursor;
      } else {
        isFinished.value = true;
      }
    } else {
      isFinished.value = true;
    }
  } catch (error) {
    console.error('获取关注/粉丝列表失败:', error);
  } finally {
    isLoading.value = false;
  }
}

let scrolling = false;
const handleScroll = () => {
  if (scrolling) return;
  scrolling = true;

  setTimeout(() => {
    scrolling = false;

    if (isLoading.value || isFinished.value) return;

    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;

    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadUserList();
    }

  }, 100);
};

/**
 * 处理关注/取消关注
 * @param userId 
 * @param followStatus 关注状态 0未关注 1已关注
 */
const handleFollow = async (item: FocusAndFansInfo) => {
    const param = {
        userId: userId? Number(userId) : Number(localStorage.getItem('userId')),
        focusUserId: item.userId,
        status: item.followStatus === 0 ? 0 : 1,
        source: barId.value === 0 ? 'TA的关注列表' : 'TA的粉丝列表'
    }
    const res = await focusUser(param);
    if (item.followStatus === 0) {
        // 关注
        if (res.code === 200) {
            // 关注成功
            // 刷新当前用户的关注/粉丝列表
            ElMessage.success('关注成功');
            item.followStatus = 1;
        } else {
            // 关注失败
            ElMessage.error('关注失败');
        }
    } else {
        // 取消关注
        if (res.code === 200) {
            // 取消关注成功
            // 刷新当前用户的关注/粉丝列表
            ElMessage.success('取消关注成功');
            item.followStatus = 0;
        } else {
            // 取消关注失败
            ElMessage.error('取消关注失败');
        }
    }
}

watch(barId, () => {
    userList.value = [];
    currentCursor.value = null;
    isFinished.value = false;
    loadUserList();
});

// watch(
//   () => type,
//   (val) => {
//     console.log('触发了type变化', val)
//     barId.value = val === 'focus' ? 0 : 1
//     userList.value = []
//     currentCursor.value = null
//     isFinished.value = false
//     loadUserList()
//   },
//   { immediate: true }
// )

/**
 * 处理跳转用户主页
 * @param userId 
 */
const handleJumpToUserProfile = (userId: number) => {
    window.open(`/otherUserHome/${userId}`, '_blank');
}

onMounted(() => {
    loadUserList();
    window.addEventListener("scroll", handleScroll);

})

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>
<style scoped>
.focus-and-fan {
  width: 60%;
  margin: 0 auto;
}

/* 顶部 bar */
.bar-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
}

.bar-item {
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.bar-item:hover {
  background: #eaeaea;
}

.bar-item-active {
  background: #3a3a3a;
  color: #fff;

  &:hover {
    background: #4d4d4d;
  }
}

hr {
  border: none;
  height: 1px;
  background-color: #e6e6e6;
  margin: 0;
}

/* 列表 */
.user-list {
  margin-top: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 4px;
  border-bottom: 1px solid #f0f0f0;
}

/* 左侧信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* 文本信息 */
.meta-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-name {
  font-size: 15px;
  font-weight: 500;
  color: #222;
  line-height: 1.2;
}

.user-signature {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 360px;
}

/* 右侧按钮 */
.action-button {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 16px;
  border: 1px solid #dcdcdc;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f5f5f5;
  border-color: #8d8d8d;
}

.action-button.active {
  background: #f5f5f5;
}

</style>