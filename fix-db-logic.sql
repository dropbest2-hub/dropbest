-- Database function to atomically increment badge count
-- This prevents race conditions and ensures data integrity
CREATE OR REPLACE FUNCTION public.increment_badge(user_id_param UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET badge_count = badge_count + amount
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for automatic level updates based on badge count
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.badge_count >= 700 THEN 
        NEW.user_level := 'PLATINUM';
    ELSIF NEW.badge_count >= 300 THEN 
        NEW.user_level := 'GOLD';
    ELSIF NEW.badge_count >= 100 THEN 
        NEW.user_level := 'SILVER';
    ELSE
        NEW.user_level := 'BRONZE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_user_level
BEFORE UPDATE ON public.users
FOR EACH ROW
WHEN (OLD.badge_count IS DISTINCT FROM NEW.badge_count)
EXECUTE FUNCTION public.update_user_level();
