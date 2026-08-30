---
title: g++ 和 gdb 的使用方法介绍
date: 2026-08-25 16:42:47
description: 本文介绍如何使用 g++ 编译 C++ 源文件，以及使用 gdb 调试编译好的二进制程序，最后稍微谈点 nm 工具
tags: [C++, g++, gdb, nm]
categories: [计算机科学, C++]
sticky:
math:
mermaid: true
---

## CPP 编译流程

预处理 -> 编译 -> 汇编 -> 链接

### 预处理

删除注释，并处理所有的以 `#` 开头的预处理指令，进行文本层面的替换与扩展

最终得到的 `main.i` 是替换后的纯 C++ 文本

```bash
g++ -E main.cpp -o main.i
```

### 编译

将 C++ 文本编译为相应平台（CPU 可读）的汇编指令

```bash
g++ -S main.i -o main.s
```

### 汇编

使用汇编器将汇编代码转为机器码（不可执行，可能缺少系统库，内存也不是真的内存）

```bash
g++ -c main.s -o main.o
```

### 链接

将多个目标文件以及系统静态库，动态库合并，形成完整地址布局的二进制文件

```bash
g++ main.o -o main
```

## 编译常用参数

### 输入和输出文件 `-o`，`-c`

- `-o`：指定输出文件名
- `-c`：将指定文件编译为临时机器码，如 `g++ -c main.cpp -o main.o`

注意如果是直接得到可执行程序，不需要加 `-c`

```bash
g++ main.cpp -o main
```

### 指定头文件所在目录 `-I`

一般情况下**编译器会直接在源代码的同一级目录找头文件**，当用 `-I` 指定头文件目录后，编译器就可以在指定目录找头文件，

```bash
g++ -I./include src/main.cpp -o main
```

如果有多个头文件目录（如有第三方库）

```bash
g++ -I./include -I./third_party/spdlog/include src/main.cpp -o main
```

### 指定库文件 `-L`/`-l`

一般情况下，如果要用到链接库，（Linux 系统）会直接到 `/usr/lib` 或 `/lib` 目录下寻找

如果链接库不在这里，就需要手动指定**链接库目录**

```bash
g++ main.o -L./third_paty/lib -o main
```

在 Linux 中，库名一般是 `lib<动态库名>.so`/`lib<静态库名>.a`，在给 `-l` 传参数时，必须省去开头的 `lib` 和结尾的后缀

| 实际库名 | `-l` 参数 | 含义 |
|:---:|:---:|:---:|
| `libm.so`/`libm.a` | `-lm` | 链接数学库 |
| `libpthread.so` | `-lpthread` | 链接 POSIX 线程库 |
| `libssl.so` | `-lssl` | 链接 OpsnSSL 库 |

比如项目的目录为

```text
my_project/
├── lib/
│   └── libcalculator.so  <-- 动态库文件
└── src/
    └── main.cpp          <-- 源码
```

```bash
g++ src/main.cpp -L./lib -lcalcualtor -o main
```

如果存在同名的动态库和静态库，会优先使用静态库

但是可以通过，`-Wl,-Bstatic` 和 `-Wl,-Bdynamic` 指定后面使用静态库/动态库

```bash
g++ main.c -Wl,-Bstatic -lfoo -Wl,-Bdynamic -lbar
```

### `pkg-config`

对于**第三方库**，比如 `Qt6Widgets`，可以利用系统自带的 `pkg-config` 命令查找需要引入的头文件文件夹和库文件文件夹

```bash
pkg-config --cflags --libs Qt6Widgets
```

`--cflags` 表示查找头文件文件夹，`--libs` 表示查找库文件文件夹，输出如下

```text
-I/usr/include/qt6/QtWidgets -I/usr/include/qt6 -DQT_WIDGETS_LIB -I/usr/include/qt6/QtGui -DQT_GUI_LIB -I/usr/include/qt6/QtCore -DQT_CORE_LIB -I/usr/lib/qt6/mkspecs/linux-g++ -lQt6Widgets -lQt6Gui -lQt6Core
```

一般来说，我们可以这样使用

```bash
g++ main.cpp `pkg-config --cflags --libs Qt6Widgets` -o main
```

使用 `ldd` 工具可以查看所有链接的库

```bash
ldd main
```

此外，如果要查看所有的包，可以使用

```bash
pkg-config --list-all
```

### 指定 C++ 语言标准 `-std=`

`std=c++11` 表示使用 C++11 标准，类似的还有 `c++14`,`c++17`,`c++20`,`c++23`

以上这些都是 ISO C++ 标准，如果要使用 GCC 特有的标准，可以使用 `gnu++17` 等

### 添加警告 `-Wall -Wextra -Wpedantic`

- `-Wall`：即 `Warning All`，开启最常用的基础警告
  -  `if (x == 0)` 写成了 `if (x = 0)` `-Wparentheses`
  -  定义了但从未使用的变量 `-Wunused-variable`
  -  有返回值的函数没写 `return` `-Wreturn-type`
- `-Wextra`：在 `-Wall` 的基础上开启更深层的警告
  - 有符号整型和无符号整型比较 `-Wsign-compare`
  - 函数定义了形参但是未使用 `-Wunused-parameter`
  - `if-else` 分支体为空 `-Wempty-body`
  - 结构体或类初始化时遗漏部分字段 `-Wmissing-field-initializers`
- `-Wpedantic`：严格遵守 ISO C/C++ 标准
  - 使用了变长数组（VLA）
  - 使用了 0 长度的数组
  - 使用了当前标准已废弃的语法

这些只是警告，仍然可以编译（只是在编译时显示警告）

使用 `-Werror` 可以将警告上升为错误（可以用 `echo &?` 查看退出码）

## 启动 gdb

如果要使用 gdb 调试，在编译源码时最好加上 `-g` 参数

```bash
g++ -g main.cpp -o main
```

这个参数可以使得调试器能够查看源代码，方便我们调试

然后就可以用 gdb 调试了

```bash
gdb main
```

## 使用 gdb

### 断点

**添加断点**

| 类型 | 语法 | 示例 |
|:---:|:---:|:---:|
| 按行号 | `b <line>`/`b <file>:<line>` | `b 5`/`b main:5` |
| 按函数名 | `b <function>`/`b <class>::<function>` | `b main` |
| 按条件 | `b <line/function> if <condition>` | `b 4 if i == 100` |

注意添加断点是断在执行当前语句之前

**查看所有断点**

```bash
info break
```

```text
(gdb) info break
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x0000000000001195 in func() at gdb_test.cpp:4
2       breakpoint     keep y   0x00000000000011f0 in main() at gdb_test.cpp:11
```

**删除断点**

使用 `d <n>` 删除对应编号的断点，编号可以通过 `info break` 查看

直接输入 `d` 会清空所有断点

**启用/禁用断点**

```bash
diable <n>
enable <n>
```

**观察数据点**

当某个变量或内存地址发生改变时自动暂停程序

```bash
watch variable
```

### 控制运行

使用 `run`/`r` 可以从头开始调试，使用 `kill`/`k` 可以终止当前正在调试的程序

| 指令 | 缩写 | 行为 |
|:---:|:---:|:---:|
| `next` | `n` | 单步执行（不进入函数） |
| `step` | `s` | 单步执行（进入函数） |
| `continue` | `c` | 恢复程序正常运行，直到遇到下一个断点 |
| `finish` | `f` | 运行至当前函数结束 |
| `until` | `u` | 运行至指定位置（行）/跳出循环 |

> 直接回车默认执行上一条命令

`start` 也可以启动调试，只不过 `start` 会默认在 `main` 函数打一个断点，然后执行 `r`

使用 `list` 可以显示源码的上下文

### 输出变量和内存地址

使用 `print`/`p` 即可输出变量的值

```bash
p val
```

- `p/x val` 按十六进制输出
- `p/t val` 按二进制输出
- `p/c val` 按字符输出

使用 `display` 可以在每次单步执行后自动打印该变量

```bash
display val
```

使用 `info display` 可以查看所有监视项

如果要查看内存，直接用取地址运算符 `&` 即可

```bash
p &val
```

直接查看裸内存

```bash
x/<n><f><u> <pointer>
```

- `<n>` 要查看的单元数量
- `<f>` 格式 `x` 十六进制 `d` 十进制 `s` 字符串 `i` 汇编指令
- `<u>` 单位大小 `b` 1字节 `h` 2字节 `w` 4字节 `g` 8字节

示例

- `x/5dw arr` 查看从数组 `arr` 开头的连续 5 个 4 字节的十进制整数
- `x/4xb &val` 按 1 字节独立打印 `val` 占用的 4 字节
- `x/s std_ptr` 将 `str_ptr` 当作 C 风格字符串打印直到遇到 `\0` 结束

### 查看栈调用

使用 `bt` 可以查看栈调用

```text
(gdb) bt
#0  func () at gdb_test.cpp:6
#1  0x00005555555551f5 in main () at gdb_test.cpp:13
```

- `bt full` 查看完整的调用栈信息
- `bt <N>` 打印最内层的 `N` 个栈帧
- `bt -<N>` 打印最外层的 `N` 个栈帧（和 `main` 靠近的）

## gdb 调试流程

1. 现象：捕获与还原现场，用 `run` 跑出控制台输出
2. 根因：精准定位漏洞源头，使用 `bt` 查调用栈和局部变量，`x/p` 查看内存和指针合法性
3. 修复：编写并应用修复代码
4. 回归：验证生效且无侧效应


## nm 工具

nm 是 Linux 下一个用来查看二进制文件符号表的命令行工具

可以用来查看在目标文件（.o）、静态库（.a）、动态库（.so）以及可执行程序中的函数和全局变量

当运行 `nm nmTest.o` 时，每一行通常包含三列

```text
地址/偏移量        类型代码  符号（函数名或变量名）
0000000000000000 T        _Z3addii
```

### 类型代码

大写一般表示全局/外部符号，即可以被其他文件或库引用的符号，小写一般表示静态/内部符号，即今在当前文件可以被访问的符号

| 代码 | 全称含义 | 内存区域 | 常见对应的代码 |
|:---:|:---:|:---:|:---:|
| `T`/`t` | Text | 代码段 | 普通函数定义，`T` 为全局函数，`t` 为静态函数 |
| `U` | Undefined | 不占用空间 | 当前文件只调用该符号，但是没有实现，等待链接器在外部补齐 |
| `D`/`d` | Data | 已初始化的数据段（`.data`） | 初始值不为 0 的全局变量或静态变量 |
| `B`/`b` | BSS | 未初始化的数据段（`.bss`） | 未初始化或初始化为 0 的全局变量或 static 变量 | 
| `R`/`r` | Read-Only | 只读数据段（`.rodata`） | `const` 全局变量、字符串字面量 |
| `W`/`w` | Weak | 代码段/数据段 | 常见于 inline 函数或模板实例化，允许多处定义且不报冲突 | 
| `C` | Common | 未初始化公共段 | 未初始化的 C 风格全局变量（在最终链接阶段会被合并并转入 BSS 段） |


```cpp
#include <iostream>

const int g_const_val = 100;     // R : 全局 const 变量 -> 只读数据段 (Read-Only)
int g_init_val = 1;              // D : 已初始化且非零 -> 数据段 (Data)
int g_zero_val = 0;              // B : 初始化为零 -> BSS 段
int g_uninit_val;                // B : 未初始化 -> BSS 段 (或 C)

static void inner_func() {}      // t : static 函数 -> 局部代码段 (小写 t)
void global_func() {}            // T : 普通全局函数 -> 全局代码段 (大写 T)

inline void inline_func() {}     // W : 内联函数 -> 弱代码段 (Weak)

void test() {
    std::cout << "Hi";           // U : std::cout 等外部符号 -> 未定义 (Undefined)
}
```

### 常用参数

- `-C`：还原 C++ 名字（即将列出的符号部分的“乱码”翻译为 C++ 变量名/函数名）
- `-u`：只看未定义符号
- `-g`：只显示全局/外部符号
- `-D`：查看动态符号表，一般用来查看 `.so` 文件
- `-A`：显示所属文件名


