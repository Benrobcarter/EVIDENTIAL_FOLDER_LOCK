import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleAsk = async () => {
    const res = await fetch('/api/custom-notebook-lm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>NotebookLM-Style Evidence Chat</h1>
      <textarea
        rows={4}
        cols={60}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
      />
      <br />
      <button onClick={handleAsk}>Ask</button>
      <pre style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>{answer}</pre>
    </main>
  );
}
