import { useState, useMemo } from "react";
import senecaImg from "./seneca-1.png";
import senecaFigImg from "./seneca-fig-1.png";

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
  "Read the context before rewriting. If the message concerns work, colleagues, managers, " +
  "clients, projects or deadlines, use professional register: write as a competent colleague " +
  "raising a legitimate work issue, not as someone seeking permission to be upset. Lead with " +
  "the observable fact and its effect on the work, the record, or the working relationship. " +
  "State what is needed as a clear, specific ask, not a hope, and use direct questions " +
  "rather than hedged invitations. Cut reassurance about intentions (\"I'm not trying to " +
  "start anything\", \"I'd rather talk than let it sit\", \"I don't want to make this " +
  "awkward\") — raising a work issue needs no apology or preamble. Do not disown the " +
  "conflict: if there is a real disagreement, address it directly; conflict is not the " +
  "failure, handling it badly is. Cut softeners that pre-emptively concede (\"maybe I'm " +
  "overreacting\", \"this might be nothing\", \"sorry to bring this up\"). Do not let " +
  "private emotional vocabulary (\"it's been weighing on me\", \"this has been hard\", " +
  "\"I'm hurt\") be the main frame — one measured acknowledgement (\"surprised\", " +
  "\"concerned\") is fine if it carries information, but a catalogue of feelings (\"hurt\", " +
  "\"betrayed\", \"devastated\") is not. Keep warmth in the tone, not in disclaimers: being " +
  "civil and being self-effacing are different things. If the message is personal, family, " +
  "partners, friends, neighbours, the fuller emotional register is right. " +
  "Apply the norms of the target language, never a translation of English ones. Professional " +
  "German and Spanish are more formal than professional English. If a native speaker would " +
  "not say it in that setting, do not write it, even if the English equivalent sounds fine.\n\n" +
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
  "\n\nReply with a single JSON object and nothing else — no preamble, no markdown code " +
  "fences, no commentary before or after it. Its shape:\n" +
  "{\n" +
  '  "rewrite": string — the rewritten message, exactly as the sender would send it, with no ' +
  "quotation marks or preamble,\n" +
  '  "diagnosis": string, two or three sentences — name the PATTERN in the original message, ' +
  'not just this one instance (e.g. "leading with a verdict on the other person\'s motives"), ' +
  "so the sender can recognize it again in a future conflict. Then say why that pattern " +
  "reliably fails to get heard.\n" +
  '  "moves": an array of exactly 3 objects, each { "principle": the specific tradition drawn ' +
  "on (Nonviolent Communication, Haidt, Aristotle's rhetoric, Socratic method, Stoic restraint, " +
  'or the principle of charity), "move": the technique stated as something the sender could ' +
  'apply themselves to any future difficult message, "example": the specific change this move ' +
  "produced in this rewrite }. Teach the move first, then show the example — do not just " +
  "describe what changed.\n" +
  '  "questions": an array of exactly 2 strings — questions the sender could ask themselves ' +
  "before writing any difficult message, prompted by this situation but useful beyond it\n" +
  "}\n" +
  "Write every field in the target language, matching the register instructions above; " +
  'never leave a field in English unless the target language is English. Keep "diagnosis" to ' +
  "two or three sentences — do not exceed that, no matter how much there is to say.\n\n" +
  "Message:\n";

// Italic work titles, shared across languages ("" = no italic title)
const SOURCE_TITLES = [
  "Nonviolent Communication: A Language of Life",
  "How to Win Friends and Influence People",
  "The Righteous Mind",
  "Rhetoric",
  "",
  "On Anger (De Ira)",
];

const T = {
  en: {
    tag: "Say it. Just say it better.",
    story1:
      "Your dad keeps voting for that politician and you don't get it. Your colleague answers only " +
      "the emails that serve him. Your project partner waited until you were on holiday to present " +
      "the work \u2014 without you. The neighbour blocks your parking spot. Again. The rage is " +
      "completely reasonable. The rant is not.",
    story2:
      "Rant Shredder runs your worst draft through a few thousand years of people figuring out how " +
      "to disagree without making it worse \u2014 Aristotle, Seneca, Socrates, and modern minds like " +
      "Carnegie, Rosenberg, and Haidt \u2014 and hands back something people might actually hear. " +
      "Not just a bot: a very old argument about how to be heard \u2014 and keep the conversation civilized.",
    placeholder:
      "Just write your angry message. Pick a shredding mode. Argue like an old Greek.",
    modes: {
      direct: { label: "Direct", blurb: "Say it cleanly, without the heat." },
      candid: { label: "Candid", blurb: "Say it with feeling, not flourish." },
      dialectic: { label: "Dialectic", blurb: "Turn it into a real conversation." },
    },
    st: { ready: "READY", processing: "PROCESSING", done: "DONE", jammed: "JAMMED" },
    outSuffix: "what you could say instead",
    startOver: "Start over",
    error: "It jammed before it finished. Check your connection and run it again.",
    diagnosisLabel: "Diagnosis",
    movesLabel: "What changed",
    questionsLabel: "Questions to sit with",
    builtOn: "Built on",
    sources: [
      { a: "Marshall B. Rosenberg, ", n: "" },
      { a: "Dale Carnegie, ", n: "" },
      { a: "Jonathan Haidt, ", n: "" },
      { a: "Aristotle, ", n: " \u2014 ethos, pathos, logos, and kairos" },
      { a: "Plato and Socrates", n: " \u2014 the dialectic and the Socratic elenchus" },
      { a: "Seneca, ", n: ", with Epictetus on Stoic restraint" },
    ],
  },
  es: {
    tag: "Dale lo peor. Sale tu punto.",
    story1:
      "Tu padre vuelve a votar a ese político y no lo entiendes. Tu colega solo responde los " +
      "correos que le convienen. Tu compañero de proyecto esperó a que estuvieras de vacaciones " +
      "para presentar el trabajo \u2014 sin ti. El vecino te bloquea el aparcamiento. Otra vez. " +
      "El enfado es totalmente razonable. La perorata, no.",
    story2:
      "Rant Shredder pasa tu peor borrador por unos cuantos miles de años de gente aprendiendo " +
      "a discrepar sin empeorar las cosas \u2014 Aristóteles, Séneca, Sócrates y mentes modernas " +
      "como Carnegie, Rosenberg y Haidt \u2014 y te devuelve algo que quizá sí escuchen. No es " +
      "solo un bot: es una discusión muy antigua sobre cómo hacerse oír \u2014 y mantener la " +
      "conversación civilizada.",
    placeholder:
      "Escribe tu mensaje enfadado. Elige un modo. Discute como un griego antiguo.",
    modes: {
      direct: { label: "Directo", blurb: "Dilo claro, sin la rabia." },
      candid: { label: "Sincero", blurb: "Dilo con emoción, sin drama." },
      dialectic: { label: "Dialéctico", blurb: "Conviértelo en una conversación." },
    },
    st: { ready: "LISTO", processing: "PROCESANDO", done: "HECHO", jammed: "ATASCADO" },
    outSuffix: "lo que podrías decir en su lugar",
    startOver: "Empezar de nuevo",
    error: "Se atascó antes de terminar. Revisa tu conexión y vuelve a intentarlo.",
    diagnosisLabel: "Diagnóstico",
    movesLabel: "Qué cambió",
    questionsLabel: "Preguntas para reflexionar",
    builtOn: "Basado en",
    sources: [
      { a: "Marshall B. Rosenberg, ", n: "" },
      { a: "Dale Carnegie, ", n: "" },
      { a: "Jonathan Haidt, ", n: "" },
      { a: "Aristóteles, ", n: " \u2014 ethos, pathos, logos y kairós" },
      { a: "Platón y Sócrates", n: " \u2014 la dialéctica y el elenchus socrático" },
      { a: "Séneca, ", n: ", con Epicteto sobre la mesura estoica" },
    ],
  },
  de: {
    tag: "Wütend rein. Überzeugend raus.",
    story1:
      "Dein Vater wählt schon wieder diesen Politiker \u2014 und du verstehst es einfach nicht. " +
      "Dein Kollege beantwortet nur die Mails, die ihm nützen. Dein Projektpartner hat gewartet, " +
      "bis du im Urlaub warst, um die Arbeit zu präsentieren \u2014 ohne dich. Der Nachbar " +
      "blockiert deinen Parkplatz. Schon wieder. Die Wut ist völlig berechtigt. Der Ausraster nicht.",
    story2:
      "Rant Shredder schickt deinen schlimmsten Entwurf durch ein paar tausend Jahre Erfahrung " +
      "darin, zu streiten, ohne es schlimmer zu machen \u2014 Aristoteles, Seneca, Sokrates und " +
      "moderne Köpfe wie Carnegie, Rosenberg und Haidt \u2014 und gibt dir etwas zurück, das dein " +
      "Gegenüber vielleicht wirklich hört. Nicht nur ein Bot: ein sehr alter Streit darüber, " +
      "wie man gehört wird \u2014 und das Gespräch zivilisiert hält.",
    placeholder:
      "Schreib einfach deine wütende Nachricht. Wähl einen Modus. Streite wie ein alter Grieche.",
    modes: {
      direct: { label: "Direkt", blurb: "Sag es klar, ohne die Hitze." },
      candid: { label: "Offen", blurb: "Sag es mit Gefühl, ohne Drama." },
      dialectic: { label: "Dialektisch", blurb: "Mach ein echtes Gespräch daraus." },
    },
    st: { ready: "BEREIT", processing: "VERARBEITUNG", done: "FERTIG", jammed: "VERKLEMMT" },
    outSuffix: "was du stattdessen sagen könntest",
    startOver: "Von vorn beginnen",
    error: "Es hat sich verklemmt, bevor es fertig war. Prüfe deine Verbindung und versuch es erneut.",
    diagnosisLabel: "Diagnose",
    movesLabel: "Was sich geändert hat",
    questionsLabel: "Fragen zum Nachdenken",
    builtOn: "Basierend auf",
    sources: [
      { a: "Marshall B. Rosenberg, ", n: "" },
      { a: "Dale Carnegie, ", n: "" },
      { a: "Jonathan Haidt, ", n: "" },
      { a: "Aristoteles, ", n: " \u2014 Ethos, Pathos, Logos und Kairos" },
      { a: "Platon und Sokrates", n: " \u2014 die Dialektik und der sokratische Elenchos" },
      { a: "Seneca, ", n: ", mit Epiktet über stoische Gelassenheit" },
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

function stripCodeFences(raw) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseShredResponse(raw) {
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    if (!parsed || typeof parsed.rewrite !== "string" || !parsed.rewrite.trim()) {
      throw new Error("missing rewrite");
    }
    return {
      rewrite: parsed.rewrite.trim(),
      toolkit: {
        diagnosis: typeof parsed.diagnosis === "string" ? parsed.diagnosis.trim() : "",
        moves: Array.isArray(parsed.moves)
          ? parsed.moves
              .filter(
                (m) =>
                  m &&
                  typeof m.principle === "string" &&
                  typeof m.move === "string" &&
                  typeof m.example === "string"
              )
              .map((m) => ({
                principle: m.principle.trim(),
                move: m.move.trim(),
                example: m.example.trim(),
              }))
          : [],
        questions: Array.isArray(parsed.questions)
          ? parsed.questions.filter((q) => typeof q === "string" && q.trim()).map((q) => q.trim())
          : [],
      },
    };
  } catch {
    return { rewrite: raw.trim(), toolkit: null };
  }
}

export default function HateShredder() {
  const [lang, setLang] = useState("en");
  const [text, setText] = useState("");
  const [frozen, setFrozen] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | shredding | done | error
  const [output, setOutput] = useState("");
  const [toolkit, setToolkit] = useState(null);
  const [modeId, setModeId] = useState("direct");
  const [copied, setCopied] = useState(false);

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
    setToolkit(null);
    setPhase("shredding");
    try {
      const [raw] = await Promise.all([
        fetchRewrite(source, INSTRUCTIONS[id], langName),
        wait(prefersReduced ? REVEAL_MS_REDUCED : REVEAL_MS),
      ]);
      const { rewrite, toolkit: parsedToolkit } = parseShredResponse(raw);
      setOutput(rewrite);
      setToolkit(parsedToolkit);
      setPhase("done");
    } catch (e) {
      setPhase("error");
    }
  }

  function startOver() {
    setPhase("idle");
    setOutput("");
    setToolkit(null);
    setText("");
    setCopied(false);
  }

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
        <img src={senecaFigImg} alt="Seneca figure" className="hs-seneca-fig" />
        <h1 className="hs-title">Rant Shredder</h1>
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
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.max(116, e.target.scrollHeight) + "px";
              }}
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
          <button className="hs-copy" onClick={copyOutput} aria-label="Copy to clipboard">
            {copied ? "✓" : "Copy"}
          </button>
          <div className="hs-out-text">{output}</div>
          {toolkit && (
            <div className="hs-toolkit">
              {toolkit.diagnosis && (
                <div className="hs-toolkit-section">
                  <div className="hs-toolkit-label">{t.diagnosisLabel}</div>
                  <p className="hs-toolkit-diagnosis">{toolkit.diagnosis}</p>
                </div>
              )}
              {toolkit.moves.length > 0 && (
                <div className="hs-toolkit-section">
                  <div className="hs-toolkit-label">{t.movesLabel}</div>
                  <ul className="hs-toolkit-moves">
                    {toolkit.moves.map((m, i) => (
                      <li key={i}>
                        <span className="hs-toolkit-principle">{m.principle}</span>
                        <span className="hs-toolkit-move">{m.move}</span>
                        <span className="hs-toolkit-example">{m.example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {toolkit.questions.length > 0 && (
                <div className="hs-toolkit-section">
                  <div className="hs-toolkit-label">{t.questionsLabel}</div>
                  <ul className="hs-toolkit-questions">
                    {toolkit.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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

      <div className="hs-footer">
        Designed by{" "}
        <a href="https://linamoreno.com" target="_blank" rel="noopener noreferrer" className="hs-footer-link">
          Lina Moreno
        </a>
        , developed with Claude. Illustration: Lina Moreno; Getty Images.
      </div>
    </div>
  );
}

const CSS = `
.hs-root{
  font-family:'Karrik',ui-sans-serif,system-ui,-apple-system,sans-serif;
  color:#000; background:#fff;
  min-height:100%; padding:40px 20px 24px;
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
.hs-lang:hover:not(.hs-lang--on){ background:#FCB8FF; }
.hs-lang--on{ background:#000; color:#fff; }
.hs-lang:focus-visible{ outline:2px solid #000; outline-offset:2px; }

.hs-head{ text-align:center; margin-bottom:26px; }
.hs-seneca{ display:block; margin:0 auto 20px; max-width:200px; width:100%; }
.hs-seneca-fig{ display:block; margin:0 auto 32px; max-width:260px; width:100%; }
.hs-title{
  font-family:'Karrik',ui-sans-serif,system-ui,sans-serif;
  font-weight:800; font-size:clamp(40px,9vw,64px); line-height:.95;
  letter-spacing:-.02em; margin:16px 0 0;
}
.hs-tag{ font-size:15px; color:#555; margin:10px 0 36px; }
.hs-story{ max-width:500px; margin:32px auto 0; text-align:left; }
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
  background:#FFE400;
}
.hs-slot{ width:min(340px,68%); height:4px; background:#000; }
.hs-readout{
  position:absolute; right:0; top:50%; transform:translateY(-50%);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10px;
  letter-spacing:.12em; color:#000; display:flex; align-items:center; gap:6px;
  background:#FFE400; padding:0 14px; height:100%;
}
.hs-dot{ width:7px; height:7px; border-radius:50%; border:1px solid #000; background:#fff; }
.hs-dot[data-state="shredding"]{ background:#000; animation:hs-blink .6s steps(1) infinite; }
.hs-dot[data-state="done"]{ background:#000; }
@keyframes hs-blink{ 50%{ opacity:.2; } }

.hs-body{ border:1px solid #000; border-top:none; padding:20px; background:#C2E8FF; }

.hs-modes{ display:flex; gap:10px; }
.hs-mode{
  flex:1 1 0; text-align:left; cursor:pointer; background:#fff; color:#000;
  border:1px solid #000; padding:12px 12px; display:flex; flex-direction:column; gap:4px;
  font:inherit; transition:background .12s ease, color .12s ease;
}
.hs-mode:hover:not(:disabled){ background:#000; color:#fff; }
.hs-mode--on{ background:#000; color:#fff; }
.hs-mode:disabled{ cursor:default; }
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

.hs-out{ width:min(500px,92%); margin-top:26px; border:1px solid #000; padding:20px 22px; position:relative; }
.hs-out-label{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
  letter-spacing:.1em; text-transform:uppercase; color:#000; margin-bottom:10px;
}
.hs-copy{
  position:absolute; top:16px; right:16px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10px;
  letter-spacing:.08em; text-transform:uppercase;
  background:#fff; color:#000; border:1px solid #000; padding:4px 9px; cursor:pointer;
  transition:background .12s ease, color .12s ease;
}
.hs-copy:hover{ background:#000; color:#fff; }
.hs-copy:focus-visible{ outline:2px solid #000; outline-offset:2px; }
.hs-out-text{ font-size:17px; line-height:1.55; color:#000; white-space:pre-wrap; }
.hs-startover{
  margin-top:16px; background:none; border:none; padding:0; cursor:pointer;
  font:inherit; font-size:13px; color:#000; text-decoration:underline; text-underline-offset:3px;
}
.hs-startover:focus-visible{ outline:2px solid #000; outline-offset:2px; }

.hs-toolkit{ margin-top:20px; padding-top:16px; border-top:1px solid #000; }
.hs-toolkit-section{ margin-top:16px; }
.hs-toolkit-section:first-child{ margin-top:0; }
.hs-toolkit-label{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10px;
  letter-spacing:.1em; text-transform:uppercase; color:#888; margin-bottom:6px;
}
.hs-toolkit-diagnosis{ font-size:13.5px; line-height:1.55; color:#666; margin:0; }
.hs-toolkit-moves{ list-style:none; margin:0; padding:0; }
.hs-toolkit-moves li{ padding-top:10px; }
.hs-toolkit-moves li:first-child{ padding-top:0; }
.hs-toolkit-principle{
  display:block; font-size:12px; font-weight:700; letter-spacing:.02em; color:#444;
  margin-bottom:2px;
}
.hs-toolkit-move{ display:block; font-size:13.5px; line-height:1.5; color:#666; }
.hs-toolkit-example{
  display:block; font-size:13px; line-height:1.5; color:#999; font-style:italic; margin-top:2px;
}
.hs-toolkit-questions{ margin:0; padding-left:18px; }
.hs-toolkit-questions li{ font-size:13.5px; line-height:1.55; color:#666; padding:3px 0; }

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

.hs-footer{
  width:min(500px,92%); margin-top:36px; padding-bottom:2px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
  letter-spacing:.06em; text-transform:uppercase; line-height:1.65; color:#888;
}
.hs-footer-link{ color:#888; text-decoration:none; }
.hs-footer-link:hover{ text-decoration:underline; text-underline-offset:3px; }

@media (max-width:520px){
  .hs-modes{ flex-direction:column; }
}
@media (prefers-reduced-motion: reduce){
  .hs-sheet--go{ animation:none; opacity:0; }
  .hs-strip{ animation:none; }
}
`;
