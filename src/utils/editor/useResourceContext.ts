import { ref } from 'vue'

export interface ResourceData {
  id?: number
  hasNewFile?: boolean
  resourceName: string
  resourceUrl: string
  resourceSize: string
  resourceType: string
  resourceFormat: string
  resourceDescription: string
  resourceTags: string
  resourceCreator: string
  resourceIsPublic: string
  resourceBindContentId: string
  resourceBindContentTyp: string
}

const pendingResource = ref<ResourceData | null>(null)
const isResourceChanged = ref(false)

export const useResourceContext = () => {
  const setPendingResource = (data: ResourceData) => {
    pendingResource.value = data
    isResourceChanged.value = true
  }

  const getPendingResource = () => {
    return pendingResource.value
  }

  const clearPendingResource = () => {
    pendingResource.value = null
    isResourceChanged.value = false
  }

  const markAsChanged = () => {
    isResourceChanged.value = true
  }

  return {
    pendingResource,
    isResourceChanged,
    setPendingResource,
    getPendingResource,
    clearPendingResource,
    markAsChanged
  }
}
