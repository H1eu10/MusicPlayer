
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'H1eu10'

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
const option = $('.option');
const startTime = $('.current-time');
const endTime = $('.end-time');
const download = $('.download')
const volume = $('#volumeSlider');
var volumeIcon = document.querySelector(".volume-control i");


function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  const formattedTime = `${minutes}:${remainderSeconds.toString().padStart(2, '0')}`;
  return formattedTime;
}

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Anh da on hon",
      singer: "MCK",
      path: "./assets/music/AnhDaOnHon.mp3",
      image: "./assets/img/anhdaonhon.png"
    },
    {
      name: "XTC",
      singer: "MCK",
      path: "./assets/music/XTC.mp3",
      image: "./assets/img/xtc.jpg"
    },
    {
      name: "Xuat Phat Diem",
      singer: "Obito",
      path: "./assets/music/XuatPhatDiem.mp3",
      image: "./assets/img/xuatphatdiem.jpg"
    },
    {
      name: "Xanh",
      singer: "Ngot",
      path: "./assets/music/Xanh.mp3",
      image: "./assets/img/xanh.jpg"
    },
    {
      name: "Buon hay vui",
      singer: "MCK",
      path: "./assets/music/BuonHayVui.mp3",
      image: "./assets/img/buonhayvui.png"
    },
    {
      name: "Danh Doi",
      singer: "Obito",
      path: "./assets/music/DanhDoi.mp3",
      image: "./assets/img/danhdoi.png"
    },
    {
      name: "Tho er",
      singer: "MCK",
      path: "./assets/music/ThoEr.mp3",
      image: "./assets/img/thoer.png"
    },
    {
      name: "Da lat",
      singer: "MCK",
      path: "./assets/music/Dalat.mp3",
      image: "./assets/img/dalat.jfif"
    },
    {
      name: "Tua Dem Nay",
      singer: "MCK",
      path: "./assets/music/TuaDemNay.mp3",
      image: "./assets/img/tuademnay.jpg"
    }
  ],
  setConfig: function (key, value) {
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
            <div class="thumb"
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fa fa-download" aria-hidden="true"></i>
            </div>
        </div>`
    })
    playlist.innerHTML = htmls.join('')
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex]
      }
    })
  },

  handleEvents: function () {
    const _this = this
    const cdWidth = cd.offsetWidth

    // Xử lý Cd quay/ dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)' }
    ], {
      duration: 10000,
      iterations: Infinity
    })
    cdThumbAnimate.pause()
    // Xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY
      const newCdWidth = cdWidth - scrollTop
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
      // Xử lý độ mờ CD
      cd.style.opacity = newCdWidth / cdWidth
    }

    // Xử lý khi click play
    playBtn.onclick = function () {
      // _this = this
      if (app.isPlaying) {
        audio.pause()
      }
      else {
        audio.play()
      }
    }

    // Khi song được play 
    audio.onplay = function () {
      app.isPlaying = true
      player.classList.add('playing')
      cdThumbAnimate.play()
    }
    // Khi song dừng
    audio.onpause = function () {
      app.isPlaying = false
      player.classList.remove('playing')
      cdThumbAnimate.pause()
    }

    // Khi tiến độ song thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
        startTime.textContent = formatTime(Math.floor(audio.currentTime));
        endTime.textContent = formatTime(Math.floor(audio.duration));
      }
    }

    // Xử lý khi tua song
    progress.onchange = function () {
      const seekTime = progress.value / 100 * audio.duration
      audio.currentTime = seekTime
    }

    // Xử lý next/prev song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong()
      }
      else {
        _this.nextSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong()
      }
      else {
        _this.prevSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    // Xử lý random bật tắt
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    // xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      }
      else {
        nextBtn.click()
      }
    }

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)')
      const optionIcon = e.target.closest('.option');

      // Xử lý khi click vào song
      if (songNode || optionIcon) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          audio.play()
          _this.render()
        }
        if (optionIcon) {
          const songIndex = optionIcon.parentElement.dataset.index;
          const song = _this.songs[songIndex];
          const link = document.createElement('a');
          link.href = song.path;
          link.download = `${song.name}.mp3`;
          link.click();
        }
      }
    }

    // Xử lý repeat bật tắt 
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }
    // Điều chỉnh volume
    volume.oninput = function () {
      var currentVolume = volume.value / 100;

      // Điều chỉnh âm lượng của audio
      audio.volume = currentVolume;

      // Kiểm tra nếu âm lượng, thay đổi biểu tượng volume
      if (currentVolume === 0) {
        volumeIcon.classList.remove("fa-volume-down");
        volumeIcon.classList.remove("fa-volume-up");
        volumeIcon.classList.add("fa-volume-off");

        volumeIcon.classList.add("fa-volume-off");
      } else if (currentVolume > 0 && currentVolume <= 0.5) {
        volumeIcon.classList.remove("fa-volume-off");
        volumeIcon.classList.remove("fa-volume-up");
        volumeIcon.classList.add("fa-volume-down");
      } else {
        volumeIcon.classList.remove("fa-volume-down");
        volumeIcon.classList.remove("fa-volume-off");

        volumeIcon.classList.add("fa-volume-up");
      }
    }
  },
  scrollToActiveSong: function () {
    if (this.currentIndex === 0 || this.currentIndex === 1) {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
    else {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 300)
    }
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat

  },

  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },
  prevSong: function () {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },
  playRandomSong: function () {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)

    this.currentIndex = newIndex
    this.loadCurrentSong()
  },
  start: function () {
    // Gán cấu hình
    this.loadConfig()
    // Định nghĩa các thuộc tính cho Object
    this.defineProperties()

    // Lắng nghe và xử lý các sự kiện
    this.handleEvents()

    // Tải thông tin bài hát 1 vào UI khi chạy app
    this.loadCurrentSong()

    // Render playlist
    this.render()

    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
  }
}

app.start();
