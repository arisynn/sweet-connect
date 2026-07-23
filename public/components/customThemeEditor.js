const CustomThemeEditor = ({ profile, onSave, onClose }) => {
    const [inputValue, setInputValue] = useState(
        (profile.customEmojis && profile.customEmojis.length > 0) 
            ? profile.customEmojis.join(' ') 
            : '👩 👨 👧 👦 👶 👵 👴 👮 🕵 💂 👷 🤴 👸 👳 👲 🧔 👱 👼'
    );
    const [error, setError] = useState('');

    const handleSave = () => {
        // Extract all emojis/characters, ignoring spaces
        const rawChars = Array.from(inputValue.replace(/\s+/g, ''));
        if (rawChars.length === 0) {
            setError('Masukkan setidaknya 1 emoji!');
            return;
        }

        let emojis = [];
        // We need 18 emojis. If they provided less, repeat them. If more, slice.
        while (emojis.length < 18) {
            emojis = emojis.concat(rawChars);
        }
        emojis = emojis.slice(0, 18);

        onSave(emojis);
    };

    return (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[250] flex flex-col items-center justify-center p-4 modal-enter">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in flex flex-col">
                <h3 className="font-black text-xl text-pink-500 mb-2">Edit Tema Custom</h3>
                <p className="text-xs text-gray-500 font-medium mb-4">Masukkan setidaknya beberapa emoji atau karakter favorit untuk mengisi papan permainan. Maksimal 18 karakter.</p>
                
                <textarea 
                    value={inputValue}
                    onChange={(e) => {
                        const val = e.target.value;
                        const chars = Array.from(val.replace(/\s+/g, ''));
                        if (chars.length <= 18) {
                            setInputValue(val);
                            setError('');
                        } else {
                            setError('Maksimal 18 karakter telah tercapai!');
                        }
                    }}
                    className="w-full bg-gray-50 border-2 border-pink-100 rounded-xl p-3 text-lg focus:outline-none focus:border-pink-500 transition-colors mb-2 min-h-[100px]"
                    placeholder="Masukkan karakter di sini..."
                ></textarea>
                
                {error && <p className="text-xs text-red-500 font-bold mb-3">{error}</p>}

                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="px-4 py-2 font-bold text-gray-500 bg-gray-100 rounded-xl">Batal</button>
                    <button onClick={handleSave} className="px-5 py-2 font-black text-white bg-pink-500 rounded-xl shadow-md">Simpan Tema</button>
                </div>
            </div>
        </div>
    );
};
