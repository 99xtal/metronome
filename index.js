'use strict';

const MINUTE_IN_MS = 60000;

const clickHiAudio = new Audio('assets/metronome_click_hi.mp3');
const clickLoAudio = new Audio('assets/metronome_click_lo.mp3');

const playPauseBtn = document.getElementById('play');
const bpmLabel = document.getElementById('bpm-label')
const bpm = document.getElementById('bpm');
let stopped = true;
let metronomeTimerId = null;
let beatTimers = [];
let timeSignature = 4;

function playMeasure() {
    clickHiAudio.play();
    const timers = [];
    for (let i = 1; i < timeSignature; i += 1) {
        timers.push(setTimeout(() => clickLoAudio.play(), MINUTE_IN_MS * i / bpm.value));
    }
    return timers;
}

playPauseBtn.addEventListener('click', () => {
    if (!stopped) {
        clearInterval(metronomeTimerId);
        beatTimers.forEach(clearInterval);
    } else {
        beatTimers = playMeasure();
        metronomeTimerId = setInterval(() => {
            beatTimers.forEach(clearInterval);
            clickHiAudio.play();
            beatTimers = playMeasure();
        }, MINUTE_IN_MS * timeSignature / bpm.value);
    }
    stopped = !stopped;
    playPauseBtn.innerText = stopped ? 'Play' : 'Pause'
})

bpm.addEventListener('input', (e) => {
    bpmLabel.innerText = `BPM: ${e.target.value}`
})

bpm.addEventListener('change', (e) => {
    if (stopped) return;

    if (metronomeTimerId) {
        beatTimers.forEach(clearInterval);
        clearInterval(metronomeTimerId);
    }
    beatTimers = playMeasure();
    metronomeTimerId = setInterval(() => {
        beatTimers.forEach(clearInterval);
        clickHiAudio.play();
        beatTimers = playMeasure();
    }, MINUTE_IN_MS * timeSignature / bpm.value);
})