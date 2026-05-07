// 统一错误处理中间件
const errorHandler = (err, req, res, next) => {
    console.error('❌ 错误:', err.message);
    console.error('   堆栈:', err.stack);

    // MySQL重复键错误
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            code: 400,
            message: '数据已存在'
        });
    }

    // MySQL外键约束错误
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            code: 400,
            message: '关联数据不存在'
        });
    }

    // JWT错误
    if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({
            code: 403,
            message: '无效的令牌'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            code: 401,
            message: '令牌已过期'
        });
    }

    // 默认服务器错误
    const statusCode = err.statusCode || 500;
    const message = err.message || '服务器内部错误';

    res.status(statusCode).json({
        code: statusCode,
        message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : message
    });
};

// 404处理中间件
const notFoundHandler = (req, res) => {
    res.status(404).json({
        code: 404,
        message: '请求的资源不存在'
    });
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
        
        if (res.statusCode >= 400) {
            console.warn('⚠️ ', log);
        } else {
            console.log('📥', log);
        }
    });
    
    next();
};

module.exports = {
    errorHandler,
    notFoundHandler,
    requestLogger
};