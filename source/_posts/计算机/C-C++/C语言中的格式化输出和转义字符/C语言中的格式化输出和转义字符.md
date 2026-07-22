---
title: C 语言中的格式化输出和转义字符
date: 2025-10-22 08:54:42
description: 总结C语言中的格式化输出方式
series: C/C++
tags: [计算机, C语言]
categories: [计算机, C/C++]
cover: /assets/covers/clanguage.png
---

## 格式化输出字符

### 常用的格式化字符

C 语言中的格式化输出字符如下

|         格式字符         |           类型           | 备注                                                                         |
| :----------------------: | :----------------------: | :--------------------------------------------------------------------------- |
|      `%[-][0][n]d`       |          `int`           | `-`表示左对齐，`n`表示输出宽度，`0`表示右对齐时用`0`补齐，左对齐时用空格补齐 |
|           `%c`           |          `char`          |                                                                              |
|    `%[-][0][n][.n]f`     |         `float`          | `.n`表示小数位位数，其余同`int`                                              |
|    `%[-][0][n][.n]s`     |         `char[]`         | `.n`表示从左开始取`n`位，其余同`int`                                         |
|          `%hd`           |         `short`          |                                                                              |
|         `%[#]o`          |       `八进制整型`       | # 表示显示八进制前面的`0`                                                    |
|         `%[#]x`          |      `十六进制整型`      | # 表示显示十六进制前面的`0x`                                                   |
|          `%hu`           |     `unsigned short`     |                                                                              |
|       `%ld`/`%Ld`        |          `long`          |                                                                              |
|      `%lld`/`%LLd`       |       `long long`        |                                                                              |
|           `%u`           |      `unsigned int`      |                                                                              |
|   `%ul`/`lu`/`UL`/`LU`   |   `unsigned long int`    |                                                                              |
| `%ull`/`llu`/`ULL`/`LLU` | `unsigned long long int` |                                                                              |
|          `%lf`           |         `double`         | 参数同上                                                                     |
|           `%e`           |       `科学计数法`       | 如`1e2=1*10^2`，`2e-2=2*10^(-2)`，`0.5E+3=0.5*10^(3)`                        |
|           `%g`           |   `自动判断使用f还是e`   |                                                                              |
|           `%p`           |         `point`          |                                                                              |
|           `%%`           |                          | 输出%                                                                        |

### \*修饰符

以格式化输出整数为例，如果想要动态地控制输出的整数的宽度，需要用到`*` 修饰符

```C
int width = 6, precision = 2, n = 1;
float f = 3.1415926;
printf("######\n");
printf("%0*d\n", width, n);
printf("%*.*f", width, precision, f);
```

输出如下

```bash
######
000001
  3.14
```

## 转义字符

### 常用的转义字符

一般的转义字符

| 转义序列 |        作用        |
| :------: | :----------------: |
|   `\n`   |        换行        |
|   `\t`   |     水平制表符     |
|   `\\`   |       反斜杠       |
|   `\'`   |       单引号       |
|   `\"`   |       双引号       |
|   `\r`   | 光标回到当前行行首 |
|   `\b`   |        退格        |

一些案例

**1. 用户交互**

使用`\b`实现在横线上输入

```C
int num;
printf("输入一个两位数：__\b\b");
scanf("%d", &num);
```

**2.打印进度条**

利用`\r`回到行首不断更新进度条

```C
#include <stdio.h>
#include <unistd.h> // 用于 usleep (微秒级暂停)

int main()
{
    int total = 50; // 进度条总长度
    printf("开始下载...\n");

    for (int i = 0; i <= total; i++)
    {
        // \r 让光标回到行首
        // \033[32m 设置绿色
        printf("\r[");

        // 打印已完成的方块
        for (int j = 0; j < i; j++)
            printf("=");
        // 打印未完成的空格
        for (int j = 0; j < total - i; j++)
            printf(" ");

        // \033[0m 重置颜色，显示百分比
        printf("] %d%%", i * 2);

        // 强制刷新缓冲区，否则看不到动画
        fflush(stdout);

        usleep(50000); // 暂停 50 毫秒
    }
    printf("\e[0m");

    printf("\n下载完成！\n");
    return 0;
}
```

编码相关

| 转义序列 |                                                            作用                                                             |         例子         |
| :------: | :-------------------------------------------------------------------------------------------------------------------------: | :------------------: |
|  `\xhh`  |                                      给定一个十六进制数，输出 ASCII 码表中其对应的字符                                      |   `\x41`对应字符 A   |
|  `\ooo`  |                                       给定一个八进制数，输出 ASCII 码表中其对应的字符                                       |   `\101`对应字符 A   |
| `\uNNNN` | 输出对应 Unicode 表中对应的字符 [参考 Wikipedia](https://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%88%97%E8%A1%A8) | `\u4f60` 对应汉字 你 |

### ANSI 转义序列

> **ANSI 转义序列**（ANSI Escape Sequences）是一系列以`ESC`（ASCII 码 27，即 \033 或 \x1B）​​ 开头的控制字符序列

所有的 ANSI 转义序列都始于一个特殊的字符：`ESC`(Escape，转义字符)。在编程语言中，它通常被表示为 \e (PHP, Bash) 或八进制的 \033 (Python, C/C++)，其 ASCII 码为 27

我们常用的 ANSI 转义序列都是 CSI 序列，CSI 序列由`ESC[`、若干个（包括 0 个）参数字节、中间字节、最终字节组成，各部分字节的范围如下

| 组成部分 |   字符范围    |          ASCII          |
| :------: | :-----------: | :---------------------: |
| 参数字节 | `0x30`-`0x3F` |      `0-9:;< = >?`      |
| 中间字节 | `0x20`-`0x2F` | 空格、`!"#$%&'()*+,-./` |
| 最终字节 | `0x40`-`0x7E` |  `@A-Z[\]^\_a-z{\|}~`   |

#### 控制颜色

用案例引入

```C
printf("\e[30;47m这是黑字白底。\e[0m\n");
printf("\e[1;34m这是粗体蓝色的文字。\e[0m\n");
```

在第一条语句中`\e[`表示启动 CSI 转义，`30`（参数字节）表示设置字体为黑色，`47`（参数字节）表示设置白底，`m`（最终字节）表示处理颜色，`\e[0m`中`0`表示重置所有状态
第二条语句中，`1`表示粗体，`34`表示蓝色

样式参数

- `1`：粗体/高亮
- `2`：减弱
- `3`：斜体
- `4`：下划线
- `7`：反向显示

常用的颜色参数如下

![图一：颜色](颜色.png)

#### 控制光标

- `\e[r;cH`/`\e[r;cf`：将光标移动到整个终端的第`r`行第`c`列（绝对位置）
- `\e[H`：光标移动到左上角
- `\e[NA`：光标上移`N`行
- `\e[NB`：光标下移`N`行
- `\e[NC`：光标右移`N`列
- `\e[ND`：光标左移`N`列
- `\e[?25l`：隐藏光标
- `\e[?25h`：显示光标

比如可以实现一个加载动画（旋转）的效果

```C
#include <stdio.h>
#include <unistd.h>

int main()
{
    const char *spin = "|/-\\";
    printf("\033[?25l"); // 隐藏光标

    for (int i = 0; i < 20; i++)
    {
        // %c 打印字符，\r 回到行首
        printf("\r正在加载 %c ", spin[i % 4]);
        fflush(stdout);
        usleep(100000);
    }

    printf("\r加载完成！  \n");
    printf("\033[?25h"); // 恢复光标
    return 0;
}
```

#### 清屏与清行

- `\e[2J`：清空屏幕（可以用`\e[H\e[2J`清除屏幕内容并设置光标）
- `\e[K`：清除行光标位置到行末尾的内容
- `\e[2K`：清除当前行（光标不会回到行首，可以用`\r`使光标回到行首）

#### 综合运用

**1. 进阶进度条**

```C
#include <stdio.h>
#include <unistd.h>

int main()
{
    int total = 50;

    // 隐藏光标
    printf("\033[?25l");
    printf("正在同步数据...\n");

    for (int i = 0; i <= total; i++)
    {
        float percentage = (float)i / total * 100;

        // 清除当前行
        printf("\r\033[K");

        // i < 20 用红色 (31)，i < 40 用黄色 (33)，完成用绿色 (32)
        if (i < 20)
            printf("\033[31m");
        else if (i < 40)
            printf("\033[33m");
        else
            printf("\033[32m");

        printf("[");
        for (int j = 0; j < i; j++)
            printf("█");
        for (int j = 0; j < total - i; j++)
            printf(" ");
        printf("] %.1f%%", percentage);

        // 刷新缓冲区
        fflush(stdout);
        usleep(50000); // 50毫秒
    }

    printf("\n\033[32m✔ 同步完成！\033[0m\n");
    // 恢复光标
    printf("\033[?25h");
    // 回复颜色
    printf("\033[0m");

    return 0;
}
```

**2. 终端弹球游戏**

```C
#include <stdio.h>
#include <unistd.h>
#define TRAIL_SIZE 5 // 拖尾长度

int main()
{
    const int width = 50, height = 15;
    int x = 1, y = 1, dx = 1, dy = 1;

    // 记录历史坐标的数组
    int history_x[TRAIL_SIZE] = {0};
    int history_y[TRAIL_SIZE] = {0};

    // 初始化：隐藏光标，清屏
    printf("\033[?25l\033[2J");

    for (int frame = 0; frame < 300; frame++)
    {
        // 擦除最旧的一个尾巴（变成空格）
        // 这里不用清屏是因为换成空格效率更高且效果更好
        if (history_x[TRAIL_SIZE - 1] != 0)
            printf("\033[%d;%dH ", history_y[TRAIL_SIZE - 1], history_x[TRAIL_SIZE - 1]);

        // 将历史坐标后移
        for (int i = TRAIL_SIZE - 1; i > 0; i--)
        {
            history_x[i] = history_x[i - 1];
            history_y[i] = history_y[i - 1];
        }
        history_x[0] = x;
        history_y[0] = y;

        // 更新当前球的位置
        x += dx;
        y += dy;
        if (x <= 1 || x >= width)
            dx = -dx;
        if (y <= 1 || y >= height)
            dy = -dy;

        // 绘制拖尾（颜色由深变浅）
        // 232-255 是灰度，数字越大越亮
        int colors[TRAIL_SIZE] = {250, 245, 240, 236, 233};
        for (int i = 0; i < TRAIL_SIZE; i++)
        {
            if (history_x[i] != 0)
            {
                // 5 表示缓慢闪烁
                printf("\033[%d;%dH\033[38;5;%dm·", history_y[i], history_x[i], colors[i]);
            }
        }

        // 绘制当前的球（高亮白色）
        printf("\033[%d;%dH\033[1;37mO\033[0m", y, x);

        fflush(stdout);
        usleep(40000); // 40ms 帧率更高更平滑
    }

    printf("\033[%d;1H\033[?25h游戏结束！\n", height + 1);
    return 0;
}
```

## 参考链接

- [Wikipedia](https://zh.wikipedia.org/wiki/ANSI%E8%BD%AC%E4%B9%89%E5%BA%8F%E5%88%97)
- [CSDN](https://blog.csdn.net/shanxuanang/article/details/149450865)
