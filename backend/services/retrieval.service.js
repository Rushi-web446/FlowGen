const KnowledgeSource = require("../models/knowledge-source");
const { generateEmbedding } = require("./ai_embeding_service");

const toCitation = (source) => ({
  sourceId: source._id,
  title: source.title,
  url: source.url || null,
});

const retrieveKnowledge = async ({ query, userId, limit = 5 }) => {
  const filter = { $or: [{ scope: "CURATED" }, { scope: "USER_NOTE", userId }] };
  const sources = await KnowledgeSource.find(filter).select("title url content tags embedding").limit(100).lean();
  if (!sources.length) return { context: "", citations: [] };

  // Atlas vector search is optional; this lexical fallback keeps retrieval available locally.
  const terms = query.toLowerCase().split(/\W+/).filter((term) => term.length > 2);
  const ranked = sources.map((source) => ({
    source,
    score: terms.reduce((score, term) => score + ((source.title + " " + source.content + " " + source.tags.join(" ")).toLowerCase().includes(term) ? 1 : 0), 0),
  })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, limit);

  return {
    context: ranked.map(({ source }) => `[${source.title}]\n${source.content.slice(0, 1200)}`).join("\n\n"),
    citations: ranked.map(({ source }) => toCitation(source)),
  };
};

const saveUserNote = async ({ userId, title, content, tags = [] }) => {
  const embedding = await generateEmbedding(`${title}\n${content}`);
  return KnowledgeSource.create({ userId, scope: "USER_NOTE", title, content, tags, embedding });
};

module.exports = { retrieveKnowledge, saveUserNote, toCitation };
