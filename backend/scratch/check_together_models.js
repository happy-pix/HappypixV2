import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function getModels() {
  const apiKey = process.env.TOGETHER_API_KEY;
  if(!apiKey) {
    console.log("No API Key found");
    return;
  }
  const res = await fetch('https://api.together.xyz/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await res.json();
  if (Array.isArray(data)) {
     const imageModels = data.filter(m => m.type === 'image' || m.id.toLowerCase().includes('flux'));
     console.log("AVAILABLE IMAGE MODELS:");
     imageModels.forEach(m => console.log(m.id));
  } else {
     console.log("Error:", data);
  }
}
getModels();
