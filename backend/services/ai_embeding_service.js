const { GoogleGenAI } =
  require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateEmbedding =
  async (text) => {

    try {

      if (!text) {
        throw new Error(
          "Text is required for embedding"
        );
      }

      const response =
        await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: text,
        });

      const embedding =
        response.embeddings[0].values;

      if (!embedding) {
        throw new Error(
          "Embedding generation failed"
        );
      }

      return embedding;

    } catch (error) {

      console.error(
        "Embedding Error:",
        error.message
      );

      throw error;
    }
};

module.exports = {
  generateEmbedding,
};