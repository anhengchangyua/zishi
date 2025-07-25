"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        code: 200,
        message: '服务正常',
        data: {
            status: 'ok',
            timestamp: new Date().toISOString()
        }
    });
});
router.get('/api/stores', (req, res) => {
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
    });
});
router.get('/api/stores/recommend', (req, res) => {
    res.json({
        code: 200,
        message: '获取成功',
        data: []
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map