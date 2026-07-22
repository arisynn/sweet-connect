// ===================== PWA INSTALL OVERLAY =====================
const InstallPrompt = ({ deferredPrompt, onSkip }) => {
    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
        }
    };
    return (
        <div className="absolute inset-0 pwa-bg z-[1000] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center modal-enter">
                <div className="mb-6 drop-shadow-md"><IconLogo /></div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Tunggu Dulu!</h2>
                <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed">
                    Game ini dirancang untuk layar HP. Kamu bisa menginstallnya (Add to Home Screen) atau melanjutkannya di browser.
                </p>
                {deferredPrompt && (
                    <button onClick={handleInstall} className="btn-modern bg-pink-500 text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg mb-4">
                        Install Sekarang
                    </button>
                )}
                <button onClick={onSkip} className="btn-modern bg-gray-200 text-gray-700 w-full py-3 rounded-xl font-bold text-md shadow-sm mb-4">
                    Lanjutkan di Browser
                </button>
                {!deferredPrompt && (
                    <div className="w-full flex flex-col gap-3">
                        <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
                            <p className="font-bold text-gray-700 mb-1.5 text-sm flex items-center">Apple / iOS</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Tekan ikon <IconShareApple/> di bawah, lalu pilih <strong>"Add to Home Screen"</strong>.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
                            <p className="font-bold text-gray-700 mb-1.5 text-sm flex items-center">Android / Chrome</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Pilih <strong>"Install app" / "Tambahkan ke Layar Utama"</strong> dari menu browser kamu.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
