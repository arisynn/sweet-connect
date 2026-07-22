// ===================== COMBO ANIMATION OVERLAY =====================
const ComboOverlay = ({ combo }) => {
    if (!combo) return null;
    
    const isFloating = combo.r !== undefined && combo.c !== undefined;

    return (
        <div 
            className="absolute z-[120] pointer-events-none flex flex-col items-center"
            style={isFloating ? {
                left: `calc((${combo.c + 0.5} / 12) * 100%)`,
                top: `calc((${combo.r + 0.5} / 18) * 100%)`,
                transform: 'translate(-50%, -50%)',
            } : {
                left: '50%',
                top: '30%',
                transform: 'translateX(-50%)'
            }}
        >
            <div key={combo.count + '-' + combo.bonus} className="flex flex-col items-center" style={{ animation: 'floatUpCombo 1s ease-out forwards' }}>
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-500 drop-shadow-md" style={{ WebkitTextStroke: '0.5px white', letterSpacing: '0.05em' }}>
                    Kombo x{combo.count}
                </div>
                <div className="text-sm font-bold text-white bg-black/40 px-2 py-0.5 rounded-full mt-0.5 shadow-sm backdrop-blur-sm">
                    +{combo.bonus} Pts
                </div>
            </div>
        </div>
    );
};
