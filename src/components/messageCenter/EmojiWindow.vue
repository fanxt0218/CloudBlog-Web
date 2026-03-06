<template>
  <div class="emoji-window">
    <!-- 分类标签 -->
    <div 
      class="category-tabs-container" 
      @wheel.prevent="handleWheel"
    >
      <div class="category-tabs">
        <div
          v-for="(category, index) in emojiCategories"
          :key="index"
          class="category-tab"
          :class="{ active: selectedCategoryIndex === index }"
          @click="selectCategory(index)"
        >
          {{ category.name }}
        </div>
      </div>
    </div>

    <!-- 表情区 -->
    <div class="emoji-grid">
      <div
        v-for="emoji in emojiCategories[selectedCategoryIndex]?.emojis"
        :key="emoji"
        class="emoji-item"
        @click.stop="selectEmoji(emoji)"
      >
        {{ emoji }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 定义表情分类数据
const emojiCategories = ref([
  {
    name: '常见表情',
    emojis: [
      '😊', '😂', '😍', '😎', '🥺', '😢', '🤔', '😜', '😆', '😅', '😭', '😘', '😁', '😋', '🤗', 
      '🤩', '😉', '😏', '😴', '🥳', '😀', '😃', '😄', '🤣', '🙂', '🙃', '🫠', '😇', '🥰', '😗', 
      '☺', '😚', '😙', '🥲', '😛', '🤪', '😝', '🤑', '🤭', '🫢', '🫣', '🤫', '🫡', '🤐', '🤨', 
      '😐', '😑', '😶', '🫥', '😶‍🌫️', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😷', 
      '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥸', '🤓', '🧐', 
      '😕', '🫤', '😟', '🙁', '☹', '😮', '😯', '😲', '😳', '🥹', '😦', '😧', '😨', '😰', '😥', 
      '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', 
      '☠', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', 
      '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', 
      '💟', '❣', '💔', '❤️‍🔥', '❤️‍🩹', '❤', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', 
      '💢', '💥', '💫', '💦', '💨', '🕳', '💣', '💬', '👁️‍🗨️', '🗨', '🗯', '💭', '💤'
    ],
  },
  {
    name: '情感',
    emojis: ['😡', '🤬', '😱', '😨', '😰', '😓', '😥', '😮', '😯', '😲', '🙄', '😒', '😔', '😕', '🙁', '😖', '😣', '😞', '😟', '🤤'],
  },
  {
    name: '动物',
    emojis: ['🐶', '🐱', '🐭', '🐰', '🦁', '🐯', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄'],
  },
  {
    name: '食物',
    emojis: ['🍔', '🍕', '🍩', '🍉', '🍒', '🍓', '🍣', '🍪', '🍟', '🌭', '🥗', '🥙', '🧆', '🌮', '🌯', '🥫', '🍝', '🍜', '🍲', '🍛'],
  },
  {
    name: '运动',
    emojis: ['⚽', '🏀', '🏈', '🏓', '🎾', '🏸', '🏒', '🏑', '🥍', '🏏', '🎳', '🎣', '🤿', '🤺', '🏹', '🥊', '🥋', '🛹', '🛷', '⛷️'],
  },
  {
    name: '自然',
    emojis: ['☀️', '🌤️', '⛅', '☁️', '🌧️', '⛈️', '❄️', '☃️', '🌨️', '🌩️', '🌈', '🌊', '🌋', '⛰️', '🏔️', '🌍', '🌎', '🌏', '🌴', '🌲'],
  },
  {
    name: '物品',
    emojis: ['📱', '💻', '🖥️', '⌨️', '🖱️', '🎧', '📷', '🎥', '📺', '📻', '⌚', '💡', '🔦', '💣', '🔪', '🗡️', '🛡️', '💊', '📝', '✏️'],
  },
  {
    name: '活动',
    emojis: ['🎵', '🎶', '🎸', '🎹', '🥁', '🎺', '🎻', '🎤', '🎧', '🎪', '🎭', '🎬', '🎨', '📚', '✍️', '🎲', '🎯', '🎳', '🎮', '🎰'],
  },
  {
    name: '符号',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💖', '💗', '💓', '💔', '👍', '👎', '👌', '✌️', '🤞', '🤟'],
  },
  {
    name: '旗帜',
    emojis: ['🇨🇳', '🇺🇸', '🇬🇧', '🇯🇵', '🇰🇷', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇷🇺', '🇨🇦', '🇦🇺', '🇮🇳', '🇧🇷', '🇲🇽', '🇮🇩', '🇹🇭', '🇻🇳', '🇵🇭', '🇲🇾'],
  },
]);

// 当前选中的分类索引
const selectedCategoryIndex = ref(0);

// 选择表情
const selectEmoji = (emoji: string) => {
  emit('emoji-selected', emoji); // 将选中的表情传递给父组件
};

// 切换分类
const selectCategory = (index: number) => {
  selectedCategoryIndex.value = index;
};

// 处理鼠标滚轮事件 - 将垂直滚动转换为水平滚动
const handleWheel = (event: WheelEvent) => {
  event.preventDefault(); // 阻止默认滚动行为
  const container = event.currentTarget as HTMLElement;
  // 滚动速度倍率，可根据需要调整
  const scrollAmount = event.deltaY * 0.5;
  container.scrollLeft += scrollAmount;
};

// 传递事件给父组件
const emit = defineEmits<{
  (event: 'emoji-selected', emoji: string): void;
}>();
</script>

<style scoped>
.emoji-window {
  position: absolute;
  bottom: 50px; /* 弹窗显示位置 */
  left: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  width: 250px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 225px;
  overflow: hidden;
}

/* 分类标签容器 - 用于水平滚动 */
.category-tabs-container {
  margin-bottom: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none; /* 隐藏IE和Edge的滚动条 */
  scrollbar-width: none; /* 隐藏Firefox的滚动条 */
  cursor: grab; /* 显示可拖动光标 */
}

.category-tabs-container:active {
  cursor: grabbing; /* 拖动时显示正在拖动的光标 */
}

/* 隐藏Chrome等浏览器的滚动条 */
.category-tabs-container::-webkit-scrollbar {
  display: none;
}

/* 分类标签行 - 设置为不换行 */
.category-tabs {
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* 分类标签 */
.category-tab {
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 4px;
  border-radius: 4px;
  font-size: 14px;
  flex-shrink: 0; /* 防止标签被压缩 */
}

.category-tab.active {
  background-color: #f0f0f0;
}

/* 表情网格 */
.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  max-height: 180px;
  -ms-overflow-style: none; /* 隐藏IE和Edge的滚动条 */
  scrollbar-width: none; /* 隐藏Firefox的滚动条 */
}

/* 隐藏Chrome等浏览器的滚动条 */
.emoji-grid::-webkit-scrollbar {
  display: none;
}

.emoji-item {
  font-size: 18px;
  margin: 5px;
  cursor: pointer;
}

.emoji-item:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>