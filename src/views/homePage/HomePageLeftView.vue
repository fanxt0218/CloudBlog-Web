<template>
    <div class="home-page-left-view">
        <SideBar />
        <div class="hot-information">
            <HotInformation v-if="whichTagStore.whichTag !== 'news'"/>
        </div>
        <div class="divider" v-if="whichTagStore.whichTag !== 'news'"></div>
        <div class="extra-mess">
          <div class="concat-title">联系我们</div>
          <div class="work-time">
            <span>工作时间</span>
            <span>9:00 - 22:00</span>
          </div>
          <div class="concat-link">
            <span>邮箱</span>
            <a :href="`mailto:3515228784@QQ.com`" class="email-link">
              3515228784@QQ.com
            </a>
          </div>
          <span class="report" @click="handleFeedback">
            问题反馈
          </span>

        </div>
    </div>
</template>
<script setup lang="ts" name="HomePageLeftView">
import { onMounted } from 'vue'
import SideBar from '@/components/homePage/SideBar.vue'
import HotInformation from '@/components/homePage/HotInformation.vue'
import { useWhichTagStore } from '@/stores/indexWhichTag'

const whichTagStore = useWhichTagStore()

const handleFeedback = () => {
  window.open('/workOrder/submit', '_blank')
}

</script>
<style scoped>
.hot-information {
    margin-right: 7px;
}

.divider {
  height: 1px;
  background: #eee;
  margin: 12px 16px;
}

.extra-mess {
  /* margin-top: 15px; */
  /* max-width: 85%; */
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  padding: 10px;
}

.concat-title {
  /* display: flex; */
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 10px;
  color: #666666ac;
  font-size: 12px;
}

.work-time {
    display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 10px;
  color: #666666ac;
  font-size: 12px;
  gap: 5px;
}

.concat-link{
  align-items: center;
  /* justify-content: space-between; */
  margin-bottom: 8px;
  padding: 0 10px;
  color: #666666ac;
  font-size: 12px;
}

.email-link {
  text-decoration: none;
  margin-left: 5px;
  color: #666666ac;
  &:hover {
    color: #666666;
  }
}

.report {
  font-size: 12px;
  padding: 0 10px;
  cursor: pointer;
  color: #666666ac;
  &:hover {
    color: #666666;
  }
}
</style>