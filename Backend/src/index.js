require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env'
      : '.env.local',
});

const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/v1\n`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
