<template>
    <div class="profile">
        <div class="head-info">
            <img :src="`/api${PersonalInfo?.image}`" alt="用户头像" class="avatar">
            <div class="meta-data">
                <div class="title-meta">
                    <span class="userName">{{ PersonalInfo?.userName }}</span>
                    <svg
                    v-if="PersonalInfo?.isVip === 1 || PersonalInfo?.isVip === 0"
                    class="vip-icon"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                      d="M941.127 431.9L806.66 170.175a37.002 37.002 0 0 0-32.911-20.091H252.053a36.998 36.998 0 0 0-32.825 19.927L83.219 431.506a37 37 0 0 0 6.084 42.645L484.97 887.919a37.001 37.001 0 0 0 26.716 11.428h0.025a37 37 0 0 0 26.707-11.393l396.506-413.539a36.996 36.996 0 0 0 6.203-42.515z m-210.42 41.652L538.634 673.876a37 37 0 0 1-26.707 11.393h-0.025a36.998 36.998 0 0 1-26.716-11.429L293.521 473.406c-14.123-14.769-13.599-38.19 1.17-52.313 14.769-14.124 38.19-13.599 52.313 1.17l164.96 172.507 165.33-172.432c14.142-14.75 37.565-15.242 52.314-1.1 14.749 14.142 15.242 37.564 1.099 52.314z"
                      :fill="PersonalInfo?.isVip === 1 ? 'red' : '#dbdbdb'"
                    ></path>
                    </svg>
                </div>
                <span class="blog-age">博龄{{ PersonalInfo?.blogAge }}年</span>
            </div>
        </div>
        <div class="basic-info">
            <div class="basic-info-title">基本信息</div>
            <div class="info-list">
                <div class="info-item">
                    <span>昵称</span>
                    <span>{{ PersonalInfo?.userName }}</span>
                </div>
                <div class="info-item">
                    <span>用户ID</span>
                    <span>{{ PersonalInfo?.userAccount }}</span>
                </div>
                <div class="info-item">
                    <span>性别</span>
                    <span>{{ PersonalInfo?.sex === 1 ? '男' : '女' }}</span>
                </div><div class="info-item">
                    <span>个人简介</span>
                    <span>{{ PersonalInfo?.introduction }}</span>
                </div>
                <div class="info-item">
                    <span>所在地区</span>
                    <span>{{ PersonalInfo?.region }}</span>
                </div>
                <div class="info-item">
                    <span>出生日期</span>
                    <span>{{ PersonalInfo?.birthDate }}</span>
                </div>
                <div class="info-item">
                    <span>职业</span>
                    <span>{{ PersonalInfo?.profession }}</span>
                </div>
            </div>
        </div>
        <div class="tag-info">
            <div class="tag-info-title">
                兴趣标签
                <span class="tip">
                    根据您的喜好标签，
                    <span class="cloud-blog">CloudBlog</span>
                    会调整对您的展示内容</span>
            </div>
            <div class="tag-group">
                <span class="tag-label">感兴趣:</span>
                <div class="tag-list">
                    <span v-for="(tag, index) in PersonalInfo?.tags" :key="tag.tagId" class="tag-item">
                        {{ tag.tagName }}
                        <!-- 叉号图标 -->
                        <svg
                          @click="removeTag(tag.tagId)"
                          class="remove-icon"
                          viewBox="0 0 1024 1024"
                          xmlns="http://www.w3.org/2000/svg"
                          :fill="'#999'"
                          width="14"
                          height="14"
                        >
                          <path d="M805.3 213.8c-12.4-12.4-32.5-12.4-44.9 0L512 424.2 263.6 175.8c-12.4-12.4-32.5-12.4-44.9 0-12.4 12.4-12.4 32.5 0 44.9L467.8 469.2 218.4 718.6c-12.4 12.4-12.4 32.5 0 44.9 12.4 12.4 32.5 12.4 44.9 0L512 514.2l248.4 249.4c12.4 12.4 32.5 12.4 44.9 0 12.4-12.4 12.4-32.5 0-44.9L556.2 469.2l249.4-249.4c12.4-12.4 12.4-32.5 0-44.9z"></path>
                        </svg>
                    </span>
                </div>
            </div>
            <div class="tag-class">
                <span class="tag-label">分类:</span>
                <div class="tag-class-list">
                    <span 
                        v-for="(tagClass, index) in tagClasses" 
                        :key="tagClass.id" 
                        class="tag-class-item"
                        :class="{'selected': tagClass.id === tagClassId}"
                        @click="tagClassChange(tagClass.id)"
                    >
                        {{ tagClass.className }}
                    </span>
                </div>
            </div>

            <!-- 系统标签 -->
            <div class="system-tag">
                <div class="system-tag-list">
                    <span 
                        v-for="(systemTag, index) in systemTags" 
                        :key="systemTag.id" 
                        class="tag-item"
                        @click="addTag(systemTag.id)"
                    >
                        {{ systemTag.tagName }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup name="Profile">
import {ref,onMounted} from 'vue';
import type {PersonalInfo, TagClasses, Tags} from '@/types/index'
import {getPersonalInfo, getTagClassList, removeInterestTag, addInterestTag} from '@/api/userInfo/personal'
import {getInterestTags} from '@/api/index/indexPage'
import {ElMessage} from 'element-plus'

let PersonalInfo = ref<PersonalInfo | null>(null);

let systemTags = ref<Tags | null>(null);

let tagClasses = ref<TagClasses | null>(null);

// 标签分类id
let tagClassId = ref(1);

/**
 * 移除标签
 */
const removeTag = async (index: number) => {
    const data = {
        userId:Number(localStorage.getItem('userId')),
        tagId:index
    }
    await removeInterestTag(data)
    getUserInfo(1)
}

/**
 * 添加标签
 */
const addTag = async(tagId: number) => {
    const data = {
        userId:Number(localStorage.getItem('userId')),
        tagId:tagId
    }
    // 判断是否已添加
    if (PersonalInfo.value?.tags?.some(tag => tag.tagId === tagId)) {
        ElMessage.warning('您已添加该标签')
        return
    }
    const res = await addInterestTag(data)
    getUserInfo(Number(localStorage.getItem('userId')))
    if (res.code == 200){
    ElMessage.success('添加成功')
    }
}

/**
 * 查询标签分类下的标签
 */
const tagClassChange = (id: number) => {
    if (id == tagClassId.value){
        return
    }
    tagClassId.value = id;
    getInterestTags(id).then(res=>{
        systemTags.value = res.data
    })
}

/**
 * 查询用户信息
 */
const getUserInfo = (userId: number) => {
    getPersonalInfo(userId).then(res => {
        PersonalInfo.value = res.data
    })
}



onMounted(() => {
    getPersonalInfo(Number(localStorage.getItem('userId'))).then(res => {
        PersonalInfo.value = res.data
    })

    getInterestTags(tagClassId.value).then(res=>{
        systemTags.value = res.data
    })

    getTagClassList().then(res => {
        tagClasses.value = res.data
    })
})
</script>
<style scoped>
.profile {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;

}

.head-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 15px;
}

.meta-data {
    display: flex;
    flex-direction: column;
}

.userName {
    font-size: 18px;
    font-weight: bold;
}

.blog-age {
    font-size: 14px;
    color: #666;
}

.basic-info-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-left: 1rem;
}

.info-item {
    display: flex;
    margin-bottom: 8px;
    gap: 15px;
    font-size: 15px;
}

.info-item span:first-child {
    width: 80px;
    color: #666;
}

.info-item span:last-child {
    flex: 1;
    color: #222222;
}

.vip-icon {
  width: 25px;
  height: 25px;
  cursor: default;
  transition: fill 0.3s ease;
  margin-top: -2px;
  margin-left: 0.3rem;
}

.title-meta {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.basic-info, tag-info {
    margin-top: 1.5rem;
}

.tag-info-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
    margin-top: 1rem;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
}

.tip {
    color: #919090;
    font-size: 12px;
    font-weight: 330;
    margin-left: 2.5rem;
}

.cloud-blog {
    font-weight: 400;
    color: #0732be;
    cursor: pointer;
}

.tag-group {
    margin-top: 1.5re;
    display: flex;
}

.tag-label {
    color: #666;
    margin-right: 10px;
    font-size: 15px;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: 0.2rem;
}

.tag-item {
    background-color: #f0f0f0;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 6px;
    cursor: pointer;
}

.tag-item:hover {
    background-color: #a7a7a7;
} 

.remove-icon {
    cursor: pointer;
    /* transition: fill 0.3s ease; */
    margin-bottom: -2px;
}

.remove-icon:hover {
    fill: #000000;
}

.tag-class {
    margin-top: 1rem;
    display: flex;
}

.tag-class-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: 1.2rem;
    /* 虚线边框 */
    border: 1px dashed #a7a7a7;
    padding: 4px 8px;
    border-radius: 4px;
}
.tag-class-item {
    cursor: pointer;
    color: #a7a7a7;
}

.tag-class-item:hover {
    color: #000000;
}

.system-tag {
    margin-top: 0.5rem;
    display: flex;
}

.system-tag-list{
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: 4.1rem;
    border-left: 1px solid #c4c2c2;
    padding-left: 0.2rem;
}

/* 当标签分类项被选中时，改变颜色 */
.selected {
    color: black;
}
</style>