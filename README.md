# ResumeForge

Apple 设计风格的 Markdown 简历编辑器。纯文本书写，实时预览，一键导出 PDF。

<p align="center">
  <img src="https://img.shields.io/badge/frontend-Next.js%2014-000000?logo=next.js" alt="Frontend">
  <img src="https://img.shields.io/badge/backend-NestJS-8234d5?logo=nestjs" alt="Backend">
  <img src="https://img.shields.io/badge/database-SQLite%20%2B%20Prisma-003B57?logo=prisma" alt="Database">
  <img src="https://img.shields.io/badge/styling-Tailwind%20CSS-38BDF8?logo=tailwindcss" alt="Styling">
  <img src="https://img.shields.io/badge/deploy-Docker-2496ED?logo=docker" alt="Deploy">
</p>

---

## 功能

- **Markdown 编辑** — 支持 GFM 语法、自定义 Emoji、双栏布局容器，所见即所得
- **实时预览** — 精心调校的中文排版样式，导出即投递
- **一键导出** — 300dpi 高清 PDF + 原始 Markdown 文件
- **滚动翻书动画** — 首页滚轮驱动 3D 书本展开，预览编辑器演示
- **液态玻璃设计** — Apple 设计语言，毛玻璃导航栏/侧边栏/卡片

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 (App Router) · React 18 · Tailwind CSS 3.4 |
| 后端 | NestJS 10 · Prisma 5 · SQLite |
| 导出 | jsPDF · html2canvas · react-markdown |
| 部署 | Docker · Docker Compose |

## 项目结构

```
resume-generator/
├── frontend/                # Next.js 14 前端
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # 首页 (Apple 风格展示页 + 翻书动画)
│   │   │   ├── app/page.tsx # 编辑器页面 (/app)
│   │   │   ├── layout.tsx   # 根布局
│   │   │   └── globals.css  # 全局样式
│   │   └── components/      # 组件目录
│   ├── tailwind.config.ts
│   ├── Dockerfile
│   └── package.json
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── main.ts          # 入口 (CORS, 端口 3001)
│   │   ├── app.module.ts
│   │   └── resume/          # 简历 CRUD 模块
│   ├── prisma/
│   │   ├── schema.prisma    # 数据库模型
│   │   └── seed.js          # 演示数据种子脚本
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── deploy.sh                # 一键部署脚本
├── .env                     # 环境变量 (默认值)
└── README.md
```

## 快速开始 (本地开发)

### 前提

- Node.js 18+
- npm 9+

### 1. 启动后端

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

后端运行在 `http://localhost:3001`。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:3000`。

### 3. 访问

打开浏览器访问 `http://localhost:3000`，即可看到首页。点击「开始制作」进入编辑器。

## Docker 部署

### 方式一：部署脚本 (推荐)

```bash
# 一键部署
bash deploy.sh

# 停止容器
bash deploy.sh stop

# 停止 + 删除镜像 (数据保留)
bash deploy.sh clean
```

### 方式二：Docker Compose

```bash
# 构建并启动
docker-compose up -d --build

# 停止
docker-compose down

# 停止 + 删除数据卷
docker-compose down -v
```

### 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `CORS_ORIGIN` | `http://localhost:3000` | 后端 CORS 允许的来源 |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/resumes` | 前端 API 地址 (构建时注入) |

### 数据持久化

- SQLite 数据库文件存储在 `./data/dev.db`
- Docker 容器销毁后数据不会丢失 (由 volume 挂载保护)
- 首次启动时自动执行 Prisma 迁移并写入"张三"演示简历

## API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/resumes` | 获取所有简历 (按更新时间降序) |
| `GET` | `/api/resumes/:id` | 获取单份简历 |
| `POST` | `/api/resumes` | 创建新简历 |
| `PUT` | `/api/resumes/:id` | 更新简历 |
| `DELETE` | `/api/resumes/:id` | 删除简历 |

## 许可证

MIT
