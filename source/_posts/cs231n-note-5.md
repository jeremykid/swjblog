---
title: cs231n-note-5
date: 2018-07-16 21:03:08
tags:
---

# 神经网络笔记1

## 对比线性代数算法

基础的线性代数算法 s = Wx, x 是一个输入矩阵 [n * 1], W 是一个权重矩阵 [种类 * n]，s 为一个评分矩阵。

## 神经网络算法简介

神经网络算法是 s = W_2 max(0, W_1x). 在这种情况下 W_1 广度增加，比如可能为 [100 * n], max 是通过设置熵值来过滤掉所有的小于0的score。其实有其他方法来过滤。

W_2 是一个[种类 * 100] 的矩阵， 权重W 通过梯度下降来学习。

## 单个神经元	建模

神经网络是从生物上得到的启发。 

#### 生物动机与连接

!()[https://pic4.zhimg.com/80/d0cbce2f2654b8e70fe201fec2982c7d_hd.jpg]

当多个信号传进神经元，与神经元内权重相乘并且相加，如果超过某一个阈值，那么激活神经元。激活函数最早接触的sigmoid，最大优势是将数据控制在【0，1】之间。

一个神经元前向传播的代码是：

```
class Neuron(object):
	# ... 
	def forward(inputs):
	  """ 假设输入和权重是1-D的numpy数组，偏差是一个数字 """
	  cell_body_sum = np.sum(inputs * self.weights) + self.bias
	  firing_rate = 1.0 / (1.0 + math.exp(-cell_body_sum)) # sigmoid激活函数
	  return firing_rate
```

---- Todo ----- 

## 作为线性分类器的单个神经元

分类器我的理解还是吧score 转化为正确概率。然后进行一个loss 的计算

#### 二分类Softmax分类器


#### 二分类SVM分类器

## 常用激活函数

#### Sigmoid

#### Tanh

#### ReLU

#### Leaky ReLU

#### Maxout

## Reference

![神经网络笔记1（上）](https://zhuanlan.zhihu.com/p/21462488)

![神经网络笔记1（下）](https://zhuanlan.zhihu.com/p/21513367)