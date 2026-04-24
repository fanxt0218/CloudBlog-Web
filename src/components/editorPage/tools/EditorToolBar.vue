<template>
  <div class="editor-toolbar">
    <div class="toolbar-group">

      <!-- Undo / Redo -->
      <ToolbarButton
          icon="Undo"
          :disabled="!editor.can().undo()"
          @click="editor.chain().focus().undo().run()"
          tooltip="撤销"
      />
      <ToolbarButton
          icon="Redo"
          :disabled="!editor.can().redo()"
          @click="editor.chain().focus().redo().run()"
          tooltip="重做"
      />

      <ToolbarDivider />

      <!-- Titles -->
      <ToolbarDropdown label="标题" tooltip="标题">
        <div class="dropdown-item" @click="setHeading(0)">正文</div>
        <div class="dropdown-item" @click="setHeading(1)">H1 一级标题</div>
        <div class="dropdown-item" @click="setHeading(2)">H2 二级标题</div>
        <div class="dropdown-item" @click="setHeading(3)">H3 三级标题</div>
      </ToolbarDropdown>

      <!-- 字体颜色 -->
      <ColorPicker
          icon="Palette"
          :colors="textColors"
          :current-color="currentColor"
          @change="setTextColor"
          tooltip="颜色"
      />

      <!-- 背景颜色（高亮） -->
      <ColorPicker
          icon="Highlighter"
          :colors="bgColors"
          :current-color="currentBgColor"
          @change="setHighlight"
          tooltip="背景"
      />

      <!-- 底纹颜色 -->
      <ColorPicker
          icon="Square"
          :colors="shadeColors"
          :current-color="currentShadeColor"
          @change="setShade"
          tooltip="底纹"
      />

      <ToolbarDivider />

      <!-- Text Style -->
      <ToolbarButton
          icon="Bold"
          :active="editor.isActive('bold')"
          @click="editor.chain().focus().toggleBold().run()"
          tooltip="加粗"
      />
      <ToolbarButton
          icon="Italic"
          :active="editor.isActive('italic')"
          @click="editor.chain().focus().toggleItalic().run()"
          tooltip="斜体"
      />
      <ToolbarButton
          icon="Underline"
          :active="editor.isActive('underline')"
          @click="editor.chain().focus().toggleUnderline().run()"
          tooltip="下划线"
      />

      <AlignDropdown @change="setAlign" />

      <ToolbarDivider />

      <!-- Lists -->
      <ToolbarButton
          icon="List"
          :active="editor.isActive('bulletList')"
          @click="editor.chain().focus().toggleBulletList().run()"
          tooltip="无序列表"
      />
      <ToolbarButton
          icon="ListOrdered"
          :active="editor.isActive('orderedList')"
          @click="editor.chain().focus().toggleOrderedList().run()"
          tooltip="有序列表"
      />

      <ToolbarDivider />

      <ToolbarButton
          icon="Code"
          @click="showCodeDialog = true"
          tooltip="插入代码"
      />

      <CodeBlockDialog
          v-model="showCodeDialog"
          @confirm="insertCode"
      />

      <!-- Link -->
      <ToolbarButton icon="Link" @click="showLinkDialog = true" tooltip="链接" />
      
      <!-- Link Dialog -->
      <LinkDialog
        v-model="showLinkDialog"
        :selected-text="selectedText"
        @confirm="handleLinkConfirm"
      />

      <!-- Image Tool -->
      <ImageTool :editor="editor" />

      <!-- Resource Bind Tool -->
      <ResourceBindTool :editor="editor" :selected-draft-id="selectedDraftId" />

      <!-- 草稿 -->
      <div class="draft-wrapper">
        <div
          class="draft-btn"
          @click="showDraftLib"
          title="草稿箱"
        >
          <svg t="1768716827754" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2830" width="19" height="19"> 
            <path d="M960 1024H69.487A69.487 69.487 0 0 1 0 954.513V577.5a5.487 5.487 0 0 1 0.738-2.75l126.525-219.175a5.487 5.487 0 0 0 0.737-2.75V69.488A69.487 69.487 0 0 1 197.5 0h504.225a5.487 5.487 0 0 1 3.888 1.613l188.75 188.75a5.487 5.487 0 0 1 1.612 3.887v188.088a5.487 5.487 0 0 0 0.925 3.05l126.175 189.225a5.487 5.487 0 0 1 0.925 3.05V960a64 64 0 0 1-64 64zM117.975 496.987l-48.112 70.425A5.487 5.487 0 0 0 74.4 576h48.1a5.487 5.487 0 0 0 5.487-5.488v-70.437a5.487 5.487 0 0 0-10.012-3.088zM704 122.5a69.5 69.5 0 0 0 69.5 69.5 5.487 5.487 0 0 0 3.888-9.375l-64.013-64A5.487 5.487 0 0 0 704 122.5zM826.5 256H709.487A69.487 69.487 0 0 1 640 186.512V69.487A5.487 5.487 0 0 0 634.513 64H261.487A69.487 69.487 0 0 0 192 133.487v437.025a5.487 5.487 0 0 0 5.488 5.488h117.1a5.475 5.475 0 0 1 5.475 5.325 192 192 0 0 0 383.85 0A5.475 5.475 0 0 1 709.4 576h117.1a5.487 5.487 0 0 0 5.488-5.487V261.487a5.487 5.487 0 0 0-5.475-5.487zM896 525.262v45.25a5.487 5.487 0 0 0 5.487 5.488h45.25a5.487 5.487 0 0 0 3.888-9.375l-45.25-45.25a5.487 5.487 0 0 0-9.375 3.888z m-570.513-141.25h373.025A5.487 5.487 0 0 1 704 389.5v53a5.487 5.487 0 0 1-5.488 5.487H325.488A5.487 5.487 0 0 1 320 442.5v-53.013a5.487 5.487 0 0 1 5.487-5.487z m0-128h245a5.487 5.487 0 0 1 5.488 5.488v53.013a5.487 5.487 0 0 1-5.488 5.487h-245a5.487 5.487 0 0 1-5.487-5.487v-53.025a5.487 5.487 0 0 1 5.487-5.488z m-5.487 0" fill="#707070" p-id="2831">
            </path>
          </svg>
          草稿箱
        </div>
      
        <div class="draft-lib" v-if="isShowDraftLib">
          <DraftLib  @draft-selected="handleDraftSelect" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="EditorToolBar">
import { ref, computed } from 'vue'
// import { defineProps } from 'vue'
import {
  Undo, Redo, Bold, Italic, Underline,
  List, ListOrdered, Code, Link, Image
} from 'lucide-vue-next'
import ToolbarButton from './ToolBarButton.vue'
import ToolbarDivider from './ToolBarDivider.vue'
import ToolbarDropdown from './ToolBarDropdown.vue'
import ColorPicker from './ColorPicker.vue'
import AlignDropdown from './AlignDropDown.vue'
import CodeBlockDialog from './CodeBlockDialog.vue'
import LinkDialog from './LinkDiaLog.vue'  // 新增导入
import ResourceBindTool from './ResourceBindTool.vue'
import DraftLib from '@/components/public/DraftLib.vue'
import { getPostViewPage } from '@/api/index/viewPage.ts'
import type { PostView } from '@/types/index.ts'

const props = defineProps<{ 
  editor: any,
  selectedDraftId?: number | null
}>()

const emit = defineEmits(['selectDraft'])

const setHeading = (level: number) => {
  if (level === 0) {
    props.editor.chain().focus().setParagraph().run()
  } else {
    props.editor.chain().focus().toggleHeading({ level }).run()
  }
}

const textColors = [
  '#000000', '#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7',
  '#f43f5e', '#475569'
]

const bgColors = [
  '#fff7e6', '#ffe7ba', '#ffccc7', '#ffd6e7', '#e6f7ff', '#e6fffb', '#f6ffed', '#f9f0ff'
]

const shadeColors = [
  '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'
]

const setTextColor = (color: string) => {
  if (color === 'transparent') {
    props.editor.chain().focus().unsetColor().run()
  } else {
    props.editor.chain().focus().setColor(color).run()
  }
}

const setHighlight = (color: string) => {
  if (color === 'transparent') {
    props.editor.chain().focus().unsetHighlight().run()
  } else {
    props.editor.chain().focus().setHighlight({ color }).run()
  }
}

const setShade = (color: string) => {
  if (color === 'transparent') {
    props.editor.chain().focus().unsetBackgroundColor().run()
  } else {
    props.editor.chain().focus().setBackgroundColor(color).run()
  }
}

const setAlign = (type: 'left' | 'center' | 'right') => {
  const { state } = props.editor
  const { selection } = state

  const node = selection.node
  if (node?.type.name === 'imageResize') {
    props.editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.setNodeMarkup(selection.from, undefined, {
          ...node.attrs,
          align: type,
        })
        return true
      })
      .run()
  } else {
    props.editor.chain().focus().setTextAlign(type).run()
  }
}

// 计算当前选中的颜色
const currentColor = computed(() => {
  return props.editor.getAttributes('textStyle').color || ''
})

// 计算当前选中的背景颜色
const currentBgColor = computed(() => {
  return props.editor.getAttributes('highlight').color || ''
})

// 计算当前选中的底纹颜色
const currentShadeColor = computed(() => {
  return props.editor.getAttributes('backgroundColor').color || ''
})

// 计算选中的文本
const selectedText = computed(() => {
  const { state } = props.editor
  const { from, to } = state.selection
  return state.doc.textBetween(from, to)
})

// 控制链接对话框显示
const showLinkDialog = ref(false)

// 处理链接确认
const handleLinkConfirm = ({ text, url }: { text: string; url: string }) => {
  if (selectedText.value) {
    // 如果有选中文本，将选中文本设为链接
    props.editor.chain().focus().setLink({ href: url }).run()
  } else {
    // 如果没有选中文本，在光标处插入链接
    props.editor
      .chain()
      .focus()
      .insertContent(text)
      .setLink({ href: url })
      .run()
  }
}

// 代码块框

const showCodeDialog = ref(false)

const insertCode = (rawCode: string) => {
  props.editor
      .chain()
      .focus()
      .insertContent({
        type: 'codeBlock',
        attrs: { language: 'javascript' }, // 可改自动识别
        content: [{ type: 'text', text: rawCode }],
      })
      .run()
}

// 草稿箱
const isShowDraftLib = ref(false)

const showDraftLib = () => {
  isShowDraftLib.value = !isShowDraftLib.value
}

// 在 EditorToolBar.vue 中添加草稿选择回调函数
const handleDraftSelect = (draftId: number) => {
  let content: string;
  let title: string;
  // 获取草稿内容
  getPostViewPage({
    postId: draftId
  }).then(res => {
    content = res.data.content;
    title = res.data.title;
    
    // 使用编辑器的setContent方法加载草稿内容
    props.editor.commands.setContent(content);
    // 隐藏草稿库
    isShowDraftLib.value = false;
    // 通知manage组件
    emit('selectDraft', draftId, title)
  })
}
</script>

<style scoped>
.editor-toolbar {
  position: fixed;
  top: 40px;
  left: 0;
  width: 100%;
  height: 55px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  padding: 0 12px;
  z-index: 999;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  margin-top: 10px;
}

.draft-btn {
  border: 1px solid #e5e6eb;
  color: #333333d5;
  padding: 4px 8px;
  border-radius: 6px;
  background: #eeeeee8a;
  margin-left: 20px;
  align-items: center;       /* 垂直居中 */
  justify-content: center;   /* 水平居中 */
  gap: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: #dcdcdda1;
  }
}

/* 草稿整体容器：定位锚点 */
.draft-wrapper {
  position: relative;
  /* margin-left: 10px; */
}

/* 草稿箱弹层 */
.draft-lib {
  position: absolute;
  top: calc(100% + 8px);   /* 按钮正下方留点空隙 */
  left: -20px;               /* 右对齐按钮（推荐） */
  width: 520px;
  max-height: 400px;
  background: #fff;
  /* border: 1px solid #e5e6eb; */
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 2000;
  /* overflow-y: auto; */
}

</style>