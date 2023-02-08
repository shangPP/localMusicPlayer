const { ipcRenderer } = require("electron")
const { $, convertDuration } = require("./helper")
// import { ipcRenderer } from "electron";
// import { $, convertDuration } from './helper'

let musicAudio = new Audio()
let allTracks
let currentTrack

$("add-music-button").addEventListener("click", () => {
  ipcRenderer.send("add-music-window");
})
// 渲染音乐列表
const renderListHTML = (tracks) => {
  const tracksList = $("tracksList");
  const tracksListHTML = tracks.reduce((html, track) => {
    html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
      <div class="col-10">
        <i class="fas fa-music mr-3 text-secondary"></i>
        <b>${track.fileName}</b>
      </div>
      <div class="col-2">
        <i class="fas fa-play" title="播放" data-id="${track.id}"></i>
        <i class="fas fa-trash" title="删除" data-id="${track.id}"></i>
      </div>
    </li>`;
    return html;
  }, "")
  const emptyTrackHTML = `<div clsss="alert alert-primary">还没有添加任何音乐</div>`;
  tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML;
}
// 渲染播放音乐信息
const renderPlayerHTML = (name, duration) => {
  const player = $('player-status')
  const html = `<div class="col font-weight-bold">
                  正在播放：${name}
                </div>
                <div class="col">
                  <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
                </div>`;
  player.innerHTML = html;
}
// 更新进度条
const updateProgressHTML = (currentTime, duration) => {
  // 计算进度条
  const progress = Math.floor(currentTime / duration * 100);
  const bar = $("player-progress");
  bar.innerHTML = progress + "%";
  bar.style.width = progress + "%";
  const seeker = $("current-seeker");
  seeker.innerHTML = convertDuration(currentTime);
}

// 继续播放下一首音乐
const updatePlayNextMusic = () => {
  // 继续下一首
  if (musicAudio.currentTime === musicAudio.duration) {
    let index = allTracks.findIndex(item => item.path === currentTrack.path)
    if (index === allTracks.length - 1) {
      currentTrack = allTracks[0]
      index = 0
    } else {
      currentTrack = allTracks[index + 1]
    }

    musicAudio.src = currentTrack.path;
    const resetIconEle = document.querySelector(".fa-pause");
    if (resetIconEle) {
      const playIconEle = document.querySelectorAll(".fa-play");
      playIconEle[index].classList.replace("fa-play", "fa-pause")

      resetIconEle.classList.replace("fa-pause", "fa-play");

    }
    musicAudio.play();

    updateProgressHTML(musicAudio.currentTime, musicAudio.duration);
  }
}

// 获取所有音乐并渲染到列表中
ipcRenderer.on("getTracks", (e, tracks) => {
  allTracks = tracks;
  renderListHTML(tracks);
})
// 当指定的音频/视频的元数据已加载时，会发生 loadedmetadata 事件。
musicAudio.addEventListener("loadedmetadata", () => {
  // 渲染播放器状态
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration);
})

// 当音频/视频的播放位置发生变化时，会发生timeupdate事件。
musicAudio.addEventListener("timeupdate", () => {
  // 更新播放器状态
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration);

  updatePlayNextMusic()
})

// 事件委托 监听音乐按钮点击
$("tracksList").addEventListener("click", (event) => {
  event.preventDefault();
  const { dataset, classList } = event.target;
  const id = dataset && dataset.id;

  if (id && classList.contains("fa-play")) {
    // 播放音乐
    if (currentTrack && currentTrack.id == id) {
      // event.target.setAttribute("title", "播放")
      // 继续播放原来的音乐，暂停-》播放
      musicAudio.play();
    } else {
      // event.target.setAttribute("title", "暂停")
      // 播放新的音乐，注意还原之前的图标
      currentTrack = allTracks.find(track => track.id === id);
      musicAudio.src = currentTrack.path;
      musicAudio.play();
      const resetIconEle = document.querySelector(".fa-pause");
      if (resetIconEle) {
        resetIconEle.classList.replace("fa-pause", "fa-play");
      }
    }
    classList.replace("fa-play", "fa-pause");
  } else if (id && classList.contains("fa-pause")) {
    // 暂停音乐，播放-暂停
    // event.target.setAttribute("title", "暂停")
    musicAudio.pause();
    classList.replace("fa-pause", "fa-play");
    // title = "暂停"
  } else if (id && classList.contains("fa-trash")) {
    // 删除音乐
    musicAudio.pause();
    ipcRenderer.send("delete-track", id);
  }


})
// 点击跳转音乐进度
$("player-progress-container").addEventListener("click", (event) => {
  // 获取进度条宽度
  let offsetObj = {
    left: $("player-progress-container").offsetWidth,
    top: $("player-progress-container").offsetHeight
  }
  // 获取当前鼠标点击的位置
  let long = getMousePosition().left / offsetObj.left;
  // 获得当前点击长度的时间
  musicAudio.currentTime = long * musicAudio.duration;
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration)
})

// 鼠标点击位置
function getMousePosition(e) {
  var e = e || window.event;
  var x = e.pageX;
  var y = e.pageY;
  return { 'left': x, 'top': y }
}