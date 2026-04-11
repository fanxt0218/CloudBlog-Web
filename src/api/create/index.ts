import request from '@/utils/request'

/**
 * 上传图片
 */
export const uploadImage = (formData: FormData) => {
  return request.post(`/content/create/uploadImage`, formData, {
    // 不设置Content-Type，让浏览器自动设置为multipart/form-data
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 上传视频
 */
export const uploadVideo = (formData: FormData) => {
  return request.post(`/content/create/uploadVideo`, formData, {
    // 不设置Content-Type，让浏览器自动设置为multipart/form-data
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取动态页话题列表
 */
export const getPublishPageTopicList = () => {
  return request.get(`/content/share/getCreateTopicList`);
}

/**
 * 发布动态
 */
export const publishShare = (data: {
  userId: number,
  topicId?: number | null,
  content: string,
  imageUrls?: string[] | null,
  videoUrls?: string[] | null
}) => {
  return request.post(`/content/share/publish`, data);
}

/**
 * 发布文章
 */
export const publishPost = (data: {
  userId: number,
  title: string,
  content: string,
  cover: string,
  intro: string,
  tagIds: number[],
  categoryId: number | null,
  postType: number,
  type: number,
  vip: number
}) => {
  return request.post(`/content/post/publish`, data);
}

/**
 * 保存草稿
 */
export const saveDraft = (data: {
  userId: number,
  postId?: number | null,
  title: string,
  content: string
}) => {
  return request.post(`/content/post/saveDraft`, data);
}

/**
 * 获取草稿列表
 */
export const getDraftList = (data: {
  userId: number
}) => {
  return request.get(`/content/post/getDraftList`, { params: data });
}

/**
 * 编辑动态
 */
export const editShare = (data: {
  shareId: number,
  userId: number,
  topicId?: number | null,
  content: string,
  imageUrls?: string[] | null,
  videoUrls?: string[] | null
}) => {
  return request.post(`/content/share/edit`, data);
}