import request from '@/utils/request'

/**
 * 登录
 */
export const login = (
    data: {
        loginType: string,
        target: string,
        password: string,
        twicePassword: string
    }
) => {
    return request.post(`/user/login`, data);
}

/**
 * 验证码登录
 */
export const loginByCode = (
    data: {
        target: string,
        checkCode: string,
        type: string
    }
) => {
    return request.post(`/user/checkCodeLogin`, {}, { params: data });
}

/**
 * 获取兴趣标签
 */
export const getInterestTags = (classId: number | null) => {
    return request.get(`/content/Interest/tagList`, { params: { classId } });
}

/**
 * 获取文章/资讯
 */
export const getIndexPostList = (
    po: {
        userId: number | null,
        tagId: number | null,
        postType: number | null,
    },
    params: {
        cursor?: string | null,
        size?: number | null,
        sortBy?: string | null,
        tag?: string | null
    }
) => {
    return request.post(`/content/post/getIndexPostList`, po, { params });
}

/**
 * 获取推荐用户
 */
export const getRecommendUsers = (
    params: {
        cursor?: string | null,
        size?: number | null,
        type?: number | null,
    }
) => {
    return request.get(`/userInfo/homePage/scoreBasedUsers`, { params });
}

/**
 * 获取首页动态列表
 */
export const getIndexShareList = (
    params: {
        cursor?: string | null,
        size?: number | null,
        topicId?: number | null,
    }
) => {
    return request.get(`/content/share/getIndexShareList`, { params });
}

/**
 * 获取首页话题列表
 */
export const getIndexTopicList = () => {
    return request.get(`/content/share/getTopicList`);
}

/**
 * 获取首页关注作品列表
 */
export const getFollowContentList = (
    params: {
        userId: number | null,
        size?: number | null,
        type?: number | null,
        cursor?: string | null,
    }
) => {
    return request.get(`/content/focus/getFocusArticleList`, { params });
}

/**
 * 检测登录状态
 */
export const checkLoginStatus = () => {
    return request.post(`/user/checkLogin`);
}

/**
 * 注册
 */
export const register = (data: {
    userName: string,
    phone: string,
    password: string,
    twicePassword: string
}) => {
    return request.post('/user/register', data)
}