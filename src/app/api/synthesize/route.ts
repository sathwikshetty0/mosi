import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Allow enough time for transcription + summarization
export const maxDuration = 300;

// ----- ELEVENLABS TRANSCRIPTION -----
async function transcribeWithElevenLabs(audioBuffer: Buffer): Promise<string> {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured in .env.local');
  }

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' });
  formData.append('file', blob, 'recording.webm');
  formData.append('model_id', 'scribe_v1');

  console.log('Transcribing with ElevenLabs Scribe...');
  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs Transcription failed: ${errorText}`);
  }

  const data = await response.json();
  console.log('Transcription complete. Language:', data.language_code || 'auto');
  return data.text || '';
}

// ----- NVIDIA SUMMARY (using a faster model) -----
async function summarizeWithNvidia(
  transcript: string,
  stakeholder: any,
  opportunities: any[]
): Promise<string> {
  if (!process.env.NVIDIA_API_KEY) {
    console.log('No NVIDIA_API_KEY — skipping summary generation.');
    return '';
  }

  const nvidia = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  const stakeholderContext = stakeholder?.name
    ? `Stakeholder: ${stakeholder.name}, Role: ${stakeholder.role || 'N/A'}, Company: ${stakeholder.company || 'N/A'}, Sector: ${stakeholder.sector || 'N/A'}`
    : 'Stakeholder details not yet provided.';

  const opportunitiesContext = opportunities.length > 0
    ? `\n\nKey moments captured during interview:\n${opportunities.map((o, i) => `${i + 1}. [${o.tag}] ${o.title}${o.description ? ': ' + o.description : ''}`).join('\n')}`
    : '';

  const systemPrompt = `You are an expert business analyst creating executive meeting summaries.
The transcript may be in any language (Kannada, Hindi, Tamil, English, etc.) — ALWAYS produce the summary in English.

Structure the summary with these sections:

## Meeting Overview
Who was interviewed, their role, company context. 1-2 sentences.

## Key Discussion Points
- Main topics covered as bullet points (5-8 points)

## Opportunities Identified
Map insights to the CEED framework:
- **Core**: Issues with their current product/service
- **Efficiency**: Process bottlenecks, manual work, wasted resources
- **Expansion**: New markets, untapped segments, partnership opportunities
- **Disrupt**: Industry shifts, tech disruptions, bold pivots

## Action Items & Next Steps
Concrete follow-ups and recommendations.

## Notable Quotes
2-3 impactful statements from the stakeholder (translated to English if needed).

Keep it concise, professional, and actionable. Max 500 words.`;

  const userPrompt = `${stakeholderContext}${opportunitiesContext}

--- INTERVIEW TRANSCRIPT ---
${transcript.slice(0, 12000)}`;

  console.log('Generating summary with NVIDIA...');

  try {
    const completion = await nvidia.chat.completions.create({
      model: 'nvidia/llama-3.3-nemotron-super-49b-v1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      top_p: 0.9,
      max_tokens: 1500,
    });

    const summary = completion.choices[0]?.message?.content || '';
    console.log('Summary generated successfully.');
    return summary;
  } catch (err: any) {
    console.error('NVIDIA summary generation failed:', err.message);
    // Return empty — UI will show placeholder, user can retry or type manually
    return '';
  }
}

// ----- MAIN ROUTE -----
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let transcriptText = '';
    let opportunities: any[] = [];
    let stakeholder: any = {};

    // Parse request based on content type
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const rawOpp = formData.get('opportunities') as string;
      const rawStakeholder = formData.get('stakeholder') as string;

      opportunities = rawOpp ? JSON.parse(rawOpp) : [];
      stakeholder = rawStakeholder ? JSON.parse(rawStakeholder) : {};

      const audioFile = formData.get('audioFile') as File | null;

      if (audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        transcriptText = await transcribeWithElevenLabs(Buffer.from(arrayBuffer));
      }
    } else {
      const body = await req.json();
      opportunities = body.opportunities || [];
      stakeholder = body.stakeholder || {};
      const recordingUrl = body.recordingUrl;

      if (recordingUrl) {
        let arrayBuffer: ArrayBuffer | null = null;

        try {
          const audioResponse = await fetch(recordingUrl);
          if (!audioResponse.ok) throw new Error('Bad status');
          arrayBuffer = await audioResponse.arrayBuffer();
        } catch (primaryErr: any) {
          const fallbackUrl = recordingUrl.includes('127.0.0.1')
            ? recordingUrl.replace('127.0.0.1', 'localhost')
            : recordingUrl.replace('localhost', '127.0.0.1');

          const fallbackResponse = await fetch(fallbackUrl);
          if (!fallbackResponse.ok) throw new Error('Audio fetch failed.');
          arrayBuffer = await fallbackResponse.arrayBuffer();
        }

        if (arrayBuffer) {
          transcriptText = await transcribeWithElevenLabs(Buffer.from(arrayBuffer));
        }
      }
    }

    if (!transcriptText) {
      return NextResponse.json({
        transcript: '',
        summary: '',
        error: 'No audio content provided or transcription returned empty.',
      });
    }

    // Generate summary with NVIDIA (non-blocking — if it fails, we still return transcript)
    const summary = await summarizeWithNvidia(transcriptText, stakeholder, opportunities);

    return NextResponse.json({
      transcript: transcriptText,
      summary: summary,
    });
  } catch (error: any) {
    console.error('Synthesize API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process audio.' },
      { status: 500 }
    );
  }
}
