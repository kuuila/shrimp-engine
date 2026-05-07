#include "daemon.hpp"
#include "config.hpp"
#include "http_server.hpp"
#include <iostream>
#include <csignal>
#include <memory>
#include <thread>
#include <atomic>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <string>

using namespace shrimp;

std::unique_ptr<Daemon> g_daemon;
std::unique_ptr<HttpServer> g_http_server;
std::atomic<bool> g_running{false};

void signalHandler(int signal) {
    std::cout << "\nReceived signal " << signal << ", shutting down..." << std::endl;
    g_running = false;
    if (g_daemon) {
        g_daemon->stop();
    }
}

void printBanner() {
    std::cout << R"(
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🦐 ShrimpDaemon v1.0.0 - 24/7 Agent Framework              ║
║                                                              ║
║   "撒旦的化身，魔女与天使的两面派"                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
)" << std::endl;
}

void printHelp() {
    std::cout << R"(
Usage: shrimp_daemon [options]

Options:
  -c, --config <path>   配置文件路径 (默认: ./shrimp.conf)
  -i, --interactive     交互模式 (命令行)
  -d, --daemon          以守护进程模式运行
  -h, --help            显示帮助信息
  -v, --version         显示版本信息

Interactive Commands:
  help, ?               显示帮助
  status, s             查看所有Agent状态
  task <name> <action>  执行任务 (e.g., task scout run)
  list                   列出所有可用Agent
  info <agent>          查看Agent详细信息
  memory <agent>         查看Agent记忆
  timeline <agent>       查看Agent时间线
  log [level]           查看日志 (debug/info/warn/error)
  clear                 清屏
  quit, exit, q         退出程序

Examples:
  shrimp_daemon -i               # 交互模式启动
  status                         # 查看状态
  task scout run                 # 手动触发情报员
  info scout                     # 查看情报员信息
  memory writer                  # 查看撰稿人记忆

Architecture:
  ┌─────────────────┐
  │  Main Daemon    │
  └────────┬────────┘
           │
    ┌──────┼──────┐
    │      │      │
  ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
  │Scout│ │Writer│ │Artist│
  └─────┘ └──────┘ └──────┘
)" << std::endl;
}

void printStatus() {
    std::cout << "\n╔═══════════════════════════════════════════════════════════╗\n";
    std::cout << "║                    Agent Status                           ║\n";
    std::cout << "╠═══════════════════════════════════════════════════════════╣\n";
    std::cout << "║ Agent       │ Status    │ Type       │ Last Run            ║\n";
    std::cout << "╠═══════════════════════════════════════════════════════════╣\n";
    // TODO: 从daemon获取真实状态
    auto now = std::time(nullptr);
    std::cout << "║ scout       │ IDLE      │ SCOUT      │ " << std::put_time(std::localtime(&now), "%H:%M:%S") << "         ║\n";
    std::cout << "║ writer      │ IDLE      │ WRITER     │ " << std::put_time(std::localtime(&now), "%H:%M:%S") << "         ║\n";
    std::cout << "║ artist      │ IDLE      │ ARTIST     │ " << std::put_time(std::localtime(&now), "%H:%M:%S") << "         ║\n";
    std::cout << "╚═══════════════════════════════════════════════════════════╝\n";
}

void printAgents() {
    std::cout << "\n╔═══════════════════════════════════════════════════════════╗\n";
    std::cout << "║                   Available Agents                        ║\n";
    std::cout << "╠═══════════════════════════════════════════════════════════╣\n";
    std::cout << "║ scout       │ 情报员    │ 搜集情报，每2小时执行              ║\n";
    std::cout << "║ writer     │ 撰稿人    │ 生成内容，8/12/20点执行            ║\n";
    std::cout << "║ artist     │ 美术官    │ 生成视觉，每天9点执行              ║\n";
    std::cout << "╚═══════════════════════════════════════════════════════════╝\n";
}

bool processCommand(const std::string& cmd, Daemon* daemon) {
    std::istringstream iss(cmd);
    std::string action;
    iss >> action;
    
    if (action == "help" || action == "?") {
        printHelp();
    } else if (action == "status" || action == "s") {
        printStatus();
    } else if (action == "list") {
        printAgents();
    } else if (action == "info") {
        std::string agent;
        iss >> agent;
        if (agent.empty()) {
            std::cout << "Usage: info <agent_name>\n";
            std::cout << "Example: info scout\n";
        } else if (agent == "scout") {
            std::cout << "\n[Agent: scout]\n";
            std::cout << "  Type: SCOUT\n";
            std::cout << "  Name: 情报员\n";
            std::cout << "  Description: 搜集情报，每2小时执行\n";
        } else if (agent == "writer") {
            std::cout << "\n[Agent: writer]\n";
            std::cout << "  Type: WRITER\n";
            std::cout << "  Name: 撰稿人\n";
            std::cout << "  Description: 生成内容，8/12/20点执行\n";
        } else if (agent == "artist") {
            std::cout << "\n[Agent: artist]\n";
            std::cout << "  Type: ARTIST\n";
            std::cout << "  Name: 美术官\n";
            std::cout << "  Description: 生成视觉，每天9点执行\n";
        } else {
            std::cout << "Unknown agent: " << agent << "\n";
        }
    } else if (action == "task") {
        std::string agent, taskAction;
        iss >> agent >> taskAction;
        if (agent.empty() || taskAction.empty()) {
            std::cout << "Usage: task <agent> <action>\n";
            std::cout << "Example: task scout run\n";
        } else {
            std::cout << ">> Executing task: " << agent << " " << taskAction << "\n";
            // TODO: 实际触发任务
        }
    } else if (action == "memory") {
        std::string agent;
        iss >> agent;
        if (agent.empty()) {
            std::cout << "Usage: memory <agent_name>\n";
        } else {
            std::cout << "\n[Memory: " << agent << "]\n";
            std::cout << "  (Memory data would be displayed here)\n";
        }
    } else if (action == "timeline") {
        std::string agent;
        iss >> agent;
        if (agent.empty()) {
            std::cout << "Usage: timeline <agent_name>\n";
        } else {
            std::cout << "\n[Timeline: " << agent << "]\n";
            std::cout << "  (Timeline events would be displayed here)\n";
        }
    } else if (action == "log") {
        std::string level;
        iss >> level;
        if (level.empty()) {
            level = "info";
        }
        std::cout << "Log level: " << level << "\n";
    } else if (action == "clear") {
        std::cout << "\033[2J\033[1;1H";
        printBanner();
    } else if (action == "quit" || action == "exit" || action == "q") {
        g_running = false;
        if (daemon) daemon->stop();
        std::cout << "Goodbye! 🦐\n";
        return false;
    } else if (!action.empty()) {
        std::cout << "Unknown command: " << action << "\n";
        std::cout << "Type 'help' for available commands.\n";
    }
    
    return true;
}

void runInteractiveMode(Daemon& daemon) {
    std::string cmd;
    
    std::cout << "\n";
    std::cout << "═══════════════════════════════════════════════════════════════\n";
    std::cout << "  🦐 ShrimpDaemon Interactive Mode\n";
    std::cout << "  Type 'help' for commands, 'quit' to exit\n";
    std::cout << "═══════════════════════════════════════════════════════════════\n";
    std::cout << "\n";
    
    printStatus();
    
    std::cout << "\nshrimp> ";
    
    while (g_running && std::getline(std::cin, cmd)) {
        // 去除前后空格
        cmd.erase(0, cmd.find_first_not_of(" \t"));
        cmd.erase(cmd.find_last_not_of(" \t") + 1);
        
        if (cmd.empty()) {
            std::cout << "shrimp> ";
            continue;
        }
        
        if (!processCommand(cmd, &daemon)) {
            break;
        }
        
        std::cout << "\nshrimp> ";
    }
}

int main(int argc, char* argv[]) {
    printBanner();
    
    // 解析命令行参数
    std::string configPath = "./shrimp.conf";
    bool interactiveMode = false;
    bool daemonMode = false;
    
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "-h" || arg == "--help") {
            printHelp();
            return 0;
        } else if (arg == "-v" || arg == "--version") {
            std::cout << "ShrimpDaemon version 1.0.0" << std::endl;
            return 0;
        } else if (arg == "-c" || arg == "--config") {
            if (i + 1 < argc) {
                configPath = argv[++i];
            }
        } else if (arg == "-i" || arg == "--interactive") {
            interactiveMode = true;
        } else if (arg == "-d" || arg == "--daemon") {
            daemonMode = true;
        }
    }
    
    // 加载配置
    Config config(configPath);
    
    // 设置信号处理
    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);
    
    // 创建守护进程
    g_daemon = std::make_unique<Daemon>(config);
    
    // 创建 HTTP 服务器
    g_http_server = std::make_unique<HttpServer>(8080);
    
    // 注册 HTTP 路由
    g_http_server->get("/api/status", [](const HttpRequest& req) {
        return HttpResponse::json(R"({
    "status": "ok",
    "version": "1.0.0",
    "agents": [
        {"name": "scout", "type": "SCOUT", "status": "IDLE"},
        {"name": "writer", "type": "WRITER", "status": "IDLE"},
        {"name": "artist", "type": "ARTIST", "status": "IDLE"}
    ]
})");
    });
    
    g_http_server->get("/api/health", [](const HttpRequest& req) {
        return HttpResponse::json(R"({"status": "healthy", "uptime": 0})");
    });
    
    // 任务触发 API
    g_http_server->post("/api/task", [](const HttpRequest& req) {
        std::string agent = req.query_params.count("agent") ? req.query_params.at("agent") : "";
        std::string action = req.query_params.count("action") ? req.query_params.at("action") : "run";
        
        if (agent.empty()) {
            return HttpResponse::json(R"({"error": "missing agent parameter"})", 400);
        }
        
        // 返回任务触发成功响应
        std::string json = R"({"status": "ok", "agent": ")" + agent + R"(", "action": ")" + action + R"(", "message": "任务已触发"})";
        return HttpResponse::json(json);
    });
    
    // 对话 API
    g_http_server->post("/api/chat", [](const HttpRequest& req) {
        std::string message = req.body;
        
        // 简单 AI 回复逻辑
        std::string response;
        std::string lower_msg = message;
        std::transform(lower_msg.begin(), lower_msg.end(), lower_msg.begin(), ::tolower);
        
        if (lower_msg.find("hello") != std::string::npos || lower_msg.find("你好") != std::string::npos) {
            response = "你好！我是虾女团的 Agent，有什么事需要我做吗？🦐";
        } else if (lower_msg.find("天气") != std::string::npos) {
            response = "我暂时没有天气查询功能，但可以在网上帮你搜索！";
        } else if (lower_msg.find("搜集") != std::string::npos || lower_msg.find("情报") != std::string::npos) {
            response = "收到！我现在去搜集情报...";
        } else if (lower_msg.find("写") != std::string::npos || lower_msg.find("创作") != std::string::npos) {
            response = "创作欲望来了！我这就去写点什么...✍️";
        } else if (lower_msg.find("画") != std::string::npos || lower_msg.find("图") != std::string::npos) {
            response = "灵感爆发！我这就去画一幅...🎨";
        } else {
            response = "收到你的消息了！我是 Docker 容器里的 AI Agent，正在学习中... ♠️";
        }
        
        std::string json = R"({"reply": ")" + response + R"(", "agent": "shrimp"})";
        return HttpResponse::json(json);
    });
    
    // 启动 HTTP 服务器
    if (!g_http_server->start()) {
        std::cerr << "Failed to start HTTP server" << std::endl;
    }
    
    if (interactiveMode) {
        // 交互模式
        g_running = true;
        g_daemon->start();
        runInteractiveMode(*g_daemon);
    } else {
        // 前台运行模式
        std::cout << "Starting ShrimpDaemon..." << std::endl;
        std::cout << "Config: " << configPath << std::endl;
        std::cout << "Press Ctrl+C to stop." << std::endl;
        
        g_running = true;
        g_daemon->start();
        
        // 主线程等待
        while (g_running && g_daemon->isRunning()) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }
    }
    
    g_http_server.reset();
    g_daemon.reset();
    std::cout << "ShrimpDaemon stopped." << std::endl;
    return 0;
}
