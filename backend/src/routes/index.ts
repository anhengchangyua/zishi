import { Router } from 'express'

const router = Router()

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务正常',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  })
})

// API路由
router.get('/api/stores', (req, res) => {
  // 模拟店铺数据
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    }
  })
})

router.get('/api/stores/recommend', (req, res) => {
  // 模拟推荐店铺数据
  res.json({
    code: 200,
    message: '获取成功',
    data: []
  })
})

export default router