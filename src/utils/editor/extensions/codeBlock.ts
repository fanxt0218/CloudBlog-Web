// editor/extensions/codeBlock.ts
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'

const lowlight = createLowlight(common)

export const CodeBlockExtension = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (!this.editor.isActive('codeBlock')) return false
        return this.editor.commands.insertContent('  ')
      },
      'Shift-Tab': () => true,
      'Ctrl-Enter': () => {
        if (!this.editor.isActive('codeBlock')) return false
        return this.editor.commands.exitCode()
      },
    }
  },
}).configure({
  lowlight,
})
