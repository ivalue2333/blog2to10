<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# restart the server

bash scripts/restart.sh

# git push rules

must use `git -c user.email="ivalue2333@gmail.com" commit -m "something"` so that the user is right.


# build

vercel build

vercel deploy --prebuilt

vercel deploy --prebuilt --prod

vercel build --prod && vercel deploy --prebuilt --prod


# 项目结构

App Router（Next.js 16 + React 19 + TypeScript + CSS Modules）。每个工具一个独立路由：

- `/onlineplayer` 在线视频播放器
- `/ux_design` UI 设计原则展示
- `/json_image` JSON 图片提取器
- `/image_meta` 图片信息查看
- `/timestamp` 时间戳转换
- `/whiteboard` 白板（基于 [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)，localforage IndexedDB 持久化）
- `/json_view` JSON 查看器（基于 [@uiw/react-json-view](https://github.com/uiwjs/react-json-view)）

公共组件：`app/_components/SiteHeader.tsx`。

# 配色规范

- 主色（绿）：`#2bb673`
- 深绿：`#1f9d63`
- 浅绿背景：`rgba(43, 182, 115, 0.12)`
- 蓝绿辅助色：`#06b6d4`
- 文本主色：`#17324d`
- 次级文字：`#6b7780`
- 错误色：`#ef4444`
- 页面背景渐变：`linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)`

# 客户端依赖加载

涉及浏览器 API（IndexedDB、Canvas、剪贴板等）的库必须使用 `next/dynamic` + `ssr: false` 加载，例如 Excalidraw、@uiw/react-json-view。
