---
title: cs231n-note-4
date: 2018-06-18 22:23:21
tags: Machine_Learning
---

反向传播

# Introduction:

反向传播是利用链式法则递归计算表达式的梯度的方法。 根据函数 f(x), 求关于f 关于 x的梯度 gradient

![](https://wikimedia.org/api/rest_v1/media/math/render/svg/c86221324a9d066ca28310ee772941748a5f370f)

## 偏导数

（我的理解就是当对其中一个param 求导的时候视其他的params为const， 含义为当这个param 增加的时候 对f 的增加量的比值）

## 链式法则

Chain rule

![](https://www.zhihu.com/equation?tex=%5Cdisplaystyle%5Cfrac%7B%5Cpartial+f%7D%7B%5Cpartial+x%7D%3D%5Cfrac%7B%5Cpartial+f%7D%7B%5Cpartial+q%7D%5Cfrac%7B%5Cpartial+q%7D%7B%5Cpartial+x%7D)

这下面这个sample给的真的是清楚

x = -2; y = 5; z = -4

f(x,y,z) = (x+y)z

![](https://pic4.zhimg.com/80/213da7f66594510b45989bd134fc2d8b_hd.jpg)

绿色的从输入端到输出端 为前向传播

红色的从输出端到输入端 为反向传播

## 反向传播的理解

