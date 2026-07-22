// ===================== GLOBAL DIALOG SYSTEM =====================

let dialogShowFn = null;

window.Dialog = {
    showSuccess: (title, desc, buttonText = 'OK') => {
        if(dialogShowFn) dialogShowFn({ type: 'success', title, desc, confirmText: buttonText });
    },
    showError: (title, desc, buttonText = 'OK') => {
        if(dialogShowFn) dialogShowFn({ type: 'error', title, desc, confirmText: buttonText });
    },
    showWarning: (title, desc, buttonText = 'OK') => {
        if(dialogShowFn) dialogShowFn({ type: 'warning', title, desc, confirmText: buttonText });
    },
    showInfo: (title, desc, buttonText = 'OK') => {
        if(dialogShowFn) dialogShowFn({ type: 'info', title, desc, confirmText: buttonText });
    },
    showConfirm: (title, desc, confirmText = 'Ya', cancelText = 'Batal', onConfirm, onCancel) => {
        if(dialogShowFn) dialogShowFn({ type: 'confirm', title, desc, confirmText, cancelText, onConfirm, onCancel });
    },
    showLoading: (title = 'Memuat...', desc = 'Mohon tunggu sebentar...') => {
        if(dialogShowFn) dialogShowFn({ type: 'loading', title, desc });
    },
    close: () => {
        if(dialogShowFn) dialogShowFn(null);
    }
};

const DialogManager = () => {
    const [dialog, setDialog] = React.useState(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        dialogShowFn = (data) => {
            if (data === null) {
                setIsVisible(false);
                setTimeout(() => setDialog(null), 200); // 200ms for exit animation
            } else {
                setDialog(data);
                setIsVisible(false);
                setTimeout(() => setIsVisible(true), 10);
            }
        };
        return () => { dialogShowFn = null; };
    }, []);

    if (!dialog && !isVisible) return null;

    const handleConfirm = () => {
        if (dialog.onConfirm) dialog.onConfirm();
        window.Dialog.close();
    };

    const handleCancel = () => {
        if (dialog.onCancel) dialog.onCancel();
        window.Dialog.close();
    };

    const getIcon = () => {
        switch (dialog.type) {
            case 'success': return <div className="text-emerald-500 bg-emerald-50 p-3 rounded-2xl mb-4 inline-flex"><IconCheckCircle className="w-10 h-10" /></div>;
            case 'error': return <div className="text-rose-500 bg-rose-50 p-3 rounded-2xl mb-4 inline-flex"><IconXCircle className="w-10 h-10" /></div>;
            case 'warning': return <div className="text-amber-500 bg-amber-50 p-3 rounded-2xl mb-4 inline-flex"><IconAlertTriangle className="w-10 h-10" /></div>;
            case 'info': return <div className="text-sky-500 bg-sky-50 p-3 rounded-2xl mb-4 inline-flex"><IconInfo className="w-10 h-10" /></div>;
            case 'loading': return <div className="text-pink-500 bg-pink-50 p-3 rounded-2xl mb-4 inline-flex"><IconSpinner className="w-10 h-10 animate-spin" /></div>;
            case 'confirm': return <div className="text-pink-500 bg-pink-50 p-3 rounded-2xl mb-4 inline-flex"><IconAlertTriangle className="w-10 h-10" /></div>;
            default: return null;
        }
    };

    const isConfirm = dialog.type === 'confirm';
    const isLoading = dialog.type === 'loading';

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200 ${isVisible ? 'bg-gray-900/60 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none pointer-events-none'}`}>
            <div className={`bg-white rounded-3xl w-full max-w-[340px] shadow-2xl overflow-hidden flex flex-col items-center text-center p-6 transition-all duration-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                
                {getIcon()}
                
                <h3 className="font-bold text-xl text-gray-800 mb-2">{dialog.title}</h3>
                
                <p className="text-sm font-medium text-gray-500 leading-relaxed whitespace-pre-wrap mb-6 w-full px-2">
                    {dialog.desc}
                </p>
                
                {!isLoading && (
                    <div className="w-full flex gap-3 mt-auto">
                        {isConfirm && (
                            <button 
                                onClick={handleCancel} 
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
                            >
                                {dialog.cancelText}
                            </button>
                        )}
                        <button 
                            onClick={handleConfirm} 
                            className={`flex-1 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all active:scale-95 ${
                                dialog.type === 'error' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' :
                                dialog.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' :
                                dialog.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' :
                                'bg-pink-500 hover:bg-pink-600 shadow-pink-200'
                            }`}
                        >
                            {dialog.confirmText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
