#!/usr/bin/env python3
"""
新闻联播爬虫系统 - NLP分析模块
jieba分词 + TF-IDF关键词提取 + TextRank摘要
可选: LDA主题聚类 / SnowNLP情感分析
"""
import json
import re
from typing import List, Dict, Any, Optional
import jieba
import jieba.analyse
from loguru import logger

# 尝试导入可选库
try:
    from snownlp import SnowNLP
    SNOWNLP_AVAILABLE = True
except ImportError:
    SNOWNLP_AVAILABLE = False

# 内置停用词
STOPWORDS = set([
    "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一", "一个", "上", "也",
    "很", "到", "说", "要", "去", "你", "会", "着", "没有", "看", "好", "自己", "这", "那",
    "这些", "那些", "这个", "那个", "之", "与", "及", "等", "或", "但", "而", "因为", "所以",
    "如果", "虽然", "但是", "然而", "而且", "并且", "或者", "还是", "要么", "不但", "不仅",
    "除了", "至于", "关于", "对于", "由于", "根据", "按照", "通过", "经过", "随着", "作为",
    "为了", "为着", "除了", "除去", "除开", "有关", "相关", "涉及", "报道", "记者", "央视",
    "新闻联播", "网", "消息", "视频", "新闻", "表示", "认为", "指出", "强调", "提出",
    "介绍", "目前", "今天", "今年", "当地", "已经", "进行", "可以", "需要", "要求",
    "继续", "推动", "促进", "加强", "实现", "发展", "建设", "工作", "问题", "情况",
    "方面", "部门", "地区", "国家", "中国", "我国", "全国", "中央", "政府", "社会",
    "经济", "文化", "生态", "安全", "改革", "创新", "开放", "合作", "治理", "体系",
])

# 添加自定义词典
jieba.add_word("新质生产力", freq=1000)
jieba.add_word("高质量发展", freq=1000)
jieba.add_word("乡村振兴", freq=1000)
jieba.add_word("一带一路", freq=1000)
jieba.add_word("碳中和", freq=1000)
jieba.add_word("碳达峰", freq=1000)
jieba.add_word("人工智能", freq=1000)
jieba.add_word("数字经济", freq=1000)


class NLPAnalyzer:
    """NLP分析器"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.top_k = config.get("top_k", 10)
        self.summary_len = config.get("summary_len", 100)
        self.enable_lda = config.get("enable_lda", False)
        self.enable_sentiment = config.get("enable_sentiment", False)

        # 加载停用词
        stopwords_path = config.get("stopwords_path", "")
        if stopwords_path:
            try:
                with open(stopwords_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        STOPWORDS.add(line.strip())
            except FileNotFoundError:
                logger.warning(f"Stopwords file not found: {stopwords_path}")

        logger.info(f"NLP Analyzer initialized: top_k={self.top_k}, sentiment={self.enable_sentiment}")

    def extract_keywords(self, text: str, top_k: Optional[int] = None) -> List[str]:
        """TF-IDF关键词提取"""
        if top_k is None:
            top_k = self.top_k

        # 使用jieba的TF-IDF
        keywords = jieba.analyse.extract_tags(
            text,
            topK=top_k,
            withWeight=False,
            allowPOS=('ns', 'n', 'vn', 'v', 'nr', 'nt', 'nz')  # 地名、名词、动名词等
        )

        # 过滤停用词和过短的词
        filtered = []
        for kw in keywords:
            kw = kw.strip()
            if len(kw) >= 2 and kw not in STOPWORDS and not kw.isdigit():
                filtered.append(kw)

        return filtered[:top_k]

    def generate_summary(self, text: str, max_length: Optional[int] = None) -> str:
        """TextRank摘要生成（简化版：基于句子位置+关键词覆盖）"""
        if max_length is None:
            max_length = self.summary_len

        # 按句子分割
        sentences = re.split(r'[。！？\n]', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

        if not sentences:
            return text[:max_length]

        # 获取全文关键词
        keywords = set(self.extract_keywords(text, top_k=20))

        # 计算每个句子的得分（关键词覆盖 + 位置权重）
        scored_sentences = []
        for i, sent in enumerate(sentences):
            # 位置权重：开头和结尾的句子权重更高
            position_weight = 1.0
            if i == 0:
                position_weight = 2.0
            elif i < 3:
                position_weight = 1.5
            elif i >= len(sentences) - 2:
                position_weight = 1.3

            # 关键词覆盖得分
            words = set(jieba.lcut(sent))
            keyword_overlap = len(words & keywords)
            score = keyword_overlap * position_weight

            scored_sentences.append((score, sent))

        # 按得分排序，选Top句子
        scored_sentences.sort(reverse=True)

        # 按原始顺序组装摘要
        selected = scored_sentences[:3]
        selected.sort(key=lambda x: sentences.index(x[1]) if x[1] in sentences else 999)

        summary = "".join([s[1] + "。" for s in selected])

        # 截断到指定长度
        if len(summary) > max_length:
            summary = summary[:max_length]
            # 找到最后一个句号
            last_period = summary.rfind("。")
            if last_period > max_length * 0.5:
                summary = summary[:last_period + 1]

        return summary

    def analyze_sentiment(self, text: str) -> str:
        """情感分析"""
        if not self.enable_sentiment or not SNOWNLP_AVAILABLE:
            return "neutral"

        try:
            s = SnowNLP(text)
            sentiment_score = s.sentiments
            if sentiment_score > 0.6:
                return "positive"
            elif sentiment_score < 0.4:
                return "negative"
            return "neutral"
        except Exception as e:
            logger.warning(f"Sentiment analysis failed: {e}")
            return "neutral"

    def analyze_news(self, title: str, content: str) -> Dict[str, Any]:
        """分析单条新闻，返回完整分析结果"""
        full_text = f"{title}。{content}"

        keywords = self.extract_keywords(full_text)
        summary = self.generate_summary(content)
        sentiment = self.analyze_sentiment(full_text)

        return {
            "keywords": keywords,
            "keywords_str": "、".join(keywords),
            "summary": summary,
            "sentiment": sentiment,
        }

    def analyze_daily(self, news_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析当日所有新闻，生成汇总"""
        if not news_list:
            return {
                "total": 0,
                "all_keywords": [],
                "overall_sentiment": "neutral",
                "digest": "",
            }

        # 聚合所有关键词
        all_keywords = []
        for news in news_list:
            kw = news.get("keywords", "")
            if kw:
                all_keywords.extend(kw.split("、") if isinstance(kw, str) else kw)

        # 统计词频
        from collections import Counter
        keyword_counts = Counter(all_keywords)
        top_keywords = [kw for kw, _ in keyword_counts.most_common(15)]

        # 聚合情感
        sentiments = [news.get("sentiment", "neutral") for news in news_list]
        sentiment_counts = Counter(sentiments)
        overall = sentiment_counts.most_common(1)[0][0] if sentiment_counts else "neutral"

        # 生成当日摘要（取每条新闻摘要的前两句）
        digest_parts = []
        for news in news_list[:5]:
            s = news.get("summary", "")
            if s:
                digest_parts.append(s[:80] + "...")

        digest = " | ".join(digest_parts) if digest_parts else ""

        return {
            "total": len(news_list),
            "all_keywords": top_keywords,
            "all_keywords_str": "、".join(top_keywords),
            "overall_sentiment": overall,
            "digest": digest,
        }
