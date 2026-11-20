---
title: KMP 算法详解（三）：从 KMP 自动机、周期定理到 AC 自动机进阶
subtitle: 把前缀函数升维成确定有限状态机（DFA），解锁高频面试与竞赛难题
summary: 深入探讨前缀函数 π 的高阶威力：通过“最小周期定理”一行秒杀重复子串问题，构造 O(m|Σ|) 的 KMP 确定有限自动机（DFA）解决动态规划计数题，并揭示从单模式 KMP 演进至多模式 AC 自动机的统一树形视角。
pubDate: 2026-11-20
category: 算法精研
tags:
  - KMP
  - 自动机
  - 字符串算法
  - 算法进阶
featured: false
pinned: false
coverTheme: obsidian-aurora
---

多数人对 KMP 的理解止步于「判断子串是否存在」，但实际上，前缀函数 $\pi$ 本身是**字符串内部对称性与周期结构的完整指纹**。一旦把它视作一个有限状态机，许多看似棘手的字符串问题都会迎刃而解。

## 一、字符串最小周期定理（LeetCode 459 核心原理）

给定长度为 $n$ 的字符串 $S$，若存在正整数 $p$ 使得对所有 $0 \le i < n - p$ 都有 $S[i] = S[i + p]$，称 $p$ 为 $S$ 的一个**周期（Period）**。

周期与 Border 之间存在极其优美的对偶关系：

$$
p \text{ 是 } S \text{ 的周期} \iff n - p \text{ 是 } S \text{ 的 Border}
$$

因此，字符串 $S$ 的**最小正周期**就是：

$$
p_{\min} = n - \pi[n - 1]
$$

由此直接推出经典面试题「判断字符串能否由某个真子串重复拼接而成」的 $O(n)$ 充要条件：

$$
\pi[n - 1] > 0 \quad \text{且} \quad n \bmod (n - \pi[n - 1]) = 0
$$

```python
def repeated_substring_pattern(s: str) -> bool:
    n = len(s)
    pi = [0] * n
    j = 0
    for i in range(1, n):
        while j > 0 and s[i] != s[j]:
            j = pi[j - 1]
        if s[i] == s[j]:
            j += 1
        pi[i] = j
    period = n - pi[-1]
    return pi[-1] > 0 and n % period == 0
```

## 二、把 KMP 升级为确定有限自动机（KMP DFA）

在标准 KMP 中，虽然均摊每步是 $O(1)$，但单步最坏可能触发 $O(m)$ 次 `while` 回退。在实时流处理或**数位/字符串动态规划（DP）**中，我们需要知道：「当前处于匹配状态 $j$，若下一个字符是 $c \in \Sigma$，**直接一步**会转移到哪个状态 $\text{aut}[j][c]$？」

利用动态规划，我们可以在 $O(m|\Sigma|)$ 时间内预处理出完整的状态转移表：

$$
\text{aut}[i][c] = \begin{cases}
i + 1, & \text{if } i < m \text{ and } P[i] = c \\
0, & \text{if } i = 0 \text{ and } P[0] \neq c \\
\text{aut}[\pi[i - 1]][c], & \text{otherwise}
\end{cases}
$$

```python
def build_kmp_automaton(pattern: str) -> list[list[int]]:
    s = pattern + "#"  # 哨兵字符避免越界
    m = len(s)
    pi = [0] * m
    j = 0
    for i in range(1, m):
        while j > 0 and s[i] != s[j]:
            j = pi[j - 1]
        if s[i] == s[j]:
            j += 1
        pi[i] = j

    # 假设字母表为小写英文字母 a-z
    aut = [[0] * 26 for _ in range(m)]
    for i in range(m):
        for c_idx in range(26):
            ch = chr(ord("a") + c_idx)
            if i > 0 and ch != s[i]:
                aut[i][c_idx] = aut[pi[i - 1]][c_idx]
            else:
                aut[i][c_idx] = i + (1 if ch == s[i] else 0)
    return aut
```

> [!TIP] KMP 自动机的典型杀手级应用
> 例如：「求长度为 $N$ 且**不包含**敏感词 $P$ 的小写字符串总数」。只需定义 `dp[step][state]` 为已构造 `step` 个字符、当前停留在 KMP 自动机 `state` 状态（且始终未进入终态 $m$）的方案数，借助 `aut[state][c]` 即可在 $O(N \cdot m \cdot 26)$ 内轻松求解。

## 三、用 $\pi$ 树统计每个前缀的出现次数

把每个位置 $i$ 向它的最长 Border 位置 $\pi[i]$ 连一条有向边，就得到了一棵以 `0` 为根的 **Fail 树（Border 树）**。如果想知道模式串的每一个前缀 $P[0..k-1]$ 在 $P$ 自身中出现了多少次，只需做一次逆序拓扑累加：

```python
def count_prefix_occurrences(s: str) -> list[int]:
    n = len(s)
    pi = [0] * n
    j = 0
    for i in range(1, n):
        while j > 0 and s[i] != s[j]:
            j = pi[j - 1]
        if s[i] == s[j]:
            j += 1
        pi[i] = j

    ans = [0] * (n + 1)
    for i in range(n):
        ans[pi[i]] += 1
    for i in range(n - 1, 0, -1):
        ans[pi[i - 1]] += ans[i]
    for i in range(1, n + 1):
        ans[i] += 1  # 加上前缀自身这一次出现
    return ans
```

## 四、从 KMP 到 AC 自动机：单链到 Trie 树的自然升维

当你理解了 KMP 的失配指针 $\pi$，再看多模式匹配王者 **AC 自动机（Aho–Corasick）** 就会有豁然开朗之感：

| 维度 | KMP 算法 | AC 自动机（Aho–Corasick） |
| --- | --- | --- |
| 模式串数量 | 单个模式串 $P$ | 任意多个模式串 $\{P_1, P_2, \dots, P_k\}$ |
| 底层数据结构 | 线性链表（单串） | **Trie 字典树**（多串共享公共前缀） |
| 失配指针含义 | 指向当前前缀的最长相等真后缀 | `fail[u]` 指向所有模式串前缀中，与 `u` 后缀匹配最长的节点 |
| 预处理复杂度 | $O(m)$ | $O(\sum |P_i| \cdot |\Sigma|)$ |
| 扫描主串复杂度 | $O(n)$ | $O(n + \text{匹配输出数})$ |

换句话说，**KMP 就是只有一个模式串时的 AC 自动机**。理解了这一层抽象，整个确定性字符串匹配算法族（KMP → KMP DFA → AC 自动机 → 后缀自动机 SAM）就在你脑中连成了一张清晰的知识网络。
