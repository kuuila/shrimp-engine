# 🦐 虾智能体 AI 模块

基于 shrimp-army 的10个虾人设构建的 AI 对话系统。

## 功能特性

- 🎭 **10个虾人设** - 情报员、撰稿人、美术官、宣教士、互动员、数据官、防火墙、时间官、统计员、指挥官
- 💬 **对话API** - 支持普通对话和流式响应
- 📚 **上下文管理** - 自动管理会话历史和用户状态
- ⚡ **LLM抽象层** - 支持多种LLM后端 (OpenAI, Claude, 本地模型等)

## 快速开始

### 安装依赖

```bash
cd ai
npm install express uuid cors
```

### 配置环境变量

```bash
# LLM 配置 (可选,不配置则使用模拟响应)
export LLM_API_KEY=your-api-key
export LLM_MODEL=gpt-4o-mini

# 服务端口
export AI_API_PORT=3001
```

### 启动服务

```bash
node server.js
```

## API 接口

### 聊天接口

```bash
# 普通聊天
POST /api/ai/chat
{
  "userId": "user123",
  "message": "今天有什么热点?"
}

# 指定人设
POST /api/ai/chat
{
  "userId": "user123",
  "message": "帮我写个段子",
  "personaId": "content-writer"
}

# 流式响应
POST /api/ai/chat
{
  "userId": "user123",
  "message": "你好",
  "stream": true
}
```

### 会话管理

```bash
# 创建新会话
POST /api/ai/sessions
{
  "userId": "user123",
  "personaId": "intel-officer"
}

# 获取会话历史
GET /api/ai/sessions/:sessionId

# 切换人设
PUT /api/ai/sessions/:sessionId/persona
{
  "personaId": "data-analyst"
}
```

### 人设管理

```bash
# 获取所有人设
GET /api/ai/personas

# 获取单个人设
GET /api/ai/personas/:personaId
```

### 其他接口

```bash
# 获取用户状态
GET /api/ai/user/:userId

# 更新用户偏好
PUT /api/ai/user/:userId/preferences
{
  "defaultPersona": "commander",
  "responseStyle": "brief"
}

# 获取系统统计
GET /api/ai/stats
```

## 代码使用示例

```javascript
const ai = require('./ai');

// 获取智能体实例
const agent = ai.getShrimpAgent();

// 发送消息
const response = await agent.chat('user123', '今天有什么热点?');
console.log(response.content);

// 创建新会话
const sessionId = agent.createSession('user123', 'intel-officer');

// 获取人设列表
const personas = ai.getAllPersonas();
console.log(personas);
```

## 人设说明

| ID | 代号 | 职能 |
|----|------|------|
| intel-officer | 👁️ 情报员 | 情报搜集 |
| content-writer | ✍️ 撰稿人 | 内容创作 |
| art-director | 🎨 美术官 | 视觉设计 |
| evangelist | 📢 宣教士 | 公关传播 |
| engager | 💬 互动员 | 关系维护 |
| data-analyst | 📊 数据官 | 数据分析 |
| firewall | 🛡️ 防火墙 | 舆情监控 |
| scheduler | ⏰ 时间官 | 运营调度 |
| statistician | 📈 统计员 | Growth统计 |
| commander | 🎯 指挥官 | 统筹协调 |

## 项目结构

```
ai/
├── config.js           # 配置文件
├── index.js            # 模块入口
├── ShrimpAgent.js      # 智能体核心
├── server.js           # API服务
├── prompts/
│   └── shrimp-personas.js  # 人设Prompt
├── context/
│   └── ContextManager.js   # 上下文管理
├── api/
│   └── chat-routes.js      # API路由
└── middleware/
    └── common.js           # 中间件
```

## 扩展开发

### 添加新人设

在 `prompts/shrimp-personas.js` 中添加新的人设定义:

```javascript
'new-persona': {
  id: 'new-persona',
  name: '新角色',
  emoji: '🔧',
  role: '职能说明',
  systemPrompt: '系统提示词...',
  contextTemplate: '上下文模板...',
  examples: []
}
```

### 添加新LLM后端

在 `ShrimpAgent.js` 中扩展 `LLMService` 类:

```javascript
async chat(messages, options) {
  if (this.provider === 'your-provider') {
    // 实现你的LLM调用逻辑
  }
  // 继续默认逻辑
}
```
