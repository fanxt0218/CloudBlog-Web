<template>
  <div class="head">
    <!-- logo -->
    <span>
      <img class="logo" src="../../public/assests/logo.png" alt="logo" @click="$router.push('/')"/>
    </span>

    <!-- 搜索框 -->
    <span class="search-box">
      <div class="search-input-wrapper" v-click-outside="hideHistory">
        <!-- 诱导浏览器，防止其将搜索框误判为用户名并填充 -->
        <input type="password" style="display: none" autocomplete="new-password">
        <input 
          v-model="searchInput" 
          type="search" 
          id="search-input" 
          name="search-query"
          autocomplete="off"
          placeholder="搜索 CloudBlog..." 
          @keyup.enter="handleSearch"
          @focus="showHistory = true"
          @click="showHistory = true"
        />
        <!-- 搜索历史下拉框 -->
        <div class="search-history-dropdown" v-if="showHistory">
          <SearchHistory @click="hideHistory"/>
        </div>
      </div>
      <button id="search-btn" @click="handleSearch">搜索</button>
      <button id="ai-search-btn" @click="handleJumpToAi">AI搜索</button>
      <!-- 临时登录 -->
      <!-- <input type="text" v-model="phoneNumber" placeholder="临时登录入口">
      <button id="ai-search-btn" @click="tempLogin">登录</button> -->
    </span>

    <!-- 右侧栏 -->
    <span class="right-bar">
      <!-- 头像与悬浮窗 -->
      <div
        class="avatar-wrapper"
        @mouseenter="userInfoStore.isLoggedIn && (showPopup = true)"
        @mouseleave="handleMouseLeave"
      >
        <img id="avatar" v-if="userInfoStore.isLoggedIn" :src="userInfoStore.avatar" alt="avatar" @click="$router.push('/userHome')"/>
        <img id="avatar" v-else src="/assests/avatar/unLogin.png" alt="avatar" @click="$router.replace('/login')"/>
        <!-- 悬浮信息窗 -->
        <div
          class="user-popup"
          v-if="showPopup"
          @mouseenter="insidePopup = true"
          @mouseleave="handleMouseLeave"
        >
          <!-- 小箭头 -->
          <div class="popup-arrow"></div>

          <!-- 用户卡片内容 -->
          <div class="popup-header">
            <img class="popup-avatar" :src="userInfoStore.avatar" alt="avatar" />
            <div class="popup-name">
              <span class="username">{{ userInfoStore.userName }}</span>
              <svg
                v-if="userInfoStore.isVip === 1 || userInfoStore.isVip === 0"
                class="vip-icon"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M941.127 431.9L806.66 170.175a37.002 37.002 0 0 0-32.911-20.091H252.053a36.998 36.998 0 0 0-32.825 19.927L83.219 431.506a37 37 0 0 0 6.084 42.645L484.97 887.919a37.001 37.001 0 0 0 26.716 11.428h0.025a37 37 0 0 0 26.707-11.393l396.506-413.539a36.996 36.996 0 0 0 6.203-42.515z m-210.42 41.652L538.634 673.876a37 37 0 0 1-26.707 11.393h-0.025a36.998 36.998 0 0 1-26.716-11.429L293.521 473.406c-14.123-14.769-13.599-38.19 1.17-52.313 14.769-14.124 38.19-13.599 52.313 1.17l164.96 172.507 165.33-172.432c14.142-14.75 37.565-15.242 52.314-1.1 14.749 14.142 15.242 37.564 1.099 52.314z"
                  :fill="userInfoStore.isVip === 1 ? 'red' : '#dbdbdb'"
                ></path>
              </svg>
            </div>
          </div>

          <div class="popup-stats">
            <div><strong>{{ fanCount }}</strong><br />粉丝</div>
            <div><strong>{{ focusCount }}</strong><br />关注</div>
            <div><strong>{{ likedCount }}</strong><br />获赞</div>
          </div>

          <div class="popup-links">
            <div @click="$router.push('/userHome/')">
                <img src="../../public/assests/icon/home.png" class="link-icon"/>
                我的主页
            </div>
            <div @click="$router.push('/personal')">
                <img src="../../public/assests/icon/personal.png" class="link-icon personal"/>
                个人中心
            </div>
            <div @click="$router.push('/levelCenter')" >
                <img src="../../public/assests/icon/level.png" class="link-icon level"/>
                我的等级
            </div>
            <div @click="$router.push('/vipCenter')">
                <img src="../../public/assests/icon/vipCenter.png" class="link-icon vipCenter"/>
                会员中心
            </div>
            <div @click="handleExitLogin" class="exit">
                <img src="../../public/assests/icon/exit.png" class="link-icon exit-icon"/>
                退出登录
            </div>
          </div>
        </div>
      </div>

      <!-- 会员中心 -->
      <span id="member-center" @click="$router.push('/vipCenter')" v-if="userInfoStore.isLoggedIn">会员中心</span>

      <!-- 消息中心 -->
      <span id="message-center" @click="handleJumpToMessageCenter">
        消息
        <span v-if="hasNewMessage" class="message-dot"></span>
      </span>
      <!-- 创作 -->
      <div
        class="create-wrapper"
        v-if="showCreate"
        @mouseenter="showCreateMenu = true"
        @mouseleave="handleCreateLeave"
      >
        <button id="create-btn">创作</button>

        <!-- 创作下拉菜单 -->
        <div
          class="create-menu"
          v-show="showCreateMenu"
          @mouseenter="insideCreateMenu = true"
          @mouseleave="handleCreateLeave"
        >
          <div class="menu-arrow"></div>
          <div class="create-btn-line">
            <div class="menu-item" @click="handleJumpToCreate('/edit')">
              <svg t="1766302380459" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5154" width="26" height="26">
                <path d="M896 864a32 32 0 0 1 0 64H128a32 32 0 0 1 0-64z m-60.16-733.621333l15.093333 15.093333c45.866667 45.834667 45.866667 120.16 0 166.005333L418.794667 743.338667a160.192 160.192 0 0 1-78.122667 42.986666l-152.245333 34.197334c-23.84 5.365333-44.661333-16.853333-37.749334-40.288l43.338667-146.88a160.042667 160.042667 0 0 1 40.373333-67.925334l435.328-435.050666c45.866667-45.834667 120.245333-45.834667 166.112 0zM636.32 254.304L279.68 610.709333a96.021333 96.021333 0 0 0-24.213333 40.746667l-27.946667 94.656 99.093333-22.261333a96.117333 96.117333 0 0 0 46.869334-25.781334L726.933333 344.842667l-90.602666-90.538667z m78.698667-78.656l-33.397334 33.386667 90.602667 90.538666 33.386667-33.376a53.333333 53.333333 0 0 0 0-75.456l-15.093334-15.093333a53.408 53.408 0 0 0-75.498666 0z" fill="#2c2c2c" p-id="5155">
                </path>
              </svg>
              <div class="menu-item-text">写文章</div>
            </div>
            <div class="menu-item" @click="handleJumpToCreate('/publishShare')">
              <svg t="1766302646314" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7124" width="24" height="24">
                <path d="M837.312 60.8a162.176 162.176 0 0 1 160.896 163.2v473.6a163.2 163.2 0 0 1-161.792 163.2h-142.208l-115.136 92.864a107.712 107.712 0 0 1-127.04 6.016l-8.064-5.952-115.264-92.928H186.24A162.24 162.24 0 0 1 25.6 708.224l-0.192-10.688V224.32A162.24 162.24 0 0 1 186.24 60.8z m-0.32 76.8H186.88c-47.104 0.384-85.12 38.912-84.672 86.4v473.92a85.376 85.376 0 0 0 84.352 86.08H355.84l136.448 110.08c11.008 8.96 27.392 8.96 38.528-0.128l136.32-109.952h168.96a86.4 86.4 0 0 0 85.312-86.4V223.616a85.376 85.376 0 0 0-84.416-86.144zM271.04 402.176a68.864 68.864 0 0 1 47.872 117.696c-12.544 12.544-30.528 19.776-48.512 19.776-37.76 0-68.224-31.232-68.224-69.056 0-37.76 31.104-68.416 68.864-68.416z m241.344 0a68.864 68.864 0 0 1 47.936 117.696c-12.608 12.544-30.592 19.776-48.512 19.776-37.76 0-68.288-31.232-68.288-69.056 0-37.76 31.104-68.416 68.864-68.416z m241.344 0a68.864 68.864 0 0 1 47.936 117.696c-12.608 12.544-30.528 19.776-48.512 19.776-37.76 0-68.288-31.232-68.288-69.056 0-37.76 31.168-68.416 68.864-68.416z" fill="#2c2c2c" p-id="7125">
                </path>
              </svg>
              <div class="menu-item-text">发动态</div>
            </div>
          </div>
        
          <div class="menu-footer" @click="$router.push('/creatorCenter')">
            <svg t="1766304200181" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8380" width="20" height="20"><path d="M512 0h-0.7C298.7 0.4 126.2 174.8 128 387.4c1 112.1 50 212.8 127.5 282.4 51 45.8 80.5 110.8 80.5 179.3v57c0 65.1 52.8 117.9 117.9 117.9h116.2c65.1 0 117.9-52.8 117.9-117.9v-57c0-68.6 29.6-133.6 80.6-179.5C846.8 599.3 896 497.4 896 384 896 171.9 724.1 0 512 0z m213.9 622C661.1 680.3 624 763 624 849.1V896c0 35.3-28.7 64-64 64h-96c-35.3 0-64-28.7-64-64v-46.9c0-86.1-37.1-168.9-101.7-227-32.8-29.4-58.7-64.6-77.1-104.4-19-41.2-28.8-85.2-29.2-130.9-0.4-43.3 7.8-85.4 24.3-125.1 16-38.4 39-72.9 68.4-102.7 29.4-29.7 63.7-53.1 101.9-69.5 39.5-16.9 81.5-25.5 124.8-25.6h0.6c43.2 0 85.1 8.5 124.5 25.1 38.1 16.1 72.3 39.2 101.7 68.6 29.4 29.4 52.5 63.6 68.6 101.7C823.6 298.9 832 340.8 832 384c0 46.2-9.6 90.8-28.6 132.5C785 556.8 759 592.3 725.9 622z" p-id="8381" fill="#2c2c2c">
              </path><path d="M516.7 624l19.4-173.3H460L627.3 208l-19.4 173.3H684L516.7 624zM576 912H448c-4.4 0-8.4-1.8-11.3-4.7-2.9-2.9-4.7-6.9-4.7-11.3 0-8.8 7.2-16 16-16h128c4.4 0 8.4 1.8 11.3 4.7 2.9 2.9 4.7 6.9 4.7 11.3 0 8.8-7.2 16-16 16z m0-64H448c-4.4 0-8.4-1.8-11.3-4.7-2.9-2.9-4.7-6.9-4.7-11.3 0-8.8 7.2-16 16-16h128c4.4 0 8.4 1.8 11.3 4.7 2.9 2.9 4.7 6.9 4.7 11.3 0 8.8-7.2 16-16 16z m16-64H432c-4.4 0-8.4-1.8-11.3-4.7-2.9-2.9-4.7-6.9-4.7-11.3 0-8.8 7.2-16 16-16h160c4.4 0 8.4 1.8 11.3 4.7 2.9 2.9 4.7 6.9 4.7 11.3 0 8.8-7.2 16-16 16z" p-id="8382" fill="#2c2c2c">
              </path>
            </svg>
            <div class="go-creator-center">进入创作者中心 →</div>
          </div>
        </div>
      </div>
    </span>
  </div>
  <hr />
</template>

<script setup lang="ts" name="Head">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getUserInfo,getUserAchievement } from '@/api/userInfo/homePage'
import { login } from '@/api/index/indexPage'
import router from '@/router'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { wsService } from '@/service/SocketManager'
import { useHomePageStore } from '@/stores/homePage'
import { useUserInfoStore } from '@/stores/userInfo'
import SearchHistory from '@/components/searchPage/SearchHistory.vue'

const route = useRoute()

// 搜索历史显示控制
const showHistory = ref(false)
const hideHistory = () => {
  showHistory.value = false
}

// v-click-outside 指令实现
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

let phoneNumber = ref('')

let fanCount = ref(0)
let focusCount = ref(0)
let likedCount = ref(0)
let showPopup = ref(false)
let insidePopup = ref(false)
let hasNewMessage = ref(false) // 消息状态变量

const searchInput = ref(route.query.q as string || '')

const handleSearch = () => {
  console.log('触发搜索',searchInput.value,route.name)
  if (searchInput.value.trim()) {
    homePageStore.setSearchKey(searchInput.value)
    // 如果已经在搜索页，使用 replace 避免历史堆积
    if (route.name === 'search') {
      router.replace({ name: 'search', query: { q: searchInput.value } })
    } else {
      console.log('push')
      // 另起标签页
      window.open('/search?q=' + searchInput.value, '_blank')
      // router.push({ name: 'search', query: { q: searchInput.value } })
    }
  }
}

const userInfoStore = useUserInfoStore()

// 创作按钮是否显示
let showCreate = ref(true)


const handleMouseLeave = () => {
  setTimeout(() => {
    if (!insidePopup.value) showPopup.value = false
  }, 200)
  insidePopup.value = false
}
/**
 * 临时登录
 */
const tempLogin = async () => {
  const res = await login({
    loginType:'phone',
    target:phoneNumber.value,
    password:'fan123',
    twicePassword:'fan123'
  })
  if(res.code === 200){
    ElMessage.success('登录成功')
    userInfoStore.login({
      userId: res.data.userId,
      token: res.data.token,
      userName: res.data.userName
    })
  }
  // 刷新
  window.location.reload()
}
/**
 * 退出登录
 */
const handleExitLogin = () => {
  userInfoStore.logout();
  // 刷新
  window.location.reload()
}

/**
 * 跳转消息中心
 */
const handleJumpToMessageCenter = () => {
  if (userInfoStore.isLoggedIn) {
    router.push('/messageCenter'); 
    hasNewMessage.value = false 
  } else {
    router.replace('/login')
  }
}
/**
 * 处理监听消息
 */
const handleChatMessage = (data: any) => {
  console.log('收到聊天消息:', data)
  const currentPath = route.path
  // 如果当前在消息中心页面，不显示新消息提示
  if (currentPath && currentPath.includes('/messageCenter')) {
    return
  }
  hasNewMessage.value = true // 设置有新消息
}

// 创作菜单
const showCreateMenu = ref(false)
const insideCreateMenu = ref(false)

const handleCreateLeave = () => {
  setTimeout(() => {
    if (!insideCreateMenu.value) {
      showCreateMenu.value = false
    }
  }, 200)
  insideCreateMenu.value = false
}

// 跳转创作页面
const handleJumpToCreate = (path: string) => {
  if (!userInfoStore.isLoggedIn) {
    router.replace('/login')
    return
  }
  window.open(path,'_blank')
}

/**
 * 跳转至AI页面
 */
function handleJumpToAi() {
  if (!userInfoStore.isLoggedIn) {
    router.replace('/login')
    return
  }
  window.open('/ai', '_blank')
}

const homePageStore = useHomePageStore()
// 监听搜索框内容变化
watch(() => homePageStore.searchKey, (newVal) => {
  searchInput.value = newVal
})

onMounted(() => {
  userInfoStore.init()
  if (userInfoStore.isLoggedIn && userInfoStore.userId !== 0) {
    getUserInfo(userInfoStore.userId).then((response) => {
      userInfoStore.setUserInfo({
        avatar: '/api' + response.data.image,
        userName: response.data.userName,
        isVip: response.data.isVip
      })
      fanCount.value = response.data.fanCount
      focusCount.value = response.data.focusCount
    })

    getUserAchievement(userInfoStore.userId).then(res => {
      likedCount.value = res.data.likeCount;
    })

    // 监听WebSocket的聊天消息事件
    wsService.on('CHAT', handleChatMessage)
  }
})

onUnmounted(() => {
  // 移除WebSocket事件监听
  wsService.off('CHAT', handleChatMessage)
})
</script>

<style scoped>
/* 保持原有样式不变 */
.head {
  height: 45px;
}
.logo {
  margin-left: 12px;
  /* margin-top: -5px; */
  height: 50px;
  cursor: pointer;
}
.search-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -45px;
  gap: 10px;
}
#search-input {
  width: 550px;
  height: 30px;
  border-radius: 15px;
  border: 1px solid #ccc;
  padding: 0 15px;
  font-size: 14px;
  outline: none;
}
#search-input:focus {
  border-color: #4316f5;
  border-width: 1px;
  box-shadow: 0 0 0 1px rgba(43, 185, 246, 0.1);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-history-dropdown {
  position: absolute;
  top: 36px;
  left: 0;
  width: 650px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow: hidden;
  transition: opacity 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.search-history-dropdown {
  animation: fadeIn 0.2s ease-out;
}
#search-btn,
#ai-search-btn {
  width: 86px;
  height: 32px;
  border-radius: 16px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  /* transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); */
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

#search-btn {
  background: linear-gradient(135deg, #f8b343 0%, #f39c12 100%);
  color: #fff;
  box-shadow: 0 2px 6px rgba(248, 179, 67, 0.3);
}

#search-btn:hover {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  /* transform: translateY(-1.5px); */
  box-shadow: 0 4px 12px rgba(248, 179, 67, 0.4);
}

#search-btn:active {
  /* transform: translateY(0); */
  box-shadow: 0 2px 4px rgba(248, 179, 67, 0.3);
}

#ai-search-btn {
  background: linear-gradient(135deg, #2bb9f6 0%, #1e90ff 100%);
  color: #fff;
  box-shadow: 0 2px 6px rgba(43, 185, 246, 0.3);
}

#ai-search-btn:hover {
  background: linear-gradient(135deg, #1e90ff 0%, #0070f3 100%);
  /* transform: translateY(-1.5px); */
  box-shadow: 0 0 15px rgba(43, 185, 246, 0.5);
}

#ai-search-btn:active {
  /* transform: translateY(0); */
}
.right-bar {
  float: right;
  margin-right: 20px;
  margin-top: -35px;
  height: 40px;
  display: flex;
  align-items: center;
}
#avatar {
  height: 35px;
  width: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgb(200, 198, 198);
  position: relative;
  top: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
}
#avatar:hover {
  transform: scale(1.05);
}
#member-center,
#message-center {
  margin-left: 15px;
  font-size: 14px;
  position: relative;
  cursor: pointer;
  color: #2b2a2a;
}

#member-center:hover,
#message-center:hover {
    color: #000000;
}
#create-btn {
  margin-left: 15px;
  height: 33px;
  width: 70px;
  border-radius: 18px;
  font-size: 14px;
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #fff;
  position: relative;
  cursor: pointer;
  border: none;
  /* transition: all 0.3s ease; */
}
#create-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffb74d 100%);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}
hr {
  margin-top: 5px;
  border: none;
  border-top: 0.5px solid #d2d0d0;
}

#login-entry-btn {
  width: 70px;
  height: 30px;
  border-radius: 15px;
  border: 1px solid #4316f5;
  background: transparent;
  color: #4316f5;
  font-size: 14px;
  cursor: pointer;
  margin-left: 15px;
  transition: all 0.3s ease;
}

#login-entry-btn:hover {
  background: #4316f5;
  color: #fff;
}

/* ===== 新增部分，仅负责弹窗效果 ===== */
.avatar-wrapper {
  position: relative;
  display: inline-block;
}

/* 弹窗主体 */
.user-popup {
  position: absolute;
  top: 45px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px; /* ✅ 稍微拉长 */
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  padding: 10px 12px;
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

/* 弹窗显示时（防闪动 + 平滑淡入） */
.avatar-wrapper:hover .user-popup,
.user-popup:hover {
  opacity: 1;
  visibility: visible;
}

/* 小箭头 */
.popup-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: #fff;
  border-left: 1px solid #e5e5e5;
  border-top: 1px solid #e5e5e5;
}

/* 用户信息区 */
.popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.popup-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.popup-name {
  display: flex;
  align-items: center;
  gap: 6px;
}
.username {
  font-weight: 450;
  font-size: 14.5px;
  margin-left: -0.2rem;
  margin-top: -0.2rem;
}
.vip-badge {
  font-size: 12px;
  color: #fff;
  background: #f8b343;
  border-radius: 4px;
  padding: 1px 4px;
  
  margin-top: -0.2rem;
}

/* 粉丝统计 */
.popup-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-top: 8px;
  font-size: 13px;
}
.popup-stats strong {
  font-size: 14px;
}

/* 底部导航区域 */
.popup-links {
  border-top: 1px solid #eee;
  margin-top: 10px;
  padding-top: 6px;
  font-size: 15px; /* ✅ 字体稍大 */
  font-weight: 350;
  display: flex;
  flex-direction: column;
  gap: 0; /* 用分隔线分隔，不靠 gap */
}

/* 单项卡 */
.popup-links div {
  padding: 8px 4px; /* ✅ 加宽间距 */
  border-bottom: 1px solid #f0f0f0; /* ✅ 浅灰色分隔线 */
  transition: background 0.2s;
}

/* 最后一项去掉底线 */
.popup-links div:last-child {
  border-bottom: none;
}

/* hover 效果 */
.popup-links div:hover {
  background: #faf9f9;
  border-radius: 6px;
  cursor: pointer;
}

.vip-icon {
  width: 20px;
  height: 20px;
  cursor: default;
  transition: fill 0.3s ease;
  margin-top: -2px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.link-icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  margin-top: -5px;
  vertical-align: middle;
  display: inline-block;
  object-fit: contain;
  /* transition: transform 0.2s ease */
}

.personal {
    height: 16px;
}

.vipCenter, .level {
    margin-top: 1px;
}

.exit {
  margin-top: 0.5rem;
  border: 1.5px solid #dbdbdb;
  border-bottom: 1.5px solid #dbdbdb !important; /* 明确指定下边框，覆盖通用规则 */
  border-radius: 6px;
  margin-bottom: 0.2rem;
}

.exit-icon {
  margin-top: -0.1rem;
}

/* 消息红点样式 */
.message-dot {
  position: absolute;
  top: -3px;
  right: -5px;
  width: 6px;
  height: 5px;
  background-color: #ff4d4f;
  border-radius: 50%;
  border: 1px solid #fff;
}

/* ===== 创作悬浮菜单 ===== */
.create-wrapper {
  position: relative;
  margin-left: 15px;
}

/* 菜单主体 */
.create-menu {
  position: absolute;
  top: 45px;
  right: 0;
  width: 200px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 8px 10px;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

/* 小箭头 */
.menu-arrow {
  position: absolute;
  top: -6px;
  right: 22px;
  width: 10px;
  height: 10px;
  background: #fff;
  transform: rotate(45deg);
  border-left: 1px solid #e5e5e5;
  border-top: 1px solid #e5e5e5;
}

.create-btn-line {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  /* margin-bottom: 10px; */
}

/* 子菜单项 */
.menu-item {
  padding: 10px 14px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 400;
}

.menu-item:hover {
  background: #f7f7f7;
}

/* 底部入口 */
.menu-footer {
  margin-top: 3px;
  padding: 10px 14px;
  /* border-top: 1px solid #eee; */
  font-size: 13px;
  /* color: #ff9500; */
  cursor: pointer;
  border: 1px solid #eee;
  border-radius: 6px;
  align-items: center;
  display: flex;
}

.menu-footer:hover {
  background: #f3f3f3;
}

.go-creator-center {
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

</style>
