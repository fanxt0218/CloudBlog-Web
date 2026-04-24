<template>
  <div class="resource-bind-tool">
    <ToolbarButton
      icon="UploadFilled"
      @click="showDialog = true"
      tooltip="绑定资源"
    >
      <template #icon>
        <svg t="1768754123456" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4567" width="18" height="18">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#707070"></path>
          <path d="M623.8 358h-223.6c-8.8 0-16 7.2-16 16v297.9c0 8.8 7.2 16 16 16h223.6c8.8 0 16-7.2 16-16V374c0-8.8-7.2-16-16-16z m-16 297.9H416.2V390h191.6v265.9z" fill="#707070"></path>
          <path d="M448 480h128v32H448z" fill="#707070"></path>
        </svg>
      </template>
    </ToolbarButton>

    <ResourceBindDialog
      v-model="showDialog"
      :content-id="selectedDraftId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolbarButton from './ToolBarButton.vue'
import ResourceBindDialog from './ResourceBindDialog.vue'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  editor: any
  selectedDraftId?: number | null
}>()

const showDialog = ref(false)
</script>

<style scoped>
.resource-bind-tool {
  display: flex;
  align-items: center;
}
</style>
