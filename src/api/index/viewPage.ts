import request from '@/utils/request'

/**
 * 动态页
 */
export const getShareViewPage = (
    data: {
        shareId: number,
        userId?: number
    }) => {
    return request.get(`/content/share/getShare`, { params: data });
}

/**
 * 评论列表
 */
export const getCommentList = (data: {
    contentId: number,
    type: number,
    parentId?: number | null,
    userId?: number | null
}) => {
    return request.get(`/content/comment/getComments`, { params: data });
}

/**
 * 删除评论
 */
export const delComment = (commentId: number) => {
    return request.post(`/content/comment/deleteComment`, {}, { params: { commentId } });
}

/**
 * 评论
 */
export const comment = (data: {
    userId: number,
    targetCommentId: number | null,
    contentId: number,
    content: string,
    type: number
}) => {
    return request.post(`/content/comment/comment`, data);
}

/**
 * 计算内容评论数
 */
export const calcCommentCount = (data: {
    contentId: number,
    type: number
}) => {
    return request.get(`/content/comment/calculateCommentCount`, { params: data });
}

/**
 * 预览文章
 */
export const getPostViewPage = (data: {
    postId: number,
    userId?: number
}) => {
    return request.get(`/content/post/getPost`, { params: data });
}

/**
 * 获取文章浏览量top10
 */
export const getBrowseTopPostList = (data: {
    postType: number
}) => {
    return request.get(`/content/post/getBrowseCountList`, { params: data });
}

/**
 * 增加文章浏览量
 */
export const addPostViewCount = (data: {
    postId: number,
    userId: number,
    contentType: number
}) => {
    return request.post(`/content/post/addBrowseCount`, data);
}

/**
 * 创建收藏夹
 */
export const createCollect = (data: {
    userId: number,
    name: string,
    description: string,
    isPrivate?: boolean,
    isDefault?: boolean
}) => {
    return request.post(`/content/collect/newFavorites`, data);
}

/**
 * 获取目标内容已收藏的收藏夹
 */
export const getTargetHasCollected = (data: {
    userId: number,
    postId: number,
}) => {
    return request.get(`/content/collect/getTargetHasCollectedFavorites`, { params: data });
}

