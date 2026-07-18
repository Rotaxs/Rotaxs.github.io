---
title: 深入浅出 C 语言标准 I/O
date: 2025-12-30 11:11:08
description: 本文主要介绍 C 语言中的标准 I/O
series: C/C++
tags: [计算机, C语言, I/O, 缓冲区, 输入流, 输出流]
categories: [计算机, C语言]
cover: /assets/covers/clanguage.png
---

## C 语言 I/O 的本质

> **I/O（input/output）**，即输入输出，通常指数据在存储器或其他周边设备之间的输入输出
> - **输入**指的是数据从外部设备（如键盘、磁盘、网卡）拷贝到内存中
> - **输出**指的是数据从内存拷贝到外部设备中

由于外部设备和内存的不同的规范，C 语言不太可能为每一套设备都写一套 I/O，因此，C 语言 I/O 不直接操作外部设备和内存，而是操作**流（Stream）**

在 C 语言中，流的表现形式为`FILE*`，`FILE`实际上是一个结构体，里面记录了文件的读写位置，缓冲区状态，以及错误标记等。同时，C 语言通过`FILE*`操作流，C 语言的标准输入输出库（`stdio.h`）中通过`FILE*`为我们定义了三种常用的流

- `stdin`：标准输入流（Standard Input Stream），默认指向键盘
    - 典型函数：`scanf()`、`getchar()`
- `stdout`：标准输出流（Standard Output Stream），默认指向显示器，
    - 典型函数：`printf()`、`putchar()`
- `stderr`：标准错误流（Standard Error Stream），默认指向显示器
    - 典型函数：`perror()`

## 标准输入输出

### 格式化 I/O

#### 格式化输出`printf()`

**格式化输出**使用`printf()`（print format），其函数原型一般定义如下

```C
int __cdecl printf( const char * __restrict__ _Format,... );
```

函数还有一个返回值，表示成功打印的字符总数，如果出错，会返回一个负数

关于格式化字符，可以参考笔者的这篇文章 {% post_link 计算机/C语言/C语言中的格式化输出和转义字符/C语言中的格式化输出和转义字符 C语言中的格式化输出和转义字符 %}

有关格式化字符串，我们还可以了解下面两个函数

```C
int sprintf( char* restrict buffer, const char* restrict format, ... );
int snprintf( char* restrict buffer, size_t bufsz, const char* restrict format, ... );
```

这两个函数可以将格式化字符串存入到字符串`buffer`中，区别是`snprintf()`可以指定存入的长度，如果写入失败，则返回`EOF`

```C
#include <stdio.h>

int main()
{
    char buf[20];
    // 使用 sprintf（不安全，可能溢出）
    sprintf(buf, "%d %s %.1f", 1001, "zhangsan", 99.5);
    printf("sprintf结果: %s\n", buf);
    // 使用 snprintf（安全，限制长度）
    snprintf(buf, sizeof(buf), "%d %s %.1f", 1001, "zhangsan", 99.5);
    printf("snprintf结果: %s\n", buf);
    return 0;
}
```

#### 格式化输入`scanf()`

**格式化输入**使用`scanf()`（scan format），其函数原型如下

```C
int scanf( const char *restrict format, ... );
```

函数的返回值表示成功接收值的变量的个数

一般来说，我们在使用`scanf()`函数时，都要检查变量是否都被分配了值，比如

```C
int a, b;
while (1)
{
    if (scanf("%d %d", &a, &b) != 2)
    {
        // 输出提示信息
    }
    else
        break;
}
```

**`scanf()`会忽略[空白字符](https://zh.wikipedia.org/zh-cn/%E7%A9%BA%E7%99%BD%E5%AD%97%E5%85%83)**（如空格，换行，制表符等），如果读取数字，还会忽略前导 0，并从第一个数字字符（0-9）开始读取（并转化为有效数字），到下一个空白字符结束

以下面的代码举例

```C
#include <stdio.h>

int main()
{
    int num;
    int a = scanf("%d", &num);
    printf("num = %d, a = %d", num, a);
    return 0;
}
```

如果输入`a`，那么输出为

```BASH
num = -469536704, a = 0
```

这里 `num` 的值与字符 `a` 没有任何关系，它表示一个垃圾值，`a = 0`表示`num`没能被分配一个值

如果输入` 010`，那么输出为

```BASH
num = 10, a = 1
```

可以看到，`scanf()`忽略了前导空白字符和前导 0，而直接读取了 10，`a=1`表示成功读取

### 字符 I/O

对于字符的输出输出，我们不需要使用`printf()`和`scanf()`，毕竟用它们处理字符过于“大材小用”了

比如在输出换行时，可以直接采用`putchar('\n')`，在读取一个字符时，也可以直接使用`char a = getchar()`，这样会使得代码更加简洁

这里需要注意的是，`putchar()`和`getchar()`返回或接收的都是`int`类型，可以直接对应字符的 ASCII 码值，但是当输出或输入失败的时候，会返回`EOF`（一般是 -1）

> **EOF（End Of File）**：当`scanf()`，`getchar()`等读取数据时发现没东西可读时，会返回 EOF，这时一个定义在`stdio.h`中的宏，通常为 -1。在 Windows 中，我们可以通过`Ctrl + Z`（Linux/MaxOS 是`Ctrl + D`）模拟发送一个 EOF

接下来可移步至 [缓冲机制](#buffer)

### 字符串 I/O

#### 字符串输入

当我们想读取含有空格的字符串时，`scanf()`似乎不太能实现，通过循环 + `getchar()` 又过于繁琐，这里我们可以使用 `fgets()` 函数，其函数原型如下

```C
char* fgets( char* restrict str, int count, FILE* restrict stream );
```

参数

- `str`：字符串
- `count`：字符数组的长度（包括最后的`\0`，即字符串的长度 + 1）
- `stream`：输入流（标准输入流或文件流）

如果读取成功，返回`str`，否则返回空指针

需要注意的是，有的读者可能见过`gets()`函数，但这个函数及不安全，且在现代 C 标准中已经被废弃了

#### 字符串输出

字符串输出可以使用`puts()`和`fputs()`函数，它们的函数原型如下

```C
int puts( const char* str );
int fputs( const char* restrict str, FILE* restrict stream );
```

这两个函数最大的区别是前者不需要指定输出流（默认为`stdout`）

除此之外，还需要知道的是，它们都以`\0`作为字符串的结束，但是`puts()`会在结束时多加一个`\n`

如果输出成功，返回一个非负数，否则返回`EOF`

## 文件输入输出

### 打开和关闭文件

使用`fopen()`函数可以创建一个文件流指针（全缓冲，如果失败，返回空指针），函数原型如下

> 关于缓冲机制，参见 [缓冲机制](#buffer)

```C
FILE *fopen( const char *restrict filename, const char *restrict mode );
```

- `filename`：要打开的文件的路径
- `mode`：文件的打开方式，常用的打开方式如下

|模式|描述|
|:--:|:--|
|`r`|只读模式|
|`w`|只写模式，如果文件不存在，则创建该文件；如果存在，则会将原文件清空|
|`a`|追加模式，如果文件不存在，则创建该文件|
|`r+`|读写模式|
|`w+`|读写模式，果文件不存在，则创建该文件；如果存在，则会将原文件清空|
|`a+`|读写模式，果文件不存在，则创建该文件；如果存在，则在原文件后追加内容|

特殊的，如果处理的是二进制文件，则在后面加`b`，如`rb`，`r+b`（`rb+`）

在文件操作结束后，要用`fclose()`函数关闭文件，将缓冲区数据写入磁盘，如

```C
FILE *fp = fopen("./test.txt", "w");
// 好习惯
if (fp == NULL)
    perror("打开文件失败");

// 操作文件......

fclose(fp);
```

### 读取和写入文件

在前面的标准输入输出部分，我们`fgets()`和`fputs()`可以指定输入流和输出流，因此，只要将流换成文件流就可以实现文件的 I/O

此外，我们还可以用`fprintf()`和`fscanf()`进行格式化读取和写入，它们的函数原型如下

```C
int fprintf( FILE* restrict stream, const char* restrict format, ... );
int fscanf( FILE *restrict stream, const char *restrict format, ... );
```

它们的用法与`printf()`和`scanf()`一样，只是将第一个参数换成了流（还要注意`FILE*`的模式的对应），比如

```C
#include <stdio.h>

int main()
{
    char *str = "This is a apple";
    // 用 只写 的方式打开
    FILE *fp = fopen("./test.txt", "w");
    if (fp == NULL)
        perror("打开文件失败");
    fprintf(fp, "%s\n", str);
    fclose(fp);

    char thing[20];
    // 用 只读 的方式打开
    fp = fopen("./test.txt", "r");
    if (fp == NULL)
        perror("打开文件失败");
    fscanf(fp, "This is a %s", thing);
    fclose(fp);
    printf("I know it is a %s\n", thing);

    return 0;
}
```

这个程序的输出为

```BASH
I know it is a apple

```

### 读取和写入二进制文件

读写二进制文件，我们用到下面两个函数

```C
size_t fread( void *restrict buffer, size_t size, size_t count, FILE *restrict stream );
size_t fwrite( const void* restrict buffer, size_t size, size_t count, FILE* restrict stream );
```

参数

- `buffer`：表示读取/传入数据的指针
- `size`：表示每个数据的大小
- `count`：表示数据的个数
- `stream`：表示流

如果成功，返回读取/写入的数据的个数

可以看出，这两个函数适合存大量相同数据，比如数组，参见下面的代码

```C
#include <stdio.h>

int main()
{
    int arr[5] = {5, 4, 3, 2, 1};
    FILE *fp = fopen("./test.dat", "w");
    // arr 是第一个元素的地址
    fwrite(arr, sizeof(arr[0]), 5, fp);
    fclose(fp);
    return 0;
}
```

得到的`test.dat`文件内容如下

{% asset_img 二进制.png 图一：test.dat %}

## 缓冲机制

<p id="buffer"></p>

### 缓冲区

> **缓冲区**（buffer）是内存空间的一部分。也就是说，在内存空间中预留了一定的存储空间，这些存储空间用来缓冲输入或输出的数据，这部分预留的空间就叫做缓冲区，显然缓冲区是具有一定大小的。
> 缓冲区根据其对应的是输入设备还是输出设备，分为**输入缓冲区**和**输出缓冲区**。

实际上，我们调用`printf()`，数据只是被内存拷贝到了`FILE`结构体所指向的一块内存区域（缓冲区），此时，操作系统和硬件根本不知道这些数据的存在

接下来只要刷新缓冲区（或缓冲区满了），例如调用函数`fflush(stdout)`，内容就可以被输出到控制台上

**为什么要设置缓冲区？**

1. 输入设备的角度：缓冲区中的数据可以作为一整个“块”发送到指定位置，比逐个发送数据要节约时间，同时也可以减少读写次数
2. 输出设备的角度：当输出设备的运行很慢时，高速设备可以直接将数据发送到缓冲区，然后输出设备直接从缓冲区读取数据即可，如打印机

> 可以把缓冲区理解为一个特定大小的字符串，其大小通常为 512 字节或它的倍数

### 缓冲区的类型

- **全缓冲（Fully Buffered）**：只有缓冲区彻底满了，才会进行实际的 I/O
    - 文件的读写就是全缓冲，比如打开磁盘文件的`fopen()`
    - 因为磁盘的读写非常缓慢，并且反复的读写会减少磁盘的寿命，因此，`fopen()`默认分配一个较大的缓冲区（由`FILE*`指向）
    - 因此，如果`fopen()`后没有`fclose()`，数据就会永远停留在缓冲区；反之，如果调用`fclose()`，即使缓冲区没满，数据也会从缓冲区写入磁盘
- **行缓冲（Line Buffered）**：遇到换行符或缓冲区满时，才进行实际 I/O
    - `stdout`就是行缓冲，因此每次`printf()`最后加一个`\n`实际上也表示将数据发送到控制台
    - 但是，现在很多系统会自动刷新缓冲区，导致即使不加`\n`，通过`printf`进入缓冲区的数据也会即刻显示在控制台（即编译器可能会根据场景，自动将`stdout`设置为无缓冲）
- **无缓冲（Unbufferd）**：数据立即发送，不经过任何停留
    - 标准错误流`stderr`就是无缓冲，这样有利于将错误尽快的显示出来

### 一个较为复杂的缓冲机制的例子

想象一个场景：我们在一个文本编辑器中输入文字

接下来我们探究这里面的缓冲机制

1. 首先我们按下键盘的一个字符（此时键盘是输入设备）
2. 操作系统的缓冲区接收到这个字符的数据
3. 文本编辑器软件在系统缓冲区中拿到这个数据（此时文本编辑器是输出设备）
4. 文本编辑器将这个数据加载（行缓冲）到自己的缓冲区（此时文本编辑器是输入设备）
5. 文本编辑器通过图形接口将这个字符在显示上画（行缓冲）出来（此时显示器是输出设备）
6. 保存文件时，文本编辑器将字符写入（全缓冲）磁盘文件（此时硬盘是输出设备）

### C 语言中的缓冲区“陷阱”

前面我们提到过，`scanf()`在读取到空白字符之前就会停止读取，因此，我们输入完之后的回车就会滞留在缓冲区中，当我们下次读取字符时，就有可能出错

因此，当我们每次读完字符后（尤其是字符和字符串），需要养成刷新缓冲区的习惯

我们可以用如下代码实现缓冲区的刷新

```C
void flush_buffer()
{
    int ch;
    while ((ch = getchar()) != '\n' && ch != EOF);
}
```

注意这里的`ch`是`int`而不是`char`

需要注意的是，`fflush(stdin)`这种写法是未定义的，因此不建议在代码中写这样的语句

### 使用`setvbuf()`函数设置流的缓冲模式

运行下面的代码

```C
#include <stdio.h>
#include <unistd.h>
int main()
{
    printf("Hello world");
    sleep(2);
    return 0;
}
```

如果你发现，程序先输出`Hello world`，然后停了 2 秒程序再结束，说明你的`stdout`是无缓冲

我们可以通过下面的函数将其改回行缓冲

```C
int setvbuf( FILE *restrict stream, char *restrict buffer, int mode, size_t size );
```

参数 

- `stream`：流
- `buffer`：自定义缓冲区，也可以传空指针
- `mode`：缓冲模式
    - `_IOFBF`：全缓冲
    - `_IOLBF`：行缓冲
    - `_IONBF`：无缓冲
- `size`：缓冲区大小
    - 若`buffer`为空指针，则**重设默认缓冲区的大小为`size`**
    - 若`buffer`为非空指针，则将缓冲区设置为由`buffer`开始，大小为`size`的区域

设置成功，返回 0；否则返回非 0

具体操作方法如下

```C
#include <stdio.h>
#include <unistd.h>
int main()
{
    // 自定义缓冲区
    const int N = 1024;
    char buf[N];
    setvbuf(stdout, buf, _IOLBF, N);
    printf("Hello world");
    sleep(2);
    // 刷新缓冲区
    fflush(stdout);
    return 0;
}
```

这时会发现程序启动后先停了 2 秒，然后才输出`Hello world`

## 参考链接

- [Wikipedia - I/O](https://zh.wikipedia.org/wiki/I/O)
- [Wikipeida - 空白字符](https://zh.wikipedia.org/zh-cn/%E7%A9%BA%E7%99%BD%E5%AD%97%E5%85%83)
- [cppreference - FILE](https://en.cppreference.com/w/c/io/FILE)
- [cppreference - fopen, fopen_s](https://en.cppreference.com/w/c/io/fopen)
- [cppreference - printf, fprintf, sprintf, snprintf, printf_s, fprintf_s, sprintf_s, snprintf_s](https://en.cppreference.com/w/c/io/fprintf)
- [cppreference - scanf, fscanf, sscanf, scanf_s, fscanf_s, sscanf_s](https://en.cppreference.com/w/c/io/fscanf)
- [cppreference - fgets](https://en.cppreference.com/w/c/io/fgets)
- [cppreference - fputs](https://en.cppreference.com/w/c/io/fputs.html)
- [cppreference - fwrite](https://en.cppreference.com/w/c/io/fwrite)
- [cppreference - fread](https://en.cppreference.com/w/c/io/fread)
- [cppreference - setvbuf](https://cppreference.cn/w/c/io/setvbuf)
- [缓冲区(buffer)与缓存(cache)](https://geekdaxue.co/read/thsea@linux/5a3611b1-2916-488f-8be9-6995d2446032#9cdz5p)
- [CSDN - 深入理解C语言中的fread与fwrite函数](https://blog.csdn.net/weixin_42402664/article/details/150553213)