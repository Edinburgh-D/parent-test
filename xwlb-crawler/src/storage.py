#!/usr/bin/env python3
"""
新闻联播爬虫系统 - 数据存储模块
SQLite + SQLAlchemy，支持新闻记录、关键词、摘要存储
"""
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from loguru import logger

Base = declarative_base()


class NewsRecord(Base):
    """新闻记录表"""
    __tablename__ = "news_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(8), index=True, nullable=False)  # YYYYMMDD
    url = Column(String(500), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, default="")
    keywords = Column(Text, default="")  # JSON 数组字符串
    sentiment = Column(String(20), default="")  # positive / neutral / negative
    created_at = Column(DateTime, default=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "date": self.date,
            "url": self.url,
            "title": self.title,
            "content": self.content[:200] + "..." if len(self.content) > 200 else self.content,
            "summary": self.summary,
            "keywords": self.keywords,
            "sentiment": self.sentiment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class DailyDigest(Base):
    """每日汇总表"""
    __tablename__ = "daily_digests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(8), unique=True, index=True, nullable=False)
    total_news = Column(Integer, default=0)
    all_keywords = Column(Text, default="")  # 当日关键词聚合
    overall_sentiment = Column(String(20), default="")
    digest_summary = Column(Text, default="")  # 当日整体摘要
    created_at = Column(DateTime, default=datetime.now)


class Storage:
    """存储管理器"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.db_type = config.get("db_type", "sqlite")

        if self.db_type == "sqlite":
            db_path = config.get("sqlite_path", "data/xwlb.db")
            # 确保目录存在
            os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
            db_url = f"sqlite:///{db_path}"
        else:
            # PostgreSQL 预留
            pg = config.get("postgres", {})
            db_url = (
                f"postgresql://{pg.get('username')}:{pg.get('password')}"
                f"@{pg.get('host')}:{pg.get('port')}/{pg.get('database')}"
            )

        self.engine = create_engine(db_url, echo=False)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        logger.info(f"Storage initialized: {db_url}")

    def save_news(self, date: str, url: str, title: str, content: str,
                  summary: str = "", keywords: str = "", sentiment: str = "") -> None:
        """保存单条新闻"""
        session = self.Session()
        try:
            # 检查是否已存在
            existing = session.query(NewsRecord).filter_by(date=date, url=url).first()
            if existing:
                logger.debug(f"News already exists: {url}")
                return

            record = NewsRecord(
                date=date,
                url=url,
                title=title,
                content=content,
                summary=summary,
                keywords=keywords,
                sentiment=sentiment,
            )
            session.add(record)
            session.commit()
            logger.info(f"Saved news: {title[:50]}...")
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to save news: {e}")
        finally:
            session.close()

    def save_daily_digest(self, date: str, total_news: int, all_keywords: str,
                          overall_sentiment: str, digest_summary: str) -> None:
        """保存每日汇总"""
        session = self.Session()
        try:
            existing = session.query(DailyDigest).filter_by(date=date).first()
            if existing:
                existing.total_news = total_news
                existing.all_keywords = all_keywords
                existing.overall_sentiment = overall_sentiment
                existing.digest_summary = digest_summary
            else:
                digest = DailyDigest(
                    date=date,
                    total_news=total_news,
                    all_keywords=all_keywords,
                    overall_sentiment=overall_sentiment,
                    digest_summary=digest_summary,
                )
                session.add(digest)
            session.commit()
            logger.info(f"Saved daily digest for {date}: {total_news} news")
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to save daily digest: {e}")
        finally:
            session.close()

    def get_news_by_date(self, date: str) -> List[Dict[str, Any]]:
        """获取某日所有新闻"""
        session = self.Session()
        try:
            records = session.query(NewsRecord).filter_by(date=date).all()
            return [r.to_dict() for r in records]
        finally:
            session.close()

    def get_latest_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取最新新闻"""
        session = self.Session()
        try:
            records = session.query(NewsRecord).order_by(NewsRecord.created_at.desc()).limit(limit).all()
            return [r.to_dict() for r in records]
        finally:
            session.close()

    def get_date_list(self) -> List[str]:
        """获取所有已采集日期"""
        session = self.Session()
        try:
            dates = session.query(NewsRecord.date).distinct().order_by(NewsRecord.date.desc()).all()
            return [d[0] for d in dates]
        finally:
            session.close()

    def get_daily_digest(self, date: str) -> Optional[Dict[str, Any]]:
        """获取某日汇总"""
        session = self.Session()
        try:
            digest = session.query(DailyDigest).filter_by(date=date).first()
            if digest:
                return {
                    "date": digest.date,
                    "total_news": digest.total_news,
                    "all_keywords": digest.all_keywords,
                    "overall_sentiment": digest.overall_sentiment,
                    "digest_summary": digest.digest_summary,
                }
            return None
        finally:
            session.close()
