const { getShrimpAgent, ShrimpAgent, LLMService } = require('./ShrimpAgent');
const { getContextManager, ContextManager } = require('./context/ContextManager');
const { getAllPersonas, getPersona, matchPersona, SHRIMP_PERSONAS } = require('./prompts/shrimp-personas');

// 懒加载路由 (只在需要时加载express)
let chatRoutes = null;
function getChatRoutes() {
  if (!chatRoutes) {
    chatRoutes = require('./api/chat-routes');
  }
  return chatRoutes;
}

module.exports = {
  // 核心类
  ShrimpAgent,
  LLMService,
  ContextManager,

  // 工具函数
  getShrimpAgent,
  getContextManager,
  getAllPersonas,
  getPersona,
  matchPersona,

  // 数据
  SHRIMP_PERSONAS,

  // API路由 (懒加载)
  get chatRoutes() { return getChatRoutes(); },

  // 配置常量
  PERSONA_IDS: Object.keys(SHRIMP_PERSONAS),

  // 默认配置
  DEFAULT_CONFIG: {
    maxContextLength: 20,
    contextExpiryMs: 3600000,
    defaultPersona: 'commander',
    temperature: 0.7,
    maxTokens: 2000
  }
};
