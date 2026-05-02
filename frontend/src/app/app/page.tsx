'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { nameToEmoji } from 'gemoji';
import { visit } from 'unist-util-visit';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import type { Root, Text as MdastText, Paragraph, BlockContent } from 'mdast';
import type { Node } from 'unist';
import {
  FileText,
  Save,
  Download,
  Plus,
  Trash2,
  ChevronDown,
  Menu,
  X,
  FileEdit,
  ChevronRight,
  Loader2,
  Check,
  Home,
} from 'lucide-react';

const API_BASE = '/api/resumes';

interface Resume {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

type EmojiMap = Record<string, string>;

interface ContainerElement {
  type: 'element';
  data: {
    hName: 'div';
    hProperties: { className: 'col-left' | 'col-right' };
  };
  children: BlockContent[];
}

interface TwoColumnsElement {
  type: 'element';
  data: {
    hName: 'div';
    hProperties: { className: 'two-columns' };
  };
  children: [ContainerElement, ContainerElement];
}

type CustomBlock = BlockContent | ContainerElement | TwoColumnsElement;

const DEFAULT_CONTENT = `# 张三 :technologist:

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

\`\`\`
NeoUI
├── components/     # 30+ 组件
├── hooks/          # 15+ 自定义 Hooks
└── utils/          # 工具函数库
\`\`\`

### 实时协作白板
基于 **WebSocket** + **Canvas** 的实时协作画板，支持多人同时编辑

---

> :bulb: 期待加入一个充满激情的团队，共同创造卓越的产品！
`;

const CUSTOM_EMOJI: EmojiMap = {
  weixin: '💬',
  wechat: '💬',
  qq: '🐧',
  zhihu: '🔷',
  bilibili: '📺',
  douyin: '🎵',
  weibo: '👁️',
};

type RemarkPlugin = (tree: Root) => void;

function remarkCustomEmoji(): RemarkPlugin {
  return (tree: Root): void => {
    visit(tree, 'text', (node: Node) => {
      const textNode = node as MdastText;
      textNode.value = textNode.value.replace(
        /:([\w+-]+):/g,
        (_match: string, name: string): string => {
          const char: string =
            CUSTOM_EMOJI[name] ?? (nameToEmoji as EmojiMap)[name] ?? '';
          return char || _match;
        },
      );
      textNode.value = textNode.value.replace(
        /icon:([\w+-]+)/g,
        (_match: string, name: string): string => {
          const char: string =
            CUSTOM_EMOJI[name] ?? (nameToEmoji as EmojiMap)[name] ?? '';
          return char || _match;
        },
      );
    });
  };
}

function remarkContainers(): RemarkPlugin {
  return (tree: Root): void => {
    const rootChildren = tree.children as CustomBlock[];
    if (rootChildren.length === 0) {
      return;
    }

    const newChildren: CustomBlock[] = [];
    let i = 0;

    while (i < rootChildren.length) {
      const node = rootChildren[i];

      if (
        node.type === 'paragraph' &&
        (node as Paragraph).children.length === 1 &&
        (node as Paragraph).children[0].type === 'text'
      ) {
        const paraNode = node as Paragraph;
        const textNode = paraNode.children[0] as MdastText;
        const text: string = textNode.value;
        const openMatch = text.match(/^:::\s*(left|right)\s*$/);
        const closeMatch = text.match(/^:::\s*$/);

        if (openMatch) {
          const kind = openMatch[1] as 'left' | 'right';
          const containerChildren: BlockContent[] = [];
          i++;

          while (i < rootChildren.length) {
            const sibling = rootChildren[i];
            if (
              sibling.type === 'paragraph' &&
              (sibling as Paragraph).children.length === 1 &&
              (sibling as Paragraph).children[0].type === 'text' &&
              /^:::\s*$/.test(
                ((sibling as Paragraph).children[0] as MdastText).value,
              )
            ) {
              i++;
              break;
            }
            containerChildren.push(sibling as BlockContent);
            i++;
          }

          const containerEl: ContainerElement = {
            type: 'element',
            data: {
              hName: 'div',
              hProperties: {
                className: kind === 'left' ? 'col-left' : 'col-right',
              },
            },
            children: containerChildren,
          };
          newChildren.push(containerEl);
          continue;
        }

        if (closeMatch) {
          i++;
          continue;
        }
      }

      newChildren.push(node as BlockContent);
      i++;
    }

    const merged: CustomBlock[] = [];
    for (let j = 0; j < newChildren.length; j++) {
      const a = newChildren[j];
      const b = newChildren[j + 1];
      if (
        a.type === 'element' &&
        b?.type === 'element' &&
        a.data.hProperties.className === 'col-left' &&
        b.data.hProperties.className === 'col-right'
      ) {
        const wrapper: TwoColumnsElement = {
          type: 'element',
          data: {
            hName: 'div',
            hProperties: { className: 'two-columns' },
          },
          children: [a as ContainerElement, b as ContainerElement],
        };
        merged.push(wrapper);
        j++;
      } else {
        merged.push(a);
      }
    }
    tree.children = merged as BlockContent[];
  };
}

export default function EditorPage(): JSX.Element {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('未命名简历');
  const [content, setContent] = useState<string>(DEFAULT_CONTENT);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSaved, setShowSaved] = useState<boolean>(false);
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const fetchResumes = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data: Resume[] = await res.json();
        setResumes(data);
      }
    } catch {
      /* server offline */
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleNew = useCallback((): void => {
    setCurrentId(null);
    setTitle('未命名简历');
    setContent(DEFAULT_CONTENT);
  }, []);

  const handleLoad = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.ok) {
        const r: Resume = await res.json();
        setCurrentId(r.id);
        setTitle(r.title);
        setContent(r.content);
      }
    } catch {
      /* server offline */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    setSaving(true);
    try {
      if (currentId !== null) {
        await fetch(`${API_BASE}/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        if (res.ok) {
          const created: Resume = await res.json();
          setCurrentId(created.id);
        }
      }
      await fetchResumes();
      setShowSaved(true);
      setTimeout(() => {
        setShowSaved(false);
      }, 2000);
    } catch {
      /* server offline */
    } finally {
      setSaving(false);
    }
  }, [currentId, title, content, fetchResumes]);

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (currentId === id) {
          handleNew();
        }
        await fetchResumes();
      } catch {
        /* server offline */
      }
    },
    [currentId, handleNew, fetchResumes],
  );

  const handleExportPDF = useCallback(async (): Promise<void> => {
    if (!previewRef.current) {
      return;
    }
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = 210;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', [pageWidth, imgHeight]);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'SLOW');
      pdf.save(`${title}.pdf`);
      setExportOpen(false);
    } catch {
      console.error('PDF export failed');
    }
  }, [title]);

  const handleExportMD = useCallback((): void => {
    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch {
      console.error('Markdown export failed');
    }
  }, [title, content]);

  const formatDate = useCallback((d: string): string => {
    return new Date(d).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col bg-apple-bg overflow-hidden">
      {/* Header — liquid glass */}
      <header className="flex-shrink-0 bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-black/[0.04] px-5 sm:px-8 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-apple-secondary hover:text-apple-text hover:bg-black/[0.04] transition-all duration-300 lg:hidden"
            type="button"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link
            href="/"
            className="p-2 rounded-xl text-apple-secondary hover:text-apple-text hover:bg-black/[0.04] transition-all duration-300"
          >
            <Home size={18} />
          </Link>
          <span className="text-lg font-semibold tracking-tight text-apple-text hidden sm:block">
            ResumeForge
          </span>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-black/[0.02] border border-black/[0.06] text-apple-text px-5 py-2 rounded-full text-center font-semibold placeholder:text-apple-secondary/60 focus:border-apple-link/40 focus:outline-none focus:shadow-[0_0_0_4px_rgba(0,102,204,0.06)] transition-all duration-300 w-40 sm:w-56 text-sm"
          placeholder="简历标题"
        />

        <div className="flex items-center gap-2">
          {showSaved && (
            <span className="text-xs text-apple-link flex items-center gap-1 animate-fade-in font-medium">
              <Check size={14} /> 已保存
            </span>
          )}
          <button
            onClick={handleNew}
            className="text-sm text-apple-text hover:text-apple-link hover:bg-apple-link/[0.06] px-4 py-2 rounded-full font-medium transition-all duration-300 inline-flex items-center gap-1.5"
            type="button"
          >
            <Plus size={16} /> <span className="hidden sm:inline">新建</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-apple-link hover:bg-[#0077ED] text-white px-5 py-2 rounded-full text-sm font-medium shadow-none hover:shadow-lg hover:shadow-apple-link/20 transition-all duration-300 inline-flex items-center gap-1.5 disabled:opacity-60"
            type="button"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden sm:inline">保存</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="bg-apple-text hover:bg-black/80 text-white px-5 py-2 rounded-full text-sm font-medium shadow-none hover:shadow-lg hover:shadow-black/10 transition-all duration-300 inline-flex items-center gap-1.5"
              type="button"
            >
              <Download size={16} />
              <span className="hidden sm:inline">导出</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${exportOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 bg-white/90 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-glass overflow-hidden z-20 animate-fade-in py-1">
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-apple-text dropdown-item"
                    type="button"
                  >
                    <Download size={14} /> 导出 PDF
                  </button>
                  <button
                    onClick={handleExportMD}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-apple-text dropdown-item border-t border-black/[0.04]"
                    type="button"
                  >
                    <FileText size={14} /> 导出 Markdown
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar — liquid glass */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } absolute lg:relative z-20 w-72 flex-shrink-0 bg-white/50 backdrop-blur-2xl backdrop-saturate-150 h-full flex flex-col transition-transform duration-400 ease-out`}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm text-apple-text font-semibold mb-1">
              <FileText size={16} strokeWidth={1.5} /> 我的简历
            </div>
            <p className="text-xs text-apple-secondary">{resumes.length} 份简历</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {resumes.length === 0 ? (
              <div className="text-center text-apple-secondary text-sm py-16 px-4">
                <FileEdit size={36} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p>暂无保存的简历</p>
                <p className="text-xs mt-1">点击「新建」创建第一份简历</p>
              </div>
            ) : (
              resumes.map((r: Resume) => (
                <div
                  key={r.id}
                  onClick={() => {
                    handleLoad(r.id);
                    setSidebarOpen(false);
                  }}
                  className={`glass-sidebar-item group flex items-center justify-between ${
                    currentId === r.id ? 'active' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-apple-text truncate">{r.title}</div>
                    <div className="text-xs text-apple-secondary mt-0.5">{formatDate(r.updatedAt)}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/8 text-apple-secondary hover:text-red-500 transition-colors"
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-apple-secondary" />
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-10 bg-black/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content — two glass panels */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 gap-4 sm:gap-6">
          {/* Editor panel */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-apple-link" />
              <span className="text-xs text-apple-secondary font-medium uppercase tracking-wider">
                Markdown 编辑
              </span>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="markdown-editor"
                placeholder="在此编写 Markdown 简历..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview panel */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-apple-text" />
              <span className="text-xs text-apple-secondary font-medium uppercase tracking-wider">
                实时预览
              </span>
            </div>
            <div className="flex-1 overflow-y-auto rounded-[20px]">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-white/50 backdrop-blur-md rounded-[20px]">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-apple-link" strokeWidth={1.5} />
                    <p className="mt-3 text-apple-secondary text-sm">加载中...</p>
                  </div>
                </div>
              ) : (
                <div ref={previewRef} className="resume-preview" id="pdf-export-area">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkCustomEmoji, remarkContainers]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
