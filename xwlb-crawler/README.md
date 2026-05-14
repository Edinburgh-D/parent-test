# 新闻联播爬虫系统

> Playwright Stealth + APScheduler + jieba NLP，Docker一键部署

## 功能特性

- ✅ **合规优先** — 央视网官方数据源，遵守 robots.txt
- ✅ **反封IP** — Playwright Stealth 浏览器指纹伪装 + 代理池轮换 + 请求头轮换 + 频率控制
- ✅ **定时调度** — APScheduler 每天 21:45 自动执行（央视网 21:30 更新后）
- ✅ **NLP分析** — jieba TF-IDF 关键词提取 + TextRank 摘要 + 可选情感分析
- ✅ **数据存储** — SQLite 零配置，预留 PostgreSQL 接口
- ✅ **Docker化** — 一键构建，一键启动

## 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 1. 克隆项目
cd xwlb-crawler

# 2. 复制配置（按需修改）
cp config.yaml config.yaml

# 3. 构建并启动
sudo docker-compose up --build -d

# 4. 查看日志
sudo docker logs -f xwlb-crawler
```

### 方式二：本地运行

```bash
# 1. 安装依赖
pip install -r requirements.txt
playwright install chromium

# 2. 立即抓取今天
python main.py run

# 3. 启动定时调度
python main.py schedule
```

## 命令行用法

```bash
python main.py run                    # 立即抓取今天
python main.py run -d 20260513        # 抓取指定日期
python main.py schedule               # 启动定时调度（每天21:45）
python main.py range -s 20260501 -e 20260510   # 抓取日期范围
python main.py query -d 20260513      # 查询某日数据
python main.py query                  # 列出所有已采集日期
python main.py test-nlp               # 测试NLP分析
```

## 项目结构

```
xwlb-crawler/
├── main.py              # CLI入口
├── config.yaml          # 配置文件
├── requirements.txt     # Python依赖
├── Dockerfile           # Docker镜像
├── docker-compose.yml   # Docker编排
├── src/
│   ├── crawler.py      # Playwright Stealth 爬取核心
│   ├── proxy_pool.py   # 代理池管理（免费+付费接口）
│   ├── nlp.py          # jieba + TextRank NLP分析
│   ├── scheduler.py    # APScheduler 定时调度
│   ├── storage.py      # SQLite/PostgreSQL 存储
│   └── utils.py        # 工具函数（UA轮换、延迟、重试）
├── data/
│   └── xwlb.db         # SQLite数据库
└── logs/
    └── xwlb.log        # 运行日志
```

## 配置说明

编辑 `config.yaml`：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `crawler.min_delay` | 请求最小间隔（秒） | 2.0 |
| `crawler.max_delay` | 请求最大间隔（秒） | 5.0 |
| `proxy.enabled` | 是否启用代理 | false |
| `proxy.type` | 代理类型: free/paid/mixed | free |
| `scheduler.cron_hour` | 定时小时 | 21 |
| `scheduler.cron_minute` | 定时分钟 | 45 |
| `nlp.top_k` | 关键词数量 | 10 |
| `nlp.summary_len` | 摘要长度 | 100 |
| `storage.db_type` | 数据库: sqlite/postgresql | sqlite |

## 数据源

- **央视网官方**: `https://tv.cctv.com/lm/xwlb/day/{YYYYMMDD}.shtml`
- **合规措施**: 检查 robots.txt、频率 ≤ 1 req/3s、仅文字稿

## 技术栈

| 功能 | 技术 |
|------|------|
| 爬取 | Playwright + playwright-stealth |
| 代理 | 免费代理池 + 付费代理预留接口 |
| 调度 | APScheduler |
| NLP | jieba + gensim + SnowNLP |
| 存储 | SQLAlchemy + SQLite |
| 日志 | loguru |
| 配置 | pydantic + PyYAML |

## 许可

仅供学习研究使用。抓取内容版权归央视网所有。
