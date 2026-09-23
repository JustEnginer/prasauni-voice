import {createClient} from '@supabase/supabase-js';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
// Run with securely configured environment after applying the Supabase migration.
const {NEXT_PUBLIC_SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key}=process.env;
if(!url||!key)throw new Error('Configure Supabase URL and service role key before seeding');
const source=ts.transpileModule(await readFile('lib/demo.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {demoPosts}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {error}=await db.from('posts').upsert(demoPosts,{onConflict:'id',ignoreDuplicates:true});
if(error)throw new Error('Demo seed failed: '+error.message);
console.log('Demo photo, video and blog are ready. Existing records were not overwritten.');
