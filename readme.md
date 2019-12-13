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

## 撰写配置文件

> 注意: 生成的字段永远会添加`id`和`createTime`字段, 请勿重复添加.

例如我们生成一个菜单实体, 建立一个`Meni.json`的文件.

例子:

```json
{
    "$schema": "https://raw.githubusercontent.com/xueyou2000/wallet-generate/master/schema.json",
    "server-name": "boss",
    "entity": {
        "name": "Menu",
        "description": "系统菜单",
        "columns": [
            {
                "name": "name",
                "type": "String",
                "desc": "菜单名称",
                "summary": "主语言(中文)名称"
            },
            {
                "name": "path",
                "type": "String",
                "desc": "菜单路径",
                "length": 120
            },
            {
                "name": "label",
                "type": "String",
                "desc": "菜单标签",
                "summary": "用于根据标签找到对应国际化名称",
                "length": 120
            },
            {
                "name": "displayOrder",
                "type": "Long",
                "desc": "菜单顺序"
            },
            {
                "name": "levels",
                "type": "Long",
                "desc": "菜单级别",
                "summary": "1=主菜单, 2=子菜单"
            },
            {
                "name": "parentId",
                "type": "Long",
                "desc": "父菜单id"
            },
            {
                "name": "status",
                "type": "com.yl.wallet.common.enums.EnableOrUnenable",
                "desc": "状态",
                "isEnum": true
            }
        ]
    }
}
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
