// editor/useEditor.ts
import { useEditor } from '@tiptap/vue-3'
import { BaseExtensions } from './extensions/base'
import { KeyboardExtension } from './extensions/keyboard'
import { WhitespaceExtension } from './extensions/whitespace'
import { ImageExtension, ImageResize } from './extensions/image'
import { CodeBlockExtension } from './extensions/codeBlock'

export const createEditor = (onUpdate: (editor: any) => void) => {
  return useEditor({
    extensions: [
      ...BaseExtensions,
      KeyboardExtension,
      WhitespaceExtension,
      ImageExtension,
      ImageResize,
      CodeBlockExtension,
    ],
    content: '<p></p>',
    autofocus: true,
    editable: true,
    onUpdate: ({ editor }) => onUpdate(editor),
  })
}
