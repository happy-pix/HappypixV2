import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

const templates = await mongoose.connection.collection('orgaitemplates').find({}).toArray();
console.log('Total OrgAiTemplates in DB:', templates.length);
templates.forEach(t => console.log(' -', t._id, '|', t.name, '| orgId:', t.organizationId, '| layout:', t.layout?.code || t.layoutCode));

await mongoose.disconnect();
