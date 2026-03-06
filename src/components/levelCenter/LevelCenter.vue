<template>
  <div class="level-center">
    <!-- 等级柱状图 -->
    <div class="chart-section">
      <div ref="chartRef" class="chart-container"></div>
      <!-- 悬浮头像层 -->
      <div 
        v-if="userLevelInfo"
        class="floating-avatar"
        :style="avatarStyle"
      >
        <img :src="`/api${userLevelInfo?.image || '/profile/avatar.jpg'}`" alt="用户头像" />
      </div>
    </div>

    <!-- 用户信息部分 -->
    <div class="user-section">
      <div class="user-info">
        <div class="user-avatar">
          <img :src="`/api${userLevelInfo?.image || '/profile/avatar.jpg'}`" alt="用户头像" />
        </div>
        <span class="user-name">{{ userLevelInfo?.name || '用户名' }}</span>
        <div class="level-intro">
            <span class="current-level">LV.{{ userLevelInfo?.level }}</span>
            <div v-if="userLevelInfo?.level && userLevelInfo?.level < 10" class="intro">距离下一等级还需
                <span class="intro-number">{{ (userLevelInfo?.nextLevelThreshold || 0) - (userLevelInfo?.exp || 0) }}</span>
                经验
            </div>
            <div v-else class="intro">您已升级至最高等级!</div>
        </div>
      </div>

      <!-- 经验条 -->
      <div class="progress-container">
        <img 
          :src="`../../../public/assests/icon/level${userLevelInfo?.level}.png`"
          class="level-icon"
        />
        <el-progress
          :percentage="percentage"
          :color="customColor"
          :stroke-width="4"
          :show-text="false"
          style="flex:1;"
        />
        <div class="exp-text">{{ userLevelInfo?.exp }}</div>
      </div>
    </div>

    <!-- 等级规则 -->
    <div class="level-rules">
      <div class="rules-title">博客等级规则</div>
      <ul class="rules-list">
        <li v-for="rule in levels" :key="rule.level">
          <span class="rule-level">LV {{ rule.level }}：</span>
          <span v-if="rule.level in [1,2,3,4,5,6,7,8,9]" class="rule-range">{{ rule.expThreshold }}~{{ rule.expThreshold + 999 }}</span>
          <span v-else-if="rule.level == 9" class="rule-range">{{ rule.expThreshold }}~{{ rule.expThreshold + 1999 }}</span>          
          <span v-else class="rule-range">>={{ rule.expThreshold }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from "vue";
import * as echarts from "echarts";
import { getUserLevelInfo, getLevelList } from "@/api/userInfo/levelCenter";
import type { UserLevelInfo, Levels } from "@/types/index";

const chartRef = ref<HTMLElement | null>(null);
const userLevelInfo = ref<UserLevelInfo | null>(null);
const avatarUrl = ref("");
const userLevel = ref<number>(1);
const levels = ref<Levels>([]);

const percentage = ref(0);
const customColor = ref("#f56c6c");

const avatarStyle = ref({ left: '50%', bottom: '100px' });

onMounted(async () => {
  if (!localStorage.getItem('userId') || localStorage.getItem('userId') == '0') {
    return
  }
  const res = await getUserLevelInfo(Number(localStorage.getItem('userId')));
  userLevelInfo.value = res.data;
  avatarUrl.value = `/api${res.data.image}`;
  userLevel.value = res.data.level;

  // 计算进度条百分比
  const exp = res.data.exp;
  const threshold = res.data.nextLevelThreshold;
  percentage.value = Math.min((exp -(threshold-1000)) / 1000 * 100, 100);

  renderChart();

  // 获取等级列表
  const levelRes = await getLevelList();
  levels.value = levelRes.data;
});

watch([userLevel, avatarUrl], () => renderChart());

function renderChart() {
  if (!chartRef.value) return;
  const chart = echarts.init(chartRef.value);

  const levels = Array.from({ length: 10 }, (_, i) => `Lv${i + 1}`);
  const values = levels.map((_, i) => i + 1);

  chart.setOption({
    grid: { left: 20, right: 20, bottom: 30, top: 30 },
    xAxis: {
      type: "category",
      data: levels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#666" },
    },
    yAxis: { show: false },
    series: [
      {
        type: "bar",
        data: values,
        barWidth: 20,
        itemStyle: {
          color: (params: any) => {
            const colorMap = [
              "#a8d08d", "#a8d08d", "#b7d27f", "#c4cf75",
              "#d0c86e", "#d9c167", "#e0b75e", "#e7ae54",
              "#eda448", "#f1a634"
            ];
            return colorMap[params.dataIndex];
          },
          borderRadius: [4, 4, 0, 0],
        },
      }
    ],
  });

  // === 计算当前等级柱的像素位置 ===
  nextTick(() => {
      const index = userLevel.value - 1;
    
      // 获取当前等级的柱子高度值
      const currentValue = index + 1;
    
      // 获取图表容器的位置信息
      const chartDom = chart.getDom();
      const chartRect = chartDom.getBoundingClientRect();
    
      // 计算柱子顶端相对于图表容器的y坐标
      // 注意：ECharts的坐标系中，y轴正方向是向上的，但浏览器的坐标系中，y轴正方向是向下的
      const yCoord = chart.convertToPixel({ yAxisIndex: 0 }, currentValue);
    
      // 计算头像应该距离柱子顶端的像素值
      const distanceFromTop = -5; // 这里设置为20px，可以根据需求调整
    
      // 计算头像的bottom值
      const bottomValue = chartRect.height - yCoord - distanceFromTop;
    
      // 获取x坐标
      const xCoord = chart.convertToPixel({ xAxisIndex: 0 }, index);
    
      // 设置头像位置
      avatarStyle.value = {
        left: `${xCoord}px`,
        bottom: `${bottomValue}px`,
      };
    });
}
</script>

<style scoped>
.level-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem; /* 控制各块间距 */
  width: 100%;
  max-width: 700px;
  /* margin: 1rem auto; */
  /* border: 1px solid #e5e7eb; */
  padding: 10px 10px;
}

/* 图表区域 */
.chart-section {
  position: relative;
  width: 100%;
  border-radius: 8px;
  margin-top: 2.5rem;
}

.chart-container {
  width: 100%;
  height: 200px;
}

/* 悬浮头像 */
.floating-avatar {
  position: absolute;
  bottom: 100px; /* 距离图底部的高度，稍后在 JS 中动态调整 */
  transform: translateX(-50%);
  transition: all 0.6s ease;
}

.floating-avatar img {
  /* 减小头像尺寸，从60px改为40px或50px */
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #fff;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

/* 用户信息区域 */
.user-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  /* border: 1px solid #e5e7eb; */
  /* 靠左 */
  padding: 10px 10px;
    border-top: 1px solid #e5e7eb;

}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.level-intro {
    display: flex;
    align-items: center;
    margin-left: -0.4rem;
}

.current-level {
    font-size: 14px;
    font-weight: 350;
    color: #db5719;
    border: 1px solid #db5719;
    padding: 0px 6px;
    border-radius: 6px;
}

.intro {
    font-size: 14px;
    font-weight: 350;
    color: #888888;
    margin-left: 0.5rem;
}

.intro-number {
    color: #000000;
}

/* 经验条部分 */
.progress-container {
  position: relative;
  margin-left: 1rem;
  width: 650px;
  display: flex;
  align-items: center;
}

.exp-text {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
  white-space: nowrap; /* 防止换行 */
}


/* 等级规则部分 */
.level-rules {
  text-align: left;
  font-size: 14px;
  line-height: 1.8;
  color: #444;
  width: 100%;
  padding-left: 1rem;
    margin-top: 7rem;

}

.rules-title {
  font-weight: 580;
  font-size: 16px;
  margin-bottom: 0.5rem;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0 1rem;
}

.rule-level {
  font-weight: 450;
  margin-right: 0.5rem;
}

.level-icon {
  width: 25px;
  height: 25px;
  margin-left: 6px;
  /* margin-bottom: 4px; */
  margin-right: 4px;
  cursor: pointer;
}
</style>
