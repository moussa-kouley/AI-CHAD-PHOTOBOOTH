do $$
declare
  t text;
begin
  foreach t in array array[
    'users',
    'workspaces',
    'memberships',
    'photobooths',
    'prompts',
    'sessions',
    'generations',
    'jobs',
    'credit_ledger'
  ]
  loop
    execute format('drop policy if exists lumen_server on %I', t);
    execute format('create policy lumen_server on %I for all using (true) with check (true)', t);
  end loop;
end $$;
