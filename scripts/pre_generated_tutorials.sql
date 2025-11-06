-- 预生成教程表
-- 用于存储提前生成的教程内容，加速用户点击木块时的响应速度

create table if not exists pre_generated_tutorials (
  id uuid primary key default gen_random_uuid(),
  input_text text not null unique,  -- 用户输入的文本，作为唯一键
  title text,
  description text,
  tags text[],
  difficulty text,
  tutorial_data jsonb not null,  -- 存储完整的教程数据（steps和items）
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 创建索引以加速查询
create index if not exists idx_pre_generated_tutorials_input_text on pre_generated_tutorials(input_text);

-- 添加更新时间触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_pre_generated_tutorials_updated_at
  before update on pre_generated_tutorials
  for each row
  execute function update_updated_at_column();

