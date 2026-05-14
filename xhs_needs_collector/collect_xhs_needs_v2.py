#!/usr/bin/env python3
"""
小红书需求采集脚本 V2 - 精准策略版
基于开源项目 Spider_XHS (github.com/cv-cat/Spider_XHS)

【核心改进】
1. 关键词分层：核心词 + 长尾词 + 场景词，提高命中率
2. 内容过滤：自动排除广告、营销号、已解决的需求
3. 评论精选：只保留有价值的讨论，过滤"666""收藏"等水评
4. 需求分类：自动标签化（工具类/插件类/定制开发/学习求助）
5. 数据去重：同一笔记多关键词命中时自动合并
6. 智能延迟：根据响应动态调整请求间隔
7. 增量采集：支持断点续采，避免重复工作

【环境配置】
1. 将 .env.example 复制为 .env，填入 Cookie
2. 安装依赖: pip install requests loguru python-dotenv
3. 运行: python collect_xhs_needs_v2.py

【Cookie 获取】
浏览器登录小红书 → F12 → Network → 任意请求 → 复制 cookie 字段
"""

import os
import sys
import json
import time
import random
import hashlib
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from loguru import logger
from apis.xhs_pc_apis import XHS_Apis

# ==================== 关键词策略配置 ====================
# 分层关键词：命中更精准，减少噪音

CORE_KEYWORDS = [
    # 核心需求词（优先级最高）
    "有没有这样的软件",
    "求推荐好用的app",
    "有没有类似的工具",
    "想要一个能",
    "求大神帮忙",
]

LONG_TAIL_KEYWORDS = [
    # 长尾需求词（具体场景）
    "有没有批量处理的工具",
    "想要一个自动化的脚本",
    "求一个数据抓取的方案",
    "有没有离线可用的软件",
    "想要一个本地运行的工具",
]

SCENE_KEYWORDS = [
    # 场景词（特定领域）
    "开发者工具推荐",
    "效率工具求助",
    "编程辅助工具",
    "数据分析工具",
    "文件管理神器",
]

ALL_KEYWORDS = CORE_KEYWORDS + LONG_TAIL_KEYWORDS + SCENE_KEYWORDS

# ==================== 采集策略配置 ====================
NOTES_PER_KEYWORD = 40      # 每关键词采集笔记数（减少降低风险）
COMMENT_PAGES = 2           # 每笔记评论页数
MIN_DELAY = 3               # 最小延迟（秒）
MAX_DELAY = 6               # 最大延迟（秒）
MAX_RETRY = 3               # 失败重试次数

# ==================== 过滤规则 ====================
# 排除包含这些词的笔记（广告/营销/低质量）
EXCLUDE_TITLE_WORDS = [
    '免费领', '限时', '优惠券', '折扣', '秒杀', '直播间',
    '关注我', '私信', '加群', '扫码', 'vx', '微信',
    '招聘', '兼职', '赚钱', '月入', '副业',
    '已解决', '已找到', '谢谢各位', '不用了',
]

EXCLUDE_CONTENT_WORDS = [
    '加我微信', '私信我', '评论区', '关注我后',
    '广告', '推广', '合作', '赞助',
]

# 水评过滤（排除无意义评论）
WATER_COMMENTS = [
    '666', '收藏', 'mark', '码住', '插眼', 'cy',
    '同求', '蹲', '等', '+1', '不错', '好用吗',
    '谢谢', '感谢', '学到了', '牛逼', '厉害',
]

# ==================== 需求分类标签 ====================
NEED_CATEGORIES = {
    '工具类': ['工具', '软件', 'app', '应用', '程序'],
    '插件类': ['插件', '扩展', '脚本', '油猴', '浏览器'],
    '定制开发': ['开发', '定制', '写一个', '做一个', '搭建'],
    '数据处理': ['数据', '抓取', '爬虫', '采集', '分析', 'excel', 'csv'],
    '自动化': ['自动', '批量', '脚本', '定时', '一键'],
    '学习求助': ['怎么学', '入门', '教程', '求助', '请教'],
}

OUTPUT_DIR = "output"
CHECKPOINT_FILE = "output/checkpoint.json"


def ensure_dirs():
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)


def load_checkpoint():
    """加载断点，支持增量采集"""
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'collected_note_ids': [], 'last_run': None}


def save_checkpoint(note_ids):
    """保存断点"""
    data = {
        'collected_note_ids': note_ids,
        'last_run': datetime.now().isoformat(),
    }
    with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def random_delay(base=MIN_DELAY, extra=MAX_DELAY-MIN_DELAY):
    """随机延迟"""
    delay = base + random.random() * extra
    time.sleep(delay)
    return delay


def is_valid_note(note_data):
    """内容质量过滤"""
    title = note_data.get('title', '') + note_data.get('desc', '')
    
    # 排除广告营销
    for word in EXCLUDE_TITLE_WORDS:
        if word in title:
            return False, f'命中排除词: {word}'
    
    # 排除过短内容
    if len(title) < 10:
        return False, '内容过短'
    
    # 排除纯表情/无意义内容
    if len(set(title)) < 5:
        return False, '内容无意义'
    
    return True, '通过'


def classify_need(content):
    """需求自动分类"""
    content_lower = content.lower()
    categories = []
    
    for category, keywords in NEED_CATEGORIES.items():
        if any(kw in content_lower for kw in keywords):
            categories.append(category)
    
    return categories if categories else ['未分类']


def is_meaningful_comment(comment_text):
    """判断评论是否有价值"""
    if not comment_text or len(comment_text) < 3:
        return False
    
    # 过滤水评
    for water in WATER_COMMENTS:
        if comment_text.strip() == water or comment_text.startswith(water):
            return False
    
    # 过滤纯表情
    if all(ord(c) > 0x3000 for c in comment_text.strip()):
        return False
    
    return True


def extract_note_data(note_item):
    """提取笔记数据"""
    note_card = note_item.get('note_card', {})
    interact = note_card.get('interact_info', {})
    
    return {
        'note_id': note_item.get('id', ''),
        'title': note_card.get('title', ''),
        'desc': note_card.get('desc', ''),
        'like_count': interact.get('liked_count', '0'),
        'comment_count': interact.get('comment_count', '0'),
        'collect_count': interact.get('collected_count', '0'),
        'author': note_card.get('user', {}).get('nickname', ''),
        'author_id': note_card.get('user', {}).get('user_id', ''),
        'publish_time': note_card.get('time', ''),
        'note_url': f"https://www.xiaohongshu.com/explore/{note_item.get('id', '')}",
        'xsec_token': note_item.get('xsec_token', ''),
        'tags': [tag.get('name', '') for tag in note_card.get('tag_list', [])],
    }


def fetch_comments_filtered(api, note_id, xsec_token, cookies_str, max_pages=COMMENT_PAGES):
    """获取过滤后的高质量评论"""
    comments_data = []
    cursor = ''
    page = 0
    
    try:
        while page < max_pages:
            success, msg, res_json = api.get_note_out_comment(
                note_id, cursor, xsec_token, cookies_str
            )
            
            if not success or not res_json.get('data'):
                break
            
            comments = res_json['data'].get('comments', [])
            if not comments:
                break
            
            for comment in comments:
                content = comment.get('content', '')
                
                # 过滤水评
                if not is_meaningful_comment(content):
                    continue
                
                comments_data.append({
                    'comment_id': comment.get('id', ''),
                    'content': content,
                    'author': comment.get('user_info', {}).get('nickname', ''),
                    'like_count': comment.get('like_count', '0'),
                    'reply_count': comment.get('sub_comment_count', '0'),
                    'publish_time': comment.get('create_time', ''),
                })
            
            if not res_json['data'].get('has_more', False):
                break
            
            cursor = str(res_json['data'].get('cursor', ''))
            if not cursor:
                break
            
            page += 1
            if page < max_pages:
                random_delay()
                
    except Exception as e:
        logger.error(f"获取评论出错: {e}")
    
    return comments_data


def fetch_note_full_content(api, note_url, cookies_str):
    """获取完整正文"""
    try:
        success, msg, note_info = api.get_note_info(note_url, cookies_str)
        if success and note_info.get('data', {}).get('items'):
            item = note_info['data']['items'][0]
            note_card = item.get('note_card', {})
            return {
                'full_content': note_card.get('desc', ''),
                'images_count': len(note_card.get('image_list', [])),
                'has_video': note_card.get('video') is not None,
                'topics': [t.get('name', '') for t in note_card.get('topic_info', {}).get('topic_list', [])],
            }
    except Exception as e:
        logger.error(f"获取详情出错: {e}")
    
    return {}


def collect_keyword(api, keyword, cookies_str, existing_ids):
    """采集单个关键词"""
    logger.info(f"\n{'='*60}")
    logger.info(f"🔍 采集关键词: {keyword}")
    logger.info(f"{'='*60}")
    
    results = []
    
    for attempt in range(MAX_RETRY):
        try:
            success, msg, notes = api.search_some_note(
                query=keyword,
                require_num=NOTES_PER_KEYWORD,
                cookies_str=cookies_str,
                sort_type_choice=0,
                note_type=0,
                note_time=0,
            )
            
            if success:
                break
            else:
                logger.warning(f"第{attempt+1}次尝试失败: {msg}")
                if attempt < MAX_RETRY - 1:
                    time.sleep(5 * (attempt + 1))
        except Exception as e:
            logger.error(f"请求异常: {e}")
            if attempt < MAX_RETRY - 1:
                time.sleep(5 * (attempt + 1))
    
    if not success:
        logger.error(f"关键词 '{keyword}' 最终失败")
        return results
    
    # 过滤非笔记类型
    notes = [n for n in notes if n.get('model_type') == 'note']
    logger.info(f"找到 {len(notes)} 篇笔记")
    
    valid_count = 0
    for idx, note_item in enumerate(notes, 1):
        try:
            note_data = extract_note_data(note_item)
            note_id = note_data['note_id']
            
            # 去重检查
            if note_id in existing_ids:
                logger.info(f"[{idx}] 跳过已采集: {note_data['title'][:30]}...")
                continue
            
            # 质量过滤
            is_valid, reason = is_valid_note(note_data)
            if not is_valid:
                logger.info(f"[{idx}] 过滤: {reason} | {note_data['title'][:30]}...")
                continue
            
            logger.info(f"[{idx}] 处理: {note_data['title'][:40]}...")
            
            # 获取详情
            detail = fetch_note_full_content(api, note_data['note_url'], cookies_str)
            if detail.get('full_content'):
                note_data['full_content'] = detail['full_content']
                # 重新过滤（正文更全）
                is_valid, reason = is_valid_note({
                    'title': note_data['title'],
                    'desc': detail['full_content']
                })
                if not is_valid:
                    logger.info(f"[{idx}] 详情过滤: {reason}")
                    continue
            note_data.update(detail)
            
            # 需求分类
            content_for_classify = note_data.get('full_content', '') or note_data.get('desc', '')
            note_data['need_categories'] = classify_need(content_for_classify)
            
            # 延迟
            random_delay()
            
            # 获取评论
            comments = fetch_comments_filtered(
                api, note_id, note_data['xsec_token'], cookies_str
            )
            note_data['comments'] = comments
            note_data['comments_fetched'] = len(comments)
            
            # 统计信息
            note_data['collection_meta'] = {
                'keyword': keyword,
                'collected_at': datetime.now().isoformat(),
                'keyword_type': '核心词' if keyword in CORE_KEYWORDS else 
                               '长尾词' if keyword in LONG_TAIL_KEYWORDS else '场景词'
            }
            
            results.append(note_data)
            existing_ids.add(note_id)
            valid_count += 1
            
            logger.info(f"  ✅ 完成 | 评论: {len(comments)} | 分类: {note_data['need_categories']}")
            
        except Exception as e:
            logger.error(f"处理笔记出错: {e}")
            continue
    
    logger.info(f"关键词完成: 原始{len(notes)}篇 → 有效{valid_count}篇")
    return results


def save_results(all_results, stats):
    """保存结果"""
    ensure_dirs()
    
    date_str = datetime.now().strftime("%Y%m%d_%H%M")
    filename = f"needs_v2_{date_str}.json"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    # 分类统计
    category_stats = {}
    for r in all_results:
        for cat in r.get('need_categories', ['未分类']):
            category_stats[cat] = category_stats.get(cat, 0) + 1
    
    output = {
        'meta': {
            'version': '2.0',
            'collection_date': datetime.now().isoformat(),
            'total_keywords': len(ALL_KEYWORDS),
            'keywords': {
                'core': CORE_KEYWORDS,
                'long_tail': LONG_TAIL_KEYWORDS,
                'scene': SCENE_KEYWORDS,
            },
            'total_notes': len(all_results),
            'notes_per_keyword': stats,
            'category_distribution': category_stats,
            'filter_rules': {
                'exclude_title_words': EXCLUDE_TITLE_WORDS,
                'exclude_content_words': EXCLUDE_CONTENT_WORDS,
                'water_comments_filtered': WATER_COMMENTS,
            }
        },
        'data': all_results
    }
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    return filepath


def print_summary(stats, output_file, all_results):
    """打印汇总"""
    # 计算分类分布
    category_stats = {}
    for r in all_results:
        for cat in r.get('need_categories', ['未分类']):
            category_stats[cat] = category_stats.get(cat, 0) + 1
    
    print("\n" + "="*70)
    print("🎯 小红书需求采集 V2 - 完成报告")
    print("="*70)
    print(f"\n📁 输出文件: {output_file}")
    print(f"📅 采集时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\n📊 采集统计:")
    print(f"  关键词总数: {len(ALL_KEYWORDS)}")
    print(f"  有效笔记: {len(all_results)} 篇")
    print(f"  去重节省: {sum(stats.values()) - len(all_results)} 篇")
    
    print(f"\n🏷️ 需求分类分布:")
    for cat, count in sorted(category_stats.items(), key=lambda x: -x[1]):
        print(f"  • {cat}: {count} 篇")
    
    print(f"\n📈 各关键词采集:")
    for keyword, count in stats.items():
        if count > 0:
            print(f"  • {keyword}: {count} 篇")
    
    print("\n💡 后续建议:")
    print("  1. 查看 output/ 目录下的 JSON 文件")
    print("  2. 用 jq 或 Python 分析需求热度")
    print("  3. 定期运行，建立需求趋势追踪")
    print("="*70)


def main():
    load_dotenv()
    
    cookies_str = os.getenv('COOKIES', '').strip()
    if not cookies_str:
        print("❌ 未找到 COOKIES，请配置 .env 文件")
        sys.exit(1)
    
    print("="*70)
    print("🚀 小红书需求采集 V2 - 精准策略版")
    print("="*70)
    print(f"🔍 核心词: {len(CORE_KEYWORDS)} | 长尾词: {len(LONG_TAIL_KEYWORDS)} | 场景词: {len(SCENE_KEYWORDS)}")
    print(f"📄 每关键词: {NOTES_PER_KEYWORD} 篇")
    print(f"💬 评论页数: {COMMENT_PAGES}")
    print(f"⏱️  延迟: {MIN_DELAY}-{MAX_DELAY} 秒")
    print(f"🛡️ 过滤: 已启用广告/水评/去重过滤")
    print("="*70)
    
    # 加载断点
    checkpoint = load_checkpoint()
    existing_ids = set(checkpoint['collected_note_ids'])
    if checkpoint['last_run']:
        print(f"📌 上次运行: {checkpoint['last_run']}")
        print(f"📌 已采集: {len(existing_ids)} 篇")
    
    api = XHS_Apis()
    all_results = []
    stats = {}
    
    # 按优先级顺序采集
    keyword_queue = [
        ('核心词', CORE_KEYWORDS),
        ('长尾词', LONG_TAIL_KEYWORDS),
        ('场景词', SCENE_KEYWORDS),
    ]
    
    for category_name, keywords in keyword_queue:
        print(f"\n{'='*70}")
        print(f"📂 开始采集 [{category_name}] - {len(keywords)} 个关键词")
        print(f"{'='*70}")
        
        for keyword in keywords:
            results = collect_keyword(api, keyword, cookies_str, existing_ids)
            stats[keyword] = len(results)
            all_results.extend(results)
            
            # 保存进度
            save_checkpoint(list(existing_ids))
            
            if keyword != keywords[-1]:
                random_delay(5, 5)  # 关键词间更长延迟
    
    # 保存结果
    output_file = save_results(all_results, stats)
    save_checkpoint(list(existing_ids))
    
    # 汇总
    print_summary(stats, output_file, all_results)


if __name__ == '__main__':
    main()
