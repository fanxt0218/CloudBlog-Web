<template>
    <div class="level-center-index">
        <LevelCenter></LevelCenter>
    </div>
</template>
<script lang="ts" setup name="LevelCenterIndex">
import LevelCenter from '@/components/levelCenter/LevelCenter.vue'
</script>
<style scoped>
.level-center-index {
    width: 80%;           /* 或固定宽度 800px，根据整体设计 */
    max-width: 1000px;
    margin: 1.5rem auto;
    display: flex;
    justify-content: center; /* 水平居中组件 */
    align-items: flex-start;  /* 保持内部顶对齐 */
}
</style>
