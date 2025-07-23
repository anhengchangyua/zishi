# 意涵自习室 - 微信小程序

一个功能完整的自习室预订微信小程序，使用Taro框架开发，包含前端小程序和后端API服务。

## 项目概览

### 核心功能
- 🏠 **店铺浏览**: 查看附近自习室，支持搜索、筛选、排序
- 📍 **位置服务**: 基于地理位置推荐附近门店
- 💺 **座位预订**: 实时查看座位状态，在线预订
- 💰 **在线支付**: 微信支付集成，支持多种付费方式
- 📋 **订单管理**: 查看订单历史，管理预订状态
- 👤 **用户中心**: 个人信息、会员系统、积分管理
- ⭐ **评价系统**: 店铺评分、用户反馈
- 🔐 **微信登录**: 一键登录，快速注册

### 技术架构

#### 前端（微信小程序）
- **框架**: Taro 3.x + React + TypeScript
- **UI组件**: Taro UI
- **状态管理**: MobX
- **网络请求**: 封装的Request类
- **样式**: SCSS + CSS变量
- **跨端支持**: 微信小程序、支付宝小程序、H5

#### 后端（Node.js）
- **框架**: Express + TypeScript
- **数据库**: MySQL + Redis
- **认证**: JWT + 微信登录
- **支付**: 微信支付API
- **日志**: Winston
- **部署**: Docker + PM2

## 项目结构

```
<<<<<<< HEAD
zishi/
├── 小程序前端/
│   ├── app.js                 # 小程序入口
│   ├── app.json              # 全局配置
│   ├── app.wxss              # 全局样式
│   ├── pages/                # 页面目录
│   │   ├── index/           # 首页
│   │   ├── store/           # 店铺相关
│   │   ├── order/           # 订单相关
│   │   ├── user/            # 用户相关
│   │   └── common/          # 通用页面
│   ├── components/          # 自定义组件
│   ├── services/            # API服务
│   ├── store/               # 状态管理
│   ├── utils/               # 工具函数
│   └── assets/              # 静态资源
=======
yihan-study-room/
├── Taro前端/
│   ├── src/
│   │   ├── app.tsx           # 应用入口
│   │   ├── app.config.ts     # 全局配置
│   │   ├── app.scss          # 全局样式
│   │   ├── pages/            # 页面目录
│   │   │   ├── index/       # 首页
│   │   │   ├── store/       # 店铺相关
│   │   │   ├── order/       # 订单相关
│   │   │   ├── user/        # 用户相关
│   │   │   └── common/      # 通用页面
│   │   ├── components/      # 自定义组件
│   │   ├── services/        # API服务
│   │   ├── store/           # 状态管理
│   │   ├── utils/           # 工具函数
│   │   └── assets/          # 静态资源
│   ├── config/              # Taro配置
│   └── package.json
>>>>>>> cursor/bc-7780bb23-63e4-40a9-9f89-dc7db56f4f7b-32f7
│
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── app.ts          # 应用入口
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务服务
│   │   ├── models/         # 数据模型
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由
│   │   └── utils/          # 工具函数
│   ├── package.json
│   └── Dockerfile
│
├── package.json             # 前端依赖
├── project.config.json      # 小程序配置
└── README.md               # 项目文档
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 8.0
- Redis >= 6.0
- 微信开发者工具

### 前端部署

1. **安装依赖**
```bash
npm install
```

2. **配置小程序**
- 在微信公众平台注册小程序
- 修改 `project.config.json` 中的 `appid`
- 配置服务器域名

3. **开发调试**
<<<<<<< HEAD
- 使用微信开发者工具导入项目
- 点击编译预览
=======
```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5

# 支付宝小程序
npm run dev:alipay
```

4. **构建发布**
```bash
# 构建微信小程序
npm run build:weapp

# 构建H5
npm run build:h5
```
>>>>>>> cursor/bc-7780bb23-63e4-40a9-9f89-dc7db56f4f7b-32f7

### 后端部署

1. **安装依赖**
```bash
cd backend
npm install
```

2. **环境配置**
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库、Redis、微信等信息
```

3. **数据库初始化**
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE zishi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

4. **启动服务**
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t zishi-backend ./backend

# 运行容器
docker run -d \
  --name zishi-backend \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-db-password \
  zishi-backend
```

## API 文档

### 认证接口
- `POST /api/v1/auth/wx-login` - 微信登录
- `POST /api/v1/auth/refresh-token` - 刷新token
- `GET /api/v1/auth/user-info` - 获取用户信息

### 店铺接口
- `GET /api/v1/stores` - 获取店铺列表
- `GET /api/v1/stores/:id` - 获取店铺详情
- `GET /api/v1/stores/:id/seats` - 获取座位列表
- `POST /api/v1/stores/:id/favorite` - 收藏店铺

### 订单接口
- `POST /api/v1/orders` - 创建订单
- `GET /api/v1/orders` - 获取订单列表
- `GET /api/v1/orders/:id` - 获取订单详情
- `PUT /api/v1/orders/:id` - 更新订单状态

### 支付接口
- `POST /api/v1/payment/create` - 创建支付订单
- `POST /api/v1/payment/notify` - 支付回调
- `GET /api/v1/payment/query/:orderNo` - 查询支付状态

## 功能特性

### 🎯 用户体验
- **直观界面**: 简洁现代的UI设计
- **流畅操作**: 优化的交互体验
- **快速响应**: 高效的数据加载
- **离线支持**: 基础功能离线可用

### 🔒 安全保障
- **数据加密**: 敏感信息加密存储
- **接口安全**: JWT认证 + 签名验证
- **支付安全**: 微信支付官方SDK
- **隐私保护**: 严格的用户数据保护

### 📊 业务功能
- **实时库存**: 座位状态实时更新
- **智能推荐**: 基于位置和偏好推荐
- **会员系统**: 积分、等级、优惠券
- **数据统计**: 完整的业务数据分析

### 🚀 性能优化
- **缓存策略**: Redis缓存热点数据
- **数据库优化**: 索引优化 + 查询优化
- **图片优化**: CDN + WebP格式
- **代码分割**: 按需加载减少包体积

## 开发规范

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 统一的代码格式化（Prettier）
- Git Commit 规范

### 项目规范
- 组件化开发
- 模块化设计
- RESTful API设计
- 完善的错误处理

## 部署说明

### 生产环境部署
1. **服务器配置**
   - CPU: 2核心以上
   - 内存: 4GB以上
   - 存储: 50GB以上

2. **环境安装**
   - Node.js 16+
   - MySQL 8.0+
   - Redis 6.0+
   - Nginx（反向代理）

3. **域名配置**
   - 配置HTTPS证书
   - 设置微信小程序服务器域名
   - 配置CDN加速

### 监控运维
- **日志监控**: Winston + ELK Stack
- **性能监控**: PM2 + 自定义监控
- **错误追踪**: Sentry集成
- **自动部署**: CI/CD Pipeline

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目地址: [https://github.com/your-username/zishi](https://github.com/your-username/zishi)
- 问题反馈: [Issues](https://github.com/your-username/zishi/issues)
- 邮箱: your-email@example.com

## 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🎉 完整的自习室预订功能
- 💰 微信支付集成
- 👤 用户中心和会员系统
- 📱 响应式设计适配

---

<<<<<<< HEAD
**不止一间自习室** - 让学习更简单，让专注更纯粹
=======
**意涵自习室** - 让学习更简单，让专注更纯粹
>>>>>>> cursor/bc-7780bb23-63e4-40a9-9f89-dc7db56f4f7b-32f7
