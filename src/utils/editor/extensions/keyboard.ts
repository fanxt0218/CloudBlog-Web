// editor/extensions/keyboard.ts
import { Extension } from '@tiptap/core'

export const KeyboardExtension = Extension.create({
  name: 'keyboard-fix',

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        this.editor.commands.insertContent('\u00A0\u00A0\u00A0\u00A0')
        return true
      },
      'Shift-Tab': () => {
        // 禁止浏览器切换焦点
        return true
      },
    }
  },
})
