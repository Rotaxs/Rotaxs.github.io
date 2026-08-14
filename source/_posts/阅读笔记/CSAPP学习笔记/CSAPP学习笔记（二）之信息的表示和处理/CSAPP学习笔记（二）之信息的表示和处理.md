---
title: CSAPP学习笔记第 2 章：信息的表示和处理
date: 2026-01-25 15:52:44
description: 本文是笔者对 CSAPP 第二章信息的表示和处理的重点内容的笔记，同时对部分内容如位运算、逻辑门等做适当扩展
tags: [计算机, CSAPP, 深入理解计算机系统, 笔记, 信息, 二进制]
categories: [阅读笔记, CSAPP]
math: true
---

## 寻址和字节顺序

**大端（big endian）序**：最高有效字节在最前面

**小端（little endian）序**：最低有效字节在前面

现在许多新的微处理器使用双端法（bi-endian），但是实际上一旦选择了特定的操作系统，那么字节顺序也会固定下来

**二进制代码是不兼容的**，同一个进程在不同的操作系统上会有不同的编码规则

## 位运算

### 算术右移

我们知道，右移一位相当于原数除以 2（向下取整），比如 `24 = 0001 1000`，那么 `24 >> 1 = 0000 1100 = 12`

原理也很简单，相当于在换算时将 2 的指数全都减了 1，即 $24 = 1 \times 2 ^ 4 + 1 \times 2 ^ 3$ 变成了 $12 = 1 \times 2 ^ 3 + 1 \times 2 ^ 2$

因此，一个奇数右移一位，就会将最低位的 1 舍去，表现出舍去小数部分的 0.5 的效果，即向下取整

而对于负数的右移，则有两种，即**算术右移**和**逻辑右移**，前者是右移后高位补 1，后者则是在右移后高位补 0

在编程中，我们更常用的是算术右移，因为算术右移首先保证负数除以 2 的幂次后不会得到一个正数，其实（比较隐蔽的）是，负数通过算术右移后也可以得到原数除以 2 后的正确结果，比如

$$
[-24]_{\text{原}} = 1001\space1000\\
[-24]_{\text{补}} = 1110\space1000\\
$$

那么，`-24 >> 1 = 1111 0100`，转化为原码即 `1000 1100 = -12`

原理也非常简单，我们设这个负数的绝对值为 $x$，那么其补码对应的十进制数（以 8 位二进制数为例）为 $256 - x$，这是一个正数，右移一位得到 $128 - \dfrac{x}{2}$，去掉最高位的 1，就是 $128 - \dfrac{x}{2} - 2 ^ 7 = -\dfrac{x}{2}$

因此，无论是正数还是负数，算术右移的结果都是将原数除以 2（向下取整）

此外，C 语言标准并没有规定 C 语言中的右移是算术右移还是逻辑右移（大部分是算术右移），这不可避免的会有可移植性问题

Java 则对这两种右移进行区分，默认的 `>>` 是算术右移，而用 `>>>` 表示逻辑右移

### 位运算实用技巧

#### 判断奇偶数

根据二进制的计数规律，奇数的最低位是 1，偶数的最低位是 0，因此可以用类似下面的代码判断奇偶数

```c
int n;
scanf("%d", &n);
if (n & 1) // n & 1 == 1
    printf("Odd\n");
else
    printf("Even\n");
```

#### 交换两个数

利用异或运算的两个性质 `a ^ a = 0`，`a ^ 0 = a`，则可实现两数交换

```c
a = a ^ b;
b = a ^ b; // (a ^ b) ^ b = a
a = a ^ b; // (a ^ b) ^ a = b
```

#### 更多实用技巧

了解更多位运算的实用技巧，可以查看这篇文章 {% post_link 位运算的实用技巧 %}

### 位向量和集合

定义一个位向量为 $a = 1000 1101$，这个向量可以表示集合 $A = \{0, 2, 3, 7\}$，因为 $a$ 的第 0,2,3,7 位分别有一个 1，如此，可以将位运算引入，比如

`a & b` 可以表示集合 $A$ 与集合 $B$ 的交集

`a | b` 可以表示集合 $A$ 与集合 $B$ 的并集

而 `~a` 可以表示补集

### 复合逻辑门

#### 逻辑门

**基本逻辑门**：与门（AND），或门（OR），非门（NOT）

**复合逻辑门**：与非门（NAND），或非门（NOR），异或门（XOR），同或门（XNOR）

使用基本逻辑门，可以表达出所有的复合逻辑门

**异或门（XOR）**：输入相同则为假；不同则为真。

- 假设输入为 A 和 B，也就是说，只要 A 为 1，B 为 0 或者 A 为 0，B 为 1 时，$A \text{ XOR } B$ 的结果为真

**同或门（XNOR）**：异或门的取反，输入相同则为真；不同则为假

- 假设输入为 A 和 B，也就是说，只要 A 为 1，B 为 1 或者 A 为 0，B 为 0 时，$A \text{ XOR } B$ 的结果为真

从而可以得到下面的表达式

$$
A \text{ NAND } B = \overline{A \cdot B}\\
A \text{ OR } B = \overline{A + B}\\
A \text{ XOR } B = A\bar{B} + \bar{A}B\\
A \text{ XNOR } B = AB + \bar{A}\bar{B}
$$

此外，与非门（NAND）和或非门（NOR）被称为**全能门**，因为使用其中之一可以构建所有的逻辑门

#### bis 和 bic

bis 和 bic 都同时接收一个数据字 $x$ 和一个掩码字 $m$，区别在于

**bis 位设置**：在 $m$ 为 $1$ 的每个位置上，将 $x$ 对应的位设置为 $1$，得到结果 $z$

**bic 位清除**：在 $m$ 为 $1$ 的每个位置上，将 $x$ 对应的位设置为 $0$，得到结果 $z$

可以定义两个函数 `bis(x, m)` 和 `bic(x, m)`，那么不难看出 

$$
\text{bis}(A, B) = A \text{ OR } B\\
\text{bic}(A, B) = A \text{ AND } \bar{B}
$$

使用 `bis` 和 `bic` 可以实现所有的逻辑门，或门直接用 `bis`，而非门和与门可以表示如下

$$
\text{NOT } A = (\text{NOT } A) \text{ AND } (\text{NOT } 0)\\
A \cdot B = (\text{NOT } (\text{NOT } A)) \cdot B
$$

代码如下

```c
#include <stdio.h>
#include <stdint.h>

typedef uint8_t byte;

void print_binary(byte n)
{
    for (int i = 7; i >= 0; i--)
    {
        printf("%d", (n >> i) & 1);
        if (i == 4)
            putchar(' ');
    }
}

byte bis(byte x, byte m) { return x | m; }
byte bic(byte x, byte m) { return x & (byte)~m; } // 避免取反时整型提升

byte not_gate(byte A) { return bic(0xFF, A); }
byte and_gate(byte A, byte B) { return bic(B, not_gate(A)); }
byte or_gate(byte A, byte B) { return bis(A, B); }
byte xor_gate(byte A, byte B) { return bis(bic(A, B), bic(B, A)); }
byte xnor_gate(byte A, byte B) { return not_gate(xor_gate(A, B)); }
```

## 整数表示

### 整数的编码

**无符号整数的编码**：B 即 Binary，2 与单词 to 同音，U 表示 Unsigned int，w 表示二进制位数

$$
B2U_{w}(\vec{x}) \coloneqq \sum_{i = 0}^{w - 1}x_i2^i
$$

**补码编码**：补码（Two's-complement），这里的 T 取自补码的首字母

$$
B2T_{w}(\vec{x}) \coloneqq -x_{w - 1} 2^{w - 1} + \sum_{i = 0}^{w - 2}x_i 2^i
$$

最高有效位 $x_{w-1}$ 称为符号位，它的权重为 $-2^{w-1}$

- 符号位为 1 时，表示值为负
- 符号位为 0 时，表示值为正

{% note primary modern %}
1. 补码的范围是不对称的：$|TMin| = |TMax| + 1$
2. 最大的无符号数值比补码的最大值的两倍大一点：$UMax = 2TMax + 1$
{% endnote %}

有符号数还有如下两种表示

**反码（Ones' Complement）**：$B2O_{w}(\vec{x}) = -x_{w-1}(2^{w-1} - 1) + \displaystyle\sum_{i=0}^{w-2}x_i2^i$

**原码（Sign-Magnitude）**：$B2S_{w}(\vec{x}) = (-1)^{x_{w-1}} \cdot \left(\displaystyle\sum_{i=0}^{w-2}x_i2^i\right)$

在现在的计算机中，已经不再使用这两种编码方式编码有符号整数

但是在浮点数的编码中，我们可以看到使用原码编码

#### C 语言中确定大小的整数类型

32 位和 64 位程序的数据类型的大小是不一样的，比如：在 32 位程序中，`int` 类型数据的大小是 2 字节，而在 64 位程序中，`int` 类型的数据的大小是 4 字节

因此，为了跨平台，C 语言提供了`stdint.h`这一标准库

其中定义了许多如`intn_t`格式的类型，比如`int32_t`表示 32 位整数，`int8_t`表示 8 位整数

以及表示这些数据类型的范围的宏，如`INTN_MIN`，`INTN_MAX`，`UINTN_MAX`等

在用 `printf` 进行输出时，还可以使用`inttypes.h`标准库（这个标准库包含了`stdint.h`）中的宏`PRId64`，`PRId32`，`PRIu64`等表示格式化字符，比如

```c
#include <stdio.h>
#include <inttypes.h>

int main() {
    int64_t my_val = 1234567890123;
    // 注意：宏不在引号里面，它会被替换成 "lld" 或 "ld"
    // 实际编译时会被拼接成 "The value is %lld\n"
    printf("The value is %" PRId64 "\n", my_val);
    return 0;
}
```

#### 不同类型整数比较的风险

下面这段代码在很多程序中都会出现

```c
for (int i = 10; i >= 0; i--)
{
    /* code */
}
```

但是也有可能会写成下面这样

```c
for (unsigned i = 10; i >= 0; i--)
{
    /* code */
}
```

如果把 `int` 改为 `unsigned`，上面的循环就会变成死循环

这时因为 `int` 在与 `unsigned int` 进行比较时会发生类型提升，导致最终变为两个 `unsigned` 类型的数据的比较

模拟上面的循环，当 `i = 0` 时，执行循环体中的代码后，再执行 `i--`，这时 `i = -1`

但是由于 `i` 是一个无符号整数，发生下溢出，比较中的 `i` 变为了 `4294967296 - 1`，因此循环不会终止

此外，我们常用的 `sizeof()` 函数返回的 `size_t` 类型也是无符号整数，因此在比较时也会遇到一定问题

#### 扩展一个整数的位表示

如果将一个 8 位的整数提升为一个 16 位的整数，得到的结果和原数相同，比如

```c
char a = 10;
short b = a; // 10
```

对于无符号整数，其底层表现就是在二进制表示前补 8 个 0

而对于**有符号整数，则补最高位**（类似算术右移），即

$$
\textcolor{red}{\boxed{B2T_{w + k}([x_{w - 1}, x_{w-1}, \cdots, x_{w - 1}, x_{w - 2}, x_{w - 3}, \cdots, x_{1}, x_{0}]) = B2T_{w}([x_{w - 1}, x_{w - 2}, x_{w - 3}, \cdots, x_{1}, x_{0}])}}
$$

证明只需使用数学归纳法，当 $k = 1$ 时

$$
\begin{align}
B2T_{w + 1}([x_{w - 1}, x_{w - 1}, x_{w}, \cdots, x_{1}, x_{0}]) & = -x_{w - 1}\cdot 2^{w} + x_{w - 1}\cdot 2^{w - 1} + \sum_{i = 0}^{w - 2}x_{i}\cdot2^{i}\\
 & = -x_{w - 1}\cdot 2^{w} + \sum_{i = 0}^{w - 2}x_{i}\cdot2^{i}\\
 & = B2T_{w}([x_{w - 1}, x_{w}, \cdots, x_{1}, x_{0}])
\end{align}
$$

因此 $k = 1$ 时等式成立，后易证当 $k = l$ 等式成立时 $k = l + 1$ 时等式也成立，故等式成立

#### 数字截断

当将一个大类型转化为小类型（如将 `short` 转为 `char`）时，会发生截断

截断的规则是舍弃高位保留低位，如

```c
short a = 0b1000000100001111; // 负数截断后符号与原数也无关
char b = a;                   // 15 = 0b00001111
```

而在十进制表现上，则是取模，无符号整数的推导如下

$$
\begin{align}
B2U_{w}([x_{w - 1}, x_{w}, \cdots, x_{1}, x_{0}]) \text{ mod } 2^{k} & = \left(\sum_{i = 0}^{w - 1}x_{i}\cdot2^{i}\right)\text{mod} 2^{k}\\
 & = \left(x_{w - 1}\cdot2^{w - 1}+ \cdots + x_{k}2^{k} + \sum_{i = 0}^{k}x_{i}2^{i}\right)\text{mod }2^{k}\\
 & = \sum_{i = 0}^{k}x_{i}2^{i}\\
 & = B2U_{k}([x_{k-1}, x_{k-2}, \cdots, x_{1}, x_{0}])
\end{align}
$$

对于无符号整数，就有

$$
\textcolor{red}{\boxed{B2U_{w}([x_{w - 1}, x_{w}, \cdots, x_{1}, x_{0}])\text{ mod }2^{k} = B2U_{k}([x_{k-1}, x_{k-2}, \cdots, x_{1}, x_{0}])}}
$$

而如果是 $w$ 位有符号整数 $x$，则需将经过上面的运算得到的无符号整数再转化为有符号整数 $x'$，即

$$
\textcolor{red}{\boxed{x' = U2T_{k}(x\text{ mod }2^k)}}
$$
