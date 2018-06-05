---
title: cs231n note - 1
date: 2018-05-20 17:26:44
tags: Machine_Learning
---

Reference：

[https://zhuanlan.zhihu.com/p/20894041](https://zhuanlan.zhihu.com/p/20894041)

[https://zhuanlan.zhihu.com/p/20900216](https://zhuanlan.zhihu.com/p/20900216) 

# 图像分类

颜色channel 有三个 red green blue， RGB

流程就是 输入 -> 学习 -> 评价

# K Nearest Neighbor 分类器

k 越高 generalization 能力越好

## 用距离来分类
L1范数 和 L2范数 

L1 

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+d_1%28I_1%2CI_2%29%3D%5Csum_p%7CI%5Ep_1-I%5Ep_2%7C)

L2

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+d_2%28I_1%2CI_2%29%3D%5Csqrt%7B+%5Csum_p%28I%5Ep_1-I%5Ep_2%29%5E2%7D)

``
distances = np.sqrt(np.sum(np.square(self.Xtr - X[i,:]), axis = 1))
``

L1和L2比较。。在面对两个向量之间的差异时，L2比L1更加不能容忍这些差异。也就是说，相对于1个巨大的差异，L2距离更倾向于接受多个中等程度的差异。L1和L2都是在p-norm常用的特殊形式。


## hyperparameter: 超参数，需要去测试调整

## validation set: 测试集 只能使用一次

## Cross validation: train <-> test


##k Nearest Neighbor 优缺点:

Advantange:易于理解，实现简单。

Disadvantage: 算法的训练不需要花时间，因为其训练过程只是将训练集数据存储起来。然而测试要花费大量时间计算，因为每个测试图像需要和所有存储的训练图像进行比较，这显然是一个缺点。在实际应用中，我们关注测试效率远远高于训练效率


