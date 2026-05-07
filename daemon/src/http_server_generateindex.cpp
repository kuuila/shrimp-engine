std::string HttpServer::generateIndex() {
    auto now = std::time(nullptr);
    auto tm = std::localtime(&now);
    std::ostringstream oss;
    oss << std::put_time(tm, "%Y-%m-%d %H:%M:%S");
    
    std::string html = "<!DOCTYPE html>\n";
    html += "<html>\n<head>\n";
    html += "<meta charset=\"UTF-8\">\n";
    html += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
    html += "<title>🦐 ShrimpDaemon 控制面板</title>\n";
    html += "<style>\n";
    html += "* { margin: 0; padding: 0; box-sizing: border-box; }\n";
    html += "body { font-family: 'Courier New', monospace; background: #0a0a0f; color: #e0e0e0; min-height: 100vh; padding: 20px; }\n";
    html += ".container { max-width: 900px; margin: 0 auto; }\n";
    html += "h1 { color: #ff6b9d; text-align: center; margin-bottom: 10px; font-size: 2em; }\n";
    html += ".subtitle { text-align: center; color: #888; margin-bottom: 30px; }\n";
    html += ".status-card { background: #151520; border: 1px solid #2a2a3a; border-radius: 8px; padding: 20px; margin-bottom: 20px; }\n";
    html += ".status-card h2 { color: #00d4aa; margin-bottom: 15px; font-size: 1.2em; }\n";
    html += ".agent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }\n";
    html += ".agent-item { background: #1a1a25; padding: 15px; border-radius: 6px; border-left: 3px solid #00d4aa; }\n";
    html += ".agent-name { color: #ff6b9d; font-weight: bold; font-size: 1.1em; }\n";
    html += ".agent-type { color: #888; font-size: 0.9em; }\n";
    html += ".agent-status { margin-top: 8px; padding: 4px 8px; background: #00d4aa22; color: #00d4aa; border-radius: 4px; display: inline-block; font-size: 0.85em; }\n";
    html += ".time { color: #666; font-size: 0.85em; margin-top: 10px; }\n";
    html += ".menu { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }\n";
    html += ".menu a { padding: 10px 20px; background: #1a1a25; color: #00d4aa; text-decoration: none; border-radius: 6px; border: 1px solid #2a2a3a; transition: all 0.2s; }\n";
    html += ".menu a:hover { background: #00d4aa; color: #0a0a0f; }\n";
    html += "</style>\n";
    html += "</head>\n<body>\n";
    html += "<div class=\"container\">\n";
    html += "<h1>🦐 ShrimpDaemon</h1>\n";
    html += "<p class=\"subtitle\">虾女团控制面板 · 24/7 Agent Framework</p>\n";
    
    html += "<div class=\"status-card\">\n";
    html += "<h2>👥 Agent 状态</h2>\n";
    html += "<div class=\"agent-grid\">\n";
    html += "<div class=\"agent-item\">\n";
    html += "<div class=\"agent-name\">👁️ 情报员</div>\n";
    html += "<div class=\"agent-type\">scout</div>\n";
    html += "<div class=\"agent-status\">🟢 运行中</div>\n";
    html += "</div>\n";
    html += "<div class=\"agent-item\">\n";
    html += "<div class=\"agent-name\">✍️ 撰稿人</div>\n";
    html += "<div class=\"agent-type\">writer</div>\n";
    html += "<div class=\"agent-status\">🟢 运行中</div>\n";
    html += "</div>\n";
    html += "<div class=\"agent-item\">\n";
    html += "<div class=\"agent-name\">🎨 美术官</div>\n";
    html += "<div class=\"agent-type\">artist</div>\n";
    html += "<div class=\"agent-status\">🟢 运行中</div>\n";
    html += "</div>\n";
    html += "</div>\n";
    html += "</div>\n";
    
    html += "<div class=\"status-card\">\n";
    html += "<h2>📊 系统状态</h2>\n";
    html += "<p>运行时间: <span id=\"uptime\">计算中...</span></p>\n";
    html += "<p>版本: v1.0.0</p>\n";
    html += "<p>端口: " + std::to_string(port_) + "</p>\n";
    html += "</div>\n";
    
    html += "<div class=\"menu\">\n";
    html += "<a href=\"/status\">📊 状态详情</a>\n";
    html += "<a href=\"/agents\">👥 Agent 列表</a>\n";
    html += "<a href=\"/logs\">📜 运行日志</a>\n";
    html += "<a href=\"/api/status\">📈 JSON API</a>\n";
    html += "</div>\n";
    
    // 对话面板
    html += "<div class=\"status-card\" style=\"margin-top: 20px;\">\n";
    html += "<h2>💬 与子虾对话</h2>\n";
    html += "<div style=\"display: flex; gap: 10px; margin-top: 10px;\">\n";
    html += "<input type=\"text\" id=\"chatInput\" placeholder=\"发送消息...\" style=\"flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #2a2a3a; background: #1a1a25; color: #e0e0e0;\" onkeypress=\"if(event.key=='Enter')sendChat()\">\n";
    html += "<button onclick=\"sendChat()\" style=\"padding: 10px 20px; background: #00d4aa; color: #0a0a0f; border: none; border-radius: 6px; cursor: pointer;\">发送</button>\n";
    html += "</div>\n";
    html += "<div id=\"chatResponse\" style=\"margin-top: 15px; padding: 15px; background: #1a1a25; border-radius: 6px; min-height: 50px;\">\n";
    html += "<span style=\"color: #888;\">回复将显示在这里...</span>\n";
    html += "</div>\n";
    html += "</div>\n";
    
    html += "<p class=\"time\">当前时间: " + oss.str() + "</p>\n";
    html += "</div>\n";
    
    // JavaScript
    html += "<script>\n";
    html += "function sendChat() {\n";
    html += "  const input = document.getElementById('chatInput');\n";
    html += "  const msg = input.value.trim();\n";
    html += "  if (!msg) return;\n";
    html += "  fetch('/api/chat', { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: msg })\n";
    html += "    .then(r => r.json())\n";
    html += "    .then(data => { document.getElementById('chatResponse').innerHTML = '<span style=\"color: #00d4aa;\">' + data.reply + '</span>'; input.value = ''; })\n";
    html += "    .catch(err => { document.getElementById('chatResponse').innerHTML = '<span style=\"color: #ff6b9d;\">错误: ' + err + '</span>'; });\n";
    html += "}\n";
    html += "setInterval(() => {\n";
    html += "  const elapsed = Math.floor(Date.now() / 1000);\n";
    html += "  const hours = Math.floor(elapsed / 3600);\n";
    html += "  const minutes = Math.floor((elapsed % 3600) / 60);\n";
    html += "  const seconds = elapsed % 60;\n";
    html += "  document.getElementById('uptime').textContent = hours + 'h ' + minutes + 'm ' + seconds + 's';\n";
    html += "}, 1000);\n";
    html += "</script>\n";
    html += "</body>\n</html>\n";
    
    return html;
}