#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的HTTP服务器用于提供前端页面
"""

import http.server
import socketserver
import os

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 前端服务器启动成功！")
        print(f"📱 访问地址: http://localhost:{PORT}/index.html")
        print(f"🔗 后端API: http://localhost:8001")
        print(f"\n按 Ctrl+C 停止服务器")
        httpd.serve_forever()
