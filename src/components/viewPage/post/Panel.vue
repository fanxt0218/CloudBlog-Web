<template>
  <div class="toc-float" :class="{'toc-float-light': isLight}">
    <div class="toc-header" :class="{'toc-header-light': isLight}">目录</div>

    <div ref="tocListRef" class="toc-list" :style="{ maxHeight: listHeight + 'px' }">
      <div
        v-for="item in tocList"
        :key="item.id"
        class="toc-item"
        :class="[
          `level-${item.level}`,
          { active: activeId === item.id },
          {'toc-item-light': isLight}
        ]"
        @click="scrollTo(item.id)"
      >
        {{ item.text }}
      </div>
    </div>

    <div class="toc-footer" :class="{'toc-footer-light': isLight}" @click="toggleCollapse"  v-if="tocList.length > 2">
      {{ collapsed ? '展开' : '收起' }} ^
    </div>
  </div>
</template>

<script setup lang="ts" name="Panel">
import { onMounted, ref, onBeforeUnmount, watch, nextTick } from 'vue'

interface TocItem {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  /** 正文容器的选择器 */
  contentSelector: string
}>()

const tocList = ref<TocItem[]>([])
const activeId = ref('')
const collapsed = ref(false)

/**
 * MutationObserver 实例
 */
const observer = ref<MutationObserver | null>(null)

let headings: HTMLElement[] = []

const MIN_HEIGHT = 130   // 收起高度
const MAX_HEIGHT = 320   // 展开高度

const listHeight = ref(MAX_HEIGHT)

/**
 * 是否为浅色主题
 */
const isLight = ref(true)

/**
 * 初始化目录
 */
const initToc = () => {
  const container = document.querySelector(props.contentSelector)
  console.log('container', container)
  if (!container) return

  headings = Array.from(
    container.querySelectorAll('h1,h2,h3,h4,h5,h6')
  ) as HTMLElement[]
  console.log('headings', headings)

  tocList.value = headings.map((el, index) => {
    const level = Number(el.tagName.replace('H', ''))

    if (!el.id) {
      el.id = `toc-heading-${index}`
    }

    return {
      id: el.id,
      text: el.innerText,
      level
    }
  })
}

/**
 * 滚动到指定标题
 */
const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return

  el.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

/**
 * 高亮当前目录
 */
const onScroll = () => {
  const scrollTop = window.scrollY + 80

  for (let i = headings.length - 1; i >= 0; i--) {
    if (headings[i].offsetTop <= scrollTop) {
      activeId.value = headings[i].id
      break
    }
  }
}

const tocListRef = ref<HTMLElement | null>(null)

/**
 * 监听 activeId 变化，自动滚动目录列表
 */
watch(activeId, async (newId) => {
  if (!newId || !tocListRef.value) return
  
  await nextTick()
  const activeItem = tocListRef.value.querySelector('.toc-item.active')
  if (activeItem) {
    activeItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }
})

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  listHeight.value = collapsed.value ? MIN_HEIGHT : MAX_HEIGHT
}

onMounted(() => {
  // 初始尝试初始化目录
  initToc()
  window.addEventListener('scroll', onScroll)
  
  // 设置MutationObserver监听内容容器的变化
  const container = document.querySelector(props.contentSelector)
  if (container) {
    observer.value = new MutationObserver(() => {
      // 当内容变化时重新初始化目录
      initToc()
    })
    
    // 监听容器的子节点变化
    observer.value.observe(container, {
      childList: true,
      subtree: true
    })
  }


})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  // 清理MutationObserver
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.toc-float {
  /* position: fixed; */
  top: 80px;
  /* right: 40px; */
  width: 280px;
  background: linear-gradient(180deg, #2b2b2b, #1f1f1f);
  border-radius: 8px;
  color: #ddd;
  font-size: 14px;
  /* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); */
  overflow: hidden;
  z-index: 1000;
}

.toc-float-light {
  box-shadow: 0 4px 12px rgba(207, 206, 206, 0.267);
  background: linear-gradient(180deg, #fdfdfd, #fafafa);
  color: #222;
}

.toc-header {
  padding: 12px 16px;
  font-weight: bold;
  font-size: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.toc-header-light {
  border-bottom: 1px solid rgba(180, 180, 180, 0.5);
}

.toc-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0;
  transition: max-height 0.25s ease;
}

/* 滚动条美化（可选） */
.toc-list::-webkit-scrollbar {
  width: 6px;
}

.toc-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}

.toc-list::-webkit-scrollbar-track {
  background: transparent;
}


.toc-item {
  color: #c5c5c5;
  padding: 6px 16px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.2s, color 0.2s;
}

.toc-float-light .toc-item {
  color: #555;
}

.toc-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.toc-item.active {
  color: #fc5531;
  background: rgba(226, 116, 116, 0.12);
}

/* ===== 多级缩进 ===== */

.level-1 {
  padding-left: 16px;
  font-weight: 600;
}

.level-2 {
  padding-left: 28px;
}

.level-3 {
  padding-left: 40px;
}

.level-4 {
  padding-left: 52px;
}

.level-5 {
  padding-left: 64px;
}

.level-6 {
  padding-left: 76px;
}

/* ===== 底部 ===== */

.toc-footer {
  padding: 8px 16px;
  font-size: 12px;
  text-align: center;
  color: #aaa;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.toc-footer:hover {
  color: #fff;
}

.toc-footer-light:hover {
  color: #555;
}
</style>
