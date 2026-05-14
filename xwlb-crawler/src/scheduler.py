#!/usr/bin/env python3
"""
新闻联播爬虫系统 - 定时调度模块
APScheduler + 优雅启停 + 任务补偿
"""
import signal
import sys
import asyncio
from typing import Optional
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from loguru import logger

from .crawler import XWLBCrawler


class XWLBScheduler:
    """定时调度器"""

    def __init__(self, config_path: str = "config.yaml"):
        self.config_path = config_path
        self.crawler = XWLBCrawler(config_path)
        self.scheduler = BackgroundScheduler()
        self.running = False

        # 加载调度配置
        import yaml
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        self.schedule_config = config.get("scheduler", {})

        # 信号处理
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """优雅退出"""
        logger.info(f"Received signal {signum}, shutting down...")
        self.stop()
        sys.exit(0)

    def _job_listener(self, event):
        """任务执行监听器"""
        if event.exception:
            logger.error(f"Job crashed: {event.job_id}\n{event.exception}")
        else:
            logger.info(f"Job completed: {event.job_id}")

    def _crawl_job(self):
        """实际的爬取任务"""
        try:
            logger.info("=" * 50)
            logger.info(f"Starting scheduled crawl at {datetime.now()}")
            results = self.crawler.crawl_date()
            logger.info(f"Scheduled crawl finished: {len(results)} news items")
            logger.info("=" * 50)
        except Exception as e:
            logger.exception(f"Crawl job failed: {e}")

    def start(self) -> None:
        """启动调度器"""
        hour = self.schedule_config.get("cron_hour", 21)
        minute = self.schedule_config.get("cron_minute", 45)
        timezone = self.schedule_config.get("timezone", "Asia/Shanghai")
        misfire = self.schedule_config.get("misfire_grace_time", 3600)

        # 添加任务监听器
        self.scheduler.add_listener(self._job_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)

        # 添加定时任务
        self.scheduler.add_job(
            self._crawl_job,
            trigger=CronTrigger(hour=hour, minute=minute, timezone=timezone),
            id="xwlb_daily_crawl",
            name="新闻联播每日抓取",
            misfire_grace_time=misfire,
            max_instances=1,  # 防止并发执行
            replace_existing=True,
        )

        self.scheduler.start()
        self.running = True

        logger.info(f"Scheduler started. Daily crawl at {hour:02d}:{minute:02d} ({timezone})")
        logger.info("Press Ctrl+C to stop")

        # 保持进程运行
        try:
            while self.running:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()

    def stop(self) -> None:
        """停止调度器"""
        if self.running:
            self.scheduler.shutdown(wait=True)
            self.running = False
            logger.info("Scheduler stopped")

    def run_once(self, date: Optional[str] = None) -> None:
        """立即执行一次（调试用）"""
        logger.info(f"Running crawl once for date: {date or 'today'}")
        self.crawler.crawl_date(date)
