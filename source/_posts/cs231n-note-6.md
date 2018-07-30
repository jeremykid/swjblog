---
title: cs231n-note-6
date: 2018-07-29 15:06:19
tags:
---

# 神经网络笔记2

# 设置数据和模型

神经网络就是进行了一系列的线性映射与非线性激活函数交织的运算, 这些做法共同定义了评分函数(score function)

## 数据预处理

3个常用的符号，数据矩阵X，假设其尺寸是[N x D]（N是数据样本的数量，D是数据的维度）


### 均值减法(Mean subtraction):

每个独立特征减去平均值，从几何上可以理解为在每个维度上都将数据云的中心都迁移到原点.

numpy代码：

```
X -= np.mean(X, axis=0)
```

### 归一化（Normalization）

数据的所有维度都归一化，使其数值范围都近似相等.

有两种方法：

第一种是先对数据做零中心化,然后每个维度都除以其标准差

![](https://pic2.zhimg.com/80/e743b6777775b1671c3b5503d7afbbc4_hd.jpg)


numpy 代码

```
X -= np.mean(X, axis=0)
X /= np.std(X, axis=0)
```

第二种方法是对每个维度都做归一化，每个维度最大值1，最小值-1


### PCA和白化（Whitening）To learning

```
# 假设输入数据矩阵X的尺寸为[N x D]
X -= np.mean(X, axis = 0) # 对数据进行零中心化(重要)
cov = np.dot(X.T, X) / X.shape[0] # 得到数据的协方差矩阵
```


## Reference:

[神经网络笔记 2](https://zhuanlan.zhihu.com/p/21560667)
