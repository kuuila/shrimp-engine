const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/error');

// 导入路由
const authRoutes = require('./routes/auth');
const shrimpRoutes = require('./routes/shrimp');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const rankRoutes = require('./routes/rank');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        code: 200,
        message: '服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/shrimp', shrimpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/rank', rankRoutes);

// 根路径
app.get('/', (req, res) => {
    res.json({
        code: 200,
        message: '虾市场后端服务 API v1.0',
        endpoints: {
            auth: '/api/auth',
            shrimp: '/api/shrimp',
            orders: '/api/orders',
            payment: '/api/payment',
            rank: '/api/rank'
        }
    });
});

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
    // 测试数据库连接
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.warn('⚠️ 数据库连接失败，服务将继续运行，但部分功能可能不可用');
    }

    app.listen(PORT, () => {
        console.log(`🦐 虾市场后端服务已启动`);
        console.log(`📍 地址: http://localhost:${PORT}`);
        console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();

module.exports = app;