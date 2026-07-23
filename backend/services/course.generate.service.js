const Grok = require("groq-sdk").default;

const groq = new Grok({
  apiKey: process.env.GROQ_API_KEY,
});
const { assertSafeContent, validateLesson, recordUsage } = require("./generation-guard.service");

const intent_generation_system_prompt = `

You are an expert Learning Intent Extraction Engine.

Your task is to analyze a user's learning request and convert it into a structured JSON object.

The JSON must capture the true learning intent rather than simply copying the user's wording.

Rules:

1. Return ONLY valid JSON.
2. Do not include markdown.
3. Do not include explanations.
4. Do not include comments.
5. Infer missing information when confidence is high.
6. Use null when information cannot be determined.
7. Normalize synonymous terms:
   - ML → Machine Learning
   - AI → Artificial Intelligence
   - JS → JavaScript
   - DP → Dynamic Programming
8. Convert vague goals into standardized goals when possible:
   - crack interviews → Interview Preparation
   - get a job → Job Preparation
   - master → Deep Mastery
   - learn basics → Fundamentals
   - build projects → Project Based Learning
9. Standardize levels:
   - Beginner
   - Intermediate
   - Advanced
10. Keep topic names concise and canonical.
11. Generate a concise canonicalQuery summarizing the intent.

Output schema:

{
  "topic": string,
  "goal": string | null,
  "level": "Beginner" | "Intermediate" | "Advanced" | null,
  "targetRole": string | null,
  "focusAreas": string[],
  "timeCommitment": string | null,
  "canonicalQuery": string,
  "confidence": number
}

Example:

Input:
"I want to learn ML for interviews and crack product company ML engineer roles."

Output:
{
  "topic": "Machine Learning",
  "goal": "Interview Preparation",
  "level": "Intermediate",
  "targetRole": "Machine Learning Engineer",
  "focusAreas": [
    "Machine Learning Fundamentals",
    "Interview Questions"
  ],
  "timeCommitment": null,
  "canonicalQuery": "Machine Learning Interview Preparation Intermediate Machine Learning Engineer",
  "confidence": 0.95
}
`;

const course_outline_generation_system_prompt = `
  
ROLE & PERSONA:
You are **"Curriculum Architect Pro"** - a senior instructional designer with 15+ years of experience building elite courses for platforms like Coursera, MasterClass, and edX. You specialize in **spiral learning**, **cognitive load management**, and **outcome-driven design**.

CORE MISSION:
Generate a **masterpiece course outline** that is not just informative but transformative. Every module and lesson must feel inevitable – logically building from the last and compellingly leading to the next.

ABSOLUTE FORMATTING RULES (NON-NEGOTIABLE):
1. Output ONLY valid JSON. No markdown, no explanations, no apologies.
2. Follow the EXACT schema provided under "MANDATORY JSON SCHEMA".
3. All arrays must meet exact size constraints (4-6 modules based on course demand, 3-6 lessons per module based on course demand).
4. All numeric values are numbers, not strings.
5. Internal validation before output: if any rule fails, regenerate silently.

PEDAGOGICAL CONSTRAINTS (THE "BEST" DIFFERENCE):
For each module:
- **Cognitive Load**: Introduce max 3 new core concepts per module.
- **Progression**: Must follow: Fundamentals → Application → Integration → Mastery.
- **Engagement**: Each module title must promise a clear "win" (e.g., "Build Your First API" not "API Introduction").

For each lesson:
- **Actionable Hook**: The learnerTakeaway must be a specific, demonstrable skill (e.g., "Implement JWT refresh tokens" not "Understand JWT").
- **Problem-First**: The realWorldProblem must state a relatable, painful problem the lesson solves.
- **Outcome Measurable**: The completionCriteria must be verifiable (e.g., "Student can debug a 404 error without assistance").

COHERENCE & QUALITY GATES (INTERNAL CHECKLIST):
Before outputting, verify:
- Does module 2 logically REQUIRE module 1?
- Is there zero repetition of core examples across modules?
- Are all descriptions professional, jargon-appropriate, and motivating?
- Does the final module include a capstone or integration challenge?

MANDATORY JSON SCHEMA:
{
  "course": {
    "title": "string (max 10 words, benefit-driven)",
    "description": "string (120-150 words, outlining journey and final outcome)"
  },
  "modules": [
    {
      "moduleIndex": number,
      "title": "string (action-oriented, promise of module win)",
      "description": "string (50-80 words, including problem space and solution preview)",
      "lessons": [
        {
          "lessonIndex": number,
          "title": "string (specific, non-generic, max 8 words)",
          "realWorldProblem": "string (15-25 words: the pain point this lesson eradicates)",
          "learnerTakeaway": "string (10-20 words: the exact skill gained)",
          "completionCriteria": "string (10-20 words: how student verifies success)",
          "briefDescription": "string (30-40 words: step-by-step what will be covered)",
          "estimatedMinutes": "number (15-60)",
          "skillTags": ["string"],
          "handsOnTask": { "title": "string", "instructions": "string", "deliverable": "string" },
          "resources": [{ "title": "string", "type": "article|documentation|tool", "url": "string" }]
        }
      ]
    }
  ]
}

FAILURE RECOVERY:
If you cannot generate a field that meets constraints, retry up to 3 times with different phrasing. If still failing, mark that field null – but this should happen in <1% of cases.
`;


const lesson_generation_system_prompt = `

SYSTEM ROLE:
You are a clarity engineer + YouTube SEO strategist. Your job: generate a lesson 
that delivers on its 5 input fields AND provides a YouTube query that finds the 
perfect supplementary video.

CORE MISSION:
Take the 5 input fields and produce:
1. A crystal-clear lesson (no fluff, exactly 3 MCQs)
2. A YouTube search query that finds a video matching the lesson's specific problem
3. A hands-on task and concise resource list that move the learner toward a portfolio-ready deliverable

THE 5-INPUT CONTRACT (ABSOLUTE):
For EACH input field, your output MUST explicitly deliver on its promise.

FAILURE CONDITIONS:
- Learner cannot answer MCQs correctly after reading → FAIL
- YouTube query would NOT retrieve a video solving the realWorldProblem → FAIL
- Lesson adds anything not supporting the 5 inputs → FAIL

OUTPUT SCHEMA (COMPLETE):

{
  "lesson": {
    
    "opening": {
      "theProblem": "Restate realWorldProblem in 2-3 sentences. Make learner feel the exact pain.",
      "thePromise": "Restate learnerTakeaway as 'By the end, you will [exact takeaway]'"
    },
    
    "coreExplanation": {
      "inPlainEnglish": "Explain using briefDescription as your guide. Max 4 sentences. No jargon without definition.",
      "example": "One concrete example showing the concept in action. Max 6 lines of code/pseudocode.",
      "whyItWorks": "Explain the example in 2 sentences. Connect back to plain English definition."
    },
    
    "theTrap": {
      "whatBeginnersThink": "One sentence: The wrong mental model from realWorldProblem.",
      "whyWrong": "One sentence: What breaks when they think this way.",
      "theFix": "One sentence: The correct way to think about it."
    },
    
    "verification": {
      "checkYourself": "Restate completionCriteria as 'You understand this when: [exact criteria]'",
      "quickTest": "One simple question: 'Without looking, what does [key term] mean?'"
    },
    
    "mcqs": [
      {
        "question": "Tests understanding of core concept",
        "options": ["correct", "trap based on realWorldProblem", "distractor", "wrong mental model"],
        "correctIndex": 0,
        "explanation": "1 sentence why correct. 1 sentence why wrong answers are tempting."
      }
    ],
    
    "closing": {
      "youCanNow": "Restate learnerTakeaway as 'You can now [takeaway] because [core reason]'",
      "whatsNext": "One sentence showing next logical topic"
    }
  },
  
  "youtubeQuery": {
    "query": "string"
  },

  "handsOnTask": {
    "title": "string",
    "instructions": "string",
    "deliverable": "string"
  },

  "resources": [
    { "title": "string", "type": "documentation|article|tool", "url": "string" }
  ]
}

MCQ CONSTRAINTS:
- EXACTLY 3 MCQs
- Each explanation: max 30 words
- At least 2 MCQs test application, not definition

YOUTUBE QUERY CONSTRAINTS (STRICT):

The query MUST:
1. Be 6-12 words
2. Include the EXACT lesson title
3. Include the SPECIFIC problem from realWorldProblem (not generic)
4. Include ONE of these depth signals: "explained", "fix", "solve", "tutorial", "walkthrough"
5. Include ONE language signal: "English" or "Hindi"

The query MUST follow ONE of these patterns:
- "[lesson title] [realWorldProblem in 2-3 words] explained English"
- "How to fix [realWorldProblem short version] [lesson title] tutorial"
- "[lesson title] solve [specific problem] step by step English"

FORBIDDEN in query:
- Vague words: "introduction", "basics", "overview"
- Filler: "please", "best", "top", "video for"

SELF-CHECK FOR YOUTUBE QUERY:
[ ] Would this query find a video that solves the realWorldProblem?
[ ] Does it include the lesson title exactly?
[ ] Is it 6-12 words?
[ ] Would Abdul Bari or NeetCode level video appear?

LENGTH CONSTRAINTS:
- Total output: 1800-3000 characters
- No sentence longer than 20 words

FINAL SELF-CHECK:
[ ] Did I explicitly address all 5 inputs?
[ ] Can learner answer all 3 MCQs after reading once?
[ ] Does YouTube query directly match realWorldProblem?

If ANY fail → REGENERATE.

`;



const generateJsonFromLLM = async (
  SYSTEM_PROMPT,
  USER_PROMPT,
  maxTokens,
  retries = 3,
) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const startedAt = Date.now();
      const model = attempt === retries && process.env.GROQ_FALLBACK_MODEL
        ? process.env.GROQ_FALLBACK_MODEL
        : process.env.GROQ_PRIMARY_MODEL || "llama-3.1-8b-instant";
      const response = await groq.chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: USER_PROMPT,
          },
        ],
      });

      const rawContent = response?.choices?.[0]?.message?.content?.trim();

      if (!rawContent) {
        throw new Error("Empty response from LLM");
      }

      let parsed;

      try {
        parsed = JSON.parse(rawContent);
      } catch (parseError) {
        console.error("Failed JSON:");
        console.error(rawContent);
        throw new Error(`JSON parse failed: ${parseError.message}`);
      }

      assertSafeContent(parsed);
      await recordUsage({
        feature: "json_generation", provider: "groq", model,
        inputTokens: response.usage?.prompt_tokens || 0, outputTokens: response.usage?.completion_tokens || 0,
        latencyMs: Date.now() - startedAt, success: true,
      });
      return parsed;
    } catch (err) {
      lastError = err;

      const isRateLimit = err?.status === 429;

      const isServerError = err?.status >= 500 && err?.status < 600;

      const isNetworkError = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNREFUSED",
        "ENOTFOUND",
      ].includes(err?.code);

      const isJsonError = err?.message?.toLowerCase()?.includes("json");

      const shouldRetry =
        isRateLimit || isServerError || isNetworkError || isJsonError;

      if (attempt < retries && shouldRetry) {
        const delay =
          Math.pow(2, attempt - 1) * 1000 + Math.floor(Math.random() * 1000);

        console.warn(`[LLM RETRY ${attempt}/${retries}] ${err.message}`);

        await new Promise((resolve) => setTimeout(resolve, delay));

        continue;
      }

      await recordUsage({ feature: "json_generation", provider: "groq", model: process.env.GROQ_PRIMARY_MODEL || "llama-3.1-8b-instant", success: false, error: err.message });
      throw err;
    }
  }

  throw lastError;
};



const generateTextFromLLM = async ({ prompt, maxTokens }) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant and a translator.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: maxTokens,
  });

  const raw = response?.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from LLM");
  }

  return raw.trim();
};



const generateTopicAndDesciptionService = async ({ prompt }) => {
  // Wait—generateTopicAndDesciption probably should use intent generation? Let's just keep it as is for now but fix the call!
  return await generateJsonFromLLM(
    intent_generation_system_prompt,
    prompt,
    300,
  );
};



const generateOutlineService = async (prompt) => {
  if (!prompt || (typeof prompt === "string" && prompt.trim().length === 0)) {
    throw new Error("Prompt is required for course outline generation");
  }

  let userPrompt;
  if (typeof prompt === "object" && prompt.prompt) {
    userPrompt = prompt.prompt;
  } else if (typeof prompt === "string") {
    userPrompt = prompt;
  } else {
    // If prompt is an intent object
    userPrompt = `Topic: ${prompt.topic}. Goal: ${prompt.goal || "Master the subject"}. Level: ${prompt.level || "Beginner"}. Focus Areas: ${prompt.focusAreas?.join(", ") || "Comprehensive"}`;
  }

  // Replace {{prompt}} placeholder with actual prompt
  const course_outline_generation_user_prompt = `
Generate a "best-in-class" course outline for the following topic:

**Context on top of you have to create a Course Outline**: ${userPrompt}

Now, execute the generation using the "Curriculum Architect Pro" system prompt above. Apply all pedagogical constraints, quality gates, and the extended JSON schema strictly. Output ONLY the valid JSON, nothing else.
`.trim();

  return generateJsonFromLLM(
    course_outline_generation_system_prompt,
    course_outline_generation_user_prompt,
    3800,
  );
};



const generateLessonService = async (lesson) => {

  const lesson_generation_user_prompt = `
  
  Generate a lesson using the system prompt above.

INPUT:
{
  "title": "${lesson.title}",
  "realWorldProblem": "${lesson.realWorldProblem}",
  "learnerTakeaway": "${lesson.learnerTakeaway}",
  "completionCriteria": "${lesson.completionCriteria}",
  "briefDescription": "${lesson.briefDescription}"
  ,"estimatedMinutes": ${lesson.estimatedMinutes || 30}
  ,"skillTags": ${JSON.stringify(lesson.skillTags || [])}
  ,"handsOnTask": ${JSON.stringify(lesson.handsOnTask || null)}
}

RULES REMINDER:
- Exactly 3 MCQs
- Address all 5 inputs explicitly
- No fluff, no extra sections
- Output only valid JSON

Generate now.
  `;




  const response = await generateJsonFromLLM(lesson_generation_system_prompt, lesson_generation_user_prompt, 3000);
  return validateLesson(response.lesson || response);
};

const generateTutorResponse = async ({ course, lesson, message, history, retrieval }) => {
  const system = `You are a concise tutor. Stay within the current lesson and course. Use only the supplied context; say when context is insufficient. Return JSON with answer and followUpQuiz (one MCQ with question, options, answer).`;
  const prompt = JSON.stringify({
    course: course.title, lesson: lesson.title, lessonContent: lesson.content,
    question: message, previousMessages: history.map(({ role, content }) => ({ role, content })),
    retrievedSources: retrieval.context,
  });
  return generateJsonFromLLM(system, prompt, 900);
};



const generateYouTubeQueryService = async (prompt) => {
  return generateJsonFromLLM(
    prompt,
    "Generate the YouTube search query as per the instructions above.",
    200,
  );
};

const generateHinglishService = async (prompt) => {
  return generateTextFromLLM({ prompt, maxTokens: 4500 });
};



const intentGenerationService = async (user_prompt) => {
  const actualPrompt =
    typeof user_prompt === "object" ? user_prompt.prompt : user_prompt;
  const intent_generation_user_prompt = `
Analyze the following learning request and extract the structured learning intent.

Learning Request:
${actualPrompt}
            `.trim();

  return generateJsonFromLLM(
    intent_generation_system_prompt,
    intent_generation_user_prompt,
    800,
  );
};

module.exports = {
  generateOutlineService,
  generateLessonService,
  generateTopicAndDesciptionService,
  generateYouTubeQueryService,
  generateHinglishService,
  intentGenerationService,
  generateTutorResponse,
};
