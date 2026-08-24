const { sendEmail } = require("../utils/email");

router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'thesakuracosmos@gmail.com',
      subject: 'SkillForge Test',
      html: '<h1>Email working 🚀</h1>',
      text: 'Email working',
    });

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});