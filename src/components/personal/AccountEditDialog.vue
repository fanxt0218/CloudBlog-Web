<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="480px"
    destroy-on-close
  >
    <!-- 修改密码 -->
    <div v-if="type === 'password'">
      <!-- 诱导浏览器，防止其将外部组件（如搜索框）误判为用户名并填充 -->
      <input type="text" style="position: absolute; top: -999px; left: -999px; opacity: 0; pointer-events: none;" aria-hidden="true" />
      <div class="input-row">
        <el-input
          v-model="newPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入新密码"
          autocomplete="new-password"
        >
          <template #suffix>
            <el-icon @click="showPassword = !showPassword" class="cursor-pointer">
              <i :class="showPassword ? 'el-icon-view' : 'el-icon-view-off'"></i>
            </el-icon>
          </template>
        </el-input>
      </div>
      <div class="input-row">
        <el-input
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请再次输入新密码"
          autocomplete="new-password"
        />
      </div>
      <div class="actions">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword">确定</el-button>
      </div>
    </div>

    <!-- 修改手机号 / 邮箱 -->
    <div v-else>
      <div v-if="step === 1">
        <p class="hint">
          验证码将发送到{{ isPhone ? '手机号' : '邮箱' }} {{ isPhone ? handlePhone(target) : handleEmail(target) }}
        </p>
        <div class="verify-box">
          <el-input
            v-model="verifyCodeInput"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <el-button
            type="primary"
            :disabled="countdown > 0"
            @click="handleGetCode"
          >
            {{ countdown > 0 ? countdown + '秒后重发' : '获取验证码' }}
          </el-button>
        </div>
        <div class="actions">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleVerifyOld">验证</el-button>
        </div>
      </div>

      <div v-else>
        <p class="hint">请输入新的{{ isPhone ? '手机号' : '邮箱' }}</p>
        <el-input
          v-model="newTarget"
          :placeholder="'新的' + (isPhone ? '手机号' : '邮箱')"
        />
        <div class="verify-box">
          <el-input
            v-model="newVerifyCodeInput"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <el-button
            type="primary"
            :disabled="countdown > 0"
            @click="handleGetCode(true)"
          >
            {{ countdown > 0 ? countdown + '秒后重发' : '获取验证码' }}
          </el-button>
        </div>
        <div class="actions">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmNew">确定</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { generateCode, verifyCode, updatePhone, updateEmail, updatePassword } from '@/api/userInfo/personal'

// 获取父组件实例
const parentInstance = getCurrentInstance()?.parent

// === Props & expose ===
const visible = ref(false)
const type = ref<'password' | 'phone' | 'email'>('password')
const target = ref('')

const open = (t: 'password' | 'phone' | 'email', tgt: string) => {
  visible.value = true
  type.value = t
  target.value = tgt
  resetState()

  // 如果用户还未绑定手机号/邮箱，则直接跳过验证阶段
  if ((t === 'phone' || t === 'email') && !tgt) {
    step.value = 2
  }
}
defineExpose({ open })

// === State ===
const userId = Number(localStorage.getItem('userId')) // 用户ID
const dialogTitle = computed(() => {
  switch (type.value) {
    case 'password': return '修改密码'
    case 'phone': return '修改手机号'
    case 'email': return '修改邮箱'
  }
})
const isPhone = computed(() => type.value === 'phone')
const maskedTarget = computed(() => {
  if (!target.value) return ''
  return isPhone.value
    ? handlePhone(target.value)
    : handleEmail(target.value)
})
const countdown = ref(0)
const timer = ref<number | null>(null)
const step = ref(1)

// === 密码逻辑 ===
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

// === 验证码逻辑 ===
const verifyCodeInput = ref('')
const newVerifyCodeInput = ref('')
const newTarget = ref('')

// === 工具函数 ===
const resetState = () => {
  step.value = 1
  verifyCodeInput.value = ''
  newVerifyCodeInput.value = ''
  newTarget.value = ''
  countdown.value = 0
  timer.value && clearInterval(timer.value)
}

const startCountdown = () => {
  countdown.value = isPhone.value ? 60 : 300
  timer.value && clearInterval(timer.value)
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer.value!)
  }, 1000)
}

// === 获取验证码 ===
const handleGetCode = async (isNew = false) => {
  const newMode = isNew === true
  const targetValue = newMode ? newTarget.value : target.value
  if (isNew && !targetValue) 
    return ElMessage.warning(`请输入新的${isPhone.value ? '手机号' : '邮箱'}`)
  try {
    const res = await generateCode({ userId, target: targetValue, type: type.value })
    ElMessage.success(res.msg || '验证码已发送')
    startCountdown()
  } catch {
    ElMessage.error('发送验证码失败')
  }
}

// === 验证旧号 ===
const handleVerifyOld = async () => {
  try {
    const res = await verifyCode({
      userId,
      target: target.value,
      type: type.value,
      checkCode: verifyCodeInput.value,
    })
    if (res.code === 200) {
      ElMessage.success('验证成功')
      countdown.value = 0
      step.value = 2
      timer.value && clearInterval(timer.value)
    } else ElMessage.error('验证码错误')
  } catch {
    ElMessage.error('验证失败')
  }
}

// === 验证新号 ===
const handleVerifyNew = async () => {
  try {
    const res = await verifyCode({
      userId,
      target: newTarget.value,
      type: type.value,
      checkCode: newVerifyCodeInput.value,
    })
    if (res.code === 200) {
      return true;
    } else return false;
  } catch {
    ElMessage.error('验证失败')
  }
}



// === 确认修改新手机号/邮箱 ===
const handleConfirmNew = async () => {
  if (isPhone.value) {
    // 验证验证码
    const verifyRes = await handleVerifyNew()
    if (!verifyRes) {
        ElMessage.error('验证码错误')
    } else {
        // ElMessage.success('验证成功')
        // 更新手机号
        const res = await updatePhone({ userId, newPhone: newTarget.value })
        if (res.code === 200) {
            ElMessage.success('修改成功')
            visible.value = false
            // 通知父组件刷新数据
            parentInstance?.exposed?.refreshAccountSettings?.()
        } else ElMessage.error('修改失败')
    }
  } else {
    // 验证码
    const verifyRes = await handleVerifyNew()
    if (!verifyRes) {
        ElMessage.error('验证码错误')
    } else {
        // ElMessage.success('验证成功')
      // 更新邮箱
      const res = await updateEmail({ userId, newEmail: newTarget.value })
      if (res.code === 200) {
        ElMessage.success('修改成功')
        visible.value = false
        // 通知父组件刷新数据
        parentInstance?.exposed?.refreshAccountSettings?.()
      } else ElMessage.error('修改失败')
    }
  }
}

// === 修改密码逻辑 ===
const handleUpdatePassword = async () => {
  if (!newPassword.value || !confirmPassword.value)
    return ElMessage.warning('请填写完整密码')
  if (newPassword.value !== confirmPassword.value)
    return ElMessage.error('两次输入的密码不一致')
  try {
    const res = await updatePassword({ userId, newPassword: newPassword.value })
    if (res.code === 200) {
      ElMessage.success('密码修改成功')
      visible.value = false
      // 通知父组件刷新数据
      parentInstance?.exposed?.refreshAccountSettings?.()
    } else {
       ElMessage.error(res.msg || '密码修改失败')
    }
  } catch (error) {
    ElMessage.error('密码修改失败')
    console.error(error)
  }
}

/** 处理手机号 */
const handlePhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/** 处理邮箱 */
const handleEmail = (email: string) => {
  if (!email) return ''
    // 匹配更广泛的邮箱格式：保留首字母+@前的部分*号处理+完整域名
    return email.replace(/(\w)([^@]*)(@.*)/, (match, prefix, middle, suffix) => {
        // 保留第一个字符，中间用*号替换，保留完整域名
        const maskedMiddle = '*'.repeat(middle.length);
        return `${prefix}${maskedMiddle}${suffix}`;
     })
}
</script>

<style scoped>
.input-row {
  margin-bottom: 16px;
}
.verify-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  margin-top: 10px;
}
.hint {
  color: #666;
  margin-bottom: 10px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
