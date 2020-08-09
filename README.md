# lottodog
Watch Dog for lottery data center.

## 项目结构

* index.js 启动入口
* jobs 相关任务执行类
  * result 用于保存数据验证详细结果JSON，暂时未用
  * schema 数据验证 JSON Schema
* tools 工具脚本，用于openapi Schema 转换 JSON Schema 
* .env.example 环境变量范例
* .env 本地开发调试时的环境变量，首次请复制 .env.example 生成
* utils 工具函数集

## 运行方法

```bash
# clone repo
git clone https://github.com/masschaos/lottodog.git

cd lottodog

# install packages
yarn install

# create .env
cp .env.example .env

# start jobs
yarn start

```
