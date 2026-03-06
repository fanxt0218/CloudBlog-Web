<template>
    <div class="edit-profile">
        <div class="head-info">
            <div class="avatar-container" @click="handleAvatarClick">
                <img :src="`/api${PersonalInfo?.image}`" alt="用户头像" class="avatar">
                <div class="avatar-overlay">
                  <svg t="1762089011013" class="camera-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3710"><path d="M768 288.981333a128 128 0 0 1 128 128V704a128 128 0 0 1-128 128H256a128 128 0 0 1-128-128V416.981333a128 128 0 0 1 128-128h54.656c31.36 0 59.498667-19.264 70.826667-48.490666A75.989333 75.989333 0 0 1 452.309333 192h92.544c31.786667 0 60.416 19.136 72.554667 48.490667a78.549333 78.549333 0 0 0 72.554667 48.490666H768z m-512 42.666667a85.333333 85.333333 0 0 0-85.333333 85.333333V704a85.333333 85.333333 0 0 0 85.333333 85.333333h512a85.333333 85.333333 0 0 0 85.333333-85.333333V416.981333a85.333333 85.333333 0 0 0-85.333333-85.333333h-78.037333a121.194667 121.194667 0 0 1-111.978667-74.837333A35.861333 35.861333 0 0 0 544.853333 234.666667h-92.522666c-13.76 0-26.090667 8.448-31.061334 21.269333a118.677333 118.677333 0 0 1-110.613333 75.712H256z" fill="#ffffff" p-id="3711"></path><path d="M640 554.666667a128 128 0 1 1-256 0 128 128 0 0 1 256 0z m-128 85.333333a85.333333 85.333333 0 1 0 0-170.666667 85.333333 85.333333 0 0 0 0 170.666667z" fill="#ffffff" p-id="3712"></path></svg>
                </div>
                <!-- 添加隐藏的文件输入框 -->
                <input
                  type="file"
                  class="avatar-file-input"
                  ref="avatarFileInput"
                  accept="image/*"
                  @change="handleAvatarChange"
                />
            </div>
            <div class="meta-data">
                <div class="title-meta">
                    <span class="userName">{{ PersonalInfo?.userName }}</span>
                    <svg
                    v-if="PersonalInfo?.isVip === 1 || PersonalInfo?.isVip === 0"
                    class="vip-icon"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                      d="M941.127 431.9L806.66 170.175a37.002 37.002 0 0 0-32.911-20.091H252.053a36.998 36.998 0 0 0-32.825 19.927L83.219 431.506a37 37 0 0 0 6.084 42.645L484.97 887.919a37.001 37.001 0 0 0 26.716 11.428h0.025a37 37 0 0 0 26.707-11.393l396.506-413.539a36.996 36.996 0 0 0 6.203-42.515z m-210.42 41.652L538.634 673.876a37 37 0 0 1-26.707 11.393h-0.025a36.998 36.998 0 0 1-26.716-11.429L293.521 473.406c-14.123-14.769-13.599-38.19 1.17-52.313 14.769-14.124 38.19-13.599 52.313 1.17l164.96 172.507 165.33-172.432c14.142-14.75 37.565-15.242 52.314-1.1 14.749 14.142 15.242 37.564 1.099 52.314z"
                      :fill="PersonalInfo?.isVip === 1 ? 'red' : '#dbdbdb'"
                    ></path>
                    </svg>
                </div>
                <span class="blog-age">博龄{{ PersonalInfo?.blogAge }}年</span>
            </div>
        </div>
        <div class="basic-info">
            <div class="basic-info-title">基本信息</div>
            <div class="info-list">
                <div class="info-item" v-for="(item, index) in infoItems" :key="index" @mouseenter="showEditIcon(index)" @mouseleave="hideEditIcon(index)">
                    <span>{{ item.label }}</span>
                    <div class="info-value-container">
                        <span v-if="!editingField || editingField !== item.key">{{ getFieldValue(item.key) }}</span>
                        <el-input
                            v-else-if="item.type === 'text'"
                            v-model="tempEditValue"
                            size="small"
                            @keyup.enter="saveEdit(item.key)"
                            @blur="saveEdit(item.key)"
                            ref="editInput"
                        ></el-input>
                        <el-select
                            v-else-if="item.type === 'select'"
                            v-model="tempEditValue"
                            size="small"
                            @change="saveEdit(item.key)"
                            ref="editSelect"
                        >
                            <el-option
                                v-for="option in item.options"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            ></el-option>
                        </el-select>
                        <el-date-picker
                            v-else-if="item.type === 'date'"
                            v-model="tempEditDate"
                            type="date"
                            value-format="YYYY-MM-DD"
                            size="small"
                            @change="saveDateEdit(item.key)"
                            ref="editDatePicker"
                        ></el-date-picker>
                        <el-cascader
                          v-else-if="item.type === 'region'"
                          v-model="tempRegionValue"
                          :options="regionOptions"
                          :props="{
                            label: 'label',
                            value: 'value',
                            children: 'children',
                            emitPath: true
                          }"
                          placeholder="请选择地区"
                          clearable
                          @change="handleRegionChange"
                        />
                        <svg 
                            v-if="!isUserIdField(item.key) && (showEditIcons[index] || editingField === item.key)"
                            class="edit-icon"
                            viewBox="0 0 1024 1024"
                            xmlns="http://www.w3.org/2000/svg"
                            @click.stop="startEdit(item.key, getFieldValue(item.key))"
                        >
                            <path d="M881.777778 534.755556v335.644444c0 34.133333-28.444444 62.577778-62.577778 62.577778H153.6c-34.133333 0-62.577778-28.444444-62.577778-62.577778V204.8c0-34.133333 28.444444-62.577778 62.577778-62.577778h335.644444c22.755556 0 39.822222-17.066667 39.822223-39.822222s-22.755556-39.822222-39.822223-39.822222H153.6C73.955556 62.577778 11.377778 125.155556 11.377778 204.8v665.6c0 79.644444 62.577778 142.222222 142.222222 142.222222h665.6c79.644444 0 142.222222-62.577778 142.222222-142.222222V534.755556c0-22.755556-17.066667-39.822222-39.822222-39.822223-22.755556 0-39.822222 17.066667-39.822222 39.822223z" 
                                fill="#1296db"></path>
                            <path d="M523.377778 620.088889l483.555555-534.755556c17.066667-17.066667 17.066667-45.511111-5.688889-62.577777s-45.511111-17.066667-62.577777 5.688888L449.422222 557.511111c-17.066667 17.066667-11.377778 51.2 5.688889 68.266667 17.066667 17.066667 51.2 11.377778 68.266667-5.688889z" 
                                fill="#1296db"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="submit">
            <el-button type="primary" @click="submit">提交</el-button>
        </div>
    </div>   
</template>
<script lang="ts" setup name="EditProfile">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import type {PersonalInfo, TagClasses, Tags} from '@/types/index'
import {getPersonalInfo, updatePersonalInfo, uploadAvatar} from '@/api/userInfo/personal'
import {getInterestTags} from '@/api/index/indexPage'
import {ElMessage, ElMessageBox} from 'element-plus'
import { regionData, codeToText } from 'element-china-area-data'

const router = useRouter();

let PersonalInfo = ref<PersonalInfo | null>(null);

// 地区级联数据
const regionOptions = ref(regionData)

// 地区选择器引用
const editRegionPicker = ref<InstanceType<any>>()

// 头像文件输入框的引用
const avatarFileInput = ref<HTMLInputElement>();

// ✅ el-cascader 专用：始终是数组结构
const tempRegionValue = ref<string[]>([])

// ✅ 你后端最终要的字符串（提交用）
const backendRegionString = ref<string | null>(null)

// 处理头像点击事件
const handleAvatarClick = () => {
  avatarFileInput.value?.click();
};

// 处理文件选择变化
const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    changeAvatar(file);
    // 重置input值，以便可以重复选择同一个文件
    input.value = '';
  }
};

// 提供changeAvatar方法供用户实现上传头像逻辑
const changeAvatar = (file: File) => {
  // 创建FormData对象来包装文件，这样会自动设置正确的Content-Type
  const formData = new FormData();
  formData.append('file', file);
  
  // 使用FormData对象发送请求
  uploadAvatar(formData).then(res => {
    // 将上传成功后的路径保存到EditInfo中的image字段
    EditInfo.value.image = res.data;
    if (PersonalInfo.value) {
        PersonalInfo.value.image = res.data;
    }
    ElMessage.success('头像上传成功');
  }).catch(err => {
    ElMessage.error('头像上传失败');
  });
};

// 编辑信息，未修改的字段保持为null
let EditInfo = ref({
    userId: Number(localStorage.getItem('userId')),
    userName: null,
    userAccount: null,
    sex: null,
    image: null,
    introduction: null,
    region: null,
    birthDate: null,
    profession: null
});

// 当前正在编辑的字段
let editingField = ref<string | null>(null);
// 临时编辑值 - 修改为可以接受string和number类型
let tempEditValue = ref<string | number>('');
let tempEditDate = ref('');
// 控制编辑图标的显示
let showEditIcons = ref<boolean[]>([]);
// 表单引用
let editInput = ref<InstanceType<any>>();
let editSelect = ref<InstanceType<any>>();
let editDatePicker = ref<InstanceType<any>>();

// 定义信息列表项配置的类型
interface InfoItem {
    key: keyof Omit<PersonalInfo, 'isVip' | 'blogAge' | 'tags'>;
    label: string;
    type: 'text' | 'select' | 'date' | 'region';
    options?: Array<{ label: string; value: number }>;
}

// 定义信息列表项配置
let infoItems = ref<InfoItem[]>([
    { key: 'userName', label: '昵称', type: 'text' },
    { key: 'userAccount', label: '用户ID', type: 'text' },
    { 
        key: 'sex', 
        label: '性别', 
        type: 'select',
        options: [
            { label: '男', value: 1 },
            { label: '女', value: 0 }
        ]
    },
    { key: 'introduction', label: '个人简介', type: 'text' },
    { key: 'region', label: '所在地区', type: 'region' },
    { key: 'birthDate', label: '出生日期', type: 'date' },
    { key: 'profession', label: '职业', type: 'text' }
]);

/**
 * 查询用户信息
 */
const getUserInfo = (userId: number) => {
    getPersonalInfo(userId).then(res => {
        PersonalInfo.value = res.data;
        // 初始化编辑信息的userId
        EditInfo.value.userId = userId;
    })
}

/**
 * 显示编辑图标
 */
const showEditIcon = (index: number) => {
    showEditIcons.value[index] = true;
};

/**
 * 隐藏编辑图标
 */
const hideEditIcon = (index: number) => {
    // 编辑状态下不隐藏图标
    if (editingField.value !== infoItems?.value[index]?.key) {
        showEditIcons.value[index] = false;
    }
};

/**
 * 判断是否为用户ID字段（不允许修改）
 */
const isUserIdField = (key: string): boolean => {
    return key === 'userAccount';
};

/**
 * 获取字段值
 */
const getFieldValue = (key: string): any => {
    if (!PersonalInfo.value) return '';
    
    // 特殊处理性别显示
    if (key === 'sex') {
        return (PersonalInfo.value as any)[key] === 1 ? '男' : '女';
    }
    if (key === 'region') {
        const regionValue = (PersonalInfo.value as any)[key];
        if (!regionValue) return '';
        
        // 假设后端存储的是中文名称格式如"北京市/北京市/东城区"
        // 如果是编码格式，可以使用 codeToText 转换
        return regionValue;
    }
    
    return (PersonalInfo.value as any)[key] || '';
};

/**
 * 开始编辑
 */
const startEdit = (key: string, value: any) => {
  if (isUserIdField(key)) return;

  editingField.value = key;

  if (key === 'birthDate') {
    tempEditDate.value = value;
  } 
  else if (key === 'sex') {
    tempEditValue.value = value === '男' ? 1 : 0;
  } 
  else if (key === 'region') {
    // 处理地区编辑，将后端格式转换为级联选择器需要的数组格式
    tempRegionValue.value = value ? value.split('/') : [];
  } 
  else {
    tempEditValue.value = value;
  }

  nextTick(() => {
    if (key === 'birthDate') {
      editDatePicker.value?.focus();
    } 
    else if (key === 'sex') {
      editSelect.value?.focus();
    } 
    else if (key === 'region') {
      editRegionPicker.value?.focus();
    } 
    else {
      editInput.value?.focus();
    }
  });
};


/**
 * 保存编辑
 */
const saveEdit = (key: string) => {
    if (!PersonalInfo.value) return;

    if (key === 'region') {
        // 地区字段的保存逻辑已经在 handleRegionChange 中处理
        editingField.value = null;
        return;
    }
    
    // 如果值没有变化，不做处理
    const currentValue = key === 'sex' ? 
        ((PersonalInfo.value as any)[key] === 1 ? '男' : '女') : 
        (PersonalInfo.value as any)[key];
    
    const newValue = key === 'sex' ? 
        (tempEditValue.value === 1 ? '男' : '女') : 
        tempEditValue.value;
    
    // 只有当值发生变化时，才更新EditInfo
    if (currentValue !== newValue) {
        // 更新PersonalInfo以实时显示变化
        (PersonalInfo.value as any)[key] = key === 'sex' ? tempEditValue.value : tempEditValue.value;
        // 更新EditInfo用于提交
        (EditInfo.value as any)[key] = key === 'sex' ? tempEditValue.value : tempEditValue.value;
    }
    
    // 结束编辑状态
    editingField.value = null;
};

/**
 * 保存日期编辑
 */
const saveDateEdit = (key: string) => {
    if (!PersonalInfo.value) return;
    
    // 只有当值发生变化时，才更新
    if ((PersonalInfo.value as any)[key] !== tempEditDate.value) {
        (PersonalInfo.value as any)[key] = tempEditDate.value;
        (EditInfo.value as any)[key] = tempEditDate.value;
    }
    
    // 结束编辑状态
    editingField.value = null;
};

/**
 * ✅ cascader 数组 → 后端字符串
 * ["北京","市辖区","东城区"] → "北京/市辖区/东城区"
 */
const cascaderToBackendRegion = (arr?: string[]) => {
  if (!arr || !arr.length) return null
  // 转换为中文名称
  const regionText = arr.map(region => codeToText[region] || region).filter(Boolean);
  
  return regionText.join('/')
}

/**
 *  地区选择器变化时处理
 * @param val 
 */
const handleRegionChange = (val: string[]) => {
  // ✅ 前端只管数组
  tempRegionValue.value = val

  // ✅ 这里统一转成后端字符串
  backendRegionString.value = cascaderToBackendRegion(val)

  if (PersonalInfo.value) {
    (PersonalInfo.value as any).region = backendRegionString.value;
    (EditInfo.value as any).region = backendRegionString.value;
  }
}

const backendRegionToCascader = (region?: string) => {
  if (!region) return []
  return region.split('/').filter(Boolean)
}

/**
 * 提交修改
 */
const submit = () => {
    // 确保userId已设置
    if (!EditInfo.value.userId) {
        ElMessage.error('用户信息获取失败，请刷新页面重试');
        return;
    }
    
    updatePersonalInfo(EditInfo.value).then(res => {
        if (res.code === 200) {
            ElMessage.success('修改成功');
            // 重置EditInfo，保留userId
            const userId = EditInfo.value.userId;
            EditInfo.value = {
                userId,
                userName: null,
                userAccount: null,
                sex: null,
                image: null,
                introduction: null,
                region: null,
                birthDate: null,
                profession: null
            };
        } else {
            ElMessage.error(res.msg || '修改失败');
        }
    }).catch(err => {
        ElMessage.error('网络错误，请稍后重试');
        console.error(err);
    });
};

// 为头像容器添加点击事件处理
Object.assign(avatarFileInput.value || {}, { onclick: handleAvatarClick });

/**
 * 检查是否有未保存的修改
 */
const hasUnsavedChanges = () => {
    // 检查EditInfo对象中是否有非null的值（排除userId）
    const { userId, ...fields } = EditInfo.value;
    return Object.values(fields).some(value => value !== null);
};

/**
 * 导航离开前的确认
 */
onBeforeRouteLeave(async (to, from, next) => {
    if (hasUnsavedChanges()) {
        try {
            await ElMessageBox.confirm(
                '您有未保存的修改，确定要离开吗？',
                '确认离开',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            );
            // 用户确认离开
            next();
        } catch {
            // 用户取消离开
            next(false);
        }
    } else {
        // 没有未保存的修改，直接离开
        next();
    }
});

// 监听浏览器刷新或关闭事件
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', (event) => {
        if (hasUnsavedChanges()) {
            // 标准的浏览器提示
            event.preventDefault();
            // Chrome需要设置returnValue
            event.returnValue = '您有未保存的修改，确定要离开吗？';
        }
    });
}


onMounted(() => {
    getPersonalInfo(Number(localStorage.getItem('userId'))).then(res => {
        PersonalInfo.value = res.data;
        // 初始化编辑信息的userId
        EditInfo.value.userId = Number(localStorage.getItem('userId'));
        // 初始化编辑图标显示数组
        showEditIcons.value = new Array(infoItems.value.length).fill(false);
        
        // 回显到级联
        tempRegionValue.value = backendRegionToCascader(res.data.region)           
        // 同时同步一份后端格式
        backendRegionString.value = res.data.region
    })
});
</script>
<style scoped>
.edit-profile {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;

}

.head-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

/* 头像容器和悬停效果 */
.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  width: 35px;
  height: 35px;
  fill: #ffffff;
}

.meta-data {
    display: flex;
    flex-direction: column;
}

.userName {
    font-size: 18px;
    font-weight: bold;
}

.blog-age {
    font-size: 14px;
    color: #666;
}

.basic-info-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-left: 1rem;
    margin-top: 1rem;
}

.info-item {
    display: flex;
    margin-bottom: 8px;
    gap: 15px;
    font-size: 15px;
    padding: 8px 0;
}

.info-item span:first-child {
    width: 80px;
    color: #666;
}

.info-value-container {
    flex: 1;
    display: flex;
    align-items: center;
    color: #222222;
}

.info-value-container span {
    flex: 1;
}

.vip-icon {
  width: 25px;
  height: 25px;
  cursor: default;
  transition: fill 0.3s ease;
  margin-top: -2px;
  margin-left: 0.3rem;
}

.edit-icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
  margin-left: 8px;
}

.edit-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

.title-meta {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.basic-info {
    margin-top: 1.5rem;
}

.submit {
    display: flex;
    justify-content: flex-end;
    margin-top: 25px;
}
</style>