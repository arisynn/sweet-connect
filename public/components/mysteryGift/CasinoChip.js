const CasinoChip = ({ amount }) => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
        w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.6),0_1px_1px_rgba(0,0,0,0.3)] 
        flex items-center justify-center border-2 border-white bg-pink-500 popup-chip pointer-events-none">
        <div className="w-full h-full rounded-full border-[1.5px] border-dashed border-pink-200 flex flex-col items-center justify-center bg-pink-500">
            <span className="text-[10px] sm:text-[11px] font-black text-white leading-none drop-shadow-md">{amount}</span>
        </div>
    </div>
);

