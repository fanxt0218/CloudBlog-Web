<template>
  <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts" name="MarkdownRenderer">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const renderedHtml = computed(() => md.render(props.content))
</script>

<style scoped>
.markdown-renderer {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

/* 标题 */
.markdown-renderer h1 {
  font-size: 28px;
  margin: 32px 0 20px;
}

.markdown-renderer h2 {
  font-size: 22px;
  margin: 28px 0 16px;
}

/* 段落 */
.markdown-renderer p {
  margin: 12px 0;
}

/* 列表 */
.markdown-renderer ul,
.markdown-renderer ol {
  padding-left: 24px;
  margin: 12px 0;
}

/* 图片 */
.markdown-renderer img {
  max-width: 100%;
  border-radius: 6px;
  margin: 16px auto;
  display: block;
}

/* 代码块 */
.markdown-renderer pre {
  background: #f6f8fa;
  padding: 14px;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-renderer code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
