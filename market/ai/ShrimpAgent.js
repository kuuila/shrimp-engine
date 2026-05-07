/**
 * 虾智能体核心 - AI Agent 架构
 */

const { getPersonaSystemPrompt, getPersona, matchPersona } = require('./prompts/shrimp-personas');
const { getContextManager } = require('./context/ContextManager');

/**
 * LLM 服务抽象层
 * 支持多种LLM后端: OpenAI, Claude, 本地模型等
 */
class LLMService {
  constructor(config = {}) {
    this.provider = config.provider || 'openai';
    this.apiKey = config.apiKey || process.env.LLM_API_KEY;
    this.baseUrl = config.baseUrl || process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
    this.model = config.model || process.env.LLM_MODEL || 'gpt-4o-mini';
    this.maxTokens = config.maxTokens || 2000;
    this.temperature = config.temperature || 0.7;
  }

  /**
   * 调用LLM API
   */
  async chat(messages, options = {}) {
    const {
      model = this.model,
      maxTokens = this.maxTokens,
      temperature = this.temperature,
      stream = false
    } = options;

    // 检查API Key
    if (!this.apiKey) {
      // 返回模拟响应 (开发环境)
      return this.mockResponse(messages);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      };
    } catch (error) {
      console.error('LLM API call failed:', error);
      return this.mockResponse(messages);
    }
  }

  /**
   * 模拟响应 (开发/测试用)
   */
  mockResponse(messages) {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content || '';

    // 简单的模拟逻辑
    const responses = [
      `收到你的消息了: "${content.substring(0, 50)}..."`,
      `好的，让我来处理一下这个问题~`,
      `明白了，我来帮你分析一下！`
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      model: 'mock-model'
    };
  }

  /**
   * 流式响应
   */
  async *streamChat(messages, options = {}) {
    const response = await this.chat(messages, { ...options, stream: false });
    // 简单的流式模拟
    const words = response.content.split('');
    for (const word of words) {
      yield word;
      await new Promise(r => setTimeout(r, 20));
    }
  }
}

/**
 * 虾智能体
 */
class ShrimpAgent {
  constructor(config = {}) {
    this.llm = new LLMService(config.llm);
    this.contextManager = getContextManager();
    this.defaultPersona = config.defaultPersona || 'commander';
  }

  /**
   * 处理用户消息
   * @param {string} userId 用户ID
   * @param {string} message 用户消息
   * @param {object} options 选项
   */
  async chat(userId, message, options = {}) {
    const {
      personaId,
      sessionId,
      createContext = true,
      stream = false
    } = options;

    // 1. 确定人设
    const targetPersona = personaId || matchPersona(message);
    const persona = getPersona(targetPersona);

    if (!persona) {
      throw new Error(`Persona not found: ${targetPersona}`);
    }

    // 2. 获取或创建上下文
    let context;
    if (sessionId) {
      context = this.contextManager.getContext(sessionId);
    } else {
      context = this.contextManager.getUserActiveSession(userId);
    }

    if (!context && createContext) {
      const newSessionId = this.contextManager.createSession(userId, targetPersona);
      context = this.contextManager.getContext(newSessionId);
    }

    if (!context) {
      throw new Error('No active session found');
    }

    // 3. 构建消息
    const systemPrompt = getPersonaSystemPrompt(targetPersona);

    // 添加用户消息到上下文
    context.addMessage('user', message);

    // 构建完整消息历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.getFormattedMessageHistory()
    ];

    // 4. 调用LLM
    let response;
    if (stream) {
      // 流式响应
      const streamGenerator = this.llm.streamChat(messages);
      response = { stream: streamGenerator, sessionId: context.sessionId };
    } else {
      // 普通响应
      const llmResponse = await this.llm.chat(messages);

      // 添加助手回复到上下文
      context.addMessage('assistant', llmResponse.content);

      response = {
        content: llmResponse.content,
        persona: {
          id: persona.id,
          name: persona.name,
          emoji: persona.emoji
        },
        sessionId: context.sessionId,
        usage: llmResponse.usage
      };
    }

    return response;
  }

  /**
   * 创建新会话
   */
  createSession(userId, personaId) {
    return this.contextManager.createSession(userId, personaId || this.defaultPersona);
  }

  /**
   * 切换人设
   */
  switchPersona(sessionId, newPersonaId) {
    return this.contextManager.switchPersona(sessionId, newPersonaId);
  }

  /**
   * 获取会话历史
   */
  getSessionHistory(sessionId, limit = 20) {
    const context = this.contextManager.getContext(sessionId);
    if (!context) {
      return [];
    }
    return context.getRecentMessages(limit);
  }

  /**
   * 获取用户状态
   */
  getUserState(userId) {
    return this.contextManager.getUserState(userId);
  }

  /**
   * 更新用户偏好
   */
  updateUserPreferences(userId, preferences) {
    return this.contextManager.updateUserPreferences(userId, preferences);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return this.contextManager.getStats();
  }
}

// 单例
let agentInstance = null;

function getShrimpAgent(config = {}) {
  if (!agentInstance) {
    agentInstance = new ShrimpAgent(config);
  }
  return agentInstance;
}

module.exports = {
  ShrimpAgent,
  LLMService,
  getShrimpAgent
};
