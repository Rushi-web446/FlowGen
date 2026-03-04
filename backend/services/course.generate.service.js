const Grok = require("groq-sdk").default;

const groq = new Grok({
  apiKey: process.env.GROQ_API_KEY,
});



const generateJsonFromLLM = async ({ prompt, maxTokens, retries = 3 }) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a strict JSON generator. Follow instructions exactly." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      const raw = response?.choices?.[0]?.message?.content;
      if (!raw) {
        throw new Error("Empty response from LLM");
      }

      return JSON.parse(raw.trim());
    } catch (err) {
      lastError = err;
      const isRateLimit = err.status === 429;
      const isJsonError = err.message.includes("JSON") || err.code === "json_validate_failed";

      if (i < retries - 1 && (isRateLimit || isJsonError)) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`[LLM RETRY] Attempt ${i + 1} failed. Retrying in ${Math.round(delay)}ms... Error: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};





const generateTextFromLLM = async ({ prompt, maxTokens }) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are a helpful assistant and a translator." },
      { role: "user", content: prompt }
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
  const data = await generateJsonFromLLM({ prompt, maxTokens: 250 });

  // Safety fallback if LLM misses the description or it's empty
  if (!data.description || data.description.trim() === "") {
    data.description = `I want to learn more about ${data.topicName || "this topic"} in depth.`;
  }

  // Ensure topicName isn't missing either
  if (!data.topicName || data.topicName.trim() === "") {
    data.topicName = "Custom Learning Course";
  }

  return data;
};




const generateOutlineService = async ({ prompt }) => {
  return generateJsonFromLLM({ prompt, maxTokens: 3800 });
};



const generateLessonService = async (prompt) => {
  return generateJsonFromLLM({ prompt, maxTokens: 4500 });
};



const generateYouTubeQueryService = async (prompt) => {
  return generateJsonFromLLM({ prompt, maxTokens: 200 });
};



const generateHinglishService = async (prompt) => {
  return generateTextFromLLM({ prompt, maxTokens: 4500 });
};



module.exports = {
  generateOutlineService,
  generateLessonService,
  generateTopicAndDesciptionService,
  generateYouTubeQueryService,
  generateHinglishService
};