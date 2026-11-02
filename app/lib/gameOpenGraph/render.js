// Approved frozen game-state previews. Bundled fonts/logos; no external requests.
import React from 'react';
import { ImageResponse } from 'next/og.js';
import assets from './assets.json';
const h=React.createElement;
const B=(style,...children)=>h('div',{style:{display:'flex',...style}},...children);
const T=(v,style={})=>B(style,v);
const col=(style,...c)=>B({flexDirection:'column',...style},...c);
const row=(style,...c)=>B({alignItems:'center',...style},...c);
const I=(src,w,ht,style={})=>h('img',{src,width:w,height:ht,style});
const {logos,brands}=assets;
const fonts=assets.fonts.map(f=>({...f,data:Buffer.from(f.data,'base64')}));
const logo=(site,team,size=50)=>I(logos[site][team],size,size,{objectFit:'contain',flexShrink:0});
const label=(s,b)=>T(s,{fontSize:14,color:b.muted,fontWeight:700,letterSpacing:.7});
const panel=(...c)=>col({width:720,height:540,position:'relative'},...c);
// Explicit two-line names. Keep suffixes with the surname and shrink long surnames to fit.
const nameLines=name=>{const [first,...rest]=name.split(' ');return [first,rest.join(' ')].filter(Boolean);};
const playerName=(name,size=20,width=160)=>{
 const lines=nameLines(name),fontSize=Math.min(size,width/(Math.max(...lines.map(s=>s.length))*.57));
 return col({alignItems:'center',width},...lines.map(line=>T(line,{fontSize,fontWeight:700,lineHeight:1.08,whiteSpace:'nowrap'})));
};
const search=b=>T('Type a player name…',{height:44,width:720,flexShrink:0,alignItems:'center',paddingLeft:16,backgroundColor:b.surface,border:`1px solid ${b.border}`,borderRadius:6,color:b.muted,fontSize:18});
const scored=(heading,value,color,b)=>col({alignItems:'flex-end'},label(heading,b),T(value,{fontSize:27,fontWeight:700,color,lineHeight:1.1}));
// Qualified 2024–25 PPG leaders: NBA/Pacers 2025 Finals guide, NBA stats p.105.
const nba=[['Shai Gilgeous-Alexander','OKC','32.7'],['Giannis Antetokounmpo','MIL','30.4'],['Nikola Jokic','DEN','29.6'],['Anthony Edwards','MIN','27.6'],['Jayson Tatum','BOS','26.8'],['Kevin Durant','PHX','26.6'],['Cade Cunningham','DET','26.1'],['Jalen Brunson','NYK','26.0'],['Devin Booker','PHX','25.6'],['Damian Lillard','MIL','24.9'],['Stephen Curry','GSW','24.5'],['Karl-Anthony Towns','NYK','24.4'],['LeBron James','LAL','24.4'],['Trae Young','ATL','24.2'],['Franz Wagner','ORL','24.1']];
// First 15 players in MLB’s 2025 regular-season HR table; the final slot is tied at 34.
const mlb=[['Cal Raleigh','SEA','60'],['Kyle Schwarber','PHI','56'],['Shohei Ohtani','LAD','55'],['Aaron Judge','NYY','53'],['Eugenio Suarez','SEA','49'],['Junior Caminero','TB','45'],['Juan Soto','NYM','43'],['Pete Alonso','NYM','38'],['Jo Adell','LAA','37'],['Riley Greene','DET','36'],['Nick Kurtz','ATH','36'],['Taylor Ward','LAA','36'],['Byron Buxton','MIN','35'],['Rafael Devers','SF','35'],['Michael Busch','CHC','34']];
function board(site){
 const b=brands[site],isNBA=site==='blacktop',players=isNBA?nba:mlb;
 const revealed=new Set(isNBA?[0,1,3,4,6,8,9,10,12,13]:[0,1,2,3,6,7,9,11,12,13]);
 const cols=5,gap=6,w=(720-(cols-1)*gap)/cols,ht=128;
 return panel(
  row({height:76,marginBottom:10,padding:'10px 14px',borderRadius:8,backgroundColor:b.surface,border:`1px solid ${b.border}`,justifyContent:'space-between'},
   col({width:440},T(isNBA?'Most points per game':'Most home runs',{fontSize:25,fontWeight:700}),T(isNBA?'2024–25 · Regular season':'2025 · Regular season',{fontSize:17,color:b.muted,marginTop:4})),
   row({gap:20},scored('SCORE',String(revealed.size),'#75d6b0',b),scored('STRIKES','0 / 3',isNBA?'#ffadad':'#ff7c74',b))),
  search(b),
  B({marginTop:10,flexWrap:'wrap',gap},...players.map(([name,team,stat],i)=>col({width:w,height:ht,flexShrink:0,backgroundColor:revealed.has(i)?isNBA?'#183c30':'#0b302d':b.surface,border:`1px solid ${revealed.has(i)?'#318866':b.border}`,borderRadius:6,alignItems:'center',justifyContent:'space-between',padding:'6px 4px'},T(stat,{fontSize:17,fontWeight:700}),logo(site,team,44),revealed.has(i)?playerName(name,isNBA?14:15,w-10):T('?',{fontSize:25,color:b.muted}))))
 );
}
function stack(site){
 const b=brands[site],isNBA=site==='blacktop',stat=isNBA?'Three-pointers':'Home Runs';
 const picks=isNBA?[
  ['Stephen Curry','GSW','2015–16','402','99.9','#1d428a'],
  ['Klay Thompson','GSW','2018–19','241','98.8','#1d428a'],
  ['Damian Lillard','POR','2019–20','270','99.2','#e03a3e']
 ]:[['Aaron Judge','NYY','2022','62','99.8','#253b61'],['Shohei Ohtani','LAD','2024','54','99.4','#005a9c'],['Barry Bonds','SF','2001','73','100.0','#fd5a1e']];
 const score=(picks.reduce((sum,p)=>sum+Number(p[4]),0)/5).toFixed(1);
 return panel(row({justifyContent:'space-between',marginBottom:15},col({},label('STAT',b),T(stat,{fontSize:27,fontWeight:700})),scored('SCORE',score,'#c46bff',b)),
 ...[...picks,null,null].map((p,i)=>{
 const rail=B({width:52,height:82,flexShrink:0,alignItems:'center',justifyContent:'center',backgroundColor:p?p[5]+'66':'#05050666',borderRight:`1px solid ${p?p[5]:b.border}`},T('0'+(i+1),{fontSize:17,color:b.muted}));
 if(p)return row({height:84,marginBottom:8,border:`1px solid ${p[5]}`,borderRadius:7,backgroundColor:p[5]+'42',overflow:'hidden'},rail,row({flex:1,padding:'7px 12px',gap:12},logo(site,p[1],54),col({flex:1},T(p[0],{fontSize:23,fontWeight:700,whiteSpace:'nowrap'}),T(`${p[2]} · ${p[1]}`,{fontSize:16,color:b.muted,marginTop:3})),col({alignItems:'flex-end'},T(`${p[3]} ${isNBA?'3PM':'HR'}`,{fontSize:22,fontWeight:700}),T(p[4]+' PERCENTILE',{fontSize:13,color:'#c46bff',marginTop:3}))));
 const criteria=i===3?[['SEASONS',isNBA?'2000–01 — 2009–10':'2000–2009'],['SEASON AWARD','MVP']]:[['SEASONS',isNBA?'2010–11 — 2019–20':'2010–2019'],['SEASON AWARD','All-Star']];
 return row({height:84,marginBottom:8,border:`1px solid ${b.border}`,borderRadius:7,backgroundColor:'#151516e0',overflow:'hidden'},rail,...criteria.map(([heading,value],j)=>col({width:333,height:82,padding:'8px 13px',justifyContent:'center',borderRight:j===0?`1px solid ${b.border}`:'0'},label(heading,b),T(value,{fontSize:20,fontWeight:700,marginTop:5}))));
 }));
}
function higher(site){
 const b=brands[site],isNBA=site==='blacktop',picks=isNBA?[['Stephen Curry','GSW','24.5',true],['LeBron James','LAL','24.4',false]]:[['Shohei Ohtani','LAD','55',true],['Aaron Judge','NYY','53',false]];
 const card=([name,team,stat,correct])=>col({width:720,height:179,flexShrink:0,alignItems:'center',justifyContent:'center',gap:5,borderRadius:9,border:`1px solid ${correct?'#318866':b.border}`,backgroundColor:correct?'#2b6751':b.surface},logo(site,team,49),T(name,{fontSize:25,fontWeight:700,whiteSpace:'nowrap'}),T(team,{fontSize:14,color:correct?'#d4f6e8':b.muted}),T(stat,{padding:'3px 27px',backgroundColor:b.bg,border:`1px solid ${b.border}`,borderRadius:6,fontSize:25,fontWeight:700,color:correct?'#75d6b0':b.ink}));
 return panel(col({alignItems:'center',marginBottom:10},T('Who had more?',{fontSize:17,fontWeight:700,color:'#f8c844'}),T(isNBA?'2024–25 PPG':'2025 Home Runs',{fontSize:29,fontWeight:700,marginTop:2})),
 row({gap:10,marginBottom:10},...['SCORE','BEST'].map((s,i)=>row({width:355,height:43,padding:'6px 14px',border:`1px solid ${b.border}`,backgroundColor:b.surface,borderRadius:6,justifyContent:'space-between'},label(s,b),T(i?'12':'8',{fontSize:25,fontWeight:700,color:i?b.ink:'#ff844b'})))),
 card(picks[0]),row({height:34,gap:12},B({height:1,backgroundColor:b.border,flex:1}),T('OR',{fontSize:18,fontWeight:700}),B({height:1,backgroundColor:b.border,flex:1})),card(picks[1]));
}
const grids={
 blacktop:{rows:['LAL','MIA','BOS'],cols:['CLE','PHX','CHI'],players:['LeBron James','Shaquille O’Neal','Pau Gasol','Dwyane Wade','Goran Dragic','Jimmy Butler','Kyrie Irving','Isaiah Thomas','Rajon Rondo']},
 diamond:{rows:['NYY','LAD','BOS'],cols:['NYM','SEA','TEX'],players:['Juan Soto','Ichiro Suzuki','Alex Rodriguez','Mike Piazza','Chris Taylor','Corey Seager','Pedro Martinez','Adrian Beltre','Mike Napoli']}
};
function reverse(site){
 const b=brands[site],g=grids[site],left=24,top=43,header=78,gap=7,cw=178,ch=126,right=left+header+gap+cw*3+gap*2;
 const solvedRows=[0,2],solvedCols=[0,1];
 const headerBox=(team,solved,x,y,w,ht)=>col({position:'absolute',left:x,top:y,width:w,height:ht,alignItems:'center',justifyContent:'center',borderRadius:9,backgroundColor:b.surface,border:`1px solid ${solved?'#318866':b.border}`,gap:3},solved?logo(site,team,52):T('?',{fontSize:33,color:b.muted}),!solved?T('TAP TO GUESS',{fontSize:10,color:b.muted}):null);
 let nodes=[];
 g.cols.forEach((t,c)=>nodes.push(headerBox(t,solvedCols.includes(c),left+header+gap+c*(cw+gap),top,cw,72)));
 g.rows.forEach((t,r)=>{
 nodes.push(headerBox(t,solvedRows.includes(r),left,top+79+r*(ch+gap),header,ch));
 g.cols.forEach((ct,c)=>nodes.push(col({position:'absolute',left:left+header+gap+c*(cw+gap),top:top+79+r*(ch+gap),width:cw,height:ch,alignItems:'center',justifyContent:'center',backgroundColor:b.surface,border:site==='diamond'?`1px solid ${b.border}`:'0',borderRadius:6},playerName(g.players[r*3+c],21,cw-15),row({position:'absolute',bottom:6,right:6,gap:4},...[solvedRows.includes(r)?t:null,solvedCols.includes(c)?ct:null].map(team=>B({width:23,height:23,backgroundColor:site==='blacktop'?'#28282c':'#142d4a',borderRadius:4,alignItems:'center',justifyContent:'center'},team?logo(site,team,21):null))))));
 });
 return panel(row({width:right-left,marginLeft:left,justifyContent:'space-between'},label('SCORE',b),T('4 / 6',{fontSize:26,fontWeight:700,color:site==='blacktop'?'#f8c844':'#75d6b0'})),...nodes);
}
const games=[
 ['blacktop','fastbreak','Fast Break','Name every player who fits the NBA stat.','#fd655f',board],
 ['blacktop','higherlower','Higher Lower','Pick the player with the higher stat.','#ff844b',higher],
 ['blacktop','statstack','Stat Stack','Build the highest-percentile NBA lineup.','#c46bff',stack],
 ['blacktop','reverseimmaculate','Reverse Immaculate','Find the missing teams in the NBA grid.','#f8c844',reverse],
 ['diamond','strikeout','Strikeout','Name every player who fits the MLB stat.','#fd655f',board],
 ['diamond','higherlower','Higher Lower','Pick the player with the higher stat.','#ff844b',higher],
 ['diamond','statstack','Stat Stack','Build the highest-percentile MLB lineup.','#c46bff',stack],
 ['diamond','reverseimmaculate','Reverse Immaculate','Find the missing teams in the MLB grid.','#f4f0e6',reverse]
];
export function createGameImage(slug){
 const site='diamond';
 const game=games.find(g=>g[0]===site&&g[1]===slug);
 if(!game)throw new Error('Unknown game preview');
 const [_,__,title,description,accent,render]=game;
 const b=brands[site],node=B({width:1200,height:630,backgroundColor:b.bg,color:b.ink,fontFamily:'Barlow',position:'relative'},row({position:'absolute',left:46,top:42,gap:13},I(b.icon,42,42,{borderRadius:10}),T(b.name,{fontSize:26,fontWeight:700})),col({position:'absolute',left:46,top:174,width:360},T(title,{fontFamily:'Barlow Condensed',fontSize:title==='Reverse Immaculate'?62:94,fontWeight:700,lineHeight:1.03,color:accent}),T(description,{fontSize:28,color:b.muted,lineHeight:1.25,marginTop:25,maxWidth:330})),B({position:'absolute',left:450,top:48,width:720,height:540},render(site)),T(b.domain+'/'+slug,{position:'absolute',left:46,bottom:38,fontSize:18,color:b.muted}));
 return new ImageResponse(node,{width:1200,height:630,fonts});
}
