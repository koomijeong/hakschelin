import http from 'node:http';
import fs from 'node:fs';
import {createWorker} from '../server.mjs';
import {database} from './local-db.mjs';
const worker=createWorker(fs.readFileSync('index.html','utf8'),fs.readFileSync('style.css','utf8'),fs.readFileSync('app.js','utf8'),fs.readFileSync('assets/chacha.png').toString('base64'),fs.readFileSync('assets/app-icon.png').toString('base64'));
const DB=database();
const fixture=process.argv.includes('--fixture'),port=fixture?4174:4173,previewUser=fixture?'qa-fixture-user':'local-preview-user';
if(fixture)await DB.prepare('INSERT INTO profiles(user_id,data) VALUES(?,?)').bind(previewUser,JSON.stringify({...(await import('../data.mjs')).defaults,nickname:'검증용 가상 계정',avatar:'☕',onboard:true})).run();
http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks),headers=new Headers(req.headers);headers.set('oai-authenticated-user-id',previewUser);const r=await worker.fetch(new Request('http://localhost:'+port+req.url,{method:req.method,headers,body:body.length?body:undefined}),{DB});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch(e){res.writeHead(500);res.end(e.message);}}).listen(port,'127.0.0.1',()=>console.log('Local: http://localhost:'+port+' · '+(fixture?'synthetic QA fixture, not visitor profile':'unset visitor profile')+' · memory-only preview database'));
