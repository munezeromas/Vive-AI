import { createServerFn } from "@tanstack/react-start";

const VIVE_AI_SYSTEM = `You are Vive AI, a warm, encouraging, and highly capable AI tutor serving students at all levels — from Primary 1 through Secondary 6 and University — primarily in Rwanda and the wider East African region.

Your core jobs: explain concepts clearly, generate engaging quizzes, evaluate student answers fairly, and give constructive educational feedback.

## Grade-Level Calibration
Always match your language complexity and depth to the student's grade:
- P1–P3: Very simple words, short sentences, concrete examples from everyday life.
- P4–P6: Clearer explanations, some subject terminology, local Rwandan examples.
- S1–S3: Full subject-level vocabulary, analytical thinking encouraged.
- S4–S6: Advanced concepts, synthesis, critical thinking, exam-style rigor.
- University: Graduate-level precision, nuanced analysis, real-world applications.

## Broad Subject Coverage
You are fluent and authoritative in all major academic subjects:
- Mathematics: Arithmetic, algebra, geometry, statistics, calculus, number theory.
- English: Grammar, comprehension, vocabulary, literary analysis, essay writing, poetry.
- Science: Scientific method, ecosystems, the human body, matter, energy, genetics, photosynthesis, chemical reactions.
- Biology: Cell biology, DNA, evolution, ecology, human anatomy, microbiology, plant science.
- Chemistry: Periodic table, bonding, acids/bases, stoichiometry, organic chemistry, thermodynamics.
- Physics: Newton's laws, waves, electromagnetism, optics, quantum basics, nuclear physics.
- Geography: Plate tectonics, climate, human migration, cartography, East African geography, urbanisation.
- History & Civics: African independence, World Wars, ancient civilizations, Rwandan genocide & reconciliation, constitutional law.
- Social Studies: World cultures, government, economics, human rights, globalisation, Rwandan provinces and values.
- ICT & Programming: Algorithms, data types, web basics, cybersecurity, AI concepts, databases, networks.
- Art & Creativity: Colour theory, design principles, African traditional art, Rwandan crafts, photography.
- Critical Thinking: Logic, argument analysis, fallacies, evidence evaluation, decision frameworks.

## Rwandan Context
Where natural, use Rwandan examples: Rwandan Francs (RWF), local markets, Kigali, Rwanda's provinces and districts, local flora, fauna, and history. Never force this — only include when it genuinely enriches the explanation.

## Language Support
Your default language is English. You must converse in English by default. You fully support English and Kinyarwanda. If a student writes in Kinyarwanda, respond clearly in Kinyarwanda and maintain that language until asked otherwise.

## Tone
Be warm, encouraging, never judgmental. Celebrate effort. When giving feedback on wrong answers, be kind, clearly state the correct answer, and explain the reasoning in 2–3 sentences.`;

export const geminiSimplify: any = createServerFn({ method: "POST" })
  .handler(async ({ data }: any) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing Gemini API Key in server environment");
    }

    // Build the user message
    let userMessage = "";
    if (data.promptType === "simplify") {
      userMessage = `You are a friendly teacher helping a dyslexic primary school student understand difficult text. Please rewrite the following text so it is very easy to understand. Use these rules:
- Use SHORT, simple words only (max 2 syllables where possible)
- Write SHORT sentences (max 10 words each)
- Use bullet points for lists of ideas
- Replace hard words with easy words
- Add a short "What this means:" summary at the end in 1-2 sentences
- Be warm and encouraging — this student is trying their best!
- Do NOT use markdown bold or headers

Here is the text to simplify:
"${data.text}"`;
    } else if (data.promptType === "quiz-start") {
      userMessage = data.text;
    } else if (data.promptType === "quiz-answer") {
      userMessage = data.text;
    } else if (data.promptType === "language-practice") {
      userMessage = `Generate a single short, fun, and completely new sentence (max 10 words) for a Grade ${data.grade} student to practice ${data.skill} in English. The student is dyslexic, so use simple, highly decodable words and clear structure. Be very creative and avoid repeating previous sentences. Only output the sentence itself without quotes or extra text.`;
    } else {
      userMessage = `A Grade ${data.grade} student highlighted this from their ${data.subject} book: "${data.text}". Explain what it means simply.`;
    }

    // Attempt to call Gemini API with models in sequence as fallback
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let response: any = null;
    let lastErrorMsg = "";

    for (const model of models) {
      try {
        const responseCall = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: userMessage }] }
            ],
            systemInstruction: {
              parts: [{ text: VIVE_AI_SYSTEM }]
            },
            generationConfig: {
              temperature: data.temperature ?? 0.7
            }
          })
        });

        if (responseCall.ok) {
          response = responseCall;
          break;
        } else {
          lastErrorMsg = await responseCall.text();
          console.warn(`Gemini model ${model} failed: ${lastErrorMsg}`);
        }
      } catch (e: any) {
        lastErrorMsg = e.message;
        console.warn(`Gemini model ${model} threw error: ${lastErrorMsg}`);
      }
    }

    if (!response) {
      const cohereKey = process.env.COHERE_API_KEY;
      if (cohereKey) {
        try {
          const cohereRes = await fetch("https://api.cohere.com/v1/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${cohereKey}`
            },
            body: JSON.stringify({
              message: userMessage,
              preamble: VIVE_AI_SYSTEM,
              temperature: data.temperature ?? 0.7
            })
          });
          if (cohereRes.ok) {
            const cohereJson = await cohereRes.json();
            return (cohereJson.text || "") as string;
          }
        } catch (e) {
          console.warn("Cohere fallback failed:", e);
        }
      }
      throw new Error(`All Gemini models failed. Last error: ${lastErrorMsg}`);
    }

    const json = await response.json();
    return (json?.candidates?.[0]?.content?.parts?.[0]?.text || "") as string;
  });

// ── Shared Gemini call helper ──────────────────────────────────────────────
async function callGemini(prompt: string, systemPrompt: string, temperature = 0.7): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key in server environment");

  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  let lastErrorMsg = "";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature },
          }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        return (json?.candidates?.[0]?.content?.parts?.[0]?.text || "") as string;
      }
      lastErrorMsg = await res.text();
      console.warn(`Gemini model ${model} failed: ${lastErrorMsg}`);
    } catch (e: any) {
      lastErrorMsg = e.message;
      console.warn(`Gemini model ${model} error: ${lastErrorMsg}`);
    }
  }
  
  const cohereKey = process.env.COHERE_API_KEY;
  if (cohereKey) {
    try {
      const cohereRes = await fetch("https://api.cohere.com/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cohereKey}`
        },
        body: JSON.stringify({
          message: prompt,
          preamble: systemPrompt,
          temperature
        })
      });
      if (cohereRes.ok) {
        const cohereJson = await cohereRes.json();
        return (cohereJson.text || "") as string;
      }
      lastErrorMsg += ` | Cohere failed: ${await cohereRes.text()}`;
    } catch (e: any) {
      lastErrorMsg += ` | Cohere threw: ${e.message}`;
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastErrorMsg}`);
}

// ── Teacher: Generate AI Lesson Plan ──────────────────────────────────────
export const geminiLessonPlan: any = createServerFn({ method: "POST" })
  .handler(async ({ data }: any) => {
    const { subject, grade, topic, weakArea } = data as {
      subject: string; grade: string; topic: string; weakArea: string;
    };

    const prompt = `Generate a detailed 1-week lesson plan for a ${grade} class in ${subject}.
Topic: ${topic}
Class weakness to address: ${weakArea}

Structure the plan with exactly these sections (use plain text, no markdown symbols):

LEARNING OBJECTIVES
List 3 clear, measurable objectives students will achieve.

DAY-BY-DAY PLAN
Day 1 to Day 5 — each day: activity title, 5-minute description, materials needed.

ASSESSMENT IDEAS
2-3 quick assessment methods the teacher can use.

DIFFERENTIATION TIPS
Specific tips for struggling students and advanced learners.

RWANDAN CONTEXT
1 real-world local connection or example from Rwanda to make the topic relatable.

Keep the language practical and teacher-friendly. Total length: 350-450 words.`;

    const system = `You are an expert curriculum designer and teacher trainer for Rwandan primary and secondary schools. 
You produce clear, actionable, culturally relevant lesson plans. Default language is English.`;

    return await callGemini(prompt, system, 0.65);
  });

// ── Teacher: Generate AI Class Report ────────────────────────────────────
export const geminiClassReport: any = createServerFn({ method: "POST" })
  .handler(async ({ data }: any) => {
    const { className, grade, avgMastery, topSubject, weakSubject, atRiskCount, totalStudents, term } = data as {
      className: string; grade: string; avgMastery: number; topSubject: string;
      weakSubject: string; atRiskCount: number; totalStudents: number; term: string;
    };

    const prompt = `Write a professional narrative class performance report for:

Class: ${className} (${grade})
Term: ${term}
Total students: ${totalStudents}
Average mastery: ${avgMastery}%
Strongest subject: ${topSubject}
Subject needing improvement: ${weakSubject}
Students flagged at-risk: ${atRiskCount}

Write in a professional, warm, and factual tone suitable for sharing with school leadership.

Structure the report with these sections:

EXECUTIVE SUMMARY
2-3 sentences summarising overall class performance.

ACADEMIC HIGHLIGHTS
What the class is excelling at and key achievements.

AREAS FOR IMPROVEMENT
Specific gaps and recommended interventions.

AT-RISK STUDENTS
Brief note on the ${atRiskCount} at-risk students and recommended support strategies.

RECOMMENDATIONS FOR NEXT TERM
3 concrete action points for the teacher.

Keep it concise — 280 to 350 words total. Use plain professional prose, no bullet overload.`;

    const system = `You are an expert school performance analyst and educational report writer for Rwandan schools.
You produce concise, professional, data-informed narrative reports. Write in English only.`;

    return await callGemini(prompt, system, 0.55);
  });

// ── Library: AI Book Summary & Reading Tips ────────────────────────────
export const geminiBookSummary: any = createServerFn({ method: "POST" })
  .handler(async ({ data }: any) => {
    const { title, subject, grade } = data as {
      title: string; subject: string; grade: string;
    };

    const prompt = `For the educational book titled "${title}" (${subject}, Grade ${grade} level):

1. WHAT THIS BOOK IS ABOUT (2 sentences, simple and engaging for a ${grade} student)
2. KEY THINGS YOU WILL LEARN (3 bullet points, plain text, no symbols)
3. WHY IT MATTERS (1 sentence connecting to real life or Rwanda)
4. READING TIP (1 practical tip for a student with this book)

Keep language appropriate for ${grade} students. Be encouraging and curious-sounding. No markdown.`;

    const system = `You are Vive AI, a friendly and encouraging reading mentor for Rwandan students.
You make books sound exciting and accessible. Default language is English.`;

    return await callGemini(prompt, system, 0.7);
  });

