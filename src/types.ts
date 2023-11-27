export interface Box {
    x: number;
    y: number;
    revealed: boolean; // 是否翻开
    mine?: boolean; // 是否是炸弹
    flagged?: boolean; //
    adjacentMines: number; // 周围的炸弹数
}