import { ref } from "vue";
import type { Box } from "@/types";

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

export class Game {
    data = ref<Box[][]>([])
    mineGenerated = false
    gameState = ref<'play' | 'win' | 'lose'>('play')

    constructor(public width: number, public height: number) {
        this.reset()
    }

    reset() {
        this.gameState.value = 'play'
        this.data = ref(
            Array.from({ length: this.height }, (_, x) =>
                Array.from(
                    { length: this.width },
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
    }

    // 生成随机炸弹
    generateMines(initialBox: Box) {
        for (const row of this.data.value) {
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
        this.updateNumbers();
    }

    // 判断周围的炸弹数
    updateNumbers() {
        this.data.value.forEach((row) => {
            row.forEach((box, y) => {
                if (box.mine) {
                    return;
                }
                this.getSiblings(box).forEach((boxItem) => {
                    // 相邻box是否是炸弹
                    if (boxItem.mine) {
                        box.adjacentMines += 1;
                    }
                });
            });
        });
    }

    getSiblings(box: Box) {
        return directions
            .map(([dx, dy]) => {
                const x2 = box.x + dx;
                const y2 = box.y + dy;
                // 边界判断
                if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) {
                    return undefined;
                }
                return this.data.value[x2][y2];
            })
            .filter(Boolean) as Box[];
    }

    // box被点击展开
    handleBoxClick(box: Box) {
        if(this.gameState.value !== 'play') {
            return;
        }
        if (!this.mineGenerated) {
            this.generateMines(box);
            this.mineGenerated = true;
        }
        this.expandZeroBox(box);
        if (box.mine) {
            this.gameState.value = 'lose'
            this.showAllMines()
            return
        }
        box.revealed = true;
    }

    handleBoxContextMenuClick(box: Box) {
        if(this.gameState.value !== 'play') {
            return;
        }
        if (box.revealed) {
            return;
        }
        box.flagged = !box.flagged;
    }

    expandZeroBox(box: Box) {
        console.log(box.flagged);
        if (box.adjacentMines !== 0 || box.revealed || box.mine) {
            return;
        }
        this.getSiblings(box).forEach((boxItem) => {
            if (!boxItem.revealed) {
                boxItem.revealed = true;
                this.expandZeroBox(boxItem);
            }
        });
    }

    showAllMines() {
        this.data.value.flat().forEach(box => {
            if(box.mine) {
                box.revealed = true
            }
        })
    }

    checkGameState() {
        if (!this.mineGenerated) {
            return;
        }
        const boxs = this.data.value.flat();
        if (boxs.every((box) => box.revealed || box.flagged)) {
            if (boxs.some((box) => box.flagged && !box.mine)) {
                this.gameState.value = 'lose'
                this.showAllMines()
            } else {
                this.gameState.value = 'win'
            }
        }
    }

}