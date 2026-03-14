<template>
  <div class="user-card">
    <!-- 头像区域 -->
    <div class="avatar-area">
      <div class="avatar-placeholder">
        <img :src="user_avatar" class="user-avatar-image"></img>
      </div>
      <div class="blog-age">博龄 {{ blogAge }} 年</div>
    </div>

    <!-- 信息区域 -->
    <div class="info-area">
      <div class="name-line">
        <h1 class="username">{{ userName }}</h1>
        <img 
          :src="`../../../public/assests/icon/level${level}.png`"
          class="level-icon"
        />
      </div>
      <div class="stats">
        <span class="stat-item">
          <span class="stat-number">{{ visitCount }}</span>
          <span class="stat-text">总访问量</span>
        </span>
        <span class="stat-item">
          <span class="stat-number">{{ originalCount }}</span>
          <span class="stat-text">原创</span>
        </span>
        <span class="stat-item">
          <span class="stat-number">{{ fansCount }}</span>
          <span class="stat-text">粉丝</span>
        </span>
        <span class="stat-item">
          <span class="stat-number">{{ focusCount }}</span>
          <span class="stat-text">关注</span>
        </span>
      </div>
      <div class="meta-info">
        <span>IP属地: {{region}}</span>
        <span>加入CloudBlog时间:</span>
        <span style=" font-size: 1.1em; margin-left: -8px; margin-top: -1px;">{{ joinTime }}</span>
      </div>
      <p class="intro">个人简介：{{ introduction }}</p>
    </div>

    <!-- 操作区域 -->
    <div class="action-area">
      <!-- 关注按钮 -->
      <button @click="handleFocusUser(0)" class="edit-btn no-active" v-if="!isFocused">关注</button>
      <button @click="handleFocusUser(1)" class="edit-btn active" v-else>已关注</button>
      <!-- 私信按钮 -->
      <button @click="handlePrivateMessage" class="edit-btn">私信</button>
      
      <!-- 举报功能 -->
      <el-dropdown trigger="hover" placement="bottom-end">
        <span class="more-icon-wrapper">
          <MoreVertical :size="20" class="more-icon" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="reportDialogVisible = true">
              <span class="report-text">举报</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 举报弹窗 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="举报用户"
      width="500px"
      @closed="resetReportForm"
      append-to-body
    >
      <div class="report-container">
        <el-form label-position="top">
          <el-form-item label="举报原因" required>
            <el-input
              v-model="reportReason"
              type="textarea"
              :rows="4"
              placeholder="请详细描述举报原因（必填，限制255字符）..."
              maxlength="255"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="相关图片（可选）">
            <el-upload
              class="report-uploader"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              list-type="picture-card"
              :limit="1"
              :on-exceed="handleExceed"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传一张图片作为附件（可选）
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="danger" :loading="reportLoading" @click="handleReportSubmit">
            提交举报
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="OtherUserInfo">
import { ref } from 'vue';
import { onMounted } from 'vue';
import { getUserInfo } from '@/api/userInfo/homePage';
import { focusUser, getFocusStatus } from '@/api/userInfo/otherHomePage';
import { eventBus } from '@/utils/eventBus';
import { useUserHomeStore } from '@/stores/userHome';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useMessageStore } from '@/stores/messageStore';
import { MoreVertical } from 'lucide-vue-next';
import { Plus } from '@element-plus/icons-vue';
import { reportContent } from '@/api/index/workOrder';
import { uploadImage } from '@/api/create/index';

// 路由实例
const router = useRouter();
// 自动选择聊天对象存储
const messageStore = useMessageStore();

// defineProps<{ userId: number }>();
const props = defineProps<{ userId: number }>();
// 向父组件发送用户名
const emit = defineEmits(['sendUserName']);

const userId = props.userId;

let visitCount = ref();
let originalCount = ref(0);
let fansCount = ref(0);
let focusCount = ref(0);
let user_avatar = ref('');
let joinTime = ref('');
let userName = ref('');
let region = ref('');
let introduction = ref<string | null>('这个人很懒，什么都没有留下。');
let blogAge = ref(0);
let level = ref(1);

let isFocused = ref(false);

// 举报功能相关
const reportDialogVisible = ref(false);
const reportReason = ref('');
const reportLoading = ref(false);
const fileList = ref<any[]>([]);

/**
 * 处理文件变化
 */
const handleFileChange = (file: any) => {
  fileList.value = [file];
}

/**
 * 处理文件移除
 */
const handleFileRemove = () => {
  fileList.value = [];
}

/**
 * 处理文件超出限制
 */
const handleExceed = () => {
  ElMessage.warning('只能上传一张图片作为附件');
}

/**
 * 重置举报表单
 */
const resetReportForm = () => {
  reportReason.value = '';
  fileList.value = [];
}

/**
 * 提交举报
 */
const handleReportSubmit = async () => {
  if (!reportReason.value.trim()) {
    ElMessage.warning('请输入举报原因');
    return;
  }
  
  reportLoading.value = true;
  try {
    let filePath = '';
    
    // 如果有图片，先上传
    if (fileList.value.length > 0 && fileList.value[0].raw) {
      const formData = new FormData();
      formData.append('file', fileList.value[0].raw);
      const uploadRes = (await uploadImage(formData)) as any;
      if (uploadRes.code === 200) {
        filePath = uploadRes.data;
      } else {
        ElMessage.error(uploadRes.message || '图片上传失败');
        reportLoading.value = false;
        return;
      }
    }

    const res = (await reportContent({
      targetType: 3, // 目标类型：用户
      targetId: userId,
      reason: reportReason.value.trim(),
      filePath: filePath || undefined
    })) as any;

    if (res.code === 200) {
      ElMessage.success('举报成功，我们将尽快处理');
      reportDialogVisible.value = false;
    } else {
      ElMessage.error(res.message || '提交失败');
    }
  } catch (error) {
    console.error('Submit report error:', error);
    ElMessage.error('系统繁忙，请稍后再试');
  } finally {
    reportLoading.value = false;
  }
}

/**
 * 处理私信按钮点击
 */
const handlePrivateMessage = () => {
  // 设置目标用户ID到store
  messageStore.setTargetUserId(userId)
  // 跳转到消息中心
  router.push('/messageCenter/myMessage')
}

/**
 * 发送用户名到父组件
 */
const sendUserNameToParent = () => {
  emit('sendUserName', userName.value);
}

onMounted(async()=>{
    await getUserInfo(userId).then((res : any)=>{
        const response = res;
        console.log('发送了请求', response);
        visitCount.value = response.data.visits;
        originalCount.value = response.data.postCount;
        fansCount.value = response.data.fanCount;
        focusCount.value = response.data.focusCount;
        user_avatar.value = '/api' + response.data.image;
        joinTime.value = new Date(response.data.joinTime).toLocaleDateString();
        userName.value = response.data.userName;
        region.value = response.data.region;
        introduction.value = formatText(response.data.introduction);
        blogAge.value = response.data.blogAge;
        level.value = response.data.level;

        sendUserNameToParent();
    });

    useUserHomeStore().postCount = originalCount.value;

    handleGetFocusStatus();
})

/**
 * 关注操作
 */
function handleFocusUser(status:number) {
    console.log('当前用户id', Number(localStorage.getItem('userId')))
    console.log('被关注用户id', userId)
    focusUser({
        userId: Number(localStorage.getItem('userId')),
        focusUserId: userId,
        status: status,
        source: '用户主页'
    }).then((res : any)=>{
        const response = res;
        console.log('关注成功', response);
        if (status == 0 && response.code == 200) {
            ElMessage.success('关注成功');
        } else if (status == 1 && response.code == 200) {
            ElMessage.success('已取消关注');
        }
        eventBus.emit('updateFocusList');
        handleGetFocusStatus();
    });
}

/**
 * 获取关注状态
 */
function handleGetFocusStatus() {
    getFocusStatus({
        userId: Number(localStorage.getItem('userId')),
        focusUserId: userId,
    }).then((res : any)=>{
        const response = res;
        if (response.data) {
            isFocused.value = true;
        } else {
            isFocused.value = false;
        }
        console.log('关注状态', response);
    });
}


/**
 * 格式化文本简介，超过60字符添加省略号
 * @param text 
 */
function formatText(text:string | null) {
    // 如果超过60个字符，截断并添加省略号
    if (text && text.length > 60) {
        return text.slice(0, 60) + '...';
    }
    return text;
}

/**
 * 格式化访问量数字（1万以上显示为X.W格式）
 * @param count 原始访问量数字
 * @returns 格式化后的字符串
 */
const formatVisitCount = (count: number): string => {
  // 小于1万直接返回原数字
  if (count < 10000) {
    return count.toString();
  }
  
  // 1万及以上，计算并保留合适的小数位数
  const value = count / 10000;
  
  // 若为整数（如20000 → 2W），不保留小数
  if (value % 1 === 0) {
    return `${value.toFixed(0)} W`;
  }
  
  // 非整数（如22000 → 2.2W，23456 → 2.3W）保留一位小数
  return `${value.toFixed(1)} W`;
};
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: flex-start;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px; /* 缩减内边距 */
  gap: 12px; /* 缩减元素间距 */
}

.avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-placeholder {
  width: 80px; /* 缩小头像尺寸 */
  height: 80px; 
  border-radius: 50%;
  border: 4px solid #ffffff;
  margin-bottom: 6px; /* 缩减头像与文字间距 */
  overflow: hidden; /* 确保图片不会超出圆形边界 */
  display: flex; /* 使用flex布局确保图片居中 */
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5; /* 当图片未加载时显示的背景色 */
  transform: translateY(-22px);
}

/* 为头像图片添加样式 */
.user-avatar-image {
  width: 100%; /* 图片宽度充满容器 */
  height: 100%; /* 图片高度充满容器 */
  object-fit: cover; /* 保持图片比例并填充整个容器 */
  border-radius: 50%; /* 确保图片也是圆形的 */
}

.blog-age {
  background-color: #f3f4f6;
  padding: 2px 6px; /* 缩减内边距 */
  border-radius: 3px;
  font-size: 12px; /* 缩小字体 */
  transform: translateY(-20px);
}

.info-area {
  flex: 1;
}

.username {
  font-size: 24px; /* 缩小用户名字体 */
  margin: 0 0 8px 0; /* 缩减间距 */
  /* 粗细 */
  font-weight: 550;
}

.stats {
  display: flex;
  gap: 8px; /* 缩减统计项间距 */
  margin-bottom: 8px; /* 缩减间距 */
  font-size: 13px; /* 缩小字体 */
}

.stat-item {
  font-weight: 500;
  padding: 0 12px;
  position: relative;
  margin-left: -10px;
  cursor: pointer;
  transition: color 0.2s ease; /* 添加过渡效果，使颜色变化更平滑 */
}

.stat-item:not(:first-child) {
  border-left: 1px solid #e0dfdf;
}

.stat-item:hover {
  color: rgb(233, 55, 24);
}

/* 添加这段代码，确保鼠标悬浮时内部元素也改变颜色 */
.stat-item:hover .stat-number,
.stat-item:hover .stat-text {
  color: rgb(233, 55, 24);
}

/* 数字样式 */
.stat-number {
  font-size: 20px; /* 更大的字体 */
  font-weight: 600; /* 更粗的字重 */
  color: #111827; /* 更深的颜色 */
  line-height: 1.2;
  transition: color 0.1s ease; /* 添加过渡效果 */
}

/* 文本样式 */
.stat-text {
  /* font-size: 12px; 较小的字体 */
  color: #6b7280; /* 较浅的颜色 */
  margin-top: 2px;
  margin-left: 5px;
  margin-right: 5px;
  transition: color 0.1s ease; /* 添加过渡效果 */
}

.meta-info {
  display: flex;
  gap: 16px; /* 缩减元信息间距 */
  margin-bottom: 6px; /* 缩减间距 */
  font-size: 12px; /* 缩小字体 */
  color: #6b7280;
}

.intro {
  font-size: 13px; /* 调整简介字体 */
  color: #4b5563;
  line-height: 1.4; /* 缩减行高 */
  margin: 0;
}

.edit-btn {
  padding: 4px 10px; /* 缩减按钮内边距 */
  border: 0.8px solid #5a5a5a;
  color: #5a5a5a;
  border-radius: 16px;
  background-color: #fff;
  cursor: pointer;
  font-size: 13px; /* 缩小按钮字体 */
}

.edit-btn:hover {
  background-color: #f9fafb;
}

.active {
    /* background-color: rgb(243, 183, 55); */
    color: #b4b4b4;
    border-color: rgb(188, 188, 188);
}

.action-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.more-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.more-icon-wrapper:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.report-text {
  color: #ef4444;
}

.report-container {
  padding: 0 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

.no-active {
    color: #f86f14;
    border-color: #f86f14;
}

.name-line {
  display: flex;
  align-items: center;
}

.level-icon {
  width: 25px;
  height: 25px;
  margin-left: 6px;
  margin-bottom: 4px;
  cursor: pointer;
}
</style>