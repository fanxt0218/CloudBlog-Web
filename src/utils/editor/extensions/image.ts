import { Node, mergeAttributes } from '@tiptap/core'

// editor/extensions/image.ts
import Image from '@tiptap/extension-image'

export const ImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center', // 修改为默认居中
        parseHTML: el => {
          // 从HTML元素解析对齐方式
          const align = el.getAttribute('data-align')
          if (align) return align

          // 从样式属性推断对齐方式
          const style = el.getAttribute('style') || ''
          if (style.includes('margin-left:auto') && style.includes('margin-right:auto')) {
            return 'center'
          } else if (style.includes('float:right')) {
            return 'right'
          } else if (style.includes('float:left')) {
            return 'left'
          }
          return 'center' // 默认值改为居中
        },
        renderHTML: attrs => {
          // 根据对齐方式生成对应的HTML属性和样式
          const styles = []

          if (attrs.width) {
            styles.push(`width: ${attrs.width}px`)
          }
          styles.push('height: auto')

          // 统一使用 block 布局
          styles.push('display: block')

          if (attrs.align === 'center') {
            styles.push('margin-left: auto', 'margin-right: auto')
          } else if (attrs.align === 'left') {
            styles.push('margin-right: auto', 'margin-left: 0')
          } else if (attrs.align === 'right') {
            styles.push('margin-left: auto', 'margin-right: 0')
          }

          return {
            'data-align': attrs.align,
            style: styles.join('; '),
          }
        },
      },
      width: {
        default: null,
        parseHTML: el => {
          // 尝试从width属性或样式中获取宽度
          const widthAttr = el.getAttribute('width')
          if (widthAttr) return parseInt(widthAttr, 10)

          const style = el.getAttribute('style') || ''
          const widthMatch = style.match(/width:\s*(\d+)px/)
          if (widthMatch) return parseInt(widthMatch[1], 10)

          return null
        },
        renderHTML: attrs => {
          // 如果有宽度值，则返回，否则返回空对象
          return attrs.width ? { width: attrs.width } : {}
        },
      },
    }
  },

  // 确保HTML渲染正确
  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ]
  },
})

export const ImageResize = Node.create({
  name: 'imageResize',

  group: 'block',
  draggable: true,
  selectable: true,
  isolating: true,   // ✅ 非常关键
  defining: true,   // ✅ 非常关键

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => {
          // 从div中提取img标签的src属性
          const img = element.querySelector('img')
          if (img) {
            return img.getAttribute('src')
          }
          // 或者直接从div的属性获取
          return element.getAttribute('src') || element.getAttribute('data-src')
        }
      },
      width: {
        default: 400,
        parseHTML: element => {
          // 从样式中解析宽度
          const style = element.getAttribute('style') || ''
          const widthMatch = style.match(/width:\s*(\d+)px/)
          if (widthMatch) return parseInt(widthMatch[1], 10)

          // 也可以尝试从data-width属性获取
          const dataWidth = element.getAttribute('data-width')
          if (dataWidth) return parseInt(dataWidth, 10)

          return 400
        }
      },
      align: {
        default: 'center',
        parseHTML: element => {
          // 从data-align属性获取对齐方式
          const align = element.getAttribute('data-align')
          if (align) return align

          // 从样式中推断对齐方式
          const style = element.getAttribute('style') || ''
          if (style.includes('margin:0px auto') || style.includes('margin:0 auto')) {
            return 'center'
          } else if (style.includes('float:right') || style.includes('margin:0 0 0 auto')) {
            return 'right'
          } else if (style.includes('float:left') || style.includes('margin:0 auto 0 0')) {
            return 'left'
          }

          return 'center'
        }
      },
    }
  },


  renderHTML({ HTMLAttributes }) {
    const { align, width, src } = HTMLAttributes
    return [
      'div',
      {
        'data-type': 'image-resize',
        'data-align': align,
        style: `
          width:${width}px;
          margin:${align === 'center'
            ? '0 auto'
            : align === 'left'
              ? '0 auto 0 0'
              : '0 0 0 auto'};
          position: relative;
          display: block;
        `,
      },
      ['img', { src: src, style: 'width: 100%; height: auto;' }],
    ]
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-resize"]',
      },
      {
        tag: 'div[data-align]',  // 也匹配带data-align属性的div
      }
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node // Track the current node state
      const wrapper = document.createElement('div')
      wrapper.className = 'img-resizable'

      // Helper function to update styles based on attributes
      const updateStyle = (attrs: any) => {
        const { align, width } = attrs
        const widthStyle = width ? `width: ${width}px;` : ''

        let alignStyle = ''
        if (align === 'center') {
          alignStyle = `
            display: block;
            margin: 0 auto;
          `
        } else if (align === 'right') {
          alignStyle = `
            display: block;
            margin: 0 0 0 auto;
          `
        } else if (align === 'left') {
          alignStyle = `
            display: block;
            margin: 0 auto 0 0;
          `
        } else {
          // Default: block, left aligned
          alignStyle = `
            display: block;
            margin: 0 auto 0 0;
          `
        }

        wrapper.style.cssText = `
          position: relative;
          max-width: 100%;
          ${widthStyle}
          ${alignStyle}
        `
      }

      // Initial style application
      updateStyle(node.attrs)

      const img = document.createElement('img')
      img.src = node.attrs.src
      img.draggable = false
      img.style.cssText = 'width: 100%; height: auto; display: block;'

      const handle = document.createElement('span')
      handle.className = 'resize-handle'
      handle.style.cssText = `
        position: absolute;
        right: -5px;
        bottom: -5px;
        width: 12px;
        height: 12px;
        background: #409eff;
        border: 1px solid white;
        border-radius: 2px;
        cursor: se-resize;
        display: none;
        z-index: 100;
      `

      wrapper.append(img, handle)

      // 当鼠标悬停在图片上时显示调整大小的手柄
      wrapper.addEventListener('mouseenter', () => {
        handle.style.display = 'block'
      })

      wrapper.addEventListener('mouseleave', () => {
        // 只有当编辑器未处于激活状态或不在拖拽手柄时才隐藏手柄
        if (!wrapper.classList.contains('resizing')) {
          handle.style.display = 'none'
        }
      })

      handle.onmousedown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        wrapper.classList.add('resizing')
        const startX = e.clientX
        const startWidth = wrapper.offsetWidth
        const startHeight = img.offsetHeight * (startWidth / img.offsetWidth) // 保持宽高比

        const onMove = (ev: MouseEvent) => {
          const newWidth = Math.max(80, startWidth + (ev.clientX - startX))
          wrapper.style.width = newWidth + 'px'
        }

        const onUp = () => {
          wrapper.classList.remove('resizing')
          if (!wrapper.matches(':hover')) {
            handle.style.display = 'none'
          }

          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)

          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              tr.setNodeMarkup(getPos(), undefined, {
                ...currentNode.attrs,
                width: wrapper.offsetWidth,
              })
              return true
            })
            .run()
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      }

      return {
        dom: wrapper,

        stopEvent: (event) => {
          return (event.target as HTMLElement).classList.contains('resize-handle')
        },

        update: (updatedNode) => {
          if (updatedNode.type.name === this.name) {
            currentNode = updatedNode // Critically update the tracked node state

            // Update styles including width and alignment
            updateStyle(updatedNode.attrs)

            // 更新图片src
            if (updatedNode.attrs.src !== img.src) {
              img.src = updatedNode.attrs.src
            }
            // Update node reference for next update? 
            // `node` variable in closure is stale, but we use `updatedNode.attrs` so it is fine.
            return true
          }
          return false
        }
      }
    }
  }

})