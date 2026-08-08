const CustomThemeEditor = ({ profile, onSave, onChangePreview, onClose }) => {
    // Utility to correctly segment characters (emojis, unicode, etc)
    const segmentChars = (str) => {
        if (!str) return [];
        // Remove spaces for internal counting
        const cleaned = str.replace(/\s+/g, '');
        if (window.Intl && window.Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('id', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(cleaned)).map(s => s.segment).filter(c => c);
        }
        return Array.from(cleaned).filter(c => c);
    };

    const getInitial = () => {
        if (profile.customEmojis && profile.customEmojis.length > 0) {
            const segmented = segmentChars(profile.customEmojis.join(''));
            // If they had more than 12 previously, truncate. If less, pad it just to be safe.
            // But we can just return up to 12.
            let chars = segmented.slice(0, 12);
            if (chars.length < 12) {
                const defaultChars = segmentChars('😀😁😂🤣😅😎😍🥰😘😊😇🤩');
                chars = [...chars, ...defaultChars.slice(chars.length, 12)];
            }
            return chars.join('');
        }
        return '😀😁😂🤣😅😎😍🥰😘😊😇🤩';
    };

    const [inputValue, setInputValue] = React.useState(getInitial());
    const inputRef = React.useRef(null);

    const chars = React.useMemo(() => segmentChars(inputValue), [inputValue]);

    // Update preview in real-time
    React.useEffect(() => {
        if (onChangePreview) {
            // Pad to 12 if less than 12 so the board always has valid 12 emojis
            let previewChars = [...chars];
            if (previewChars.length < 12) {
                const defaultChars = segmentChars('😀😁😂🤣😅😎😍🥰😘😊😇🤩');
                previewChars = [...previewChars, ...defaultChars.slice(previewChars.length, 12)];
            }
            onChangePreview(previewChars);
        }
    }, [chars, onChangePreview]);

    const handleSave = () => {
        if (chars.length === 12) {
            onSave(chars);
        }
    };

    const handleInputChange = (e) => {
        // We only store the characters, no spaces
        const val = e.target.value.toUpperCase();
        const newChars = segmentChars(val);
        if (newChars.length <= 12) {
            setInputValue(newChars.join(''));
        } else {
            setInputValue(newChars.slice(0, 12).join(''));
        }
    };

    const handleContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            // Move cursor to end
            const len = inputRef.current.value.length;
            inputRef.current.setSelectionRange(len, len);
        }
    };

    return (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[250] flex flex-col items-center justify-center p-4 modal-enter">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col">
                <h3 className="font-black text-xl text-pink-500 mb-2">Edit Tema Custom</h3>
                <p className="text-xs text-gray-500 font-medium mb-4">
                    Tema harus berisi tepat 12 karakter (huruf, angka, atau emoji).
                </p>

                <div 
                    className="relative mb-4 cursor-text select-none"
                    onClick={handleContainerClick}
                >
                    {/* Hidden input to capture typing */}
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={inputValue}
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                        style={{ zIndex: 10, color: 'transparent', textShadow: 'none' }}
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                    />

                    {/* Visual Grid for 12 characters */}
                    <div className="grid grid-cols-4 gap-2 pointer-events-none">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const char = chars[i];
                            const isActive = i === chars.length; // Next box to be typed
                            return (
                                <div 
                                    key={i} 
                                    className={`
                                        aspect-square flex items-center justify-center text-3xl
                                        border-2 rounded-xl transition-all duration-200
                                        ${char ? 'bg-pink-50 border-pink-300' : 'bg-gray-50 border-gray-200'}
                                        ${isActive ? 'border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.3)] ring-2 ring-pink-200' : ''}
                                    `}
                                >
                                    {char || (isActive ? <div className="w-0.5 h-6 bg-pink-500 animate-pulse rounded-full"></div> : '')}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-sm font-bold text-gray-700">
                        {chars.length} / 12
                    </span>
                    <span className={`text-xs font-semibold ${chars.length === 12 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {chars.length === 12 ? 'Tema siap disimpan.' : `Masih kurang ${12 - chars.length} karakter.`}
                    </span>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                    <button 
                        onClick={handleSave} 
                        disabled={chars.length !== 12}
                        className={`flex-1 py-3 font-black text-white rounded-xl shadow-md transition-all ${chars.length === 12 ? 'bg-pink-500 hover:bg-pink-600 active:scale-95' : 'bg-gray-300 cursor-not-allowed opacity-70'}`}
                    >
                        Simpan Tema
                    </button>
                </div>
            </div>
        </div>
    );
};
