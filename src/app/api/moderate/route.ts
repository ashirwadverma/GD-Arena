import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ModerateRequestSchema = z.object({
  topic: z.string().min(3),
});

const INAPPROPRIATE_PATTERNS = [
  /hate\s*speech/i,
  /terroris/i,
  /child\s*abuse/i,
  /suicide/i,
  /bomb\s*making/i,
  /violence\s*incitement/i,
];

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ModerateRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ allowed: false, reason: 'Topic is too short or invalid.' }, { status: 400 });
    }

    const { topic } = parsed.data;

    // Check prohibited patterns
    for (const pattern of INAPPROPRIATE_PATTERNS) {
      if (pattern.test(topic)) {
        return NextResponse.json({
          allowed: false,
          reason: 'This topic violates safety guidelines. Please choose a professional placement GD topic.',
        });
      }
    }

    return NextResponse.json({
      allowed: true,
      reason: 'Topic approved for discussion practice.',
    });
  } catch (error) {
    return NextResponse.json({ allowed: true, reason: 'Default approved' });
  }
}
