// ===================== TIMER / SPEED =====================
// The timer no longer speeds up with level — players should never lose purely because the
// clock got shorter. Difficulty instead ramps through board variety (see js/difficulty.js).
const getTimerSpeed = (level) => 0.12;
const getSecondsLeft = (progress, level) => Math.ceil((progress / getTimerSpeed(level)) * 0.2);
