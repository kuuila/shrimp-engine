/**
 * 上下文管理器 - 管理对话上下文和用户状态
 */

const crypto = require('crypto');

// 生成UUID
function uuidv4() {
  return crypto.randomUUID();
}

// 内存存储 (生产环境应使用Redis)
const conversations = new Map();
const userStates = new Map();

// 配置
const CONFIG = {
  maxContextLength: 20,      // 保留最近N条消息
  contextExpiryMs: 3600000, // 上下文过期时间 (1小时)
  maxUsers: 1000            // 最大用户数
};

/**
 * 会话上下文
 */
class ConversationContext {
  constructor(sessionId, personaId) {
    this.sessionId = sessionId;
    this.personaId = personaId;
    this.messages = [];
    this.metadata = {
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      messageCount: 0
    };
    this.state = {}; // 自定义状态
  }

  /**
   * 添加消息
   */
  addMessage(role, content, metadata = {}) {
    const message = {
      id: uuidv4(),
      role, // 'user' | 'assistant' | 'system'
      content,
      timestamp: Date.now(),
      ...metadata
    };

    this.messages.push(message);
    this.metadata.lastActiveAt = Date.now();
    this.metadata.messageCount++;

    // 保持消息数量限制
    if (this.messages.length > CONFIG.maxContextLength) {
      this.messages = this.messages.slice(-CONFIG.maxContextLength);
    }

    return message;
  }

  /**
   * 获取格式化的消息历史 (用于API调用)
   */
  getFormattedMessageHistory() {
    return this.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 获取最近N条消息
   */
  getRecentMessages(n = 10) {
    return this.messages.slice(-n);
  }

  /**
   * 更新状态
   */
  updateState(key, value) {
    this.state[key] = value;
    this.metadata.lastActiveAt = Date.now();
  }

  /**
   * 获取状态
   */
  getState(key) {
    return this.state[key];
  }

  /**
   * 检查是否过期
   */
  isExpired() {
    return Date.now() - this.metadata.lastActiveAt > CONFIG.contextExpiryMs;
  }

  /**
   * 导出上下文 (用于持久化)
   */
  export() {
    return {
      sessionId: this.sessionId,
      personaId: this.personaId,
      messages: this.messages,
      metadata: this.metadata,
      state: this.state
    };
  }

  /**
   * 从导出数据恢复
   */
  static import(data) {
    const ctx = new ConversationContext(data.sessionId, data.personaId);
    ctx.messages = data.messages;
    ctx.metadata = data.metadata;
    ctx.state = data.state || {};
    return ctx;
  }
}

/**
 * 用户状态
 */
class UserState {
  constructor(userId) {
    this.userId = userId;
    this.activeSessionId = null;
    this.sessionHistory = []; // 最近的会话ID列表
    this.preferences = {
      defaultPersona: 'commander',
      responseStyle: 'normal', // 'normal' | 'brief' | 'detailed'
      language: 'zh-CN'
    };
    this.metadata = {
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };
  }

  /**
   * 设置活跃会话
   */
  setActiveSession(sessionId) {
    if (this.activeSessionId) {
      // 保存历史
      this.sessionHistory.unshift(this.activeSessionId);
      if (this.sessionHistory.length > 10) {
        this.sessionHistory.pop();
      }
    }
    this.activeSessionId = sessionId;
    this.metadata.lastActiveAt = Date.now();
  }

  /**
   * 更新偏好设置
   */
  updatePreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
    this.metadata.lastActiveAt = Date.now();
  }

  /**
   * 导出
   */
  export() {
    return {
      userId: this.userId,
      activeSessionId: this.activeSessionId,
      sessionHistory: this.sessionHistory,
      preferences: this.preferences,
      metadata: this.metadata
    };
  }

  /**
   * 从导出数据恢复
   */
  static import(data) {
    const state = new UserState(data.userId);
    state.activeSessionId = data.activeSessionId;
    state.sessionHistory = data.sessionHistory || [];
    state.preferences = data.preferences || state.preferences;
    state.metadata = data.metadata;
    return state;
  }
}

/**
 * 上下文管理器
 */
class ContextManager {
  constructor() {
    this.conversations = conversations;
    this.userStates = userStates;
    this.cleanupInterval = null;
    this.startCleanupTask();
  }

  /**
   * 创建新会话
   */
  createSession(userId, personaId = 'commander') {
    const sessionId = uuidv4();
    const context = new ConversationContext(sessionId, personaId);

    this.conversations.set(sessionId, context);

    // 更新用户状态
    let userState = this.userStates.get(userId);
    if (!userState) {
      userState = new UserState(userId);
      this.userStates.set(userId, userState);
    }
    userState.setActiveSession(sessionId);

    return sessionId;
  }

  /**
   * 获取会话上下文
   */
  getContext(sessionId) {
    const context = this.conversations.get(sessionId);
    if (!context) {
      return null;
    }
    if (context.isExpired()) {
      this.conversations.delete(sessionId);
      return null;
    }
    return context;
  }

  /**
   * 获取用户的活跃会话
   */
  getUserActiveSession(userId) {
    const userState = this.userStates.get(userId);
    if (!userState || !userState.activeSessionId) {
      return null;
    }
    return this.getContext(userState.activeSessionId);
  }

  /**
   * 切换会话人设
   */
  switchPersona(sessionId, newPersonaId) {
    const context = this.conversations.get(sessionId);
    if (!context) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    context.personaId = newPersonaId;
    return context;
  }

  /**
   * 添加消息到会话
   */
  addMessage(sessionId, role, content, metadata = {}) {
    const context = this.conversations.get(sessionId);
    if (!context) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return context.addMessage(role, content, metadata);
  }

  /**
   * 获取用户状态
   */
  getUserState(userId) {
    return this.userStates.get(userId);
  }

  /**
   * 更新用户偏好
   */
  updateUserPreferences(userId, preferences) {
    let userState = this.userStates.get(userId);
    if (!userState) {
      userState = new UserState(userId);
      this.userStates.set(userId, userState);
    }
    userState.updatePreferences(preferences);
    return userState;
  }

  /**
   * 清理过期会话
   */
  cleanup() {
    let cleaned = 0;
    for (const [sessionId, context] of this.conversations) {
      if (context.isExpired()) {
        this.conversations.delete(sessionId);
        cleaned++;
      }
    }

    // 清理过多的用户状态
    if (this.userStates.size > CONFIG.maxUsers) {
      const sortedUsers = [...this.userStates.entries()]
        .sort((a, b) => b[1].metadata.lastActiveAt - a[1].metadata.lastActiveAt);

      this.userStates.clear();
      sortedUsers.slice(0, CONFIG.maxUsers).forEach(([id, state]) => {
        this.userStates.set(id, state);
      });
    }

    return cleaned;
  }

  /**
   * 启动清理任务
   */
  startCleanupTask() {
    // 每10分钟清理一次
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 600000);
  }

  /**
   * 停止清理任务
   */
  stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalSessions: this.conversations.size,
      totalUsers: this.userStates.size,
      activeSessions: [...this.conversations.values()].filter(c => !c.isExpired()).length
    };
  }

  /**
   * 导出所有数据 (用于备份)
   */
  exportAll() {
    return {
      conversations: Object.fromEntries(
        [...this.conversations].map(([id, ctx]) => [id, ctx.export()])
      ),
      userStates: Object.fromEntries(
        [...this.userStates].map(([id, state]) => [id, state.export()])
      ),
      exportedAt: Date.now()
    };
  }

  /**
   * 导入数据 (用于恢复)
   */
  importAll(data) {
    if (data.conversations) {
      for (const [id, ctxData] of Object.entries(data.conversations)) {
        this.conversations.set(id, ConversationContext.import(ctxData));
      }
    }
    if (data.userStates) {
      for (const [id, stateData] of Object.entries(data.userStates)) {
        this.userStates.set(id, UserState.import(stateData));
      }
    }
  }
}

// 单例
let contextManagerInstance = null;

function getContextManager() {
  if (!contextManagerInstance) {
    contextManagerInstance = new ContextManager();
  }
  return contextManagerInstance;
}

module.exports = {
  ContextManager,
  ConversationContext,
  UserState,
  getContextManager
};
