import OpenAI from 'openai';
import { SIDONNAISUUS_PDF_CONTENT } from '@/utils/pdfContent';

export const runtime = 'edge';

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const customEncode = (text: string) => encoder.encode(`data: ${text}\n\n`);

  try {
    const body = await req.json();
    console.log('API route received body:', body);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!body.messages || !body.field) {
      throw new Error('Missing required fields');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Format previously filled fields for context
    const filledFieldsContext = body.formData ?
      Object.entries(body.formData)
        .filter(([key, value]) => value && key !== body.field.id)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      : '';

    const openaiStream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant guiding users in filling out a sidonnaisuusilmoitus (declaration of interests) form.

Here is the official documentation about sidonnaisuusilmoitus:

${SIDONNAISUUS_PDF_CONTENT}

${filledFieldsContext ? `\nPreviously filled fields in the form:\n${filledFieldsContext}` : ''}

Always use proper spacing and punctuation in your responses.`
        },
        {
          role: 'system',
          content: `You are helping with the ${body.field.label} field. ${body.field.instructions}
When providing suggestions, format them as:
SUGGESTION: [your suggested text]
You can provide multiple suggestions by using SUGGESTION: multiple times.

Remember to:
- Keep suggestions consistent with the official requirements
- Include all necessary details as specified in the documentation
- Maintain professional tone
- Provide practical examples that follow the documentation guidelines
- Consider previously filled fields when making suggestions${filledFieldsContext ? ' to maintain consistency' : ''}`
        },
        ...body.messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    });

    (async () => {
      try {
        let buffer = '';
        for await (const part of openaiStream) {
          const text = part.choices[0]?.delta?.content || '';
          if (text) {
            buffer += text;

            if (text.includes(' ') || text.includes('.') || text.includes('!') || text.includes('?')) {
              await writer.write(customEncode(buffer));
              buffer = '';
            }
          }
        }
        if (buffer) {
          await writer.write(customEncode(buffer));
        }
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.write(customEncode('Error during streaming. Please try again.'));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }
}
