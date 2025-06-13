import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question } = req.body;

    const dataDir = path.resolve('./data');
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

    const allDocs = files.flatMap(file => {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      return parsed.map((doc: any) => ({
        source: file,
        id: doc.id,
        summary: doc.summary,
        quotes: doc.quotes,
      }));
    });

    const context = allDocs.map(doc =>
      `File: ${doc.source} | ID: ${doc.id}\nSummary: ${doc.summary}\nQuotes:\n${doc.quotes.join('\n')}`
    ).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an assistant answering questions using the provided evidence documents.' },
        { role: 'user', content: `QUESTION: ${question}\n\nDOCUMENT CONTEXT:\n${context}` }
      ]
    });

    const answer = completion.choices[0]?.message?.content || 'No answer generated.';
    res.status(200).json({ answer });
  } catch (err: any) {
    console.error('API ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
}
