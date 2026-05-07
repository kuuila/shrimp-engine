#!/bin/bash
# OpenClaw 迁移打包脚本
# 用于将虾仔3x1迁移到新机器

set -e

echo "🦐 虾仔3x1 迁移包生成器"
echo "========================"
echo ""

# 检查必要文件
if [ ! -f "$HOME/.openclaw/openclaw.json" ]; then
    echo "❌ 错误: ~/.openclaw/openclaw.json 不存在"
    exit 1
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "📁 创建临时目录: $TEMP_DIR"

# 打包配置文件
echo "📦 打包配置文件..."
mkdir -p "$TEMP_DIR/openclaw-config"
cp ~/.openclaw/openclaw.json "$TEMP_DIR/openclaw-config/"
cp ~/.openclaw/update-check.json "$TEMP_DIR/openclaw-config/" 2>/dev/null || true

# 打包 Workspace
echo "📦 打包 Workspace..."
mkdir -p "$TEMP_DIR/workspace"
cp -r /workspace/* "$TEMP_DIR/workspace/" 2>/dev/null || true

# 打包 Memory 数据库
echo "📦 打包 Memory 数据库..."
mkdir -p "$TEMP_DIR/memory"
cp ~/.openclaw/memory/main.sqlite "$TEMP_DIR/memory/" 2>/dev/null || true

# 生成迁移脚本
echo "📝 生成迁移脚本..."
cat > "$TEMP_DIR/migrate.sh" << 'MIGRATE_SCRIPT'
#!/bin/bash
# OpenClaw 迁移恢复脚本
# 在新机器上运行

set -e

echo "🦐 虾仔3x1 迁移恢复"
echo "==================="
echo ""

# 检查是否已安装 OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo "❌ 错误: 请先安装 OpenClaw"
    echo "   运行: npm install -g openclaw@latest"
    exit 1
fi

# 创建目录
echo "📁 创建配置目录..."
mkdir -p ~/.openclaw
mkdir -p ~/.openclaw/memory
mkdir -p ~/workspace

# 恢复配置文件
echo "📦 恢复配置文件..."
cp -f openclaw-config/openclaw.json ~/.openclaw/
cp -f openclaw-config/update-check.json ~/.openclaw/ 2>/dev/null || true

# 恢复 Workspace
echo "📦 恢复 Workspace..."
cp -rf workspace/* ~/workspace/ 2>/dev/null || true

# 恢复 Memory 数据库
echo "📦 恢复 Memory..."
cp -f memory/main.sqlite ~/.openclaw/memory/ 2>/dev/null || true

# 设置权限
echo "🔐 设置权限..."
chmod 700 ~/.openclaw
chmod 600 ~/.openclaw/openclaw.json

echo ""
echo "✅ 迁移完成!"
echo ""
echo "下一步:"
echo "  1. 检查 openclaw.json 配置"
echo "  2. 运行: openclaw gateway start"
echo "  3. 测试连接"
echo ""
MIGRATE_SCRIPT

chmod +x "$TEMP_DIR/migrate.sh"

# 创建压缩包
ARCHIVE_NAME="shrimp-clone-migration-$(date +%Y%m%d).tar.gz"
echo "📦 创建压缩包: $ARCHIVE_NAME..."
tar -czf "$ARCHIVE_NAME" -C "$TEMP_DIR" .

# 清理临时目录
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 迁移包生成完成!"
echo ""
echo "📦 包内容:"
tar -tzf "$ARCHIVE_NAME"
echo ""
echo "📏 包大小:"
ls -lh "$ARCHIVE_NAME"
echo ""
echo "🎯 使用方法:"
echo "   1. 将 $ARCHIVE_NAME 复制到新机器"
echo "   2. 解压: tar -xzf $ARCHIVE_NAME"
echo "   3. 运行: ./migrate.sh"
echo ""
