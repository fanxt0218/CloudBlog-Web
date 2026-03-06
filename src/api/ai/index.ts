import request from '@/utils/request'
import { pa } from 'element-plus/es/locales.mjs';

/**
 * 上传文件
 */
export const uploadFile = (formData: FormData) => {
  return request.post(`/ai/upload`, formData, {
    // 不设置Content-Type，让浏览器自动设置为multipart/form-data
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取对话列表
 */
export const getChatList = (userId: number) => {
  return request.get(`/ai/chatList`, {
    params: {
      userId
    }
  });
}

/**
 * 获取对话详情
 */
/**
 * 获取对话详情
 */
export const getChatDetail = (conversationId: string) => {
  return request.get(`/ai/chatDetail`, {
    params: {
      conversationId
    }
  });
}

/**
 * 对话
 */
export const chat = (userId: number, message: string, conversationId: string, filePath?: string) => {
  return request.post(`/ai/chat`, {}, {
    params: {
      userId,
      message,
      conversationId,
      filePath
    }
  });
}

/**
 * 流式对话
 */
export const chatStream = async (userId: number, message: string, conversationId: string, filePath?: string) => {
  const params = new URLSearchParams({
    userId: userId.toString(),
    message,
    conversationId,
    ...(filePath && { filePath })
  });

  const response = await fetch(`/api/ai/chat?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.body; // Returns ReadableStream<Uint8Array> | null
}

/**
 * 删除对话
 */
export const deleteChat = (conversationId: string) => {
  return request.delete(`/ai/deleteChat`, {
    params: {
      conversationId
    }
  });
}

/**
 * 设置会话标题 
 */
export const setConversationTitle = (conversationId: string) => {
  return request.post(`/ai/setConversationTitle`, {}, {
    params: {
      conversationId
    }
  })
}

/**
 * 创作辅助
 */
export const createAssist = (params: {
  message: string,
  title?: string | null,
  content?: string | null
  type: string | null,
  currnetConversation: string
}) => {
  return request.post(`/ai/createAssist`, params)
}

/**
 * 创作辅助 流式 
 */
export const createAssistStream = async (params: {
  message: string,
  title?: string | null,
  content?: string | null
  type: string | null,
  currentConversation: string
}) => {
  const response = await fetch(`/api/ai/createAssist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.body;
}

/**
 * 总结摘要
 */
export const summaryAbstract = (params: {
  content: string,
}) => {
  return request.post(`/ai/summary`, params)
}


