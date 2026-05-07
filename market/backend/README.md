# 虾市场后端服务 🦐

虾市场交易平台后端服务，使用 Express.js + MySQL 构建。

## 技术栈

- **框架**: Express.js 4.x
- **数据库**: MySQL 8.0+
- **ORM**: mysql2 (原生SQL)
- **认证**: JWT + bcryptjs
- **环境变量**: dotenv

## 项目结构

```
shrimp-market/backend/
├── src/
│   └── app.js              # 主应用入口
├── config/
│   └── database.js         # 数据库配置
├── middleware/
│   ├── auth.js             # JWT认证中间件
│   └── error.js            # 错误处理中间件
├── routes/
│   ├── auth.js             # 用户认证路由
│   ├── shrimp.js           # 虾商品路由
│   ├── order.js            # 订单路由
│   ├── payment.js          # 支付路由
│   └── rank.js             # 排行榜路由
├── sql/
│   └── init.sql            # 数据库初始化脚本
├── uploads/                # 上传文件目录
├── .env                    # 环境变量(需创建)
├── .env.example            # 环境变量示例
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
cd shrimp-market/backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置数据库连接信息
```

### 3. 初始化数据库

```bash
# 使用MySQL客户端执行SQL脚本
mysql -u root -p < sql/init.sql

# 或使用npm脚本
npm run init-db
```

### 4. 启动服务

```bash
# 开发模式(热重载)
npm run dev

# 生产模式
npm start
```

## API 文档

### 认证相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | - |
| POST | /api/auth/login | 用户登录 | - |
| GET | /api/auth/profile | 获取用户信息 | ✅ |
| PUT | /api/auth/profile | 更新用户信息 | ✅ |
| PUT | /api/auth/password | 修改密码 | ✅ |

### 虾商品相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/shrimp/list | 虾列表(支持分页筛选) | - |
| GET | /api/shrimp/detail/:id | 虾详情 | - |
| GET | /api/shrimp/species | 虾品种列表 | - |
| GET | /api/shrimp/hot | 热销推荐 | - |
| GET | /api/shrimp/new | 最新发布 | - |
| POST | /api/shrimp/publish | 发布商品 | ✅ |

### 订单相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/orders/create | 创建订单 | ✅ |
| GET | /api/orders/list | 我的购买订单 | ✅ |
| GET | /api/orders/sold | 我的销售订单 | ✅ |
| GET | /api/orders/detail/:id | 订单详情 | ✅ |
| POST | /api/orders/cancel/:id | 取消订单 | ✅ |
| POST | /api/orders/confirm/:id | 确认收货 | ✅ |

### 支付相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/payment/callback | 支付回调 | - |
| POST | /api/payment/pay | 模拟支付 | ✅ |

### 排行榜相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/rank | 获取排行榜 | - |
| GET | /api/rank/trending | 热门趋势 | - |
| GET | /api/rank/stats | 统计数据 | - |

## 请求示例

### 注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","nickname":"测试用户"}'
```

### 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'
```

### 获取虾列表
```bash
curl http://localhost:3000/api/shrimp/list?page=1&limit=10&category=观赏
```

### 创建订单(需登录)
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"product_id":1,"quantity":1,"shipping_address":"北京市"}'
```

## 数据表说明

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| shrimp_species | 虾品种表 |
| products | 商品表 |
| orders | 订单表 |
| payment_callbacks | 支付回调记录表 |
| favorites | 收藏表 |
| reviews | 评价表 |

## 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3000 |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_USER | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | - |
| DB_NAME | 数据库名 | shrimp_market |
| JWT_SECRET | JWT密钥 | - |
| JWT_EXPIRES_IN | Token过期时间 | 7d |