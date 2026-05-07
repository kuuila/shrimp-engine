#include "http_server.hpp"
#include "daemon.hpp"
#include <iostream>
#include <sstream>
#include <algorithm>
#include <ctime>
#include <iomanip>
#include <thread>
#include <chrono>

using namespace shrimp;

HttpServer::HttpServer(uint16_t port) : port_(port) {}

HttpServer::~HttpServer() {
    stop();
}

bool HttpServer::start() {
    server_fd_ = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd_ < 0) {
        std::cerr << "[HTTP] Failed to create socket" << std::endl;
        return false;
    }
    
    int opt = 1;
    setsockopt(server_fd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(port_);
    
    if (bind(server_fd_, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        std::cerr << "[HTTP] Failed to bind port " << port_ << std::endl;
        close(server_fd_);
        return false;
    }
    
    if (listen(server_fd_, 10) < 0) {
        std::cerr << "[HTTP] Failed to listen" << std::endl;
        close(server_fd_);
        return false;
    }
    
    fcntl(server_fd_, F_SETFL, O_NONBLOCK);
    
    running_ = true;
    accept_thread_ = std::thread(&HttpServer::acceptConnections, this);
    
    std::cout << "[HTTP] Server started on port " << port_ << std::endl;
    return true;
}

void HttpServer::stop() {
    if (!running_) return;
    running_ = false;
    if (server_fd_ >= 0) {
        close(server_fd_);
        server_fd_ = -1;
    }
    if (accept_thread_.joinable()) {
        accept_thread_.join();
    }
}

void HttpServer::get(const std::string& path, HttpHandler handler) {
    std::lock_guard<std::mutex> lock(mutex_);
    get_handlers_[path] = handler;
}

void HttpServer::post(const std::string& path, HttpHandler handler) {
    std::lock_guard<std::mutex> lock(mutex_);
    post_handlers_[path] = handler;
}

void HttpServer::acceptConnections() {
    while (running_) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_fd = accept(server_fd_, (struct sockaddr*)&client_addr, &client_len);
        
        if (client_fd >= 0) {
            struct timeval timeout;
            timeout.tv_sec = 30;
            timeout.tv_usec = 0;
            setsockopt(client_fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
            std::thread(&HttpServer::handleClient, this, client_fd).detach();
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
}

void HttpServer::handleClient(int client_fd) {
    char buffer[4096];
    ssize_t n = recv(client_fd, buffer, sizeof(buffer) - 1, 0);
    
    if (n <= 0) {
        close(client_fd);
        return;
    }
    
    buffer[n] = '\0';
    HttpRequest req = parseRequest(std::string(buffer));
    HttpResponse resp = routeRequest(req);
    
    std::ostringstream oss;
    oss << "HTTP/1.1 " << resp.status_code << " " << resp.status_message << "\r\n";
    for (const auto& h : resp.headers) {
        oss << h.first << ": " << h.second << "\r\n";
    }
    oss << "Content-Length: " << resp.body.size() << "\r\n";
    oss << "Connection: close\r\n";
    oss << "\r\n";
    oss << resp.body;
    
    send(client_fd, oss.str().c_str(), oss.str().size(), 0);
    close(client_fd);
}

HttpRequest HttpServer::parseRequest(const std::string& raw) {
    HttpRequest req;
    std::istringstream iss(raw);
    std::string line;
    
    if (std::getline(iss, line)) {
        std::istringstream line_ss(line);
        line_ss >> req.method >> req.path;
    }
    
    while (std::getline(iss, line) && line != "\r") {
        auto pos = line.find(':');
        if (pos != std::string::npos) {
            std::string key = line.substr(0, pos);
            std::string value = line.substr(pos + 1);
            key.erase(std::remove_if(key.begin(), key.end(), ::isspace), key.end());
            value.erase(0, value.find_first_not_of(" "));
            value.erase(value.find_last_not_of(" \r"), value.size());
            req.headers[key] = value;
        }
    }
    
    std::string body;
    while (std::getline(iss, line)) {
        body += line + "\n";
    }
    req.body = body;
    
    auto qpos = req.path.find('?');
    if (qpos != std::string::npos) {
        std::string query = req.path.substr(qpos + 1);
        req.path = req.path.substr(0, qpos);
        std::istringstream qss(query);
        std::string param;
        while (std::getline(qss, param, '&')) {
            auto ppos = param.find('=');
            if (ppos != std::string::npos) {
                req.query_params[param.substr(0, ppos)] = param.substr(ppos + 1);
            }
        }
    }
    
    return req;
}

HttpResponse HttpServer::routeRequest(const HttpRequest& req) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto method = req.method;
    auto path = req.path;
    
    if (method == "GET") {
        auto it = get_handlers_.find(path);
        if (it != get_handlers_.end()) {
            return it->second(req);
        }
    } else if (method == "POST") {
        auto it = post_handlers_.find(path);
        if (it != post_handlers_.end()) {
            return it->second(req);
        }
    }
    
    return HttpResponse::html(generateIndex());
}

std::string HttpServer::generateIndex() {
    auto now = std::time(nullptr);
    auto tm = std::localtime(&now);
    std::ostringstream oss;
    oss << std::put_time(tm, "%Y-%m-%d %H:%M:%S");
    
    std::string html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>ShrimpDaemon</title>";
    html += "<style>body{font-family:monospace;background:#0a0a0f;color:#e0e0e0;padding:20px;}";
    html += ".c{max-width:800px;margin:0 auto}.h1{color:#ff6b9d;text-align:center;font-size:2em}";
    html += ".card{background:#151520;border:1px solid #2a2a3a;border-radius:8px;padding:20px;margin:20px 0}";
    html += ".card h2{color:#00d4aa;margin-bottom:15px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}";
    html += ".item{background:#1a1a25;padding:15px;border-radius:6px;border-left:3px solid #00d4aa}";
    html += ".name{color:#ff6b9d;font-weight:bold}.type{color:#888;font-size:0.9em}";
    html += ".status{background:#00d4aa22;color:#00d4aa;padding:4px 8px;border-radius:4px;display:inline-block;margin-top:8px}";
    html += "input,button{padding:10px;border-radius:6px;border:1px solid #2a2a3a;background:#1a1a25;color:#e0e0e0}";
    html += "button{background:#00d4aa;color:#0a0a0f;cursor:pointer;border:none;margin-left:10px}";
    html += "#resp{min-height:50px;background:#1a1a25;padding:15px;border-radius:6px;margin-top:15px}</style></head>";
    html += "<body><div class='c'>";
    html += "<h1 class='h1'>🦐 ShrimpDaemon 控制面板</h1>";
    html += "<p style='text-align:center;color:#888'>虾女团 · Docker 子虾</p>";
    html += "<div class='card'><h2>👥 Agent 状态</h2><div class='grid'>";
    html += "<div class='item'><div class='name'>👁️ 情报员</div><div class='type'>scout</div><div class='status'>🟢 运行中</div></div>";
    html += "<div class='item'><div class='name'>✍️ 撰稿人</div><div class='type'>writer</div><div class='status'>🟢 运行中</div></div>";
    html += "<div class='item'><div class='name'>🎨 美术官</div><div class='type'>artist</div><div class='status'>🟢 运行中</div></div>";
    html += "</div></div>";
    html += "<div class='card'><h2>📊 系统</h2><p>版本: v1.0.0 | 端口: " + std::to_string(port_) + " | 时间: " + oss.str() + "</p></div>";
    html += "<div class='card'><h2>💬 对话</h2><div style='display:flex'><input id='m' placeholder='发送消息...'><button onclick='s()'>发送</button></div>";
    html += "<div id='r' style='margin-top:15px;color:#888'>回复显示在这里...</div></div>";
    html += "<script>function s(){var m=document.getElementById('m').value.trim();if(!m)return;fetch('/api/chat',{method:'POST',headers:{'Content-Type':'text/plain'},body:m}).then(r=>r.json()).then(d=>{document.getElementById('r').innerHTML='<span style=color:#00d4aa>'+d.reply+'</span>';document.getElementById('m').value=''}).catch(e=>{document.getElementById('r').innerHTML='<span style=color:#ff6b9d>错误: '+e+'</span>'})}</script>";
    html += "</div></body></html>";
    return html;
}

std::string HttpServer::generateStatusJson() {
    auto now = std::time(nullptr);
    auto tm = std::localtime(&now);
    std::ostringstream oss;
    oss << std::put_time(tm, "%Y-%m-%d %H:%M:%S");
    return R"({"status":"ok","version":"1.0.0","timestamp":")" + oss.str() + R"(","agents":[{"name":"scout","type":"SCOUT","status":"IDLE"},{"name":"writer","type":"WRITER","status":"IDLE"},{"name":"artist","type":"ARTIST","status":"IDLE"}],"port":)" + std::to_string(port_) + "}";
}
