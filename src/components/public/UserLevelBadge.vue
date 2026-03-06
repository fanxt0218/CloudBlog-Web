<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 60"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="`Level ${level}`"
  >
    <!-- outer rounded frame -->
    <rect
      x="2"
      y="4"
      width="96"
      height="52"
      rx="6"
      ry="6"
      fill="none"
      :stroke="outlineColor"
      :stroke-width="5"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />

    <!-- left LV text -->
    <text
      x="26"
      y="37"
      text-anchor="middle"
      alignment-baseline="middle"
      font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
      :font-size="fontSizeLV"
      font-weight="800"
      :fill="outlineColor"
    >
      LV
    </text>

    <!-- right rounded box behind the numeral -->
    <rect
      x="56"
      y="12"
      width="30"
      height="36"
      rx="5"
      ry="5"
      :fill="blockFillColor"
      :stroke="outlineColor"
      stroke-width="2"
    />

    <!-- numeral -->
    <text
      x="71"
      y="38"
      text-anchor="middle"
      alignment-baseline="middle"
      font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
      :font-size="fontSizeNum"
      font-weight="900"
      :fill="numColor"
    >
      {{ safeLevel }}
    </text>
  </svg>
</template>

<script setup lang="ts" name="UserLevelBadge">
import { computed } from 'vue'

/**
 * Props:
 * - level: number 1..10
 * - size: px size (SVG width) -- default 64 (will scale viewBox)
 * - outlineColor: stroke color for outer frame and LV text (if undefined, use palette)
 * - blockFillColor: fill color for the number's rounded block (if undefined, use palette)
 * - numColor: color for the numeral inside the block (default white or contrasting)
 *
 * Special: if you pass outlineColor="auto" (or omit colors), component uses an internal palette by level.
 */

const props = defineProps({
  level: { type: Number, required: true },
  size: { type: [Number, String], default: 64 },
  outlineColor: { type: String, default: undefined },
  blockFillColor: { type: String, default: undefined },
  numColor: { type: String, default: undefined },
})

const safeLevel = computed(() => {
  const lv = Number(props.level) || 1
  if (lv < 1) return 1
  if (lv > 10) return 10
  return lv
})

// default palette (can be adjusted)
// mapping roughly: 1-2 green, 3-5 light blue, 6-7 blue, 8-9 purple, 10 gold
const palette = [
  /*idx0 unused*/ null,
  /*1*/ { outline: '#1faa00', block: '#e6f8e6', num: '#1faa00' },
  /*2*/ { outline: '#1faa00', block: '#e6f8e6', num: '#1faa00' },
  /*3*/ { outline: '#4aa3ff', block: '#eaf6ff', num: '#4aa3ff' },
  /*4*/ { outline: '#4aa3ff', block: '#eaf6ff', num: '#4aa3ff' },
  /*5*/ { outline: '#4aa3ff', block: '#eaf6ff', num: '#4aa3ff' },
  /*6*/ { outline: '#0070d9', block: '#e7f0ff', num: '#0070d9' },
  /*7*/ { outline: '#0070d9', block: '#e7f0ff', num: '#0070d9' },
  /*8*/ { outline: '#8a4bff', block: '#f0eaff', num: '#8a4bff' },
  /*9*/ { outline: '#8a4bff', block: '#f0eaff', num: '#8a4bff' },
  /*10*/{ outline: '#d4a200', block: '#fff7e0', num: '#d4a200' },
]

const chosenPalette = computed(() => palette[safeLevel.value] || palette[1])

const outlineColor = computed(() => {
  if (props.outlineColor && props.outlineColor !== 'auto') return props.outlineColor
  return chosenPalette.value?.outline
})
const blockFillColor = computed(() => {
  if (props.blockFillColor && props.blockFillColor !== 'auto') return props.blockFillColor
  return chosenPalette.value?.block
})
const numColor = computed(() => {
  if (props.numColor && props.numColor !== 'auto') return props.numColor
  return chosenPalette.value?.num
})

// font sizing tuned for viewBox 100x60
const fontSizeLV = computed(() => Math.round(20 * (64 / Number(props.size || 64))))
const fontSizeNum = computed(() => Math.round(22 * (64 / Number(props.size || 64))))
</script>

<style scoped>
/* no extra CSS needed; SVG attributes control visuals */
</style>
