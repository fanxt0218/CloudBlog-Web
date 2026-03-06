<template>
  <div class="tag-selector">
    <!-- 搜索 -->
    <div class="tag-search">
      <el-select
        v-model="value"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="请输入文字搜索，点击后可添加标签"
        :remote-method="remoteMethod"
        :loading="loading"
        @change="handleChange"
      >
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.tagName"
          :value="item.id"
          @click="selectTag(item)"
        />
      </el-select>
    </div>

    <!-- 主体 -->
    <div class="main-content">
      <!-- 左侧：分类 -->
      <div class="tag-classes">
        <div
          v-for="item in tagClasses"
          :key="item.id"
          class="class-item"
          :class="{ active: item.id === activeClassId }"
          @click="handleClassClick(item.id)"
        >
          {{ item.className }}
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider"></div>

      <!-- 右侧：标签 -->
      <div class="tags">
        <div class="tags-header">添加标签</div>

        <div class="tag-list">
          <div
            v-for="tag in tags"
            :key="tag.id"
            class="tag-item"
            effect="plain"
            @click="selectTag(tag)"
            :class="{ selected: props.selectedTags.some(t => t.id === tag.id) }"
          >
            {{ tag.tagName }}
          </div>
        </div>
        <div class="tip" :class="{warn: props.selectedTags.length >= 6}">
            {{ tipText }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="TagSelector">
import { ref, onMounted } from 'vue'
import { getTagClassList } from '@/api/userInfo/personal'
import { getInterestTags } from '@/api/index/indexPage'
import type { TagClasses, Tags, Tag } from '@/types'

const list = ref<Tags>([])
const options = ref<Tags>([])
const value = ref<string[]>([])
const loading = ref(false)

const tagClasses = ref<TagClasses>([])
const tags = ref<Tags>([])
const searchText = ref('')
const activeClassId = ref<number | null>(null)

const emit = defineEmits(['select-tag','close-selector'])
const props = defineProps<{
  selectedTags: Tag[]
}>()

let tipText = ref(
    props.selectedTags.length >= 6 ?
     '最多添加 6 个标签！' 
     : 
     '还可添加 ' + (6 - props.selectedTags.length) + ' 个标签'
    )

const getTags = (tagClassId: number) => {
  activeClassId.value = tagClassId
  getInterestTags(tagClassId).then(res => {
    // 遍历清除旧标签，避免重复加载
    tags.value = res.data
  })
}

const handleClassClick = (id: number) => {
  getTags(id)
}

const selectTag = (tag: Tag) => {
  console.log('选择标签：', tag)
  if (props.selectedTags.length >= 6) {
    return
  }
  emit('select-tag', tag)
}

// 远程搜索方法
const remoteMethod = (query: string) => {
  if (query) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      options.value = list.value.filter((item) => {
        return item.tagName.toLowerCase().includes(query.toLowerCase())
      })
    }, 200)
  } else {
    options.value = []
  }
}

// 处理选择变化
const handleChange = (selected: string[]) => {
  emit('close-selector')
}

onMounted(() => {
  getTagClassList().then(res => {
    tagClasses.value = res.data
    if (tagClasses.value && tagClasses.value.length) {
        getTags(tagClasses.value[0].id)
    }
  })

  // 初始化远程标签列表
  getInterestTags(null).then(res => {
    list.value = res.data
  })
})
</script>

<style scoped>
.tag-selector {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 12px;
  width: 100%;
}

/* 搜索框 */
.tag-search {
  margin-bottom: 12px;
}

/* 主体左右布局 */
.main-content {
  display: flex;
  /* align-items: flex-start; */
}

/* 左侧分类 */
.tag-classes {
  width: 140px;
}

.class-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  border-radius: 4px;
}

.class-item:hover {
  background: #f5f7fa;
}

.class-item.active {
  /* color: #409eff; */
  background: #eee;
  font-weight: 500;
}

/* 中间分割线 */
.divider {
  width: 1px;
  background-color: #ebeef5;
  margin: 0 12px;
}

/* 右侧标签区 */
.tags {
  width: 360px;     /* 固定宽度，按你页面实际微调 */
  flex-shrink: 0;
  position: relative;
}

.tags-header {
  font-size: 14px;
  color: #797a7c;
  margin-bottom: 8px;
}

/* 标签列表 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  min-height: 32px;
  padding-bottom: 28px;   /* 给 tip 让位 */
}

/* 单个标签样式 */
.tag-item {
  cursor: pointer;
  /* border-color: #c6e2ff; */
  color: #646464;
  background-color: #eee;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 15px;
}

.tag-item.selected {
  background-color: #79b7f5;
  color: #fff;
}

/* tip 固定右下角 */
.tip {
  position: absolute;
  right: -2px;
  bottom: 0;
  font-size: 12px;
  font-weight: 300;
  color: #909399;
  line-height: 1;
}

.warn {
  color: #ff0000;
}

</style>
