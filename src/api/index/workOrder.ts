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