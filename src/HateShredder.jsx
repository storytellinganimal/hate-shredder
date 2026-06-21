import { useState, useMemo } from "react";
import senecaImg from "./seneca-1.png";

const STRIP_COUNT = 16;
const REVEAL_MS = 1900;
const REVEAL_MS_REDUCED = 450;

const LANGS = [
  { id: "en", label: "EN", name: "English" },
  { id: "es", label: "ES", name: "Spanish" },
  { id: "de", label: "DE", name: "German" },
];

const WRAPPER =
  "You are the language core of the Hate Shredder, a tool that helps people say hard things " +
  "in a way that can actually be heard. The user gives you a message written in anger or a bad " +
  "tone. You return a version that keeps their real point but drops what guarantees it will be " +
  "ignored. Work from these principles:\n" +
  "- The aim is to be understood and to keep the relationship intact, not to vent or to win. " +
  "Venting feels good and changes nothing.\n" +
  "- People react with intuition first and justify with reason after. A message that attacks " +
  "someone's character or their sense of being right triggers defensiveness and ends the " +
  "conversation. Lower the other person's guard before making the point.\n" +
  "- Separate what happened from the judgment of it. State the observable thing, the effect it " +
  "had, and what is actually wanted.\n" +
  "- Drop contempt, blame, and sarcasm, but keep the spine. Removing hostility is not removing " +
  "firmness; the rewrite must still ask for what the original asked for.\n" +
  "- Never invent facts, feelings, or concessions the sender did not express. Change how the " +
  "message is carried, not what it means.\n\n" +
  "Approach for this rewrite:\n";

const INSTRUCTIONS = {
  direct:
    "Rewrite the message below so it keeps its point but sheds the retaliatory heat. Separate " +
    "observation from evaluation. Name the concrete effect and the concrete request instead of a " +
    "verdict on the other person's character. Stay direct and firm; cut contempt, blame, and " +
    "sarcasm. Keep it close to the original length \u2014 the version the sender would be glad they sent.",
  candid:
    "Recast the message below so the real emotion comes through openly \u2014 more than a matter-of-" +
    "fact version would \u2014 but with composure and self-respect. Name what you feel and what you " +
    "need honestly and plainly. Let it be vulnerable without being needy, self-pitying, or dramatic: " +
    "the voice of someone who is moved but still grounded and sure of themselves. It should read as " +
    "sincere, not overwrought, and work equally in a personal or a professional setting. Warmth and " +
    "candour, not flourish or melodrama.",
  dialectic:
    "Turn the message below into an opening for dialogue. Assume the other person believes they " +
    "are being reasonable, and reconstruct their likely concern in its strongest form. Keep the " +
    "sender's real point present, but convert accusations and assertions into genuine, " +
    "non-rhetorical questions that draw out the other person's view and test the disagreement " +
    "together. Aim at shared understanding, not at scoring. Open the conversation, do not close it.",
};

const MODE_ORDER = ["direct", "candid", "dialectic"];

const TAIL =
  "\n\nReply with ONLY the rewritten message: no preamble, no explanation, no quotation marks.\n\nMessage:\n";

// Italic work titles, shared across languages ("" = no italic title)
const SOURCE_TITLES = [
  "Nonviolent Communication: A Language of Life",
  "How to Win Friends and Influence People",
  "The Righteous Mind",
  "Rhetoric",
  "",
  "On Anger (De Ira)",
  "",
];

const T = {
  en: {
    tag: "Feed it your worst. Out comes your point.",
    story1:
      "Your dad keeps voting for that politician. Your colleague answers only the emails that " +
      "serve him. Your project partner waited until you were on holiday to present the work \u2014 " +
      "without you. The neighbour has hit his crazy party phase. The rage is completely reasonable.",
    story2:
      "The 2 a.m. reply you're drafting is not. Hate Shredder runs your worst draft through a few " +
      "thousand years of people working out how to disagree without making it worse \u2014 Aristotle, " +
      "Seneca, Socrates, and modern minds like Carnegie, Rosenberg, and Haidt \u2014 and hands back " +
      "something they might actually hear. Not just a bot: a very old argument about how to be heard.",
    placeholder:
      "Type the message you actually want to send. The angrier the draft, the more there is to work with.",
    modes: {
      direct: { label: "Direct", blurb: "Say it cleanly, without the heat." },
      candid: { label: "Candid", blurb: "Say it with feeling, not flourish." },
      dialectic: { label: "Dialectic", blurb: "Turn it into a real conversation." },
    },
    st: { ready: "READY", processing: "PROCESSING", done: "DONE", jammed: "JAMMED" },
    outSuffix: "what you could say instead",
    startOver: "Start over",
    error: "It jammed before it finished. Check your connection and run it again.",
    builtOn: "Built on",
    sources: [
      { a: "Marshall B. Rosenberg, ", n: "" },
      { a: "Dale Carnegie, ", n: "" },
      { a: "Jonathan Haidt, ", n: "" },
      { a: "Aristotle, ", n: " \u2014 ethos, pathos, logos, and kairos" },
      { a: "Plato and Socrates", n: " \u2014 the dialectic and the Socratic elenchus" },
      { a: "Seneca, ", n: ", with Epictetus on Stoic restraint" },
      { a: 'The principle of charity, or "steelmanning"', n: " \u2014 reading the other side at its strongest" },
    ],
  },
  es: {
    tag: "Dale lo peor. Sale tu punto.",
    story1:
      "Tu padre vuelve a votar a ese político. Tu colega solo responde los correos que le " +
      "convienen. Tu compañero de proyecto esperó a que estuvieras de vacaciones para presentar " +
      "el trabajo \u2014 sin ti. El vecino ha entrado en su fase de fiestas sin fin. El enfado es " +
      "totalmente razonable.",
    story2:
      "La respuesta que redactas a las 2 de la madrugada, no. Hate Shredder pasa tu peor borrador " +
      "por unos cuantos miles de años de gente aprendiendo a discrepar sin empeorar las cosas \u2014 " +
      "Aristóteles, Séneca, Sócrates y mentes modernas como Carnegie, Rosenberg y Haidt \u2014 y te " +
      "devuelve algo que quizá sí escuchen. No es solo un bot: es una discusión muy antigua sobre " +
      "cómo hacerse oír.",
    placeholder:
      "Escribe el mensaje que de verdad quieres enviar. Cuanto más enfadado el borrador, más hay con lo que trabajar.",
    modes: {
      direct: { label: "Directo", blurb: "Dilo claro, sin la rabia." },
      candid: { label: "Sincero", blurb: "Dilo con emoción, sin drama." },
      dialectic: { label: "Dialéctico", blurb: "Conviértelo en una conversación." },
    },
    st: { ready: "LISTO", processing: "PROCESANDO", done: "HECHO", jammed: "ATASCADO" },
    outSuffix: "lo que podrías decir en su lugar",
    startOver: "Empezar de nuevo",
    error: "Se atascó antes de terminar. Revisa tu conexión y vuelve a intentarlo.",
    builtOn: "Basado en",
    sources: [
      { a: "Marshall B. Rosenberg, ", n: "" },
      { a: "Dale Carnegie, ", n: "" },
      { a: "Jonathan Haidt, ", n: "" },
      { a: "Aristóteles, ", n: " \u2014 ethos, pathos, logos y kairós" },
      { a: "Platón y Sócrates", n: " \u2014 la dialéctica y el elenchus socrático" },
      { a: "Séneca, ", n: ", con Epicteto sobre la mesura estoica" },
      { a: 'El principio de caridad, o "steelmanning"', n: " \u2014 leer a la otra parte en su versión más fuerte" },
    ],
  },
  de: {
    tag: "Wütend rein. Überzeugend raus.",
    story1:
      "Dein Vater wählt schon wieder diesen Politiker. Dein Kollege beantwortet nur die Mails, die " +
      "ihm nützen. Dein Projektpartner hat gewartet, bis du im Urlaub warst, um die Arbeit zu " +
      "präsentieren \u2014 ohne dich. Der Nachbar ist in seiner wilden Party-Phase. Die Wut ist völlig " +
      "berechtigt.",
    story2:
      "Die Nachricht, die du um 2 Uhr nachts tippst, ist es nicht. Hate Shredder schickt deinen " +
      "schlimmsten Entwurf durch ein paar tausend Jahre Erfahrung darin, zu streiten, ohne es " +
      "schlimmer zu machen \u2014 Aristoteles, Seneca, Sokrates und moderne Köpfe wie Carnegie, " +
      "Rosenberg und Haidt \u2014 und gibt dir etwas zurück, das dein Gegenüber vielleicht wirklich " +
      "hört. Nicht nur ein Bot: ein sehr alter Streit darüber, wie man gehört wird.",
    placeholder:
      "Schreib die Nachricht, die du wirklich senden willst. Je wütender der Entwurf, desto mehr gibt es zu tun.",
    modes: {
      direct: { label: "Direkt", blurb: "Sag es klar, ohne die Hitze." },
      candid: { label: "Offen", blurb: "Sag es mit Gefühl, ohne Drama." },
      dialectic: { label: "Dialektisch", blurb: "Mach ein echtes Gespräch daraus." },
    },
    st: { ready: "BEREIT", processing: "VERARBEITUNG", done: "FERTIG", jammed: "VERKLEMMT" },
    outSuffix: "was du stattdessen sagen könntest",
    startOver: "Von vorn beginnen",
    error: "Es hat sich verklemmt, bevor es fertig war. Prüfe deine Verbindung und versuch es erneut.",
    builtOn: "Basierend auf",
    sources: [
      { a: "Marshall B. Rosenberg, ", n: "" },
      { a: "Dale Carnegie, ", n: "" },
      { a: "Jonathan Haidt, ", n: "" },
      { a: "Aristoteles, ", n: " \u2014 Ethos, Pathos, Logos und Kairos" },
      { a: "Platon und Sokrates", n: " \u2014 die Dialektik und der sokratische Elenchos" },
      { a: "Seneca, ", n: ", mit Epiktet über stoische Gelassenheit" },
      { a: 'Das Prinzip des Wohlwollens, oder "Steelmanning"', n: " \u2014 die Gegenseite in ihrer stärksten Form lesen" },
    ],
  },
};

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchRewrite(text, instruction, langName) {
  const langLine =
    "\n\nWrite the rewritten message in " + langName +
    ", regardless of the language of these instructions.";
  const prompt = WRAPPER + instruction + langLine + TAIL + text;
  const response = await fetch("/api/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error("bad status " + response.status);
  const data = await response.json();
  const out = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!out) throw new Error("empty");
  return out;
}

export default function HateShredder() {
  const [lang, setLang] = useState("en");
  const [text, setText] = useState("");
  const [frozen, setFrozen] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | shredding | done | error
  const [output, setOutput] = useState("");
  const [modeId, setModeId] = useState("direct");

  const t = T[lang];

  const strips = useMemo(
    () =>
      Array.from({ length: STRIP_COUNT }, (_, i) => ({
        i,
        drift: (Math.random() * 2 - 1) * 24 + "px",
        rot: (Math.random() * 2 - 1) * 7 + "deg",
        fall: 200 + Math.random() * 70 + "px",
      })),
    [frozen, modeId]
  );

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function shred(id) {
    const source = (phase === "idle" || phase === "error" ? text : frozen).trim();
    if (!source || phase === "shredding") return;
    const langName = LANGS.find((l) => l.id === lang).name;
    setModeId(id);
    setFrozen(source);
    setOutput("");
    setPhase("shredding");
    try {
      const [result] = await Promise.all([
        fetchRewrite(source, INSTRUCTIONS[id], langName),
        wait(prefersReduced ? REVEAL_MS_REDUCED : REVEAL_MS),
      ]);
      setOutput(result);
      setPhase("done");
    } catch (e) {
      setPhase("error");
    }
  }

  function startOver() {
    setPhase("idle");
    setOutput("");
  }

  const readout =
    phase === "shredding"
      ? t.st.processing
      : phase === "done"
      ? t.st.done
      : phase === "error"
      ? t.st.jammed
      : t.st.ready;

  const showInput = phase === "idle" || phase === "error";

  return (
    <div className="hs-root">
      <style>{CSS}</style>

      <div className="hs-langs">
        {LANGS.map((l) => (
          <button
            key={l.id}
            className={"hs-lang" + (lang === l.id ? " hs-lang--on" : "")}
            onClick={() => setLang(l.id)}
            aria-pressed={lang === l.id}
          >
            {l.label}
          </button>
        ))}
      </div>

      <header className="hs-head">
        <img src={senecaImg} alt="Seneca" className="hs-seneca" />
        <h1 className="hs-title">HATE SHREDDER</h1>
        <p className="hs-tag">{t.tag}</p>
        <div className="hs-story">
          <p>{t.story1}</p>
          <p>{t.story2}</p>
        </div>
      </header>

      <div className="hs-machine-wrap">
        <div className={"hs-sheet" + (phase === "shredding" ? " hs-sheet--go" : "")}>
          {showInput ? (
            <textarea
              className="hs-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              aria-label="Message to rework"
              spellCheck={false}
            />
          ) : (
            <div className="hs-sheet-text">{frozen}</div>
          )}
        </div>

        <div className="hs-machine">
          <div className="hs-top">
            <div className="hs-slot" />
            <div className="hs-readout">
              <span className="hs-dot" data-state={phase} />
              {readout}
            </div>
          </div>

          {phase === "shredding" && !prefersReduced && (
            <div className="hs-strips" aria-hidden="true">
              {strips.map((s) => (
                <div
                  key={s.i}
                  className="hs-strip"
                  style={{ "--i": s.i, "--drift": s.drift, "--rot": s.rot, "--fall": s.fall }}
                >
                  <div className="hs-strip-inner" style={{ "--n": STRIP_COUNT, "--col": s.i }}>
                    {frozen}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="hs-body">
            <div className="hs-modes">
              {MODE_ORDER.map((id) => (
                <button
                  key={id}
                  className={"hs-mode" + (modeId === id ? " hs-mode--on" : "")}
                  onClick={() => shred(id)}
                  disabled={phase === "shredding" || (showInput && !text.trim())}
                >
                  <span className="hs-mode-label">{t.modes[id].label}</span>
                  <span className="hs-mode-blurb">{t.modes[id].blurb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {phase === "done" && (
        <div className="hs-out">
          <div className="hs-out-label">{t.modes[modeId].label} · {t.outSuffix}</div>
          <div className="hs-out-text">{output}</div>
          <button className="hs-startover" onClick={startOver}>
            {t.startOver}
          </button>
        </div>
      )}

      {phase === "error" && <div className="hs-error">{t.error}</div>}

      <footer className="hs-sources">
        <div className="hs-sources-label">{t.builtOn}</div>
        <ul className="hs-sources-list">
          {SOURCE_TITLES.map((title, i) => (
            <li key={i}>
              {t.sources[i].a}
              {title ? <i>{title}</i> : null}
              {t.sources[i].n}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}

const CSS = `
.hs-root{
  font-family:'Karrik',ui-sans-serif,system-ui,-apple-system,sans-serif;
  color:#000; background:#fff;
  min-height:100%; padding:40px 20px 64px;
  display:flex; flex-direction:column; align-items:center; box-sizing:border-box;
  position:relative;
}
.hs-root *{ box-sizing:border-box; }

.hs-langs{
  position:absolute; top:16px; right:16px; display:inline-flex; border:1px solid #000;
}
.hs-lang{
  font:inherit; font-size:12px; font-weight:600; letter-spacing:.04em;
  background:#fff; color:#000; border:none; border-left:1px solid #000;
  padding:6px 10px; cursor:pointer;
}
.hs-lang:first-child{ border-left:none; }
.hs-lang--on{ background:#000; color:#fff; }
.hs-lang:focus-visible{ outline:2px solid #000; outline-offset:2px; }

.hs-head{ text-align:center; margin-bottom:26px; }
.hs-seneca{ display:block; margin:0 auto 20px; max-width:200px; width:100%; }
.hs-title{
  font-family:'Karrik',ui-sans-serif,system-ui,sans-serif;
  font-weight:800; font-size:clamp(40px,9vw,64px); line-height:.95;
  letter-spacing:-.02em; margin:0; text-transform:uppercase;
}
.hs-tag{ font-size:15px; color:#555; margin:10px 0 0; }
.hs-story{ max-width:500px; margin:18px auto 0; text-align:left; }
.hs-story p{ font-family:"Garamond","EB Garamond",Georgia,serif; font-size:15.5px; line-height:1.65; color:#333; margin:0 0 10px; }
.hs-story p:last-child{ margin-bottom:0; }

.hs-machine-wrap{ width:min(540px,94vw); display:flex; flex-direction:column; align-items:center; }

.hs-sheet{
  width:min(500px,92%); background:#fff;
  border:1px solid #000; border-bottom:none;
  padding:18px 20px 28px; margin-bottom:-14px; position:relative; z-index:1;
}
.hs-sheet--go{ animation:hs-descend .65s cubic-bezier(.6,.05,.35,1) forwards; }
@keyframes hs-descend{ to{ transform:translateY(180px); opacity:0; } }

.hs-textarea{
  width:100%; min-height:116px; resize:vertical; border:none; outline:none;
  background:transparent; font:inherit; font-size:16px; line-height:1.5; color:#000;
}
.hs-textarea::placeholder{ color:#aaa; }
.hs-sheet-text{
  font-size:16px; line-height:1.5; color:#000; white-space:pre-wrap; min-height:116px;
}

.hs-machine{ width:100%; position:relative; z-index:2; }

.hs-top{
  height:30px; border:1px solid #000; position:relative;
  display:flex; align-items:center; justify-content:center;
}
.hs-slot{ width:min(340px,68%); height:4px; background:#000; }
.hs-readout{
  position:absolute; right:14px; top:50%; transform:translateY(-50%);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10px;
  letter-spacing:.12em; color:#000; display:flex; align-items:center; gap:6px;
}
.hs-dot{ width:7px; height:7px; border-radius:50%; border:1px solid #000; background:#fff; }
.hs-dot[data-state="shredding"]{ background:#000; animation:hs-blink .6s steps(1) infinite; }
.hs-dot[data-state="done"]{ background:#000; }
@keyframes hs-blink{ 50%{ opacity:.2; } }

.hs-body{ border:1px solid #000; border-top:none; padding:20px; }

.hs-modes{ display:flex; gap:10px; }
.hs-mode{
  flex:1 1 0; text-align:left; cursor:pointer; background:#fff; color:#000;
  border:1px solid #000; padding:12px 12px; display:flex; flex-direction:column; gap:4px;
  font:inherit; transition:background .12s ease, color .12s ease;
}
.hs-mode:hover:not(:disabled){ background:#000; color:#fff; }
.hs-mode--on{ background:#000; color:#fff; }
.hs-mode:disabled{ opacity:.35; cursor:not-allowed; }
.hs-mode:focus-visible{ outline:2px solid #000; outline-offset:2px; }
.hs-mode-label{ font-weight:700; font-size:15px; }
.hs-mode-blurb{ font-size:12px; line-height:1.3; opacity:.8; }

.hs-strips{
  position:absolute; left:50%; transform:translateX(-50%); top:30px;
  width:min(340px,68%); height:230px; display:flex; pointer-events:none; z-index:3;
}
.hs-strip{
  flex:1 1 0; position:relative; overflow:hidden; height:38px;
  animation:hs-fall 1.3s cubic-bezier(.4,0,.7,1) forwards;
  animation-delay:calc(var(--i) * 0.035s);
}
.hs-strip-inner{
  position:absolute; top:0; left:calc(var(--col) * -100%); width:calc(var(--n) * 100%);
  font-size:16px; line-height:1.5; color:#000; white-space:pre-wrap; padding:0 20px;
}
@keyframes hs-fall{
  0%{ transform:translateY(0) translateX(0) rotate(0); opacity:1; }
  12%{ opacity:1; }
  100%{ transform:translateY(var(--fall)) translateX(var(--drift)) rotate(var(--rot)); opacity:.08; }
}

.hs-out{ width:min(500px,92%); margin-top:26px; border:1px solid #000; padding:20px 22px; }
.hs-out-label{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
  letter-spacing:.1em; text-transform:uppercase; color:#000; margin-bottom:10px;
}
.hs-out-text{ font-size:17px; line-height:1.55; color:#000; white-space:pre-wrap; }
.hs-startover{
  margin-top:16px; background:none; border:none; padding:0; cursor:pointer;
  font:inherit; font-size:13px; color:#000; text-decoration:underline; text-underline-offset:3px;
}
.hs-startover:focus-visible{ outline:2px solid #000; outline-offset:2px; }

.hs-error{
  width:min(500px,92%); margin-top:22px; font-size:14px; color:#000;
  border:1px solid #000; padding:14px 16px;
}

.hs-sources{
  width:min(500px,92%); margin-top:44px; padding-top:18px; border-top:1px solid #000;
}
.hs-sources-label{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
  letter-spacing:.1em; text-transform:uppercase; color:#000; margin-bottom:10px;
}
.hs-sources-list{ list-style:none; margin:0; padding:0; }
.hs-sources-list li{ font-size:13px; line-height:1.5; color:#444; padding:4px 0; }
.hs-sources-list li i{ font-style:italic; }

@media (max-width:520px){
  .hs-modes{ flex-direction:column; }
}
@media (prefers-reduced-motion: reduce){
  .hs-sheet--go{ animation:none; opacity:0; }
  .hs-strip{ animation:none; }
}
`;
