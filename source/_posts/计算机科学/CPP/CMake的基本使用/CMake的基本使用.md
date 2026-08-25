---
title: CMake的基本使用
date: 2026-08-25 21:30:58
description: 介绍 CMake 的基本使用
tags: [cmake, c++]
categories: [计算机科学, C++]
sticky:
math:
mermaid:
---

## `CMakeLists.txt` 最小框架

```cmake
cmake_minimum_required(VERSION 3.10)

project(Test)

add_executable(Test main.cpp)
# 如果是构建库文件则写 add_library()
```

其中 

`cmake_minimum_required()` 指定 CMake 版本

`project()` 指定项目名称

`add_executable()` 第一个参数是生产的可执行程序的名称，后面是 `cpp` 文件（可以有多个）

### 设置 C++ 标准

这里使用 `set()` 指令，语法格式为 `set(变量名 值)`

```cmake
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)
```

这两行设置必须使用 C++ 11 标准，也可以改成 `98`、`14`、`17`、`23` 等

> **现代 CMake 设置 C++ 标准一般用 `target` 指令，可以参考后面的内容**

### 添加头文件目录

可以用类似下面的方式添加头文件所在目录

```cmake
target_include_directories(${PROJECT_NAME} 
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)
```

### 添加链接库

链接项目内部的子库（用 `add_library()` 创建的待编译的静态/动态库）

假如项目包含一个主程序和一个子库

```text
my_project/
├── CMakeLists.txt         (1. 顶层根目录配置)
├── main.cpp
└── my_lib/                (子库目录)
    ├── CMakeLists.txt     (2. 子库配置)
    ├── include/
    │   └── my_lib.h
    └── my_lib.cpp
```

子库 `CMakeLists.txt`

```cmake
# 创建名为 my_lib 的静态库
add_library(my_lib STATIC my_lib.cpp)

# PUBLIC 意味着任何链接了 my_lib 的目标，都会自动获得这个 include 目录
target_include_directories(my_lib
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)
```

顶层目录 `CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.10)
project(MainProject)

# 进入子目录解析，执行 my_lib/CMakeLists.txt，生成 my_lib 目标
add_subdirectory(my_lib)

# 定义可执行文件
add_executable(my_app main.cpp)

# 链接子库目标
target_link_libraries(my_app
    PRIVATE
        my_lib  # 这里直接填写子目录 add_library 定义的目标名
)
```

## 相关变量

- `PROJECT_SOURCE_DIR`：最近一次执行 `project()` 的 `CMakeLists.txt` 所在的目录
- `CMAKE_CURRENT_SOURCE_DIR`：当前 `CMakeLists.txt` 所在的目录
- `CMAKE_SOURCE_DIR`：最外层的 `CMakeLists.txt` 所在的目录
- `PROJECT_BINARY_DIR`：项目的构建目录
- `PROJECT_NAME`：项目名
- `<project_name>_VERSION_MAJOR`：如果版本号为 1.12，则值为 1（小数点前面部分）
- `<project_name>_VERSION_MINOR`：如果版本号为 1.12，则值为 12

## out-of-source 构建方式

与传统 `g++` 构建不同，`cmake` 建议将所有的中间件和源码分离，即将中间件放入单独的 `build` 文件夹

### cmake 构建指令

现代化 CMake（3.13+）通过指定 `-S`（Source）和 `-B`（Build）路径直接支持源外构建，完全不需要手动 `cd build`

```bash
# -S .  指定源码目录为当前目录
# -B build 指定构建产物存放到 build/ 目录（不存在会自动创建）
cmake -S . -B build

# 执行实际编译，编译指令会自动在 build/ 内部运行
cmake --build build
```

- **`Configure` 阶段**：这里第一个指令是 CMake 读取 `CMakeLists.txt`，分析编译器信息，并在 `build/` 目录下生成 `Makefile`
- **`Build` 阶段**： 第二个指令是 CMake 调用底层的 `make` 或 `g++` 把所有的 `.o` 文件和可执行文件直接输出到 `build/` 目录中

> `Configure` 阶段已经将所有的 `-std=`，`-I`，`-Wall` 等配置设置好了并保存在了 Makefile 中，`Build` 阶段才会真正开始编译（做 `g++` 做的事情）
> 因此只要没有修改过 `CMakeLists.txt`，而只是修改了源码，只需要跑一遍 `build` 即可
> 实际上，**即便是修改了 `CMakeLists.txt`，也只需要跑一遍 `build`**，这是 cmake 内部做了优化处理



### Source Tree 和 Build Tree

前面的编译指令 `cmake -S . -B build` 中，`.` 就可以理解为 Source Tree，而 `build` 就是 Build Tree

总结来说就是 Source Tree 只存人写的源码，Build Tree 只存机器生成的产物

两个 Tree 的结构可以对照如下

```text
my_project/                      <-- Source Tree (源码树)
├── CMakeLists.txt               <-- 人写的构建脚本
├── include/
│   └── math.h                   <-- 头文件
└── src/
    ├── main.cpp                 <-- 源文件
    └── math.cpp                 <-- 源文件

----------------------------------------------------------------------

build/                           <-- Build Tree (构建树)
├── CMakeCache.txt               <-- CMake 变量与环境缓存
├── CMakeFiles/                  <-- CMake 产生的内部检查文件
├── Makefile                     <-- Configure 阶段生成的构建脚本
├── main.o                       <-- g++ -c 编译出的中间对象文件
├── math.o                       <-- g++ -c 编译出的中间对象文件
└── my_app                       <-- g++ 最终链接生成的可执行文件
```

通过这个机制，我们可以实现一源多树

通过 `-D<参数名>=` 来指定参数，实现不同树的有不同的配置

```bash
# 用 GCC 构建 Debug 版本
cmake -S . -B build-gcc-debug -DCMAKE_CXX_COMPILER=g++ -DCMAKE_BUILD_TYPE=Debug
# 用 Clang 构建 Release 版本
cmake -S . -B build-clang-release -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_BUILD_TYPE=Release
```

## Target

### `target_*` 指令

现代 CMake 以 Target 为中心

- 首先创建一个 Target（例如 `add_executable(my_app)`，`add_library(my_lib)`）
- 然后通过各种 `target_*` 命令，给这个 target 绑定各种属性

而 `target_*` 指令也有一套固定的语法，即

```cmake
target_xxx( <target_name>  <PRIVATE|PUBLIC|INTERFACE>  <item1> <item2>... )
```

以下是一些常用的 `target_*` 指令

| Target 指令 | 作用 | 对应 `g++` 指令 |
|:---:|:---:|:---:|
| `target_include_directories` | 绑定头文件搜索路径 | `g++ -c -I/path/to/include` |
| `target_compile_options` | 传递原生编译器选项（如警告、优化等） | `g++ -Wall -Wextra -O2` |
| `target_link_libraries` | 绑定依赖库 | `g++ main.o -lmath -o app` |
| `target_compile_features` | 声明 C++ 语言标准需求（如 `cxx_std_17`） | 自动转为 `g++ -std=c++17` |
| `target_sources` | 指定参与编译个源文件 | `g++ -c` |

### 作用域

首先看看下表

| 关键字 | 作用于当前 target | 传递给下游 target | 典型场景 |
|:---:|:---:|:---:|:---:|
| `PRIVATE` | `Yes` | `No` | 仅在 `.cpp` 中使用的内部实现细节 |
| `PUBLIC` | `Yes` | `Yes` | 在公共头文件暴露的依赖 |
| `INTERFACE` | `No` | `Yes` | Header-Only 库或仅对使用者生效的规则 |

举例

`target_include_directories(LibA <Scope> src/internal)`

- `PRIVATE`：仅在编译 `LibA` 的 `.cpp` 文件时使用
- `PUBLIC`：`LibA` 需要，`App` 也需要
- `INTERFACE`：自身编译不需要，但是 `App` 会添加该头文件路径

`target_link_libraries(LibA <Scope> pthread)`

- `PRIVATE`：App 不需要线程相关接口，只要 `LibA` 实现了就行

## CPP 访问 CMake 变量

```cmake
configure_file(testConfig.h.in testConfig.h)
```

### `#define`

`testConfig.h.in` 内容如下

```cpp
#define PROJECT_VERSION_MAJOR ${Test_VERSION_MAJOR}
#define PROJECT_VERSION_MINOR @Test_VERSION_MINOR@
#define PROJECT_NAME "${PROJECT_NAME}"
```

这里命令会读取 `testConfig.h.in` 中的内容，并把 cmake 变量替换为值，然后写入 `build/testConfig.h` 

要想在 `cpp` 文件中使用这些变量，只需要 `target_include_directories()` 将项目构建目录 `${PROEJCT_BINARY_DIR}` 导入即可

### `#cmakedefine`

`#cmakedefine` 和 `#define` 作用类似，但是 `#cmakedefine` 不会把非真值（即 0 或 OFF）替换到 `.h` 文件中

这个宏配合可选变量可以实现一些其他的功能，比如

```text
my_project/
├── CMakeLists.txt
├── main.cpp
└── add/
    ├── CMakeLists.txt
    ├── include/
    │   └── add.h
    ├── add.cpp
    └── config.h.in
```

```cpp
// main.cpp
#include <iostream>
#include "config.h"

#ifdef USE_MY_ADD
    #include "add.h"
#endif

int main() {
#ifdef USE_MY_ADD
    std::cout << "使用 add 函数：" << add(1, 2) << std::endl;
#else
    std::cout << "直接输出：" << 3 << std::endl;
#endif
    return 0;
}
```

```cpp
// config.h.in
#cmakedefine USE_MY_ADD
```

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)

project(demo06)

option(USE_MY_ADD "是否使用 add 库" ON)

configure_file(config.h.in config.h)

add_executable(demo06 main.cpp)

target_include_directories(demo06 PRIVATE ${CMAKE_CURRENT_BINARY_DIR})

if(USE_MY_ADD)
    message(STATUS "开启使用 add 库")
    add_subdirectory(add)
    target_link_libraries(demo06 PUBLIC add)
endif()
```

```cmake
# add/CMakeLists.txt
cmake_minimum_required(VERSION 3.10)

project(add VERSION 1.0)

add_library(add add.cpp)

target_include_directories(add PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

```

## Generator

### Generator 生成器

Generator 是决定 CMake 把 `CMakeLists.txt` 转换成哪种底层构建工具（如 `make`，`ninja` 或 IDE）脚本的驱动引擎

常见的 Generator 分类

| Generator 名称 | 产出的配置文件 | 对应底层构建工具 |
|:---:|:---|:---:|
| Unix Makefile | `Makefile` | `make` |
| Ninja | `build.ninja` | `ninja` |
| Visual Studio... | `.sln`/`.vcxproj` | `MSBuild` |
| Xcode | `xcodeproj` | `xcodebuild` |

可以使用 `cmake --help` 查看当前所用的 Generator （带 `*` 的）

可以使用 `-G` 参数指定 Generator，比如

```bash
cmake -S . -B build -G Ninja
```

### Single-Config 和 Multi-Config

单配置生成器在 Configure 阶段就要指定构建类型

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
```

多配置生成器在 Build 阶段指定类型

```bash
cmake --build build --config Release
```


