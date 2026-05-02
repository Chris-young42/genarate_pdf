## 编码规范

- **TS**：禁止 `any`/`@ts-ignore`，所有函数显式参数+返回类型，ESModule import/export，tsconfig `strict: true` + `noImplicitAny` + `noUnusedLocals`
- **风格**：Prettier 2空格，分号结尾，单引号，行宽≤100；文件名 kebab-case，类 PascalCase，变量 camelCase
- **错误**：所有 async 必须 try/catch，禁止空 catch；NestJS Service 抛标准异常，Controller 依赖异常过滤器；前端 API 调用静默降级
- **结构**：`backend/src/<feature>/` 含 `.module.ts` `.controller.ts` `.service.ts` `dto/`；`frontend/src/app/` 含 `layout.tsx` `page.tsx`
- **Prisma**：SQLite 文件锁，先停后端再执行命令：`bash backend/scripts/safe-prisma.sh <子命令>`
