// For production use in Next.js App Router, this directive is essential.
// 生产环境代码要求: 这是Next.js App Router必需的指令，因为它表明该组件依赖于客户端浏览器API。
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Markdown 内容 ---
// The content for the article section.
// 文章板块的内容。
const articleContent = `
# 为什么选择新加坡留学？
新加坡以其卓越的教育体系、安全的社会环境和多元的文化氛围，成为全球最受欢迎的留学目的地之一。这里的教育融合了东西方文化的精华，为学生提供了独特的学习体验和广阔的国际视野。
## 一、世界一流的教育质量
新加坡的公立大学，如新加坡国立大学（NUS）和南洋理工大学（NTU），常年位居世界大学排名前列。其教育体系注重培养学生的创新思维和解决问题的能力。
![新加坡城市风光](https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop)

## 二、灵活的升学路径
新加坡为不同学术背景的学生提供了多样化的升学路径。无论是通过“O”水准、“A”水准考试，还是国际文凭（IB）课程，学生都可以找到适合自己的方式进入理想的大学或理工学院。
## 三、独特的双语环境
新加坡实行双语教育政策，英语是官方教学和工作语言，而华语也在这里广泛使用。这种环境不仅能让学生快速提升英语水平，还能保留和发扬母语文化。
## 四、安全与稳定的生活
新加坡是全球犯罪率最低的国家之一，拥有稳定、廉洁的政府和完善的法律体系。学生在这里可以安心学习和生活。
### 观看视频：感受新加坡的魅力
@[新加坡城市宣传片](https://www.w3schools.com/html/mov_bbb.mp4)
## 五、毕业后的发展机会
新加坡政府为吸引国际人才，推出了友好的就业和移民政策。许多毕业生选择留在新加坡工作，得益于其繁荣的经济和大量的就业机会。从金融、科技到生物医药，各个行业都为毕业生提供了广阔的平台。
`;

// --- Article Rendering Component (Responsive) ---
// This component parses and displays the markdown-like content.
// 文章渲染组件 (已做响应式优化)。
interface ArticleDisplayProps {
  content: string;
}

function ArticleDisplay({ content }: ArticleDisplayProps) {
    const lines = content.trim().split('\n');

    return (
        <div className="max-w-4xl mx-auto text-left py-12 px-4 sm:px-6 lg:px-8 mt-8">
            {lines.map((line, index) => {
                // UPDATE: Set all heading text colors to black.
                // 更新：将所有标题颜色设置为黑色。
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="font-bold text-black text-3xl sm:text-4xl mt-8 mb-6 border-b border-neutral-300 pb-4">{line.substring(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="font-semibold text-black text-2xl sm:text-3xl mt-10 mb-4">{line.substring(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="font-semibold text-black text-xl sm:text-2xl mt-8 mb-4">{line.substring(4)}</h3>;
                }
                const imgMatch = line.match(/^!\[(.*)\]\((.*)\)/);
                if (imgMatch) {
                    return (
                        <div key={index} className="my-8">
                            <img src={imgMatch[2]} alt={imgMatch[1]} className="rounded-lg shadow-lg w-full h-auto" />
                        </div>
                    );
                }
                const videoMatch = line.match(/^@\[(.*)\]\((.*)\)/);
                if (videoMatch) {
                    return (
                         <div key={index} className="my-8">
                            <video controls playsInline preload="auto" src={videoMatch[2]} title={videoMatch[1]} className="rounded-lg shadow-lg w-full h-auto" />
                        </div>
                    );
                }
                // UPDATE: Set caption text to a darker gray.
                // 更新：将图片/视频说明文字设置为更深的灰色。
                if (line.startsWith('*') && line.endsWith('*')) {
                     return <p key={index} className="text-center text-sm text-neutral-700 italic mt-[-1rem] mb-6">{line.substring(1, line.length - 1)}</p>
                }
                // UPDATE: Set paragraph text to black.
                // 更新：将段落文字颜色设置为黑色。
                if (line.trim() !== '') {
                    return <p key={index} className="leading-relaxed text-black text-base sm:text-lg">{line}</p>;
                }
                return null;
            })}
        </div>
    );
}


// --- Animated Background Component ---
// This component generates the floating SVG path animations.
// 动态背景SVG动画组件。
interface FloatingPathsProps {
  position: number;
}

function FloatingPaths({ position }: FloatingPathsProps) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
            } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
            } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
            } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <svg
                // UPDATE: Set animated path color to a darker gray.
                // 更新：将动画线条的颜色设置为更深的灰色。
                className="w-full h-full text-gray-400"
                viewBox="0 0 696 316"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.4 + path.id * 0.02}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.1, 0.4, 0.1],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

// --- Main Page Component (Core Layout) ---
// This component orchestrates the entire page layout.
// 核心页面布局组件。
interface BackgroundPathsProps {
  title: string;
  subtitle: string;
}

function BackgroundPaths({ title, subtitle }: BackgroundPathsProps) {
    const words = title.split(" ");

    return (
        <div className="relative w-full h-screen bg-white">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
            
            <div className="absolute inset-0 z-10 overflow-y-auto">
                <div className="container mx-auto px-4 text-center py-16 sm:py-20 md:py-24 lg:py-32">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-4 tracking-tighter">
                            {words.map((word, wordIndex) => (
                                <span key={wordIndex} className="inline-block mr-2 sm:mr-4 last:mr-0">
                                    {word.split("").map((letter, letterIndex) => (
                                        <motion.span
                                            key={`${wordIndex}-${letterIndex}`}
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{
                                                delay: wordIndex * 0.1 + letterIndex * 0.03,
                                                type: "spring",
                                                stiffness: 150,
                                                damping: 25,
                                            }}
                                            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700"
                                        >
                                            {letter}
                                        </motion.span>
                                    ))}
                                </span>
                            ))}
                        </h1>
                        <motion.p
                            className="text-base sm:text-lg md:text-xl text-neutral-800 max-w-2xl mx-auto"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                        >
                            {subtitle}
                        </motion.p>
                    </motion.div>
                    
                    <ArticleDisplay content={articleContent} />
                </div>
            </div>
        </div>
    );
}

// --- Final Page Export for Next.js ---
// Production-ready code requirement: In Next.js App Router, the default export for a page.tsx file must be the page component itself.
// 生产环境代码要求: 在Next.js App Router中，`page.tsx`的默认导出必须是页面组件本身。
export default function Home() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    if (!isClient) {
        return null;
    }
    
    return <BackgroundPaths title="新加坡留学政策" subtitle="快来新加坡留学" />;
}
