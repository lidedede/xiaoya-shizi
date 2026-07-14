"use client";

import { useEffect, useMemo, useState } from "react";
import { lessons as lessonData } from "./lessons";

const palette = ["#ff9f43", "#817bd6", "#62a76b", "#3da5d9", "#eb6652", "#82a44f", "#e47f99", "#d45f6b"];
const lessons = lessonData.map((lesson, index) => ({ ...lesson, color: palette[index % palette.length] }));

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
    const choices = [quizChar, ...others.map((x) => x.char)];
    const offset = index % choices.length;
    return [...choices.slice(offset), ...choices.slice(0, offset)];
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
              <div className="next-row"><span>第 {index + 1} 个，共 {lessons.length} 个字</span><button onClick={() => setIndex((index + 1) % lessons.length)}>下一个字 →</button></div>
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
