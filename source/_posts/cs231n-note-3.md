---
title: cs231n-note-3
date: 2018-06-04 00:38:22
tags: Machine_Learning
---

[最优化上](https://zhuanlan.zhihu.com/p/21360434)

[最优化下](https://zhuanlan.zhihu.com/p/21387326)

# Review 

- 基于参数的评分函数。该函数将原始图像像素映射为分类评分值。

- 损失函数。该函数能够根据分类评分和训练集图像数据实际分类的一致性，衡量某个具体参数集的质量好坏。损失函数有多种版本和不同的实现方式（例如：Softmax或SVM）。 *Softmax 和 SVM 不应该包括了score function 和 lost function*

- 最优化Optimization。最优化是寻找能使得损失函数值最小化的参数W的过程。



# 损失函数可视化

- 在一维尺度上 $$L(W+aW_1)$$ x轴是a， y轴是loss function

- 在二维尺度上 $$L(W+aW_1+bW_2)$$, a,b 表达x轴, y轴， loss function 用颜色表示

单独的损失函数表示：

![](https://www.zhihu.com/equation?tex=Li%3D%5Csum_%7Bj%5Cnot%3Dy_i%7D%5Bmax%280%2Cw%5ET_jx_i-w%5ET_%7By_i%7Dx_i%2B1%29%5D)

$$w_j$$ 如果对应分类正确即是负号，错误即是正号 $$L = \sumL/n$$

![](https://pic3.zhimg.com/80/3f6fbcd487b1c214e8fea1ea66eb413e_hd.jpg)

SVM的损失函数是一种凸函数，可以学习一下如何高效最小化凸函数，在这种损失函数会有一些不可导的点（kinks）

两个新概念： 
- 梯度？ 次梯度？未来学习点

# 最优化 Optimization

对于神经网络的最优化策略有：

## 随即搜索 最差劲的搜索方案（base line）

	# 假设X_train的每一列都是一个数据样本（比如3073 x 50000）
	# 假设Y_train是数据样本的类别标签（比如一个长50000的一维数组）
	# 假设函数L对损失函数进行评价

	bestloss = float("inf") # Python assigns the highest possible float value
	for num in xrange(1000):
	  W = np.random.randn(10, 3073) * 0.0001 # generate random parameters
	  loss = L(X_train, Y_train, W) # get the loss over the entire training set
	  if loss < bestloss: # keep track of the best solution
	    bestloss = loss
	    bestW = W
	  print 'in attempt %d the loss was %f, best %f' % (num, loss, bestloss)


