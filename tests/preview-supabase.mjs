// Local QA only. Never imported by the application or included in Vercel functions.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {testDatabase} from './support/database.mjs';
const {client}=await testDatabase();
const source=ts.transpileModule(await readFile('lib/demo.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {demoPosts}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
await client.from('posts').insert(demoPosts);
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');let chunks=[];for await(const c of req)chunks.push(c);const body=chunks.length?JSON.parse(Buffer.concat(chunks)):null;
 let result;
 if(url.pathname.startsWith('/rest/v1/rpc/'))result=await client.rpc(url.pathname.split('/').pop(),body);
 else if(url.pathname.startsWith('/rest/v1/')){
 const q=client.from(url.pathname.split('/').pop()).select(url.searchParams.get('select')||'*');
 for(const [k,v] of url.searchParams){if(v.startsWith('eq.'))q.eq(k,v.slice(3));if(k==='or')q.or(v);if(k==='order')for(const o of v.split(',')){const [column,direction]=o.split('.');q.order(column,{ascending:direction!=='desc'})}}
 if(url.searchParams.has('limit'))q.range(Number(url.searchParams.get('offset')||0),Number(url.searchParams.get('offset')||0)+Number(url.searchParams.get('limit'))-1);
 if(req.headers.accept?.includes('vnd.pgrst.object'))q.maybeSingle();
 if(req.method==='POST')q.upsert(body,{onConflict:url.searchParams.get('on_conflict'),ignoreDuplicates:true});
 result=await q;
 }else {res.writeHead(401,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'Local preview has no OAuth provider'}));return}
 res.writeHead(result.error?400:200,{'Content-Type':'application/json'});res.end(JSON.stringify(result.error?{message:result.error.message}:result.data));
 }catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({message:e.message}))}
}).listen(5440,'127.0.0.1',()=>console.log('Local QA data ready on 5440'));
