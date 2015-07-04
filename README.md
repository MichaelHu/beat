# 基于fis-plus的前端解决方案

请不要误会npm包名*beat-fis*，不是*beat fis*，只是因为

    npm publish
    
的时候，发现*beat*已经不能使用，就临时改了个名儿，加了*-fis*后缀。


## 1 功能说明

新增特性，解决以下问题：

1. 项目中fis-conf.js配置的*roadmap.path*不生效的问题
2. 模板数据模拟新增兼容支持原生PHP语法模板


## 2 安装

    npm install beat-fis -g
    beat -v


## 3 使用

1. 安装本地服务器插件：

        beat server init


2. 启动本地服务器：

        beat server start 


3. 发布代码：

        beat release 





