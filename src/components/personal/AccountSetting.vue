<template>
  <div class="account-setting">
    <div class="head-image">
      <img :src="`/api/profile/system/accountSettingBG1.png`">
    </div>
    <div class="setting">
      <div class="setting-title">账号设置</div>
      <div class="setting-list">
        <div class="setting-item">
          <div class="setting-item-title">密码</div>
          <div class="setting-item-content">
            {{ accountSetting?.password ? '******' : '请设置密码' }}
          </div>
          <div class="setting-item-action" @click="openDialog('password', accountSetting?.password || '')">
            {{ accountSetting?.password ? '修改密码' : '设置密码' }}
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-item-title">手机号</div>
          <div class="setting-item-content">
            {{ handlePhone(accountSetting?.phone || '请绑定手机') }}
          </div>
          <div class="setting-item-action" @click="openDialog('phone', accountSetting?.phone || '')">修改手机</div>
        </div>

        <div class="setting-item">
          <div class="setting-item-title">邮箱</div>
          <div class="setting-item-content">
            {{ accountSetting?.email ? handleEmail(accountSetting?.email) : '请绑定邮箱' }}
          </div>
          <div class="setting-item-action" @click="openDialog('email', accountSetting?.email || '')">绑定邮箱</div>
        </div>

        <div class="setting-item">
          <div class="setting-item-title">上次登陆时间</div>
          <div class="setting-item-content">{{ accountSetting?.lastLoginTime || '' }}</div>
          <div class="setting-item-action"></div>
        </div>

        <!-- ✅ 新增：账号注销功能 -->
        <div class="setting-item">
          <div class="setting-item-title">账号注销</div>
          <div class="setting-item-content"></div>
          <div class="setting-item-action danger" @click="handleDeleteAccount">账号注销</div>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <AccountEditDialog ref="editDialog" />
  </div>
</template>

<script lang="ts" setup name="AccountSetting">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAccountSettings, deleteAccount } from '@/api/userInfo/personal'
import type { AccountSetting } from '@/types/index'
import AccountEditDialog from './AccountEditDialog.vue'
import { useRouter } from 'vue-router'

let accountSetting = ref<AccountSetting | null>(null)
const editDialog = ref()
const router = useRouter()

/** 打开弹窗 */
const openDialog = (
    type: 'password' | 'phone' | 'email',
    target: string) => {
  editDialog.value.open(type, target)
}

/** 刷新数据 */
const refreshAccountSettings = () => {
  getAccountSettings(Number(localStorage.getItem('userId'))).then((res) => {
    accountSetting.value = res.data
  })
}

/** ✅ 注销账号确认弹框 */
const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要注销账号吗？三日内可恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
        autofocus: false
      }
    )
    // ✅ 这里写你的注销逻辑
    if (Number(localStorage.getItem('userId')) == 0) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    await deleteAccount(Number(localStorage.getItem('userId'))).then((res: any) => {
      if (res.code == 200) {
        ElMessage.success('注销成功')
        localStorage.removeItem('userId')
        localStorage.removeItem('token')
        router.replace('/login')
      }
    })
    
  } catch {
    ElMessage.info('已取消操作')
  }
}

/** 处理手机号 */
const handlePhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/** 处理邮箱(显示部分) */
const handleEmail = (email: string) => {
    if (!email) return ''
    // 匹配更广泛的邮箱格式：保留首字母+@前的部分*号处理+完整域名
    return email.replace(/(\w)([^@]*)(@.*)/, (match, prefix, middle, suffix) => {
        // 保留第一个字符，中间用*号替换，保留完整域名
        const maskedMiddle = '*'.repeat(middle.length);
        return `${prefix}${maskedMiddle}${suffix}`;
     })
}

defineExpose({ refreshAccountSettings })

onMounted(() => {
  getAccountSettings(Number(localStorage.getItem('userId'))).then((res) => {
    accountSetting.value = res.data
  })
})
</script>

<style scoped>
.account-setting {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}
.head-image {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;            /* 限制图片不超出边界 */
  border-radius: 4px;
  background-color: #e8f1ff;
}

/* 让图片自动填充容器，但不变形 */
.head-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;           /* 保持比例裁剪填充 */
  object-position: center;     /* 居中显示 */
  display: block;
  border-radius: 4px;
}
.setting-title {
  font-size: 18px;
  font-weight: 500;
  margin-top: 1.5rem;
  margin-bottom: 10px;
  color: #000;
}
.setting-list {
  border-top: 1px solid #eee;
}
.setting-item {
  display: flex;
  align-items: center;
  height: 54px;
  border-bottom: 1px solid #f2f2f2;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
}
.setting-item-title {
  width: 120px;
  color: #666;
  font-weight: 400;
}
.setting-item-content {
  flex: 1;
  text-align: right;
  color: #333;
  padding-right: 20px;
  box-sizing: border-box;
}
.setting-item-action {
  width: 80px;
  text-align: right;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}
.setting-item-action:empty {
  visibility: hidden;
}
.setting-item-action:hover {
  color: #1684f1;
}

/* ✅ 新增：危险操作样式 */
/* .setting-item-action.danger {
  color: #f56c6c;
}
.setting-item-action.danger:hover {
  color: #e64545;
} */
</style>
