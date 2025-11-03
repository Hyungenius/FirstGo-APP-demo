-- Enable RLS and add per-user policies for tutorial_instances

alter table if exists tutorial_instances enable row level security;

-- Clean old policies if re-running
drop policy if exists "ti_select_own" on tutorial_instances;
drop policy if exists "ti_insert_own" on tutorial_instances;
drop policy if exists "ti_update_own" on tutorial_instances;
drop policy if exists "ti_delete_own" on tutorial_instances;

-- Select: owner can read
create policy "ti_select_own" on tutorial_instances
  for select
  using (user_id = auth.uid());

-- Insert: only insert own rows
create policy "ti_insert_own" on tutorial_instances
  for insert
  with check (user_id = auth.uid());

-- Update: owner can update
create policy "ti_update_own" on tutorial_instances
  for update
  using (user_id = auth.uid());

-- Delete: owner can delete
create policy "ti_delete_own" on tutorial_instances
  for delete
  using (user_id = auth.uid());


