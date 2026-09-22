const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const currentTimeText = document.getElementById("currentTime");
const durationText = document.getElementById("duration");

const playlistElement = document.getElementById("playlist");
const message = document.getElementById("message");

let songs = [];
let currentSong = null;

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function showMessage(text) {
    message.textContent = text;

    setTimeout(() => {
        message.textContent = "";
    }, 3000);
}

function loadSong(song) {
    if (!song) {
        showMessage("No song found.");
        return;
    }

    currentSong = song;

    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;

    audio.src = song.file;
    audio.load();

    progress.value = 0;
    currentTimeText.textContent = "0:00";
    durationText.textContent = "0:00";

    renderPlaylist();
}

async function loadPlaylist() {
    try {
        const response = await fetch("/api/songs");

        if (!response.ok) {
            throw new Error("Could not load playlist");
        }

        const data = await response.json();

        songs = data.songs;
        loadSong(data.current);
    } catch (error) {
        console.error(error);
        showMessage("Could not connect to the backend.");
    }
}

playBtn.addEventListener("click", async () => {
    if (!audio.src) {
        showMessage("No audio file selected.");
        return;
    }

    try {
        if (audio.paused) {
            await audio.play();
            playBtn.textContent = "❚❚";
        } else {
            audio.pause();
            playBtn.textContent = "▶";
        }
    } catch (error) {
        console.error(error);
        showMessage("Audio could not be played. Check your MP3 file.");
    }
});

nextBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/next", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Next song failed");
        }

        const song = await response.json();

        loadSong(song);

        await audio.play();
        playBtn.textContent = "❚❚";
    } catch (error) {
        console.error(error);
        showMessage("Could not move to the next song.");
    }
});

prevBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/previous", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Previous song failed");
        }

        const song = await response.json();

        loadSong(song);

        await audio.play();
        playBtn.textContent = "❚❚";
    } catch (error) {
        console.error(error);
        showMessage("Could not move to the previous song.");
    }
});

async function selectSong(id) {
    try {
        const response = await fetch(`/api/select/${id}`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Song selection failed");
        }

        const song = await response.json();

        loadSong(song);

        await audio.play();
        playBtn.textContent = "❚❚";
    } catch (error) {
        console.error(error);
        showMessage("Could not select the song.");
    }
}

function renderPlaylist() {
    playlistElement.innerHTML = "";

    songs.forEach((song, index) => {
        const item = document.createElement("div");

        item.className = "song-item";

        if (currentSong && song.id === currentSong.id) {
            item.classList.add("current");
        }

        item.innerHTML = `
            <div class="song-number">${index + 1}</div>

            <div>
                <div class="song-name">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>

            <button class="select-btn" data-id="${song.id}">
                Select
            </button>
        `;

        const selectButton = item.querySelector(".select-btn");

        selectButton.addEventListener("click", () => {
            selectSong(song.id);
        });

        playlistElement.appendChild(item);
    });
}

audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    }

    currentTimeText.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatTime(audio.duration);
});

audio.addEventListener("play", () => {
    playBtn.textContent = "❚❚";
});

audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
});

audio.addEventListener("error", () => {
    console.error("Audio error:", audio.error);
    showMessage("Audio file not found. Add your MP3 files to public/audio/.");
    playBtn.textContent = "▶";
});

progress.addEventListener("input", () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});

audio.volume = 0.8;

// When a song ends, use the linked-list NEXT operation.
// Song 3 -> Song 1 because the list is circular.
audio.addEventListener("ended", async () => {
    try {
        const response = await fetch("/api/next", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Automatic next failed");
        }

        const song = await response.json();

        loadSong(song);

        await audio.play();
        playBtn.textContent = "❚❚";
    } catch (error) {
        console.error(error);
    }
});

loadPlaylist();