"use client";

import { useEffect, useMemo, useState } from "react";

const lessons = [
  { char: "日", pinyin: "rì", icon: "☀️", color: "#ffb547", title: "太阳的样子", hint: "古人把太阳画成圆圆的，后来就变成了“日”。", sentence: "红红的太阳出来了。" },
  { char: "月", pinyin: "yuè", icon: "🌙", color: "#8e8cdb", title: "弯弯的月亮", hint: "看，弯弯的月亮挂在夜空中。", sentence: "月亮像一条小船。" },
  { char: "山", pinyin: "shān", icon: "⛰️", color: "#66a96c", title: "高高的山峰", hint: "中间高、两边低，像三座连在一起的山峰。", sentence: "我们一起去爬山。" },
  { char: "水", pinyin: "shuǐ", icon: "💧", color: "#4ca9dc", title: "流动的小河", hint: "中间是水流，两边像溅起的小水花。", sentence: "小鱼在水里游。" },
  { char: "火", pinyin: "huǒ", icon: "🔥", color: "#ef745a", title: "跳舞的火苗", hint: "一团火焰，正在轻轻地跳舞。小朋友不要靠近火哦。", sentence: "火苗亮亮的。" },
  { char: "木", pinyin: "mù", icon: "🌳", color: "#8caa52", title: "一棵大树", hint: "一横是树枝，一竖是树干，下面是树根。", sentence: "小鸟站在木头上。" },
  { char: "人", pinyin: "rén", icon: "🧒", color: "#e98a9e", title: "走路的人", hint: "一撇一捺，像一个人迈开双腿向前走。", sentence: "我是一个快乐的人。" },
  { char: "口", pinyin: "kǒu", icon: "👄", color: "#dc6d78", title: "方方的小嘴巴", hint: "张开小嘴巴，就像一个方方的口。", sentence: "我用口来说话。" },
];

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.78;
  utterance.pitch = 1.08;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((v) => v.lang === "zh-CN") || voices.find((v) => v.lang.startsWith("zh")) || null;
  window.speechSynthesis.speak(utterance);
}

export default function Home() {
  const [index, setIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [quizChar, setQuizChar] = useState("山");
  const [result, setResult] = useState("");
  const current = lessons[index];
  const options = useMemo(() => {
    const others = lessons.filter((x) => x.char !== quizChar).slice(index % 5, index % 5 + 2);
    return [quizChar, ...others.map((x) => x.char)].sort(() => 0.5 - Math.random());
  }, [quizChar, index]);

  useEffect(() => { window.speechSynthesis?.getVoices(); }, []);

  const answer = (char: string) => {
    if (result) return;
    if (char === quizChar) {
      setResult("答对啦！你真棒！"); setStars((s) => s + 1); speak("答对啦，你真棒");
    } else { setResult("再想一想，你可以的！"); speak("再想一想"); }
  };

  const nextQuiz = () => {
    const next = lessons[(lessons.findIndex((x) => x.char === quizChar) + 1) % lessons.length];
    setQuizChar(next.char); setIndex((i) => (i + 1) % lessons.length); setResult("");
    setTimeout(() => speak(`请找到，${next.char}`), 100);
  };

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setMode("learn")} aria-label="回到识字乐园"><span>🌱</span> 小芽识字</button>
        <div className="stars" aria-label={`获得${stars}颗星`}>⭐ <b>{stars}</b></div>
      </header>

      <section className="welcome">
        <div><p className="eyebrow">每天认识一个字</p><h1>宝宝，今天想认识谁？</h1><p>点一点、听一听，汉字也会讲故事。</p></div>
        <div className="cloud cloud-one"/><div className="cloud cloud-two"/>
      </section>

      <nav className="tabs" aria-label="学习模式">
        <button className={mode === "learn" ? "active" : ""} onClick={() => setMode("learn")}>📖 认识汉字</button>
        <button className={mode === "quiz" ? "active" : ""} onClick={() => { setMode("quiz"); setResult(""); setTimeout(() => speak(`请找到，${quizChar}`), 100); }}>🎈 找字游戏</button>
      </nav>

      {mode === "learn" ? (
        <section className="learning-area">
          <aside className="character-list" aria-label="汉字列表">
            {lessons.map((item, i) => <button key={item.char} className={i === index ? "selected" : ""} onClick={() => setIndex(i)} style={{"--item-color": item.color} as React.CSSProperties}><span>{item.icon}</span><b>{item.char}</b></button>)}
          </aside>
          <article className="lesson-card" style={{"--accent": current.color} as React.CSSProperties}>
            <div className="picture-side"><div className="sun-rays"/><button className="big-picture" onClick={() => speak(current.char)} aria-label={`听${current.char}的读音`}>{current.icon}</button><p>点点图片，听一听</p></div>
            <div className="word-side">
              <div className="character-row"><div className="big-char">{current.char}</div><div><div className="pinyin">{current.pinyin}</div><button className="sound" onClick={() => speak(current.char)}>🔊 听读音</button></div></div>
              <h2>{current.title}</h2><p className="explanation">{current.hint}</p>
              <button className="sentence" onClick={() => speak(current.sentence)}><span>💬</span><span><small>听听这个句子</small><b>{current.sentence}</b></span><i>🔊</i></button>
              <div className="next-row"><span>今天已经认识 {index + 1} 个字啦</span><button onClick={() => setIndex((index + 1) % lessons.length)}>下一个字 →</button></div>
            </div>
          </article>
        </section>
      ) : (
        <section className="quiz-card">
          <div className="mascot">🐰</div><p className="eyebrow">小耳朵认真听</p><h2>请找到「{lessons.find(x => x.char === quizChar)?.pinyin}」</h2>
          <button className="replay" onClick={() => speak(`请找到，${quizChar}`)}>🔊 再听一次</button>
          <div className="answers">{options.map((char) => <button key={char} onClick={() => answer(char)}>{char}</button>)}</div>
          {result && <div className={result.startsWith("答对") ? "feedback good" : "feedback"}>{result}<button onClick={nextQuiz}>{result.startsWith("答对") ? "下一题 →" : "再试一次"}</button></div>}
        </section>
      )}
      <footer>给小小探索家的一份识字礼物 · 建议每天玩 10 分钟</footer>
    </main>
  );
}
