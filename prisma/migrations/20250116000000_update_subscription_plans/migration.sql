-- Adicionar PREMIUM ao enum
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'PREMIUM';

-- Migrar usuários com UNLIMITED para ENTERPRISE
UPDATE "users" 
SET subscription_plan = 'ENTERPRISE' 
WHERE subscription_plan = 'UNLIMITED';

-- Migrar overrides com UNLIMITED para ENTERPRISE
UPDATE "user_overrides" 
SET metadata = jsonb_set(metadata, '{plan}', '"ENTERPRISE"')
WHERE override_type = 'PLAN_LIMITS' 
  AND metadata->>'plan' = 'UNLIMITED';
