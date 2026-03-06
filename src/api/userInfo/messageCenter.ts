import request from '@/utils/request'

/**
 * 获取消息列表
 */
export const getMessageList = (
    data:{
        userId:number,
        notificationId:number,
        sortBy?:string
    }
) => {
    return request.post(`/content/notification/getNotificationList`, data);
}

/**
 * 获取聊天详情
 */
export const getChatDetail = (
    data:{
        userId:number,
        targetUserId:number
    }
) => {
    return request.post(`/content/notification/getChatDetail`, data);
}

/**
 * 读取消息
 */
export const readMessage = (
    data:{
        userId:number,
        targetUserId:number
    }
) => {
    return request.post(`/content/notification/readNotification`, data);
}

/**
 * 发送消息
 */
export const chat = (
    data:{
        userId:number,
        targetId:number,
        content:string,
        contentType:number
    }
) => {
    return request.post(`/content/notification/chat`, data);
}

/**
 * 检查在线状态
 */
export const checkOnlineStatus = (
    data:{
        targetUserId:number
    }
) => {
    return request.get(`/content/notification/getOnlineStatus`, {params:data});
}

/**
 * 读取评论消息
 */
export const readCommentMessage = (
    data:{
        userId:number,
        targetUserId:number
    }
) => {
    return request.post(`/content/notification/readCommentNotification`, data);
}

/**
 * 读取新增粉丝消息
 */
export const readNewFanMessage = (
    data:{
        userId:number,
        targetUserId:number
    }
) => {
    return request.post(`/content/notification/readFanNotification`, data);
}


/**
 * 读取点赞和收藏消息
 */
export const readLikeAndCollectMessage = (
    data:{
        userId:number,
        targetUserId:number
    }
) => {
    return request.post(`/content/notification/readLikeAndCollectNotification`, data);
}
