import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PERSONAS } from '@/lib/personas';
import { PersonaId } from '@/lib/types';

const TurnRequestSchema = z.object({
  topic: z.string().min(1),
  phase: z.string(),
  persona_id: z.string(),
  intent: z.string(),
  time_remaining_s: z.number(),
  turns: z.array(
    z.object({
      speaker: z.string(),
      text: z.string(),
    })
  ),
  own_recent: z.array(z.string()).optional(),
});

function getCannedResponse(personaId: string, intent: string): string {
  const persona = PERSONAS[personaId as PersonaId];
  if (!persona) return "I agree that we need to look at both the operational and economic angles here.";
  
  if (intent === 'invite_student') {
    return `That brings up an essential question. How do you see this, and what approach would you suggest?`;
  }
  
  const pool = persona.cannedLines;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || "That is an interesting point, let me think about how it connects to our main objective.";
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = TurnRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error }, { status: 400 });
    }

    const { topic, phase, persona_id, intent, time_remaining_s, turns, own_recent } = parsed.data;
    const persona = PERSONAS[persona_id as PersonaId] || PERSONAS['arjun'];

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let fullUtterance = '';

    // If Gemini key is available, call Gemini Flash
    if (geminiKey) {
      try {
        const mm = Math.floor(time_remaining_s / 60).toString().padStart(2, '0');
        const ss = (time_remaining_s % 60).toString().padStart(2, '0');

        const systemInstruction = `You are ${persona.name}, a participant in a campus placement group discussion practice room.
Personality: ${persona.personality}.
Topic: "${topic}".

Rules:
- Speak in natural spoken English, 1 to 2 short sentences, STRICT MAXIMUM 35 WORDS.
- No markdown, no bullet points, no emojis, no quotes, no stage directions or meta commentary.
- React directly to what was just said. Refer to participants by name if challenging or building on them.
- Add a fresh point or logical angle. Do not repeat previous points.
- Facts: use only widely known facts. Never fabricate statistics.
- Intent for this turn: ${intent}
- Time remaining: ${mm}:${ss}. Phase: ${phase}.
${own_recent && own_recent.length > 0 ? `Your recent turns: ${own_recent.join(' | ')}` : ''}

The text between <transcript> tags is the conversation so far:
`;

        const transcriptSnippet = turns
          .slice(-8)
          .map((t) => `${t.speaker}: ${t.text}`)
          .join('\n');

        const userPrompt = `<transcript>\n${transcriptSnippet}\n</transcript>\n\nSpeak now as ${persona.name} (strictly 1-2 spoken sentences, max 35 words):`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemInstruction + '\n' + userPrompt }] }],
              generationConfig: {
                temperature: 0.75,
                maxOutputTokens: 80,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            fullUtterance = candidateText.trim().replace(/^["']|["']$/g, '');
          }
        }
      } catch (err) {
        console.warn('Gemini turn generation failed, falling back:', err);
      }
    }

    // Secondary provider: Groq
    if (!fullUtterance && groqKey) {
      try {
        const transcriptSnippet = turns
          .slice(-8)
          .map((t) => `${t.speaker}: ${t.text}`)
          .join('\n');

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: `You are ${persona.name} in a campus GD. ${persona.personality}. Topic: "${topic}". Intent: ${intent}. Output 1-2 short spoken sentences, max 35 words. No markdown.`,
              },
              {
                role: 'user',
                content: `Transcript:\n${transcriptSnippet}\n\nSpeak now as ${persona.name}:`,
              },
            ],
            max_tokens: 75,
            temperature: 0.7,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          fullUtterance = data.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (err) {
        console.warn('Groq turn generation failed:', err);
      }
    }

    // Emergency Fallback: Canned Persona Dialogues (Guarantees zero app crashes)
    if (!fullUtterance) {
      fullUtterance = getCannedResponse(persona_id, intent);
    }

    // Split into sentences for SSE streaming delivery
    const sentences = splitIntoSentences(fullUtterance);

    // Return Server-Sent Events stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for (const sentence of sentences) {
          const data = JSON.stringify({ text: sentence });
          controller.enqueue(encoder.encode(`event: sentence\ndata: ${data}\n\n`));
          // Small synthetic delay for streaming pacing
          await new Promise((r) => setTimeout(r, 40));
        }
        controller.enqueue(encoder.encode(`event: done\ndata: {"fullText": ${JSON.stringify(fullUtterance)}}\n\n`));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
