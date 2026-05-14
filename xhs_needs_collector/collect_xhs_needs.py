#!/usr/bin/env python3
"""
小红书需求采集脚本
基于开源项目 Spider_XHS (github.com/cv-cat/Spider_XHS)

【功能】
搜索小红书上与软件需求、插件需求、功能需求相关的笔记和评论，
提取用户真实需求，保存为结构化 JSON 数据。

【环境配置】
1. 将 .env.example 复制为 .env
2. 填入你的小红书 Cookie（登录后从浏览器开发者工具获取）
3. 安装依赖: pip install requests loguru python-dotenv
4. 运行: python collect_xhs_needs.py

【Cookie 获取方式】
1. 浏览器登录小红书 (www.xiaohongshu.com)
2. 按 F12 打开开发者工具
3. 切换到 Network(网络) 标签
4. 刷新页面，找任意一个请求
5. 在请求头(Request Headers)中找到 cookie 字段
6. 复制整个 cookie 字符串到 .env 文件

注意：Cookie 有时效性，失效后需重新获取
"""

import os
import sys
import json
import time
import random
from datetime import datetime
from pathlib import Path

# 添加 Spider_XHS 项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from loguru import logger
from apis.xhs_pc_apis import XHS_Apis

# ==================== 关键词配置 ====================
# 在这里添加/修改你想要搜索的关键词
KEYWORDS = [
    "软件需求",
    "插件需求", 
    "功能需求",
    "求推荐 app",
    "求大神开发",
    "有没有这样的软件",
    "想要一个工具",
    "急需一个插件",
    "求类似功能的app",
    "定制开发",
]

# 每个关键词搜索的笔记数量（每页20条，3页=60条）
NOTES_PER_KEYWORD = 60  # 约 3 页
# 每篇笔记获取的评论页数
COMMENT_PAGES = 2
# 请求间隔（秒）
MIN_DELAY = 2
MAX_DELAY = 3

# ==================== 输出配置 ====================
OUTPUT_DIR = "output"


def ensure_output_dir():
    """确保输出目录存在"""
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)


def random_delay():
    """随机延迟，避免封号"""
    delay = random.uniform(MIN_DELAY, MAX_DELAY)
    time.sleep(delay)
    return delay


def extract_note_data(note_item):
    """从搜索结果中提取笔记基础信息"""
    note_card = note_item.get('note_card', {})
    
    return {
        'note_id': note_item.get('id', ''),
        'title': note_card.get('title', ''),
        'desc': note_card.get('desc', ''),
        'like_count': note_card.get('interact_info', {}).get('liked_count', '0'),
        'comment_count': note_card.get('interact_info', {}).get('comment_count', '0'),
        'collect_count': note_card.get('interact_info', {}).get('collected_count', '0'),
        'author': note_card.get('user', {}).get('nickname', ''),
        'author_id': note_card.get('user', {}).get('user_id', ''),
        'publish_time': note_card.get('time', ''),
        'note_url': f"https://www.xiaohongshu.com/explore/{note_item.get('id', '')}?xsec_token={note_item.get('xsec_token', '')}",
        'xsec_token': note_item.get('xsec_token', ''),
        'tags': [tag.get('name', '') for tag in note_card.get('tag_list', [])],
    }


def fetch_comments(api, note_id, xsec_token, cookies_str, max_pages=COMMENT_PAGES):
    """获取笔记的评论（前 N 页）"""
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
                comments_data.append({
                    'comment_id': comment.get('id', ''),
                    'content': comment.get('content', ''),
                    'author': comment.get('user_info', {}).get('nickname', ''),
                    'like_count': comment.get('like_count', '0'),
                    'reply_count': comment.get('sub_comment_count', '0'),
                    'publish_time': comment.get('create_time', ''),
                })
            
            # 检查是否还有更多评论
            if not res_json['data'].get('has_more', False):
                break
            
            # 获取下一页 cursor
            cursor = str(res_json['data'].get('cursor', ''))
            if not cursor:
                break
            
            page += 1
            if page < max_pages:
                delay = random_delay()
                logger.info(f"  评论分页延迟 {delay:.1f}s")
    
    except Exception as e:
        logger.error(f"获取评论出错: {e}")
    
    return comments_data


def fetch_note_detail(api, note_url, cookies_str):
    """获取笔记详细内容"""
    try:
        success, msg, note_info = api.get_note_info(note_url, cookies_str)
        if success and note_info.get('data', {}).get('items'):
            item = note_info['data']['items'][0]
            note_card = item.get('note_card', {})
            return {
                'full_content': note_card.get('desc', ''),
                'images_count': len(note_card.get('image_list', [])),
                'video': note_card.get('video', None) is not None,
                'topics': [t.get('name', '') for t in note_card.get('topic_info', {}).get('topic_list', [])],
            }
    except Exception as e:
        logger.error(f"获取笔记详情出错: {e}")
    
    return {}


def collect_needs_for_keyword(api, keyword, cookies_str):
    """采集单个关键词的需求数据"""
    logger.info(f"\n{'='*60}")
    logger.info(f"开始采集关键词: {keyword}")
    logger.info(f"{'='*60}")
    
    results = []
    
    try:
        # 搜索笔记（前 3 页，每页 20 条）
        success, msg, notes = api.search_some_note(
            query=keyword,
            require_num=NOTES_PER_KEYWORD,
            cookies_str=cookies_str,
            sort_type_choice=0,  # 综合排序
            note_type=0,  # 不限类型
            note_time=0,  # 不限时间
        )
        
        if not success:
            logger.error(f"搜索失败: {msg}")
            return results
        
        # 过滤掉非笔记类型的结果（如广告、用户等）
        notes = [n for n in notes if n.get('model_type') == 'note']
        
        logger.info(f"找到 {len(notes)} 篇相关笔记")
        
        for idx, note_item in enumerate(notes, 1):
            try:
                # 提取基础信息
                note_data = extract_note_data(note_item)
                note_id = note_data['note_id']
                xsec_token = note_data['xsec_token']
                
                logger.info(f"[{idx}/{len(notes)}] 处理笔记: {note_data['title'][:40]}...")
                
                # 获取笔记详情（完整正文）
                detail = fetch_note_detail(api, note_data['note_url'], cookies_str)
                if detail.get('full_content'):
                    note_data['full_content'] = detail['full_content']
                note_data.update(detail)
                
                # 添加延迟
                delay = random_delay()
                logger.info(f"  详情延迟 {delay:.1f}s")
                
                # 获取评论（前 2 页）
                comments = fetch_comments(api, note_id, xsec_token, cookies_str)
                note_data['comments'] = comments
                note_data['comments_fetched'] = len(comments)
                
                results.append(note_data)
                
                logger.info(f"  ✅ 完成: {len(comments)} 条评论")
                
            except Exception as e:
                logger.error(f"处理笔记出错: {e}")
                continue
        
    except Exception as e:
        logger.error(f"关键词 '{keyword}' 采集失败: {e}")
    
    logger.info(f"关键词 '{keyword}' 采集完成，共 {len(results)} 篇笔记")
    return results


def save_results(all_results, stats):
    """保存采集结果到 JSON"""
    ensure_output_dir()
    
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"needs_{date_str}.json"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    output_data = {
        'meta': {
            'collection_date': datetime.now().isoformat(),
            'total_keywords': len(KEYWORDS),
            'keywords': KEYWORDS,
            'total_notes': sum(stats.values()),
            'notes_per_keyword': stats,
        },
        'data': all_results
    }
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"💾 数据已保存到: {filepath}")
    logger.info(f"📊 总计: {sum(stats.values())} 篇笔记")
    logger.info(f"{'='*60}")
    
    return filepath


def print_summary(stats, output_file):
    """打印采集汇总"""
    print("\n" + "="*60)
    print("🎯 小红书需求采集完成")
    print("="*60)
    print(f"\n📁 输出文件: {output_file}")
    print(f"📅 采集时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔍 关键词数量: {len(KEYWORDS)}")
    print(f"📝 笔记总数: {sum(stats.values())}")
    print("\n📊 各关键词采集数量:")
    for keyword, count in stats.items():
        print(f"  • {keyword}: {count} 篇")
    print("\n✅ 采集完成！")
    print("="*60)


def main():
    """主入口"""
    # 加载环境变量
    load_dotenv()
    
    # 获取 Cookie
    cookies_str = os.getenv('COOKIES', '').strip()
    if not cookies_str:
        print("❌ 错误: 未找到 COOKIES 环境变量")
        print("请按照脚本顶部注释的说明，配置 .env 文件")
        sys.exit(1)
    
    print("="*60)
    print("🚀 小红书需求采集脚本启动")
    print("="*60)
    print(f"🔍 关键词: {', '.join(KEYWORDS)}")
    print(f"📄 每关键词采集: {NOTES_PER_KEYWORD} 篇")
    print(f"💬 每笔记评论: {COMMENT_PAGES} 页")
    print(f"⏱️  请求间隔: {MIN_DELAY}-{MAX_DELAY} 秒")
    print("="*60)
    
    # 初始化 API
    api = XHS_Apis()
    
    all_results = []
    stats = {}
    
    # 逐个关键词采集
    for keyword in KEYWORDS:
        try:
            results = collect_needs_for_keyword(api, keyword, cookies_str)
            stats[keyword] = len(results)
            all_results.extend(results)
            
            # 关键词之间的延迟
            if keyword != KEYWORDS[-1]:
                delay = random_delay()
                logger.info(f"关键词间隔延迟 {delay:.1f}s")
                
        except Exception as e:
            logger.error(f"关键词 '{keyword}' 处理失败: {e}")
            stats[keyword] = 0
            continue
    
    # 保存结果
    output_file = save_results(all_results, stats)
    
    # 打印汇总
    print_summary(stats, output_file)


if __name__ == '__main__':
    main()
