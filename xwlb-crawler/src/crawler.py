#!/usr/bin/env python3
"""
新闻联播爬虫系统 - 核心爬取模块
Playwright + playwright-stealth + 代理池 + 请求头轮换
"""
import re
import time
import yaml
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from urllib.robotparser import RobotFileParser

from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
from loguru import logger

from .utils import get_random_headers, random_delay, retry_on_failure, get_date_str, clean_html_text, parse_date_from_url
from .proxy_pool import ProxyPool
from .storage import Storage
from .nlp import NLPAnalyzer


class XWLBCrawler:
    """新闻联播爬虫"""

    def __init__(self, config_path: str = "config.yaml"):
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)

        self.crawler_config = self.config.get("crawler", {})
        self.proxy_pool = ProxyPool(self.config.get("proxy", {}))
        self.storage = Storage(self.config.get("storage", {}))
        self.nlp = NLPAnalyzer(self.config.get("nlp", {}))

        self.base_url = self.crawler_config.get("base_url", "https://tv.cctv.com/lm/xwlb/day/{date}.shtml")
        self.min_delay = self.crawler_config.get("min_delay", 2.0)
        self.max_delay = self.crawler_config.get("max_delay", 5.0)
        self.timeout = self.crawler_config.get("timeout", 30)
        self.max_retries = self.crawler_config.get("max_retries", 3)
        self.check_robots = self.crawler_config.get("check_robots", True)
        self.rotate_ua = self.crawler_config.get("rotate_ua", True)

        self._robots_checked = False
        self._can_fetch = True

    def _check_robots(self, url: str) -> bool:
        """检查robots.txt"""
        if not self.check_robots or self._robots_checked:
            return self._can_fetch

        try:
            rp = RobotFileParser()
            rp.set_url("https://tv.cctv.com/robots.txt")
            rp.read()
            self._can_fetch = rp.can_fetch("*", url)
            self._robots_checked = True
            if not self._can_fetch:
                logger.warning("robots.txt disallows fetching")
        except Exception as e:
            logger.warning(f"Failed to check robots.txt: {e}")
            self._can_fetch = True

        return self._can_fetch

    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        if self.rotate_ua:
            return get_random_headers()
        return {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

    async def _fetch_with_stealth(self, url: str) -> Optional[str]:
        """使用Playwright Stealth获取页面内容"""
        proxy = self.proxy_pool.get_proxy()
        proxy_config = None
        if proxy:
            proxy_config = {"server": proxy.url}

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    proxy=proxy_config,
                )
                context = await browser.new_context(
                    user_agent=get_random_headers()["User-Agent"],
                    viewport={"width": 1920, "height": 1080},
                    locale="zh-CN",
                    timezone_id="Asia/Shanghai",
                )
                page = await context.new_page()

                # 应用stealth
                await stealth_async(page)

                # 随机延迟
                await asyncio.sleep(random.uniform(1.0, 3.0))

                response = await page.goto(url, wait_until="domcontentloaded", timeout=self.timeout * 1000)

                if response.status >= 400:
                    logger.warning(f"HTTP {response.status} for {url}")
                    if proxy and response.status in [403, 429]:
                        self.proxy_pool.mark_failed(proxy)
                    await browser.close()
                    return None

                # 再等待一下JS渲染
                await asyncio.sleep(random.uniform(0.5, 1.5))

                content = await page.content()
                await browser.close()
                return content

        except Exception as e:
            logger.error(f"Stealth fetch failed: {e}")
            if proxy:
                self.proxy_pool.mark_failed(proxy)
            return None

    def _fetch_with_requests(self, url: str) -> Optional[str]:
        """requests fallback"""
        proxy = self.proxy_pool.get_proxy()
        proxies = proxy.dict if proxy else None

        try:
            headers = self._get_headers()
            resp = requests.get(
                url,
                headers=headers,
                proxies=proxies,
                timeout=self.timeout,
            )
            if resp.status_code == 200:
                return resp.text
            if proxy and resp.status_code in [403, 429]:
                self.proxy_pool.mark_failed(proxy)
            logger.warning(f"HTTP {resp.status_code} for {url}")
            return None
        except Exception as e:
            logger.error(f"Requests fetch failed: {e}")
            if proxy:
                self.proxy_pool.mark_failed(proxy)
            return None

    @retry_on_failure(max_retries=3, backoff_factor=2.0)
    def fetch_page(self, url: str) -> Optional[str]:
        """获取页面内容（优先requests，失败fallback到stealth）"""
        if not self._check_robots(url):
            logger.warning("robots.txt blocks this URL")
            return None

        logger.info(f"Fetching: {url}")
        random_delay(self.min_delay, self.max_delay)

        # 先用requests轻量请求
        content = self._fetch_with_requests(url)
        if content:
            return content

        # fallback到playwright stealth
        logger.info("Fallback to Playwright Stealth...")
        import asyncio
        content = asyncio.run(self._fetch_with_stealth(url))
        return content

    def parse_news_list(self, html: str, date: str) -> List[Dict[str, Any]]:
        """解析新闻列表页"""
        news_items = []

        # 央视网列表页结构：多个<li>包含<a>链接
        # 尝试多种模式匹配
        patterns = [
            r'<li[^>]*>.*?<a href="([^"]+)"[^>]*>(.*?)</a>.*?</li>',
            r'<div class="title"><a href="([^"]+)"[^>]*>(.*?)</a></div>',
            r'<a href="([^"]+)"[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)</a>',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, html, re.DOTALL)
            for href, title_raw in matches:
                title = clean_html_text(title_raw)
                if title and len(title) > 5:
                    # 补全URL
                    if href.startswith("/"):
                        href = f"https://tv.cctv.com{href}"
                    elif not href.startswith("http"):
                        href = f"https://tv.cctv.com/lm/xwlb/{href}"

                    # 去重
                    if not any(n["url"] == href for n in news_items):
                        news_items.append({
                            "date": date,
                            "url": href,
                            "title": title,
                            "content": "",
                        })

        # 备用：从script标签中的JSON数据提取
        if not news_items:
            json_pattern = r'"url":"([^"]+)","title":"([^"]+)"'
            matches = re.findall(json_pattern, html)
            for href, title in matches:
                if "xwlb" in href or "news" in href:
                    if href.startswith("/"):
                        href = f"https://tv.cctv.com{href}"
                    news_items.append({
                        "date": date,
                        "url": href,
                        "title": title,
                        "content": "",
                    })

        logger.info(f"Parsed {len(news_items)} news items from list page")
        return news_items

    def parse_news_detail(self, html: str, url: str) -> Optional[str]:
        """解析新闻详情页，提取正文"""
        # 央视网正文通常在 id="content_body" 或 class="cnt_bd" 中
        patterns = [
            r'<div[^>]*id="content_body"[^>]*>(.*?)</div>\s*<div',
            r'<div[^>]*class="cnt_bd"[^>]*>(.*?)</div>\s*<div',
            r'<!--repaste\.body\.begin-->(.*?)<!--repaste\.body\.end-->',
            r'<div[^>]*class="main_content"[^>]*>(.*?)</div>\s*<div',
            r'<article[^>]*>(.*?)</article>',
        ]

        for pattern in patterns:
            match = re.search(pattern, html, re.DOTALL)
            if match:
                content = match.group(1)
                content = clean_html_text(content)
                if len(content) > 50:
                    return content

        # 最后手段：提取所有<p>标签内容
        p_tags = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
        if p_tags:
            content = "\n".join(clean_html_text(p) for p in p_tags if len(clean_html_text(p)) > 20)
            if len(content) > 100:
                return content

        return None

    def crawl_date(self, date: Optional[str] = None) -> List[Dict[str, Any]]:
        """抓取某日新闻联播"""
        if date is None:
            date = get_date_str()

        url = self.base_url.format(date=date)
        logger.info(f"Crawling date: {date}")

        # 获取列表页
        list_html = self.fetch_page(url)
        if not list_html:
            logger.error(f"Failed to fetch list page for {date}")
            return []

        news_items = self.parse_news_list(list_html, date)
        if not news_items:
            logger.warning(f"No news items found for {date}")
            return []

        # 抓取每条新闻详情
        results = []
        for item in news_items:
            logger.info(f"Fetching detail: {item['title'][:40]}...")
            detail_html = self.fetch_page(item["url"])

            if detail_html:
                content = self.parse_news_detail(detail_html, item["url"])
                if content:
                    item["content"] = content

                    # NLP分析
                    analysis = self.nlp.analyze_news(item["title"], content)
                    item["keywords"] = analysis["keywords_str"]
                    item["summary"] = analysis["summary"]
                    item["sentiment"] = analysis["sentiment"]

                    # 存储
                    self.storage.save_news(
                        date=item["date"],
                        url=item["url"],
                        title=item["title"],
                        content=item["content"],
                        summary=item["summary"],
                        keywords=item["keywords"],
                        sentiment=item["sentiment"],
                    )
                    results.append(item)
                else:
                    logger.warning(f"Failed to parse content for: {item['url']}")
            else:
                logger.warning(f"Failed to fetch detail: {item['url']}")

        # 保存每日汇总
        if results:
            daily = self.nlp.analyze_daily(results)
            self.storage.save_daily_digest(
                date=date,
                total_news=daily["total"],
                all_keywords=daily["all_keywords_str"],
                overall_sentiment=daily["overall_sentiment"],
                digest_summary=daily["digest"],
            )

        logger.info(f"Crawl complete for {date}: {len(results)}/{len(news_items)} news saved")
        return results

    def crawl_range(self, start_date: str, end_date: str) -> Dict[str, List[Dict]]:
        """抓取日期范围"""
        from datetime import datetime, timedelta

        results = {}
        current = datetime.strptime(start_date, "%Y%m%d")
        end = datetime.strptime(end_date, "%Y%m%d")

        while current <= end:
            date_str = current.strftime("%Y%m%d")
            results[date_str] = self.crawl_date(date_str)
            current += timedelta(days=1)

        return results
