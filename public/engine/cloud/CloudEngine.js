window.CloudEngine = {
    fetchCloud: async (playerName) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(`/api/profile?name=${encodeURIComponent(playerName)}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data && data.result) {
                return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
            }
            return null;
        } catch (e) {
            window.EngineUtils.log('Cloud', 'Failed to fetch from cloud', e.message);
            throw e;
        }
    },
    pushCloud: async (playerName, payload) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(`/api/profile?name=${encodeURIComponent(playerName)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!res.ok) {
                const errData = await res.json().catch(()=>({}));
                if (res.status === 409 && errData.cloudData) {
                    throw { isConflict: true, cloudData: errData.cloudData };
                }
                throw new Error(errData.error || `HTTP ${res.status}`);
            }
            return true;
        } catch (e) {
            if (e.isConflict) throw e;
            window.EngineUtils.log('Cloud', 'Failed to push to cloud', e.message);
            throw e;
        }
    }
};
