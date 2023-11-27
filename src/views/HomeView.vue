<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { clsx } from "clsx";
import type { Box } from "@/types";

const gameResult = ref("请开始挑战");

// 生成原始数据
const WIDTH = 10;
const HEIGHT = 10;
const data = ref(
  Array.from({ length: HEIGHT }, (_, x) =>
    Array.from(
      { length: HEIGHT },
      (_, y) =>
        <Box>{
          x,
          y,
          adjacentMines: 0,
          revealed: false,
        }
    )
  )
);

// 生成随机炸弹
function generateMines(initialBox: Box) {
  for (const row of data.value) {
    for (const box of row) {
      if (Math.abs(initialBox.x - box.x) <= 1) {
        continue;
      }
      if (Math.abs(initialBox.y - box.y) <= 1) {
        continue;
      }
      box.mine = Math.random() < 0.3;
    }
  }
  updateNumbers();
}

// 方向
const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

// 判断周围的炸弹数
function updateNumbers() {
  data.value.forEach((row, x) => {
    row.forEach((box, y) => {
      if (box.mine) {
        return;
      }
      getSiblings(box).forEach((boxItem) => {
        // 相邻box是否是炸弹
        if (boxItem.mine) {
          box.adjacentMines += 1;
        }
      });
    });
  });
}

function getSiblings(box: Box) {
  return directions
    .map(([dx, dy]) => {
      const x2 = box.x + dx;
      const y2 = box.y + dy;
      // 边界判断
      if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) {
        return undefined;
      }
      return data.value[x2][y2];
    })
    .filter(Boolean) as Box[];
}

let mineGenerated = false;

// box被点击展开
function handleBoxClick(e: MouseEvent, box: Box) {
  if (!mineGenerated) {
    generateMines(box);
    mineGenerated = true;
  }
  if (box.mine) {
    gameResult.value = "你个菜逼！";
  }
  expandZeroBox(box);
  box.revealed = true;
}

function handleBoxContextMenuClick(box: Box) {
  if (box.revealed) {
    return;
  }
  box.flagged = !box.flagged;
}

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

function expandZeroBox(box: Box) {
  console.log(box.flagged);
  if (box.adjacentMines !== 0 || box.revealed || box.mine) {
    return;
  }
  getSiblings(box).forEach((boxItem) => {
    if (!boxItem.revealed) {
      boxItem.revealed = true;
      expandZeroBox(boxItem);
    }
  });
}

function checkGameState() {
  if (!mineGenerated) {
    return;
  }
  const boxs = data.value.flat();
  if (boxs.every((box) => box.revealed || box.flagged)) {
    if (boxs.some((box) => box.flagged && !box.mine)) {
      gameResult.value = "你输了！";
    }
  }
}

watchEffect(checkGameState);
</script>

<template>
  <main class="flex items-center justify-evenly min-h-screen bg-zinc-800">
    <div class="flex flex-col gap-2 justify-center flex-wrap box-border">
      <h1
        class="font-bold text-4xl hover:text-red-700/30 duration-300 text-white"
      >
        扫雷-致敬windows经典
      </h1>
      <div class="font-bold text-6xl text-center text-red-700">
        {{ gameResult }}
      </div>
    </div>
    <section class="flex flex-col gap-1">
      <div v-for="(row, x) in data.value" :key="x" class="flex gap-1">
        <div
          v-for="(box, y) in row"
          :key="y"
          :class="computeBoxItemClassNames(box)"
          @click="handleBoxClick($event, box)"
          @contextmenu.prevent="handleBoxContextMenuClick(box)"
        >
          <template v-if="box.flagged"> <span>🚩</span></template>
          <template v-else-if="box.revealed">
            <span v-if="box.mine">💣</span>
            <span v-else>
              {{ box.adjacentMines }}
            </span>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>
