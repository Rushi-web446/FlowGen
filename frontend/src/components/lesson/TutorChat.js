import { useState } from "react";
import api from "../../api/axios";

const TutorChat = ({ courseId, moduleId, lesson }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!question.trim() || !moduleId || !lesson?._id) return;
    const text = question.trim();
    setMessages((items) => [...items, { role: "user", content: text }]);
    setQuestion(""); setLoading(true);
    try {
      const { data } = await api.post("/learning/tutor", { courseId, moduleId, lessonId: lesson._id, message: text });
      setMessages((items) => [...items, { role: "assistant", content: data.message.content, quiz: data.message.followUpQuiz, citations: data.citations }]);
    } catch (error) {
      setMessages((items) => [...items, { role: "assistant", content: "I couldn't answer that right now. Please try again." }]);
    } finally { setLoading(false); }
  };

  return <section className="lesson-section">
    <h3>Ask the AI tutor</h3>
    {messages.map((item, index) => <div key={index} className="lesson-intro-box"><strong>{item.role === "user" ? "You" : "Tutor"}:</strong> {item.content}
      {item.quiz && <p><strong>Check-in:</strong> {item.quiz.question}</p>}
      {item.citations?.length > 0 && <p>{item.citations.map((citation) => citation.url ? <a key={citation.sourceId} href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a> : citation.title).reduce((prev, curr) => [prev, ", ", curr])}</p>}
    </div>)}
    <form onSubmit={submit} style={{ display: "flex", gap: "0.5rem" }}>
      <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this lesson" style={{ flex: 1 }} />
      <button type="submit" disabled={loading}>{loading ? "Thinking..." : "Ask"}</button>
    </form>
  </section>;
};

export default TutorChat;
