const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEMO_CONTENT = `# 张三 :technologist:

:email: zhangsan@email.com | :phone: 138-0000-0000 | :globe_with_meridians: github.com/zhangsan

---

## :bust_in_silhouette: 个人简介

资深全栈工程师，5 年前端开发经验。擅长 **React、TypeScript、Node.js**，
对用户体验和性能优化有深入理解。具备良好的团队协作和沟通能力。

> 追求代码质量与工程效率的完美平衡 :rocket:

## :briefcase: 工作经历

### 高级前端工程师 | ABC 科技公司
*2023.06 - 至今*

- [x] 负责核心业务模块的架构设计与开发
- [x] 主导前端性能优化，首屏加载时间降低 40%
- [x] 搭建组件库，提升团队开发效率 30%

### 前端开发工程师 | XYZ 互联网
*2021.07 - 2023.05*

- [x] 参与电商平台前端开发，使用 \`React + TypeScript\` 技术栈
- [x] 开发可视化数据大屏，实时展示业务指标
- [x] 编写单元测试，代码覆盖率达到 85%

## :mortar_board: 教育背景

### 计算机科学与技术 本科 | 某知名大学
*2017.09 - 2021.06*

- GPA 3.8/4.0，校级优秀毕业生 :trophy:

## :hammer_and_wrench: 技能特长

| 类别 | 技能 |
|------|------|
| 编程语言 | \`JavaScript\` \`TypeScript\` \`Python\` |
| 前端技术 | \`React\` \`Next.js\` \`Tailwind CSS\` |
| 后端技术 | \`Node.js\` \`Nest.js\` \`PostgreSQL\` |
| 工具链 | \`Git\` \`Docker\` \`CI/CD\` |

## :rocket: 项目经验

### 开源组件库 NeoUI
开发了一套企业级 React 组件库，GitHub Stars 2k+ :star:

### 实时协作白板
基于 **WebSocket** + **Canvas** 的实时协作画板，支持多人同时编辑

---

> :bulb: 期待加入一个充满激情的团队，共同创造卓越的产品！
`;

async function main() {
  const count = await prisma.resume.count();
  if (count === 0) {
    await prisma.resume.create({
      data: {
        title: '张三 - 全栈工程师简历',
        content: DEMO_CONTENT,
      },
    });
    console.log('✅ Demo resume seeded.');
  } else {
    console.log(`ℹ️  Database already has ${count} resume(s), skipping seed.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
