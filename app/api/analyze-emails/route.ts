import { NextResponse } from 'next/server';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const imapConfig = {
  user: process.env.ZIMBRA_EMAIL,
  password: process.env.ZIMBRA_PASSWORD,
  host: process.env.ZIMBRA_HOST,
  port: parseInt(process.env.ZIMBRA_PORT || '993'),
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

export async function POST() {
  try {
    const imap = new Imap(imapConfig);
    
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            imap.end();
            reject(new Error('Error al abrir el buzón'));
            return;
          }

          // Buscar correos del día actual
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const searchCriteria = ['SINCE', today];
          
          imap.search(searchCriteria, (err, results) => {
            if (err) {
              imap.end();
              reject(new Error('Error al buscar correos'));
              return;
            }

            if (results.length === 0) {
              imap.end();
              resolve(NextResponse.json({ summary: 'No hay correos nuevos hoy.' }));
              return;
            }

            const emails: any[] = [];
            let processed = 0;

            results.forEach((uid) => {
              const fetch = imap.fetch(uid, { bodies: '' });
              
              fetch.on('message', (msg) => {
                msg.on('body', (stream) => {
                  simpleParser(stream, async (err, parsed) => {
                    if (err) {
                      console.error('Error al parsear correo:', err);
                      return;
                    }

                    emails.push({
                      from: parsed.from?.text || 'Desconocido',
                      subject: parsed.subject || 'Sin asunto',
                      date: parsed.date,
                      text: parsed.text || ''
                    });

                    processed++;
                    
                    if (processed === results.length) {
                      imap.end();
                      
                      try {
                        // Generar resumen con GPT
                        const prompt = `Analiza los siguientes correos recibidos hoy y genera un resumen conciso:
                        ${emails.map(email => `
                        De: ${email.from}
                        Asunto: ${email.subject}
                        Contenido: ${email.text}
                        `).join('\n')}`;

                        const completion = await openai.chat.completions.create({
                          messages: [{ role: "user", content: prompt }],
                          model: "gpt-3.5-turbo",
                        });

                        const summary = completion.choices[0].message.content;
                        
                        resolve(NextResponse.json({ summary }));
                      } catch (error) {
                        reject(new Error('Error al generar resumen con GPT'));
                      }
                    }
                  });
                });
              });
            });
          });
        });
      });

      imap.once('error', (err) => {
        reject(new Error('Error de conexión IMAP'));
      });

      imap.connect();
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar los correos' },
      { status: 500 }
    );
  }
} 