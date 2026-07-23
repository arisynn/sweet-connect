window.EngineUtils = {
    generateId: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    calculateHash: (obj) => {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },
    log: (module, message, data = null) => {
        const timestamp = new Date().toISOString();
        const logMsg = `[SaveEngine][${module}] ${message}`;
        console.log(logMsg, data ? data : '');
        window.dispatchEvent(new CustomEvent('engineLog', { 
            detail: { timestamp, module, message, data } 
        }));
    }
};
