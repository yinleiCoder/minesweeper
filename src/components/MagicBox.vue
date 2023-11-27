<script setup lang="ts">
import type { Box } from "@/types";
import { clsx } from "clsx";

defineProps<{ box: Box }>();

// 计算复杂的box样式
function computeBoxItemClassNames(box: Box) {
  const commonClassnames =
    "flex justify-center items-center cursor-pointer rounded w-14 h-14 text-white font-bold text-lg hover:text-black";
  if (!box.revealed || box.flagged) {
    return clsx(commonClassnames, "bg-gray-300/50");
  }
  const boxBg = box.mine ? "bg-red-900/30" : "bg-transparent";
  return clsx(commonClassnames, boxBg, {
    "border border-gray-100/30": !box.mine,
    "hover:bg-gray-200": !box.mine && !box.flagged,
  });
}
</script>

<template>
  <div :class="computeBoxItemClassNames(box)">
    <template v-if="box.flagged"> <span>🚩</span></template>
    <template v-else-if="box.revealed">
      <span v-if="box.mine">💣</span>
      <span v-else>
        {{ box.adjacentMines }}
      </span>
    </template>
  </div>
</template>
