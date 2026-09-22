const express = require("express");
const path = require("path");

const app = express();

// Render/Vercel/local hosting can provide PORT.
// 3000 is used only when running locally.
const PORT = process.env.PORT || 3000;

// ================================
// CIRCULAR DOUBLY LINKED LIST
// ================================

class Node {
    constructor(song) {
        this.song = song;
        this.next = null;
        this.prev = null;
    }
}

class CircularDoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }

    addSong(song) {
        const newNode = new Node(song);

        // First node
        if (this.head === null) {
            newNode.next = newNode;
            newNode.prev = newNode;

            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;
            this.size = 1;
            return;
        }

        // Add after tail and before head
        newNode.prev = this.tail;
        newNode.next = this.head;

        this.tail.next = newNode;
        this.head.prev = newNode;

        this.tail = newNode;
        this.size++;
    }

    nextSong() {
        if (this.current === null) {
            return null;
        }

        this.current = this.current.next;
        return this.current.song;
    }

    previousSong() {
        if (this.current === null) {
            return null;
        }

        this.current = this.current.prev;
        return this.current.song;
    }

    getCurrentSong() {
        return this.current ? this.current.song : null;
    }

    getAllSongs() {
        const songs = [];

        if (this.head === null) {
            return songs;
        }

        let temp = this.head;

        do {
            songs.push(temp.song);
            temp = temp.next;
        } while (temp !== this.head);

        return songs;
    }

    moveToSong(id) {
        if (this.head === null) {
            return null;
        }

        let temp = this.head;

        do {
            if (temp.song.id === id) {
                this.current = temp;
                return temp.song;
            }

            temp = temp.next;
        } while (temp !== this.head);

        return null;
    }
}

// ================================
// PLAYLIST
// ================================

const playlist = new CircularDoublyLinkedList();

playlist.addSong({
    id: 1,
    title: "Song One",
    artist: "Artist One",
    file: "/audio/song1.mp3"
});

playlist.addSong({
    id: 2,
    title: "Song Two",
    artist: "Artist Two",
    file: "/audio/song2.mp3"
});

playlist.addSong({
    id: 3,
    title: "Song Three",
    artist: "Artist Three",
    file: "/audio/song3.mp3"
});

// ================================
// STATIC FRONTEND
// ================================

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================================
// API
// ================================

app.get("/api/songs", (req, res) => {
    res.json({
        songs: playlist.getAllSongs(),
        current: playlist.getCurrentSong()
    });
});

app.get("/api/current", (req, res) => {
    res.json(playlist.getCurrentSong());
});

app.post("/api/next", (req, res) => {
    const song = playlist.nextSong();

    if (!song) {
        return res.status(404).json({
            error: "Playlist is empty"
        });
    }

    res.json(song);
});

app.post("/api/previous", (req, res) => {
    const song = playlist.previousSong();

    if (!song) {
        return res.status(404).json({
            error: "Playlist is empty"
        });
    }

    res.json(song);
});

app.post("/api/select/:id", (req, res) => {
    const id = Number(req.params.id);
    const song = playlist.moveToSong(id);

    if (!song) {
        return res.status(404).json({
            error: "Song not found"
        });
    }

    res.json(song);
});

// ================================
// START SERVER
// ================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Circular Music Player running on port ${PORT}`);
});