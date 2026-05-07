/**
 * 对话 API 路由
 * /api/ai/chat - 聊天
 * /api/ai/sessions - 会话管理
 * /api/ai/personas - 人设管理
 * /api/ai/user/:userId - 用户状态
 */

const express = require('express');
const router = express.Router();
const { getShrimpAgent } = require('../ShrimpAgent');
const { getAllPersonas, matchPersona } = require('../prompts/shrimp-personas');

// 中间件：错误处理
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 获取智能体实例
function getAgent() {
  return getShrimpAgent({
    llm: {
      provider: process.env.LLM_PROVIDER || 'openai',
      apiKey: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL || 'gpt-4o-mini'
    }
  });
}

/**
 * POST /api/ai/chat
 * 发送消息
 * 
 * Body: {
 *   userId: string (必填)
 *   message: string (必填)
 *   sessionId?: string (可选,不传则使用用户活跃会话或创建新会话)
 *   personaId?: string (可选,如指定则使用此人设)
 *   stream?: boolean (可选,默认false)
 * }
 */
router.post('/chat', asyncHandler(async (req, res) => {
  const { userId, message, sessionId, personaId, stream = false } = req.body;

  // 参数验证
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: userId'
    });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: message'
    });
  }

  const agent = getAgent();

  // 流式响应
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const streamGen = agent.chat(userId, message, {
        sessionId,
        personaId,
        stream: true
      });

      for await (const chunk of streamGen.stream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
    return;
  }

  // 普通响应
  const response = await agent.chat(userId, message, {
    sessionId,
    personaId,
    stream: false
  });

  res.json({
    success: true,
    data: response
  });
}));

/**
 * POST /api/ai/quick-chat
 * 快速聊天 (自动匹配合适的人设)
 * 
 * Body: {
 *   userId: string (必填)
 *   message: string (必填)
 * }
 */
router.post('/quick-chat', asyncHandler(async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: userId, message'
    });
  }

  const agent = getAgent();
  const matchedPersona = matchPersona(message);

  const response = await agent.chat(userId, message, {
    personaId: matchedPersona,
    createContext: true
  });

  res.json({
    success: true,
    data: {
      ...response,
      matchedPersona
    }
  });
}));

/**
 * GET /api/ai/personas
 * 获取所有人设列表
 */
router.get('/personas', (req, res) => {
  const personas = getAllPersonas();
  res.json({
    success: true,
    data: personas
  });
});

/**
 * GET /api/ai/personas/:personaId
 * 获取单个人设详情
 */
router.get('/personas/:personaId', (req, res) => {
  const { personaId } = req.params;
  const personas = getAllPersonas();
  const persona = personas.find(p => p.id === personaId);

  if (!persona) {
    return res.status(404).json({
      success: false,
      error: `Persona not found: ${personaId}`
    });
  }

  res.json({
    success: true,
    data: persona
  });
});

/**
 * POST /api/ai/sessions
 * 创建新会话
 * 
 * Body: {
 *   userId: string (必填)
 *   personaId?: string (可选,默认 'commander')
 * }
 */
router.post('/sessions', asyncHandler(async (req, res) => {
  const { userId, personaId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: userId'
    });
  }

  const agent = getAgent();
  const sessionId = agent.createSession(userId, personaId);

  res.json({
    success: true,
    data: {
      sessionId,
      userId,
      personaId: personaId || 'commander',
      createdAt: Date.now()
    }
  });
}));

/**
 * GET /api/ai/sessions/:sessionId
 * 获取会话信息
 */
router.get('/sessions/:sessionId', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const agent = getAgent();

  const history = agent.getSessionHistory(sessionId, 50);
  const context = agent.contextManager.getContext(sessionId);

  if (!context) {
    return res.status(404).json({
      success: false,
      error: `Session not found: ${sessionId}`
    });
  }

  res.json({
    success: true,
    data: {
      sessionId,
      personaId: context.personaId,
      messageCount: context.metadata.messageCount,
      createdAt: context.metadata.createdAt,
      lastActiveAt: context.metadata.lastActiveAt,
      history: history.map(h => ({
        role: h.role,
        content: h.content,
        timestamp: h.timestamp
      }))
    }
  });
}));

/**
 * PUT /api/ai/sessions/:sessionId/persona
 * 切换会话人设
 * 
 * Body: {
 *   personaId: string (必填)
 * }
 */
router.put('/sessions/:sessionId/persona', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { personaId } = req.body;

  if (!personaId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: personaId'
    });
  }

  const agent = getAgent();
  const context = agent.switchPersona(sessionId, personaId);

  res.json({
    success: true,
    data: {
      sessionId,
      personaId: context.personaId,
      switchedAt: Date.now()
    }
  });
}));

/**
 * GET /api/ai/user/:userId
 * 获取用户状态
 */
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const agent = getAgent();

  const userState = agent.getUserState(userId);
  if (!userState) {
    return res.json({
      success: true,
      data: null
    });
  }

  res.json({
    success: true,
    data: {
      userId,
      activeSessionId: userState.activeSessionId,
      preferences: userState.preferences,
      sessionHistory: userState.sessionHistory
    }
  });
}));

/**
 * PUT /api/ai/user/:userId/preferences
 * 更新用户偏好
 * 
 * Body: {
 *   defaultPersona?: string
 *   responseStyle?: string
 *   language?: string
 * }
 */
router.put('/user/:userId/preferences', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const preferences = req.body;

  const agent = getAgent();
  const userState = agent.updateUserPreferences(userId, preferences);

  res.json({
    success: true,
    data: {
      userId,
      preferences: userState.preferences,
      updatedAt: Date.now()
    }
  });
}));

/**
 * GET /api/ai/stats
 * 获取系统统计
 */
router.get('/stats', (req, res) => {
  const agent = getAgent();
  const stats = agent.getStats();

  res.json({
    success: true,
    data: stats
  });
});

module.exports = router;
