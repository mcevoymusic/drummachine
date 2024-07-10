// Initialize AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let isDragging = false;

// Function to generate a drum sound
function playDrumSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'kick':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'snare':
            const snareNoise = audioContext.createBufferSource();
            const bufferSize = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            snareNoise.buffer = buffer;

            const snareGain = audioContext.createGain();
            snareNoise.connect(snareGain);
            snareGain.connect(audioContext.destination);

            snareGain.gain.setValueAtTime(1, audioContext.currentTime);
            snareGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            const snareOscillator = audioContext.createOscillator();
            snareOscillator.type = 'triangle';
            snareOscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            snareOscillator.connect(snareGain);
            snareGain.gain.setValueAtTime(1, audioContext.currentTime);
            snareGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            snareNoise.start(audioContext.currentTime);
            snareNoise.stop(audioContext.currentTime + 0.2);
            snareOscillator.start(audioContext.currentTime);
            snareOscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'hihat':
            const hiHatNoise = audioContext.createBufferSource();
            const hiHatBufferSize = audioContext.sampleRate;
            const hiHatBuffer = audioContext.createBuffer(1, hiHatBufferSize, audioContext.sampleRate);
            const hiHatData = hiHatBuffer.getChannelData(0);
            for (let i = 0; i < hiHatBufferSize; i++) {
                hiHatData[i] = Math.random() * 2 - 1;
            }
            hiHatNoise.buffer = hiHatBuffer;

            const hiHatFilter = audioContext.createBiquadFilter();
            hiHatFilter.type = 'bandpass';
            hiHatFilter.frequency.setValueAtTime(10000, audioContext.currentTime);
            hiHatFilter.Q.setValueAtTime(1, audioContext.currentTime);

            const hiHatGain = audioContext.createGain();
            hiHatNoise.connect(hiHatFilter);
            hiHatFilter.connect(hiHatGain);
            hiHatGain.connect(audioContext.destination);

            hiHatGain.gain.setValueAtTime(0.3, audioContext.currentTime);
            hiHatGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

            hiHatNoise.start(audioContext.currentTime);
            hiHatNoise.stop(audioContext.currentTime + 0.1);
            break;
        case 'rim':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
    }
}

const rows = document.querySelector(".sequencer").children;
const item = document.querySelectorAll(".sample");

function toggleItemSelection(el) {
    el.classList.toggle("item-selected");
}

// Checkbox toggle functionality
item.forEach(function (el) {
    el.addEventListener('mousedown', function (e) {
        toggleItemSelection(el);
        isDragging = true;
        e.preventDefault(); // Prevents text selection during drag
    });

    el.addEventListener('mouseover', function () {
        if (isDragging) {
            toggleItemSelection(el);
        }
    });
});

document.addEventListener('mouseup', function () {
    if (isDragging) {
        isDragging = false;
    }
});

document.addEventListener('mouseleave', function () {
    if (isDragging) {
        isDragging = false;
    }
});

window.addEventListener('mouseleave', function () {
    if (isDragging) {
        isDragging = false;
    }
});

// Clear button functionality
document.getElementById("clear-track").onclick = function () {
    [].forEach.call(item, function (el) {
        el.classList.remove("item-selected");
    });
};

// BPM slider
const bpmSlider = document.getElementById("bpm-slider");
const bpmText = document.getElementById("bpm");
let BPM = bpmSlider.value;

bpmText.innerHTML = bpmSlider.value + " BPM";

bpmSlider.oninput = function () {
    bpmText.innerHTML = this.value + " BPM";
    BPM = parseInt(((60 / bpmSlider.value) * 1000) / 4);
};

let i = -1;
let isPlaying = false;
let loopTimeout;

function rowLoop() {
    if (!isPlaying) return;
    loopTimeout = setTimeout(function () {
        i++;

        if (i === rows.length) {
            i = 0;
            document.querySelector(".d16").childNodes[1].classList.remove("row-highlight");
            document.querySelector(".d16").childNodes[3].classList.remove("row-highlight");
            document.querySelector(".d16").childNodes[5].classList.remove("row-highlight");
            document.querySelector(".d16").childNodes[7].classList.remove("row-highlight");
        }

        document.querySelector(".d" + (i + 1)).childNodes[1].classList.add("row-highlight");
        document.querySelector(".d" + (i + 1)).childNodes[3].classList.add("row-highlight");
        document.querySelector(".d" + (i + 1)).childNodes[5].classList.add("row-highlight");
        document.querySelector(".d" + (i + 1)).childNodes[7].classList.add("row-highlight");

        if (i > 0) {
            document.querySelector(".d" + i).childNodes[1].classList.remove("row-highlight");
            document.querySelector(".d" + i).childNodes[3].classList.remove("row-highlight");
            document.querySelector(".d" + i).childNodes[5].classList.remove("row-highlight");
            document.querySelector(".d" + i).childNodes[7].classList.remove("row-highlight");
        }

        document.querySelectorAll(".d" + (i + 1)).forEach(function (bruh) {
            if (bruh.childNodes[1].classList.contains("row-highlight") && bruh.childNodes[1].classList.contains("item-selected")) {
                playDrumSound('kick');
            }

            if (bruh.childNodes[3].classList.contains("row-highlight") && bruh.childNodes[3].classList.contains("item-selected")) {
                playDrumSound('snare');
            }

            if (bruh.childNodes[5].classList.contains("row-highlight") && bruh.childNodes[5].classList.contains("item-selected")) {
                playDrumSound('hihat');
            }

            if (bruh.childNodes[7].classList.contains("row-highlight") && bruh.childNodes[7].classList.contains("item-selected")) {
                playDrumSound('rim');
            }
        });

        rowLoop();
    }, BPM);
}

function togglePlayStop() {
    const playStopButton = document.getElementById("play-stop-button");
    isPlaying = !isPlaying;
    if (isPlaying) {
        playStopButton.classList.remove("play");
        playStopButton.classList.add("stop");
        rowLoop();
    } else {
        playStopButton.classList.remove("stop");
        playStopButton.classList.add("play");
        clearTimeout(loopTimeout);
        i = -1; // Reset the loop counter
        // Clear highlights
        for (let row of rows) {
            for (let cell of row.childNodes) {
                cell.classList.remove("row-highlight");
            }
        }
    }
}

document.getElementById("play-stop-button").onclick = togglePlayStop;
