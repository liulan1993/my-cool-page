// For production use in Next.js App Router, this directive is essential.
// 生产环境代码要求: 这是Next.js App Router必需的指令，因为它表明该组件依赖于客户端浏览器API。
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 辅助工具函数 (为AI客服组件添加) ---
const cn = (...classes: (string | boolean | undefined | null)[]) => {
    return classes.filter(Boolean).join(' ');
};


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
function ArticleDisplay({ content }: { content: string }) {
    const lines = content.trim().split('\n');

    return (
        <div className="max-w-4xl mx-auto text-left py-12 px-4 sm:px-6 lg:px-8 mt-8">
            {lines.map((line, index) => {
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
                if (line.startsWith('*') && line.endsWith('*')) {
                     return <p key={index} className="text-center text-sm text-neutral-700 italic mt-[-1rem] mb-6">{line.substring(1, line.length - 1)}</p>
                }
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
function FloatingPaths({ position }: { position: number }) {
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
function BackgroundPaths({ title, subtitle }: { title: string, subtitle: string }) {
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

// --- Particle Type Definition ---
// 为粒子动画效果定义一个明确的类型接口
interface Particle {
  x: number;
  y: number;
  r: number;
  color: string;
}

// --- AI 客服组件 ---
const PlaceholdersAndVanishInput = ({
  placeholders,
  onSubmit,
  value,
  setValue,
}: {
  placeholders: string[];
  onSubmit: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
}) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const newDataRef = useRef<Particle[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length]);

  useEffect(() => {
    startAnimation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAnimation]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inputRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData = [];

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (pixelData[e] !== 0 && pixelData[e+1] !== 0 && pixelData[e+2] !== 0) {
          newData.push({ x: n, y: t, color: [pixelData[e], pixelData[e+1], pixelData[e+2], pixelData[e+3]] });
        }
      }
    }
    newDataRef.current = newData.map(({ x, y, color }) => ({ x, y, r: 1, color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`}));
  }, [value]);

  useEffect(() => { draw(); }, [value, draw]);
  
  const animate = (start: number) => {
    const animateFrame = (pos = 0) => {
      requestAnimationFrame(() => {
        const newArr: Particle[] = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) { current.r = 0; continue; }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t;
            if (n > pos) {
              ctx.beginPath(); ctx.rect(n, i, s, s); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };
  
  const vanishAndSubmit = () => {
    if (!inputRef.current) return;
    setAnimating(true);
    draw();
    const currentValue = inputRef.current.value;
    if (currentValue) {
      const maxX = newDataRef.current.reduce((prev, current) => (current.x > prev ? current.x : prev), 0);
      animate(maxX);
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value || animating) return;
    vanishAndSubmit();
    onSubmit(value);
  };

  return (
    <form
      className={cn( "w-full relative max-w-xl mx-auto bg-white dark:bg-zinc-800 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200", value && "bg-gray-50 dark:bg-zinc-900" )}
      onSubmit={handleSubmit}
    >
      <canvas className={cn( "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20", !animating ? "opacity-0" : "opacity-100" )} ref={canvasRef} />
      <input
        onChange={(e) => { if (!animating) { setValue(e.target.value); } }}
        ref={inputRef} value={value} type="text"
        className={cn( "w-full relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20", animating && "text-transparent dark:text-transparent" )}
        placeholder=""
      />
      <button disabled={!value || animating} type="submit" className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center">
        <motion.svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 h-4 w-4">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path d="M5 12l14 0" initial={{ strokeDasharray: "50%", strokeDashoffset: "50%" }} animate={{ strokeDashoffset: value ? 0 : "50%" }} transition={{ duration: 0.3, ease: "linear" }} />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && !animating && (
            <motion.p initial={{ y: 5, opacity: 0 }} key={`current-placeholder-${currentPlaceholder}`} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} transition={{ duration: 0.3, ease: "linear" }} className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate" >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};


// --- 主悬浮AI客服窗口组件 ---
const FloatingAIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string; text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
        const filesToFetch = [
            '公司资料.txt', '业务资料.txt', '人员资料.txt', '人工客服的说明书.txt'
        ];
        let combinedText = "";
        try {
            const responses = await Promise.all(
                filesToFetch.map(file => fetch(`/${encodeURIComponent(file)}`))
            );
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(`加载文件失败: ${response.url} - ${response.statusText}`);
                }
            }
            const texts = await Promise.all(responses.map(res => res.text()));
            texts.forEach((text, index) => {
                combinedText += `文件: ${filesToFetch[index]}\n内容:\n${text}\n\n---\n\n`;
            });
            setKnowledgeBase(combinedText);
        } catch (error) {
            console.error("加载知识库时发生错误:", error);
            setKnowledgeBase("抱歉，知识库加载失败。请确保所有必需的 .txt 文件都位于您项目的 public 文件夹中。");
        }
    };
    fetchKnowledgeBase();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const placeholders = [ "我们的总部在哪里?", "CTO是谁?", "平台支持哪些服务?", "无法解答问题时怎么办?" ];

  const handleSubmit = async (userInput: string) => {
    if (!userInput.trim() || !knowledgeBase) return;

    const newMessagesForUI = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessagesForUI);
    setIsLoading(true);

    const systemPrompt = `您是“Apex AI客服”，一个友好且乐于助人的人工智能。您的任务是严格根据以下提供的【内部资料】来回答用户的问题。请不要编造资料中不存在的信息。如果问题的答案在资料中找不到，请使用“人工客服的说明书.txt”里指定的标准回复。

    【内部资料】:
    ---
    ${knowledgeBase}
    ---
    `;
    
    // FIX: Limit the conversation history to the last 4 messages to prevent oversized payloads.
    // 修复：将对话历史限制为最近的4条消息，以防止请求体过大。
    const recentMessages = newMessagesForUI.slice(-5, -1); // Get up to 4 recent messages, excluding the latest user input

    const apiMessages = [
        { role: 'system', content: systemPrompt },
        // Map the recent history for the API call
        ...recentMessages.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text
        })),
        // Add the current user's message
        { role: 'user', content: userInput }
    ];

    const payload = {
      model: "gemini-2.5-flash-preview-05-20",
      messages: apiMessages,
    };
    
    const apiKey = "AIzaSyCEPLmEGSUyPKO0hcaAgBDLLwxWTnq_qXQ"; 
    const proxyUrl = "https://aesthetic-gaufre-7cdff5.netlify.app/v1/chat/completions";

    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` 
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("代理服务器返回错误:", errorData);
            throw new Error(`API error from proxy: ${response.statusText}`);
        }

        const result = await response.json();
        let aiResponse = "抱歉，我遇到了一些问题，请稍后再试。";
        if (result.choices && result.choices[0]?.message?.content) {
           aiResponse = result.choices[0].message.content;
        }
        setMessages([...newMessagesForUI, { role: 'model', text: aiResponse }]);
    } catch (error) {
        console.error("API调用失败:", error);
        setMessages([...newMessagesForUI, { role: 'model', text: "抱歉，连接服务失败，请检查您的网络或联系技术支持。" }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
      <div className="fixed top-4 right-4 z-[999]" ref={widgetRef}>
        <motion.div
          layout
          animate={{
            width: isOpen ? "24rem" : "auto",
            height: isOpen ? "32rem" : "auto",
            borderRadius: isOpen ? 16 : 9999,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-zinc-900 shadow-xl flex flex-col overflow-hidden"
        >
          <motion.div
            layout
            className="p-3 flex justify-between items-center cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center space-x-2">
              <motion.div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </motion.div>
              <h2 className="text-white font-bold text-base">{isOpen ? "Apex AI客服" : "AI客服"}</h2>
            </div>
            {isOpen && (
              <motion.div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: '100%' }} 
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col h-full overflow-hidden"
              >
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3 py-2 rounded-lg max-w-xs text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-200'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-3 py-2 rounded-lg bg-zinc-700 text-zinc-200">
                           <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                           </div>
                        </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-zinc-700">
                   <PlaceholdersAndVanishInput
                      placeholders={placeholders}
                      onSubmit={handleSubmit}
                      value={inputValue}
                      setValue={setInputValue}
                    />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
    
    return (
        <>
            <BackgroundPaths title="新加坡留学政策" subtitle="快来新加坡留学" />
            <FloatingAIChatWidget />
        </>
    );
}
