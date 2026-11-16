export const menus = [
 {id:'m1',name:'직화 제육덮밥',price:5500,restaurant:'제1학생회관',category:'덮밥·볶음밥',emoji:'🍚',ingredients:['돼지고기','양파','대파'],allergens:['대두','밀'],known:true,color:'#dcb77f'},
 {id:'m2',name:'바삭 등심 돈가스',price:6000,restaurant:'제2학생회관',category:'돈가스·튀김',emoji:'🍛',ingredients:['돼지고기','밀','양배추'],allergens:['밀','달걀','대두'],known:true,color:'#cda66c'},
 {id:'m3',name:'차돌 된장 정식',price:6500,restaurant:'상록회관',category:'정식·백반',emoji:'🍲',ingredients:['소고기','두부','애호박'],allergens:['대두','밀'],known:true,color:'#ae8060'},
 {id:'m4',name:'들기름 메밀국수',price:5000,restaurant:'제1학생회관',category:'면류',emoji:'🍜',ingredients:['메밀','김','들기름'],allergens:['메밀','대두','밀'],known:true,color:'#c1aa7d'},
 {id:'m5',name:'닭가슴살 샐러드',price:5500,restaurant:'생활과학대학',category:'샐러드·간편식',emoji:'🥗',ingredients:['닭고기','양상추','토마토'],allergens:['닭고기','토마토'],known:true,color:'#a9b097'},
 {id:'m6',name:'치즈 떡볶이',price:4500,restaurant:'제2학생회관',category:'분식',emoji:'🥘',ingredients:['떡','치즈','어묵'],allergens:['우유','밀','대두'],known:true,color:'#c89580'},
 {id:'m7',name:'비빔밥과 미소국',price:5000,restaurant:'상록회관',category:'정식·백반',emoji:'🥙',ingredients:['당근','시금치','달걀'],allergens:['달걀','대두'],known:true,color:'#b2ac84'},
 {id:'m8',name:'오늘의 특별 정식',price:7000,restaurant:'제1학생회관',category:'정식·백반',emoji:'🍱',ingredients:[],allergens:[],known:false,color:'#b9a28f'}
];
export const defaults = {nickname:'',avatar:'🍽️',onboard:false,allergies:null,allergyOn:true,global:true,flags:{favorites:true,history:true,ratings:true,ingredients:true,excluded:true,tags:true},likes:[],dislikes:[],excluded:[],blocked:[],budget:[4000,7000],goal:'균형 잡힌 식사',personal:true,novel:false,community:true};
export const levels=[['새싹 미식가',0],['탐험하는 미식가',5],['취향 있는 미식가',15],['고급 미식가',30],['미식의 달인',50]];
export function recommend(profile,favs,meals,reviews,stats){
 const p={...defaults,...profile};
 return menus.filter(m=>m.price>=p.budget[0]&&m.price<=p.budget[1]&&(!p.allergyOn||(m.known&&!(p.allergies||[]).some(a=>m.allergens.includes(a))))&&!(p.personal&&p.global&&p.flags.excluded&&p.excluded.includes(m.id))).map(m=>{
 let score=0,reasons=['설정한 예산 안에 들어오는 한 접시예요.'];
 const mine=reviews.find(r=>r.menu_id===m.id);
 if(p.personal&&p.global){
 if(p.flags.favorites&&favs.includes(m.id)){score+=3;reasons.push('내가 찜해 둔 메뉴예요.');}
 if(p.flags.ratings&&mine){score+=(mine.rating-3)*2; if(mine.rating>=4)reasons.push('내가 높은 별점을 남겼어요.');}
 if(p.flags.history&&meals.some(h=>h.menu_id===m.id))score+=.5;
 if(p.flags.ingredients){score+=m.ingredients.filter(x=>p.likes.includes(x)).length*2;score-=m.ingredients.filter(x=>p.dislikes.includes(x)).length*4;}
 if(p.flags.tags&&mine){const tags=JSON.parse(mine.tags||'[]');score-=tags.filter(t=>['너무 매워요','너무 짜요','양이 적어요'].includes(t)).length;}
 }
 if(p.novel&&!meals.some(h=>h.menu_id===m.id)){score+=2;reasons.push('아직 선택한 적 없는 새로운 메뉴예요.');}
 if(p.community){const s=stats[m.id]||{count:0,avg:0};score+=(s.avg*s.count+3.5*5)/(s.count+5);if(s.count)reasons.push('미식 평론의 참여 수를 고려했어요.');}
 return {...m,score,reason:reasons.slice(-2).join(' ')};
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,3);
}
