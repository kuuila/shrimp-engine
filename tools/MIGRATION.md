# 🦐 虾仔3x1 迁移包说明

## 迁移包位置
`/workspace/shrimp-clone-migration-20260313.tar.gz`

## 包内容

```
├── openclaw-config/
│   ├── openclaw.json          # 核心配置文件（含API Key）
│   └── update-check.json      # 更新检查配置
├── workspace/                 # 完整工作空间
│   ├── MEMORY.md              # 记忆文件
│   ├── SOUL.md                # 个性/风格定义
│   ├── IDENTITY.md            # 身份配置
│   ├── USER.md                # 用户信息
│   ├── TOOLS.md               # 工具说明
│   ├── AGENTS.md              # 代理配置
│   ├── BOOTSTRAP.md           # 启动引导
│   ├── HEARTBEAT.md           # 定时任务
│   ├── config/agent.json      # 代理配置
│   ├── memory/                # 记忆目录
│   └── scripts/               # 脚本目录
├── memory/
│   └── main.sqlite            # SQLite 记忆数据库
└── migrate.sh                 # 一键恢复脚本
```

## 使用方法

### 1. 下载迁移包
将 `shrimp-clone-migration-20260313.tar.gz` 下载到本地

### 2. 传输到新机器
```bash
scp shrimp-clone-migration-20260313.tar.gz user@new-machine:/tmp/
```

### 3. 新机器操作
```bash
# SSH 到新机器
ssh user@new-machine

# 安装 OpenClaw
npm install -g openclaw@latest

# 解压迁移包
cd /tmp
tar -xzf shrimp-clone-migration-20260313.tar.gz

# 运行恢复脚本
./migrate.sh
```

### 4. 手动恢复（如果脚本失败）
```bash
# 恢复配置文件
mkdir -p ~/.openclaw ~/.openclaw/memory ~/workspace
cp openclaw-config/openclaw.json ~/.openclaw/
cp memory/main.sqlite ~/.openclaw/memory/
cp -r workspace/* ~/workspace/

# 设置权限
chmod 700 ~/.openclaw
chmod 600 ~/.openclaw/openclaw.json
```

### 5. 启动验证
```bash
# 启动 Gateway
openclaw gateway start --port 8081

# 检查状态
openclaw status

# 测试飞书连接
# 发送一条消息到飞书，看看虾仔是否响应
```

## ⚠️ 注意事项

### 安全配置
- `openclaw.json` 包含 **API Key 和 AppSecret**
- 传输时确保使用安全通道（SSH/SCP）
- 不要上传到公共云盘

### 可能需要修改的配置
迁移后可能需要根据新机器环境修改：

```json
// ~/.openclaw/openclaw.json
{
  "gateway": {
    "port": 8081,        // 如果端口冲突，修改这里
    "bind": "lan"        // 如果需要公网访问，改为 "0.0.0.0"
  },
  "agents": {
    "defaults": {
      "workspace": "/workspace"  // 如果 workspace 路径不同，修改这里
    }
  }
}
```

### 飞书配置
飞书机器人配置（AppID/AppSecret）在 `openclaw.json` 中已包含，
但可能需要重新配置 **Webhook URL** 指向新机器的 IP/域名。

### 模型 API
Tencent API Key 已包含在配置中，可以直接使用。

## 🔒 安全提醒

1. **迁移完成后**，建议删除本地的迁移包
2. **API Key 不要泄露** - 如果怀疑泄露，去腾讯云控制台重新生成
3. **Feishu AppSecret** - 如果泄露，在飞书开发者后台重置

## 📝 迁移检查清单

- [ ] 新机器已安装 Node.js ≥ 22
- [ ] 新机器已安装 OpenClaw
- [ ] 迁移包已解压
- [ ] 配置文件已恢复到 ~/.openclaw/
- [ ] Workspace 已恢复到 ~/workspace/
- [ ] Memory 数据库已恢复
- [ ] Gateway 能正常启动
- [ ] 飞书消息能正常接收
- [ ] 模型调用正常

---
*虾女团 01 号成员 🦐*
*生成时间: 2026-03-13*
