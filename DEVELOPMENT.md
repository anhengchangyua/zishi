# 意涵自习室 - 开发指南

## 项目概述

意涵自习室是一个基于uni-app框架开发的跨端自习室预订应用，支持微信小程序、支付宝小程序、H5和App多个平台。

## 技术栈详情

### 前端技术栈
- **uni-app**: 3.0.0-4010920240930001
- **Vue**: 3.4.21
- **TypeScript**: 5.4.5
- **Vite**: 5.2.8
- **Pinia**: 2.0.36 (状态管理)
- **luch-request**: 3.1.1 (网络请求)
- **uni-ui**: 1.5.5 (UI组件库)
- **SCSS**: 1.77.0 (样式预处理器)

### 开发工具
- **ESLint**: 8.57.0 (代码检查)
- **Prettier**: 3.2.5 (代码格式化)
- **vue-tsc**: 2.0.16 (TypeScript类型检查)

## 项目架构

### 目录结构说明

```
src/
├── main.ts                 # 应用入口文件
├── App.vue                 # 根组件
├── pages.json              # 页面路由配置
├── pages/                  # 页面目录
│   ├── index/             # 首页模块
│   ├── store/             # 店铺模块
│   ├── order/             # 订单模块
│   ├── user/              # 用户模块
│   └── common/            # 通用页面
├── components/             # 组件目录
│   ├── common/            # 通用组件
│   └── business/          # 业务组件
├── stores/                 # 状态管理
│   └── user.ts            # 用户状态
├── api/                    # API接口
│   ├── auth.ts            # 认证接口
│   └── store.ts           # 店铺接口
├── utils/                  # 工具函数
│   └── request.ts         # 网络请求封装
├── types/                  # TypeScript类型定义
│   └── index.ts           # 全局类型
├── constants/              # 常量定义
│   └── index.ts           # 全局常量
├── hooks/                  # 组合式API
├── assets/                 # 资源文件
│   └── styles/            # 样式文件
│       ├── variables.scss # SCSS变量
│       └── index.scss     # 全局样式
└── static/                # 静态资源
```

### 核心模块说明

#### 1. 状态管理 (Pinia)
使用Pinia进行全局状态管理，主要包括：
- 用户信息管理
- 登录状态管理
- 位置信息管理
- 系统信息管理

#### 2. 网络请求 (luch-request)
封装了完整的网络请求库，包括：
- 请求/响应拦截器
- 自动token管理
- 错误处理
- 加载状态管理
- 文件上传/下载

#### 3. 类型系统 (TypeScript)
完整的TypeScript类型定义：
- API响应类型
- 业务数据类型
- 组件Props类型
- 状态管理类型

#### 4. 样式系统 (SCSS)
统一的样式管理：
- 全局变量定义
- 通用类名
- 响应式设计
- 主题色彩管理

## 开发流程

### 1. 环境准备

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev:h5

# 启动微信小程序开发
npm run dev:mp-weixin
```

### 2. 开发规范

#### 代码风格
- 使用ESLint + Prettier进行代码检查和格式化
- 遵循Vue 3 Composition API风格
- 使用TypeScript严格模式

#### 命名规范
- 文件名：kebab-case (短横线命名)
- 组件名：PascalCase (大驼峰)
- 变量名：camelCase (小驼峰)
- 常量名：UPPER_CASE (大写下划线)

#### 目录规范
- 页面文件放在`pages`目录下
- 可复用组件放在`components`目录下
- API接口放在`api`目录下
- 工具函数放在`utils`目录下

### 3. 页面开发

#### 创建新页面
1. 在`src/pages`下创建页面目录
2. 在`src/pages.json`中配置页面路由
3. 使用Vue 3 Composition API编写页面逻辑

#### 页面模板
```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

// 响应式数据
const loading = ref(false)

// 状态管理
const userStore = useUserStore()

// 页面生命周期
onMounted(() => {
  // 页面初始化逻辑
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: $background-color;
}
</style>
```

### 4. 组件开发

#### 组件规范
- 使用Vue 3 Composition API
- 定义清晰的Props和Emits类型
- 提供完整的TypeScript类型支持

#### 组件模板
```vue
<template>
  <view class="component-container">
    <!-- 组件内容 -->
  </view>
</template>

<script setup lang="ts">
interface Props {
  title: string
  visible?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<Emits>()
</script>

<style lang="scss" scoped>
.component-container {
  // 组件样式
}
</style>
```

### 5. API开发

#### API接口规范
```typescript
import request from '@/utils/request'
import type { ApiResponse, UserInfo } from '@/types'

export const userApi = {
  // 获取用户信息
  getUserInfo() {
    return request.get<UserInfo>('/user/info')
  },

  // 更新用户信息
  updateUserInfo(data: Partial<UserInfo>) {
    return request.put<UserInfo>('/user/info', data)
  }
}
```

## 调试和测试

### 1. 开发调试

#### H5调试
```bash
npm run dev:h5
```
在浏览器中访问 http://localhost:3000

#### 微信小程序调试
```bash
npm run dev:mp-weixin
```
使用微信开发者工具导入`dist/dev/mp-weixin`目录

#### App调试
```bash
npm run dev:app
```
使用HBuilderX导入项目进行真机调试

### 2. 代码检查

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 3. 构建发布

```bash
# 构建微信小程序
npm run build:mp-weixin

# 构建H5
npm run build:h5

# 构建App
npm run build:app
```

## 部署说明

### 1. 微信小程序
1. 运行`npm run build:mp-weixin`
2. 使用微信开发者工具打开`dist/build/mp-weixin`目录
3. 点击上传代码到微信后台
4. 在微信公众平台提交审核

### 2. H5应用
1. 运行`npm run build:h5`
2. 将`dist/build/h5`目录部署到Web服务器
3. 配置域名和HTTPS证书

### 3. App应用
1. 运行`npm run build:app`
2. 使用HBuilderX打开项目
3. 配置App图标、启动页等
4. 打包生成安装包

## 常见问题

### 1. 跨端兼容性
- 使用uni-app的条件编译处理平台差异
- 注意不同平台的API差异
- 测试各平台的功能完整性

### 2. 性能优化
- 使用懒加载减少首屏加载时间
- 优化图片资源大小
- 合理使用缓存策略

### 3. 样式适配
- 使用rpx单位进行响应式设计
- 注意不同平台的样式差异
- 测试各种屏幕尺寸的显示效果

## 贡献指南

1. Fork项目到个人仓库
2. 创建功能分支
3. 提交代码并编写清晰的commit信息
4. 创建Pull Request
5. 等待代码审查和合并

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues：提交技术问题
- 邮箱：yihan-team@example.com
- 微信群：扫描二维码加入开发者群