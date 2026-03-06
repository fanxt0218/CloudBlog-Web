<template>
    <div class="vip-center">
        <div class="user-info">
            <div class="profile">
                <img :src="`/api${userInfo?.image}`" alt="User Profile" class="profile-image" />
                <div class="profile-details">
                    <div class="user-name">{{ userInfo?.userName }}</div>
                    <svg
                        v-if="userInfo?.isVip === 1 || userInfo?.isVip === 0"
                        class="vip-icon"
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M941.127 431.9L806.66 170.175a37.002 37.002 0 0 0-32.911-20.091H252.053a36.998 36.998 0 0 0-32.825 19.927L83.219 431.506a37 37 0 0 0 6.084 42.645L484.97 887.919a37.001 37.001 0 0 0 26.716 11.428h0.025a37 37 0 0 0 26.707-11.393l396.506-413.539a36.996 36.996 0 0 0 6.203-42.515z m-210.42 41.652L538.634 673.876a37 37 0 0 1-26.707 11.393h-0.025a36.998 36.998 0 0 1-26.716-11.429L293.521 473.406c-14.123-14.769-13.599-38.19 1.17-52.313 14.769-14.124 38.19-13.599 52.313 1.17l164.96 172.507 165.33-172.432c14.142-14.75 37.565-15.242 52.314-1.1 14.749 14.142 15.242 37.564 1.099 52.314z"
                          :fill="userInfo?.isVip === 1 ? 'red' : '#dbdbdb'"
                        ></path>
                    </svg>
                </div>
            </div>
            <div class="user-status">
                {{ vipInfo?.status == 1 ? '暂未开通会员' : '会员有效期至' + '&nbsp;' + formatDate(vipInfo?.expiresTime || '') }}
            </div>
        </div>
        <button class="vip-button" @click="subscribeVip " :disabled="vipInfo?.status === 0">
              开通会员
        </button>
    </div>
    <div class="vip-message">
             开通会员 全站VIP作品任意看
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/api/userInfo/homePage'
import { getVipInfo, openVip } from '@/api/userInfo/vipCenter'
import type { UserInfo, VipInfo } from '@/types/index'
import { ElMessage } from 'element-plus'

let userInfo = ref<UserInfo>()
let vipInfo = ref<VipInfo>()

/**
 * 处理时间
 */
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 开通会员
 */
async function subscribeVip() {
    const userId = Number(localStorage.getItem('userId'));
    try {
      await openVip(userId)
      ElMessage.success('开通会员成功')
      // 刷新会员信息
      const vipRes = await getVipInfo(userId).then((res) => {
        vipInfo.value = res.data
        console.log('用户会员信息',vipInfo.value)
      })
      window.location.reload()
    } catch (error) {
      ElMessage.error('开通会员失败')
    }
}

onMounted(() => {
  getUserInfo(Number(localStorage.getItem('userId'))).then((res) => {
    userInfo.value = res.data
  })

  getVipInfo(Number(localStorage.getItem('userId'))).then((res) => {
    vipInfo.value = res.data
    console.log('用户会员信息',vipInfo.value)
  })
  document.title = '会员中心 - CloudBlog';
})
</script>

<style scoped>
.vip-center {
  width: 80%;
  min-height: 150px;
  margin: 0 auto;
  padding: 20px;
  border: 2px solid #e5e7ebce;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.profile {
  display: flex;
  /* align-items: center; */
  justify-content: space-between;
  margin-bottom: 20px;
}

.profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1.5px solid #ffffff00;
  box-shadow: 0 0 5px #747474a9;
  cursor: pointer;
}

.profile-details {
  text-align: left;
  flex-grow: 1;
  margin-left: 10px;
  display: flex;

}

.user-name {
  font-size: 20px;
  font-weight: bold;
}

.user-status {
  /* margin-top: 1px; */
  font-size: 16px;
  color: #888;
}

.user-status.vip {
  color: #f04705;  /* VIP color */
}

.vip-message {
  font-size: 30px;
  color: #f04705;
  font-weight: bold;
  margin-top: 5rem;
  text-align: center;
}

.vip-button {
  background-color: #f04705;
  height: 36px;
  width: 120px;
  color: white;
  padding: 5px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  margin-left: auto;
  margin-top: -1rem;
  transition: all 0.3s ease;
}

.vip-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}


.vip-icon {
  width: 23px;
  height: 23px;
  cursor: default;
  transition: fill 0.3s ease;
  margin-top: 4px;
  margin-left: 0.4rem;
  cursor: pointer;
}
</style>
