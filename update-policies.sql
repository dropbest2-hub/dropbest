-- Run this in your Supabase SQL Editor to allow the application to create user profiles

CREATE POLICY "Allow individuals to insert their profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow individuals to update their profile" ON public.users FOR UPDATE USING (auth.uid() = id);
