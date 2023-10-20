const lookahead = 25.0; // How frequently to call scheduling function (ms)
const notesInQueue = [];
const scheduleAheadTime = 0.1   // How far ahead to schedule audio (sec)

let audioContext: AudioContext | undefined;
let beatsPerMeasure = 4;
let bpmLabel: HTMLElement | null;
let bpmSlider: HTMLElement | null;
let clickLoSample: AudioBuffer;
let clickHiSample: AudioBuffer;
let currentNote = 0;
let isPlaying = false;
let nextNoteTime = 0.0;
let optionsForm: HTMLElement | null;
let playButton: HTMLElement | null;
let tempo = 100;
let timerId: number | undefined;

async function loadSamples(audioContext: AudioContext) {
    clickHiSample = await getFile(audioContext, 'assets/metronome_click_hi.mp3');
    clickLoSample = await getFile(audioContext, 'assets/metronome_click_lo.mp3');
}

async function getFile(audioContext: AudioContext, filepath: string) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

async function playSample(audioContext: AudioContext, audioBuffer: AudioBuffer, time: number) {
    const source = new AudioBufferSourceNode(audioContext, {
        buffer: audioBuffer,
    });
    source.connect(audioContext.destination);
    source.start(time);
    return source;
}

function nextNote() {
    const secondsPerBeat = 60.0 / tempo;

    nextNoteTime += secondsPerBeat;

    currentNote = (currentNote + 1) % beatsPerMeasure;
}

function scheduleNote(time: number) {
    if (!audioContext) return;

    if (currentNote === 0) {
        playSample(audioContext, clickHiSample, time);
    } else {
        playSample(audioContext, clickLoSample, time);
    }
}

function scheduler() {
    if (!audioContext) return;

    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
        scheduleNote(nextNoteTime);
        nextNote();
    }
    timerId = setTimeout(scheduler, lookahead);
}

function play() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    isPlaying = !isPlaying;

    if (isPlaying) {
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        nextNoteTime = audioContext.currentTime;
        scheduler(); // kick off scheduling
        return "Pause"
    } else {
        clearTimeout(timerId);
        return "Play"
    }
};

function init() {
    playButton = document.getElementById('play');
    bpmLabel = document.getElementById('bpm-label')
    bpmSlider = document.getElementById('bpm');
    optionsForm = document.getElementById('options');
    audioContext = new AudioContext();

    loadSamples(audioContext).then(() => {
        playButton?.addEventListener('click', (e: Event) => {
            if (!e.target) return;
            (e.target as HTMLButtonElement).innerText = play();
        })
    
        bpmSlider?.addEventListener('change', (e: Event) => {
            tempo = parseInt((e.target as HTMLInputElement).value);
        })
    
        bpmSlider?.addEventListener('input', (e: Event) => {
            if (!bpmLabel) return;
    
            const target = e.target as HTMLInputElement;
            bpmLabel.innerText = `BPM: ${target.value}`
        })

        optionsForm?.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.name === 'time-signature') {
                beatsPerMeasure = parseInt(target.value);
            }
        })
    });
}

window.addEventListener('load', init)