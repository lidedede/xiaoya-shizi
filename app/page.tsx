"use client";

import { useEffect, useMemo, useState } from "react";
import { englishLessons } from "./english-lessons";
import { lessons as hanziLessons } from "./lessons";

type Language = "hanzi" | "english";
const palette = ["#ff9f43", "#817bd6", "#62a76b", "#3da5d9", "#eb6652", "#82a44f", "#e47f99", "#d45f6b"];

function speak(text: string, language: Language) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "english" ? "en-US" : "zh-CN";
  utterance.rate = language === "english" ? 0.68 : 0.78;
  utterance.pitch = 1.08;
  const prefix = language === "english" ? "en" : "zh";
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang === utterance.lang) || voices.find((voice) => voice.lang.startsWith(prefix)) || null;
  window.speechSynthesis.speak(utterance);
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("hanzi");
  const [index, setIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [quizChar, setQuizChar] = useState("日");
  const [result, setResult] = useState("");
  const sourceLessons = language === "hanzi" ? hanziLessons : englishLessons;
  const lessons = useMemo(() => sourceLessons.map((lesson, lessonIndex) => ({ ...lesson, color: palette[lessonIndex % palette.length] })), [sourceLessons]);
  const current = lessons[index];
  const options = useMemo(() => {
    const others = lessons.filter((item) => item.char !== quizChar).slice(index % 5, index % 5 + 2);
    const choices = [quizChar, ...others.map((item) => item.char)];
    const offset = index % choices.length;
    return [...choices.slice(offset), ...choices.slice(0, offset)];
  }, [quizChar, index, lessons]);

  useEffect(() => { window.speechSynthesis?.getVoices(); }, []);

  const switchLanguage = (nextLanguage: Language) => {
    const first = nextLanguage === "hanzi" ? hanziLessons[0] : englishLessons[0];
    setLanguage(nextLanguage); setIndex(0); setQuizChar(first.char); setResult(""); setMode("learn");
  };

  const answer = (choice: string) => {
    if (result) return;
    if (choice === quizChar) {
      setResult("答对啦！你真棒！"); setStars((value) => value + 1); speak(language === "english" ? "Great job!" : "答对啦，你真棒", language);
    } else {
      setResult("再想一想，你可以的！"); speak(language === "english" ? "Try again" : "再想一想", language);
    }
  };

  const nextQuiz = () => {
    const next = lessons[(lessons.findIndex((item) => item.char === quizChar) + 1) % lessons.length];
    setQuizChar(next.char); setIndex((value) => (value + 1) % lessons.length); setResult("");
    setTimeout(() => speak(next.char, language), 100);
  };

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setMode("learn")} aria-label="回到学习乐园"><span>🌱</span> 小芽启蒙</button>
        <div className="stars" aria-label={`获得${stars}颗星`}>⭐ <b>{stars}</b></div>
      </header>

      <section className="welcome">
        <div><p className="eyebrow">每天学一点点</p><h1>宝宝，今天想认识谁？</h1><p>点一点、听一听，汉字和英语都会讲故事。</p></div>
        <div className="cloud cloud-one"/><div className="cloud cloud-two"/>
      </section>

      <nav className="language-tabs" aria-label="学习语言">
        <button className={language === "hanzi" ? "active" : ""} onClick={() => switchLanguage("hanzi")}>🀄 汉字乐园</button>
        <button className={language === "english" ? "active" : ""} onClick={() => switchLanguage("english")}>🔤 英语单词</button>
      </nav>
      <nav className="tabs" aria-label="学习模式">
        <button className={mode === "learn" ? "active" : ""} onClick={() => setMode("learn")}>📖 {language === "hanzi" ? "认识汉字" : "认识单词"}</button>
        <button className={mode === "quiz" ? "active" : ""} onClick={() => { setMode("quiz"); setResult(""); setTimeout(() => speak(quizChar, language), 100); }}>🎈 {language === "hanzi" ? "找字游戏" : "找词游戏"}</button>
      </nav>

      {mode === "learn" ? (
        <section className="learning-area">
          <aside className="character-list" aria-label={language === "hanzi" ? "汉字列表" : "英语单词列表"}>
            {lessons.map((item, itemIndex) => <button key={item.char} className={itemIndex === index ? "selected" : ""} onClick={() => setIndex(itemIndex)} style={{"--item-color": item.color} as React.CSSProperties}><span>{item.icon}</span><b>{item.char}</b></button>)}
          </aside>
          <article className="lesson-card" style={{"--accent": current.color} as React.CSSProperties}>
            <div className="picture-side"><button className="big-picture" onClick={() => speak(current.char, language)} aria-label={`听${current.char}的读音`}>{current.icon}</button><p>点点图片，听一听</p></div>
            <div className="word-side">
              <div className={`character-row ${language === "english" ? "english-row" : ""}`}><div className={`big-char ${language === "english" ? "english-word" : ""}`}>{current.char}</div><div><div className="pinyin">{current.pinyin}</div><button className="sound" onClick={() => speak(current.char, language)}>🔊 听读音</button></div></div>
              <h2>{current.title}</h2><p className="explanation">{current.hint}</p>
              <button className="sentence" onClick={() => speak(current.sentence, language)}><span>💬</span><span><small>听听这个句子</small><b>{current.sentence}</b></span><i>🔊</i></button>
              <div className="next-row"><span>第 {index + 1} 个，共 {lessons.length} 个{language === "hanzi" ? "字" : "单词"}</span><button onClick={() => setIndex((index + 1) % lessons.length)}>下一个 →</button></div>
            </div>
          </article>
        </section>
      ) : (
        <section className={`quiz-card ${language === "english" ? "english-quiz" : ""}`}>
          <div className="mascot">🐰</div><p className="eyebrow">小耳朵认真听</p><h2>{language === "hanzi" ? `请找到「${lessons.find((item) => item.char === quizChar)?.pinyin}」` : "请找到听到的单词"}</h2>
          <button className="replay" onClick={() => speak(quizChar, language)}>🔊 再听一次</button>
          <div className="answers">{options.map((choice) => <button key={choice} onClick={() => answer(choice)}>{choice}</button>)}</div>
          {result && <div className={result.startsWith("答对") ? "feedback good" : "feedback"}>{result}<button onClick={result.startsWith("答对") ? nextQuiz : () => setResult("")}>{result.startsWith("答对") ? "下一题 →" : "再试一次"}</button></div>}
        </section>
      )}
      <footer>给小小探索家的一份启蒙礼物 · 建议每天玩 10 分钟</footer>
    </main>
  );
}
