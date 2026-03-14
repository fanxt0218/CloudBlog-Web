import request from '@/utils/request';
// import { pa } from 'element-plus/es/locales.mjs';
import type { ApiResponse } from '@/types';

/**
 * 用户主页顶栏
 */
export const getUserInfo = (userId: number) => {
  return request.get(`/userInfo/homePage/getUserInfo`, { params: { userId } });
}

/**
 * 用户成就
 */
export const getUserAchievement = (userId: number) => {
  return request.get(`/userInfo/homePage/getUserAchievement`, { params: { userId } });
}

/**
 * 获取用户兴趣
 */
export const getUserTag = (userId: number) => {
  return request.get(`/userInfo/homePage/getUserInterestInfo`, { params: { userId } });
}

/**
 * 获取用户分类列表
 */
export const getUserCategory = (userId: number) => {
  return request.get(`/userInfo/homePage/getUserCategoryInfo`, { params: { userId } });
}



/**
 * 获取用户主页文章列表
 */
export const getUserPostList = (
  data: {
    userId: number;
    loginUserId: number | null;
    cursor: string | null;
    size: number;
    sortBy: string;
    tag: string;
  }
) => {
  return request.get(`/userInfo/homePage/getUserPostList`, { params: data });
}

/**
 * 获取用户分享列表
 */
export const getUserShareList = (
  data: {
    userId: number;
    cursor: string | null;
    size: number;
    sortBy: string;
    tag: string;
  }
) => {
  return request.get(`/userInfo/homePage/getUserShareList`, { params: data });
}

/**
 * 获取用户收藏夹列表
 */
export const getUserCollectList = (userId: number | null) => {
  return request.get(`/userInfo/detail/getUserFavorites`, { params: { userId } });
}

/**
 * 获取用户收藏夹详情
 */
export const getUserCollectDetail = (
  data: {
    userId: number,
    favoritesId: number | null,
    postName: string,
    pageNum: number,
    pageSize: number
  }
) => {
  return request.post(`/userInfo/detail/collectList`, data);
}

/**
 * 获取用户默认收藏夹
 */
export const getUserDefaultCollect = (userId: number) => {
  return request.get(`/userInfo/detail/getDefaultFavoritesId`, { params: { userId } });
}



/**
 * 收藏/取消收藏
 */
export const changeCollectStatus = (
  data: {
    userId: number,
    postId: number,
    status: number,
    favoriteId?: number | null
  }
) => {
  return request.post(`/content/collect/collecting`, {}, { params: data });
}

/**
 * 获取用户点赞列表
 */
export const getUserLikeList = (
  data: {
    userId: number,
    beginTime: string | null,
    endTime: string | null,
    pageNum: number,
    pageSize: number
  }
) => {
  return request.post(`/userInfo/detail/likeList`, data);
}

/**
 * 点赞/取消点赞
 */
export const changeLikeStatus = (
  data: {
    userId: number,
    targetId: number,
    status: number
    type: number
  }
) => {
  return request.post(`/content/like/liking`, {}, { params: data });
}

/**
 * 获取用户浏览列表
 */
export const getUserBrowseList = (
  data: {
    userId: number,
    beginTime: string | null,
    endTime: string | null,
    pageNum: number,
    pageSize: number
  }
) => {
  return request.post(`/userInfo/detail/browseHistory`, data);
}

/**
 * 获取用户分类详情
 */
export const getUserCategoryDetail = (
  data: {
    userId: number,
    categoryId: number,
    pageNum: number,
    pageSize: number,
    postName: string
  }
) => {
  return request.post(`/content/category/getCategoryDetail`, data);
}

/**
 * 获取关注/粉丝列表
 */
export const getFocusAndFansList = (
  data: {
    userId: number,
    type: number,
    cursor: string | null,
    size: number
  }
) => {
  return request.get(`/content/focus/getFocusAndFansList`, { params: data });
}

/**
 * 新增分类
 */
export const addCategory = (
  data: {
    userId: number,
    categoryName: string,
    categoryDesc: string,
    image: string
  }
) => {
  return request.post(`/content/category/addCategory`, data);
}

/**
 * 修改分类
 */
export const updateCategory = (
  data: {
    id: number,
    categoryName: string,
    image: string,
    description: string,
  }
) => {
  return request.post(`/content/category/editCategory`, data);
}

/**
 * 删除分类
 */
export const deleteCategory = (
  data: {
    categoryId: number
  }
) => {
  return request.post(`/content/category/deleteCategory`, {}, { params: data });
}