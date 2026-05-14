#!/usr/bin/env python3
"""
新闻联播爬虫系统 - 代理池管理模块
支持免费代理源 + 付费代理配置接口
"""
import random
import time
import requests
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from loguru import logger


@dataclass
class Proxy:
    """代理对象"""
    protocol: str  # http / https / socks5
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None

    @property
    def url(self) -> str:
        if self.username and self.password:
            return f"{self.protocol}://{self.username}:{self.password}@{self.host}:{self.port}"
        return f"{self.protocol}://{self.host}:{self.port}"

    @property
    def dict(self) -> Dict[str, str]:
        return {
            "http": self.url,
            "https": self.url,
        }

    def __str__(self) -> str:
        return f"{self.protocol}://{self.host}:{self.port}"


class ProxyPool:
    """代理池管理器"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("enabled", False)
        self.proxy_type = config.get("type", "free")
        self.proxies: List[Proxy] = []
        self.failed_proxies: set = set()
        self.last_refresh = 0
        self.refresh_interval = config.get("refresh_interval", 60) * 60  # 秒
        self.verify_timeout = config.get("verify_timeout", 10)

        if self.enabled:
            self.refresh()

    def refresh(self) -> None:
        """刷新代理池"""
        if not self.enabled:
            return

        now = time.time()
        if now - self.last_refresh < self.refresh_interval and self.proxies:
            return

        logger.info("Refreshing proxy pool...")
        self.proxies = []
        self.failed_proxies.clear()

        if self.proxy_type in ("free", "mixed"):
            self._load_free_proxies()

        if self.proxy_type in ("paid", "mixed"):
            self._load_paid_proxies()

        self.last_refresh = now
        logger.info(f"Proxy pool refreshed: {len(self.proxies)} proxies available")

    def _load_free_proxies(self) -> None:
        """加载免费代理"""
        sources = self.config.get("free_sources", [])
        for source in sources:
            try:
                resp = requests.get(source, timeout=15)
                if resp.status_code == 200:
                    lines = resp.text.strip().split('\n')
                    for line in lines:
                        line = line.strip()
                        if ':' in line and line[0].isdigit():
                            parts = line.split(':')
                            if len(parts) == 2:
                                host, port = parts[0], parts[1]
                                if port.isdigit():
                                    proxy = Proxy("http", host, int(port))
                                    if self._verify_proxy(proxy):
                                        self.proxies.append(proxy)
            except Exception as e:
                logger.warning(f"Failed to load free proxies from {source}: {e}")

        # 内置备用代理（教育网/公共代理）
        builtin_proxies = []
        for p in builtin_proxies:
            proxy = Proxy("http", p["host"], p["port"])
            if self._verify_proxy(proxy):
                self.proxies.append(proxy)

    def _load_paid_proxies(self) -> None:
        """加载付费代理（预留接口）"""
        paid_config = self.config.get("paid", {})
        provider = paid_config.get("provider", "")

        if not provider:
            logger.warning("Paid proxy provider not configured")
            return

        # Bright Data / Oxylabs / Smartproxy 等统一接口
        host = paid_config.get("host", "")
        port = paid_config.get("port", 0)
        username = paid_config.get("username", "")
        password = paid_config.get("password", "")

        if host and port:
            proxy = Proxy("http", host, port, username, password)
            self.proxies.append(proxy)
            logger.info(f"Loaded paid proxy from {provider}")

    def _verify_proxy(self, proxy: Proxy) -> bool:
        """验证代理可用性"""
        try:
            resp = requests.get(
                "https://httpbin.org/ip",
                proxies=proxy.dict,
                timeout=self.verify_timeout,
            )
            return resp.status_code == 200
        except Exception:
            return False

    def get_proxy(self) -> Optional[Proxy]:
        """获取一个可用代理"""
        if not self.enabled:
            return None

        self.refresh()

        # 过滤失败代理
        available = [p for p in self.proxies if str(p) not in self.failed_proxies]
        if not available:
            logger.warning("No available proxies, trying all including failed ones")
            available = self.proxies

        if available:
            proxy = random.choice(available)
            logger.debug(f"Selected proxy: {proxy}")
            return proxy

        return None

    def mark_failed(self, proxy: Proxy) -> None:
        """标记代理为失败"""
        self.failed_proxies.add(str(proxy))
        logger.warning(f"Proxy marked as failed: {proxy}")

    @property
    def size(self) -> int:
        return len(self.proxies)
