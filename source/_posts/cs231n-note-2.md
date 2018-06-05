---
title: cs231n note - 2
date: 2018-05-21 14:56:48
mathjax: true
tags: Machine_Learning
---

Reference:

[https://zhuanlan.zhihu.com/p/20918580](https://zhuanlan.zhihu.com/p/20918580)

[https://zhuanlan.zhihu.com/p/20945670](https://zhuanlan.zhihu.com/p/20945670)

[https://zhuanlan.zhihu.com/p/21102293](https://zhuanlan.zhihu.com/p/21102293)


# Linear Classification 

## score function (评分函数)

原始图片到各个类别的评分情况， 分越高越接近

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+f%28x_i%2CW%2Cb%29%3DWx_i%2Bb)

每个图像都是 [D x 1] D = pixel X pixel X 3(RGB)

### 参数

权重

W (weight) = [k X D] k是样本数 

在维度空间里 做旋转变换

偏差向量

b (bias vector) = [k x 1]

在维度空间里 做平移变化

### 图像数据预处理

最常见的就是 normalization

零均值的中心化 把 [0-255] -> [-127-127] -> [-1,1]

## Loss Function (损失函数)

量化分类label 与真实label 之间的一致性 也叫 代价函数Cost Function或目标函数Objective

当 Score Function 与真实结果相差越大，Cost Function输出越大 

### 多类支持向量机损失 Multiclass Support Vector Machine Loss

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+L_i%3D%5Csum_%7Bj%5Cnot%3Dy_i%7Dmax%280%2Cs_j-s_%7By_i%7D%2B%5CDelta%29)

eg: 有三个分类 score 是 s = [13, -7, 11] \delta = 10, 第一个label 是真实正确的

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+Li%3Dmax%280%2C-7-13%2B10%29%2Bmax%280%2C11-13%2B10%29)

因为 -20 大于 \delta 边界值， 所以最后的损失值为8

线性评分函数 的损失函数公式：

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+L_i%3D%5Csum_%7Bj%5Cnot%3Dy_i%7Dmax%280%2Cw%5ET_jx_i-w%5ET_%7By_i%7Dx_i%2B%5CDelta%29)

### 折叶损失（hinge loss）: max (0, -) 

### 平方折叶损失SVM（即L2-SVM）： max (0, -) ^2

![](https://pic4.zhimg.com/80/f254bd8d072128f1088c8cc47c3dff58_hd.jpg)

目的是想要正确类别进入红色区域， 如果其他类别进入红色区域甚至更高的时候，计算loss， 我们的目的是找权重W

## Regularization 正则化

假设有一个数据集和一个权重集W能够正确地分类每个数据， 可能有很多相似的W都能正确地分类所有的数据

比如有一个权重W 调整系数可以改变Loss score。 我们希望給W添加一些偏好

向损失函数增加一个正则化惩罚

### egularization penalty 正则化惩罚 R(W)

![](https://www.zhihu.com/equation?tex=R%28W%29%3D%5Csum_k+%5Csum_l+W%5E2_%7Bk%2Cl%7D)

多类SVM损失函数 L = 数据损失（data loss），即所有样例的的平均损失L_i + 正则化损失（regularization loss）

![](https://www.zhihu.com/equation?tex=L%3D%5Cdisplaystyle+%5Cunderbrace%7B+%5Cfrac%7B1%7D%7BN%7D%5Csum_i+L_i%7D_%7Bdata+%5C++loss%7D%2B%5Cunderbrace%7B%5Clambda+R%28W%29%7D_%7Bregularization+%5C+loss%7D)

展开公式

![](https://www.zhihu.com/equation?tex=L%3D%5Cfrac%7B1%7D%7BN%7D%5Csum_i%5Csum_%7Bj%5Cnot%3Dy_i%7D%5Bmax%280%2Cf%28x_i%3BW%29_j-f%28x_i%3BW%29_%7By_i%7D%2B%5CDelta%29%5D%2B%5Clambda+%5Csum_k+%5Csum_l+W%5E2_%7Bk%2Cl%7D)


Code:

	def L_i(x, y, W):
	  """
	  unvectorized version. Compute the multiclass svm loss for a single example (x,y)
	  - x is a column vector representing an image (e.g. 3073 x 1 in CIFAR-10)
	    with an appended bias dimension in the 3073-rd position (i.e. bias trick)
	  - y is an integer giving index of correct class (e.g. between 0 and 9 in CIFAR-10)
	  - W is the weight matrix (e.g. 10 x 3073 in CIFAR-10)
	  """
	  delta = 1.0 # see notes about delta later in this section
	  scores = W.dot(x) # scores becomes of size 10 x 1, the scores for each class
	  correct_class_score = scores[y]
	  D = W.shape[0] # number of classes, e.g. 10
	  loss_i = 0.0
	  for j in xrange(D): # iterate over all wrong classes
	    if j == y:
	      # skip for the true class to only loop over incorrect classes
	      continue
	    # accumulate loss for the i-th example
	    loss_i += max(0, scores[j] - correct_class_score + delta)
	  return loss_i

	def L_i_vectorized(x, y, W):
	  """
	  A faster half-vectorized implementation. half-vectorized
	  refers to the fact that for a single example the implementation contains
	  no for loops, but there is still one loop over the examples (outside this function)
	  """
	  delta = 1.0
	  scores = W.dot(x)
	  # compute the margins for all classes in one vector operation
	  margins = np.maximum(0, scores - scores[y] + delta)
	  # on y-th position scores[y] - scores[y] canceled and gave delta. We want
	  # to ignore the y-th position and only consider margin on max wrong class
	  margins[y] = 0
	  loss_i = np.sum(margins)
	  return loss_i

	def L(X, y, W):
	  """
	  fully-vectorized implementation :
	  - X holds all the training examples as columns (e.g. 3073 x 50,000 in CIFAR-10)
	  - y is array of integers specifying correct class (e.g. 50,000-D array)
	  - W are weights (e.g. 10 x 3073)
	  """
	  # evaluate loss over all examples in X without using any for loops
	  # left as exercise to reader in the assignment
  	  delta = 1.0
  	  score_matrix = W.dot(X)
  	  correct_score = score_matrix[y]
  	  #Todo, correct_score_matrix = correct_core * 50
  	  #Todo, delta_matrx repeat delta
  	  loss_matrix = score_matrix - correct_score_matrix + delta_matrx
  	  result = np.sum(loss_matrix, axis=1)
	  return loss_matrix


### Softmax分类器 

逻辑回归分类器面对多个分类的一般化归纳

公式：

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+Li%3D-log%28%5Cfrac%7Be%5E%7Bf_%7By_i%7D%7D%7D%7B%5Csum_je%5E%7Bf_j%7D%7D%29) 

或者

![](https://www.zhihu.com/equation?tex=L_i%3D-f_%7By_i%7D%2Blog%28%5Csum_je%5E%7Bf_j%7D%29)

所有的函数转换成 $$e^z$$

score function => ![](https://www.zhihu.com/equation?tex=f_j%28z%29%3D%5Cfrac%7Be%5E%7Bz_j%7D%7D%7B%5Csum_ke%5E%7Bz_k%7D%7D)

softmax 函数, 每个元素都在0-1之间并且和为1


概率解释:

![](https://www.zhihu.com/equation?tex=P%28y_i%7Cx_i%2CW%29%3D%5Cfrac%7Be%5E%7Bf_%7By_i%7D%7D%7D%7B%5Csum_je%5E%7Bf_j%7D%7D)

我们就是在最小化正确分类的负对数概率，这可以看做是在进行最大似然估计（MLE）

实现softmax函数计算的时候技巧可以用常数C， 通常$$\log C = -maxf_j$$ 

![](https://www.zhihu.com/equation?tex=%5Cfrac%7Be%5E%7Bf_%7By_i%7D%7D%7D%7B%5Csum_je%5E%7Bf_j%7D%7D%3D%5Cfrac%7BCe%5E%7Bf_%7By_i%7D%7D%7D%7BC%5Csum_je%5E%7Bf_j%7D%7D%3D%5Cfrac%7Be%5E%7Bf_%7By_i%7D%2BlogC%7D%7D%7B%5Csum_je%5E%7Bf_j%2BlogC%7D%7D)

	f = np.array([123, 456, 789]) # 例子中有3个分类，每个评分的数值都很大
	p = np.exp(f) / np.sum(np.exp(f)) # 不妙：数值问题，可能导致数值爆炸

	# 那么将f中的值平移到最大值为0：
	f -= np.max(f) # f becomes [-666, -333, 0]
	p = np.exp(f) / np.sum(np.exp(f)) # 现在OK了，将给出正确结果


折叶损失（hinge loss）替换为交叉熵损失（cross-entropy loss）

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle+H%28p%2Cq%29%3D-%5Csum_xp%28x%29+logq%28x%29)


### SVM和Softmax的比较

Softmax 


### Summary

- SVM 和 Softmax 基于 weight W 和 bias b

- define Loss Function (损失函数) 用来更好的定义更好的预测模型
 

----sad----
Test Mathjax, 但是公式实在太复杂。

$$
L_{i}=f_{y_i}+\log (\sum_{j} e^{f_j})
$$

$L_{i} = -\log \frac {e^{f_y}} {e^{f_j}}$

$\sum_{j=0}$

$$
a+b=c
$$

TODO