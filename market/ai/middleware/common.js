/**
 * API 中间件
 */

/**
 * 请求日志中间件
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${statusCode} ${duration}ms - ${ip}`);
  });

  next();
}

/**
 * 简单限流中间件 (基于IP)
 */
function rateLimiter(options = {}) {
  const {
    windowMs = 60000,    // 时间窗口 (毫秒)
    maxRequests = 60     // 最大请求数
  } = options;

  const requests = new Map();

  // 定期清理过期记录
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requests) {
      if (now - data.timestamp > windowMs) {
        requests.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    let data = requests.get(key);
    if (!data || now - data.timestamp > windowMs) {
      data = { count: 0, timestamp: now };
      requests.set(key, data);
    }

    data.count++;

    if (data.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((windowMs - (now - data.timestamp)) / 1000)
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - data.count);

    next();
  };
}

/**
 * 用户验证中间件 (简单版)
 */
function authMiddleware(options = {}) {
  const { apiKey, headerName = 'x-api-key' } = options;

  return (req, res, next) => {
    // 如果没有配置API Key,跳过验证
    if (!apiKey) {
      return next();
    }

    const providedKey = req.headers[headerName];

    if (providedKey !== apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing API key'
      });
    }

    next();
  };
}

/**
 * 请求验证中间件
 */
function validateRequest(schema) {
  return (req, res, next) => {
    const { body, params, query } = req;
    const errors = [];

    // 验证 body
    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        if (rules.required && !body[field]) {
          errors.push(`Missing required field: ${field}`);
        }
        if (rules.type && typeof body[field] !== rules.type) {
          errors.push(`Field ${field} must be ${rules.type}`);
        }
      }
    }

    // 验证 params
    if (schema.params) {
      for (const [field, rules] of Object.entries(schema.params)) {
        if (rules.required && !params[field]) {
          errors.push(`Missing required param: ${field}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    next();
  };
}

/**
 * 消息长度限制中间件
 */
function messageLengthLimit(maxLength = 4000) {
  return (req, res, next) => {
    const { message } = req.body;
    if (message && message.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Message too long. Maximum length is ${maxLength} characters.`
      });
    }
    next();
  };
}

/**
 * 用户ID验证中间件
 */
function validateUserId(req, res, next) {
  const { userId } = req.body || req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId is required'
    });
  }

  // 简单的格式验证
  if (typeof userId !== 'string' || userId.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Invalid userId format'
    });
  }

  next();
}

module.exports = {
  requestLogger,
  rateLimiter,
  authMiddleware,
  validateRequest,
  messageLengthLimit,
  validateUserId
};
