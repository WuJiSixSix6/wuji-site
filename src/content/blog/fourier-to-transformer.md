---
title: 从傅里叶变换到 Transformer 注意力机制：数学直觉与代码实现
subtitle: 当频域分解的几何美学遇见高维语义空间的内积投影
summary: 拆解现代信号处理与大语言模型背后共通的数学核心——内积与基展开。本文从欧拉公式与傅里叶变换的直觉出发，推导缩放点积注意力机制与多头注意力的数学本质，并给出清晰可运行的 PyTorch 实现与 B 站经典可视化讲解。
pubDate: 2026-10-18
category: 数学与AI
tags:
  - Transformer
  - 数学之美
  - DeepLearning
  - PyTorch
  - 傅里叶变换
featured: true
pinned: false
coverTheme: jade-nebula
---

在计算机科学与应用数学的交汇处，有两座横跨半个世纪却惊人相似的丰碑：一座是将时域信号拆解为纯粹频率的**傅里叶变换（Fourier Transform）**，另一座是驱动当代大语言模型的 **Transformer 自注意力机制（Self-Attention）**。

表面上看，前者属于经典信号处理，后者属于现代深度学习；但如果剥开术语的外壳，二者共享着同一种优雅的几何语言——**在高维向量空间中，用内积度量相似度，并以权重组合还原信息**。

## 一、傅里叶变换：把时间缠绕成圆

理解傅里叶变换最美妙的方式，是从欧拉公式开始：

$$
e^{-i 2\pi f t} = \cos(2\pi f t) - i\sin(2\pi f t)
$$

给定一个随时间变化的信号 $g(t)$，连续傅里叶变换（CFT）将其映射至频域：

$$
\hat{g}(f) = \int_{-\infty}^{+\infty} g(t)\, e^{-i 2\pi f t}\,\mathrm{d}t
$$

从几何视角来看，$g(t)e^{-i 2\pi f t}$ 相当于把信号以频率 $f$ 缠绕在复平面的单位圆上。当缠绕频率 $f$ 恰好与信号内部潜藏的某个周期共振时，所有采样点会偏向同一侧，积分后的质心就会显著偏离原点，形成频谱上的尖峰。

而在离散数字世界（长度为 $N$ 的序列 $x_0, x_1, \dots, x_{N-1}$）中，这一操作退化为**离散傅里叶变换（DFT）**：

$$
X_k = \sum_{n=0}^{N-1} x_n \, e^{-i \frac{2\pi}{N} k n}, \qquad k = 0, 1, \dots, N-1
$$

> [!NOTE] 统一视角：内积即相关性
> 令基向量 $\phi_k[n] = e^{i \frac{2\pi}{N} kn}$，那么 $X_k = \langle x, \phi_k \rangle$ 本质上就是输入信号与一组**正交复指数基**做内积投影。

## 二、从固定正交基到数据驱动的注意力

傅里叶变换的基函数是预先固定好的正弦/余弦波；而自然语言、代码与推理链条的结构远比周期信号复杂。Transformer 的天才之处在于：**让模型自己从数据中学习查询（Query）、键（Key）和值（Value）三个线性投影空间**。

给定输入序列隐状态矩阵 $X \in \mathbb{R}^{L \times d_{\text{model}}}$：

$$
Q = X W_Q, \qquad K = X W_K, \qquad V = X W_V
$$

缩放点积注意力（Scaled Dot-Product Attention）定义为：

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}} + M\right)V
$$

### 为什么要除以 $\sqrt{d_k}$？

假设 $q, k \in \mathbb{R}^{d_k}$ 的每个分量独立同分布，均值为 $0$、方差为 $1$，则点积 $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$ 的统计特性为：

$$
\mathbb{E}[q \cdot k] = 0, \qquad \text{Var}(q \cdot k) = d_k
$$

当维度 $d_k$ 较大（例如 $d_k = 128$）时，点积的数值范围会扩大到 $\pm 11$ 以上，直接送入 $\text{softmax}$ 会导致梯度迅速饱和（接近 0）。除以 $\sqrt{d_k}$ 正好把方差重新归一化回 $1$，让反向传播始终保持健康。

### 多头注意力（Multi-Head Attention）

单一注意力头就像只观察一个频段；将特征切分为 $h$ 个子空间并行计算，等价于同时在语法结构、长距离指代、语义关联等多个维度上建立滤波通道：

$$
\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h)\, W_O
$$

## 三、可视化直觉：B 站经典讲解

如果你希望在 25 分钟内用极致的动画直觉打通 Transformer 与 Attention 的内部数据流，强烈推荐观看 3Blue1Brown 的这期经典讲解：

::bilibili[BV13z421U7cs]{title="【3Blue1Brown】GPT 是什么？直观可视化解释 Transformer 与注意力机制" p=1}

## 四、极简且数值稳定的 PyTorch 实现

下面用不到 50 行现代 PyTorch 代码实现支持因果掩码（Causal Mask）的多头自注意力模块：

```python
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class CausalSelfAttention(nn.Module):
    def __init__(self, d_model: int, n_heads: int, dropout: float = 0.1):
        super().__init__()
        assert d_model % n_heads == 0, "d_model 必须能被 n_heads 整除"
        self.n_heads = n_heads
        self.head_dim = d_model // n_heads
        self.qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.proj = nn.Linear(d_model, d_model, bias=False)
        self.dropout = dropout

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, C = x.shape
        qkv = self.qkv(x).view(B, T, 3, self.n_heads, self.head_dim)
        q, k, v = qkv.unbind(dim=2)

        # (B, n_heads, T, head_dim)
        q, k, v = q.transpose(1, 2), k.transpose(1, 2), v.transpose(1, 2)

        # 手动推导等价形式：scale = 1 / sqrt(d_k)
        scale = 1.0 / math.sqrt(self.head_dim)
        scores = (q @ k.transpose(-2, -1)) * scale

        # 因果掩码：防止当前位置偷看未来 token
        causal_mask = torch.triu(
            torch.ones(T, T, device=x.device, dtype=torch.bool), diagonal=1
        )
        scores = scores.masked_fill(causal_mask, float("-inf"))

        attn = F.softmax(scores, dim=-1)
        attn = F.dropout(attn, p=self.dropout, training=self.training)

        out = (attn @ v).transpose(1, 2).contiguous().view(B, T, C)
        return self.proj(out)
```

> [!TIP] 工程落地优化
> 在生产训练与推理中，请直接使用 PyTorch 2.x 内置的 `F.scaled_dot_product_attention(..., is_causal=True)`，它会自动调度 FlashAttention-2 / Memory-Efficient Attention 内核，将显存复杂度从 $O(T^2)$ 降至 $O(T)$。

## 五、结语

从傅里叶的固定三角基，到小波变换的时频局部化，再到 Transformer 的自适应注意力权重——人类理解复杂世界的方法一脉相承：**寻找恰当的坐标系，让混乱的表象在投影之后呈现出清澈的结构。**
