import 'dotenv/config';
import app from './app';

if (!process.env.DATABASE_URL) {
  console.error('Missing required env: DATABASE_URL. Copia .env.example in .env e imposta i valori.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});