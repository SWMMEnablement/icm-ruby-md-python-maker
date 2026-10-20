CREATE TABLE public.generated_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  file_name text NOT NULL,
  test_file_name text,
  language text NOT NULL,
  framework text,
  status text NOT NULL DEFAULT 'running',
  error text,
  tests text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.generated_tests TO service_role;
ALTER TABLE public.generated_tests ENABLE ROW LEVEL SECURITY;
CREATE INDEX generated_tests_device_idx ON public.generated_tests (device_id, created_at DESC);