import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function getModels() {
  const apiKey = process.env.GROQ_API_KEY;
  if(!apiKey) {
    console.log("No API Key found");
    return;
  }
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await res.json();
  if (data.data) {
     console.log("AVAILABLE MODELS:", data.data.map(m => m.id).join(', '));
  } else {
     console.log("Error:", data);
  }
}
getModels();
