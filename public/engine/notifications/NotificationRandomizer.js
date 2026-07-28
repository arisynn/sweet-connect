window.NotificationRandomizer = {
    lastMessage: {},
    getRandomMessage: (messages, category) => {
        if (!messages || messages.length === 0) return "Semoga harimu menyenangkan.";
        let msg = messages[Math.floor(Math.random() * messages.length)];
        
        // Prevent immediate duplicate
        if (messages.length > 1 && window.NotificationRandomizer.lastMessage[category] === msg) {
            let newMsg = msg;
            while(newMsg === window.NotificationRandomizer.lastMessage[category]) {
                newMsg = messages[Math.floor(Math.random() * messages.length)];
            }
            msg = newMsg;
        }
        
        window.NotificationRandomizer.lastMessage[category] = msg;
        return msg;
    }
};
