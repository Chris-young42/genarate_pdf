'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, FileText, Download, Palette, ArrowRight, ChevronDown } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Markdown 编辑',
    desc: '纯文本编写，专注内容创作。支持 GFM 语法、自定义 Emoji、双栏布局容器，所见即所得。',
    accent: 'group-hover:shadow-[0_0_60px_rgba(0,102,204,0.06)]',
  },
  {
    icon: Palette,
    title: '精美排版',
    desc: '精心调校的中文排版样式。字重、行高、间距反复打磨，导出的简历可直接投递。',
    accent: 'group-hover:shadow-[0_0_60px_rgba(139,92,246,0.06)]',
  },
  {
    icon: Download,
    title: '一键导出',
    desc: '支持导出为高质量 PDF 和 Markdown 文件。PDF 采用 300dpi 渲染，确保清晰锐利。',
    accent: 'group-hover:shadow-[0_0_60px_rgba(16,185,129,0.06)]',
  },
];

export default function LandingPage(): JSX.Element {
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [vh, setVh] = useState(900);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setScrollY(window.scrollY);
      setScrolled(window.scrollY > 20);
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  // ── Scroll phases (all relative to the tall book section) ──
  // Hero fades out:     0 → 0.35vh
  // Book slowly opens:  0.15vh → 1.5vh   (spans 1.35 viewports — dramatic)
  // Demo revealed:      0.45vh → 1.45vh
  // Book fully open:    1.5vh onwards

  const sectionH = vh * 2.5;
  const heroPhase   = Math.max(0, Math.min(1, scrollY / (vh * 0.35)));
  const bookOpen    = Math.max(0, Math.min(1, (scrollY - vh * 0.15) / (vh * 1.35)));
  const demoReveal  = Math.max(0, Math.min(1, (scrollY - vh * 0.45) / (vh * 1.0)));

  const heroOpacity  = 1 - heroPhase;
  const heroY        = heroPhase * 60;
  const leftAngle    = bookOpen * -78;
  const rightAngle   = bookOpen * 78;
  const coverOpacity = Math.max(0, 1 - bookOpen * 1.05);

  return (
    <div className="bg-apple-bg">
      {/* ── Navigation ── */}
      <nav
        className={`fixed w-full z-50 py-5 transition-all duration-500 ${
          scrolled
            ? 'bg-apple-bg/80 backdrop-blur-2xl backdrop-saturate-150 border-b border-black/[0.04]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <span className="text-lg font-semibold tracking-tight text-apple-text">ResumeForge</span>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm text-apple-secondary hover:text-apple-text transition-colors duration-300">
              功能
            </a>
            <Link href="/app" className="text-sm font-medium text-apple-link hover:text-[#0077ED] transition-colors duration-300">
              开始制作
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 1 — Hero + Book Opening (tall scroll section) */}
      <section className="relative" style={{ height: `${sectionH}px` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center">

          {/* ── Hero ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10 pointer-events-none"
            style={{
              opacity: heroOpacity > 0.02 ? heroOpacity : 0,
              transform: `translateY(${heroY}px)`,
            }}
          >
            <h1 className="text-[clamp(2.8rem,6.5vw,5rem)] font-semibold tracking-[-0.02em] leading-[1.08] text-apple-text">
              简历，
              <br />
              本该如此简单。
            </h1>
            <p className="text-xl md:text-2xl text-apple-secondary font-normal leading-relaxed max-w-lg mx-auto mt-6">
              用 Markdown 书写，实时预览。
              <br className="hidden sm:block" />
              一键导出为精美 PDF。
            </p>
            <div className="mt-10 pointer-events-auto">
              <Link
                href="/app"
                className="bg-apple-link hover:bg-[#0077ED] text-white px-8 py-3.5 rounded-full text-base font-medium shadow-none hover:shadow-lg hover:shadow-apple-link/20 transition-all duration-400 ease-out inline-flex items-center"
              >
                <Sparkles size={18} className="mr-2" />
                开始制作
              </Link>
            </div>
          </div>

          {/* ── Book container ── */}
          <div
            className="relative w-full max-w-5xl mx-auto px-4"
            style={{ opacity: bookOpen > 0.02 ? 1 : 0 }}
          >
            <div className="relative rounded-[28px] overflow-hidden shadow-glass bg-white">
              {/* Demo content behind covers */}
              <div
                className="flex flex-col lg:flex-row min-h-[320px] lg:min-h-[380px]"
                style={{
                  opacity: demoReveal,
                  transition: 'opacity 0.6s ease-out',
                }}
              >
                {/* Left: Editor mockup */}
                <div className="flex-1 bg-[#FAFAFA] p-5 lg:p-8 border-b lg:border-b-0 lg:border-r border-black/[0.04]">
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    <span className="text-[11px] text-apple-secondary ml-2 font-mono">untitled.md</span>
                  </div>
                  <div className="font-mono text-xs leading-relaxed text-apple-text/70">
                    <div className="text-apple-text font-semibold text-base mb-2"># 张三 👨‍💻</div>
                    <div>📧 zhangsan@email.com  |  📱 138-0000-0000</div>
                    <div className="mt-4 pt-3 border-t border-black/[0.04]" />
                    <div className="text-apple-text font-semibold text-sm mt-3 mb-1">## 👤 个人简介</div>
                    <div>资深全栈工程师，5 年前端开发经验。</div>
                    <div>擅长 **React、TypeScript、Node.js**。</div>
                    <div className="mt-4 pt-3 border-t border-black/[0.04]" />
                    <div className="text-apple-text font-semibold text-sm mt-3 mb-1">## 💼 工作经历</div>
                    <div className="text-apple-text font-medium text-xs mt-2">### 高级前端工程师 | ABC 科技</div>
                    <div className="text-apple-secondary italic">*2023.06 - 至今*</div>
                    <div>- ✅ 核心业务架构设计与开发</div>
                    <div>- ✅ 首屏加载时间降低 40%</div>
                    <div>- ✅ 搭建组件库，效率提升 30%</div>
                    <div className="mt-4 pt-3 border-t border-black/[0.04]" />
                    <div className="text-apple-text font-semibold text-sm mt-3 mb-1">## 🛠 技能</div>
                    <div className="flex flex-wrap gap-1">
                      {['JavaScript','TypeScript','React','Next.js','Node.js'].map(s => (
                        <code key={s} className="bg-black/[0.04] px-1.5 py-0.5 rounded text-[11px]">{s}</code>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Preview mockup */}
                <div className="flex-1 bg-white p-5 lg:p-8 flex items-center">
                  <div className="w-full">
                    <h1 className="text-[28px] font-semibold tracking-tight text-apple-text mb-1">张三</h1>
                    <p className="text-xs text-apple-secondary mb-5">zhangsan@email.com  ·  138-0000-0000</p>
                    <div className="border-t border-black/[0.08] pt-5">
                      <h2 className="text-[15px] font-semibold text-apple-text mb-2 pb-1.5 border-b border-black/[0.06]">个人简介</h2>
                      <p className="text-[13px] text-[#3C3C43] leading-relaxed mb-5">
                        资深全栈工程师，5 年前端开发经验。擅长 <strong className="text-apple-text">React、TypeScript、Node.js</strong>，对用户体验和性能优化有深入理解。
                      </p>
                      <h2 className="text-[15px] font-semibold text-apple-text mb-2 pb-1.5 border-b border-black/[0.06]">工作经历</h2>
                      <h3 className="text-[13px] font-semibold text-apple-text">高级前端工程师</h3>
                      <p className="text-[11px] text-apple-secondary italic mb-1.5">ABC 科技公司 · 2023.06 - 至今</p>
                      <ul className="text-[13px] text-[#3C3C43] space-y-0.5 pl-3 list-disc list-outside ml-1.5">
                        <li>负责核心业务模块的架构设计与开发</li>
                        <li>主导前端性能优化，首屏加载时间降低 40%</li>
                        <li>搭建组件库，提升团队开发效率 30%</li>
                      </ul>
                      <h2 className="text-[15px] font-semibold text-apple-text mt-5 mb-2 pb-1.5 border-b border-black/[0.06]">技能</h2>
                      <div className="flex flex-wrap gap-1.5">
                        {['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Git', 'Docker'].map(s => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-black/[0.03] text-apple-text">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spine */}
              <div
                className="absolute top-0 bottom-0 left-1/2 w-px bg-black/[0.06] z-20 pointer-events-none"
                style={{ opacity: coverOpacity }}
              />

              {/* Left cover */}
              <div
                className="absolute top-0 left-0 w-1/2 h-full z-30 rounded-l-[28px]"
                style={{
                  transform: `perspective(1200px) rotateY(${leftAngle}deg)`,
                  transformOrigin: 'right center',
                  opacity: coverOpacity > 0.01 ? coverOpacity : 0,
                  boxShadow: leftAngle < -10 ? '6px 0 40px rgba(0,0,0,0.1)' : 'none',
                  overflow: 'hidden',
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-[#F9F9FB] via-white to-[#F5F5F7] flex items-center justify-center border-r border-black/[0.04]">
                  <div className="text-center px-6">
                    <Sparkles size={28} className="mx-auto mb-4 text-apple-link" strokeWidth={1.5} />
                    <p className="text-lg font-semibold text-apple-text">ResumeForge</p>
                    <p className="text-sm text-apple-secondary mt-1">Markdown 简历编辑器</p>
                  </div>
                </div>
              </div>

              {/* Right cover */}
              <div
                className="absolute top-0 right-0 w-1/2 h-full z-30 rounded-r-[28px]"
                style={{
                  transform: `perspective(1200px) rotateY(${rightAngle}deg)`,
                  transformOrigin: 'left center',
                  opacity: coverOpacity > 0.01 ? coverOpacity : 0,
                  boxShadow: rightAngle > 10 ? '-6px 0 40px rgba(0,0,0,0.1)' : 'none',
                  overflow: 'hidden',
                }}
              >
                <div className="w-full h-full bg-gradient-to-bl from-[#F9F9FB] via-white to-[#F5F5F7] flex items-center justify-center border-l border-black/[0.04]">
                  <div className="text-center px-6">
                    <FileText size={28} className="mx-auto mb-4 text-apple-text" strokeWidth={1.5} />
                    <p className="text-lg font-semibold text-apple-text">所见即所得</p>
                    <p className="text-sm text-apple-secondary mt-1">实时预览 · 一键导出 PDF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Scroll hint ── */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
            style={{ opacity: Math.max(0, 1 - heroPhase * 4) }}
          >
            <span className="text-xs text-apple-secondary tracking-wide">向下滚动探索</span>
            <ChevronDown size={16} className="text-apple-secondary animate-bounce" />
          </div>
        </div>
      </section>

      {/* SECTION 2 — Feature Cards */}
      <section id="features" className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4 tracking-tight text-apple-text">
          让简历回归本质
        </h2>
        <p className="text-center text-apple-secondary mb-14 max-w-md mx-auto">
          每一个细节都经过精心打磨
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className={`group relative bg-white rounded-3xl p-8 shadow-glass-sm hover:shadow-glass-hover hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center text-center cursor-default ${accent}`}
            >
              {/* Soft gradient glow behind icon on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-apple-link/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-apple-bg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <Icon
                    size={26}
                    className="text-apple-link transition-colors duration-500"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2.5 text-apple-text group-hover:text-apple-link transition-colors duration-500">
                  {title}
                </h3>
                <p className="text-sm text-apple-secondary leading-relaxed">{desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-apple-link opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] mt-5">
                  了解更多 <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/app"
            className="bg-apple-text hover:bg-black/85 text-white px-10 py-4 rounded-full text-base font-medium shadow-none hover:shadow-2xl hover:shadow-black/[0.08] transition-all duration-500 ease-out inline-flex items-center gap-2.5"
          >
            <Sparkles size={20} />
            开始制作你的简历
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/[0.04] py-8">
        <p className="text-center text-sm text-apple-secondary">
          ResumeForge — 用最简单的方式，做最好的简历
        </p>
      </footer>
    </div>
  );
}
