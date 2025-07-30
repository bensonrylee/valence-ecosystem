-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  image_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT false,
  phone_number TEXT,
  bio TEXT,
  location TEXT,
  settings JSONB DEFAULT '{"notifications": true, "marketing": true, "two_factor": false}'::jsonb,
  provider_profile JSONB
);

-- Services table
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  price DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability table
CREATE TABLE availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, day_of_week, start_time, end_time)
);

-- Indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_availability_provider_id ON availability(provider_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own services" ON services
  FOR ALL USING (provider_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    customer_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR
    provider_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Customers can create bookings" ON bookings
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR
    provider_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR
    recipient_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for completed bookings" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) AND
    booking_id IN (
      SELECT id FROM bookings 
      WHERE customer_id = reviewer_id AND status = 'completed'
    )
  );

-- Availability policies
CREATE POLICY "Anyone can view availability" ON availability
  FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own availability" ON availability
  FOR ALL USING (
    provider_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();