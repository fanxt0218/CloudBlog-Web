import request from "@/utils/request";

/**
 * 获取网站组件信息
 */
export const getWebsiteComponents = (data: {
    category: string,
    contentType: string
}) => {
    return request.post(`/admin/website/getComponentDefineForUser`, data)
}