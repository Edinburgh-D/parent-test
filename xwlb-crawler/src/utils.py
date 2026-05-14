#!/usr/bin/env python3
"""
新闻联播爬虫系统 - 工具模块
请求头轮换、随机延迟、重试逻辑、日期处理
"""
import random
import time
import re
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from functools import wraps
from loguru import logger

# 真实浏览器 User-Agent 池
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
]

# 常见 Accept-Language
ACCEPT_LANGUAGES = [
    "zh-CN,zh;q=0.9,en;q=0.8",
    "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "en-US,en;q=0.9,zh-CN;q=0.8",
    "zh-CN,zh-HK;q=0.9,zh;q=0.8,en;q=0.7",
]


def get_random_headers() -> Dict[str, str]:
    """生成随机请求头，模拟真实浏览器"""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": random.choice(ACCEPT_LANGUAGES),
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }


def random_delay(min_seconds: float = 2.0, max_seconds: float = 5.0) -> None:
    """随机延迟，模拟人类阅读节奏"""
    delay = random.uniform(min_seconds, max_seconds)
    logger.debug(f"Random delay: {delay:.2f}s")
    time.sleep(delay)


def retry_on_failure(max_retries: int = 3, backoff_factor: float = 2.0):
    """指数退避重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"All {max_retries} retries failed for {func.__name__}: {e}")
                        raise
                    wait = backoff_factor ** attempt + random.uniform(0, 1)
                    logger.warning(f"Retry {attempt + 1}/{max_retries} for {func.__name__} after {wait:.1f}s: {e}")
                    time.sleep(wait)
            return None
        return wrapper
    return decorator


def get_date_str(date: Optional[datetime] = None, offset_days: int = 0) -> str:
    """获取日期字符串，YYYYMMDD格式"""
    if date is None:
        date = datetime.now()
    if offset_days:
        date = date + timedelta(days=offset_days)
    return date.strftime("%Y%m%d")


def parse_date_from_url(url: str) -> Optional[str]:
    """从央视网URL中提取日期"""
    match = re.search(r'/(\d{8})\.shtml', url)
    return match.group(1) if match else None


def clean_html_text(text: str) -> str:
    """清理HTML标签和多余空白"""
    # 移除HTML标签
    text = re.sub(r'<[^>]+>', '', text)
    # 移除HTML实体
    text = re.sub(r'&\w+;', ' ', text)
    # 合并空白
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def truncate_text(text: str, max_length: int = 200) -> str:
    """截断文本，保留完整句子"""
    if len(text) <= max_length:
        return text
    # 在句子边界截断
    truncated = text[:max_length]
    last_period = max(truncated.rfind('。'), truncated.rfind('！'), truncated.rfind('？'))
    if last_period > max_length * 0.5:
        return truncated[:last_period + 1]
    return truncated + "..."
