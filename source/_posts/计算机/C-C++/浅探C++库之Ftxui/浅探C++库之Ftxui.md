---
title: 浅探C++库：Ftxui
date: 2026-07-18 22:12:00
description: 本文介绍 C++ 的一个 tui 库 Ftxui
series: 浅探 C++ 库
tags: [C++, ftxui, 库, tui]
categories: [计算机, C/C++]
cover: /assets/covers/cplusplus.png
---

## 安装与配置

这里以 `v7.0.1` 版本为例（不同版本的语法略有差异）

使用 `git` 下载 `v7.0.1` 版本的 `FTXUI`

```bash
git clone -b v7.0.1 git@github.com:ArthurSonzogni/FTXUI.git
```

然后将下载后的文件夹移动到项目的相应位置

```bash
mv FTXUI /path/to/your/project/third_party/ftxui
```

最后在 `CMakeLists.txt` 中添加下面的语句即可

```cmake
add_subdirectory(third_party/ftxui)
target_link_libraries(main
  PRIVATE ftxui::screen
  PRIVATE ftxui::dom
  PRIVATE ftxui::component
)
```

## Screen

### Screen 对象

首先需要导入 `ftxui/screen/screen.hpp`

使用 `ftxui::Screen::Create` 可以创建一个 `Screen` 对象

- 参数：`width : Dimension` 和 `height : Dimension`
- `Dimension::Fixed(val)`，`val` 填入具体值表示大小
- `Dimension::FUll()` 表示 `screen` 将占据终端的整个长/宽
- `Dimension::Fit(document)`
- 通过 `screen.dimx()` 和 `screen.dimy()` 可以获取宽/长

实际上，如果定义

```cpp
auto screen = fxtui::Screen::Create(
    Dimension::Fixed(10),
    Dimension::Fixed(10)
);
```

那么可以把这个 `screen` 当成一个 $10 \times 10$ 的表格，每个单元格是一个 `Pixel`，我们可以通过下面的方法拿到单元格像素

```cpp
auto &pixel = screen.PixelAt(10, 5);
```

这表示取到了 `screen` 上坐标为 `(10, 5)` 的像素点，**注意这里一定要用引用，这样后面对这个像素做的修改才能在 `screen` 中生效**

我们有两种方法将 `screen` 输出到终端中

- 一种是直接调用成员函数 `Print`，即 `screen.Print()`
- 也可以调用 `ToString()` 成员函数将 `screen` 转成 `string` 再直接使用 `cout` 进行输出，即 `cout << screen.ToString();`

### Pixel 对象

`pixel` 对象常用的属性如下

- 布尔变量
  - `bold`：加粗
  - `dim`：暗淡
  - `inverted`：将背景颜色和字体颜色互换
  - `underlined`：下划线
  - `underlined_double`：双下划线
  - `strikethrough`：删除线
- 字符
  - `character`
- Color
  - `foreground_color`
  - `background_color`

使用颜色需要导入 `ftxui/screen/color.hpp`，颜色可以使用预设的十六种颜色，也可以通过 RGB 设置颜色，比如

`ftxui::Color::Red`，`ftxui::Color::RGB(r, g, b)`

## dom

### Element

`dom` 在 `Ftxui` 指的是 `Element` 对象，可以通过 `Render`（需要导入 `ftxui/dom/node.hpp`），将 `dom` 渲染到 `screen` 上，比如渲染一个 `text`（需要导入 `ftxui/dom/elements.hpp`

```cpp
Render(screen, text("this is a text"));
```

利用 `hbox`，`vbox`，`hflow`，`vflow` 可以实现布局，参数都是 `Elements`，即 `vector<Element>`

比如水平布局 `hbox`，就是将

```cpp
Element document = hbox({
        text("col1"),
        separator(),
        text("col2"),
        filler(),
        text("col3"),
    }) | border;
```

其中 `separator()` 是分隔线，`filler()` 可以理解为是一个弹簧，将 `col2` 和 `col3` 撑开

`box` 和 `flow` 的最主要区别是，`flow` 会自动换行，比如 `hflow` 本来是横向排列，但是当 `Element` 过多而一行放不下时，多出来的就会自动一道下一行

还有一种布局是 `gridbox`，它则接收 `Elemnts` 的二维数组，第一维表示行，第二维表示列

以下列举一下常用的 `Element`

- `text`/`vtext`/`paragraph`
- `window`
- `separator`/`separatorLight/separatorDashed/separatorDouble/separatorHeavy`
- `filler`

### Decorator

还可以使用 `Decorator` 对 `Eelement` 进行“装饰”，比如

```cpp
auto document = text("text") | border | color(Color::Red) | bgcolor(Color::White)
```

其中，`border` 会给这个文本加上边框，`color` 则是改变文本的颜色，`bgcolor` 则是改变文本的背景颜色

以下列举一些常用的 `Decorator`

- `center`
- `vcenter`/`hcenter`：竖直/水平居中
- `flex`：弹簧
- `bold`/`dim`/`underlined`/`underlined_double`/`color`/`bgcolor`
- `size(WIDTH, EQUAL, dimx)/size(HEIGHT, EQUAL, dimy)`：宽度/高度

## Component

`dom` 主要处理窗口上的布局和样式，而 `component` 主要处理交互事件

### 渲染 component

以输入框为例

```cpp
using namespace ftxui;

App app = App::FitComponent();
std::string myText = "";
Component input_text = Input(&myText, "type a text");
app.Loop(input_text);
```

如上，我们首先定义一个 `app`，然后定义组件，最后使用 `app.Loop(Component)` 渲染组件

### Renderer

`Renderer` 也是一个 `Component`，它可以将 `Element` 转化为 `Component`，比如

```cpp
auto screen = App::FitComponent();
Component renderer = Renderer([] { return text("Hello Ftxui"); });
screen.Loop(renderer);
```

这里 `Component` 接受一个 `function<Element()>` 类型的参数，因此这里使用匿名函数返回一个 `Element` 组件

此外，`Renderer` 也可以将 `Component` 和 `Element` 结合，使得 `Component` 有更多的样式，比如

```cpp
App app = App::FitComponent();
    std::string myText = "";
    Component input_text = Input(&myText, "type a text");
    auto renderer = Renderer(input_text, [&] {
        return hbox({
            text("输入："),
            input_text->Render()
        });
    });
    app.Loop(renderer);
```

这里的 `Renderer` 接收两个参数，第一个参数接受交互组件，第二个参数和前面一样是布局，唯一区别是这里使用 `input_text->Render()` 获取 `input_text` 这个组件的最新样式（因此程序就是在这样的不断更新样式的过程中实现交互的）

实际上，这里 `Renderer` 接收的第二个参数还可以是 `function<Element(bool)>` 类型，参数表示该组件是否获取焦点，从而实现更加丰富的自定义交互事件

`Renderer` 最后一个用法就是将 `DomDecorator` 转化为 `ComponentDecorator`，如下

```cpp
auto screen = App::FitComponent();
Component renderer = Renderer([] { return text("Hello Ftxui"); });
renderer = renderer | Renderer(color(Color::Red));
screen.Loop(renderer);
```

### Container

显然，一个界面一般不只有一个交互组件，对此，我们可以使用 `Container` 将组件进行封装（`Container` 也是 `Component`）

```cpp
auto app = App::FitComponent();
std::string account = "";
std::string password = "";
auto input_account = Input(&account, "type your account");
auto input_password = Input(&password, {
    .placeholder = "type your password",
    .password = true
});
auto btn_exit = Button("Exit", app.ExitLoopClosure());
auto btn_submit = Button("Submit", [] {});

auto container = Container::Horizontal({
    input_account,
    input_password,
    Container::Vertical({
        btn_submit, 
        btn_exit
    })
});
auto renderer = Renderer(container, [&] {
    return vbox({
        hbox({
            text("Account : "),
            input_account->Render()
        }),
        hbox({
            text("Password: "),
            input_password->Render()
        }),
        hbox({
            filler(),
            btn_submit->Render(),
            btn_exit->Render()
        })
    }) | border;
});
app.Loop(renderer);
```

使用不同的 `Container` 封装的效果也不同，如下

- `Horizontal`：通过左右/(Shift)Tab 键切换焦点
- `Vertical`：通过上下/(Shift)Tab 键切换焦点
- `Stacked`：子组件在层级上重叠，一般配合 `Window` 组件使用
- `Tab`：同一时刻只渲染一个子组件，一般配合 `Toggle` 组件使用

`Tab` 实例

```cpp
auto screen = App::TerminalOutput();
std::vector<std::string> tab_titles = {"主页 (Home)", "设置 (Settings)", "关于 (About)"};
int tab_selected = 0;

auto tab_toggle = Toggle(&tab_titles, &tab_selected);
auto tab_container = Container::Tab({
    Renderer([] { return text("欢迎来到主界面！") | center; }),
    Renderer([] { return text("这里是系统设置页面。") | center; }),
    Renderer([] { return text("FTXUI 演示程序 v1.0") | center; }),
}, &tab_selected);

auto main_container = Container::Vertical({
    tab_toggle,
    tab_container,
});

auto renderer = Renderer(main_container, [&] {
    return vbox({
        tab_toggle->Render() | hcenter | bold, 
        separator(),
        tab_container->Render() | flex, 
    }) | border;
});

screen.Loop(renderer);
```

`Stacked` 实例

```cpp
Component DummyContent(const std::string& name) {
    return Renderer([name] {
        return vbox({
            text("窗口: " + name) | bold,
            text("你可以使用鼠标点击拖拽窗口标题栏来移动它。"),
            text("点击窗口内部将其置顶。"),
        }) | center;
    });
}

int main() {
    auto screen = App::Fullscreen();
    auto window_1 = Window({
        .inner = DummyContent("文档编辑器"),
        .title = "窗口 1",
        .left = 10,
        .top = 5,
        .width = 50,
        .height = 15,
    });

    auto window_2 = Window({
        .inner = DummyContent("控制面板"),
        .title = "窗口 2",
        .left = 35,
        .top = 10,
        .width = 50,
        .height = 15,
    });

    auto desktop = Container::Stacked({
        window_1,
        window_2,
    });

    auto root_renderer = Renderer(desktop, [&] {
        return vbox({
            text(" FTXUI 桌面系统 ") | center | bold | border,
            desktop->Render() | border | flex,
            text(" 提示: 点击窗口进行置顶或拖拽 ") | dim
        });
    });

    screen.Loop(root_renderer);
    return 0;
}
```

## 参考链接

- [Ftxui 文档](https://arthursonzogni.github.io/FTXUI)
