// Test-only Supabase query adapter backed by real PostgreSQL (PGlite).
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
export async function testDatabase(){
 const pg=new PGlite();
 await pg.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);");
 await pg.exec(await readFile('supabase/migrations/202609230001_initial.sql','utf8'));
 function from(table){let action='select',values,opts={},selection='*',where=[],ordering=[],slice=null,single=false,count=false,head=false;
 const q={select(s='*',o={}){selection=s;count=o.count;head=o.head;return q},eq(k,v){where.push([k,'=',v]);return q},order(k,o={}){ordering.push(`${k} ${o.ascending===false?'desc':'asc'}`);return q},limit(n){slice=[0,n];return q},range(a,b){slice=[a,b-a+1];return q},maybeSingle(){single=true;return q},or(){where.push(['__video']);return q},insert(v){action='insert';values=v;return q},upsert(v,o){action='upsert';values=v;opts=o;return q},update(v){action='update';values=v;return q},delete(){action='delete';return q},then(resolve,reject){return run().then(resolve,reject)}};
 async function run(){try{let args=[];const bind=v=>{args.push(v);return '$'+args.length};const filter=()=>where.length?' where '+where.map(([k,op,v])=>k==='__video'?"(kind in ('video','tiktok') or (kind='facebook' and (source_url like '%/videos/%' or source_url like '%/reel/%')))":`${k}${op}${bind(v)}`).join(' and '):'';let sql;
 if(action==='select'){const cols=selection.includes('posts(title)')?"*,(select json_build_object('title',p.title) from posts p where p.id=comments.post_id) as posts":selection;sql=`select ${head?'count(*) as n':cols} from ${table}${filter()}`;if(ordering.length&&!head)sql+=' order by '+ordering.join(',');if(slice&&!head)sql+=` limit ${slice[1]} offset ${slice[0]}`;}
 if(action==='insert'||action==='upsert'){const rows=Array.isArray(values)?values:[values];const keys=Object.keys(rows[0]);sql=`insert into ${table} (${keys.join(',')}) values `+rows.map(r=>'('+keys.map(k=>bind(r[k])).join(',')+')').join(',');if(action==='upsert')sql+=` on conflict (${opts.onConflict}) `+(opts.ignoreDuplicates?'do nothing':'do update set '+keys.map(k=>`${k}=excluded.${k}`).join(','));sql+=' returning *'}
 if(action==='update')sql=`update ${table} set `+Object.keys(values).map(k=>`${k}=${bind(values[k])}`).join(',')+filter()+' returning *';
 if(action==='delete')sql=`delete from ${table}`+filter()+' returning *';
 const result=await pg.query(sql,args);return {data:head?null:single?result.rows[0]||null:result.rows,error:null,count:head?Number(result.rows[0].n):count?result.rows.length:null};
 }catch(error){return {data:null,error}}}return q;
 }
 const client={from,async rpc(name,args){try{const keys=Object.keys(args);const r=await pg.query(`select public.${name}(${keys.map((k,i)=>`${k} => $${i+1}`).join(',')}) as result`,Object.values(args));return {data:r.rows[0].result,error:null}}catch(error){return {data:null,error}}},storage:{from(){return {async createSignedUploadUrl(key){return {data:{signedUrl:'https://test-storage.invalid/'+key},error:null}},getPublicUrl(key){return {data:{publicUrl:'https://test-storage.invalid/'+key}}}}}}};
 return {pg,client};
}
