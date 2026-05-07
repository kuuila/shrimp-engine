#!/bin/bash
# 虾女团启动脚本
# 根据环境变量动态加载配置

set -e

AGENT_NAME=${AGENT_NAME:-shrimp}
AGENT_TYPE=${AGENT_TYPE:-generic}
CONFIG_FILE="/app/configs/${AGENT_NAME}.conf"

echo "🦐 启动虾女团 Agent: ${AGENT_NAME} (${AGENT_TYPE})"
echo "📄 配置文件: ${CONFIG_FILE}"

# 如果有特定配置文件，使用它
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" /app/shrimp.conf
    echo "✅ 已加载 ${AGENT_NAME} 配置"
fi

# 根据角色类型设置环境
case "$AGENT_TYPE" in
    scout)
        echo "👁️ 情报员模式启动"
        ;;
    writer)
        echo "✍️ 撰稿人模式启动"
        ;;
    artist)
        echo "🎨 美术官模式启动"
        ;;
    evangelist)
        echo "📢 宣教士模式启动"
        ;;
    interactor)
        echo "💬 互动员模式启动"
        ;;
    analyst)
        echo "📊 数据官模式启动"
        ;;
    firewall)
        echo "🛡️ 防火墙模式启动"
        ;;
    scheduler)
        echo "⏰ 时间官模式启动"
        ;;
    statistician)
        echo "📈 统计员模式启动"
        ;;
    commander)
        echo "🎯 指挥官模式启动"
        ;;
    *)
        echo "🦐 通用 Agent 模式"
        ;;
esac

# 启动守护进程
exec /app/shrimp_daemon -d -c /app/shrimp.conf
