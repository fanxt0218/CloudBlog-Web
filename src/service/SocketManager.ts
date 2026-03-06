// wsService.ts
import mitt from 'mitt'

type Events = {
    CHAT: any
    COMMENT: any
    NEW_FAN: any
    NEW_LIKE: any
    NEW_COLLECT: any
}

class WSService {
  private ws: WebSocket | null = null
  private emitter = mitt<Events>()
  private connected = false

  connect(userId: number | null) {
    if (this.connected) return
    if (!userId) return
    const wsUrl = `/ws/chat/${userId}`
    this.ws = new WebSocket(wsUrl)
    console.log('[WS] connecting to', wsUrl)

    this.ws.onopen = () => {
      this.connected = true
      console.log('[WS] connected')
    }

    this.ws.onclose = () => {
      this.connected = false
      console.log('[WS] disconnected')
      // 可加自动重连逻辑
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // 按类型分发事件
      if (data.type === 'CHAT') this.emitter.emit('CHAT', data.data)
      else if (data.type === 'COMMENT') this.emitter.emit('COMMENT', data.data)
      else if (data.type === 'NEW_FAN') this.emitter.emit('NEW_FAN', data.data)
    }
  }

  disconnect() {
    this.ws?.close()
    this.connected = false
  }

  on<K extends keyof Events>(type: K, handler: (data: Events[K]) => void) {
    this.emitter.on(type, handler)
  }

  off<K extends keyof Events>(type: K, handler: (data: Events[K]) => void) {
    this.emitter.off(type, handler)
  }

  send(data: any) {
    this.ws?.send(JSON.stringify(data))
  }
}

export const wsService = new WSService()
