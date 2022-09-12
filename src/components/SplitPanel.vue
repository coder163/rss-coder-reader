<template>
  <div id="split-panel" ref="SplitPanel">
    <div class="split-item" :style="{ width: Width }">

      <slot name="before"></slot>
    </div>
    <div class="split-trigger" :style="{ width: triggerWidth + 'px', height: '100%' }" @mousedown="handleMouseDown"></div>
    <div class="split-item split-item2">
      <slot name="after"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";

/**
 * 分割条的数据类型,该声明不能单独的抽离(官方未解决)
 * https://github.com/vuejs/core/issues/4294
 */
interface ISplitPanelProps {
  defaultWidth?: number;
  min?: number;
  max?: number;
}

const props = withDefaults(defineProps<ISplitPanelProps>(), {
  defaultWidth: 300,
  min: 10,
  max: 90,
  height: 300,
});
let SplitPanel = ref<HTMLElement | null>();

watch(props, (newVal, oldVal) => {
  PanelWidth.value = props.defaultWidth;
});

let PanelWidth = ref<number>();
// 滑动器宽度 （px）
let triggerWidth: number = 3;

/**
 * 计算属性，响应式
 */
let Width = computed(() => {
  return `${PanelWidth.value}px`;
});

onMounted(() => {
  PanelWidth.value = props.defaultWidth;
});

/**
 *
 * 注册鼠标事件
 */
function handleMouseDown(e: MouseEvent) {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  let clientRect: DOMRect | undefined = SplitPanel.value?.getBoundingClientRect();

  if (clientRect) {
    let offset = e.pageX - clientRect.left + triggerWidth / 2;
    PanelWidth.value = offset;
  }
}

function handleMouseUp() {
  document.removeEventListener("mousemove", handleMouseMove);
}
</script>

<style>
#split-panel {
  width: 100%;
  height: 100%;
  display: flex;

  flex-direction: row;

  flex-wrap: nowrap;
}

.split-item {
  /* min-width: 40px; */
}

.split-item2 {
  flex: 1;
}

.split-trigger {
  height: 100%;
  display: flex;
  /*width: 1px;*/
  background-color: #b5b5b5;
  flex-direction: column;
  justify-content: center;
  cursor: col-resize;
}

.transition {
  transition: width 500ms;
}
</style>
