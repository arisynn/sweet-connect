// ===================== CUSTOM MODAL =====================
const CustomModal = ({ isOpen, title, content, confirmText, onConfirm, cancelText, onCancel, hideHeader, hideFooter, maxWidthClass = "w-full max-w-[340px]" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm modal-enter">
            <div className={`bg-white rounded-3xl ${maxWidthClass} shadow-2xl overflow-hidden flex flex-col items-center text-center p-6`}>
                {!hideHeader && (
                    <div className="w-full flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-gray-800">{title}</h3>
                        {onCancel && <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1"><IconClose /></button>}
                    </div>
                )}
                
                <div className="text-sm font-medium text-gray-500 leading-relaxed whitespace-pre-wrap mb-6 w-full px-2">
                    {content}
                </div>
                
                {!hideFooter && (
                    <div className="w-full flex gap-3 mt-auto">
                        {onCancel && (
                            <button 
                                onClick={onCancel} 
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
                            >
                                {cancelText || 'Batal'}
                            </button>
                        )}
                        <button 
                            onClick={onConfirm} 
                            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-pink-200 active:scale-95 transition-all"
                        >
                            {confirmText || 'OK'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
