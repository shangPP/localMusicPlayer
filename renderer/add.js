const { ipcRenderer } = require("electron");
const { $ } = require("./helper");
const path = require("path");
// import { ipcRenderer } from 'electron'
// import { $ } from './helper'
// import path from 'path'


let musicFilesPath = [];
$("select-music").addEventListener("click", () => {
  ipcRenderer.send("open-music-file");
})
$("add-music").addEventListener("click", () => {
  ipcRenderer.send("add-tracks", musicFilesPath);
})

const renderListHTML = (paths) => {
  const musicList = $("musicList");
  const musicItemsHTML = paths.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`;
    return html;
  }, "")
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
}


ipcRenderer.on("selected-file", (e, path) => {
  if (Array.isArray(path)) {
    renderListHTML(path);
    musicFilesPath = path;
  }
})