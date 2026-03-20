import request from "@/utils/request";

/**
 * 获取互动趋势
 */
export const getInteractionTrend = (data: {
    userId: number,
    startDate: string,
    endDate: string
}) => {
    return request.post(`/content/create/interactionTrend`, data);
}

/**
 * 获取粉丝增长趋势
 */
export const getFansGrowthTrend = (data: {
    userId: number,
    startDate: string,
    endDate: string
}) => {
    return request.post(`/content/create/fanTrend`, data);
}

/**
 * 创作中心内容列表
 */
export const getContentList = (data: {
    userId: number,
    type?: number,
    pageNum?: number,
    pageSize?: number
}) => {
    return request.get(`/content/create/getCreateContentList`, { params: data });
}

/**
 * 删除内容
 */
export const deleteContent = (data: {
    postId: number,
    userId: number
}) => {
    return request.post(`/content/post/delete`, data);
}

/**
 * 获取工单列表
 */
export const queryWorkOrderList = (params: {
    userId: number,
    pageNum?: number,
    pageSize?: number
}) => {
    return request.get(`/workOrder/query`, { params: params })
}