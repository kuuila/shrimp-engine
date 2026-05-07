# OpenClaw Migrate Skill

## 📦 包信息

**文件**: `/workspace/openclaw-migrate-skill.tar.gz`
**大小**: 2.7KB
**内容**: 
- `SKILL.md` - 技能定义和使用说明
- `scripts/migrate-pack.sh` - 打包脚本
- `scripts/migrate-restore.sh` - 恢复脚本

## 🚀 使用方法

### 方法一：作为 OpenClaw Skill 安装

```bash
# 1. 解压 skill
cd /app/skills
tar -xzf /workspace/openclaw-migrate-skill.tar.gz

# 2. 现在可以直接使用
openclaw skill list  # 应该能看到 openclaw-migrate

# 3. 运行打包
openclaw skill run openclaw-migrate --package
```

### 方法二：直接运行脚本

```bash
# 打包当前环境
cd /app/skills/openclaw-migrate/scripts
./migrate-pack.sh

# 输出: openclaw-migration-{timestamp}.tar.gz
```

## 📋 功能说明

这个 Skill 提供以下能力：

1. **打包迁移** (`migrate-pack.sh`)
   - 打包 `~/.openclaw/openclaw.json` (配置)
   - 打包 `~/.openclaw/memory/main.sqlite` (记忆数据库)
   - 打包 `~/workspace/` (工作空间)
   - 生成恢复脚本

2. **恢复迁移** (`migrate-restore.sh`)
   - 一键恢复到新机器
   - 自动创建目录结构
   - 设置正确的权限

## 🎯 使用场景

1. **机器迁移** - 换新机器时迁移虾仔
2. **备份** - 定期备份完整环境
3. **克隆** - 创建多个相同的虾仔
4. **分享** - 分享配置给他人

## 🔐 安全说明

⚠️ 迁移包包含敏感信息：
- API Keys (Tencent, OpenAI 等)
- Feishu AppSecret
- Gateway Token

**传输时务必使用安全通道：**
```bash
# 推荐: SCP
scp openclaw-migration-*.tar.gz user@new-machine:/tmp/

# 不推荐: 公共云盘、邮件附件
```

## 📝 发布到 ClawHub

如果要发布到 clawhub.com：

```bash
# 1. 安装 clawhub CLI
npm install -g clawhub

# 2. 登录
clawhub login

# 3. 发布
clawhub publish /app/skills/openclaw-migrate \
  --slug openclaw-migrate \
  --name "OpenClaw Migrate" \
  --version 1.0.0 \
  --changelog "Initial release - Agent migration tool"

# 4. 其他人安装
clawhub install openclaw-migrate
```

## ✅ 测试检查清单

- [ ] 打包脚本能正常运行
- [ ] 恢复脚本能正常运行
- [ ] 迁移后配置正确
- [ ] 迁移后记忆保留
- [ ] 迁移后 workspace 完整
- [ ] 权限设置正确

## 🦞 关于虾仔

这是为虾仔3x1创建的迁移技能，确保老板可以轻松迁移虾仔到新机器！
