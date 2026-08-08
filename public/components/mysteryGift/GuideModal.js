const GuideModal = ({ isOpen, onClose, title, children }) => {
    const { useEffect, useState } = React;
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        if(typeof AudioEngine !== 'undefined') AudioEngine.uiClick();
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            ></div>
            
            <div 
                className={`w-full sm:w-[400px] h-[85vh] sm:h-[80vh] sm:max-h-[700px] bg-white rounded-t-3xl sm:rounded-3xl flex flex-col relative pointer-events-auto shadow-2xl transition-transform duration-300 ${isClosing ? 'translate-y-full sm:scale-95 sm:translate-y-0 sm:opacity-0' : 'translate-y-0 sm:scale-100 sm:opacity-100'}`}
            >
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden" onClick={handleClose}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                </div>

                <div className="px-5 pt-2 sm:pt-5 pb-3 flex justify-between items-center border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-800">{title}</h2>
                    <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll p-5 bg-[#fcfcfd]">
                    {children}
                </div>
            </div>
            
            <style>{`
                .guide-section-title { font-size: 13px; font-weight: 900; color: #374151; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
                .guide-section { background: white; border: 1px solid #f3f4f6; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
                .guide-text { font-size: 13px; color: #4b5563; line-height: 1.6; font-weight: 500; }
                .guide-list { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
                .guide-list li { font-size: 13px; color: #4b5563; line-height: 1.5; font-weight: 500; display: flex; align-items: flex-start; gap: 8px; }
                .guide-list li::before { content: "•"; color: #818cf8; font-weight: bold; font-size: 16px; line-height: 1.2; }
                .guide-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid #f3f4f6; }
                .guide-table th { background: #f9fafb; font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; padding: 10px 12px; text-align: left; }
                .guide-table td { font-size: 12px; font-weight: 600; color: #374151; padding: 10px 12px; border-top: 1px solid #f3f4f6; }
            `}</style>
        </div>
    );
};


