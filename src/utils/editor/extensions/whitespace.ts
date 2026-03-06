// editor/extensions/whitespace.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const WhitespaceExtension = Extension.create({
  name: 'whitespace',
  
  addStorage() {
    return {
      enabled: true
    }
  },
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('whitespace'),
        // 在解析HTML时处理空格
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some(tr => tr.docChanged)
          if (!docChanged) return null

          let tr = newState.tr
          let modified = false

          // 遍历文档中的所有文本节点，将连续的普通空格替换为不间断空格
          newState.doc.descendants((node, pos) => {
            if (node.isText && node.text) {
              // 查找包含2个或以上连续普通空格的模式
              const multipleSpacesRegex = / {2,}/g
              let match
              
              while ((match = multipleSpacesRegex.exec(node.text)) !== null) {
                // 将匹配的多个普通空格替换为不间断空格
                const replacement = match[0].replace(/ /g, '\u00A0')
                
                // 使用事务替换文本
                tr = tr.insertText(replacement, pos + match.index, pos + match.index + match[0].length)
                modified = true
              }
            }
          })

          return modified ? tr : null
        },
      })
    ]
  }
})