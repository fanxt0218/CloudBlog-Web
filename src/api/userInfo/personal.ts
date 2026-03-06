import request from '@/utils/request';
import { pa } from 'element-plus/es/locales.mjs';

/**
 * 获取用户信息(个人资料)
 */
export const getPersonalInfo = (userId: number) => {
    return request.get(`/userInfo/detail/personalInfo`, { params: { userId } });
}

/**
 * 获取标签分类列表
 */
export const getTagClassList = () => {
    return request.get(`/content/Interest/tagClassList`);
}
/**
 * 移除用户兴趣标签
 */
export const removeInterestTag = (
    data: {
        userId: number,
        tagId: number
    }
) => {
    return request.post(`/userInfo/detail/removeInterest`, data);
}

/**
 * 添加用户兴趣标签
 */
export const addInterestTag = (
    data: {
        userId: number,
        tagId: number
    }
) => {
    return request.post(`/userInfo/detail/addInterest`, data);
}

/**
 * 获取用户账号设置
 */
export const getAccountSettings = (userId: number) => {
    return request.get(`/userInfo/detail/accountSettings`, { params: { userId } });
}

/**
 * 修改密码
 */
export const updatePassword = (
    data: {
        userId: number,
        newPassword: string
    }
) => {
    return request.post(`/userInfo/detail/updatePassword`, data);
}

/**
 * 生成验证码
 */
export const generateCode = (
    data: {
        userId?: number,
        target: string,
        type: string
    }
) => {
    return request.post(`/content/checkCode/generateCheckCode`, {}, { params: data });
}

/**
 * 校验验证码
 */
export const verifyCode = (
    data: {
        userId?: number,
        target: string,
        type: string,
        checkCode: string
    }
) => {
    return request.post(`/content/checkCode/verifyCheckCode`, {}, { params: data });
}

/**
 * 修改手机号
 */
export const updatePhone = (
    data: {
        userId: number,
        newPhone: string
    }
) => {
    return request.post(`/userInfo/detail/updatePhone`, data);
}

/**
 * 修改邮箱
 */
export const updateEmail = (
    data: {
        userId: number,
        newEmail: string
    }
) => {
    return request.post(`/userInfo/detail/updateEmail`, data);
}

/**
 * 修改个人资料
 */
export const updatePersonalInfo = (
    data: {
        userId: number,
        userName: string | null,
        userAccount: string | null,
        sex: number | null,
        image: string | null,
        introduction: string | null,
        region: string | null,
        birthDate: string | null
    }
) => {
    return request.post(`/userInfo/detail/updatePersonalInfo`, data);
}

/**
 * 上传头像，创建FormData对象来包装文件，这样会自动设置正确的Content-Type
 */
export const uploadAvatar = (formData: FormData) => {
    return request.post(`/userInfo/detail/uploadAvatar`, formData, {
        // 不设置Content-Type，让浏览器自动设置为multipart/form-data
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 注销账号
 */
export const deleteAccount = (userId: number) => {
    return request.post(`/user/cancellation`, {}, { params: { userId } });
}

