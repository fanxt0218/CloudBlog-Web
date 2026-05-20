<template>
  <div class="vip-container">
    <!-- Header Banner -->
    <div class="vip-header">
      <div class="header-content">
        <div class="user-profile-section">
          <div class="avatar-wrapper">
            <img :src="`/api${userInfo?.image}`" alt="User Profile" class="header-avatar" />
            <div class="vip-badge-icon" v-if="vipInfo?.status === 0">VIP</div>
          </div>
          <div class="user-meta">
            <div class="name-row">
              <span class="user-name">{{ userInfo?.userName }}</span>
              <span class="vip-status-tag" :class="{ 'is-vip': vipInfo?.status === 0 }">
                {{ vipInfo?.status === 0 ? 'CloudBlog VIP' : '普通用户' }}
              </span>
            </div>
            <div class="vip-expiry">
              {{ vipInfo?.status === 0 ? '会员有效期至 ' + formatDate(vipInfo?.expiresTime || '') : '开通会员，立享全站特权' }}
            </div>
          </div>
        </div>
        
        <div class="redemption-section">
          <span class="label">会员兑换:</span>
          <div class="redeem-input-group">
            <input type="text" placeholder="请输入兑换码" v-model="redeemCode" />
            <button class="btn-redeem" @click="subscribeVip">兑换</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="vip-body">
      <!-- Tabs -->
      <div class="content-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'vip' }"
          @click="activeTab = 'vip'"
        >
          <i class="el-icon-star-on"></i> CloudBlog会员
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'balance' }"
          @click="activeTab = 'balance'"
        >
          <i class="el-icon-wallet"></i> 余额
        </div>
      </div>

      <!-- Plans Section -->
      <div class="plans-grid" v-if="activeTab === 'vip'">
        <div 
          v-for="plan in vipPlans" 
          :key="plan.id"
          class="plan-card"
          :class="{ 'is-selected': selectedPlanId === plan.id, 'has-tag': plan.tag }"
          @click="selectedPlanId = plan.id"
        >
          <div class="plan-tag" v-if="plan.tag">{{ plan.tag }}</div>
          <div class="plan-title">{{ plan.title }}</div>
          <div class="plan-price">
            <span class="currency">¥</span>
            <span class="amount">{{ plan.price }}</span>
            <span class="period">/{{ plan.period }}</span>
          </div>
          <div class="plan-original-price" v-if="plan.originalPrice">¥{{ plan.originalPrice }}</div>
          <div class="plan-desc">{{ plan.description }}</div>
          <div class="selected-icon" v-if="selectedPlanId === plan.id">
            <svg viewBox="0 0 1024 1024" width="20" height="20"><path d="M512 0C229.230769 0 0 229.230769 0 512s229.230769 512 512 512 512-229.230769 512-512S794.769231 0 512 0z m259.076923 354.461538L443.076923 670.512821c-7.384615 7.384615-17.230769 11.076923-27.076923 11.076923s-19.692308-3.692308-27.076923-11.076923L253.538462 534.153846c-14.769231-14.769231-14.769231-39.384615 0-54.153846 14.769231-14.769231 39.384615-14.769231 54.153846 0l108.307692 108.307692 295.384615-288c14.769231-14.769231 39.384615-14.769231 54.153846 0 14.769231 14.769231 17.230769 39.384615 5.538462 54.153846z" fill="#000"></path></svg>
          </div>
        </div>
      </div>

      <!-- Privileges Grid -->
      <div class="privileges-section">
        <h3 class="section-title">CloudBlog VIP会员特权 <span class="link">特权对比 <i class="el-icon-question"></i></span></h3>
        <div class="privileges-grid">
          <div v-for="priv in privileges" :key="priv.id" class="privilege-item">
            <div class="priv-icon-box" :style="{ backgroundColor: priv.color }">
              <img :src="priv.icon" :alt="priv.title" v-if="priv.icon.startsWith('http')" />
              <div v-else class="svg-icon" v-html="priv.icon"></div>
            </div>
            <div class="priv-info">
              <div class="priv-title">{{ priv.title }}</div>
              <div class="priv-desc">{{ priv.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Area -->
      <div class="checkout-section">
        <div class="payment-box">
          <div class="payment-info">
            <div class="amount-row">
              实付: <span class="final-price">¥{{ currentPlanPrice }}</span>
              <span class="discount-label" v-if="selectedPlan?.originalPrice">已优惠{{ (selectedPlan.originalPrice - selectedPlan.price).toFixed(2) }}元!</span>
            </div>
            <div class="coupon-banner">
              <span class="coupon-tag">¥50 优惠券</span>
              <span class="timer">支付优惠仅剩: 04:59</span>
            </div>
            <div class="qr-code-area">
              <div class="qr-placeholder">
                <img :src="`/api${qrcode}`" alt="QR Code" />
              </div>
              <div class="payment-methods">
                <img src="/assests/icon/WeChat.png" alt="WeChat/Alipay" />
                <span>扫码支付</span>
              </div>
            </div>
            <button class="btn-primary-buy" @click="subscribeVip" :disabled="vipInfo?.status === 0">
              {{ vipInfo?.status === 0 ? '您已是尊贵会员' : '立即开通会员' }}
            </button>
          </div>

          <div class="recent-activity">
            <div class="activity-title">最新开通动态</div>
            <div class="activity-list">
              <div v-for="act in recentActivity" :key="act.id" class="activity-item">
                <span class="user-id">{{ act.user }}</span>
                <span class="time-tag">刚刚</span>
                <span class="action-desc">购买了{{ act.plan }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { getUserInfo } from '@/api/userInfo/homePage'
import { getVipInfo, openVip } from '@/api/userInfo/vipCenter'
import type { UserInfo, VipInfo } from '@/types/index'
import { ElMessage } from 'element-plus'

let userInfo = ref<UserInfo>()
let vipInfo = ref<VipInfo>()
const activeTab = ref('vip')
const selectedPlanId = ref(2) // Default to annual
const redeemCode = ref('')

const qrcode = '/profile/system/author_wechat.jpg'

// Static Data
const vipPlans = [
  { id: 1, title: '月卡会员', price: 98.00, period: '月', description: '享 30次资源下载', tag: '' },
  { id: 2, title: 'VIP年卡', price: 168.00, originalPrice: 248.00, period: '年', description: '享 400次资源下载', tag: '省80元' },
  { id: 3, title: '超级会员年卡', price: 388.00, period: '年', description: '精选课程、专栏免费看', tag: '最火' },
  { id: 4, title: 'VIP两年卡', price: 298.00, period: '2年', description: '享 800次资源下载', tag: '' },
  { id: 5, title: '连续包月', price: 88.00, period: '月', description: '每月自动续费，可随时关闭', tag: '首月5折' }
]

const privileges = [
  { id: 1, title: '400次会员资源', description: '免费送专家文档、源码等资源', color: '#fff4e6', icon: '<svg viewBox="0 0 1024 1024" width="32" height="32"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m192 472c0 4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z" fill="#ffa940"></path></svg>' },
  { id: 2, title: 'VIP文章免费读', description: '300万优质内容无限畅读', color: '#e6f7ff', icon: '<svg viewBox="0 0 1024 1024" width="32" height="32"><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM728 720H296c-4.4 0-8-3.6-8-8V312c0-4.4 3.6-8 8-8h432c4.4 0 8 3.6 8 8v400c0 4.4-3.6 8-8 8z" fill="#1890ff"></path></svg>' },
  { id: 3, title: '60次项目运行', description: '60次项目生成，公私兼容', color: '#f9f0ff', icon: '<svg viewBox="0 0 1024 1024" width="32" height="32"><path d="M512 64l384 384-384 384-384-384z" fill="#722ed1"></path></svg>' },
  { id: 4, title: '1200次AI对话', description: '1200次AI对话，高效开发', color: '#fff0f6', icon: '<svg viewBox="0 0 1024 1024" width="32" height="32"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 720c-132.5 0-240-107.5-240-240S379.5 304 512 304s240 107.5 240 240-107.5 240-240 240z" fill="#eb2f96"></path></svg>' },
  { id: 5, title: '高级开发环境', description: '2核4G内存，流畅开发', color: '#f6ffed', icon: '<svg viewBox="0 0 1024 1024" width="32" height="32"><path d="M512 64L128 256v512l384 192 384-192V256z" fill="#52c41a"></path></svg>' },
  { id: 6, title: '专属身份标识', description: '尊贵会员标识，彰显个性', color: '#fff1f0', icon: '<svg viewBox="0 0 1024 1024" width="32" height="32"><path d="M512 64l128 320h320L704 576l128 320-256-192-256 192 128-320L64 384h320z" fill="#f5222d"></path></svg>' }
]

const recentActivity = [
  { id: 1, user: 'u***7', plan: 'VIP连续包月' },
  { id: 2, user: 'm***2', plan: 'VIP年卡' },
  { id: 3, user: 'z***k', plan: '超级会员年卡' },
  { id: 4, user: 'a***d', plan: 'VIP月卡' }
]

const selectedPlan = computed(() => vipPlans.find(p => p.id === selectedPlanId.value))
const currentPlanPrice = computed(() => selectedPlan.value?.price || 0)

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function subscribeVip() {
    const userId = Number(localStorage.getItem('userId'));
    try {
      await openVip(userId)
      // ElMessage.success('开通会员成功')
      const res = await getVipInfo(userId)
      vipInfo.value = res.data
      window.location.reload()
    } catch (error) {
      ElMessage.error('开通会员失败')
    }
}

onMounted(() => {
  const userId = Number(localStorage.getItem('userId'))
  if (userId) {
    getUserInfo(userId).then((res) => {
      userInfo.value = res.data
    })
    getVipInfo(userId).then((res) => {
      vipInfo.value = res.data
    })
  }
  document.title = '会员中心 - CloudBlog';
})
</script>

<style scoped>
.vip-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f4f5f7;
  min-height: 100vh;
  padding-bottom: 50px;
}

/* Header Banner */
.vip-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
  color: white;
  padding: 30px 40px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-profile-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  position: relative;
}

.header-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
}

.vip-badge-icon {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: linear-gradient(to right, #d4af37, #f1c40f);
  color: #1a1a1a;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid #1a1a1a;
}

.user-meta .name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
}

.vip-status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #444;
  color: #ccc;
}

.vip-status-tag.is-vip {
  background: #d4af37;
  color: #1a1a1a;
  font-weight: bold;
}

.vip-expiry {
  font-size: 14px;
  color: #aaa;
}

.redemption-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.redemption-section .label {
  font-size: 14px;
  color: #ccc;
}

.redeem-input-group {
  display: flex;
  gap: 0;
}

.redeem-input-group input {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 8px 15px;
  border-radius: 4px 0 0 4px;
  width: 200px;
  outline: none;
}

.btn-redeem {
  background: #d4af37;
  color: #1a1a1a;
  border: none;
  padding: 0 20px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-redeem:hover {
  opacity: 0.9;
}

/* Body Content */
.vip-body {
  margin-top: -20px;
  padding: 0 40px;
}

.content-tabs {
  background: white;
  display: flex;
  padding: 10px;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -5px 15px rgba(0,0,0,0.05);
  gap: 20px;
}

.tab-item {
  padding: 10px 25px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  border-radius: 8px;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #d4af37;
}

.tab-item.active {
  background: #fdf6ec;
  color: #d4af37;
}

/* Plans Grid */
.plans-grid {
  background: white;
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.plan-card {
  border: 2px solid #eee;
  border-radius: 12px;
  padding: 25px 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-5px);
  border-color: #d4af37;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.1);
}

.plan-card.is-selected {
  border-color: #d4af37;
  background: #fffdf8;
}

.plan-tag {
  position: absolute;
  top: 0;
  left: 0;
  background: #f56c6c;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px 0 10px 0;
}

.plan-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.plan-price {
  color: #d4af37;
  margin-bottom: 10px;
}

.plan-price .currency {
  font-size: 16px;
  font-weight: bold;
}

.plan-price .amount {
  font-size: 32px;
  font-weight: 800;
}

.plan-price .period {
  font-size: 14px;
  color: #999;
}

.plan-original-price {
  font-size: 14px;
  color: #bbb;
  text-decoration: line-through;
  margin-bottom: 10px;
}

.plan-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.selected-icon {
  position: absolute;
  bottom: 0px;
  right: 0;
  top: 167px;
  background: #d4af37;
  padding: 5px;
  border-radius: 12px 0 10px 0;
}

/* Privileges Section */
.privileges-section {
  margin-top: 40px;
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title .link {
  font-size: 14px;
  color: #999;
  font-weight: normal;
  cursor: pointer;
}

.privileges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.privilege-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.priv-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.priv-info .priv-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 5px;
  color: #333;
}

.priv-info .priv-desc {
  font-size: 13px;
  color: #888;
}

/* Checkout Section */
.checkout-section {
  margin-top: 40px;
}

.payment-box {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  display: flex;
  gap: 40px;
}

.payment-info {
  flex: 2;
  border-right: 1px solid #eee;
  padding-right: 40px;
}

.amount-row {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.final-price {
  font-size: 36px;
  font-weight: 800;
  color: #f56c6c;
  margin: 0 10px;
}

.discount-label {
  font-size: 14px;
  color: #f56c6c;
}

.coupon-banner {
  background: #fff5f5;
  padding: 10px 20px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.coupon-tag {
  color: #f56c6c;
  font-weight: bold;
}

.timer {
  color: #666;
  font-size: 13px;
}

.qr-code-area {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

.qr-placeholder {
  width: 140px;
  height: 140px;
  padding: 5px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.qr-placeholder img {
  width: 100%;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.payment-methods img {
  height: 24px;
}

.payment-methods span {
  font-size: 14px;
  color: #999;
}

.btn-primary-buy {
  background: linear-gradient(to right, #d4af37, #f1c40f);
  color: #1a1a1a;
  border: none;
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary-buy:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.btn-primary-buy:disabled {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
}

/* Recent Activity */
.recent-activity {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  background: #f9f9f9;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-id {
  color: #333;
}

.time-tag {
  background: #e1f3d8;
  color: #67c23a;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
}

/* Responsive */
@media (max-width: 992px) {
  .privileges-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .payment-box {
    flex-direction: column;
  }
  .payment-info {
    border-right: none;
    padding-right: 0;
  }
}
</style>

