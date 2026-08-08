window.CloudEngine = {
    fetchCloud: async (playerName) => {
        const endpoint = `/api/profile?name=${encodeURIComponent(playerName)}`;
        const method = 'GET';
        let statusCode = 'N/A';
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(endpoint, { signal: controller.signal });
            clearTimeout(timeoutId);
            statusCode = res.status;
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data && data.result) {
                return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
            }
            return null;
        } catch (e) {
            window.EngineUtils.log('Cloud', 'Failed to fetch from cloud', e.message);
            console.log("=== DIAGNOSTIC LOG ===");
            console.log("- Caller: " + (e.stack?.includes("checkRealtimeStatus") ? "CloudSyncPanel.checkRealtimeStatus" : "fetchCloud"));
            console.log("- Endpoint:", endpoint);
            console.log("- Method:", method);
            console.log("- Status Code:", statusCode);
            console.log("- Error:", e.message);
            console.log("- Stack:", e.stack?.split('\\n').slice(0, 3).join('\\n'));
            console.log("- Retry Count: 0");
            console.log("- Interval Retry: N/A");
            throw e;
        }
    },
    pushCloud: async (playerName, payload, retryCount = 0) => {
        const endpoint = `/api/profile?name=${encodeURIComponent(playerName)}`;
        const method = 'POST';
        let statusCode = 'N/A';
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            statusCode = res.status;
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
            console.log("=== DIAGNOSTIC LOG ===");
            console.log("- Caller: pushCloud");
            console.log("- Endpoint:", endpoint);
            console.log("- Method:", method);
            console.log("- Status Code:", statusCode);
            console.log("- Error:", e.message);
            console.log("- Stack:", e.stack?.split('\\n').slice(0, 5).join('\\n'));
            
            // QueueEngine handles the actual retry backoff logic, but we can pass up the diagnostics
            // We'll see it logged repeatedly
            
            throw e;
        }
    }
};
