# 本地音乐播放器

该项目为一个本地音乐播放器 demo，目的是熟悉一下开发音乐播放器中间的过程。该项目技术使用原生 JavaScript 开发，使用 `electron` 编译成桌面端软件

## 使用

点击 **添加音乐到曲库** 打开添加音乐窗口，**选择音乐**打开本地文件选择窗口进行文件选择，**导入音乐**把音乐文件渲染到主窗口中

## 启动

```
npm i // 下载依赖
npm start // 项目启动
```

**如果对项目内容进行改动，在保存完改动的文件后，需要到 `main.js` 保存一下才可以重新运行**

## 打包

本项目引入了两个打包工具：`electron-builder` 和 `electron-packager`，

原因是之前第一个打包工具打包时出现错误，于是使用了第二个打包工具，现在第一个打包工具的错误已解决

> 打包命令

```
npm run dist
或
npm run buildApp
```

## bug

点击播放进度条进行跳转时，跳转进度不正确