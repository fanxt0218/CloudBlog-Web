import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { uploadImage } from '@/api/create'
import { ElMessage } from 'element-plus'

interface ApiResponse {
  code: number
  data: any
  msg?: string
}

export const ImagePasteExtension = Extension.create({
  name: 'imagePaste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imagePaste'),
        props: {
          handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || [])
            const files = items
              .filter(item => item.type.startsWith('image/'))
              .map(item => item.getAsFile())
              .filter((file): file is File => file !== null)

            if (files.length === 0) {
              return false
            }

            event.preventDefault()

            files.forEach(file => {
              this.options.upload(file, view)
            })

            return true
          },
          handleDrop: (view, event) => {
            const files = Array.from(event.dataTransfer?.files || [])
              .filter(file => file.type.startsWith('image/'))

            if (files.length === 0) {
              return false
            }

            event.preventDefault()

            files.forEach(file => {
              this.options.upload(file, view)
            })

            return true
          },
        },
      }),
    ]
  },

  addOptions() {
    return {
      upload: async (file: File, view: any) => {
        // 100MB 限制
        const maxSize = 100 * 1024 * 1024
        if (file.size > maxSize) {
          ElMessage.error(`图片 "${file.name}" 超过 100MB 限制`)
          return
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
          const res = await uploadImage(formData) as any as ApiResponse
          if (res.code === 200) {
            const { schema, tr } = view.state
            // 使用之前定义的 imageResize 节点，这是项目中自定义的带缩放功能的图片节点
            const node = schema.nodes.imageResize.create({
              src: `/api${res.data}`,
            })

            const transaction = tr.replaceSelectionWith(node)
            view.dispatch(transaction)
          } else {
            ElMessage.error(res.msg || '图片上传失败')
          }
        } catch (error) {
          console.error('Image upload failed:', error)
          ElMessage.error('图片上传过程中发生错误')
        }
      },
    }
  },
})
