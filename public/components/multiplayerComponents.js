const MultiplayerPopup = ({ isOpen, onClose, onCreateRoom, onJoinRoom }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-in-center relative overflow-hidden">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Multiplayer</h2>
                    <p className="text-gray-500 text-sm mt-1">Bermain bersama teman menggunakan Room Code.</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={onCreateRoom} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-2xl shadow-md active:scale-95 transition-transform flex flex-col items-center justify-center">
                        <span className="font-bold text-lg mb-0.5">Buat Room</span>
                        <span className="text-pink-100 text-xs text-center">Buat room baru lalu undang teman.</span>
                    </button>
                    <button onClick={onJoinRoom} className="w-full bg-white border-2 border-pink-100 text-pink-600 p-4 rounded-2xl shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center">
                        <span className="font-bold text-lg mb-0.5">Gabung Room</span>
                        <span className="text-pink-400 text-xs text-center">Masukkan kode room untuk bergabung.</span>
                    </button>
                </div>
                <button onClick={onClose} className="w-full mt-4 text-gray-400 font-bold py-3 active:text-gray-600 transition-colors">Batal</button>
            </div>
        </div>
    );
};

const JoinRoomDialog = ({ isOpen, onClose, onJoin }) => {
    const [code, setCode] = React.useState("");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-in-center">
                <h2 className="text-xl font-black text-gray-800 text-center mb-4">Gabung Room</h2>
                <input 
                    type="text" 
                    value={code} 
                    onChange={e => setCode(e.target.value.toUpperCase())} 
                    placeholder="Masukkan Room Code" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-black text-gray-800 tracking-widest outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all mb-6"
                    maxLength={6}
                />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 active:bg-gray-200 transition-colors">Batal</button>
                    <button onClick={() => { if(code.trim()) onJoin(code.trim()); else window.Dialog.showError("Error", "Kode room tidak boleh kosong."); }} className="flex-1 py-3 rounded-xl font-bold text-white bg-pink-500 active:bg-pink-600 shadow-md transition-colors">Gabung</button>
                </div>
            </div>
        </div>
    );
};

const GameModeSheet = ({ isOpen, onClose, onSelect, currentMode, isHost }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-fade-in-up sm:scale-in-center" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                <h2 className="text-xl font-black text-gray-800 text-center mb-6">Pilih Mode Permainan</h2>
                <div className="flex flex-col gap-3">
                    <button onClick={() => { if(!isHost) return; onSelect('Friendly Match'); }} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${currentMode === 'Friendly Match' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-white'} ${!isHost && 'opacity-70'}`}>
                        <div className="font-bold text-gray-800 text-lg">Friendly Match</div>
                        <div className="text-gray-500 text-xs mt-1">Main santai tanpa taruhan.</div>
                    </button>
                    <button onClick={() => { if(!isHost) return; onSelect('Match Berhadiah'); }} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${currentMode === 'Match Berhadiah' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-white'} ${!isHost && 'opacity-70'}`}>
                        <div className="font-bold text-gray-800 text-lg">Match Berhadiah</div>
                        <div className="text-gray-500 text-xs mt-1">Taruhan Coin atau Gem (Host yang menentukan). Semua pemain harus setuju.</div>
                    </button>
                </div>
            </div>
        </div>
    );
};
