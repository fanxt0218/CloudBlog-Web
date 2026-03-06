import request from '@/utils/request'

/**
 * 搜索文章
 * @param searchKey 搜索关键词
 * @param publishTime 发布时间
 * @param level 等级
 * @param sort 排序
 * @param isVipOnly 是否只显示VIP内容
 * @param size 每页大小
 * @param cursor 游标
 * @returns 
 */
export const search = (
    searchKey: string,
    publishTime: string | null,
    level: string | null,
    sort: string | null,
    isVipOnly: string | null,
    size: string | null,
    cursor: string | null
) => {
    return request.get('/content/post/search', {
        params: {
            searchKey,
            publishTime,
            level,
            sort,
            isVipOnly,
            size,
            cursor
        }
    })
}

/**
 * 用户搜索历史
 */
export const getSearchHistory = (userId: number) => {
    return request.get('/search/getSearchHistory', {
        params: {
            userId
        }
    })
}

/**
 * 添加搜索记录
 */
export const addSearchHistory = (userId: number, keyword: string, searchType: string) => {
    return request.post('/search/addSearchRecord', {
        userId,
        keyword,
        searchType
    })
}

/**
 * 删除搜索记录
 */
export const deleteSearchHistory = (ids: number[]) => {
    return request.post('/search/deleteSearchRecord', { ids })
}

/**
 * 清空搜索记录
 */
export const clearSearchHistory = (userId: number) => {
    return request.post('/search/clearSearchRecord', {}, { params: { userId } })
}

/**
 * 搜索用户
 */
export const searchUser = (
    keyword: string,
    userId?: number | null
) => {
    return request.get('/search/searchUser', {
        params: {
            userId,
            keyword
        }
    })
}

/**
 * 获取热搜
 */
export const getHotSearch = () => {
    return request.get('/search/getHotSearch')
}



