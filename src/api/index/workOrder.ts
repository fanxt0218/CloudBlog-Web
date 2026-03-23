import request from "@/utils/request";

/**
 * 内容举报
 */
export const reportContent = (data: {
    targetType: number,
    targetId: number,
    reason: string,
    filePath?: string
}) => {
    return request.post(`/workOrder/report`, data);
}

/**
 * 提交工单
 */
export const submitWorkOrder = (data: {
    orderId?: string
    userId?: number,
    targetId?: number,
    targetType: number,
    orderType: number,
    reason: string,
}) => {
    return request.post(`/workOrder/submit`, data)
}