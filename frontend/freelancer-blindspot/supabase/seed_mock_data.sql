create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
  v_demo_email text;
  p record;
  v_project_id uuid;
  v_started timestamptz;
  v_hours numeric;
  v_cat text;
  i int;
BEGIN
  -- 1) Find an existing auth user
  SELECT id
  INTO v_user_id
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1;

  -- 2) If none exists, create one so FK user_id works
  IF v_user_id IS NULL THEN
    v_demo_email := 'demo+' || floor(extract(epoch from now()))::bigint || '@blindspot.local';

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_demo_email,
      crypt('DemoPass@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- 3) Settings
  INSERT INTO public.settings (id, rate_floor, currency)
  VALUES (v_user_id, 550, '₹')
  ON CONFLICT (id) DO UPDATE
  SET rate_floor = EXCLUDED.rate_floor,
      currency = EXCLUDED.currency;

  -- 4) Projects + sessions
  FOR p IN
    SELECT * FROM (VALUES
      ('Website Redesign','Sharma Enterprises','Design','fixed',15000::numeric,0::numeric,20::numeric,500::numeric),
      ('Logo + Brand Identity','StartupXYZ','Design','fixed',8000,0,10,600),
      ('SaaS Landing Revamp','CloudMint','Design','fixed',85000,0,90,700),
      ('Design System Build','Finlite','Design','hourly',0,1800,140,900),
      ('Mobile App MVP','QuickShip','Dev','fixed',220000,0,220,800),
      ('Backend API Hardening','MediTrack','Dev','hourly',0,2500,100,1200),
      ('Growth Content Engine','HireForge','Writing','hourly',0,900,80,600),
      ('Newsletter Funnel','CreatorNest','Marketing','fixed',55000,0,70,650),
      ('Analytics Dashboard','VoltMetrics','Dev','hourly',0,2100,130,1000),
      ('SEO Recovery Plan','UrbanRoots','Marketing','fixed',72000,0,110,700)
    ) AS t(title, client, type, model, price, hourlyRate, budgetHours, threshold)
  LOOP
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE user_id = v_user_id
      AND title = p.title
      AND (client = p.client OR client_name = p.client)
    LIMIT 1;

    IF v_project_id IS NULL THEN
      INSERT INTO public.projects
        (
          user_id,
          title,
          client,
          type,
          model,
          price,
          "hourlyRate",
          "budgetHours",
          threshold,
          "meetUrl",
          client_name,
          project_type,
          pricing_type,
          total_value,
          hourly_rate,
          est_hours
        )
      VALUES
        (
          v_user_id,
          p.title,
          p.client,
          p.type,
          p.model,
          p.price,
          p.hourlyrate,
          p.budgethours,
          p.threshold,
          NULL,
          p.client,
          p.type,
          p.model,
          p.price,
          p.hourlyrate,
          p.budgethours
        )
      RETURNING id INTO v_project_id;
    END IF;

    FOR i IN 1..10 LOOP
      v_hours := CASE
        WHEN i IN (3, 7) THEN 0.75
        WHEN i IN (4, 8) THEN 2.5
        ELSE 1.5
      END;

      v_cat := CASE
        WHEN i % 6 = 0 THEN 'scope'
        WHEN i % 5 = 0 THEN 'revisions'
        WHEN i % 4 = 0 THEN 'calls'
        WHEN i % 3 = 0 THEN 'admin'
        ELSE 'work'
      END;

      v_started := now() - ((i * 2) || ' days')::interval - ((i * 31) || ' minutes')::interval;

      INSERT INTO public.sessions
        (project_id, user_id, type, "nbCategory", hours, note, "startedAt", "endedAt")
      SELECT
        v_project_id,
        v_user_id,
        CASE WHEN v_cat = 'work' THEN 'billable' ELSE 'nonbillable' END,
        v_cat,
        v_hours,
        format('%s log %s - %s', p.title, i, v_cat),
        v_started,
        v_started + (v_hours || ' hours')::interval
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.sessions s
        WHERE s.project_id = v_project_id
          AND s.user_id = v_user_id
          AND s.note = format('%s log %s - %s', p.title, i, v_cat)
      );
    END LOOP;

    IF p.title IN ('Mobile App MVP', 'Website Redesign', 'Analytics Dashboard') THEN
      INSERT INTO public.sessions
        (project_id, user_id, type, "nbCategory", hours, note, "startedAt", "endedAt")
      SELECT
        v_project_id, v_user_id, 'nonbillable', 'revisions', 5,
        p.title || ' revision escalation',
        now() - interval '6 days',
        now() - interval '5 days 19 hours'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.sessions
        WHERE project_id = v_project_id
          AND user_id = v_user_id
          AND note = p.title || ' revision escalation'
      );
    END IF;
  END LOOP;
END $$;

-- Verify seed
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 3;

SELECT count(*) AS projects_count FROM public.projects;
SELECT count(*) AS sessions_count FROM public.sessions;
