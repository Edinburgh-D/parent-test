# 32App 组合使用指南 —— 个人知识库 × 自动化 × 信息流检索

> 基于 GitHub 开源项目 + 网络现成案例 + 32个可操作App的实战组合方案

---

## 一、研究摘要：网上已有哪些案例？

### 1.1 开源项目发现

| 项目 | 功能 | 与32App的关联 |
|------|------|--------------|
| **Logseq** (★70k+) | 开源隐私优先知识管理，支持Markdown/Org-mode，PDF标注，日记，白板 | 可作为知识存储层核心，Android端可用APK |
| **Joplin** (★40k+) | 全平台笔记，支持E2E加密、网页剪藏、多云同步 | 信息采集+存储层，Chrome插件可剪藏 |
| **Anytype** | 开源本地优先，端到端加密，P2P同步，类Notion | 知识库核心，无服务器 |
| **AutoTask** (GitHub: xjunz) | 支持Shizuku + 无障碍双模式的自动化助手 | 直接对应MacroDroid+Shizuku组合 |
| **Roubao** (GitHub: Turbo1123) | 原生Android AI自动化，Kotlin重写MobileAgent，Shizuku驱动 | 证明Shizuku+本地AI自动化完全可行 |
| **MAA-Meow** | 原生Android自动化，图像识别驱动，Shizuku/Root双支持 | Shizuku系统级自动化实战案例 |
| **awesome-workflow-automation** (GitHub: dariubs) | 整理了Lindy/Gumloop/Relay.app/Dify等AI自动化平台 | 提供跨App自动化思路参考 |
| **ChatGPT-Claude-Perplexity-API-Wrappers** | 统一Python接口调用三大AI API | AI层可编程化参考 |

### 1.2 现成方案案例

- **"Second Brain on Mobile" 方案**：Logseq/Joplin + 手机剪藏工具（如Chrome分享）→ 实现移动端碎片化信息入库
- **MacroDroid Morning Routine**：时间触发 → 关勿扰+调亮度+开WiFi+开新闻App+语音播报天气（已有2000万+下载验证）
- **Roubao 原生Android自动化**：Shizuku获取系统级权限 → 本地截图+分析+执行，无需电脑ADB
- **Shizuku + MacroDroid 组合**：Shizuku提供root级权限，MacroDroid编排流程，已被Android社区广泛验证

---

## 二、32App 分类图谱

```
┌─────────────────────────────────────────────────────────────┐
│                     32App 全景分类                           │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│   AI大脑层   │  信息输入层  │  社交分发层  │    工具/系统层       │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ Claude      │ AP News     │ Instagram   │ Chrome              │
│ ChatGPT     │ Hacker News │ Facebook    │ Clash               │
│ Grok        │ Ground News │ Discord     │ Xed-Editor          │
│ Perplexity  │ Medium      │ Threads     │ MacroDroid ⭐        │
│ Kimi        │ Read Chan   │ X           │ Shizuku ⭐           │
│ Local Dream │ Quora       │ LinkedIn    │ Pixel IMS           │
│             │             │ rednote     │                     │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│   办公协作层  │  系统基础层  │  特殊工具层  │    求职/其他        │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ Proton Mail │ Phone       │ Google Earth│ OfferToday          │
│ Kimi Claw   │ Messages    │ wallflow    │ LinkedIn (求职)     │
│             │ Camera      │ onX Hunt    │ TextNow             │
│             │ Settings    │ 当贝家      │ V2er                │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

---

## 三、五层架构：从信息到行动

### 3.1 信息获取层（Input Layer）

**核心任务**：用尽可能多的触角捕获信息

| App | 角色 | 获取方式 |
|-----|------|---------|
| **AP News** | 权威硬新闻速报 | 每日推送 → 快速扫标题 |
| **Hacker News** | 技术/创业前沿 | 每日Top10浏览 → 有价值的点进原文 |
| **Ground News** | 同一事件多角度（左中右媒体对比） | 热点事件时打开，看Bias Comparison |
| **Medium** | 深度长文/技术博客 | 关注特定Publication，定期批量阅读 |
| **Quora** | 大众智慧/问答类知识 | 搜索特定话题，收集高赞回答 |
| **Read Chan** | 轻量阅读/社区内容 | 碎片时间浏览 |
| **V2er** | 中文开发者社区 | 技术话题追踪 |
| **Chrome** | 网页浏览+剪藏入口 | 配合Joplin Web Clipper插件直接入库 |

**Workflow示例**：
> MacroDroid定时触发（早8:00）→ 依次打开AP News + Hacker News → 语音播报今日Top3 → 人工扫一遍 → 有价值的点击「分享→Joplin剪藏」

### 3.2 信息处理层（Process Layer）

**核心任务**：AI提炼、总结、分类

| App | 角色 | 处理流程 |
|-----|------|---------|
| **Claude** | 长文深度分析/推理 | 把剪藏的文章丢给Claude，要求：总结3点核心+1个行动建议 |
| **ChatGPT** | 通用问答/格式转换 | 表格提取、数据整理、翻译 |
| **Perplexity** | 实时信息检索+溯源 | "搜索最新XXX进展并给出引用来源" |
| **Kimi** | 中文长文处理/文件阅读 | 上传PDF/Word直接问答 |
| **Grok** | X平台实时信息/X风分析 | 对X上的热点话题快速检索 |
| **Local Dream** | 本地隐私AI（离线可用） | 敏感内容本地处理，不上云 |

**Workflow示例**：
> 剪藏文章 → 先用Perplexity补充最新背景信息 → 再用Claude做深度分析 → 输出结构化摘要（标题/核心论点/行动项/原文链接）

### 3.3 信息存储层（Storage Layer）

**核心任务**：归档、标签、可检索

| 方案 | 工具 | 适用场景 |
|------|------|---------|
| **方案A：开源本地优先** | Logseq (Android APK) + 本地Markdown文件夹 | 隐私敏感、技术用户、喜欢图谱 |
| **方案B：全平台云同步** | Joplin + 自建Joplin Server/Nextcloud | 多设备、需要Web剪藏、E2E加密 |
| **方案C：Notion-like开源** | Anytype（P2P同步，无服务器） | 喜欢块编辑器、离线优先 |
| **方案D：轻量笔记** | Xed-Editor + 本地Git仓库 | 程序员、文本控、用Git管理版本 |
| **方案E：飞书/云文档** | Kimi Claw → Feishu文档 | 需要分享协作、中文环境 |

**推荐组合**：
- **移动端入口**：Joplin（剪藏方便）或 Logseq（日记+白板）
- **归档规范**：每条笔记必须包含 `#来源App` `#主题标签` `#日期` `#处理状态(未读/已摘/已归档)`

### 3.4 自动化层（Automation Layer）⭐ 核心

**核心引擎：MacroDroid + Shizuku**

#### MacroDroid 能做什么？

根据搜索结果，MacroDroid（2000万+下载）支持：
- **85+ 触发器**：时间、位置、电量、通知、应用启动、传感器（摇晃、光线）、NFC、蓝牙/WiFi连接
- **100+ 动作**：发送消息、语音播报、调音量、开关设置、启动App、截图、文件操作、运行Tasker插件
- **50+ 约束条件**：只在特定时间段/地点/电量/星期几执行

#### Shizuku 能解锁什么？

- **无需Root的系统级权限**：执行`input tap/swipe`、截图、读取其他App UI内容
- **与MacroDroid集成**：MacroDroid调用Shizuku执行高级系统命令
- **参考项目**：Roubao、AutoTask、MAA-Meow 均已验证

#### 可落地的自动化Workflow

| 场景 | 触发器 | 动作链 |
|------|--------|--------|
| **晨间信息流** | 每日 8:00 | 关勿扰→开WiFi→开AP News→语音播报→3分钟后开Hacker News |
| **智能剪藏** | 收到Chrome「分享」意图 | 判断域名 → 如果是Medium/Quora → 直接分享至Joplin |
| **夜间归档** | 每日 23:00 | 检查Logseq今日日记 → 未归档项语音提醒 → 一键标记完成 |
| **电量保护** | 电量 < 20% | 关后台数据→降亮度→通知："知识库进入低功耗模式" |
| **位置切换** | 到家/到公司 | 到家→开WiFi+启动Local Dream（本地模式）；到公司→开Clash+启动工作流 |
| **消息自动化** | 收到特定SMS | 提取关键词→匹配知识库→自动回复相关内容摘要 |

#### MacroDroid + 具体App 的组合

```
MacroDroid 动作链示例：「每日AI摘要」

触发：每日 21:00
约束：仅当WiFi连接时

动作1：打开 Kimi App
动作2：等待 5秒（加载）
动作3：语音输入："总结今天保存的文章"
动作4：等待 30秒
动作5：截图保存至 /Knowledge/Daily/YYYYMMDD/
动作6：打开 Joplin → 新建笔记 → 粘贴截图
动作7：发送通知："今日摘要已归档"
```

### 3.5 输出/分享层（Output Layer）

| App | 输出形式 | 适用内容 |
|-----|---------|---------|
| **rednote (小红书)** | 图文卡片/短笔记 | 知识提炼、读书摘要、工具推荐 |
| **Threads** | 短串/thread | 观点输出、实时思考流 |
| **X** | 推文/thread | 技术观点、行业评论 |
| **LinkedIn** | 职场长文 | 专业领域深度内容 |
| **Discord** | 频道分享/讨论 | 社区型知识输出 |
| **Instagram** | 图片/Stories | 可视化知识（信息图、quote卡片） |
| **Kimi Claw** | 飞书/IM推送 | 团队协作、日报同步 |
| **Proton Mail** | 加密邮件 | 敏感内容、Newsletter |
| **TextNow** | 短信/通话 | 轻量通知（如"今日知识推送"） |

---

## 四、四大实战组合方案

### 方案A：「晨间情报员」—— 30分钟自动信息流

**目标**：每天起床自动跑一轮信息获取+初筛

```
7:30  MacroDroid触发
  ├─ 关勿扰模式
  ├─ 语音播报："早安，开始获取今日情报"
  ├─ 打开 AP News → 停留2分钟（人工扫标题）
  ├─ 打开 Hacker News → 停留2分钟
  ├─ 打开 Ground News → 看今日热点Bias对比
  ├─ 打开 V2er → 中文技术动态
  ├─ 语音播报："获取完成，请标记感兴趣的内容"
  └─ 发送通知：待阅读清单已生成

8:00  人工介入
  ├─ 扫一遍各App → 有价值的点击「分享→Joplin剪藏」
  └─ 标记 #晨间情报 #待处理
```

### 方案B：「AI深加工流水线」—— 剪藏→分析→归档

**目标**：把剪藏的原始信息变成结构化知识

```
Step 1: Joplin 收到剪藏文章
  └─ 标签：#raw #来源-[App名] #日期

Step 2: 当日21:00 MacroDroid触发「深加工」
  ├─ 打开 Claude/Perplexity（轮询）
  ├─ 复制Joplin文章链接/内容
  ├─ 发送Prompt："总结核心观点3条，补充最新进展，给出1个可行动建议"
  ├─ 等待输出 → 复制结果
  ├─ 打开Joplin → 原文下方追加「AI分析」区块
  └─ 标签更新：#已处理 #AI分析

Step 3: 周末批量回顾
  ├─ 打开 Logseq → 看本周知识图谱
  └─ 把关联知识点做双向链接
```

### 方案C：「社交输出引擎」—— 知识→内容→分发

**目标**：把积累的知识定期转化为社交内容

```
MacroDroid：每周日 10:00 触发「内容工坊」

  1. 打开 Logseq → 筛选本周高价值笔记（手动标记⭐）
  2. 打开 Kimi/Claude → 输入："把以下笔记改写成3条小红书风格图文+1条Thread串+1条LinkedIn长文"
  3. 输出保存至 Xed-Editor 草稿箱
  4. 人工审核 → 修改 → 分发：
     ├─ 小红书 → rednote
     ├─ 观点短串 → Threads
     ├─ 专业长文 → LinkedIn
     └─ 技术讨论 → Discord/V2er
```

### 方案D：「求职情报站」—— OfferToday + LinkedIn + AI监控

```
MacroDroid：每日 12:00 + 18:00 触发

  1. 打开 OfferToday → 浏览今日新岗位 → 剪藏感兴趣的
  2. 打开 LinkedIn → 看目标公司动态/新职位
  3. 打开 Perplexity → 搜索"[目标公司] 最新财报/新闻/团队变动"
  4. 用 Claude 写定制化求职信草稿
  5. 保存至 Joplin「求职」笔记本
  6. 设置面试提醒（飞书日历/Kimi Claw）
```

---

## 五、其他App的妙用

| App | 非直觉用法 | 知识库场景 |
|-----|-----------|-----------|
| **Google Earth** | 标记"虚拟旅行目的地"→旅行知识库 | 地理相关研究、旅行计划 |
| **wallflow** | 壁纸管理→视觉灵感库 | 设计参考、视觉情绪板 |
| **onX Hunt** | GPS轨迹记录→户外知识库 | 徒步路线、地理标记 |
| **当贝家** | 智能家居中枢→环境自动化 | 到家自动开阅读灯+启动知识库App |
| **Pixel IMS** | 消息协议管理→多账号隔离 | 区分"工作IM"和"知识推送IM" |
| **Facebook** | 加入专业Group→行业情报源 | 垂直领域Group信息监控 |
| **Local Dream** | 离线AI = 飞机上/地铁里也能处理知识 | 通勤时间深加工 |
| **Camera** | 拍照→OCR→知识库（拍书/白板/海报） | 实体信息数字化 |

---

## 六、推荐开源项目速查表

| 项目 | GitHub Stars | 用途 | 链接 |
|------|-------------|------|------|
| Logseq | ★70k+ | 知识管理核心 | github.com/logseq/logseq |
| Joplin | ★40k+ | 全平台笔记 | github.com/laurent22/joplin |
| Anytype | ★20k+ | 本地优先Notion替代 | github.com/anyproto/anytype-ts |
| AutoTask | ★2k+ | Shizuku+无障碍自动化 | github.com/xjunz/AutoTask |
| Roubao | ★1k+ | 原生Android AI自动化 | github.com/Turbo1123/roubao |
| MAA-Meow | ★500+ | 原生Android图像识别自动化 | github.com/Aliothmoon/MAA-Meow |
| awesome-workflow-automation | ★1k+ | 自动化工具大全 | github.com/dariubs/awesome-workflow-automation |
| Dify | ★58k+ | 开源LLM工作流平台 | github.com/langgenius/dify |

---

## 七、落地建议：从0到1的启动顺序

### Week 1：搭骨架
1. 选一个知识库核心（推荐Joplin，剪藏最方便）
2. 装 MacroDroid + Shizuku，做2个简单自动化（晨间开新闻+夜间提醒）
3. 确定3个主要信息源（如Hacker News + AP News + 一个垂直社区）

### Week 2：跑流水线
4. 建立「剪藏→AI分析→归档」的完整流程
5. 训练自己：看到好内容 → 立刻分享至Joplin（养成肌肉记忆）
6. 用AI做第一批"深加工"笔记

### Week 3：自动化升级
7. 用 MacroDroid 编排更复杂的跨App流程
8. 尝试Shizuku解锁系统级自动化（如截图+自动归档）
9. 建立标签规范 + 定期回顾机制

### Week 4：输出闭环
10. 把积累的内容转化为社交输出
11. 建立反馈循环：看哪类内容互动高→调整信息源
12. 持续迭代

---

## 八、局限性与诚实提醒

| 局限 | 说明 | 对策 |
|------|------|------|
| **MacroDroid免费版限5个宏** | 复杂流程不够用 | Pro版约$5，一次买断 |
| **Shizuku需ADB/Root启动** | 重启后可能需重新授权 | Android 11+可用无线调试，一次配对；Root设备一劳永逸 |
| **AI App间无法直接数据互通** | Claude不能直接把结果传给Kimi | 用剪贴板/截图/本地文件做中转 |
| **社交媒体自动化有风险** | 平台可能检测异常行为 | 输出层建议人工审核后再发 |
| **本地AI能力有限** | Local Dream模型规模小 | 用于隐私敏感内容，复杂任务上云 |

---

> **核心洞察**：32个App不是各自为战的工具箱，而是一个有层次的"信息生命体"——触角（获取）→ 大脑（处理）→ 骨髓（存储）→ 神经系统（自动化）→ 声音（输出）。MacroDroid+Shizuku是这个生命体的神经系统。
