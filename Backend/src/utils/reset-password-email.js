function createMessage({ from, fromName, to, subject, text, html }) {
  const boundary = `----=_Part_${crypto.randomBytes(8).toString('hex')}`;
  
  const headers = [
    `From: ${fromName} <${from}>`,
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

async function sendResetPasswordEmail({ to, subject, text, html }) {
  const config = smtpConfig();

  if (!config.host || !config.user || !config.pass || !config.from) {
    console.log('SMTP is not configured. Fallback reset content trace console print:');
    console.log(text);
    return;
  }

  let socket = await connectSmtp(config);

  try {
    await sendCommand(socket, null, [220]);
    await sendCommand(socket, `EHLO ${config.host}`, [250]);

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
    
    // Injecting the multi-part alternative handler pipeline parameter here
    await sendCommand(
      socket,
      `${createMessage({ from: config.from, fromName: process.env.SMTP_FROM_NAME || 'SmartSkills India', to, subject, text, html })}\r\n.`,
      [250]
    );
    await sendCommand(socket, 'QUIT', [221]);
  } finally {
    socket.end();
  }
}