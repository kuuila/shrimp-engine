#!/bin/bash
# 虾女团 - Docker 管理脚本
# shrimp-manage.sh

COMPOSE_FILE="docker-compose.yml"

usage() {
    echo "虾女团 Docker 管理"
    echo ""
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  build     构建镜像"
    echo "  up        启动全部 Agent"
    echo "  down      停止全部 Agent"
    echo "  restart   重启全部 Agent"
    echo "  status    查看状态"
    echo "  logs      查看日志"
    echo "  exec      进入容器 (例: $0 exec scout)"
    echo "  scout     单独启动情报员"
    echo "  writer    单独启动撰稿人"
    echo "  artist    单独启动美术官"
    echo "  cmd       单独启动指挥官"
    echo "  all       启动全部 (build + up)"
    echo ""
}

case "$1" in
    build)
        echo "🐳 构建镜像..."
        docker-compose -f $COMPOSE_FILE build
        ;;
    up)
        echo "🚀 启动虾女团..."
        docker-compose -f $COMPOSE_FILE up -d
        ;;
    down)
        echo "⛔ 停止虾女团..."
        docker-compose -f $COMPOSE_FILE down
        ;;
    restart)
        echo "🔄 重启虾女团..."
        docker-compose -f $COMPOSE_FILE restart
        ;;
    status)
        echo "📊 虾女团状态"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    logs)
        echo "📜 查看日志"
        if [ -z "$2" ]; then
            docker-compose -f $COMPOSE_FILE logs -f
        else
            docker-compose -f $COMPOSE_FILE logs -f "$2"
        fi
        ;;
    exec)
        if [ -z "$2" ]; then
            echo "请指定容器名 (例: $0 exec scout)"
            exit 1
        fi
        docker-compose -f $COMPOSE_FILE exec "$2" sh
        ;;
    scout)
        docker-compose -f $COMPOSE_FILE up -d scout
        ;;
    writer)
        docker-compose -f $COMPOSE_FILE up -d writer
        ;;
    artist)
        docker-compose -f $COMPOSE_FILE up -d artist
        ;;
    cmd|commander)
        docker-compose -f $COMPOSE_FILE up -d commander
        ;;
    all)
        echo "🦐 一键部署虾女团..."
        docker-compose -f $COMPOSE_FILE build
        docker-compose -f $COMPOSE_FILE up -d
        echo ""
        echo "✅ 虾女团已启动!"
        echo "   指挥官面板: http://localhost:8080"
        echo "   宣教士接口: http://localhost:8001"
        ;;
    *)
        usage
        ;;
esac
