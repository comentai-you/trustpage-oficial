-- Drop TrustMarket functions
DROP FUNCTION IF EXISTS public.release_pending_funds(uuid);
DROP FUNCTION IF EXISTS public.request_withdrawal(uuid, numeric);
DROP FUNCTION IF EXISTS public.liberar_saldo_vendedor();
DROP FUNCTION IF EXISTS public.confirm_order_delivery(uuid, uuid);
DROP FUNCTION IF EXISTS public.process_order_payment(uuid);

-- Drop TrustMarket tables (in order due to foreign key constraints)
DROP TABLE IF EXISTS public.pending_releases CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- Remove TrustMarket-specific columns from profiles
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS pix_key,
  DROP COLUMN IF EXISTS pix_key_type,
  DROP COLUMN IF EXISTS balance_pending,
  DROP COLUMN IF EXISTS balance_available,
  DROP COLUMN IF EXISTS total_sales,
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS telegram_username;

-- Drop TrustMarket enums
DROP TYPE IF EXISTS public.product_category;
DROP TYPE IF EXISTS public.order_status;