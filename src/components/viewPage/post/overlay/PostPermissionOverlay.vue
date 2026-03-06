<!-- PostPermissionOverlay.vue -->
<template>
  <div class="permission-overlay">
    <div class="mask-layer">
      <PostForbidden v-if="type === 0" />
      <PostVip v-if="type === 1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PostForbidden from '@/components/viewPage/post/overlay/PostForbiddenMask.vue'
import PostVip from '@/components/viewPage/post/overlay/PostVipMask.vue'
defineProps<{
  type: number
}>()
</script>

<style scoped>
.permission-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 850px;
  max-width: calc(100vw - 32px);
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.mask-layer {
  /* background: rgba(255, 255, 255, 0.92); */
  /* backdrop-filter: blur(6px); */

  /* border-radius: 14px; */
  /* padding: 40px; */

  /* box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18); */
  pointer-events: auto;
}
</style>
