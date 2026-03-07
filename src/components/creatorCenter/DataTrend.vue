<template>
  <div class="data-trend-container">
    <div class="chart-header" v-if="title">
      <h3 class="chart-title">{{ title }}</h3>
    </div>
    <div ref="chartRef" class="chart-body" v-show="hasData"></div>
    <div class="no-data" v-if="!hasData">
      <div class="no-data-content">
        <span>暂无数据趋势</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="DataTrend">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { Trend } from '@/types';

const props = defineProps<{
  trends: Trend[];
  title?: string;
}>();

const hasData = computed(() => {
  return props.trends && props.trends.length > 0 && props.trends.some(trend => trend.contentTrends && trend.contentTrends.length > 0);
});

const chartRef = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

const initChart = async () => {
  if (!chartRef.value || !hasData.value) return;
  
  // 确保 DOM 已经渲染并具有尺寸
  await nextTick();
  
  if (!chartRef.value || chartRef.value.clientWidth === 0) {
    // 如果还是 0，稍等一下再试（通常 nextTick 够了，但 ECharts 有时比较挑剔）
    setTimeout(() => {
      if (chartRef.value && !myChart) {
        myChart = echarts.init(chartRef.value);
        updateChartOptions();
      }
    }, 100);
    return;
  }

  if (myChart) {
    myChart.dispose();
  }
  myChart = echarts.init(chartRef.value);
  updateChartOptions();
};

const updateChartOptions = () => {
  if (!myChart || !hasData.value) return;

  // 找一个有数据的趋势集来提取日期
  const trendWithData = props.trends.find(t => t.contentTrends && t.contentTrends.length > 0);
  const dates = trendWithData ? trendWithData.contentTrends.map(item => item.date) : [];

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      extraCssText: 'box-shadow: 0 0 10px rgba(0,0,0,0.1)'
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemGap: 24,
      textStyle: {
        color: '#666',
        fontSize: 13
      },
    //   小球向上移动
        itemHeight: 12,
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#eee'
        }
      },
      axisLabel: {
        color: '#999',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#f5f5f5',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#999',
        fontSize: 12
      }
    },
    series: props.trends
      .filter(t => t.contentTrends && t.contentTrends.length > 0)
      .map(trend => ({
        name: trend.type,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 4
          }
        },
        data: trend.contentTrends.map(item => item.count)
      }))
  };

  myChart.setOption(option, true);
};

const handleResize = () => {
  myChart?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
});

// 监听 trends 变化实时更新图表
watch(() => props.trends, () => {
  updateChartOptions();
}, { deep: true });
</script>

<style scoped>
.data-trend-container {
  width: 100%;
  height: 400px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart-body {
  width: 100%;
  height: calc(100% - 40px);
}

.no-data {
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-radius: 4px;
}

.no-data-content {
  color: #999;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>