
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for product categories
CREATE TYPE public.product_category AS ENUM ('games', 'social_media', 'digital_services');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending_payment', 'paid', 'delivered', 'confirmed', 'disputed', 'cancelled', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  bio TEXT,
  telegram_username TEXT,
  balance_pending DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
  balance_available DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
  total_sales INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category product_category NOT NULL,
  subcategory TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_fast_delivery BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  product_title TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.15 NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  seller_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending_payment' NOT NULL,
  payment_method TEXT DEFAULT 'pix',
  payment_id TEXT,
  confirmed_at TIMESTAMPTZ,
  release_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create pending_releases table for 48h escrow tracking
CREATE TABLE public.pending_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  release_at TIMESTAMPTZ NOT NULL,
  is_released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_releases ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || LEFT(NEW.id::TEXT, 8))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to process payment (adds to pending balance)
CREATE OR REPLACE FUNCTION public.process_order_payment(order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = order_id AND status = 'pending_payment';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update order status
  UPDATE public.orders 
  SET status = 'paid', updated_at = NOW()
  WHERE id = order_id;
  
  -- Add to seller's pending balance
  UPDATE public.profiles 
  SET balance_pending = balance_pending + v_order.seller_amount,
      updated_at = NOW()
  WHERE id = v_order.seller_id;
  
  RETURN TRUE;
END;
$$;

-- Function to confirm delivery (starts 48h countdown)
CREATE OR REPLACE FUNCTION public.confirm_order_delivery(order_id UUID, buyer_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_release_time TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_order FROM public.orders 
  WHERE id = order_id AND buyer_id = buyer_user_id AND status = 'delivered';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  v_release_time := NOW() + INTERVAL '48 hours';
  
  -- Update order status
  UPDATE public.orders 
  SET status = 'confirmed', 
      confirmed_at = NOW(),
      release_at = v_release_time,
      updated_at = NOW()
  WHERE id = order_id;
  
  -- Create pending release record
  INSERT INTO public.pending_releases (order_id, seller_id, amount, release_at)
  VALUES (order_id, v_order.seller_id, v_order.seller_amount, v_release_time);
  
  RETURN TRUE;
END;
$$;

-- Function to release funds (called after 48h or manually by admin)
CREATE OR REPLACE FUNCTION public.release_pending_funds(pending_release_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_release RECORD;
BEGIN
  SELECT * INTO v_release FROM public.pending_releases 
  WHERE id = pending_release_id AND is_released = FALSE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Move from pending to available
  UPDATE public.profiles 
  SET balance_pending = balance_pending - v_release.amount,
      balance_available = balance_available + v_release.amount,
      total_sales = total_sales + 1,
      updated_at = NOW()
  WHERE id = v_release.seller_id;
  
  -- Mark as released
  UPDATE public.pending_releases 
  SET is_released = TRUE 
  WHERE id = pending_release_id;
  
  -- Complete the order
  UPDATE public.orders 
  SET status = 'completed', completed_at = NOW(), updated_at = NOW()
  WHERE id = v_release.order_id;
  
  RETURN TRUE;
END;
$$;

-- Function to process withdrawal request
CREATE OR REPLACE FUNCTION public.request_withdrawal(user_id UUID, amount DECIMAL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_withdrawal_id UUID;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = user_id;
  
  IF NOT FOUND OR v_profile.balance_available < amount THEN
    RETURN NULL;
  END IF;
  
  IF v_profile.pix_key IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Deduct from available balance
  UPDATE public.profiles 
  SET balance_available = balance_available - amount,
      updated_at = NOW()
  WHERE id = user_id;
  
  -- Create withdrawal record
  INSERT INTO public.withdrawals (user_id, amount, pix_key, pix_key_type)
  VALUES (user_id, amount, v_profile.pix_key, v_profile.pix_key_type)
  RETURNING id INTO v_withdrawal_id;
  
  RETURN v_withdrawal_id;
END;
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sellers can view own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- RLS Policies for orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their orders"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = messages.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their orders"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = messages.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- RLS Policies for withdrawals
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for pending_releases
CREATE POLICY "Users can view own pending releases"
  ON public.pending_releases FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
