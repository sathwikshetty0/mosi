import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Export config for Next.js to parse the body natively
export const maxDuration = 300; // Allow enough time for transcription and GPT generation

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured in .env.local' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const contentType = req.headers.get('content-type') || '';
    
    let transcriptText = '';
    let opportunities: any[] = [];
    let stakeholder: any = {};

    if (contentType.includes('multipart/form-data')) {
      console.log('Receiving direct multipart/form-data upload...');
      const formData = await req.formData();
      const rawOpp = formData.get('opportunities') as string;
      const rawStakeholder = formData.get('stakeholder') as string;
      
      opportunities = rawOpp ? JSON.parse(rawOpp) : [];
      stakeholder = rawStakeholder ? JSON.parse(rawStakeholder) : {};
      
      const audioFile = formData.get('audioFile') as File | null;
      
      if (audioFile) {
        console.log('Transcribing local File object directly with Whisper...');
        try {
          const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
          });
          transcriptText = transcription.text;
          console.log('Transcription successful.');
        } catch (aiErr: any) {
          throw new Error(`OpenAI Transcription failed: ${aiErr.message}`);
        }
      }
    } else {
      console.log('Receiving JSON request...');
      const body = await req.json();
      opportunities = body.opportunities || [];
      stakeholder = body.stakeholder || {};
      const recordingUrl = body.recordingUrl;
      
      // 1. Fetch & Transcribe the Audio from URL
      if (recordingUrl) {
        if (recordingUrl.startsWith('blob:')) {
           throw new Error('Blob URL sent as JSON! It must be sent as multipart/form-data. This is a frontend logic error.');
        }
        
        let fetchUrl = recordingUrl;
        let arrayBuffer: ArrayBuffer | null = null;
        
        console.log('Fetching audio from URL:', fetchUrl);
        
        try {
          const audioResponse = await fetch(fetchUrl);
          if (!audioResponse.ok) throw new Error('Bad status');
          arrayBuffer = await audioResponse.arrayBuffer();
        } catch (primaryErr: any) {
          console.log('Primary fetch failed, attempting Docker fallback routing...', primaryErr.message);
          const fallbackUrl = fetchUrl.includes('127.0.0.1') 
            ? fetchUrl.replace('127.0.0.1', 'localhost') 
            : fetchUrl.replace('localhost', '127.0.0.1');
            
          const fallbackResponse = await fetch(fallbackUrl);
          if (!fallbackResponse.ok) throw new Error('Fallback URL also failed.');
          arrayBuffer = await fallbackResponse.arrayBuffer();
        }

        if (!arrayBuffer) {
           throw new Error('Failed to download audio from the provided URL.');
        }
        
        const buffer = Buffer.from(arrayBuffer);
        
        try {
          const file = await OpenAI.toFile(buffer, 'recording.webm', { type: 'audio/webm' });

          console.log('Transcribing with Whisper...');
          const transcription = await openai.audio.transcriptions.create({
            file,
            model: 'whisper-1',
          });
          
          transcriptText = transcription.text;
          console.log('Transcription successful.');
        } catch (aiErr: any) {
          console.error('OpenAI Error while processing audio:', aiErr);
          throw new Error(`OpenAI Transcription failed: ${aiErr.message}`);
        }
      }
    }

    // 2. Synthesize using GPT-4o-mini
    console.log('Synthesizing summary...');
    const prompt = `
You are an expert Executive Research Analyst reviewing a stakeholder interview.
Stakeholder Profile: ${JSON.stringify(stakeholder)}
Logs Captured during the interview: ${JSON.stringify(opportunities)}

${transcriptText ? `Raw Audio Transcript: """\n${transcriptText}\n"""\n` : ''}

Based on the logs ${transcriptText ? 'and the transcript' : ''}, draft a highly professional, concise, and insightful Executive Synthesis (3-4 readable paragraphs max). Do not use markdown headers, just plain text paragraphs. Do not mention that you read a JSON or transcript, just speak as the analyst who conducted the interview.

Focus heavily on:
1. The stakeholder's core problem, constraints, and operational context.
2. The specific opportunities/logs identified and whether they present immediate commercial value.
3. Recommended implementation next steps based on the findings.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content || 'Synthesis generation failed.';
    console.log('Synthesis successful.');

    return NextResponse.json({ summary, transcript: transcriptText });

  } catch (error: any) {
    console.error('Synthesis API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to synthesize session.' }, { status: 500 });
  }
}
