---
title: VSCode的简单个人配置
date: 2025-10-10 19:46:40
description: 总结VSCode的个人常用配置和基本插件
series: VSCode
tags: [计算机, vscode, 配置, 插件, 扩展]
categories: [计算机, vscode]
cover: /assets/covers/vscode.png
---

## 插件

- **Chinese (Simplified) (简体中文) Language Pack for Visual Studio Code**：简体中文汉化包
- **Dracula Theme Official**：主题
- **Palenight Theme** 主题
- **Material Icon Theme**：图标主题
- **Path Intellisense**：路径自动补全
- **Image preview**：预览插入的图片（如在 markdown 或 html 中引入的图片）
- **Hex Editor**：以十六进制形式打开文件
- **CodeSnap**：在右键菜单中添加`CodeSnap`选项，点击后选中代码即可实现代码截图
- **Prettier - Code formatter**：保存时自动格式化代码
- **Doxygen Documentation Generator**：自动生成函数注释文档
- **Remote - SSH**：连接远程服务器或虚拟机

## 设置项

- 打开设置的几种方式
  - 在`文件-首选项-设置`可以打开设置
  - 点击左下角齿轮图标，然后点设置
  - 快捷键：`Ctrl+,`打开设置
  - `Ctrl+Shift+P`，然后搜索`Open User Settings`

打开设置页面后，点击右上角的`打开设置(json)`来打开`settings.json`，在这里配置和在图形化界面配置是等效的

### 字体

先到 [JetBrains 官网](https://www.jetbrains.com/zh-cn/lp/mono/) 下载`JetBrains Mono`字体，并安装

```json
{
  "editor.fontSize": 20,
  "editor.fontFamily": "'JetBrains Mono', 'Fangsong'"
}
```

[Maple Mono](https://github.com/subframe7536/Maple-font) 也很不错

```json
{
  "editor.fontFamily": "'Maple Mono Normal', 'Fangsong'",
  "editor.fontLigatures": "'calt', 'ss01', 'ss02', 'ss03', 'ss04', 'cv01', 'cv02', 'cv03', 'cv04', 'cv07', 'cv10'"
}
```

### 文件

```json
{
  "files.autoGuessEncoding": true,
  "files.autoSave": "afterDelay",
  "files.autoSaveWhenNoErrors": true,
  "files.autoSaveWorkspaceFilesOnly": true
}
```

### 光标

```json
{
  "editor.cursorBlinking": "smooth",
  "editor.cursorSmoothCaretAnimation": "on"
}
```

### 编辑器

```json
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnSaveMode": "file",
  "editor.mouseWheelZoom": true,
  "editor.acceptSuggestionOnEnter": "smart",
  "editor.suggestSelection": "recentlyUsed",
  "editor.wordWrap": "on"
}
```

### 外观

```json
{
  "workbench.colorTheme": "Palenight Theme", // 主题
  "workbench.iconTheme": "material-icon-theme", // 文件主题
  "workbench.list.smoothScrolling": true
}
```

### 终端

```json
{
  "terminal.integrated.smoothScrolling": true,
  "terminal.integrated.copyOnSelection": true,
  "terminal.integrated.cursorBlinking": true,
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.defaultProfile.windows": "Command Prompt",
  "terminal.integrated.fontFamily": "Maple Mono Normal"
}
```

### 其他

```json
{
  "debug.showBreakpointsInOverviewRuler": true, // 显示断点
  "explorer.compactFolders": false, // 文件夹不折叠
  "scm.compactFolders": false // 源代码文件夹不折叠
}
```
