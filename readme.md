# wallet-generate

`wallet`的代码生成工具, 根据实体定义, 生成`实体`,`dto`, `service`等文件

## 安装

`wallet-generate`是一个`cli`命令行工具, 请全局安装.

```sh
# yarn
yarn global add wallet-generate

# npm
npm add -g wallet-generate
```

## 生成单个实体

> requirement: 请先请按照`entitys`中`menu.json`的规范, 撰写需要生成的实体配置文件.

```sh
# 根据 entitys/menu.json 的实体配置, 生成代码
wallet-generate -f entitys/menu.json
```

# 批量生成

> requirement: 请先请按照`entitys`中`menu.json`的规范, 撰写需要生成的实体配置文件.

```sh
# 根据 entitys 文件夹中实体配置文件, 批量生成代码
wallet-generate -d entitys
```

## 输出结构

> 将输出的`model`目录内容拷贝到对应的模型项目下, 比如`boss`就拷贝到`com.yl.wallet.boss`下

-   `dist` 输出目录
    -   `model` 模型目录
        -   `dto`
        -   `entity`
        -   `service`
    -   `api` 接口目录
        -   `repository`
        -   `service`
            -   `impl`
        -   `controller`
