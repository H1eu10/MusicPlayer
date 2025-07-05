const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'H1eu10';

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const startTime = $('.current-time');
const endTime = $('.end-time');
const volume = $('#volumeSlider');
const volumeIcon = document.querySelector(".volume-control i");

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  return `${minutes}:${remainderSeconds.toString().padStart(2, '0')}`;
}

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [],

  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render() {
    const htmls = this.songs.map((song, index) => `
      <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
        <div class="thumb" style="background-image: url('${song.image}')"></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
      </div>
    `);
    playlist.innerHTML = htmls.join('');
  },

  defineProperties() {
    Object.defineProperty(this, 'currentSong', {
      get: () => this.songs[this.currentIndex],
    });
  },

  handleEvents() {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    const cdThumbAnimate = cdThumb.animate(
      [{ transform: 'rotate(360deg)' }],
      { duration: 10000, iterations: Infinity }
    );
    cdThumbAnimate.pause();

    document.onscroll = function () {
      const scrollTop = window.scrollY;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    playBtn.onclick = function () {
      _this.isPlaying ? audio.pause() : audio.play();
    };

    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimate.play();
    };

    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimate.pause();
    };

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = progressPercent;
        startTime.textContent = formatTime(Math.floor(audio.currentTime));
        endTime.textContent = formatTime(Math.floor(audio.duration));
      }
    };

    progress.onchange = function () {
      const seekTime = (progress.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    };

    nextBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.nextSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    prevBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.prevSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    };

    audio.onended = function () {
      _this.isRepeat ? audio.play() : nextBtn.click();
    };

    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        audio.play();
        _this.render();
      }
    };

    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    };

    volume.oninput = function () {
      const currentVolume = volume.value / 100;
      audio.volume = currentVolume;
      if (currentVolume === 0) {
        volumeIcon.className = "fa fa-volume-off";
      } else if (currentVolume <= 0.5) {
        volumeIcon.className = "fa fa-volume-down";
      } else {
        volumeIcon.className = "fa fa-volume-up";
      }
    };
  },

  scrollToActiveSong() {
    setTimeout(() => {
      $('.song.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  },

  loadCurrentSong() {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.url || this.currentSong.preview || '';
  },

  loadConfig() {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong() {
    this.currentIndex = (this.currentIndex + 1) % this.songs.length;
    this.loadCurrentSong();
  },

  prevSong() {
    this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.loadCurrentSong();
  },

  playRandomSong() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

    async fetchSongsFromiTunes(term = '') {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15`);
    const data = await res.json();
    this.songs = data.results.map(song => ({
      name: song.trackName,
      singer: song.artistName,
      url: song.previewUrl, // sử dụng preview 30s
      image: song.artworkUrl100.replace('100x100', '300x300')
    }));
    this.start();
  },

  start() {
    this.loadConfig();
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.render();
    randomBtn.classList.toggle('active', this.isRandom);
    repeatBtn.classList.toggle('active', this.isRepeat);
  },
};

app.fetchSongsFromiTunes('wren evans');
