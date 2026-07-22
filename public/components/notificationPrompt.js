const NotificationPrompt = ({ onClose, onAccept, playerName }) => {
    const [greeting, setGreeting] = React.useState('');
    const [affirmation, setAffirmation] = React.useState('');

    React.useEffect(() => {
        const hour = new Date().getHours();
        let timeCategory = 'lateNight';
        if (hour >= 5 && hour < 11) timeCategory = 'morning';
        else if (hour >= 11 && hour < 15) timeCategory = 'afternoon';
        else if (hour >= 15 && hour < 18) timeCategory = 'evening';
        else if (hour >= 18 && hour < 22) timeCategory = 'night';

        if (timeCategory === 'morning') setGreeting('Selamat pagi!');
        else if (timeCategory === 'afternoon') setGreeting('Selamat siang!');
        else if (timeCategory === 'evening') setGreeting('Selamat sore!');
        else if (timeCategory === 'night') setGreeting('Selamat malam!');
        else setGreeting('Masih bangun?');

        fetch(`/${timeCategory}.json`)
            .then(res => res.json())
            .then(data => {
                const randomAff = data[Math.floor(Math.random() * data.length)];
                setAffirmation(randomAff);
            })
            .catch(() => {
                setAffirmation('Semoga harimu menyenangkan. ');
            });
    }, []);

    const handleAccept = async () => {
        AudioEngine.uiClick();
        if (window.initPushManager) {
            await window.initPushManager(playerName, true);
        }
        onAccept();
    };

    const handleLater = () => {
        AudioEngine.uiClick();
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 modal-enter">
            <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border-4 border-pink-200 relative overflow-hidden flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-500 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.876.75.75 0 001.479.248A8.219 8.219 0 015.85 3.5zM19.267 2.5a.75.75 0 10-1.118 1 8.22 8.22 0 011.987 4.124.75.75 0 001.48-.248A9.72 9.72 0 0019.266 2.5z" />
                        <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 005.25 9v.75a8.217 8.217 0 01-2.119 5.52.75.75 0 00.298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 107.48 0 24.583 24.583 0 004.83-1.244.75.75 0 00.298-1.205 8.217 8.217 0 01-2.118-5.52V9A6.75 6.75 0 0012 2.25zM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 004.496 0l.002.1a2.25 2.25 0 11-4.5 0z" clipRule="evenodd" />
                    </svg>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                    {greeting}
                </h2>
                
                <p className="text-gray-600 mb-4 font-medium">
                    {affirmation}
                </p>
                
                <p className="text-sm text-gray-500 mb-6 bg-pink-50 p-3 rounded-xl border border-pink-100">
                    Jangan lewatkan notifikasi agar Sweet Connect bisa mengingatkan hadiah harian, peti, dan mengirim pesan penyemangat untukmu.
                </p>

                <div className="flex flex-col w-full gap-3">
                    <button onClick={handleAccept} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95">
                        Aktifkan Notifikasi
                    </button>
                    <button onClick={handleLater} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-6 rounded-xl transition-all active:scale-95">
                        Nanti Saja
                    </button>
                </div>
            </div>
        </div>
    );
};
