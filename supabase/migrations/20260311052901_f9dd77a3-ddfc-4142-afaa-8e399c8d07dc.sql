
-- The INSERT policies for contact_messages, demo_requests, and page_visits 
-- use WITH CHECK (true) intentionally since these are public-facing forms.
-- Adding basic validation constraints instead.

-- Add length constraints for safety
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_name_length CHECK (char_length(name) <= 200);
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_email_length CHECK (char_length(email) <= 255);
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_message_length CHECK (char_length(message) <= 5000);

ALTER TABLE public.demo_requests ADD CONSTRAINT demo_name_length CHECK (char_length(name) <= 200);
ALTER TABLE public.demo_requests ADD CONSTRAINT demo_email_length CHECK (char_length(email) <= 255);
