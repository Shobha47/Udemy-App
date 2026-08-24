const net = require('net');
const tls = require('tls');
const crypto = require('crypto'); // NEW: Required to compile secure structural body boundaries
require('dotenv').config();

function smtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  };
}

function encodeAddress(value) {
  return `<${String(value).replace(/[<>]/g, '')}>`;
}

// MODIFIED: Converted message factory to build out modern multi-part layout formats
function createMessage({ from, fromName, to, subject, text, html }) {
  const boundary = `----=_Part_${crypto.randomBytes(8).toString('hex')}`;
  
  const headers = [
    `From: ${fromName || process.env.SMTP_FROM_NAME} <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    text,
    '',
  ];

  // If rich custom layouts exist, map them seamlessly into separate partition nodes
  if (html) {
    headers.push(
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      html,
      ''
    );
  }

  headers.push(`--${boundary}--`);
  return headers.join('\r\n');
}

async function sendCommand(socket, command, expectedCodes) {
  if (command !== null) socket.write(`${command}\r\n`);

  return new Promise((resolve, reject) => {
    let response = '';

    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onData = (chunk) => {
      response += chunk.toString('utf8');
      const lines = response.trimEnd().split(/\r?\n/);
      const last = lines[lines.length - 1];

      console.log('SMTP RAW RESPONSE:', last); // 👈 ADD THIS

      if (!/^\d{3} /.test(last)) return;

      const code = Number(last.slice(0, 3));
      if (!expectedCodes.includes(code)) {
        cleanup();
        reject(new Error(`SMTP error ${code}: ${response}`));
        return;
      }

      cleanup();
      resolve(response);
    };

    socket.on('data', onData);
    socket.on('error', onError);
  });
}

function connectSmtp({ host, port }) {
  return new Promise((resolve, reject) => {
    const socket =
      port === 465
        ? tls.connect(port, host, { servername: host })
        : net.connect(port, host);

    socket.once('error', reject);
    socket.once('connect', () => resolve(socket));
  });
}

function upgradeToTls(socket, host) {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({
      socket,
      servername: host,
    });

    secureSocket.once('secureConnect', () => resolve(secureSocket));
    secureSocket.once('error', reject);
  });
}

// MODIFIED: Accepts the html parameter payload directly here
async function sendEmail({ to, subject, text, html }) {
  const config = smtpConfig();

  console.log('EMAIL CONFIG:', config); // 👈 PUT IT HERE

  if (!config.host || !config.user || !config.pass || !config.from) {
    console.log('SMTP is not configured. Terminal print fallback routing trace:');
    console.log(text);
    return;
  }

  let socket = await connectSmtp(config);

  try {
    await sendCommand(socket, null, [220]);
    console.log('CONNECTED OK');
    await sendCommand(socket, `EHLO ${config.host}`, [250]);
    console.log('EHLO OK');

    if (config.port !== 465) {
      await sendCommand(socket, 'STARTTLS', [220]);
      socket = await upgradeToTls(socket, config.host);
      await sendCommand(socket, `EHLO ${config.host}`, [250]);
    }

    await sendCommand(
      socket,
      `AUTH PLAIN ${Buffer.from(`\0${config.user}\0${config.pass}`).toString('base64')}`,
      [235]
    );
    await sendCommand(socket, `MAIL FROM:${encodeAddress(config.from)}`, [250]);
    await sendCommand(socket, `RCPT TO:${encodeAddress(to)}`, [250, 251]);
    await sendCommand(socket, 'DATA', [354]);
    
    // MODIFIED: Mapped HTML down straight to factory constructor layout configurations
    await sendCommand(
      socket,
      `${createMessage({ from: config.from, fromName: process.env.SMTP_FROM_NAME, to, subject, text, html })}\r\n.`,
      [250]
    );
    await sendCommand(socket, 'QUIT', [221]);
  } finally {
    socket.end();
  }
}

module.exports = { sendEmail };