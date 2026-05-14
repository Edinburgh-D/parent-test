#!/usr/bin/env python3
"""
新闻联播爬虫系统 - 入口脚本
支持: 立即运行 / 定时调度 / 补抓历史 / 查看结果
"""
import sys
import argparse
from pathlib import Path

# 添加 src 到路径
sys.path.insert(0, str(Path(__file__).parent / "src"))

from loguru import logger

from src.scheduler import XWLBScheduler
from src.crawler import XWLBCrawler
from src.storage import Storage
from src.nlp import NLPAnalyzer

# 日志配置
logger.add(
    "logs/xwlb.log",
    rotation="1 day",
    retention="30 days",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}",
)


def cmd_run(args):
    """立即运行一次爬取"""
    crawler = XWLBCrawler(args.config)
    results = crawler.crawl_date(args.date)
    print(f"\n✅ 完成: 抓取 {len(results)} 条新闻")
    for i, r in enumerate(results[:5], 1):
        print(f"\n{i}. {r['title'][:60]}...")
        print(f"   关键词: {r.get('keywords', 'N/A')}")
        print(f"   摘要: {r.get('summary', 'N/A')[:80]}...")


def cmd_schedule(args):
    """启动定时调度"""
    scheduler = XWLBScheduler(args.config)
    scheduler.start()


def cmd_range(args):
    """抓取日期范围"""
    crawler = XWLBCrawler(args.config)
    results = crawler.crawl_range(args.start, args.end)
    total = sum(len(v) for v in results.values())
    print(f"\n✅ 完成: {len(results)} 天，共 {total} 条新闻")


def cmd_query(args):
    """查询已存储数据"""
    import yaml
    with open(args.config, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    storage = Storage(config.get("storage", {}))

    if args.date:
        news = storage.get_news_by_date(args.date)
        digest = storage.get_daily_digest(args.date)
        print(f"\n📅 {args.date} 共 {len(news)} 条新闻")
        if digest:
            print(f"   关键词: {digest['all_keywords']}")
            print(f"   情感: {digest['overall_sentiment']}")
        for i, n in enumerate(news[:10], 1):
            print(f"\n{i}. {n['title'][:70]}...")
            print(f"   关键词: {n.get('keywords', 'N/A')}")
    else:
        dates = storage.get_date_list()[:20]
        print(f"\n📊 已采集日期 ({len(dates)} 天):")
        for d in dates:
            news = storage.get_news_by_date(d)
            print(f"   {d}: {len(news)} 条")


def cmd_test_nlp(args):
    """测试NLP分析"""
    import yaml
    with open(args.config, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    nlp = NLPAnalyzer(config.get("nlp", {}))

    text = args.text or """
    央视网消息：今天，国务院召开常务会议，研究部署推进数字经济发展工作。
    会议强调，要加快新型基础设施建设，推动5G网络、数据中心、人工智能等数字产业高质量发展。
    各地各部门要切实增强责任感紧迫感，确保各项政策措施落地见效。
    """

    result = nlp.analyze_news("测试标题", text)
    print(f"\n🔍 NLP 分析结果:")
    print(f"   关键词: {result['keywords_str']}")
    print(f"   摘要: {result['summary']}")
    print(f"   情感: {result['sentiment']}")


def main():
    parser = argparse.ArgumentParser(
        description="新闻联播爬虫系统",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python main.py run                    # 立即抓取今天
  python main.py run -d 20260513        # 抓取指定日期
  python main.py schedule               # 启动定时调度（每天21:45）
  python main.py range -s 20260501 -e 20260510   # 抓取日期范围
  python main.py query -d 20260513      # 查询某日数据
  python main.py query                  # 列出所有已采集日期
  python main.py test-nlp             # 测试NLP分析
        """,
    )
    parser.add_argument("-c", "--config", default="config.yaml", help="配置文件路径")
    subparsers = parser.add_subparsers(dest="command", help="可用命令")

    # run
    run_parser = subparsers.add_parser("run", help="立即运行一次爬取")
    run_parser.add_argument("-d", "--date", help="指定日期 (YYYYMMDD)，默认今天")
    run_parser.set_defaults(func=cmd_run)

    # schedule
    schedule_parser = subparsers.add_parser("schedule", help="启动定时调度")
    schedule_parser.set_defaults(func=cmd_schedule)

    # range
    range_parser = subparsers.add_parser("range", help="抓取日期范围")
    range_parser.add_argument("-s", "--start", required=True, help="开始日期 YYYYMMDD")
    range_parser.add_argument("-e", "--end", required=True, help="结束日期 YYYYMMDD")
    range_parser.set_defaults(func=cmd_range)

    # query
    query_parser = subparsers.add_parser("query", help="查询已存储数据")
    query_parser.add_argument("-d", "--date", help="查询指定日期")
    query_parser.set_defaults(func=cmd_query)

    # test-nlp
    nlp_parser = subparsers.add_parser("test-nlp", help="测试NLP分析")
    nlp_parser.add_argument("-t", "--text", help="测试文本")
    nlp_parser.set_defaults(func=cmd_test_nlp)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
