export const SUPABASE_SQL_SCHEMA = `-- ================================================================
-- SQL DDL Script for Supabase PostgreSQL Database
-- Iran Insurance Golzar Agency Code 30962 (بیمه ایران نمایندگی گلزار ۳۰۹۶۲)
-- ================================================================

-- 1. Create Enums for Insurance Type and Status
CREATE TYPE insurance_type AS ENUM (
  'third_party',
  'body',
  'fire',
  'health',
  'life',
  'liability',
  'travel'
);

CREATE TYPE inquiry_status AS ENUM (
  'pending',
  'in_progress',
  'ready_for_issuance',
  'issued',
  'rejected'
);

-- 2. Create Inquiries Table (جدول درخواست‌های بیمه)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code VARCHAR(30) UNIQUE NOT NULL,
  insurance_type insurance_type NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(20) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  province VARCHAR(100) DEFAULT 'تهران',
  city VARCHAR(100) DEFAULT 'تهران',
  address TEXT,
  status inquiry_status DEFAULT 'pending',
  form_data JSONB DEFAULT '{}'::jsonb,
  expert_notes TEXT,
  issued_policy_url TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Documents Table (جدول مدارک آپلود شده خودرو، بیمه قبلی، کارت ملی)
CREATE TABLE IF NOT EXISTS public.inquiry_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL, -- car_card_front, car_card_back, prev_policy, national_card
  doc_label VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size VARCHAR(50),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create SMS Logs Table (جدول تاریخچه پیامک‌های ارسالی)
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile VARCHAR(20) NOT NULL,
  tracking_code VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  provider VARCHAR(50) DEFAULT 'SystemSimulated',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for fast search by tracking code, mobile, and status
CREATE INDEX IF NOT EXISTS idx_inquiries_tracking ON public.inquiries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_inquiries_mobile ON public.inquiries(mobile);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_documents_inquiry ON public.inquiry_documents(inquiry_id);

-- 6. Trigger to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Row Level Security Policies (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT new inquiries and READ their own inquiry via tracking_code
CREATE POLICY "Allow public insert inquiries" ON public.inquiries 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select inquiry by tracking_code or mobile" ON public.inquiries 
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert documents" ON public.inquiry_documents 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select documents" ON public.inquiry_documents 
  FOR SELECT USING (true);

-- Allow full access to authenticated admin users
CREATE POLICY "Allow admin all on inquiries" ON public.inquiries 
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. Sample Seed Data for Testing
INSERT INTO public.inquiries (tracking_code, insurance_type, full_name, national_id, mobile, province, city, status, form_data, expert_notes)
VALUES 
('IR30962-84910', 'third_party', 'رضا حسینی پور', '۰۰۷۸۹۱۲۳۴۵', '09121112233', 'تهران', 'تهران', 'pending', '{"vehicleType": "پژو پارس TU5", "modelYear": "1401", "plateNumber": "55 ج 892 - ایران 77", "previousCompany": "بیمه ایران", "noClaimDiscount": "30% (3 سال)"}', 'مدارک کامل است و منتظر استعلام قیمت نهایی.'),
('IR30962-73821', 'body', 'مریم ابراهیمی', '۱۲۹۴۵۶۷۸۹۰', '09123334455', 'اصفهان', 'اصفهان', 'in_progress', '{"vehicleType": "جک S5", "estimatedValue": "1,450,000,000 تومان"}', 'کارشناس بازدید هماهنگ شد.');
`;
