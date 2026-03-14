<template>
  <div class="basic-data-container">
    <!-- 用户信息卡片 -->
    <div class="card user-info-card" v-if="userInfo">
      <div class="user-main">
        <div class="avatar-wrapper">
          <img :src="`/api${userInfo.image}`" alt="avatar" class="avatar" v-if="userInfo.image">
          <div class="avatar-placeholder" v-else></div>
        </div>
        <div class="user-details">
          <div class="name-row">
            <span class="username">{{ userInfo.userName }}</span>
            <span class="level-tag">LV.{{ userInfo.level }}</span>
          </div>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.postCount }}</span>
              <span class="stat-label">原创</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.fanCount }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.exp }}</span>
              <span class="stat-label">博客积分</span>
            </div>
          </div>
        </div>
      </div>
      <div class="user-actions">
        <!-- 模拟图片右侧的四个小图标，使用 Lucide 图标库 -->
        <div class="icon-item">
          <Contact :size="20" />
        </div>
        <div class="icon-item">
          <Building2 :size="20" />
        </div>
        <div class="icon-item">
          <Leaf :size="20" />
        </div>
        <div class="icon-item">
          <Box :size="20" />
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="card data-overview-card">
      <div class="data-grid">
        <!-- 总阅读量 -->
        <div class="data-box">
          <div class="data-label">总阅读量</div>
          <div class="data-main">
            <span class="data-value">{{ formatNumber(userInfo?.visits || 0) }}</span>
          </div>
          <div :class="['data-trend', yesterdayStats.visits > 0 ? 'up' : 'gray']">
            <span class="trend-icon" v-if="yesterdayStats.visits > 0">↑</span>
            <span class="trend-text">昨日 {{ yesterdayStats.visits > 0 ? '+' + yesterdayStats.visits : '无变化' }}</span>
          </div>
        </div>

        <!-- 累计收益 -->
        <div class="data-box">
          <div class="data-label">累计收益</div>
          <div class="data-main">
            <span class="currency">¥</span>
            <span class="data-value">0</span>
          </div>
          <div :class="['data-trend', yesterdayStats.income > 0 ? 'up' : 'gray']">
            <span class="trend-icon" v-if="yesterdayStats.income > 0">↑</span>
            <span class="trend-text">昨日 {{ yesterdayStats.income > 0 ? '+' + yesterdayStats.income : '无变化' }}</span>
          </div>
        </div>

        <!-- 粉丝数 -->
        <div class="data-box">
          <div class="data-label">粉丝数</div>
          <div class="data-main">
            <span class="data-value">{{ userInfo?.fanCount || 0 }}</span>
          </div>
          <div :class="['data-trend', yesterdayStats.fans > 0 ? 'up' : (yesterdayStats.fans < 0 ? 'down' : 'gray')]">
            <span class="trend-icon" v-if="yesterdayStats.fans > 0">↑</span>
            <span class="trend-icon" v-else-if="yesterdayStats.fans < 0">↓</span>
            <span class="trend-text">昨日 {{ yesterdayStats.fans > 0 ? '+' + yesterdayStats.fans : (yesterdayStats.fans < 0 ? yesterdayStats.fans : '无变化') }}</span>
          </div>
        </div>

        <!-- 收藏数 -->
        <div class="data-box">
          <div class="data-label">收藏数</div>
          <div class="data-main">
            <span class="data-value">{{ achievement?.collectCount || 0 }}</span>
          </div>
          <div :class="['data-trend', yesterdayStats.collections > 0 ? 'up' : 'gray']">
            <span class="trend-icon" v-if="yesterdayStats.collections > 0">↑</span>
            <span class="trend-text">昨日 {{ yesterdayStats.collections > 0 ? '+' + yesterdayStats.collections : '无变化' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据趋势图表 - 改为左右并排 -->
    <!-- 数据趋势图表 - 改为左右并排 -->
    <div class="trend-section">
      <div class="trend-chart-wrapper" v-if="interactionTrend">
        <DataTrend 
          title="互动趋势" 
          :trends="interactionTrend" 
        />
      </div>
      <div class="trend-chart-wrapper" v-if="fansGrowthTrend">
        <DataTrend 
          title="粉丝增长趋势" 
          :trends="[fansGrowthTrend]" 
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="BasicData">
import { ref, onMounted, computed } from 'vue';
import { Contact, Building2, Leaf, Box } from 'lucide-vue-next';
import DataTrend from './DataTrend.vue';
import { getUserInfo, getUserAchievement } from '@/api/userInfo/homePage';
import { getInteractionTrend, getFansGrowthTrend } from '@/api/userInfo/creatorCenter';
import type { UserInfo, UserAchievement, ApiResponse, Trend } from '@/types';

const userInfo = ref<UserInfo | null>(null);
const achievement = ref<UserAchievement | null>(null);
const interactionTrend = ref<Trend[] | null>(null);
const fansGrowthTrend = ref<Trend | null>(null);
const userId = Number(localStorage.getItem('userId')) || 1;

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0';
};

const fetchData = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  
  const startDate = sevenDaysAgo.toISOString().split('T')[0]!;
  const endDate = now.toISOString().split('T')[0]!;

  try {
    const [infoRes, achievementRes, interactionRes, fansRes] = await Promise.all([
      getUserInfo(userId) as unknown as Promise<ApiResponse<UserInfo>>,
      getUserAchievement(userId) as unknown as Promise<ApiResponse<UserAchievement>>,
      getInteractionTrend({ userId, startDate, endDate }) as unknown as Promise<ApiResponse<Trend[]>>,
      getFansGrowthTrend({ userId, startDate, endDate }) as unknown as Promise<ApiResponse<Trend>>
    ]);

    if (infoRes.code === 200 && infoRes.data) {
      userInfo.value = infoRes.data;
    }
    if (achievementRes.code === 200 && achievementRes.data) {
      achievement.value = achievementRes.data;
    }
    if (interactionRes.code === 200 && interactionRes.data) {
      // 映射类型名称为友好名称
      const typeMap: Record<string, string> = {
        'like': '被点赞',
        'collect': '被收藏',
        'comment': '被评论'
      };
      interactionRes.data.forEach(item => {
        item.type = typeMap[item.type] || item.type;
      });
      interactionTrend.value = interactionRes.data;
    }
    if (fansRes.code === 200 && fansRes.data) {
      const fansData = fansRes.data as Trend;
      fansData.type = '关注人数';
      fansGrowthTrend.value = fansData;
    }
  } catch (error) {
    console.error('Failed to fetch basic data:', error);
  }
};

const yesterdayStats = computed(() => {
  const stats = {
    visits: 0,
    income: 0,
    fans: 0,
    collections: 0
  };

  // 辅助函数：从 contentTrends 中获取最后一天的 count（假设最后一天是最新数据）
  const getLastCount = (trend: Trend | undefined | null) => {
    if (!trend || !trend.contentTrends || trend.contentTrends.length === 0) return 0;
    const lastItem = trend.contentTrends[trend.contentTrends.length - 1];
    return lastItem ? lastItem.count : 0;
  };

  // 辅助函数：获取增长量（今天 - 昨天）
  const getGrowthCount = (trend: Trend | undefined | null) => {
    if (!trend || !trend.contentTrends || trend.contentTrends.length === 0) return 0;
    if (trend.contentTrends.length === 1) return trend.contentTrends[0]?.count || 0;
    const lastItem = trend.contentTrends[trend.contentTrends.length - 1];
    const secondLastItem = trend.contentTrends[trend.contentTrends.length - 2];
    return (lastItem?.count || 0) - (secondLastItem?.count || 0);
  };

  // 粉丝变化
  stats.fans = getGrowthCount(fansGrowthTrend.value);

  // 收藏变化 (从 interactionTrend 中筛选类型为 '被收藏' 的)
  const collectTrend = interactionTrend.value?.find(t => t.type === '被收藏');
  stats.collections = getLastCount(collectTrend);

  // 目前接口没有阅读量和收益的趋势点，默认返回 0
  return stats;
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.basic-data-container {
  width: 100%;
}

.card {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
}

/* 用户信息卡片样式 */
.user-info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.level-tag {
  background: linear-gradient(135deg, #ff9a9e 0%, #ff6a88 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.stats-row {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.user-actions {
  display: flex;
  gap: 16px;
}

.icon-item {
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-item:hover {
  color: #1a1a1a;
}

/* 数据概览卡片样式 */
.data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}

.data-box {
  padding: 0 24px;
  position: relative;
}

.data-box:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background-color: #f0f0f0;
}

.data-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.data-main {
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.data-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.currency {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.trend-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 20px;
}

.trend-chart-wrapper {
  min-width: 0; /* 确保 grid 子项不会撑开 */
}

.data-trend {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.data-trend.up {
  color: #f56c6c;
}

.data-trend.down {
  color: #67c23a;
}

.data-trend.gray {
  color: #999;
}

.trend-icon {
  font-weight: bold;
}
</style>
