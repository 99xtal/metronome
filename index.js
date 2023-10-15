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
let beat = 1;
let timeSignature = 4;

function click() {
    if (beat === 1) {
        clickHiAudio.play();
    } else {
        clickLoAudio.play();
    }

    if (beat < timeSignature) {
        beat += 1;
    } else {
        beat = 1;
    }
}

playPauseBtn.addEventListener('click', () => {
    if (!stopped) {
        clearInterval(metronomeTimerId);
    } else {
        click();
        metronomeTimerId = setInterval(() => {
            click();
        }, MINUTE_IN_MS / bpm.value);
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
    click();
    metronomeTimerId = setInterval(() => {
        click();
    }, MINUTE_IN_MS / bpm.value);
})