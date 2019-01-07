# wj-ddns
动态设置域名解析至本地公网 ip 的命令行工具

## 安装
```
npm install wj-ddns -g
```

## 使用方式
### 启动 ddns 任务
 
```
/**
wj-ddns: 			cli 命令
setup: 				启动子命令
wangjuncoder.cn: 		要设置的域名
test: 				映射子域名，设置后将使用 test.wangjuncoder.cn 配置
 -k xxx: 			使用 -k 指定阿里云中的 AccessKeyId（注意需要有域名解析权限）
 -s xxx:			使用 -s 指定阿里云中的 AccessKeySecret
 -t 10:				使用 -t 指定工具扫描间隔，单位：分钟
*/ 
wj-ddns setup wangjuncoder.cn test -k xxx -s xxx -t 10

```

### 列出 ddns 任务
```
wj-ddns list
```

### 删除 ddns 任务
```
// 删除指定任务
wj-ddns stop wangjuncoder.cn test

// 删除所有任务
wj-ddns stop -a
```


### 注意事项
* Node.js >= 8.x
* 域名解析服务使用阿里云服务
* 可将域名解析至本地公网 ip 后不代表可以访问，还需光猫路由等进行端口映射
