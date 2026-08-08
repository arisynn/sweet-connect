const GameBoard = () => {
    const ctx = React.useContext(GameContext);
    const { gameState, gameStateRef, activeTheme, activeThemeRef, board, wrongConnectionPenalty, activePath, hintPath, wrongTile, hintActiveTiles, matchedTiles, selectedTile, setSelectedTile, AudioEngine, THEMES, comboDisplay, handleTileClick, showBoardClear, showTimeoutFlash } = ctx;
    
    // We need COLS and ROWS from constants.js which are usually globally available
    
    return (
        <React.Fragment>
        <div style={{ visibility: (gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'COUNTDOWN') ? 'visible' : 'hidden' }} className={`flex-1 w-full relative overflow-hidden ${(THEMES[activeThemeRef.current || activeTheme]?.background || THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home']) ? 'bg-transparent' : 'theme-bg'}`} onClick={() => { if (gameStateRef.current === 'PLAYING' && selectedTile) { AudioEngine.uiCancel(); setSelectedTile(null); } }} >
                    {board.length > 0 && (() => {
                        const P = 0.3; // 30% padding instead of full 1 tile padding
                        const getSvgX = (c) => c === 0 ? P / 2 : c === COLS + 1 ? P + COLS + P / 2 : P + (c - 1) + 0.5;
                        const getSvgY = (r) => r === 0 ? P / 2 : r === ROWS + 1 ? P + ROWS + P / 2 : P + (r - 1) + 0.5;
                        return (
                        <div className="absolute inset-0">
                            {wrongConnectionPenalty && (
                                <div className="absolute z-[100] text-red-500 font-black text-2xl drop-shadow-md pointer-events-none"
                                     style={{
                                         left: `calc((${getSvgX(wrongConnectionPenalty.c)} / ${COLS + 2 * P}) * 100%)`,
                                         top: `calc((${getSvgY(wrongConnectionPenalty.r)} / ${ROWS + 2 * P}) * 100%)`,
                                         transform: 'translate(-50%, -100%)',
                                         animation: 'floatUp 1s ease-out forwards'
                                     }}>
                                    -{wrongConnectionPenalty.sec}s
                                </div>
                            )}
                            <svg viewBox={`0 0 ${COLS + 2 * P} ${ROWS + 2 * P}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                                {hintPath && (
                                    <g><path d={`M ${hintPath.map(p => `${getSvgX(p.c)} ${getSvgY(p.r)}`).join(' L ')}`} fill="none" stroke="#fbbf24" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.15,0.15" className="hint-path-line" style={{ filter: 'drop-shadow(0px 0px 2px rgba(251,191,36,0.8))' }} /></g>
                                )}
                                {activePath && (
                                    <g><path d={`M ${activePath.map(p => `${getSvgX(p.c)} ${getSvgY(p.r)}`).join(' L ')}`} fill="none" stroke="#f472b6" strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round" className="path-line-outer"/></g>
                                )}
                            </svg>

                            <div className="absolute inset-0 grid p-0 border border-[#f472b6]/50" style={{ zIndex: 20, gridTemplateColumns: `${P}fr repeat(${COLS}, 1fr) ${P}fr`, gridTemplateRows: `${P}fr repeat(${ROWS}, 1fr) ${P}fr`, gap: '1px' }}>
                                {board.map((row, r) => row.map((cellId, c) => {
                                    if (r === 0 || r === ROWS + 1 || c === 0 || c === COLS + 1) return <div key={`${r}-${c}`} className="w-full h-full pointer-events-none" />;
                                    const isSelected = selectedTile && selectedTile.r === r && selectedTile.c === c;
                                    const matchingTile = matchedTiles.find(m => m.r === r && m.c === c);
                                    const isMatching = !!matchingTile;
                                    const isHinting = hintActiveTiles.find(h => h.r === r && h.c === c);
                                    const isWrong = wrongTile && wrongTile.r === r && wrongTile.c === c;
                                    const isEmpty = cellId === 0 && !isMatching;
                                    const hideBg = THEMES[activeThemeRef.current || activeTheme]?.hideBackground || false;
                                    const cellData = isMatching ? matchingTile.id : cellId;

                                    return (
                                        <div key={`${r}-${c}`} className="relative w-full h-full border border-[#f472b6]/30">
                                            {!isEmpty && (
                                                <button className={`cute-tile ${isSelected ? 'selected' : ''} ${isMatching ? 'matched' : ''} ${isHinting ? 'hint-glow' : ''} ${isWrong ? 'wrong' : ''}`}
                                                    style={{ WebkitTapHighlightColor: 'transparent' }} onClick={(e) => handleTileClick(e, r, c)}>
                                                    {cellData && (cellData.startsWith('http') || cellData.startsWith('/') || cellData.includes('.png') || cellData.includes('.svg')) ? (
                                                        <img src={cellData} alt="tile" className="w-full h-full object-contain pointer-events-none select-none" draggable="false" />
                                                        ) : (
                                                        <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none select-none">
                                                            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={activeTheme === 'cute_symbols' ? "58" : hideBg ? "88" : "70"} fill={activeTheme === 'cute_symbols' ? "var(--theme-text)" : "currentColor"}>{cellData}</text>
                                                        </svg>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                }))}
                            </div>
                        </div>
                        );
                    })()}
                    
                    <ComboOverlay combo={comboDisplay} />
                </div>

                

                {showBoardClear && <div className="absolute inset-0 bg-white board-clear-flash z-[90] pointer-events-none" />}
                {showTimeoutFlash && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[95] timeout-flash pointer-events-none" style={{ background: 'rgba(239,68,68,0.9)' }}>
                        <span className="text-white text-3xl font-black drop-shadow-lg">Waktu Habis!</span>
                        <span className="text-white text-lg font-bold mt-2">-1 Nyawa</span>
                    </div>
                )}

        </React.Fragment>
        );
};
