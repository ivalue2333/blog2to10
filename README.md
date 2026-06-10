# blog2to10

一个基于 Next.js 16 + React 19 + TypeScript 的在线工具站，集合了一组实用的小工具：视频播放器、JSON 图片提取、图片信息查看、时间戳转换、白板、JSON 查看器等。

## 在线工具

| 路径 | 名称 | 说明 |
| --- | --- | --- |
| `/onlineplayer` | 在线视频播放器 | 本地视频在线播放，支持多种格式 |
| `/ux_design` | UI 设计原则展示 | 常见 UI 设计原则的可视化 |
| `/json_image` | JSON 图片提取器 | 从 JSON 中批量提取图片地址 |
| `/image_meta` | 图片信息查看 | 图片元信息预览 |
| `/timestamp` | 时间戳转换 | 时间戳与日期相互转换 |
| `/whiteboard` | 白板 | 基于 [Excalidraw](https://github.com/excalidraw/excalidraw)，IndexedDB 本地持久化 |
| `/json_view` | JSON 查看器 | 基于 [@uiw/react-json-view](https://github.com/uiwjs/react-json-view)，格式化 / 折叠 / 高亮 |
| `/base64` | Base64 编解码 | 文本 ↔ Base64 互转，支持 URL-Safe、UTF-8 |

## 技术栈

- **框架**：Next.js 16（App Router + Turbopack）
- **UI**：React 19 + CSS Modules
- **语言**：TypeScript
- **关键依赖**：
  - [`@excalidraw/excalidraw`](https://github.com/excalidraw/excalidraw) — 白板
  - [`@uiw/react-json-view`](https://github.com/uiwjs/react-json-view) — JSON 查看器
  - [`localforage`](https://github.com/localForage/localForage) — IndexedDB 持久化
- **部署**：Vercel

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# 或者使用提供的脚本（自动清理已占用端口）
bash scripts/restart.sh
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

## 构建与部署

```bash
# 本地构建（不部署）
vercel build
vercel build --prod

# 使用本地构建产物部署
vercel deploy --prebuilt
vercel deploy --prebuilt --prod

# 一步生产构建 + 部署
vercel build --prod && vercel deploy --prebuilt --prod
```

## 配色规范

- 主色（绿）：`#2bb673`
- 深绿：`#1f9d63`
- 蓝绿辅助色：`#06b6d4`
- 文本主色：`#17324d`
- 页面背景：`linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)`

## 目录结构

```
app/
  _components/SiteHeader.tsx   # 公共顶栏
  page.tsx                      # 首页（工具入口卡片）
  onlineplayer/                 # 视频播放器
  ux_design/                    # UI 设计原则
  json_image/                   # JSON 图片提取
  image_meta/                   # 图片信息
  timestamp/                    # 时间戳转换
  whiteboard/                   # Excalidraw 白板
  json_view/                    # JSON 查看器
  base64/                       # Base64 编解码
scripts/restart.sh              # 重启脚本
```

## 信息

- 白板：基于 [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)
- JSON 查看器：基于 [uiwjs/react-json-view](https://github.com/uiwjs/react-json-view)
