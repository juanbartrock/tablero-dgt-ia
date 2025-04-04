import { NextResponse } from 'next/server';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const imapConfig = {
  user: process.env.ZIMBRA_EMAIL || '',
  password: process.env.ZIMBRA_PASSWORD || '',
  host: process.env.ZIMBRA_HOST || '',
  port: parseInt(process.env.ZIMBRA_PORT || '993'),
  tls: true,
  tlsOptions: { 
    rejectUnauthorized: false
  },
  connTimeout: 30000,
  authTimeout: 30000,
  debug: function(info: any) {
    console.log('Debug IMAP:', info);
  },
  retries: 3,
  retryDelay: 5000
};

export async function POST(): Promise<Response> {
  try {
    // Verificar que las configuraciones necesarias existan
    if (!process.env.ZIMBRA_EMAIL || !process.env.ZIMBRA_PASSWORD || !process.env.ZIMBRA_HOST) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno para la configuración de IMAP' },
        { status: 500 }
      );
    }
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Falta la clave API de OpenAI' },
        { status: 500 }
      );
    }
    
    console.log('Intentando conexión IMAP con:', {
      host: imapConfig.host,
      port: imapConfig.port,
      user: imapConfig.user,
      tls: imapConfig.tls
    });

    const imap = new Imap(imapConfig);
    
    return new Promise<Response>((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err: Error | null, box: any) => {
          if (err) {
            imap.end();
            reject(new Error('Error al abrir el buzón'));
            return;
          }

          // Buscar correos del día actual
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const searchCriteria = ['SINCE', today];
          
          imap.search(searchCriteria, (err: Error | null, results: number[]) => {
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

            results.forEach((uid: number) => {
              const fetch = imap.fetch(uid, { bodies: '' });
              
              fetch.on('message', (msg: any) => {
                msg.on('body', (stream: any) => {
                  simpleParser(stream, async (err: Error | null, parsed: any) => {
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

      imap.once('error', (err: Error) => {
        console.error('Error detallado de conexión IMAP:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
          connectionDetails: {
            host: imapConfig.host,
            port: imapConfig.port,
            user: imapConfig.user,
            ssl: imapConfig.tls
          }
        });
        reject(new Error(`Error de conexión IMAP: ${err.message}`));
      });

      imap.once('end', () => {
        console.log('Conexión IMAP finalizada');
      });

      try {
        console.log('Ejecutando imap.connect()...');
        imap.connect();
        console.log('imap.connect() ejecutado sin errores');
      } catch (err) {
        console.error('Error al intentar conectar con IMAP:', {
          error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
          config: {
            host: imapConfig.host,
            port: imapConfig.port,
            ssl: imapConfig.tls
          }
        });
        reject(new Error(`Error al intentar conectar: ${err instanceof Error ? err.message : String(err)}`));
      }
    });
  } catch (error) {
    console.error('Error en la función POST:', error);
    return NextResponse.json(
      { error: 'Error interno en el servidor' },
      { status: 500 }
    );
  }
}