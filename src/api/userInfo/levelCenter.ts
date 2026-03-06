import request from '@/utils/request';

/**
 * 获取用户等级信息
 */
export const getUserLevelInfo = (userId:number) => {
    return request.get(`/userInfo/detail/userLevelInfo`,{params:{userId}});
}

/**
 * 获取等级列表
 */
export const getLevelList = () => {
    return request.get(`/content/level/getLevelList`);
}
