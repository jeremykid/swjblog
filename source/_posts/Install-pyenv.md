---
title: Install pyenv
date: 2018-05-24 23:01:30
tags: python
---

因为之前用[nvm](https://github.com/creationix/nvm) node 的版本管理器

所以pyenv 应该也是python 的版本管理器

运行 curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash

然后打开 vim ~/.bash_profile 

添加了三行

	export PATH="~/.pyenv/bin:$PATH"
	eval "$(pyenv init -)"
	eval "$(pyenv virtualenv-init -)"

我原来的是

	export XAMPP_HOME=/Applications/xampp/xamppfiles
	export PATH=${XAMPP_HOME}/bin:${PATH}

最后变成

	export XAMPP_HOME=/Applications/xampp/xamppfiles
	export PATH=/Users/weijiesun/.pyenv/bin:${PATH}:${XAMPP_HOME}/bin

	eval "$(pyenv init -)"
	eval "$(pyenv virtualenv-init -)"

然后有个坑踩了好久，就是XAMPP_HOME=/Applications/xampp/xamppfiles 要放在path 的最后一位，不然就是疯狂在找http url 的端口

然后运行 

	source ~/.bash_profile 	

就好了


# Kears



