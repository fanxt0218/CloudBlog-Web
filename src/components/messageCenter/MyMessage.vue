<template>
  <div class="my-message">
    <!-- 左侧联系人/消息列表 -->
    <div class="chat-person-list">
      <div
        v-for="(person, index) in chatPersons"
        :key="person.userId"
        class="chat-item"
        :class="{ active: activeIndex === index }"
        @click="selectChat(index)"
      >
        <img :src="`/api${person.userImage}`" alt="头像" class="avatar" />
        <div class="chat-info">
          <div class="chat-top">
            <span class="chat-name">{{ formatNickname(person.userName) }}</span>
            <span class="relation-tip" v-if="person.relationship"
                :class="{
                    'tip-official': person.relationship === '官方',
                    'tip-stranger': person.relationship === '陌生人',
                    'tip-friend': person.relationship === '好友',
                    'tip-focus': person.relationship === '已关注',
                    'tip-fan': person.relationship === '粉丝',
                    'tip-self': person.relationship === '自己'
                }">{{ person.relationship }}</span>
            <span class="chat-time">{{ formatTime(person.lastMessageTime) }}</span>
          </div>
          <div class="chat-bottom">
            <span class="chat-message">{{ person.lastMessage }}</span>
            <span v-if="person.unreadCount > 0" class="unread">{{ person.unreadCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧消息内容区 -->
    <div class="message-content">
      <div v-if="activeIndex === null" class="empty-tip">
        您还未选中或者发起聊天，快去跟好友聊一聊吧
      </div>
      <div v-else class="chat-window">
        <!-- 聊天头部（对方信息） -->
        <div class="chat-header">
          <img 
            v-if="getOtherParticipant()" 
            :src="`/api${getOtherParticipant()?.userImage}`" 
            alt="对方头像" 
            class="chat-header-avatar" 
            @error="handleAvatarError"
            @click="jumpToHome(getOtherParticipant()?.userId as number)"
          />
          <div class="chat-header-info">
            <div class="chat-header-name">{{ chatPersons[activeIndex]?.userName }}</div>
            <div v-if="userId != chatPersons[activeIndex]?.userId " class="chat-header-status" :class="{'online': onlineStatus == '在线', 'offline': onlineStatus == '离线'}">{{ onlineStatus }}</div>
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-body" ref="chatBodyRef">
          <div v-if="!chatDetail" class="loading-tip">加载聊天记录中...</div>
          <div v-else>
            <!-- 按日期分组显示消息 -->
            <div v-for="(group, dateKey) in groupedMessages" :key="dateKey">
                <!-- 日期分割线 -->
                <div class="date-divider">
                  <span class="date-text">{{ formatDateDivider(dateKey, group) }}</span>
                </div>

              <!-- 该日期下的所有消息 -->
              <div 
                v-for="(msg, index) in group" 
                :key="msg.messageId || index" 
                :class="['chat-message-item', isSelfMessage(msg) ? 'self-message' : 'other-message']"
              >
                <template v-if="!isSelfMessage(msg)">
                  <!-- 对方头像 -->
                  <img 
                    v-if="getOtherParticipant()"
                    :src="`/api${getOtherParticipant()?.userImage}`" 
                    alt="对方头像" 
                    class="message-avatar" 
                    @error="handleAvatarError"
                    @click="jumpToHome(getOtherParticipant()?.userId as number)"
                  />
                </template>
                <template v-if="isSelfMessage(msg) && getSelfParticipant()">
                  <!-- 自己头像 -->
                  <img 
                    :src="`/api${getSelfParticipant()?.userImage}`" 
                    alt="自己头像" 
                    class="message-avatar" 
                    @error="handleAvatarError"
                  />
                </template>

                <div class="message-content-wrapper">
                  <!-- 文本消息显示气泡 -->
                  <div 
                    v-if="msg.contentType === 3" 
                    class="message-bubble" 
                    :class="isSelfMessage(msg) ? 'self-bubble' : 'other-bubble'"
                  >
                    <!-- 文本消息 -->
                    <span class="message-text">{{ msg.content }}</span>
                  </div>

                  <!-- 图片消息直接显示，不使用气泡 -->
                  <template v-else-if="msg.contentType === 4">
                    <img 
                      :src="`/api${msg.content}`" 
                      alt="聊天图片" 
                      class="message-image clickable-media" 
                      @error="handleImageError"
                      @load="handleMediaLoaded"
                      @click="showMediaModal(`/api${msg.content}`, 'image')"
                      style="cursor: pointer;"
                    />
                  </template>

                  <!-- 视频消息 -->
                  <template v-else-if="msg.contentType === 6">
                    <div class="video-container" style="cursor: pointer;" @click="showMediaModal(`/api${msg.content}`, 'video')">
                      <video 
                        :src="`/api${msg.content}`" 
                        alt="聊天视频" 
                        class="message-image"
                        @error="handleImageError"
                        @loadedmetadata="handleMediaLoaded"
                        preload="metadata"
                        style="pointer-events: none;"
                      />
                      <div class="video-overlay">
                        <span class="play-icon">▶</span>
                      </div>
                    </div>
                  </template>

                  <!-- 其他消息类型 -->
                  <div v-else
                    class="message-bubble" 
                    :class="isSelfMessage(msg) ? 'self-bubble' : 'other-bubble'"
                    >
                    <span class="unsupported-message">不支持的消息类型</span>
                  </div>
                </div>

                <div v-if="isSelfMessage(msg)" class="message-status">
                  <!-- 发送中 -->
                  <div v-if="sendingMessages.has(msg.messageId)" class="loading-spinner"></div>
                                
                  <!-- 发送失败 -->
                  <div 
                    v-else-if="failedMessages.has(msg.messageId)" 
                    class="retry-icon"
                    title="发送失败，点击重试"
                    @click="retrySend(msg)"
                  >⟳</div>
                </div>
            
                <!-- 消息时间（已移除独立元素显示） -->
              </div>
            </div>
          </div>
        </div>

        <!-- 表情弹窗 -->
        <EmojiWindow
          v-if="isEmojiWindowVisible"
          @emoji-selected="insertEmoji"
          class="emoji-windows"
        />

        <!-- 消息输入区域 -->
        <div class="chat-footer">
          <div class="message-toolbar">
            <div class="toolbar-btn" @click="openEmojiWindow" title="表情">
              <svg t="1763885040176" class="toolbar-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3458" width="20" height="20">
                <path d="M964.296223 320.242651c-24.661679-58.328453-59.975976-110.701265-104.950284-155.675572s-97.347119-80.288604-155.675572-104.960517c-60.395532-25.541723-124.536364-38.496779-190.652178-38.496779s-130.256646 12.955056-190.652178 38.496779c-58.328453 24.671912-110.701265 59.986209-155.675572 104.960517s-80.288604 97.347119-104.950284 155.675572c-25.551956 60.395532-38.496779 124.536364-38.496779 190.652178 0 66.10558 12.944823 130.256646 38.496779 190.641945 24.661679 58.328453 59.975976 110.701265 104.950284 155.675572s97.347119 80.288604 155.675572 104.950284c60.395532 25.551956 124.536364 38.496779 190.652178 38.496779s130.256646-12.944823 190.652178-38.496779c58.328453-24.661679 110.701265-59.975976 155.675572-104.950284s80.288604-97.347119 104.950284-155.675572c25.551956-60.385299 38.507012-124.536364 38.507012-190.641945C1002.803235 444.779016 989.848179 380.638183 964.296223 320.242651zM926.597623 685.593663c-22.604834 53.447283-54.972009 101.450577-96.190783 142.679583-41.229007 41.218774-89.232301 73.585949-142.679583 96.190783-55.330166 23.403013-114.108874 35.263132-174.709067 35.263132-60.600193 0-119.378901-11.860119-174.709067-35.263132-53.447283-22.604834-101.450577-54.972009-142.679583-96.190783-41.218774-41.229007-73.585949-89.232301-96.190783-142.679583-23.403013-55.319933-35.263132-114.098641-35.263132-174.698834 0-60.610426 11.860119-119.389134 35.263132-174.709067 22.604834-53.447283 54.972009-101.450577 96.201016-142.679583 41.218774-41.229007 89.222067-73.596182 142.66935-96.201016 55.330166-23.39278 114.108874-35.263132 174.709067-35.263132s119.378901 11.870352 174.709067 35.263132c53.447283 22.604834 101.450577 54.972009 142.679583 96.201016 41.218774 41.229007 73.585949 89.232301 96.190783 142.679583 23.403013 55.319933 35.273365 114.098641 35.273365 174.709067C961.870987 571.495022 950.000636 630.27373 926.597623 685.593663z" p-id="3459" fill="#515151"></path><path d="M794.939047 645.214001c-1.115404 1.565658-27.792996 38.568411-75.509764 75.683726-28.110221 21.868053-57.827033 39.315424-88.301092 51.861158-38.455847 15.84078-78.190827 23.863501-118.110001 23.863501s-79.654154-8.022721-118.110001-23.863501c-30.474059-12.545734-60.190871-29.993105-88.301092-51.861158-47.716768-37.115316-74.394361-74.118068-75.509764-75.683726-6.569626-9.18929-4.441149-21.980617 4.758374-28.550243 9.18929-6.559393 21.960151-4.441149 28.54001 4.737908 0.112564 0.163729 6.364965 8.779967 17.999956 21.540595 11.624758 12.760628 28.652574 29.655414 50.326199 46.396703 25.111934 19.412119 51.513234 34.833343 78.456886 45.854351 33.267685 13.599739 67.527976 20.496823 101.839433 20.496823s68.571748-6.897084 101.839433-20.496823c26.943652-11.021008 53.344952-26.442232 78.467119-45.854351 43.337018-33.482579 68.080561-67.599607 68.326155-67.937299 6.579859-9.168824 19.360953-11.276834 28.54001-4.707209C799.369963 623.274316 801.49844 636.024711 794.939047 645.214001z" p-id="3460" fill="#515151"></path><path d="M737.449705 449.680653c0 33.799804-27.424606 61.214177-61.203944 61.214177s-61.203944-27.414373-61.203944-61.214177c0-33.810037 27.424606-61.214177 61.203944-61.214177S737.449705 415.870616 737.449705 449.680653z" p-id="3461" fill="#515151"></path><path d="M410.974096 449.680653c0 33.799804-27.424606 61.214177-61.203944 61.214177s-61.203944-27.414373-61.203944-61.214177c0-33.810037 27.424606-61.214177 61.203944-61.214177S410.974096 415.870616 410.974096 449.680653z" p-id="3462" fill="#515151">
                </path>
              </svg>
            </div>
            <div class="toolbar-btn" @click="triggerImageUpload" title="图片">
              <svg t="1763885346857" class="toolbar-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8515" width="20" height="20">
                <path d="M853.333333 955.733333H170.666667c-66.030933 0-102.4-36.369067-102.4-102.4V170.666667c0-66.030933 36.369067-102.4 102.4-102.4h682.666666c66.030933 0 102.4 36.369067 102.4 102.4v682.666666c0 66.030933-36.369067 102.4-102.4 102.4zM102.4 775.0656V853.333333c0 47.223467 21.0432 68.266667 68.266667 68.266667h682.666666c47.223467 0 68.266667-21.0432 68.266667-68.266667v-78.267733l-324.266667-324.266667L450.798933 597.333333l73.2672 73.2672a17.0496 17.0496 0 1 1-24.132266 24.132267L341.333333 536.132267l-238.933333 238.933333zM597.333333 409.6c4.369067 0 8.738133 1.672533 12.066134 5.000533L921.6 726.801067V170.666667c0-47.223467-21.0432-68.266667-68.266667-68.266667H170.666667c-47.223467 0-68.266667 21.0432-68.266667 68.266667v556.1344l226.8672-226.8672a17.0496 17.0496 0 0 1 24.132267 0L426.666667 573.201067l158.600533-158.600534A17.015467 17.015467 0 0 1 597.333333 409.6z m-256-51.2c-27.904 0-52.343467-10.2912-72.6528-30.600533C248.9344 308.0704 238.933333 283.921067 238.933333 256c0-27.8016 9.949867-52.1728 29.5424-72.448C289.160533 163.549867 313.531733 153.6 341.333333 153.6c27.921067 0 52.0704 10.001067 71.816534 29.7472C433.442133 203.656533 443.733333 228.096 443.733333 256c0 28.023467-10.359467 52.241067-30.805333 72.004267C393.5744 348.040533 369.3568 358.4 341.333333 358.4z m0-170.666667c-18.8928 0-34.850133 6.519467-48.708266 19.950934C279.586133 221.149867 273.066667 237.1072 273.066667 256c0 18.7904 6.4512 34.389333 19.746133 47.650133C306.688 317.525333 322.542933 324.266667 341.333333 324.266667c18.670933 0 34.184533-6.673067 47.4624-20.394667C402.926933 290.184533 409.6 274.670933 409.6 256c0-18.7904-6.741333-34.645333-20.599467-48.520533C375.722667 194.184533 360.123733 187.733333 341.333333 187.733333z" p-id="8516" fill="#515151">
                </path>
              </svg>
            </div>
            <div class="toolbar-btn" @click="triggerFileUpload" title="文件">
              <svg t="1763885429016" class="toolbar-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10665" width="21" height="21">
                <path d="M512 942C274.9 942 82 749.11 82 512 82 274.9 274.9 82 512 82c237.11 0 430 192.9 430 430 0 237.11-192.89 430-430 430z m0-800c-204.02 0-370 165.98-370 370s165.98 370 370 370 370-165.98 370-370-165.98-370-370-370z" p-id="10666" fill="#515151"></path><path d="M512 768.27c-16.57 0-30-13.44-30-30V285.73c0-16.57 13.43-30 30-30s30 13.43 30 30v452.54c0 16.56-13.43 30-30 30z" p-id="10667" fill="#515151"></path><path d="M738.27 542H285.73c-16.57 0-30-13.43-30-30s13.43-30 30-30h452.54c16.56 0 30 13.43 30 30s-13.44 30-30 30z" p-id="10668" fill="#515151">
              </path>
            </svg>
            </div>
          </div>
          <div class="message-area">
            <textarea 
              v-model="inputMsg" 
              class="message-input" 
              placeholder="输入消息内容..."
              @keydown.enter.prevent="sendMessage(3, null)"
              :rows="1"
            ></textarea>
            <button class="send-btn" @click="sendMessage(3, null)" :disabled="!inputMsg.trim()">发送</button>
          </div>
        </div>

        <!-- 添加隐藏的文件输入框 -->
        <input
          ref="imageInput"
          type="file"
          style="display: none"
          accept="image/jpeg, image/png, image/gif, image/webp"
          @change="handleImageFileChange"
        />

        <input
          ref="fileInput"
          type="file"
          style="display: none"
          accept="."
          @change="handleFileChange"
        />
      </div>
    </div>
  </div>
  <div v-if="mediaModalVisible" class="media-modal" @click="closeMediaModal">
    <div class="media-modal-content" @click.stop>
      <button class="media-modal-close" @click="closeMediaModal">×</button>

      <div v-if="currentMediaType === 'image'" class="media-preview-image-container">
        <img :src="currentMediaUrl" alt="预览图片" class="media-preview-image" />
      </div>

      <div v-else-if="currentMediaType === 'video'" class="media-preview-video-container">
        <video 
          :src="currentMediaUrl" 
          controls 
          autoplay 
          class="media-preview-video"
          @error="handleVideoPreviewError"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="MyMessage">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import type { ChatPersons, ChatDetail, ChatMessage, ChatParticipant, ChatPerson } from '@/types/index'
import { getMessageList, getChatDetail, readMessage, chat, checkOnlineStatus } from '@/api/userInfo/messageCenter'
import { getUserInfo } from '@/api/userInfo/homePage'
import { uploadAvatar } from '@/api/userInfo/personal'
import { wsService } from '@/service/SocketManager'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'
import EmojiWindow from '@/components/messageCenter/EmojiWindow.vue'
import { ElMessage } from 'element-plus'
import { fi } from 'element-plus/es/locales.mjs'

const router = useRouter()

const messageStore = useMessageStore()

const isEmojiWindowVisible = ref(false);

const imageInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

/**
 * 根据用户ID自动选择聊天
 * 当聊天对象不存在时，创建临时会话
 */
async function autoSelectChatByUserId(targetUserId: number) {
  // 查找对应的聊天对象索引
  const index = chatPersons.value.findIndex(person => person.userId === targetUserId)
  
  if (index !== -1) {
    selectChat(index)
    return true
  } else {
    try {
      // 查询临时用户信息
      const userInfo = await getUserInfo(targetUserId)
      // 创建临时会话，使用特殊的relationship值标识为临时会话
      const tempPerson: ChatPerson = {
        userId: targetUserId,
        userName: userInfo.data.userName,
        userImage: userInfo.data.image || defaultAvatar.value,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        relationship: '', 
        unreadCount: 0
      }
      console.log('临时用户信息:', userInfo.data.image)
      // 临时会话添加到列表顶部
      chatPersons.value.unshift(tempPerson)
      selectChat(0)
      return true
    } catch (error) {
      console.error('获取用户信息失败或创建临时会话失败:', error)
      return false
    }
  }
}

/**
 * 跳转他人用户主页
 */
const jumpToHome = (userId: number) => {
  // router.push(`/otherUserHome/${userId}`)
  window.open(`/otherUserHome/${userId}`, '_blank')
}

// 状态定义
let chatPersons = ref<ChatPersons>([])
let activeIndex = ref<number | null>(null)
let chatDetail = ref<ChatDetail | null>(null)
let inputMsg = ref('')
const chatBodyRef = ref<HTMLDivElement | null>(null)
const defaultAvatar = ref('/static/images/default-avatar.png') // 默认头像路径
const defaultImage = ref('/static/images/default-image.png') // 默认图片路径

let userId = ref<number>(Number(localStorage.getItem('userId')));

// 定义定时器引用
const timerRef = ref<number | null>(null);

let onlineStatus = ref<string>('离线')

/**
 * 按日期分组消息
 */
const groupedMessages = computed(() => {
  if (!chatDetail?.value?.messages?.length) return {}

  const messages = [...chatDetail.value.messages].sort(
    (a, b) => new Date(a.sendTime).getTime() - new Date(b.sendTime).getTime()
  )

  const groups: Record<string, ChatMessage[]> = {}
  let groupIndex = 0
  let lastTime = 0

  messages.forEach((msg, idx) => {
    const currentTime = new Date(msg.sendTime).getTime()

    // 如果是第一条消息，直接创建第一组
    if (idx === 0) {
      groups[`group_${groupIndex}`] = [msg]
      lastTime = currentTime
      return
    }

    // 如果两条消息时间间隔超过10分钟（600000毫秒）
    if (currentTime - lastTime > 10 * 60 * 1000) {
      groupIndex++
      groups[`group_${groupIndex}`] = []
    }

    groups[`group_${groupIndex}`].push(msg)
    lastTime = currentTime
  })

  return groups
})


/**
 * 选择聊天对象
 */
function selectChat(index: number) {
  // 切换聊天对象时，先标记消息为已读
  if (index !== activeIndex.value) {
    readMessage({
      userId: Number(localStorage.getItem('userId')),
      targetUserId: chatPersons.value[index].userId,
    })
  }
  activeIndex.value = index
  const targetUserId = chatPersons.value[index].userId
  getChatDetailByTargetUserId(targetUserId)
  // 先本地也设置已读
  chatPersons.value[index].unreadCount = 0;

  // 检查对方是否在线
  periodicTask()

  // 读取消息
  readMessage({
    userId: Number(localStorage.getItem('userId')),
    targetUserId,
  }).then(res => {
    console.log('读取消息成功')
  }).catch(() => {
    console.log('读取消息失败')
  })

  // scrollToBottom()
}

/**
 * 获取聊天详情
 */
function getChatDetailByTargetUserId(targetUserId: number) {
  getChatDetail({
    userId: Number(localStorage.getItem('userId')),
    targetUserId,
  }).then(res => {
    chatDetail.value = res.data
    // console.log('---返回的聊天详情---:', res.data)
    // 滚动到底部
    nextTick(() => scrollToBottom())
  }).catch(() => {
    chatDetail.value = null
  })
}

/**
 * 获取对方参与者信息
 */
function getOtherParticipant(): ChatParticipant | undefined {
  // console.log("------chatDetail", chatDetail.value)

  // 如果只有一个参与者且是自己，返回自己(代表文件传输助手之类的特殊账号)
  if ( chatDetail.value && chatDetail.value.participants.length == 1) {
    return chatDetail.value.participants.find(p => p.self)
  } else {
    return chatDetail.value?.participants.find(p => !p.self)
  }
}

/**
 * 获取自己的参与者信息
 */
function getSelfParticipant(): ChatParticipant | undefined {
  return chatDetail.value?.participants.find(p => p.self)
}

/**
 * 判断是否是自己发送的消息
 */
function isSelfMessage(msg: ChatMessage): boolean {
  const selfId = getSelfParticipant()?.userId
  return selfId === msg.senderId
}

/**
 * 格式化列表时间（左侧）
 */
function formatTime(time: string): string {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = now.getTime() - date.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000

  const isToday = diffMs < oneDayMs && date >= todayStart
  const isYesterday =
    diffMs < 2 * oneDayMs && date < todayStart && date >= new Date(todayStart.getTime() - oneDayMs)

  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

  if (isToday) {
    // 今天 → HH:mm
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  } else if (isYesterday) {
    // 昨天
    return '昨天'
  } else if (date > new Date(todayStart.getTime() - 7 * oneDayMs)) {
    // 一周内 → 星期几
    return weekDays[date.getDay()] as string
  } else if (date.getFullYear() === now.getFullYear()) {
    // 今年 → 月-日
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
  } else {
    // 其他年份 → 年-月-日
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}


/**
 * 格式化日期分组显示（日期分割线）
 */
function formatDateKey(dateKey: string) {
  const date = new Date(dateKey)
  const now = new Date()
  
  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayWithoutTime = new Date(todayWithoutTime.getTime() - 24 * 60 * 60 * 1000)
  const timeDiff = Math.floor((todayWithoutTime.getTime() - dateWithoutTime.getTime()) / (1000 * 60 * 60 * 24))
  
  if (dateWithoutTime.getTime() === todayWithoutTime.getTime()) {
    return `今天` // 移除 ${hours}:${minutes}，仅显示“今天”
  } else if (dateWithoutTime.getTime() === yesterdayWithoutTime.getTime()) {
    return '昨天'
  } else if (timeDiff < 7) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return `${weekdays[date.getDay()]}`
  } else if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
}

/**
 * 格式化日期分割线显示（基于该分组中最新一条消息时间）
 * dateKey: 'YYYY-MM-DD'（你的分组 key）
 * group: ChatMessage[] — 该日期下的消息数组
 */
function formatDateDivider(dateKey: string, group: ChatMessage[]) {
  // 如果没有消息，就回退到原本的按日期显示
  if (!group || group.length === 0) {
    const date = new Date(dateKey)
    const now = new Date()
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
  }

  // 选取该组的“最新消息”，通常是数组最后一项（如果按时间升序）
  const lastMsg = group[0]
  const time = lastMsg.sendTime || dateKey // 兜底
  const date = new Date(time)
  const now = new Date()

  // 辅助：是否为今天 / 昨天
  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayWithoutTime = new Date(todayWithoutTime.getTime() - 24 * 60 * 60 * 1000)

  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')

  if (dateWithoutTime.getTime() === todayWithoutTime.getTime()) {
    return `${hh}:${mm}`
  } else if (dateWithoutTime.getTime() === yesterdayWithoutTime.getTime()) {
    return `昨天 ${hh}:${mm}`
  } else {
    // 若同年，显示：MM月DD日 HH:mm；否则：YYYY年MM月DD日 HH:mm
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日 ${hh}:${mm}`
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${hh}:${mm}`
    }
  }
}

const sendingMessages = ref<Set<number>>(new Set())
const failedMessages = ref<Set<number>>(new Set())
    
/**
 * 发送消息
 */
async function sendMessage(contentType: number, content: string) {
  if (content == null) {
    content = inputMsg.value.trim()
    if (!content || !chatDetail.value) return
  }
  console.log('发送的消息:', contentType)
  if (contentType == null) {
    contentType = 3
  }
  
  const selfId = getSelfParticipant()?.userId
  const targetUserId = getOtherParticipant()?.userId
  console.log('获取的目标用户ID:', targetUserId)
  if (!selfId || !targetUserId) return
  
  // 模拟发送消息（实际项目中替换为接口调用）
  if (content.trim()) {
    // 创建临时消息
      const newMsg: ChatMessage = {
      messageId: Number(Date.now()),
      senderId: selfId,
      sendTime: new Date().toISOString(),
      contentType: contentType,
      content: content
    }
    

    // 将消息标记为发送中
    sendingMessages.value.add(newMsg.messageId)
  
    // 添加到消息列表并清空输入框
    if (chatDetail.value) {
      chatDetail.value.messages.push(newMsg)
      inputMsg.value = ''
        scrollToBottom()
    }

    // 更新聊天栏目最后一条消息和时间
    switch (contentType) {
      case 3:
        chatPersons.value[activeIndex.value!].lastMessage = content
        break
      case 4:
        chatPersons.value[activeIndex.value!].lastMessage = '[图片]'
        break
      case 5:
        chatPersons.value[activeIndex.value!].lastMessage = '[文件]'
        break
      case 6:
        chatPersons.value[activeIndex.value!].lastMessage = '[视频]'
        break
      case 7:
        chatPersons.value[activeIndex.value!].lastMessage = '[语音]'
        break
      default:
        chatPersons.value[activeIndex.value!].lastMessage = '不支持的类型'
        break
    }
    chatPersons.value[activeIndex.value!].lastMessageTime = newMsg.sendTime


    // 实际接口调用
    try {
        const res = await chat({
            userId: selfId,
            targetId: targetUserId,
            contentType: contentType,
            content: content
        })
        console.log('准备发送的请求体', {
            userId: selfId,
            targetId: targetUserId,
            contentType: contentType,
            content: content
        })

        if (res.code == 200) {
            // const idx = chatDetail.value?.messages.findIndex(m => m.messageId === newMsg.messageId)
            // if (idx !== -1 && idx !== undefined) {
            //   chatDetail.value!.messages[idx].messageId = res.data.messageId
            // }
            sendingMessages.value.delete(newMsg.messageId)
            scrollToBottom()
          } else {
            sendingMessages.value.delete(newMsg.messageId)
            failedMessages.value.add(newMsg.messageId)
          }
        } catch (e) {
          sendingMessages.value.delete(newMsg.messageId)
          failedMessages.value.add(newMsg.messageId)
        }
    }
}

/**
 * 重试发送消息
 */
async function retrySend(msg: ChatMessage) {
  failedMessages.value.delete(msg.messageId)
  sendingMessages.value.add(msg.messageId)

  const selfId = getSelfParticipant()?.userId
  const targetUserId = getOtherParticipant()?.userId
  if (!selfId || !targetUserId) return

  try {
    const res = await chat({
      userId: selfId,
      targetId: targetUserId,
      contentType: 3,
      content: msg.content
    })

    if (res.code === 200) {
      sendingMessages.value.delete(msg.messageId)
    } else {
      throw new Error('发送失败')
    }
  } catch (e) {
    sendingMessages.value.delete(msg.messageId)
    failedMessages.value.add(msg.messageId)
  }
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
  // 初始滚动
  executeScroll();
  
  // 添加多级延迟滚动，应对媒体资源加载导致的尺寸变化
  setTimeout(executeScroll, 100);
  setTimeout(executeScroll, 300);
  setTimeout(executeScroll, 600);
}

/**
 * 格式化昵称
 */
function formatNickname(nickname: string) {
  if (!nickname) return ''
  if (nickname == 'CloudBlog官方') return nickname
  // 超出9个字符的，显示前6个字符 + '...'
  if (nickname.length > 9) {
    return nickname.slice(0, 6) + '...'
  }
  return nickname
}

/**
 * 头像加载失败处理
 */
function handleAvatarError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = defaultAvatar.value
}

/**
 * 图片消息加载失败处理
 */
function handleImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = defaultImage.value
}

// 监听消息列表变化，自动滚动到底部
watch(() => chatDetail?.value?.messages, () => {
  scrollToBottom()
}, { deep: true })

// 监听WebSocket的聊天消息事件
function handleChatMessage(data: any) {
  console.log('收到聊天消息:', data)
  
  // 从本地存储获取当前用户ID
  // const currentUserId = Number(localStorage.getItem('userId'))
  
  // // 检查是否是发送给自己的消息
  // if (data.receiverId !== currentUserId) return
  
  // 构建消息对象
  const newMessage: ChatMessage = {
    messageId: data.messageId,
    senderId: data.senderId,
    sendTime: data.sendTime,
    contentType: data.contentType || 3, // 默认文本类型
    content: data.content
  }

  //---------------------------接收方处理逻辑---------------------------
  // 判断当前是否打开了与该发送者的聊天详情
  const chatPersonIndex = chatPersons.value.findIndex(
    person => person.userId === data.senderId
  )
  // 没有打开详情，直接渲染列表
  if (chatPersonIndex !== activeIndex.value || activeIndex.value == null) {
    console.log('未打开聊天详情，更新列表未读数')
    let srcPerson = chatPersons.value[chatPersonIndex] as ChatPerson
    if (srcPerson) {
      srcPerson.unreadCount = (srcPerson.unreadCount || 0) + 1
      srcPerson.lastMessage = data.content
      srcPerson.lastMessageTime = data.sendTime
    }
    chatPersons.value[chatPersonIndex] = srcPerson;

    console.log('更新后的未读数:', srcPerson.unreadCount);
  } else {
    // 打开了详情，渲染聊天详情
    // 检查是否是当前打开的聊天详情
    if (chatPersonIndex !== activeIndex.value) return
    
    console.log('已打开聊天详情，更新消息列表和详情')
    chatDetail.value.messages.push(newMessage)

    // 更新聊天列表中的最后一条消息和时间
    let srcPerson = chatPersons.value[chatPersonIndex] as ChatPerson
    if (srcPerson) {
      srcPerson.lastMessage = data.content
      srcPerson.lastMessageTime = data.sendTime
    }
    chatPersons.value[chatPersonIndex] = srcPerson;
    // 滚动到底部
    nextTick(() => scrollToBottom())
    console.log('更新后聊天详情消息列表:', chatDetail.value.messages)
  }
}

/**
 * 处理页面刷新或关闭前的逻辑
 */
function handlePageBeforeUnload(event: BeforeUnloadEvent) {
  // 执行刷新界面前需要做的操作
  console.log('页面即将刷新或关闭，执行清理操作');
  
  // 标记当前聊天对象消息为已读
  if (activeIndex.value !== null) {
    readMessage({
      userId: Number(localStorage.getItem('userId')),
      targetUserId: chatPersons.value[activeIndex.value].userId,
    })
  }
}

/**
 * 定时执行检测在线状态
 */
async function periodicTask() {
  
  if (activeIndex.value !== null) {
    let res = await checkOnlineStatus({targetUserId:chatPersons.value[activeIndex.value].userId});
    onlineStatus.value = res.data
    console.log('定时任务执行时间:', new Date().toLocaleTimeString(), '，对方在线状态:', res.data);

  }
}

/**
 * 启动定时器
 * @param intervalMs 执行间隔（毫秒），默认为10秒
 */
function startPeriodicTask(intervalMs: number = 10000) {
  // 先清除可能存在的定时器，避免重复创建
  stopPeriodicTask();
  
  // 创建新的定时器
  timerRef.value = setInterval(() => {
    periodicTask();
  }, intervalMs);
  
  console.log(`定时器已启动，每${intervalMs/1000}秒执行一次`);
}

/**
 * 停止定时器
 */
function stopPeriodicTask() {
  if (timerRef.value !== null) {
    clearInterval(timerRef.value);
    timerRef.value = null;
    console.log('定时器已停止');
  }
}

/**
 * 打开表情选择弹窗
 */
function openEmojiWindow() {
  if (isEmojiWindowVisible.value) {
    isEmojiWindowVisible.value = false;
    return;
  }
  isEmojiWindowVisible.value = true;
}

// 处理选中的表情
const insertEmoji = (emoji: string) => {
  inputMsg.value += emoji; // 在输入框中添加表情
  isEmojiWindowVisible.value = false; // 隐藏表情弹窗
};

// 上传图片
const triggerImageUpload = () => {
  // 点击隐藏的图片文件输入框
  imageInput.value?.click()
}

// 实现triggerFileUpload方法
const triggerFileUpload = () => {
  // 点击隐藏的普通文件输入框
  fileInput.value?.click()
}

// 处理图片文件选择
const handleImageFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    
    // 检查文件大小（例如限制为10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      ElMessage.error('图片大小不能超过10MB')
      // 重置input值，以便可以重新选择文件
      input.value = ''
      return
    }
    
    // 调用上传图片的方法
    const formData = new FormData();
    formData.append('file', file);
    const uploadPath = (await uploadAvatar(formData)).data

    // 发送包含上传路径的消息
    sendMessage(4,uploadPath)
    
    // 重置input值，以便可以重复选择同一个文件
    input.value = ''
  }
}

// 处理普通文件选择
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 获取文件类型
    const fileType = getFileType(file);
    
    // 根据不同文件类型设置不同的大小限制
    let maxSize = 50 * 1024 * 1024; // 默认50MB
    switch (fileType) {
      case 'image':
        maxSize = 10 * 1024 * 1024; // 图片限制10MB
        break;
      case 'video':
        maxSize = 100 * 1024 * 1024; // 视频限制100MB
        break;
      case 'audio':
        maxSize = 20 * 1024 * 1024; // 音频限制20MB
        break;
      default:
        maxSize = 50 * 1024 * 1024; // 其他文件50MB
    }

    if (file.size > maxSize) {
      ElMessage.error(`文件大小不能超过${formatFileSize(maxSize)}`);
      // 重置input值，以便可以重新选择文件
      input.value = ''
      return
    }

     // 显示加载中
    // ElMessage({ message: `正在上传${file.name}...`, type: 'info', duration: 0 });

   
    // 调用上传文件的方法
    const formData = new FormData();
    formData.append('file', file);
    const uploadPath = (await uploadAvatar(formData)).data

    // 发送包含上传路径的消息
    let contentType = 5; // 默认其他文件
      switch (fileType) {
        case 'image':
          contentType = 4; // 图片消息类型
          break;
        case 'video':
          contentType = 6; // 视频消息类型为6
          break;
        case 'audio':
          contentType = 7; // 音频消息类型为7
          break;
        default:
          contentType = 5; // 其他文件类型
      }
    console.log('文件类型:', fileType, '，上传路径:', uploadPath);
    sendMessage(contentType,uploadPath)
    
    // 重置input值，以便可以重复选择同一个文件
    input.value = ''
  }
}

// 文件类型判断函数
const getFileType = (file: File): string => {
  const type = file.type;
  if (type.startsWith('image/')) {
    return 'image';
  } else if (type.startsWith('video/')) {
    return 'video';
  } else if (type.startsWith('audio/')) {
    return 'audio';
  } else {
    return 'file'; // 其他文件类型
  }
};

// 文件大小格式化函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 点击空白区域隐藏表情弹窗
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  // 如果表情弹窗可见，且点击的元素不是表情弹窗、表情按钮或其内部元素
  if (isEmojiWindowVisible.value) {
    const emojiWindow = document.querySelector('.emoji-windows');
    const toolbarBtn = document.querySelector('.toolbar-btn');
    
    if (emojiWindow && toolbarBtn) {
      // 检查点击是否在表情弹窗或工具栏按钮内
      if (!emojiWindow.contains(target) && !toolbarBtn.contains(target)) {
        isEmojiWindowVisible.value = false;
      }
    }
  }
};

// 媒体预览相关数据
const mediaModalVisible = ref(false);
const currentMediaUrl = ref('');
const currentMediaType = ref<'image' | 'video'>('image');

// 显示媒体预览模态框
const showMediaModal = (url: string, type: 'image' | 'video') => {
  currentMediaUrl.value = url;
  currentMediaType.value = type;
  mediaModalVisible.value = true;
  
  // 禁止背景滚动
  document.body.style.overflow = 'hidden';
  
  // 添加ESC键关闭事件
  document.addEventListener('keydown', handleEscClose);
};

// 关闭媒体预览模态框
const closeMediaModal = () => {
  mediaModalVisible.value = false;
  
  // 恢复背景滚动
  document.body.style.overflow = '';
  
  // 移除ESC键事件监听
  document.removeEventListener('keydown', handleEscClose);
  
  // 重置当前媒体数据
  currentMediaUrl.value = '';
};

// ESC键关闭处理
const handleEscClose = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && mediaModalVisible.value) {
    closeMediaModal();
  }
};

// 处理视频预览错误
const handleVideoPreviewError = (e: Event) => {
  const video = e.target as HTMLVideoElement;
  video.poster = '/api/common/error-video.png'; // 可选：添加错误占位图
  ElMessage.error('视频加载失败');
};


// 滚动相关的定时器
let scrollTimer: number | null = null;
let mediaLoadingTimer: number | null = null;

// 执行滚动的核心函数
function executeScroll() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
    }
  });
}


// 处理媒体加载完成事件
function handleMediaLoaded() {
  // 避免频繁滚动，使用节流
  if (!mediaLoadingTimer) {
    mediaLoadingTimer = setTimeout(() => {
      executeScroll();
      mediaLoadingTimer = null;
    }, 50);
  }
}

// 监听消息列表变化，自动滚动到底部
// 更新watch监听
watch(() => chatDetail?.value?.messages, () => {
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    scrollToBottom();
    
    // 预加载新增的媒体资源
    preloadMediaResources();
  }, 50);
}, { deep: true });

function preloadMediaResources() {
  if (!chatDetail.value || !chatDetail.value.messages.length) return;
  
  const mediaMessages = chatDetail.value.messages.filter(msg => 
    msg.contentType === 4 || msg.contentType === 6
  );
  
  mediaMessages.forEach(msg => {
    const url = `/api${msg.content}`;
    if (msg.contentType === 4) {
      // 预加载图片
      const img = new Image();
      img.src = url;
      img.onload = handleMediaLoaded;
    } else if (msg.contentType === 6) {
      // 预加载视频元数据
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;
      video.onloadedmetadata = handleMediaLoaded;
    }
  });
}

// 初始化加载
onMounted(() => {
  getMessageList({
    userId: Number(localStorage.getItem('userId')),
    notificationId: 1,
  }).then(res => {
    chatPersons.value = res.data

    // 检查是否有目标用户ID需要自动选择聊天
    const targetUserId = messageStore.targetUserId
    if (targetUserId && !messageStore.autoSelectProcessed) {
      // 尝试在现有聊天中选择
      const selected = autoSelectChatByUserId(targetUserId)
      
      // 标记已处理，避免重复处理
      messageStore.markAutoSelectProcessed()
      console.log('自动选择聊天对象:', messageStore.targetUserId, messageStore.autoSelectProcessed);
    }
    // 默认选中第一个聊天对象
    // if (chatPersons.value.length > 0) {
    //   selectChat(0)
    // }
  })

  // 监听WebSocket的聊天消息事件
  wsService.on('CHAT', handleChatMessage)

  // 添加页面刷新/关闭前的事件监听
  window.addEventListener('beforeunload', handlePageBeforeUnload);

  // 启动定时器，每10秒执行一次
  startPeriodicTask();

  // 添加点击空白区域隐藏表情弹窗的事件监听
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  wsService.off('CHAT', handleChatMessage)

  // 离开消息中心时，标记当前聊天对象消息为已读
  if (activeIndex.value !== null) {
    readMessage({
      userId: Number(localStorage.getItem('userId')),
      targetUserId: chatPersons.value[activeIndex.value].userId,
    })
  }

  // 停止定时器，避免内存泄漏
  stopPeriodicTask();

  // 移除点击空白区域的事件监听
  document.removeEventListener('click', handleClickOutside);
})
</script>

<style scoped>
.my-message {
  display: flex;
  height: 720px;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
}

/* 左侧消息列表（保持原有样式） */
.chat-person-list {
  width: 300px;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.chat-person-list::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.chat-person-list:hover::-webkit-scrollbar {
  width: 6px;
}

.chat-person-list::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}


/* 日期分割线 */
.date-divider {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

/* 消息项容器 - 关键修改 */
.chat-message-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 12px;
  position: relative;
}

/* 移除消息时间相关样式 */
.message-time,
.other-time,
.self-time {
  display: none;
}

/* 连续消息的样式优化 */
.chat-message-item + .chat-message-item {
  margin-top: -8px;
}

/* 其他现有代码保持不变 */
.chat-item {
  display: flex;
  align-items: center;
  padding: 10px 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.chat-item:hover {
  background-color: #f0f0f0;
}

.chat-item.active {
  background-color: #f0f0f0;
}

.relation-tip {
    font-size: 10px;
    font-weight: 500;
    padding: 1px 3px;
    border-radius: 12px;
    border: 1px solid;
    margin-left: 4px;
    flex-shrink: 0;
}

.tip-official {
    /* border-color: #ff9900; */
    background-color: #9cd0fa;
    border-color: #9cd0fa;
    color: #008cff;
}

.tip-stranger {
    border-color: #dbdbdb;
    background-color: #dbdbdb;
    color: #686868;
}

.tip-friend {
    border-color: #fcc69b;
    background-color: #fcc69b;
    color: #ff7300;
}

.tip-focus {
    border-color: #dbdbdb;
    background-color: #dbdbdb;
    color: #686868;
}

.tip-fan {
    border-color: #fcfcfc71;
    background-color: #ec70ae71;
    color: #ff0080bb;
}

.tip-self {
    background-color: #9cd0fa;
    border-color: #9cd0fa;
    color: #008cff;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-top {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.chat-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.chat-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-right: 5px;
  margin-left: auto;
}

.chat-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.chat-message {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.unread {
  background-color: #f56c6c;
  color: #fff;
  font-size: 12px;
  border-radius: 10px;
  padding: 0 6px;
  margin-left: 6px;
  margin-right: 5px;
}

/* 右侧消息区 */
.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f9f9f9;
}

.empty-tip {
  color: #bbb;
  font-size: 14px;
  margin: auto;
}

/* 聊天窗口容器 */
.chat-window {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 聊天头部 */
.chat-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 0 16px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.chat-header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  cursor: pointer;
}

.chat-header-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chat-header-name {
  font-weight: 500;
  font-size: 16px;
  color: #333;
}

.chat-header-status {
  font-size: 12px;
  margin-top: 2px;
}

.online {
  color: #67c23a;
}

.offline {
  color: #a1a1a1;
}

/* 聊天消息区域 */
.chat-body {
  flex: 1;
  padding-top: 0px;
  padding-left: 10px;
  padding-right: 10px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.chat-body::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.chat-body:hover::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.loading-tip {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 14px;
}

/* 日期分割线 */
.date-divider {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.date-text {
  /* background-color: #e5e5e5; */
  color: #999;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
}

/* 消息项容器 - 关键修改 */
.chat-message-item {
  display: flex;
  /* 将align-items从flex-end改为flex-start，让头像与消息顶部对齐 */
  align-items: flex-start;
  margin-bottom: 12px;
  position: relative;
}

.other-message {
  flex-direction: row;
}

.self-message {
  flex-direction: row-reverse;
}

/* 消息头像 */
.message-avatar {
 width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  /* 移除底部边距，调整水平边距 */
  margin: 0 8px;
  cursor: pointer;
}

/* 消息内容容器 */
.message-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  /* 添加一些上边距，让非文本消息与头像视觉上更协调 */
  margin-top: 2px;
}

/* 消息气泡 */
.message-bubble {
  padding: 10px 12px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  word-break: break-all;
  max-width: 100%;
}

.other-bubble {
  background-color: #fff;
  border: 1px solid #eee;
  border-top-left-radius: 4px;
}

.self-bubble {
  background-color: #409eff;
  color: #fff;
  border-top-right-radius: 4px;
}

/* 消息文本 */
.message-text {
  font-size: 14px;
  line-height: 1.4;
}

/* 图片消息 */
.message-image {
  max-width: 180px;
  max-height: 240px;
  border-radius: 8px;
  object-fit: cover;
  cursor: zoom-in;
}

/* 不支持的消息类型 */
.unsupported-message {
  font-size: 14px;
  color: #999;
}

.message-image,
.unsupported-message {
  margin-top: 4px;
}

/* 消息时间 - 关键修改（居中样式） */
.message-time {
  font-size: 11px;
  color: #999;
  padding: 2px 6px;
  border-radius: 4px;
  margin: 0 8px;
  background-color: rgba(0,0,0,0.05);
  align-self: flex-end;
}

/* 对方消息时间 - 居左 */
.other-time {
  margin-left: 4px;
}

/* 自己消息时间 - 居右 */
.self-time {
  margin-right: 4px;
}

/* 连续消息的时间位置优化 */
.chat-message-item + .chat-message-item {
  margin-top: -8px;
}

.chat-message-item + .chat-message-item .message-time {
  display: none;
}

/* 不同发送者切换时显示时间 */
.chat-message-item:not(.self-message) + .chat-message-item.self-message .message-time,
.chat-message-item.self-message + .chat-message-item:not(.self-message) .message-time {
  display: block;
}

/* 聊天输入区域 */
.chat-footer {
  /* display: flex; */
  border-top: 1px solid #eee;
  background-color: #fff;
  padding: 5px 16px;
}

.message-toolbar {
  align-items: flex-end;
  display: flex;
  gap: 15px;
}

.toolbar-btn {
  cursor: pointer;
}

.toolbar-btn:hover path:hover {
  color: #000000;
}

.emoji-windows {
  position: absolute;
  margin-left: 0.5rem;
  margin-bottom: 3.5rem;
  left: 0;
}

.message-area {
  align-items: flex-end;
  display: flex;
  /* padding: 5px 16px; */
  gap: 10px;
}

.message-input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px 12px;
  min-height: 44px;
  max-height: 120px;
  resize: none;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #409eff;
}

.message-input::placeholder {
  color: #ccc;
}

.send-btn {
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  height: 44px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background-color: #3086d6;
}

/* 消息状态容器 */
.message-status {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 6px;
}

/* 旋转加载动画 */
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-top-color: #868686;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* 重试图标样式 */
.retry-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s;
  transform: translateY(-16px);
}

.retry-icon:hover {
  /* transform: rotate(30deg); */
  color: #ff4d4f;
}

/* 动画关键帧 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 可点击媒体样式 */
.clickable-media {
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
}

.clickable-media:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}

/* 视频容器样式 */
.video-container {
  position: relative;
  display: inline-block;
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.video-container:hover .video-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}

.play-icon {
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-left: 4px;
}

/* 媒体预览模态框样式 */
.media-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.media-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  background-color: #111;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.media-modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.media-modal-close:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 图片预览容器 */
.media-preview-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.media-preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
}

/* 视频预览容器 */
.media-preview-video-container {
  width: 100%;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
}

.media-preview-video {
  width: 100%;
  height: auto;
  min-height: 300px;
  background-color: #000;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>