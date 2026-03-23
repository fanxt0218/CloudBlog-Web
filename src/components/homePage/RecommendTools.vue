<template>
    <div class="main-news-content">
        <div class="revolving-lantern">
            <el-carousel height="250px" style="border-radius: 12px;" indicator-position="outside">
              <el-carousel-item 
                v-for="(block, index) in blocks" 
                :key="index"
              >
                <div class="carousel-block">
                  <div 
                    v-for="item in block" 
                    :key="item.id" 
                    class="card"
                    @click="handleJumpToToolDetail(item.attributes.url)"
                  >
                    <div class="left-icon">
                      <img :src="`/api${item.contentValue}`" />
                    </div>
                    <div class="right-info">
                      <div class="title">{{ item.attributes.title }}</div>
                      <div class="desc">{{ item.attributes.desc }}</div>
                      <div class="extra">
                        <span class="tag">{{ item.attributes.tag }}</span>
                        <span class="hot">🔥 {{ item.attributes.hotNum }}</span>
                      </div>
                    </div>
                    <div class="more-btn">查看详情 →</div>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
        </div>
    </div>
</template>
<script setup lang="ts" name="RecommendTools">
import { ref, onMounted } from 'vue'
import { getWebsiteComponentInfo } from '@/utils/websiteComponent';
import type { WebsiteComponentDefine } from '@/types';

const blocks = ref<any[][]>([])

// const blocks = ref([
//   // 轮播页 1
//   [
//     { id: 1, icon: '/api/profile/system/index-recommend-tools/Github.png', title: 'GitHub', desc: '开源项目托管平台', tag: '开源', hot: '50.8K', link: 'https://github.com/' },
//     { id: 2, icon: '/api/profile/system/index-recommend-tools/sora.png', title: 'Sora', desc: 'OpenAI旗下视频生成平台', tag: 'AIGC', hot: '50.0K', link: 'https://openai.com/sora' },
//     { id: 3, icon: '/api/profile/system/index-recommend-tools/huggingface.png', title: 'Hugging Face', desc: '自然语言处理模型平台', tag: '开源', hot: '39.5K', link: 'https://huggingface.co/' },
//     { id: 4, icon: '/api/profile/system/index-recommend-tools/jimeng.png', title: '即梦AI', desc: '一站式AI创作平台', tag: 'AIGC', hot: '21.8K', link: 'https://jimeng.aigc.cc/' }
//   ],
//   // 轮播页 2
//   [
//     { id: 5, icon: '/api/profile/system/index-recommend-tools/OpenAI.png', title: 'OpenAI', desc: 'OpenAI旗下ChatGpt大模型', tag: 'AI', hot: '18.2K', link: 'https://openai.com/' },
//     { id: 6, icon: '/api/profile/system/index-recommend-tools/Qwen.png', title: 'Qwen', desc: '阿里旗下同通义大模型', tag: 'AI', hot: '21.7K', link: 'https://tongyi.aliyun.com/' },
//     { id: 7, icon: '/api/profile/system/index-recommend-tools/Gemini.png', title: 'Gemini', desc: '谷歌旗下大模型', tag: 'AI', hot: '33.2K', link: 'https://gemini.google.com/' },
//     { id: 8, icon: '/api/profile/system/index-recommend-tools/DeepSeek.png', title: 'DeepSeek', desc: '宇树科技旗下大模型', tag: 'AI', hot: '44.1K', link: 'https://deepseek.com/' }
//   ],
// ])

/**
 * 处理跳转工具详情页
 * @param link 
 */
const handleJumpToToolDetail = (link: string) => {
    window.open(link, '_blank')
}

/**
 * 加载推荐工具
 */
async function loadRecommendTools() {
  try {
    const res = await getWebsiteComponentInfo('HOME', 'recommend_tool');
    console.log('res', res)
    if (res && res.length > 0) {
      // 1. 先解析所有项的 attributes
      const parsedItems = (res as any[]).map(item => {
        if (typeof item.attributes === 'string' && item.attributes) {
          try {
            item.attributes = JSON.parse(item.attributes);
          } catch (e) {
            console.error('解析 attributes 失败:', e, item.attributes);
            item.attributes = {};
          }
        }
        return item;
      });

      // 2. 每四个分为一组
      const temp = []
      for (let i = 0; i < parsedItems.length; i += 4) {
        temp.push(parsedItems.slice(i, i + 4))
      }
      blocks.value = temp
    }
    console.log('blocks.value', blocks.value)
  } catch (error) {
    console.error('加载推荐工具失败:', error);
  }
}

onMounted(() => {
    loadRecommendTools();
})
</script>
<style scoped>
.main-news-content {
    padding: 10px 0;
    width: 100%;
    /* height: 100%; */
}

.revolving-lantern {
  max-height: 250px;
  margin-bottom: 20px;
  cursor: pointer;
  /* background-color: #f5f5f5; */
}

.revolving-lantern :deep(.el-carousel__arrow) {
  display: none !important;
}

/* ------------------------------------------------------ */
.carousel-block {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  height: 100%;
}

.card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: #f7faff;
  border: 1px solid #e5e7eb;
  position: relative;
  margin-bottom: 16px; margin-top: -10px;

  &:hover {
    .title {
      color: #0573e0;
    }
  }
}

.left-icon {
  display: flex;
  align-items: center; 
  justify-content: center;
}

.left-icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.right-info {
  margin-left: 12px;
  flex: 1;
}

.title {
  font-size: 15px;
  font-weight: bold;
}

.desc {
  font-size: 13px;
  color: #666;
  margin: 4px 0;
}

.extra {
  font-size: 12px;
  color: #888;
}

.tag {
  color: #6c5ce7;
  margin-right: 10px;
}

.more-btn {
  position: absolute;
  bottom: 10px;
  right: 12px;
  font-size: 13px;
  color: #383838;
  cursor: pointer;
  border: 1px solid #fff;
  background-color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  border-radius: 6px;
}

/* ------------------------------------ */
</style>