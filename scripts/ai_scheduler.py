#!/usr/bin/env python3
"""
AI军团任务调度器（替代 task-scheduler）
使用 Python schedule 包实现定时任务
"""

import schedule
import time
import os
import datetime
import subprocess
from pathlib import Path

# 配置路径
WORKSPACE = Path("/root/.openclaw/workspace")
MEMORY_DIR = WORKSPACE / "memory"
AUDIT_TEMPLATE = MEMORY_DIR / "audit_template.md"

# 确保目录存在
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

def generate_audit_report():
    """生成每日审计报告"""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    audit_file = MEMORY_DIR / f"audit_{today}.md"
    
    # 复制模板并填充日期
    if AUDIT_TEMPLATE.exists():
        with open(AUDIT_TEMPLATE, "r") as f:
            content = f.read()
        content = content.replace("{{YYYY-MM-DD}}", today)
    else:
        content = f"# AI军团每日审计报告\n\n## 日期：{today}\n\n（模板文件未找到）\n"
    
    with open(audit_file, "w") as f:
        f.write(content)
    
    print(f"[{datetime.datetime.now()}] 审计报告已生成: {audit_file}")
    return str(audit_file)

def daily_task():
    """每日22:00执行的任务"""
    print(f"[{datetime.datetime.now()}] 开始执行每日审计...")
    
    # 1. 生成审计报告
    report_path = generate_audit_report()
    
    # 2. 读取项目状态（如果存在）
    project_status = WORKSPACE / "docs" / "project_status.md"
    if project_status.exists():
        print(f"  - 项目状态文件: {project_status}")
    
    # 3. 记录日志
    log_file = MEMORY_DIR / f"daily_log_{datetime.datetime.now().strftime('%Y-%m-%d')}.md"
    with open(log_file, "a") as f:
        f.write(f"\n## {datetime.datetime.now().strftime('%H:%M')}\n- 审计报告已生成: {report_path}\n")
    
    print(f"[{datetime.datetime.now()}] 每日审计完成。")

# 注册定时任务
schedule.every().day.at("22:00").do(daily_task)

# 也注册一个测试任务（启动时执行一次）
print(f"[{datetime.datetime.now()}] AI军团调度器已启动")
print(f"[{datetime.datetime.now()}] 已注册任务: 每天 22:00 执行审计报告")
print(f"[{datetime.datetime.now()}] 按 Ctrl+C 停止")

# 主循环
if __name__ == "__main__":
    # 测试模式：如果传入 --test 则立即执行一次
    import sys
    if "--test" in sys.argv:
        print("[测试模式] 立即执行一次审计任务...")
        daily_task()
        sys.exit(0)
    
    # 正常运行
    while True:
        schedule.run_pending()
        time.sleep(60)
