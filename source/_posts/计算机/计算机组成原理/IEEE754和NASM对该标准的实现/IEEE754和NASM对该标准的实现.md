---
title: IEEE 754 和 NASM 对该标准的实现
date: 2025-12-15 18:51:06
description: 本文介绍 IEEE 754 标准，并通过 the Netwide Assembler 汇编器对该标准的实现源码加深对该标准的理解
series:
tags: [计算机, 计算机组成原理, IEEE 754, NASM, Netwide Assembler, 源码分析, C语言]
categories: [计算机, 计算机组成原理]
cover: /assets/covers/theory.png
---

## IEEE 754 基本介绍

> IEEE 二进制浮点数算术标准（IEEE 754）定义了表示浮点数的格式（包括 -0）与反常值（denormal number），无穷（inf）与非数值（NaN）以及这些数值的浮点数运算符；它也指明了四种数值舍入规则和五种例外状况

总的来说，IEEE 754 定义了

- 表示浮点数的格式
  - 单精确度（32 位，如 C 语言中的 float）
  - 双精确度（64 位，如 C 语言中的 double）
  - 延伸单精度（43 位以上， C 语言中没有定义）
  - 延伸双精度（79 位以上，通常为 80 位， 如部分 C 语言编译器定义的 long double）
- 反常值、无穷、非数值
- 浮点数运算规则
- 数值舍入的规则
- 异常处理

### 浮点数格式

实际上 IEEE 754 定义了四种格式，除了单精确度，其他都没有强制要求需要定义

且在实际应用中，还会有一些其他常用的格式，比如在 NASM 中定义了下面这些浮点数格式，且附带了一段说明介绍这些格式

```C
/*
 * The 16- and 128-bit formats are expected to be in IEEE 754r.
 * AMD SSE5 uses the 16-bit format.
 *
 * The 32- and 64-bit formats are the original IEEE 754 formats.
 *
 * The 80-bit format is x87-specific, but widely used.
 *
 * The 8-bit format appears to be the consensus 8-bit floating-point
 * format.  It is apparently used in graphics applications.
 *
 * The b16 format is a 16-bit format with smaller mantissa and larger
 * exponent field.  It is effectively a truncated version of the standard
 * IEEE 32-bit (single) format, but is explicitly supported here in
 * order to support proper rounding.
 *
 * This array must correspond to enum floatize in include/nasm.h.
 * Note that there are some formats which have more than one enum;
 * both need to be listed here with the appropriate offset into the
 * floating-point byte array (use for the floatize operators.)
 *
 * FLOAT_ERR is a value that both represents "invalid format" and the
 * size of this array.
 */
```

| NASM 标识符  |      标准或来源      | 位数 |                                            关键特性/用途                                             |
| :----------: | :------------------: | :--: | :--------------------------------------------------------------------------------------------------: |
|  `FLOAT_8`   |     行业共识格式     |  8   |                   用于图形学等对内存/带宽极度敏感的场景，非官方标准但为事实标准。                    |
|  `FLOAT_16`  | IEEE 754r (754-2008) |  16  |          标准半精度，被 AMD SSE5 及现代 AVX-512 FP16 等指令集支持，用于 GPU 和嵌入式系统。           |
| `FLOAT_B16`  | 行业标准 (Bfloat16)  |  16  | 指数位与 `float32` 相同，动态范围大但精度较低。NASM 原生支持并执行正确舍入，广泛用于 AI 训练和推理。 |
|  `FLOAT_32`  |   IEEE 754 (1985)    |  32  |                原始标准单精度，对应 C/C++ `float`，SSE/AVX 指令集核心，通用计算基石。                |
|  `FLOAT_64`  |   IEEE 754 (1985)    |  64  |            原始标准双精度，对应 C/C++ `double`，SSE/AVX 指令集核心，科学和工程计算首选。             |
| `FLOAT_80M`  |  x87 FPU (内存格式)  |  80  |                  x87 扩展精度在内存中的存储格式（可能被填充），用于与内存交换数据。                  |
| `FLOAT_80E`  | x87 FPU (寄存器格式) |  80  |                    x87 FPU 寄存器内部“真实”的 80 位格式，提供高精度中间计算结果。                    |
| `FLOAT_128L` | IEEE 754r (754-2008) |  64  |                       128 位浮点数的低 64 位部分，用于软件模拟 128 位浮点数。                        |
| `FLOAT_128H` | IEEE 754r (754-2008) |  64  |             128 位浮点数的高 64 位部分，与 `FLOAT_128L` 共同构成一个完整的 128 位浮点数              |

NASM 源码中还定义了这些格式对应的各种基本信息如下

```C
const struct ieee_format fp_formats[FLOAT_ERR] = {
    {  1,   3, 0,  4, 0 },         /* FLOAT_8 */
    {  2,  10, 0,  5, 0 },         /* FLOAT_16 */
    {  2,   7, 0,  8, 0 },         /* FLOAT_B16 */
    {  4,  23, 0,  8, 0 },         /* FLOAT_32 */
    {  8,  52, 0, 11, 0 },         /* FLOAT_64 */
    { 10,  63, 1, 15, 0 },         /* FLOAT_80M */
    { 10,  63, 1, 15, 8 },         /* FLOAT_80E */
    { 16, 112, 0, 15, 0 },         /* FLOAT_128L */
    { 16, 112, 0, 15, 8 }          /* FLOAT_128H */
};
```

其中，每个数组从左到右依次为

1. `bytes` 浮点格式的总字节数
2. `mantissa` 尾数的位数
3. `explicit` 是否显式地显示整数位的 1
4. `exponent` 阶码的位数
5. `offset` 偏移量

对于偏移量的解释如下：

注意到在上面的注释中有这样一段话

```C
/*
 * Note that there are some formats which have more than one enum;
 * both need to be listed here with the appropriate offset into the
 * floating-point byte array (use for the floatize operators.)
 */
```

比如 `FLOAT_128L` 和 `FLOAT_128H`，实际上，这两种格式合并在一起才表示一个浮点数，`FLOAT_128L` 表示该浮点数的低 64 位，`FLOAT_128H` 表示该浮点数的高 64 位，因此 `FLOAT_128H` 需要一个 8 bytes 的偏移量

而对于 `FLOAT_80E` 和 `FLOAT_80M`，前者表示浮点数的符号和阶码，后者表示尾数，注意到尾数有 63 位，因此阶码的偏移量就是 8 bytes（浮点数在内存中的存储采用**小端序**）

> **小端序**：数据的 LSB（最低有效字节/位 Least Significant Byte/Bit，这里特指字节）存储在内存的最低地址


## 参考

- [Wikipedia - IEEE_754](https://zh.wikipedia.org/wiki/IEEE_754)
