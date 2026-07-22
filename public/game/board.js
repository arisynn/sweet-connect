// --- PATHFINDING ---
const isPathClear = (board, r1, c1, r2, c2) => {
    if (r1 === r2) { const min = Math.min(c1, c2); const max = Math.max(c1, c2); for (let c = min + 1; c < max; c++) if (board[r1][c] !== 0) return false; return true; }
    if (c1 === c2) { const min = Math.min(r1, r2); const max = Math.max(r1, r2); for (let r = min + 1; r < max; r++) if (board[r][c1] !== 0) return false; return true; }
    return false;
};
const getPath = (board, r1, c1, r2, c2) => {
    if (r1 === r2 && c1 === c2) return null; 
    if (board[r1][c1] !== board[r2][c2] || board[r1][c1] === 0) return null; 
    if ((r1 === r2 || c1 === c2) && isPathClear(board, r1, c1, r2, c2)) return [{r: r1, c: c1}, {r: r2, c: c2}]; 
    if (board[r1][c2] === 0 && isPathClear(board, r1, c1, r1, c2) && isPathClear(board, r1, c2, r2, c2)) return [{r: r1, c: c1}, {r: r1, c: c2}, {r: r2, c: c2}];
    if (board[r2][c1] === 0 && isPathClear(board, r1, c1, r2, c1) && isPathClear(board, r2, c1, r2, c2)) return [{r: r1, c: c1}, {r: r2, c: c1}, {r: r2, c: c2}];
    for (let dir = -1; dir <= 1; dir += 2) {
        let c = c1 + dir; while (c >= 0 && c < COLS + 2 && board[r1][c] === 0) {
            if (board[r2][c] === 0 && isPathClear(board, r1, c, r2, c) && isPathClear(board, r2, c, r2, c2)) return [{r: r1, c: c1}, {r: r1, c}, {r: r2, c}, {r: r2, c: c2}]; c += dir;
        }
    }
    for (let dir = -1; dir <= 1; dir += 2) {
        let r = r1 + dir; while (r >= 0 && r < ROWS + 2 && board[r][c1] === 0) {
            if (board[r][c2] === 0 && isPathClear(board, r, c1, r, c2) && isPathClear(board, r, c2, r2, c2)) return [{r: r1, c: c1}, {r, c: c1}, {r, c: c2}, {r: r2, c: c2}]; r += dir;
        }
    }
    return null; 
};
const findHint = (board) => {
    for (let i = 1; i <= ROWS; i++) for (let j = 1; j <= COLS; j++) if (board[i][j] !== 0)
        for (let k = 1; k <= ROWS; k++) for (let l = 1; l <= COLS; l++) if ((i !== k || j !== l) && board[i][j] === board[k][l]) {
            const path = getPath(board, i, j, k, l); if (path) return {p1: {r: i, c: j}, p2: {r: k, c: l}, path};
        }
    return null;
};
const countRemaining = (b) => { let count = 0; if (b) for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) if (b[r][c] !== 0) count++; return count; };

// --- SMART BOARD GENERATION ---
const placeTilesSmartly = (tiles, currentBoard = null, positions = null) => {
    const newBoard = currentBoard ? [...currentBoard.map(row => [...row])] : Array.from({ length: ROWS + 2 }, () => Array(COLS + 2).fill(0));
    
    // If no specific positions provided, we are generating the full board
    const posList = positions || [];
    if (!positions) {
        for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) posList.push({r, c});
    }

    for (let attempt = 0; attempt < 50; attempt++) {
        let currentTiles = [...tiles].sort(() => Math.random() - 0.5);
        let boardTemp = [...newBoard.map(row => [...row])];

        for (let i = 0; i < posList.length; i++) {
            const { r, c } = posList[i];
            let selectedIdx = -1;

            // Try to find a tile that doesn't cluster
            for (let tIdx = 0; tIdx < currentTiles.length; tIdx++) {
                const tile = currentTiles[tIdx];
                let sameNeighbors = 0;
                
                // Check immediate neighbors to prevent adjacent identical tiles
                if (r > 1 && boardTemp[r-1][c] === tile) sameNeighbors++;
                if (c > 1 && boardTemp[r][c-1] === tile) sameNeighbors++;
                if (r > 1 && c > 1 && boardTemp[r-1][c-1] === tile) sameNeighbors++;
                if (r > 1 && c < COLS && boardTemp[r-1][c+1] === tile) sameNeighbors++;
                
                // Check if row or col already has too many of this tile (max 3 per row/col as a soft limit)
                let countInRow = 0;
                for (let tc = 1; tc < c; tc++) if (boardTemp[r][tc] === tile) countInRow++;
                
                let countInCol = 0;
                for (let tr = 1; tr < r; tr++) if (boardTemp[tr][c] === tile) countInCol++;

                if (sameNeighbors === 0 && countInRow < 3 && countInCol < 3) {
                    selectedIdx = tIdx;
                    break;
                }
            }

            // Fallback: take the first one if we can't find a perfect fit
            if (selectedIdx === -1) selectedIdx = 0;
            boardTemp[r][c] = currentTiles.splice(selectedIdx, 1)[0];
        }

        if (findHint(boardTemp)) return boardTemp;
    }

    // Ultimate fallback if smart placement somehow fails to find a solvable board
    let fallbackTiles = [...tiles].sort(() => Math.random() - 0.5);
    for (let i = 0; i < posList.length; i++) {
        newBoard[posList[i].r][posList[i].c] = fallbackTiles[i];
    }
    
    // Force a guaranteed solvable state for fallback
    for (let i = 0; i < fallbackTiles.length; i++) {
        for (let j = i + 1; j < fallbackTiles.length; j++) {
            if (fallbackTiles[i] === fallbackTiles[j]) {
                newBoard[posList[0].r][posList[0].c] = fallbackTiles[i];
                newBoard[posList[1].r][posList[1].c] = fallbackTiles[j];
                if (findHint(newBoard)) return newBoard;
            }
        }
    }

    return newBoard;
};

const generateBoard = (themeKey, level) => {
    const fullThemeData = THEMES[themeKey].data;
    const varietyCount = getTileVarietyCount(level || 1, fullThemeData.length);
    const themeData = [...fullThemeData].sort(() => Math.random() - 0.5).slice(0, varietyCount);
    let selectedIds = []; const requiredPairs = (ROWS * COLS) / 4;
    while (selectedIds.length < requiredPairs) selectedIds.push(...[...themeData].sort(() => Math.random() - 0.5));
    selectedIds = selectedIds.slice(0, requiredPairs);
    let tiles = []; selectedIds.forEach(id => tiles.push(id, id, id, id)); 
    
    return placeTilesSmartly(tiles);
};

// --- GUARANTEED SHUFFLE (used when the board reaches a deadlock) ---
const guaranteedShuffle = (currentBoard) => {
    let tiles = []; let pos = [];
    for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) if (currentBoard[r][c] !== 0) { tiles.push(currentBoard[r][c]); pos.push({r, c}); }
    if (tiles.length === 0) return currentBoard; 
    
    return placeTilesSmartly(tiles, currentBoard, pos);
};
