FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖 + Playwright浏览器依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    fonts-liberation \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 安装 Playwright 浏览器
RUN playwright install chromium

# 复制项目代码
COPY . .

# 创建必要目录
RUN mkdir -p data logs

# 环境变量
ENV PYTHONUNBUFFERED=1
ENV TZ=Asia/Shanghai

# 默认启动调度模式（可通过 docker run 覆盖）
CMD ["python", "main.py", "schedule"]
