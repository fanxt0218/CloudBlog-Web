import request from '@/utils/request'

/**
 * 获取用户vip信息
 */
export const getVipInfo = (userId: number) => {
  return request.get(`/content/vip/getUserVipInfo`, { params: { userId } });
}

/**
 * 开通会员
 */
export const openVip = (userId: number) => {
  return request.post(`/content/vip/openVip`, {}, { params: { userId } });
}
