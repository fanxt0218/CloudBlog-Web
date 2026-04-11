<template>
  <div class="publish-share">
    <!-- 左侧发布区 -->
    <div class="left-content">
      <!-- 输入框 -->
      <el-mention
        v-model="value"
        type="textarea"
        :options="options"
        placeholder="有什么新的观点，快来说说看～"
        class="publish-input"
        :autosize="{ minRows: 8, maxRows: 12 }"
        ref="mentionRef"
      >
        <template #label="{ item }">
          <div style="display: flex; align-items: center">
            <el-avatar :size="24" :src="`/api${item.avatar}`" />
            <span style="margin-left: 6px">{{ item.value }}</span>
          </div>
        </template>
      </el-mention>

      <!-- 添加话题 -->
      <div class="add-topic-wrapper">
        <div class="add-topic">
          <div class="topic-left">
            <svg t="1766305924725" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19491" id="mx_n_1766305924725" width="20" height="20">
              <path d="M476.021333 544h63.424l8.533334-64h-63.424l-8.533334 64zM512 85.333333c235.637333 0 426.666667 191.029333 426.666667 426.666667S747.637333 938.666667 512 938.666667a424.778667 424.778667 0 0 1-219.125333-60.501334 2786.56 2786.56 0 0 0-20.053334-11.765333l-104.405333 28.48c-23.893333 6.506667-45.802667-15.413333-39.285333-39.296l28.437333-104.288c-11.008-18.688-18.218667-31.221333-21.802667-37.909333A424.885333 424.885333 0 0 1 85.333333 512C85.333333 276.362667 276.362667 85.333333 512 85.333333z m89.557333 234.944a32 32 0 0 0-35.946666 27.498667L556.512 416h-63.424l7.968-59.776a32 32 0 0 0-63.445333-8.448L428.512 416H352a32 32 0 0 0 0 64h67.978667l-8.533334 64H352a32 32 0 0 0 0 64h50.912l-7.968 59.776a32 32 0 0 0 63.445333 8.448L467.488 608h63.424l-7.968 59.776a32 32 0 0 0 63.445333 8.448L595.488 608H672a32 32 0 0 0 0-64h-67.978667l8.533334-64H672a32 32 0 0 0 0-64h-50.912l7.968-59.776a32 32 0 0 0-27.498667-35.946667z" fill="#2bb9f6" p-id="19492">
              </path>
            </svg>

            <!-- 文本区域：只替换文字 -->
            <span
              class="topic-text"
              v-if="!selectedTopic"
              @click="toggleTopicSelect"
            >
              添加话题
            </span>

            <span
              class="topic-text selected"
              v-else
            >
              {{ selectedTopic.name }}
              <i class="remove-topic" @click.stop="removeTopic">×</i>
            </span>
          </div>

          <span class="word-count" :class="{ 'over-limit': remainingChars < 0 }">
            {{ remainingChars }}
          </span>
        </div>
      
        <!-- 悬浮话题下拉 -->
        <div
          v-show="showTopicSelect"
          class="topic-dropdown"
        >
          <div
            v-for="topic in topicList"
            :key="topic.id"
            class="topic-option"
            @click="selectTopic(topic)"
          >
            <img
              class="topic-cover"
              :src="`/api${topic.cover}`"
              alt=""
            />
            <div class="topic-info">
              <div class="topic-name"># {{ topic.topicName }}</div>
              <div class="topic-desc">{{ topic.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 媒体预览区 -->
      <div v-if="mediaList.length" class="media-preview">
        <div
          v-for="(item, index) in mediaList"
          :key="item.id"
          class="media-item"
        >
          <!-- 图片 -->
          <img
            v-if="item.type === 'image'"
            :src="item.url.startsWith('http') || item.url.startsWith('/api') ? item.url : `/api${item.url}`"
            class="media-thumb"
          />
      
          <!-- 视频 -->
          <video
            v-else
            class="media-thumb"
            :src="item.url.startsWith('http') || item.url.startsWith('/api') ? item.url : `/api${item.url}`"
          />
      
          <!-- 删除按钮 -->
          <span class="remove-btn" @click="removeMedia(index)">×</span>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="tool-bar">
        <div class="tools">
          <i class="tool-icon" @click="handleClick('video')">
            <svg t="1766305246813" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11928" data-spm-anchor-id="a313x.search_index.0.i17.23293a81Tn6B2a" width="25" height="25"><path d="M64.67 512c2.03-148.27 27.78-271.04 103.07-344.26C240.96 92.45 363.73 66.7 512 64.67c148.27 2.03 271.04 27.78 344.26 103.07C931.55 240.96 957.3 363.73 959.33 512c-2.03 148.27-27.78 271.04-103.07 344.26C783.04 931.55 660.27 957.3 512 959.33c-148.27-2.03-271.04-27.78-344.26-103.07C92.45 783.04 66.7 660.27 64.67 512z" p-id="11929" data-spm-anchor-id="a313x.search_index.0.i14.23293a81Tn6B2a" class="" fill="currentColor">
                </path><path d="M676.18 470.84l-243-135.24c-31.39-17.47-70 5.23-70 41.16v270.48c0 35.93 38.61 58.63 70 41.16l243-135.24c32.26-17.96 32.26-64.36 0-82.32z" fill="#ffffff" p-id="11930" data-spm-anchor-id="a313x.search_index.0.i15.23293a81Tn6B2a" class="selected">
                </path>
            </svg>
          </i>
          <i class="tool-icon" @click="handleClick('image')">
            <svg t="1766305427806" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14763" width="25" height="25">
                <path d="M867.90864 574.538232V257.779543a50.844091 50.844091 0 0 0-50.844092-50.844091h-610.129096a50.844091 50.844091 0 0 0-50.844092 50.844091v499.797418l430.141013-257.779543a152.532274 152.532274 0 0 1 157.108243 0z m0 118.466733l-177.445879-106.264151a50.844091 50.844091 0 0 0-50.844092 0L254.220457 817.064548h562.844091a50.844091 50.844091 0 0 0 50.844092-50.844091z m-660.973188-587.757696h610.129096a152.532274 152.532274 0 0 1 152.532274 152.532274v508.440914a152.532274 152.532274 0 0 1-152.532274 152.532274h-610.129096a152.532274 152.532274 0 0 1-152.532274-152.532274v-508.440914a152.532274 152.532274 0 0 1 152.532274-152.532274z m127.110228 355.90864a76.266137 76.266137 0 1 1 76.266137-76.266137 76.266137 76.266137 0 0 1-76.266137 76.266137z" fill="currentColor" p-id="14764">
                </path>
            </svg>
          </i>
          <i class="tool-icon" @click="handleClick('mention')">
            <svg t="1766305593028" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16839" width="25" height="25"><path d="M512 938.652444c-235.264 0-426.666667-191.402667-426.666667-426.666666s191.402667-426.666667 426.666667-426.666667 426.666667 191.402667 426.666667 426.666667c0 55.552-10.538667 109.639111-31.317334 160.739555a42.709333 42.709333 0 0 1-55.608889 23.438223 42.695111 42.695111 0 0 1-23.452444-55.608889A339.256889 339.256889 0 0 0 853.333333 511.985778c0-188.202667-153.130667-341.333333-341.333333-341.333334s-341.333333 153.130667-341.333333 341.333334 153.130667 341.333333 341.333333 341.333333c53.333333 0 104.391111-11.946667 151.736889-35.484444a42.666667 42.666667 0 0 1 38.001778 76.416A422.684444 422.684444 0 0 1 512 938.652444" fill="currentColor" p-id="16840">
                </path><path d="M512 369.763556c-78.421333 0-142.222222 63.800889-142.222222 142.222222s63.800889 142.222222 142.222222 142.222222a142.222222 142.222222 0 0 0 142.222222-142.222222c0-78.421333-63.800889-142.222222-142.222222-142.222222m0 369.777777c-125.468444 0-227.555556-102.087111-227.555556-227.555555s102.087111-227.555556 227.555556-227.555556 227.555556 102.087111 227.555556 227.555556a227.498667 227.498667 0 0 1-227.555556 227.555555" fill="currentColor" p-id="16841"></path><path d="M765.368889 782.791111c-7.822222 0-15.431111-0.768-22.755556-2.275555C689.749333 769.592889 654.222222 722.488889 654.222222 663.324444V327.096889a42.666667 42.666667 0 1 1 85.333334 0v336.213333c0 10.993778 2.631111 29.980444 20.337777 33.649778 19.569778 3.982222 49.322667-12.202667 68.750223-57.230222a42.680889 42.680889 0 0 1 78.364444 33.806222c-33.393778 77.312-91.562667 109.269333-141.653333 109.269333" fill="currentColor" p-id="16842">
                </path>
            </svg>
          </i>
          <i class="tool-icon" @click="handleClick('emoji')" :class="{active:isEmojiWindowVisible}">
            <svg t="1766305741355" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18173" width="25" height="25">
                <path d="M510.944 960c-247.04 0-448-200.96-448-448s200.992-448 448-448c247.008 0 448 200.96 448 448S757.984 960 510.944 960zM510.944 128c-211.744 0-384 172.256-384 384 0 211.744 172.256 384 384 384 211.744 0 384-172.256 384-384C894.944 300.256 722.688 128 510.944 128zM512 773.344c-89.184 0-171.904-40.32-226.912-110.624-10.88-13.92-8.448-34.016 5.472-44.896 13.888-10.912 34.016-8.48 44.928 5.472 42.784 54.688 107.136 86.048 176.512 86.048 70.112 0 134.88-31.904 177.664-87.552 10.784-14.016 30.848-16.672 44.864-5.888 14.016 10.784 16.672 30.88 5.888 44.864C685.408 732.32 602.144 773.344 512 773.344zM368 515.2c-26.528 0-48-21.472-48-48l0-64c0-26.528 21.472-48 48-48s48 21.472 48 48l0 64C416 493.696 394.496 515.2 368 515.2zM656 515.2c-26.496 0-48-21.472-48-48l0-64c0-26.528 21.504-48 48-48s48 21.472 48 48l0 64C704 493.696 682.496 515.2 656 515.2z" fill="currentColor" p-id="18174">
                </path>
            </svg>
          </i>
          <i class="tool-icon" @click="handleClick('topic')">
            <svg t="1766306143576" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19670" width="22" height="22">
                <path d="M908.199 299.932 775.846 299.932l39.783-172.473c0.728-3.291 1.156-6.732 1.156-10.268 0-25.254-20.47-45.691-45.694-45.691-21.689 0-39.846 15.139-44.534 35.429l0 0-44.533 193.035L440.729 299.964l39.816-172.473c0.729-3.292 1.157-6.735 1.157-10.269 0-25.252-20.438-45.69-45.691-45.69-21.72 0-39.876 15.139-44.506 35.423l0 0-44.566 193.042L207.546 299.997c-25.253 0-45.696 20.438-45.696 45.69s20.443 45.692 45.696 45.692l118.313 0-56.232 243.694L116.187 635.073c-25.252 0-45.689 20.472-45.689 45.697 0 25.221 20.438 45.69 45.689 45.69l132.361 0-39.783 172.505c-0.761 3.292-1.157 6.73-1.157 10.269 0 25.221 20.437 45.69 45.69 45.69 21.721 0 39.876-15.138 44.538-35.429l0 0 44.562-193.035 241.261 0-39.783 172.505c-0.73 3.292-1.159 6.73-1.159 10.269 0 25.221 20.439 45.69 45.693 45.69 21.687 0 39.843-15.138 44.537-35.429l0 0 44.534-193.035 139.393 0c25.253 0 45.694-20.47 45.694-45.69 0-25.226-20.441-45.697-45.694-45.697L698.562 635.073l56.232-243.694L908.26 391.379c25.253 0 45.697-20.439 45.697-45.692s-20.444-45.69-45.697-45.69L908.199 299.932zM604.738 635.016l-241.29 0 56.234-243.697 241.289 0L604.738 635.016 604.738 635.016zM604.738 635.016" fill="currentColor" p-id="19671">
                </path>
            </svg>
          </i>
        </div>

        <button class="publish-btn" @click="handleEdit">
          保存
          <span class="shortcut">Ctrl+Enter</span>
        </button>
      </div>

      <EmojiWindow
            v-if="isEmojiWindowVisible"
            @emoji-selected="insertEmoji"
            class="emoji-windows"
      />
    </div>

    <!-- 右侧话题榜 -->
    <div class="topic-list">
      <div class="topic-title"># 热门话题</div>

      <div class="topic-item" v-for="topic in topicList" :key="topic.id">
        <img
          class="topic-avatar"
          :src="`/api${topic.cover}`"
        />
        <div class="topic-info">
          <div class="topic-name">{{topic.topicName}}</div>
          <div class="topic-meta">{{ topic.participateCount }} 参与</div>
        </div>
      </div>
    </div>
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="handleFileChange('image', $event)"
    />

    <input
      ref="videoInput"
      type="file"
      accept="video/*"
      hidden
      @change="handleFileChange('video', $event)"
    />
  </div>
</template>

<script setup lang="ts" name="EditShare">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { getPublishPageTopicList, uploadImage, uploadVideo, editShare } from '@/api/create/index';
import { getFocusAndFansList } from '@/api/userInfo/homePage';
import { getShareViewPage } from '@/api/index/viewPage';
import type { PublishTopics, FocusAndFansInfos } from '@/types/index';
import { ElMessage } from 'element-plus';
import EmojiWindow from '@/components/messageCenter/EmojiWindow.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const shareId = Number(route.params.shareId);

let topicList = ref<PublishTopics>([]);
const value = ref('');
const mentionRef = ref();
const maxLength = 1024;
const remainingChars = computed(() => maxLength - value.value.length);

const options = ref<{ value: string; avatar: string }[]>([]);

type MediaItem = {
  id: string;
  type: 'image' | 'video';
  file?: File;
  url: string;
  isExisting?: boolean;
};

const mediaList = ref<MediaItem[]>([]);
const imageInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);
const isEmojiWindowVisible = ref(false);
const showTopicSelect = ref(false);
const selectedTopic = ref<{ id: number; name: string } | null>(null);
const selectedTopicId = ref<number | null>(null);

/**
 * 获取现有动态详情
 */
const fetchShareDetail = async () => {
  try {
    const res = await getShareViewPage({ shareId, userId: Number(localStorage.getItem('userId')) });
    const shareData = res.data;
    value.value = shareData.content;
    
    if (shareData.topicId) {
      selectedTopicId.value = shareData.topicId;
      selectedTopic.value = {
        id: shareData.topicId,
        name: topicList.value.find(item => item.id === shareData.topicId)?.topicName || ''
      };
    }

    if (shareData.imageUrl) {
        mediaList.value.push({
          id: crypto.randomUUID(),
          type: 'image',
          url: shareData.imageUrl,
          isExisting: true
        });
    }

    if (shareData.videoUrl && !shareData.imageUrl) {
        mediaList.value.push({
          id: crypto.randomUUID(),
          type: 'video',
          url: shareData.videoUrl,
          isExisting: true
        });
    }
    console.log('动态文件', mediaList.value);
  } catch (error) {
    ElMessage.error('获取动态详情失败');
    console.log('获取动态详情失败', error);
  }
};

const handleClick = async (type: string) => {
  if (type === 'image' || type === 'video') {
    if (mediaList.value.length >= 1) {
      ElMessage.info('目前仅支持上传一个媒体文件');
      return;
    }
    type === 'image' ? imageInput.value?.click() : videoInput.value?.click();
  } else if (type === 'mention') {
    value.value += '@';
    await nextTick();
    if (mentionRef.value) {
      const textarea = mentionRef.value.$el.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        const position = value.value.length;
        textarea.setSelectionRange(position, position);
      }
    }
  } else if (type === 'emoji') {
    isEmojiWindowVisible.value = !isEmojiWindowVisible.value;
  } else if (type === 'topic') {
    toggleTopicSelect();
  }
};

const handleFileChange = (type: 'image' | 'video', event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files) return;

  Array.from(files).forEach(file => {
    mediaList.value.push({
      id: crypto.randomUUID(),
      type,
      file,
      url: URL.createObjectURL(file),
      isExisting: false
    });
  });
  input.value = '';
};

const removeMedia = (index: number) => {
  const item = mediaList.value[index];
  if (!item.isExisting && item.url) {
    URL.revokeObjectURL(item.url);
  }
  mediaList.value.splice(index, 1);
};

const insertEmoji = (emoji: string) => {
  value.value += emoji;
  isEmojiWindowVisible.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (isEmojiWindowVisible.value || showTopicSelect.value) {
    const emojiWindow = document.querySelector('.emoji-windows');
    const topicSelect = document.querySelector('.topic-dropdown');
    const toolbarBtn = document.querySelector('.tool-bar');
    const topicLeft = document.querySelector('.topic-left');
    
    if (emojiWindow && toolbarBtn && !emojiWindow.contains(target) && !toolbarBtn.contains(target)) {
      isEmojiWindowVisible.value = false;
    }
    if (topicSelect && toolbarBtn && topicLeft && !topicSelect.contains(target) && !toolbarBtn.contains(target) && !topicLeft.contains(target)) {
      showTopicSelect.value = false;
    }
  }
};

const toggleTopicSelect = () => {
  if (selectedTopic.value) return;
  showTopicSelect.value = !showTopicSelect.value;
};

const selectTopic = (topic: any) => {
  selectedTopic.value = { id: topic.id, name: topic.topicName };
  selectedTopicId.value = topic.id;
  showTopicSelect.value = false;
};

const removeTopic = () => {
  selectedTopic.value = null;
  selectedTopicId.value = null;
};

const handleEdit = async () => {
  if (!value.value.trim()) {
    ElMessage.info('请输入内容');
    return;
  }
  if (remainingChars.value < 0) {
    ElMessage.info('内容超出最大限制');
    return;
  }

  try {
    const uploadPromises = mediaList.value.map(item => {
      if (item.isExisting) return Promise.resolve({ type: item.type, url: item.url });
      
      const formData = new FormData();
      formData.append('file', item.file!);
      return item.type === 'image' 
        ? uploadImage(formData).then(res => ({ type: 'image', url: res.data }))
        : uploadVideo(formData).then(res => ({ type: 'video', url: res.data }));
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.filter(r => r.type === 'image').map(r => r.url);
    const videoUrls = uploadResults.filter(r => r.type === 'video').map(r => r.url);

    await editShare({
      shareId,
      userId: Number(localStorage.getItem('userId')),
      topicId: selectedTopicId.value || null,
      content: value.value,
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
      videoUrls: videoUrls.length > 0 ? videoUrls : null,
    });

    ElMessage.success('更新成功');
    // 关闭当前标签页
    setTimeout(() => {
      window.close();
    }, 1000);
  } catch (error) {
    ElMessage.error('更新失败');
  }
};

onMounted(async () => {
  await getPublishPageTopicList().then(res => topicList.value = res.data);
  await fetchShareDetail();
  getFocusAndFansList({
    userId: Number(localStorage.getItem('userId')),
    type: 0, cursor: null, size: 999
  }).then(res => {
    options.value = (res.data.content as FocusAndFansInfos).map(item => ({
      value: item.userName,
      avatar: item.avatar
    }));
  });
  document.addEventListener('click', handleClickOutside);
  document.title = '编辑动态 - CloudBlog';
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.publish-share {
  display: flex;
  gap: 24px;
  padding: 20px;
  width: 60%;
  margin: 40px auto;
  background: #fff;
}

.left-content {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 16px;
  align-self: flex-start;
  overflow: visible;
}

.publish-input {
  width: 100%;
  height: 180px;
  border: none;
  resize: none;
  outline: none;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

:deep(.el-textarea__inner) {
  resize: none;
  height: 180px;
  border: none;
  font-size: 15px;
  line-height: 1.6;
  color: #333;

  &::placeholder {
    font-size: 14px;
    font-weight: 300;
  }
}

.add-topic {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  color: #999;
}

.tool-bar {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tools {
  display: flex;
  gap: 14px;
}

.tool-icon {
  font-size: 18px;
  cursor: pointer;
  color: #515151;
}

.tool-icon:hover, .tool-icon.active {
  color: #ff7f6e;
}

.publish-btn {
  background: #ff7f6e;
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 6px 14px;
  font-size: 14px;
  cursor: pointer;
}

.publish-btn .shortcut {
  font-size: 12px;
  margin-left: 6px;
  opacity: 0.8;
}

.publish-btn:hover {
  background: #ff6a57;
}

.topic-list {
  width: 240px;
}

.topic-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
}

.topic-item:hover {
  background: #fafafa;
}

.topic-avatar {
  width: 36px;
  height: 36px;
  margin-left: 5px;
  border-radius: 8px;
  object-fit: cover;
}

.topic-name {
  font-size: 14px;
  color: #333;
}

.topic-meta {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.media-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.media-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;
}

.media-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.media-item:hover .remove-btn {
  opacity: 1;
}

.emoji-windows {
  position: absolute;
  margin-left: 0.5rem;
  margin-bottom: -17rem;
  left: 0;
}

.add-topic-wrapper {
  position: relative;
}

.topic-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.topic-text {
  font-size: 14px;
  color: #2bb9f6;
  cursor: pointer;
}

.topic-text.selected {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0f8ff;
  padding: 1px 8px;
  border-radius: 12px;
}

.remove-topic {
  font-style: normal;
  cursor: pointer;
  color: #999;
}

.remove-topic:hover {
  color: #ff4d4f;
}

.topic-dropdown {
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 6px;
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  padding: 8px 0;
}

.topic-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.topic-option:hover {
  background: #f5f7fa;
}

.topic-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.topic-info {
  flex: 1;
}

.topic-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
