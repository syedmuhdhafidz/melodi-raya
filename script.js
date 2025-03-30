document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleButton = document.querySelector('.toggle-button');
    const songItems = document.querySelectorAll('.song-item');
    const audioPlayer = document.getElementById('audio-player');

    const currentSongTitleDisplay = document.querySelector('.current-song-title');
    const currentSongArtistDisplay = document.querySelector('.current-song-artist');
    const progressBarTop = document.querySelector('.progress-bar-top::after');
    const progressBarContainer = document.querySelector('.progress-bar-top');
    const currentTimeDisplay = document.querySelector('.current-time');
    const durationDisplay = document.querySelector('.duration');
    const playPauseButton = document.querySelector('.play-pause-button');
    const nextButton = document.querySelector('.next-button');
    const prevButton = document.querySelector('.prev-button');
    const repeatButton = document.querySelector('.repeat-button');
    const shuffleButton = document.querySelector('.shuffle-button');

    let currentPlayingIndex = -1;
    let isRepeating = false;
    let isShuffling = false;
    let songOrder = Array.from(songItems.keys());

    function toggleSidebar() {
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('sidebar-hidden');
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', toggleSidebar);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    function playSong(index) {
        if (index >= 0 && index < songItems.length) {
            const songItem = songItems[index];
            const playButton = songItem.querySelector('.play-button');
            const songSrc = playButton.dataset.src;
            const songArtist = playButton.dataset.artist;
            const songTitle = songItem.querySelector('.song-title').textContent;

            audioPlayer.src = songSrc;
            audioPlayer.play();
            playPauseButton.textContent = '⏸️';
            currentSongTitleDisplay.textContent = songTitle;
            currentSongArtistDisplay.textContent = songArtist || '';

            songItems.forEach((item, i) => {
                if (i !== index) {
                    item.querySelector('.play-button').textContent = '▶️';
                }
            });
            playButton.textContent = '⏸️';
            currentPlayingIndex = index;
        }
    }

    function playNextSong() {
        let nextIndex = isShuffling
            ? Math.floor(Math.random() * songItems.length)
            : currentPlayingIndex + 1;

        if (nextIndex >= songItems.length) {
            nextIndex = isRepeating ? 0 : 0;
        }

        playSong(nextIndex);
    }

    function playPreviousSong() {
        let prevIndex = currentPlayingIndex - 1;
        if (prevIndex < 0) {
            prevIndex = isRepeating ? songItems.length - 1 : songItems.length - 1;
        }
        playSong(prevIndex);
    }

    songItems.forEach((item, index) => {
        const playButton = item.querySelector('.play-button');
        const songSrc = playButton.dataset.src;
        const songArtist = playButton.dataset.artist;
        const songTitle = item.querySelector('.song-title').textContent;

        playButton.addEventListener('click', () => {
            if (currentPlayingIndex === index && !audioPlayer.paused) {
                audioPlayer.pause();
                playPauseButton.textContent = '▶️';
            } else {
                playSong(index);
            }
        });
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (currentPlayingIndex !== -1) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            const progressBarFill = document.querySelector('.progress-bar-fill'); // Target the new div
            if (progressBarFill) {
                progressBarFill.style.width = `${progress}%`;
            }
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
            durationDisplay.textContent = formatTime(audioPlayer.duration || 0);
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        if (currentPlayingIndex !== -1) {
            durationDisplay.textContent = formatTime(audioPlayer.duration || 0);
        }
    });

    playPauseButton.addEventListener('click', () => {
        if (currentPlayingIndex !== -1) {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playPauseButton.textContent = '⏸️';
            } else {
                audioPlayer.pause();
                playPauseButton.textContent = '▶️';
            }
        }
    });

    nextButton.addEventListener('click', playNextSong);
    prevButton.addEventListener('click', playPreviousSong);

    repeatButton.addEventListener('click', () => {
        isRepeating = !isRepeating;
        repeatButton.classList.toggle('active', isRepeating);
    });

    shuffleButton.addEventListener('click', () => {
        isShuffling = !isShuffling;
        shuffleButton.classList.toggle('active', isShuffling);
        if (isShuffling) {
            let currentIndex = songOrder.indexOf(currentPlayingIndex);
            let temp = songOrder.splice(currentIndex, 1);
            for (let i = songOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [songOrder[i], songOrder[j]] = [songOrder[j], songOrder[i]];
            }
            songOrder.splice(Math.floor(Math.random() * songOrder.length), 0, temp[0]);
        } else {
            songOrder = Array.from(songItems.keys());
        }
        shuffleButton.classList.toggle('active', isShuffling);
    });

    audioPlayer.addEventListener('ended', () => {
        if (isRepeating) {
            // If repeat is active, play the current song again
            playSong(currentPlayingIndex);
        } else {
            // Otherwise, play the next song in the playlist
            playNextSong();
        }
    });

    progressBarContainer.addEventListener('click', (e) => {
        if (audioPlayer.duration) {
            const clickPosition = e.offsetX;
            const barWidth = progressBarContainer.offsetWidth;
            const seekTime = (clickPosition / barWidth) * audioPlayer.duration;
            audioPlayer.currentTime = seekTime;
        }
    });
});