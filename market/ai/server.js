/**
 * AI API 服务启动脚本
 * 
 * 使用方法:
 *   node server.js
 * 
 * 环境变量:
 *   LLM_API_KEY      - LLM API密钥
 *   LLM_MODEL        - 模型名称 (默认: gpt-4o-mini)
 *   AI_API_PORT      - 服务端口 (默认: 3001)
 */

const express = require('express');
const cors = require('cors');
const ai = require('./ai');

const app = express();
const PORT = process.env.AI_API_PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'shrimp-ai',
    version: '1.0.0',
    stats: ai.getShrimpAgent().getStats()
  });
});

// API路由
app.use('/api/ai', ai.chatRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║          🦐 虾智能体 AI 服务已启动                   ║
╠═══════════════════════════════════════════════════╣
║  Port: ${PORT}
║  Personas: ${ai.PERSONA_IDS.length}
║  Default: ${ai.DEFAULT_CONFIG.defaultPersona}
╚═══════════════════════════════════════════════════╝

可用 API:
  GET  /health                    - 健康检查
  GET  /api/ai/personas           - 获取人设列表
  GET  /api/ai/personas/:id       - 获取人设详情
  POST /api/ai/chat               - 发送消息
  POST /api/ai/quick-chat        - 快速聊天(自动匹配人设)
  POST /api/ai/sessions           - 创建会话
  GET  /api/ai/sessions/:id       - 获取会话信息
  PUT  /api/ai/sessions/:id/persona - 切换人设
  GET  /api/ai/user/:userId        - 获取用户状态
  GET  /api/ai/stats              - 系统统计
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  const cm = ai.getContextManager();
  cm.stopCleanupTask();
  process.exit(0);
});
