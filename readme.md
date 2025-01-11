# 初始化
在项目目录下，添加.env文件，并修改对应参数用于连接数据库
```
DB_HOST=localhost
DB_PORT=27017
DB_USER=myUsername
DB_PASSWORD=myPassword
DB_NAME=myDatabase
WEB_PORT=25250
```

# 初始数据库
当应用启动后输入对应端口  
端口改动: 25250
```
localhost:25250/api/initStockList
```