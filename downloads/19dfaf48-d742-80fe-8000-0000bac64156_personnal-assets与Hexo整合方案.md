# personnal-assets 与 Hexo 博客整合方案

> 目标：解决 personnal-assets 仓库和 Hexo 博客"两张皮"的问题
> 现状：两个仓库各自为政，维护两套文档
> 日期：2025-05-01

---

## 一、现状问题

**当前实际状态**：
- personnal-assets：存了全部项目文档（20+文件，最新最全）
- recordblog（Hexo源码）：只复制了其中16篇到 source/_posts/（博客显示）
- 割裂点：personnal-assets 更新了，博客不会自动同步；博客上的文章是快照，不是实时连接

---

## 二、三种整合方案

### 方案A：GitHub Actions 自动同步（推荐）

**机制**：
```
personnal-assets 更新 Markdown
    ↓
触发 GitHub Actions 工作流
    ↓
自动复制新文件到 recordblog/source/_posts/
    ↓
自动 hexo generate + 部署到 edinburgh-d.github.io
```

**优点**：
- 全自动，一次配置，永远生效
- personnal-assets 更新后，博客自动同步（延迟1-2分钟）
- 维护成本低
- 你可以继续只用 personnal-assets 管理文档

**缺点**：
- 需要配置 GitHub Actions
- 初期设置需要15分钟

**实施步骤**：
1. 在 personnal-assets 仓库创建 `.github/workflows/sync-to-blog.yml`
2. 配置当 Markdown 文件更新时自动推送到 recordblog
3. 配置 recordblog 收到更新后自动 hexo generate + 部署

**复杂度**：[中] 一次性配置

---

### 方案B：子模块/软链接（技术方案）

**机制**：
把 personnal-assets 仓库作为子模块嵌入 recordblog，或者创建符号链接（symlink）让 recordblog/source/_posts/ 指向 personnal-assets 的目录。

**优点**：
- 实时同步，不需要复制文件
- personnal-assets 和博客永远一致

**缺点**：
- Hexo 对符号链接支持不好，可能出问题
- 子模块配置复杂，容易误操作
- GitHub Pages 构建环境可能不支持

**复杂度**：[重] 不推荐

---

### 方案C：统一到一个仓库（简单粗暴）

**机制**：
废弃 personnal-assets，全部文档直接存 recordblog/source/_posts/ 下。这样博客就是文档仓库，读者和管理者看的是同一个地方。

**优点**：
- 只有一个仓库，没有同步问题
- 最简单直接

**缺点**：
- recordblog 仓库会越来越大（Hexo源码 + 所有文档）
- 文档结构和博客文章混在一起，管理混乱
- personnal-assets 已有的GitHub链接会失效

**复杂度**：[轻] 但长期混乱

---

## 三、推荐方案：方案A 自动同步

**实施计划**：

### 第一步：配置 personnal-assets → recordblog 同步（5分钟）

在 personnal-assets 仓库创建文件：`.github/workflows/sync-to-hexo.yml`

```yaml
name: Sync to Hexo Blog

on:
  push:
    paths:
      - '**.md'  # 当任何Markdown文件更新时触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Clone blog repo
        uses: actions/checkout@v3
        with:
          repository: Edinburgh-D/recordblog
          token: ${{ secrets.GH_PAT }}
          path: blog
          
      - name: Copy new files
        run: |
          cp *.md blog/source/_posts/ 2>/dev/null || true
          cp **/*.md blog/source/_posts/ 2>/dev/null || true
          
      - name: Push to blog repo
        run: |
          cd blog
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add -A
          git diff --cached --quiet || git commit -m "Sync from personnal-assets"
          git push
```

### 第二步：配置 recordblog 自动部署（5分钟）

在 recordblog 仓库已有 `.github/workflows/deploy.yml`，修改触发条件：

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # 允许手动触发
```

### 第三步：配置 Personal Access Token（5分钟）

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 生成新 token，勾选 `repo` 权限
3. 在 personnal-assets 仓库：Settings → Secrets → New repository secret
4. 名称：`GH_PAT`，值：刚才的 token

### 第四步：测试（1分钟）

1. 在 personnal-assets 修改任意 Markdown 文件
2. 提交后等待1-2分钟
3. 查看 edinburgh-d.github.io，确认文章已更新

---

## 四、维护成本对比

| 方案 | 日常操作 | 维护频率 | 出错风险 |
|------|---------|---------|---------|
| 方案A 自动同步 | 零操作，全自动 | 半年检查一次 | 低 |
| 方案B 子模块 | 每次需要手动同步 | 每次更新 | 高 |
| 方案C 统一仓库 | 手动复制文件 | 每次更新 | 中 |

---

## 五、建议

**推荐方案A**，原因：
1. 全自动，一次配置永久生效
2. 维护成本最低
3. 不需要改变现有工作习惯
4. personnal-assets 作为"文档主仓库"的定位更清晰

**需要用户提供的**：
- 一个 GitHub Personal Access Token（有 repo 权限）
- 10分钟配置时间

---

## 六、备用方案

如果方案A配置失败，备选是**手动同步清单**：

每次 personnal-assets 更新后，执行：
1. 打开 recordblog 仓库
2. 复制 personnal-assets 的新 Markdown 文件到 source/_posts/
3. 提交并推送
4. 等待自动部署

但这需要每次手动操作，不如方案A自动。

---

*整合方案 v1.0 | 生成日期：2025-05-01*
*推荐：方案A（GitHub Actions 自动同步）*
