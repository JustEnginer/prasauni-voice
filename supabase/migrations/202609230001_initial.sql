-- Server-only data access: no public table or function permissions.
create table public.posts(id text primary key,title text not null,excerpt text not null default '',body text not null default '',kind text not null check(kind in ('blog','photo','video','facebook','tiktok')),category text not null,source_url text not null default '',media_url text not null default '',status text not null default 'draft' check(status in ('draft','published')),created_at bigint not null,updated_at bigint not null);
create table public.members(id text primary key,name text not null,created_at bigint not null);
create table public.likes(post_id text not null references public.posts on delete cascade,user_id text not null,created_at bigint not null,primary key(post_id,user_id));
create table public.comments(id text primary key,post_id text not null references public.posts on delete cascade,user_id text not null,name text not null,body text not null check(length(body) between 2 and 1500),status text not null default 'visible' check(status in ('visible','hidden')),created_at bigint not null);
create table public.visitors(id text primary key,preview_until bigint not null,created_at bigint not null);
create table public.visits(visitor_id text not null,day text not null,created_at bigint not null,primary key(visitor_id,day));
create table public.views(post_id text not null references public.posts on delete cascade,visitor_id text not null,day text not null,created_at bigint not null,primary key(post_id,visitor_id,day));
create index on public.posts(status,created_at desc);
create index on public.comments(post_id,created_at desc);
create index on public.comments(user_id,created_at desc);
create index on public.visits(created_at);
create index on public.views(day);
alter table public.posts enable row level security;
alter table public.members enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.visitors enable row level security;
alter table public.visits enable row level security;
alter table public.views enable row level security;
revoke all on public.posts,public.members,public.likes,public.comments,public.visitors,public.visits,public.views from anon,authenticated;
grant all on public.posts,public.members,public.likes,public.comments,public.visitors,public.visits,public.views to service_role;
create view public.post_counts with (security_invoker=true) as select p.*,
 (select count(*) from public.likes l where l.post_id=p.id) as likes,
 (select count(*) from public.comments c where c.post_id=p.id and c.status='visible') as comments,
 (select count(*) from public.views v where v.post_id=p.id) as views
 from public.posts p;
revoke all on public.post_counts from anon,authenticated;
grant select on public.post_counts to service_role;
create function public.start_preview(p_id text,p_day text,p_now bigint,p_restart boolean) returns bigint language plpgsql set search_path=public as $$
declare expiry bigint;
begin
 insert into visitors(id,preview_until,created_at) values(p_id,p_now+30000,p_now) on conflict(id) do nothing;
 if p_restart then update visitors set preview_until=p_now+30000 where id=p_id; end if;
 insert into visits(visitor_id,day,created_at) values(p_id,p_day,p_now) on conflict do nothing;
 select preview_until into expiry from visitors where id=p_id;
 return expiry;
end $$;
create function public.add_comment(p_post text,p_user text,p_name text,p_body text,p_now bigint) returns jsonb language plpgsql set search_path=public as $$
declare c comments;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user,0));
 if (select count(*) from comments where user_id=p_user and created_at>p_now-3600000)>=20 then raise exception 'COMMENT_RATE_LIMIT'; end if;
 insert into comments(id,post_id,user_id,name,body,status,created_at) values(gen_random_uuid()::text,p_post,p_user,p_name,p_body,'visible',p_now) returning * into c;
 return to_jsonb(c);
end $$;
create function public.site_metrics(p_since bigint) returns jsonb language sql stable set search_path=public as $$
 select jsonb_build_object('totals',jsonb_build_object(
 'visitors',(select count(distinct visitor_id) from visits),'views',(select count(*) from views),
 'likes',(select count(*) from likes),'comments',(select count(*) from comments where status='visible'),
 'members',(select count(*) from members),'posts',(select count(*) from posts where status='published')),
 'daily',coalesce((select jsonb_agg(d order by day) from (select day,count(*) as visitors from visits where created_at>p_since group by day) d),'[]'::jsonb),
 'top',coalesce((select jsonb_agg(t) from (select id,title,kind,likes,comments,views from post_counts where status='published' order by views desc,id limit 8) t),'[]'::jsonb));
$$;
revoke all on function public.start_preview(text,text,bigint,boolean),public.add_comment(text,text,text,text,bigint),public.site_metrics(bigint) from public,anon,authenticated;
grant execute on function public.start_preview(text,text,bigint,boolean),public.add_comment(text,text,text,text,bigint),public.site_metrics(bigint) to service_role;
-- Public media is deliberate; only the server/admin may issue upload URLs.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,20971520,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']) on conflict(id) do nothing;
