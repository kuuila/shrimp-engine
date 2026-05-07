/**
 * AI 模块配置文件
 * 
 * 配置优先级: 环境变量 > 配置文件
 */

// LLM 配置
module.exports = {
  // LLM 服务商: openai | claude | azure | local
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    apiKey: process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || 2000,
    temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7
  },

  // 智能体默认配置
  agent: {
    defaultPersona: process.env.DEFAULT_PERSONA || 'commander',
    maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH) || 20,
    contextExpiryMs: parseInt(process.env.CONTEXT_EXPIRY_MS) || 3600000 // 1小时
  },

  // 上下文管理
  context: {
    maxUsers: parseInt(process.env.MAX_CONTEXT_USERS) || 1000,
    cleanupIntervalMs: parseInt(process.env.CLEANUP_INTERVAL_MS) || 600000, // 10分钟
    enablePersistence: process.env.ENABLE_CONTEXT_PERSISTENCE === 'true' || false
  },

  // API 配置
  api: {
    port: parseInt(process.env.AI_API_PORT) || 3001,
    prefix: '/api/ai',
    enableCors: process.env.ENABLE_CORS === 'true' || true
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableLLMLogging: process.env.ENABLE_LLM_LOGGING === 'true' || false
  }
};
