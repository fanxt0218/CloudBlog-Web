<template>
  <div class="simple-login-card">
    <div class="card-header">
      <div class="branding">
        <h2 class="title">{{ isRegisterMode ? '加入 CloudBlog 社区' : '登录可享受更多权益' }}</h2>
        <p class="subtitle">{{ isRegisterMode ? '补全信息完成注册，开启精彩旅程' : '解锁更多优质内容 与博主大V深度互动' }}</p>
      </div>
    </div>

    <!-- 登录 Tabs -->
    <div v-if="!isRegisterMode" class="login-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'password' }"
        @click="activeTab = 'password'"
      >
        密码登录
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'code' }"
        @click="activeTab = 'code'"
      >
        验证码登录
      </div>
      <!-- <div class="tab-item disabled">APP登录</div> -->
    </div>

    <!-- 密码登录表单 -->
    <div v-show="!isRegisterMode && activeTab === 'password'" class="login-form">
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="target">
          <el-input 
            v-model="loginForm.target" 
            placeholder="手机号/邮箱/用户名" 
            class="custom-input"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码" 
            show-password
            class="custom-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <div class="form-actions" @click="forgetPass()">
          <a href="#" class="forgot-link">忘记密码</a>
        </div>

        <el-button 
          type="primary" 
          class="submit-btn" 
          :loading="loading" 
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>

    <!-- 验证码登录 -->
    <div v-show="!isRegisterMode && activeTab === 'code'" class="login-form">
      <el-form :model="codeForm" :rules="codeRules" ref="codeFormRef">
        <el-form-item prop="target">
          <el-input 
            v-model="codeForm.target" 
            placeholder="手机号/邮箱" 
            class="custom-input"
            clearable
          />
        </el-form-item>
        <el-form-item prop="checkCode">
          <div class="code-input-wrapper">
            <el-input 
              v-model="codeForm.checkCode" 
              placeholder="请输入验证码" 
              class="custom-input code-input"
              :maxlength="detectedCodeType === 'phone' ? 4 : 6"
            />
            <el-button 
              class="send-btn" 
              :disabled="countdown > 0" 
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <div class="form-actions">
          <a href="#" class="forgot-link">手机号/邮箱不可用?</a>
        </div>

        <el-button 
          type="primary" 
          class="submit-btn" 
          :loading="loading" 
          @click="handleCodeLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>

    <!-- 注册表单 -->
    <div v-if="isRegisterMode" class="login-form">
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
        <el-form-item prop="userName">
          <el-input 
            v-model="registerForm.userName" 
            placeholder="设置用户名" 
            class="custom-input"
            clearable
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input 
            v-model="registerForm.phone" 
            placeholder="手机号/邮箱" 
            class="custom-input"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="设置密码" 
            show-password
            class="custom-input"
          />
        </el-form-item>
        <el-form-item prop="twicePassword">
          <el-input 
            v-model="registerForm.twicePassword" 
            type="password" 
            placeholder="确认密码" 
            show-password
            class="custom-input"
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-button 
          type="primary" 
          class="submit-btn" 
          :loading="loading" 
          @click="handleRegister"
        >
          提交注册
        </el-button>

        <div class="form-actions" style="justify-content: center; margin-top: 15px;">
          <a href="javascript:void(0)" class="forgot-link" @click="isRegisterMode = false">返回选择登录方式</a>
        </div>
      </el-form>
    </div>

    <div class="agreement">
      注册登录表示您同意 《<a href="#" class="agreement-link">CloudBlog服务条款</a>》 和 《<a href="#" class="agreement-link">隐私协议</a>》
    </div>

    <div class="third-party-login">
      <p>其他登录方式</p>
      <div class="icons">
        <div class="icon-wrapper">
          <img src="/assests/icon/WeChat.png" alt="WeChat" />
        </div>
        <div class="icon-wrapper">
          <img src="/assests/icon/QQ.png" alt="QQ" />
        </div>
        <!-- <div class="icon-wrapper">
          <img src="/assests/icon/GitHub.png" alt="GitHub" />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { login, loginByCode, register } from '@/api/index/indexPage'
import { generateCode, verifyCode } from '@/api/userInfo/personal'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { submitWorkOrder } from '@/api/index/workOrder'

const router = useRouter()
const userInfoStore = useUserInfoStore()
const loginFormRef = ref()
const codeFormRef = ref()
const registerFormRef = ref()
const loading = ref(false)
const isRegisterMode = ref(false)
const activeTab = ref('password')
const countdown = ref(0)
let timer: number | null = null

const loginForm = reactive({
  loginType: 'phone',
  target: '',
  password: '',
  twicePassword: ''
})

const codeForm = reactive({
  target: '',
  checkCode: '',
  type: 'phone'
})

const registerForm = reactive({
  userName: '',
  phone: '',
  password: '',
  twicePassword: ''
})

const rules = {
  target: [
    { required: true, message: '请输入手机号或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' }
  ]
}

const validateCode = (rule: any, value: any, callback: any) => {
  const expectedLen = detectedCodeType.value === 'phone' ? 4 : 6
  if (!value) {
    return callback(new Error('请输入验证码'))
  }
  if (value.length !== expectedLen) {
    return callback(new Error(`验证码为${expectedLen}位`))
  }
  callback()
}

const codeRules = {
  target: [
    { required: true, message: '请输入手机号或邮箱', trigger: 'blur' }
  ],
  checkCode: [
    { validator: validateCode, trigger: 'blur' }
  ]
}

const registerRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' }
  ],
  twicePassword: [
    { required: true, message: '请再次确认密码', trigger: 'blur' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 自动检测登录类型
const detectType = (val: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(val) ? 'email' : 'phone'
}

const detectedLoginType = computed(() => detectType(loginForm.target))
const detectedCodeType = computed(() => detectType(codeForm.target))

const handleSendCode = async () => {
  if (!codeForm.target) return ElMessage.warning('请先输入手机号或邮箱')
  
  try {
    const type = detectedCodeType.value
    const res: any = await generateCode({ target: codeForm.target, type })
    if (res.code === 200) {
      ElMessage.success('验证码已发送')
      countdown.value = 60
      timer = window.setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          timer && clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (error) {
    ElMessage.error('网络错误')
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        loginForm.loginType = detectedLoginType.value
        loginForm.twicePassword = loginForm.password
        const res: any = await login(loginForm)
        if (res.code === 200) {
          onLoginSuccess(res.data)
        } else if (res.msg === '用户不存在') {
          ElMessage.info('该账号不存在，已为您切换至注册界面')
          isRegisterMode.value = true
          registerForm.phone = loginForm.target
          registerForm.password = loginForm.password
          registerForm.twicePassword = loginForm.password
        } else {
          ElMessage.error(res.msg || '登录失败')
        }
      } catch (error) {
        ElMessage.error('网络错误')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleCodeLogin = async () => {
  if (!codeFormRef.value) return
  
  await codeFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const type = detectedCodeType.value
        console.log('登录类型',type)
        const res: any = await loginByCode({
          target: codeForm.target,
          type,
          checkCode: codeForm.checkCode
        })
        if (res.code === 200) {
          onLoginSuccess(res.data)
        } else if (res.msg === '用户不存在') {
          ElMessage.info('该账号不存在，已为您切换至注册界面')
          isRegisterMode.value = true
          registerForm.phone = codeForm.target
        } else {
        //   ElMessage.error(res.msg || '验证码错误')
        }
      } catch (error) {
        console.log(error)
        ElMessage.error('网络错误')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await register(registerForm)
        if (res.code === 200) {
          ElMessage.success('注册成功')
          onLoginSuccess(res.data)
        }
      } catch (error) {
        ElMessage.error('网络错误')
      } finally {
        loading.value = false
      }
    }
  })
}

const onLoginSuccess = (data: any) => {
  ElMessage.success('登录成功')
  console.log('登录成功',data)
  localStorage.setItem('userId', data.userId)
  localStorage.setItem('token', data.token)
  userInfoStore.init()
  router.push('/')
  setTimeout(() => {
    window.location.reload()
  }, 500)
}

/**
 * 忘记密码
 */
const forgetPass = async () => {
  if(!loginForm.target) {
    ElMessage.warning('请先填写手机号')
    return;
  }
  let data = {
    orderId: loginForm.target, // 暂时使用这个字段
    targetType: 3,
    orderType: 3,
    reason: "登录时忘记密码，申请重置" 
  }
  const res : any = await submitWorkOrder(data)
  if (res.code === 200) {
    ElMessage.success("提交成功，请于1-3个工作日后尝试登录")
  } else {
    ElMessage.error(res.msg)
  }
}

onUnmounted(() => {
  timer && clearInterval(timer)
})
</script>

<style scoped>
.simple-login-card {
  width: 350px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
}

.card-header {
  /* display: flex; */
  justify-content: space-between;
  margin-bottom: 25px;
}

.branding .title {
  /* 居中 */
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.branding .subtitle {
  /* 居中 */
  text-align: center;
  font-size: 15px;
  color: #fa541c; /* Reference image style coloration */
  font-weight: 500;
}

.mascot img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}

.login-tabs {
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.tab-item {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
}

.tab-item.active {
  color: #333;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #fa541c;
}

.tab-item.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.login-form {
  margin-bottom: 20px;
}

.custom-input :deep(.el-input__wrapper) {
  background-color: #f5f5f5;
  box-shadow: none !important;
  border: none !important;
  height: 45px;
  border-radius: 4px;
}

.code-input-wrapper {
  display: flex;
  gap: 10px;
  width: 100%;
}

.code-input {
  flex: 1;
}

.send-btn {
  height: 45px;
  background-color: transparent !important;
  /* border: none !important; */
  color: #4e4e4e;
  font-size: 14px;
  padding: 0 10px;
  border: 1px solid #a7a7a7;
  border-radius: 4px;
}

.send-btn:disabled {
  color: #999;
}


.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -10px;
  margin-bottom: 10px;
}

.forgot-link {
  font-size: 12px;
  color: #999;
  text-decoration: none;
}

.submit-btn {
  width: 100%;
  height: 45px;
  background-color: #fc9b7d !important; /* Soft coral/orange from reference */
  border-color: #fc9b7d !important;
  font-size: 16px;
  font-weight: 600;
  border-radius: 22px;
  /* 字体 */
  font-family: 'Microsoft YaHei', sans-serif;
}

.submit-btn:hover {
  filter: brightness(0.95);
}

.agreement {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-bottom: 30px;
}

.agreement a {
  color: #333;
  text-decoration: none;
}

.agreement-link:hover {
  color: #fa541c;
}

.placeholder-text {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.third-party-login {
  text-align: center;
}

.third-party-login p {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  position: relative;
}

.third-party-login p::before,
.third-party-login p::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 25%;
  height: 1px;
  background: #eee;
}

.third-party-login p::before { left: 0; }
.third-party-login p::after { right: 0; }

.icons {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.icon-wrapper {
  width: 30px;
  height: 30px;
  border: 1px solid #eee;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* .icon-wrapper:hover {
  background: #f5f7fa;
  border-color: #4316f5;
  transform: scale(1.1);
} */

.icon-wrapper img {
  width: 30px;
  height: 30px;
}
</style>
