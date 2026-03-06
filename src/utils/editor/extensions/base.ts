// editor/extensions/base.ts
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'

export const BaseExtensions = [
  StarterKit.configure({
    codeBlock: false, // ❗我们用自定义 CodeBlock
  }),
  Underline,
  Link,
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true // 启用多色支持，允许颜色和背景色共存
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
]
