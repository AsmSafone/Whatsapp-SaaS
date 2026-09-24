import type { UserPlan } from './entities/user.entity';

export const PLAN_LIMITS: Record<UserPlan, number> = {
  starter: 1,
  pro: 3,
  plus: 6,
  business: 10,
};

export const PLAN_CATALOG: Array<{
  id: UserPlan;
  name: string;
  price: number;
  sessions: number;
  blurb: string;
}> = [
  {
    id: 'starter',
    name: 'Starter',
    price: 6,
    sessions: 1,
    blurb: 'One WhatsApp number for individuals and small tools.',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15,
    sessions: 3,
    blurb: 'Growing products that need a few linked numbers.',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 30,
    sessions: 6,
    blurb: 'Teams covering more inboxes and brands.',
  },
  {
    id: 'business',
    name: 'Business',
    price: 45,
    sessions: 10,
    blurb: 'Higher density for agencies and production workloads.',
  },
];
