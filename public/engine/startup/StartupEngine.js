window.StartupEngine = {
    steps: {
        INIT: 1, RESTORE_SESSION: 2, LOAD_PROFILE: 3, LOAD_SAVE: 4, LOAD_ASSETS: 5, READY: 6
    },
    logStep: (step, message) => {
        window.EngineUtils.log('Startup', `[Step ${step}] ${message}`);
    }
};
