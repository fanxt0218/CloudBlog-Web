<template>
    <div class="achievement-card">
        <h3 class="card-title">个人成就</h3>
        <ul class="achievement-list">
            <li class="achievement-item">
                <img class="icon" src="../../../../public/assests/icon/like.png" alt="like"/>
                <span>获得 {{achievementData?.likeCount}} 次点赞</span>
            </li>
            <li class="achievement-item">
                <img class="icon" src="../../../../public/assests/icon/comment.png" alt="comment"/>
                <span>内容获得 {{achievementData?.commentCount}} 次评论</span>
            </li>
            <li class="achievement-item">
                <img class="icon" src="../../../../public/assests/icon/collect.png" alt="collect"/>
                <span>获得 {{achievementData?.collectCount}} 次收藏</span>
            </li>
            <li class="achievement-item">
                <img class="icon" src="../../../../public/assests/icon/codeShare.png" alt="share"/>
                <span>代码片获得 {{achievementData?.codeShareCount || 0}} 次分享</span>
            </li>
            <li class="achievement-item">
                <img class="icon" src="../../../../public/assests/icon/rank.png" alt="rank"/>
                <span>博客总排名 {{achievementData?.rank || 0}} 名</span>
            </li>
            <li class="achievement-item creation">
                <img class="icon journey" src="../../../../public/assests/icon/journey.png" alt="journey"/>
                <span style="font-size: 16px; font-weight: 370;">创作历程</span>
            </li>
            <div class="creation-detail">
                <div class="year-blocks">
                    <div 
                        v-for="(item, index) in achievementData?.creativeProcessList" 
                        :key="item.year"
                        class="year-block"
                        :style="{ backgroundColor: getYearBlockColor(index) }"
                    >
                        <div class="post-count">{{item.postCount}}篇</div>
                        <div class="year-text">{{item.year}}年</div>
                    </div>
                </div>
            </div>
        </ul>
    </div>
</template>
<script setup lang="ts" name="OtherUserAchievement">
import { reactive, ref } from 'vue';
import { onMounted } from 'vue';
import { getUserAchievement } from '@/api/userInfo/homePage';
import type { UserAchievement } from '@/types/index';

const props = defineProps<{ userId: number }>();
const userId = props.userId;

let achievementData = ref<UserAchievement|null>(null);

// 根据索引获取不同的颜色
const getYearBlockColor = (index: number) => {
    const colors = ['#e5e7eb'];
    return colors[index % colors.length];
};

onMounted(() => {
    getUserAchievement(userId).then((res) => {
        achievementData.value = res.data;
    });
});
</script>
<style scoped>
/* 核心：移除固定宽度，改为100%继承父容器宽度，同时限制最大宽度避免过宽 */
.achievement-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.4rem; /* 原6px */
    padding: 1rem; /* 原16px，用rem减少冗余内边距 */
    width: 99%; /* 关键：填满父容器（.left-section）的宽度 */
    min-height: auto; /* 移除固定min-height，由内容撑开高度 */
    box-sizing: border-box; /* 确保padding不增加总宽度 */
}

/* 标题样式：用相对单位，减少底部边框间距 */
.card-title {
    font-size: 1.2rem; /* 原18px */
    font-weight: 450;
    margin-top: 0;
    padding-bottom: 0.5rem; /* 原8px */
    border-bottom: 1px solid #e5e7eb;
}

.achievement-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* 列表项：减少间距，文字用相对单位 */
.achievement-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem; /* 原12px，减少项间距 */
    font-weight: 400;
    font-size: 0.9rem; /* 原13px */
}

.achievement-item:last-child {
    margin-bottom: 0;
}

/* 图标：用相对尺寸，减少与文字的间距 */
.icon {
    display: inline-block;
    width: 1.7rem; /* 原25px */
    height: 1.7rem; /* 原25px */
    margin-right: 0.5rem; /* 原8px，减少图标右间距 */
    border-radius: 0.3rem; /* 原4px */
    object-fit: contain; /* 确保图标不变形 */
}

.journey {
    height: 100%;
}

/* 创作历程项：减少顶部间距 */
.creation {
    margin-top: 1rem; /* 原16px */
}

.creation-detail {
    margin-top: 0.5rem; /* 原8px */
    padding-top: 0.5rem; /* 原8px */
    border-top: 1px solid #e5e7eb;
}

/* 年份块容器：用相对间距 */
.year-blocks {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem; /* 原6px */
    margin-bottom: -0.6rem;
}

/* 年份块：移除固定宽高，用相对尺寸 */
.year-block {
    width: 70%; /* 填满网格列宽 */
    height: 70%;
    padding: 0.4rem; /* 原6px */
    border-radius: 0.4rem; /* 原6px */
    text-align: center;
    color: rgb(0, 0, 0);
    font-size: 0.8rem; /* 原11px */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1 / 1.1; /* 固定宽高比，替代固定height */
}

.post-count {
    font-weight: bold;
    margin-bottom: 0.15rem; /* 原2px */
    cursor: pointer;
}

.post-count:hover {
    color: rgb(233, 55, 24);
}

.year-text {
    font-size: 0.7rem; /* 原10px */
    opacity: 0.9;
}
</style>