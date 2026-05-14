#!/bin/bash
# Natalie Dawson 视频批量下载脚本
# 需要：yt-dlp (pip install yt-dlp)
# 用法：./download_natalie.sh

CHANNEL="https://www.youtube.com/@thenataliedawson/videos"
OUTPUT_DIR="~/Downloads/natalie_dawson"
mkdir -p "$OUTPUT_DIR"

echo "=== 开始下载 Natalie Dawson 频道视频 ==="

# 方案A：下载最近20个视频（推荐，先试试水）
yt-dlp \
  --format "best[height<=1080]" \
  --output "$OUTPUT_DIR/%(upload_date)s_%(title)s.%(ext)s" \
  --embed-subs \
  --sub-langs "en,zh-CN,zh-Hans" \
  --write-auto-subs \
  --convert-subs srt \
  --merge-output-format mp4 \
  --limit-rate 5M \
  --download-archive "$OUTPUT_DIR/downloaded.txt" \
  --max-downloads 20 \
  "$CHANNEL"

echo "=== 下载完成，文件保存在 $OUTPUT_DIR ==="
