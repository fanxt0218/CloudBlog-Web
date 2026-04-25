import request from "@/utils/request";

/**
 * 上传资源文件
 */
export const uploadResource = (formData: FormData) => {
    return request.post(`/content/resource/uploadFile`, formData, {
        // 不设置Content-Type，让浏览器自动设置为multipart/form-data
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 上传资源
 */
export const upload = (data: {
    resourceName: string,
    resourceUrl: string,
    resourceSize: string,
    resourceType: string,
    resourceFormat: string,
    resourceDescription: string,
    resourceTags: string,
    resourceCreator: string,
    resourceIsPublic: string,
    resourceBindContentId: string,
    resourceBindContentTyp: string
}) => {
    return request.post(`/content/resource/upload`, data)
}

/**
 * 获取资源列表
 */
export const getResourceList = (data: {
    userId?: number,
    contentId?: number
}) => {
    return request.get(`/content/resource/getResource`, { params: data })
}

/**
 * 修改资源
 */
export const editResource = (data: {
    id: number
    resourceName: string,
    resourceUrl: string,
    resourceSize: string,
    resourceType: string,
    resourceFormat: string,
    resourceDescription: string,
    resourceTags: string,
    resourceCreator: string,
    resourceIsPublic: string,
    resourceBindContentId: string,
    resourceBindContentTyp: string
}) => {
    return request.post(`/content/resource/updateResource`, data)
}

/**
 * 删除资源
 */
export const deleteResource = (data: {
    id: number
}) => {
    return request.post(`/content/resource/deleteResource`, data)
}

/**
 * 获取资源分类
 */
export const getResourceCategory = () => {
    return request.get(`/content/resource/getResourceCategory`)
}

/**
 * 校验资源是否可下载
 */
export const checkResourceDownload = (data: {
    userId: number,
    resourceId: number
}) => {
    return request.get(`/content/resource/downloadResource`, { params: data })
}

/**
 * 下载资源
 */
export const downloadResource = (data: {
    userId: number,
    url: string,
    filename: string
    token: string
}) => {
    return request.get(`/content/resource/download`, {
        params: data,
        responseType: 'blob'
    })
}

/**
 * 获取精选资源
 */
export const getSelectedResource = () => {
    return request.get(`/content/resource/getSelectedResource`)
}

/**
 * 获取首页资源
 */
export const getIndexResource = (data: {
    po: {
        userId?: number | null,
        name?: string | null,
        tagName?: string | null
    }
    params: {
        cursor?: string | null,
        size?: number | null
    }
}) => {
    return request.post(`/content/resource/getIndexResource`, data.po, { params: data.params })
}
