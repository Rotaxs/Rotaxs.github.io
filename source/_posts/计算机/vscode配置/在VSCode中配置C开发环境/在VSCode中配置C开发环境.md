---
title: 在VS Code中配置C/C++开发环境
date: 2025-10-14 16:40:26
description: 本文介绍如何在Windows 11系统上下载MinGW，并在VS Code中配置C/C++运行环境
series: VSCode
tags: [计算机, vscode, MinGW, C, C++, 配置, 插件, 扩展, windows10]
categories: [计算机, vscode]
cover: /assets/covers/vscode.png
---

## C/C++运行环境的配置

在配置 C/C++环境之前，首先可以先去 [Visual Studio Code 官网](https://code.visualstudio.com/) 下载 VS Code，并参考 {% post_link VSCode的简单个人配置 这篇文章 %} 对其进行配置

> **注意：Visual Studio Code（简称 VS Code） 和 Visual Studio（简称 VS，用来进行 C 语言开发就是 VSC） 是不同的两个东西，他们同为 Microsoft 公司开发，但区别在于：前者是一个编辑器，而后者是一个 IDE**

### C/C++的编译器

目前主流的编译器及其简单介绍如下

- **GCC**(GNU Compiler Collecion)
  - 包含`gcc`，`g++`等编译工具
  - 最流行的开源编译器套件，跨平台
- **Clang/LLVM**
  - 苹果公司开发，一般在 Mac 电脑上使用
- **MSVC**(Microsoft Visual C++)
  - 微软公司开发
  - 是 Visual Studio 的默认编译器
- **ICC**(Intel C++ Compiler)
  - 英特尔公司开发
  - 针对英特尔处理器优化

在本片文章中，我们使用的就是最常用的 GCC 编译器

但是，GCC 早期是在 Linux 系统上工作，其许多功能的实现都是对 Linux 进行适配，而要想在 Windows 系统上使用 GCC，就不得不对 GCC 进行一些“改造”，也就有了我们接下来要介绍的 **MinGW**

### MinGW 的下载

> 现在许多 IDE 中，也是使用 MinGW 作为默认编译器，如：Clion，Dev-C++

MinGW 早期只有 32 位版本，现在我们用的更多的是更为现代，功能更加齐全的 **MinGW-w64**，它提供了 32 位和 64 位程序的编译支持

本着软件去官网下载的原则，要下载 MinGW-w64，我们先去 [官网](https://www.mingw-w64.org/)，然后可以找到 Downloads，并选择 Pre-built Toolchains

{% asset_img mingw01.png 图一：MinGW的下载 %}

这里会看到 MinGW 针对不同的操作系统和环境有不同的构建版本，我们往下找到并点击`MinGW-W64-builds`，然后点击`Installation`转到 Github 界面

{% asset_img mingw02.png 图二：MinGW的下载 %}
{% asset_img mingw03.png 图三：MinGW的下载 %}

我们找到最新的发行版（release），会发现下面有很多不同文件

{% asset_img mingw04.png 图四：MinGW的下载 %}

文件名称中按照顺序相关解释如下

1. **架构**
   - `i686`：用于编译 32 位运行程序，老电脑使用
   - `x86_64`：用于编译 64 位运行程序，现代电脑一般用这个
2. **版本号**：`15.2.0-release`表示 MinGW-w64 版本
3. **线程模型**
   - `mcf`：实验性，跨平台但不稳定
   - `win32`：仅支持 Windows 原生线程模型，可移植性差
   - `posix`：跨平台，也适用于 Linux/macOS
4. **异常处理模型**
   - `seh`：用于`x86_64`架构
   - `dwarf`：用于`i686`架构
5. **C 运行时库**
   - `ucrt`：Universal C Runtime，对现代操作系统和新的 C 标准支持更好
   - `msvrct`：Microsoft C Runtime，用于兼容非常古老的 Windows 版本（如 XP），在新系统上存在一定限制

综上，在上图中，现在的大多数电脑应该选择的文件是`x86_64-15.2.0-release-posix-seh-ucrt-rt_v13-rev0.7z`

下载下来解压后得到一个文件夹`mingw64`，将这个文件夹放到一个合适的位置，比如可以放在`C:\Program Files\`

确保`C:\Program Files\mingw64`中是下面这些文件

{% asset_img mingw05.png 图五：MinGW的下载 %}

### 配置环境变量

这里不对环境变量做过多介绍，详情可自行搜索

在桌面上右击此电脑，点击`属性->高级系统设置->环境变量`

在用户变量中找到并双击`Path`，在新窗口中点击`新建`，输入你的`mingw64`文件夹路径+`\bin`（如`C:\Program Files\mingw64\bin`），**然后一路点击确定（三次）**

接下来使用快捷键`win+R`打开运行窗口，输入`cmd`打开命令提示符，输入`gcc -version`，如果出现下图信息即表示配置成功

{% asset_img mingw06.png 图六：MinGW的下载 %}

> 如果提示 _'gcc'不是内部或外部指令，也不是可运行的程序或批处理文件_，则先确保上述步骤无误后**重启电脑**再次尝试

## 在 VS Code 中配置 C/C++ 开发环境
 
### 安装扩展

在 C/C++编程初期（不开发大型项目时），我们不需要用到 CMake，所以只需要用到下面这个扩展

{% asset_img cextention.png 图七：C/C++扩展 %}

这个扩展可以为我们提供 C/C++ 的**自动补全**（智能提示），**代码调试和代码编译的“快捷方式”**

### 编译和运行 C/C++ 程序

这里以 C 语言为例，我们先用 vscode 打开一个文件夹（注意路径中不能有中文），然后新建一个 C 语言文件，简单写一个程序

{% asset_img crun.png 图八：编译和运行 %}

我们可以看到右上角有个运行图标（图标左下角还有个 bug，这是调试的图标），我们先点击图标右边的向下箭头，选择`Run C/C++ file`，然后选择编译器（C 语言会弹出 gcc，C++会弹出 g++）

{% asset_img choose.png 图九：选择编译器 %}

初次运行控制台会输出如下内容，并在左侧的资源管理器中生成一个`.vscode`文件夹

{% asset_img firstrun.png 图十：初次编译 %}

点击控制台上方的终端，就能看到成功输出 Hello World 了

到此，C/C++ 的开发环境就基本配置完成了

### 编译多个文件的 C/C++ 项目

在编译运行完一个 C/C++ 文件后，在当前工作区的`.vscode`目录下会生成一个`task.json`文件，其中包含了该项目编译的参数，如下

{% asset_img tasks.png 图十一：tasks.json 文件 %}

我们主要看`args`，其中`-g`代表输入文件，`${file}`表示当前文件（含扩展名），`-o`表示输出文件，`${fileDirname}`表示当前文件所在的文件夹，`${fileBasenameNoExtension}`表示当前文件的文件名

如果我们想编译多个 C 文件，只需要修改输入的文件，如下

{% asset_img 修改tasks.png 图十二：编译多个文件 %}

而实际上，我们编写项目都是大多在一个工作区内完成，所以也可以修改如下

```json
"${workspaceFolder}\\*.c",
```

输出部分也可以修改如下

```json
"${workspaceFolder}\\${workspaceFolderBasename}.exe"
```

## 参考链接

- [VSCode Doc](https://code.visualstudio.com/docs/cpp/config-mingw)
