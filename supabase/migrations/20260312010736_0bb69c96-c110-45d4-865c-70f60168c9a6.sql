
-- Table to store detailed section content for each experiment
CREATE TABLE public.experiment_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, section_key)
);

-- RLS
ALTER TABLE public.experiment_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiment sections viewable by everyone"
  ON public.experiment_sections FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage experiment sections"
  ON public.experiment_sections FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_experiment_sections_updated_at
  BEFORE UPDATE ON public.experiment_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
