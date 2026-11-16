import {defaults,menus} from './data.mjs';
export async function seedDemo(db,uid,profile){
 const seeded=await db.prepare('SELECT user_id FROM profiles WHERE user_id=?').bind('demo-seed-v1').first();
 const users=[['오늘도한끼','🍚'],['도서관단골','☕'],['학식탐험가','🧭'],['바삭한하루','🥐'],['상록산책','🌿'],['점심의발견','🍜'],['든든한곰','🐻'],['메뉴수집가','🍽️']];
 const now=Date.now(),dateKey=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul'}).format(new Date(now));
 const lunch=new Date(dateKey+'T13:00:00+09:00').getTime(),chatBase=lunch<=now?lunch:lunch-86400000,at=(minutes)=>new Date(chatBase-minutes*60000).toISOString();
 const stmts=users.map(([nickname,avatar],i)=>db.prepare('INSERT OR IGNORE INTO profiles(user_id,data) VALUES(?,?)').bind('demo-user-'+i,JSON.stringify({...defaults,nickname,avatar,onboard:true,isDemo:true})));
 const reviews=[
 [0,'m1',5,'불향이 은근하게 나서 좋았어요. 밥이랑 같이 먹으니 점심으로 딱!'],[1,'m1',4,'제육 소스가 잘 배어 있어서 끝까지 맛있게 먹었어요.'],[6,'m1',4,'오후 수업 전에 든든하게 먹기 좋은 한 접시예요.'],
 [3,'m2',5,'겉은 바삭하고 안은 촉촉해요. 돈가스 먹고 싶은 날이면 여기!'],[2,'m2',4,'양배추랑 같이 먹으니 느끼하지 않았어요.'],[7,'m2',5,'오늘 메뉴 중에서는 돈가스에 한 표요. 다음에도 고를 듯!'],
 [4,'m3',5,'따뜻한 국물이 생각날 때 좋아요. 반찬이랑 같이 먹기 편해요.'],[6,'m3',4,'차돌이 들어가서 풍미가 좋아요. 밥이랑 잘 어울려요.'],
 [1,'m4',5,'들기름 향이 좋아서 자꾸 생각나요. 고소한 면 좋아하면 추천!'],[5,'m4',4,'가볍게 먹고 싶을 때 골랐는데 꽤 만족스러웠어요.'],[7,'m4',4,'김이랑 같이 비벼 먹는 게 포인트 같아요.'],
 [2,'m5',4,'채소가 아삭해서 좋았어요. 다른 메뉴랑 번갈아 먹기 좋아요.'],[4,'m5',4,'수업 사이에 간단하게 먹기 괜찮은 선택이에요.'],
 [5,'m6',5,'치즈랑 떡볶이는 역시 잘 어울리네요. 친구랑 같이 먹었어요.'],[0,'m6',4,'오랜만에 분식 먹으니까 기분 전환 됐어요.'],
 [4,'m7',5,'여러 재료를 한 번에 먹을 수 있어서 자주 고르게 돼요.'],[1,'m7',4,'미소국이랑 같이 먹으니 잘 어울렸어요.'],[6,'m7',4,'깔끔하게 한 끼 먹고 싶을 때 괜찮아요.'],
 [7,'m8',4,'특별 정식은 다음에도 어떤 구성이 나올지 궁금하네요.'],[2,'m8',5,'여러 가지를 조금씩 먹는 재미가 있었어요.']
 ];
 for(const [i,menu,rating,body] of reviews){const rid='demo-review-'+i+'-'+menu;stmts.push(db.prepare('INSERT OR IGNORE INTO reviews VALUES(?,?,?,?,?,?,?)').bind(rid,'demo-user-'+i,menu,rating,body,'[]',at(90+reviews.findIndex(r=>r[0]===i&&r[1]===menu)*87)));for(let j=0;j<users.length;j++)if(j!==i&&(j+i)%3!==0)stmts.push(db.prepare('INSERT OR IGNORE INTO reactions VALUES(?,?)').bind('demo-user-'+j,rid));}
 for(let i=0;i<users.length;i++)for(let j=0;j<menus.length;j++)if((i+j)%3!==0)stmts.push(db.prepare('INSERT OR IGNORE INTO favorites VALUES(?,?)').bind('demo-user-'+i,menus[j].id));
 const chat=[
 [0,'오늘 제육덮밥 먹어본 사람 있어요? 점심 메뉴 아직 고민 중이에요.'],[6,'저 먹어봤어요! 불향 나는 스타일이라 밥이랑 잘 어울렸어요.'],[3,'저는 오늘 돈가스요. 바삭해서 만족했어요 😋'],[1,'오후에 도서관 갈 건데 들기름 메밀국수랑 비빔밥 중에 뭐가 좋을까요?'],[5,'고소한 면 좋아하시면 메밀국수 추천해요!'],[4,'따뜻한 국물 생각나면 된장 정식도 좋아요.'],[2,'다들 평론 꼼꼼하게 남겨줘서 메뉴 고르기가 훨씬 편하네요.'],[7,'차차의 한 표로 골랐는데 은근 재밌어요 ㅎㅎ 오늘도 맛있는 한 끼 하세요!']
 ];
 chat.forEach(([i,body],j)=>stmts.push(db.prepare('INSERT OR IGNORE INTO messages VALUES(?,?,?,?)').bind('demo-chat-'+j,'demo-user-'+i,body,at(62-j*6))));
 for(const [i,rid,body] of [[2,'demo-review-3-m2','저도 바삭한 게 마음에 들었어요!'],[0,'demo-review-1-m4','다음엔 메밀국수 먹어봐야겠네요.'],[5,'demo-review-0-m1','저도 오늘 제육에 한 표요!']])stmts.push(db.prepare('INSERT OR IGNORE INTO replies VALUES(?,?,?,?,?)').bind('demo-reply-'+i+'-'+rid,'demo-user-'+i,rid,body,at(70)));
 if(!seeded){for(let i=0;i<stmts.length;i+=40)await db.batch(stmts.slice(i,i+40));await db.prepare('INSERT OR IGNORE INTO profiles(user_id,data) VALUES(?,?)').bind('demo-seed-v1','{}').run();}
 // Never create or replace the visitor profile. Personal examples start only after their own setup.
 if(!profile.onboard||profile.demoSeeded)return;
 const personal=[];
 for(const menu of ['m1','m4','m5'])personal.push(db.prepare('INSERT OR IGNORE INTO favorites VALUES(?,?)').bind(uid,menu));
 for(const [menu,rating,body] of [['m2',5,'바삭한 돈가스가 먹고 싶을 때 다시 고르고 싶은 메뉴예요.'],['m7',4,'비빔밥과 따뜻한 미소국이 잘 어울리는 한 끼였어요.']])personal.push(db.prepare('INSERT OR IGNORE INTO reviews VALUES(?,?,?,?,?,?,?)').bind('demo-mine-review-'+uid+'-'+menu,uid,menu,rating,body,'[]',at(menu==='m2'?4400:1300)));
 for(const [menu,days] of [['m2',6],['m7',4],['m1',2],['m2',1]]){const x=menus.find(m=>m.id===menu),date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul'}).format(new Date(now-days*86400000));personal.push(db.prepare('INSERT OR IGNORE INTO meals VALUES(?,?,?,?,?,?)').bind('demo-mine-meal-'+uid+'-'+menu+'-'+days,uid,menu,x.price,x.restaurant,date));}
 personal.push(db.prepare('UPDATE profiles SET data=? WHERE user_id=?').bind(JSON.stringify({...profile,demoSeeded:true}),uid));
 await db.batch(personal);
}
