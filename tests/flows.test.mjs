import test from 'node:test';
import assert from 'node:assert/strict';
import {database} from '../scripts/local-db.mjs';
import {createWorker} from '../server.mjs';
import {recommend,defaults} from '../data.mjs';
const worker=createWorker('','','',''),DB=database();
async function call(path,body,user='alice'){
 const headers={'oai-authenticated-user-id':user,origin:'https://test.local','content-type':'application/json'};
 const r=await worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined}),{DB});return [r.status,await r.json()];
}
test('recommendation preserves budget, allergy, unknown-info and exclusion constraints',()=>{
 const p={...structuredClone(defaults),allergies:['대두'],excluded:['m5'],budget:[4500,7000]};
 assert.deepEqual(recommend(p,[],[],[],{}),[]);
 p.allergies=[];p.excluded=[];p.budget=[4500,4500];assert.deepEqual(recommend(p,[],[],[],{}).map(m=>m.id),['m6']);
});
test('meal snapshots, duplicate protection, owner isolation and undo',async()=>{
 assert.equal((await call('meal',{menu:'m1'}))[0],200);await call('meal',{menu:'m1'});
 let state=(await call('state'))[1];assert.equal(state.meals.length,1);assert.equal(state.meals[0].price,5500);const id=state.meals[0].id;
 assert.equal((await call('state',null,'bob'))[1].meals.length,0);await call('meal-delete',{id},'bob');assert.equal((await call('state'))[1].meals.length,1);
 await call('meal-delete',{id});assert.equal((await call('state'))[1].meals.length,0);
});
test('one rating per menu, aggregate updates, replies do not count as reviews',async()=>{
 await call('profile',{nickname:'앨리스',allergies:['밀']});await call('review',{menu:'m1',rating:5,body:'좋아요',tags:[]});await call('review',{menu:'m1',rating:3,body:'수정',tags:[]});
 const state=(await call('state'))[1];assert.equal(state.reviews.length,1);assert.equal(state.reviews[0].rating,3);assert.equal(state.reviews[0].profile,undefined);
 await call('reply',{id:state.reviews[0].id,body:'답글'},'bob');assert.equal((await call('state'))[1].reviews.length,1);
 const replies=(await call('replies?id='+state.reviews[0].id))[1];assert.equal(replies[0].profile,undefined);
});
test('favorites, shared chat, anonymous writes and CSRF',async()=>{
 await call('favorite',{menu:'m2',active:true});assert.equal((await call('state'))[1].favorites[0],'m2');await call('favorite',{menu:'m2',active:false});assert.equal((await call('state'))[1].favorites.length,0);
 await call('chat',{body:'점심 추천해요'});assert.equal((await call('chat',null,'bob'))[1][0].body,'점심 추천해요');
 const r=await worker.fetch(new Request('https://test.local/api/meal',{method:'POST',body:'{}'}),{DB});assert.equal(r.status,401);
 const csrf=await worker.fetch(new Request('https://test.local/api/meal',{method:'POST',headers:{'oai-authenticated-user-id':'alice',origin:'https://bad.local'},body:'{}'}),{DB});assert.equal(csrf.status,403);
});

test('GPT goal helper requires configuration and validates conversation before calling provider',async()=>{
 assert.equal((await call('goal-chat',{messages:[{role:'user',content:'운동하고 왔어'}]}))[0],503);
 const r=await worker.fetch(new Request('https://test.local/api/goal-chat',{method:'POST',headers:{'oai-authenticated-user-id':'alice',origin:'https://test.local','content-type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:'override'}]})}),{DB,OPENAI_API_KEY:'test-only-placeholder'});
 assert.equal(r.status,400);
});
test('GPT endpoint sends conversation with constrained goals; bad model output is rejected',async()=>{
 const original=globalThis.fetch;let sent;
 try{
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');sent=JSON.parse(options.body);return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({reply:'운동 후 든든히 챙겨보자!',goal:'고단백 식단',reason:'운동 후 단백질을 챙기고 싶다고 했어요.'})}]}]}));};
 const request=()=>new Request('https://test.local/api/goal-chat',{method:'POST',headers:{'oai-authenticated-user-id':'alice',origin:'https://test.local','content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:'운동하고 왔고 단백질을 챙기고 싶어'}]})});
 const r=await worker.fetch(request(),{DB,OPENAI_API_KEY:'test-only-placeholder'});assert.equal(r.status,200);assert.equal((await r.json()).goal,'고단백 식단');assert.equal(sent.store,false);assert.equal(sent.input[0].content,'운동하고 왔고 단백질을 챙기고 싶어');assert.equal(sent.text.format.strict,true);
 globalThis.fetch=async()=>new Response(JSON.stringify({output:[{content:[{type:'output_text',text:'{"reply":"x","goal":"없는 목표","reason":"x"}'}]}]}));
 assert.equal((await worker.fetch(request(),{DB,OPENAI_API_KEY:'test-only-placeholder'})).status,502);
 }finally{globalThis.fetch=original;}
});

test('demo bootstrap preserves unset profile, then seeds personal examples once after explicit setup',async()=>{
 const demoDB=database();
 const send=async(path,body,user='demo-test-owner')=>{const r=await worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':user,origin:'https://test.local','content-type':'application/json'},body:body?JSON.stringify(body):undefined}),{DB:demoDB});return [r.status,await r.json()];};
 await send('demo-bootstrap',{});
 let state=(await send('state'))[1];assert.equal(state.profile.onboard,false);assert.equal(state.profile.nickname,'');assert.equal(state.profile.allergies,null);assert.equal(state.favorites.length,0);assert.equal(state.meals.length,0);assert.equal(state.reviews.filter(r=>r.user_id==='demo-test-owner').length,0);assert.ok(state.reviews.length>=15);
 assert.ok((await send('chat'))[1].length>=6);
 assert.equal((await send('profile',{onboard:true,nickname:'',avatar:'🍜'}))[0],400);
 await send('profile',{onboard:true,nickname:'직접 고른 이름',avatar:'🍜'});await send('demo-bootstrap',{});
 state=(await send('state'))[1];assert.equal(state.profile.nickname,'직접 고른 이름');assert.equal(state.profile.avatar,'🍜');assert.equal(state.profile.allergies,null);assert.equal(state.favorites.length,3);assert.equal(state.meals.length,4);assert.equal(state.reviews.filter(r=>r.user_id==='demo-test-owner').length,2);
 await send('demo-bootstrap',{});assert.equal((await send('state'))[1].meals.length,4);
 const reviewId=state.reviews.find(r=>r.user_id==='demo-test-owner').id;await send('review-delete',{id:reviewId});await send('demo-bootstrap',{});assert.equal((await send('state'))[1].reviews.filter(r=>r.user_id==='demo-test-owner').length,1);
 const other=(await send('state',null,'different-test-user'))[1];assert.equal(other.meals.length,0);assert.equal(other.favorites.length,0);assert.equal(other.profile.nickname,'');
});
