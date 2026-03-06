<template>
  <transition name="fade-slide">
    <div v-if="visible" class="ai-welcome">
      <div class="welcome-content">
        <h1 class="welcome-title">你好&nbsp;{{ userName }}!&nbsp;想聊些什么？</h1>
        <div class="welcome-suggestions">
          <!-- Suggestion pills can go here if needed -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  userName: string
}>()
</script>

<style scoped>
.ai-welcome {
  position: absolute;
  top: 36%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
  pointer-events: none; /* Allows clicking through if necessary, though mainly for display */
  z-index: 10;
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

/* Transition effects */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%); /* Move up on exit */
}
</style>
