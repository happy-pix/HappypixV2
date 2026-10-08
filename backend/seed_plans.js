// Issue #4: subscription plans must exist in CRM — Trial, Starter, Basic,
// Professional, Business, Enterprise/custom. Idempotent: safe to re-run.
//
//   node seed_plans.js
//
// Also back-fills every organization's cached limit fields from its plan so
// plan-limit enforcement never falls back to hard-coded numbers (#5).

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SubscriptionPlan from './models/SubscriptionPlan.js';
import Organization from './models/Organization.js';
import { DEFAULT_PLAN_CATALOG, resolvePlan, trialEndDate } from './services/planService.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('🌱 Seeding subscription plans…');

  for (const plan of DEFAULT_PLAN_CATALOG) {
    const existing = await SubscriptionPlan.findOne({ key: plan.key });
    if (existing) {
      existing.name = plan.name;
      existing.description = plan.description;
      existing.price = plan.price ?? 0;
      existing.devices = plan.devices;
      existing.events = plan.events;
      existing.durationMonths = plan.durationMonths;
      existing.durationLabel = plan.durationLabel;
      existing.active = plan.active;
      await existing.save();
      console.log(`   ↻ updated ${plan.key}`);
    } else {
      await SubscriptionPlan.create(plan);
      console.log(`   + created ${plan.key} (${plan.devices} devices / ${plan.events} events)`);
    }
  }

  const organizations = await Organization.find();
  for (const org of organizations) {
    const plan = await resolvePlan(org.plan || 'trial');
    org.allowedDevices = plan.devices;
    org.allowedEvents = plan.events;
    if (!org.trialEndsAt && plan.key === 'trial') org.trialEndsAt = trialEndDate(org.createdAt || new Date());
    await org.save();
  }
  console.log(`   ↻ synced limits for ${organizations.length} organization(s)`);

  await mongoose.disconnect();
  console.log('✅ Plans seeded.');
}

run().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
