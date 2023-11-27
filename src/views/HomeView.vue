<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { Box } from "@/types";
import MagicBox from "@/components/MagicBox.vue";
import { Game } from "@/composables/game";

const game = new Game(10, 10);
const data = game.data;

// watchEffect(checkGameState);
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
        {{ game.gameState }}
      </div>
    </div>
    <section class="flex flex-col gap-1">
      <div v-for="(row, x) in data" :key="x" class="flex gap-1">
        <MagicBox
          v-for="(box, y) in row"
          :key="y"
          :box="box"
          @click="game.handleBoxClick(box)"
          @contextmenu.prevent="game.handleBoxContextMenuClick(box)"
        />
      </div>
    </section>
  </main>
</template>
