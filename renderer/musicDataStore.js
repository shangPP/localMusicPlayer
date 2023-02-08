const Store = require("electron-store")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
// import Store from 'electron-store'
// import { v4: uuidv4 } from 'uuid'
// import path from 'path'

class DataStore extends Store {
  constructor(settings) {
    super(settings);
    this.tracks = this.get("tracks") || []; //保存音乐文件信息
  }
  saveTracks() {
    this.set("tracks", this.tracks);
    return this;
  }
  getTracks() {
    return this.get("tracks") || [];
  }
  addTracks(tracks) {
    // 添加并去重（取出没有保存的）
    const tracksWithProps = tracks.map(track => {
      return {
        id: uuidv4(),
        path: track,
        fileName: path.basename(track)
      };
    }).filter(track => {
      const currentTracksPath = this.getTracks().map(track => track.path);
      return !currentTracksPath.includes(track.path);
    })
    this.tracks = [...this.tracks, ...tracksWithProps];
    return this.saveTracks();
  }
  deleteTrack(deletedId) {
    this.tracks = this.tracks.filter(item => item.id !== deletedId);
    return this.saveTracks();
  }
}

module.exports = DataStore;