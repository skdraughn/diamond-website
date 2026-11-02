// Approved lineup preview. All artwork and fonts are bundled; no network requests.
import React from 'react';
import { ImageResponse } from 'next/og.js';
import config from './config.json';
import assets from './assets.json';
const h=React.createElement;
const box=(style,...children)=>h('div',{style:{display:'flex',...style}},...children);
const text=(s,style={})=>box(style,s);
const image=(src,width,height,style={})=>h('img',{src,width,height,style});
const svg=(body,w=730,hgt=570)=>'data:image/svg+xml;base64,'+Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}">${body}</svg>`).toString('base64');
const positions={
 gridiron:{WR:[.03,.39],TE:[.30,.39],FLEX:[.7875,.39],QB:[.52,.17],RB:[.7875,.03],DEF:[.40875,.725]},
 blacktop:{PG:[.40875,.188],SF:[.024,.33],SG:[.7935,.33],PF:[.12,.731],C:[.6975,.731]},
 diamond:{FLEX:[.40875,.0475],OF:[.69875,.1575],IF:[.10875,.4275],P:[.40875,.4575],C:[.40875,.7275]}
};
const positionColors={QB:'#f4c444',WR:'#ef8951',RB:'#ef6b96',TE:'#60ba99',FLEX:'#2bb7ff',DEF:'#2bb7ff',PG:'#6dc7ff',SG:'#ef87a1',SF:'#c59cff',PF:'#f0b55d',C:'#70d8c6',P:'#7fc6ff',IF:'#f2c26d',OF:'#7bd7ae'};
function surface(kind,background){
 let body='';
 if(kind==='gridiron'){
  for(let i=0;i<7;i++){let y=i/6*564*.75;body+=`<path d="M0 ${y}H600" stroke="#fff" stroke-opacity=".16"/>`;}
  for(let i=0;i<6;i++){let y=(i+.5)/6*564*.75;body+=`<path d="M234 ${y}h10M356 ${y}h10" stroke="#fff" stroke-opacity=".18"/>`;}
 }else if(kind==='blacktop'){
  body='<g stroke="#2BB7FF" stroke-opacity=".8" stroke-width="2" fill="none"><circle cx="300" cy="-4" r="72"/><path d="M36 564V394M564 564V394"/><path d="M15 394A285 285 0 0 1 585 394"/><rect x="204" y="336" width="192" height="228"/><circle cx="300" cy="336" r="72"/></g>';
 }
 return box({position:'absolute',inset:0},background?image(background,600,564,{objectFit:'cover',position:'absolute',top:0,left:0}):null,background?box({position:'absolute',left:0,top:0,width:600,height:564,backgroundColor:'rgba(0,2,4,.48)'}):null,image(svg(body,600,564),600,564,{position:'absolute',top:0,left:0}));
}
function card(p,logo,kind){const [pos,name,,,,color]=p;const [x,y]=positions[kind][pos];const parts=name.split(' ');
 return box({position:'absolute',left:Math.round(x*600),top:Math.round(y*564),width:110,height:139,backgroundColor:kind==='gridiron'?'#18181b':'rgba(8,18,32,.95)',border:`2px solid ${color}`,borderRadius:10,alignItems:'center',flexDirection:'column',padding:6},
  text(pos,{fontSize:14,fontWeight:700,color:positionColors[pos],height:20}),
  image(logo,65,65,{objectFit:'contain',marginTop:2,marginBottom:5}),
  text(parts[0],{fontSize:15,fontWeight:700,color:'#f4f0e6',lineHeight:1}),
  text(parts.slice(1).join(' '),{fontSize:15,fontWeight:700,color:'#f4f0e6',lineHeight:1.1,marginTop:2}));
}
export async function createGameImage(){
 const kind=config.kind,c=config;
 const {logos,background,icon}=assets;
 const regular=Buffer.from(assets.fonts['Barlow-Regular.ttf'],'base64');
 const bold=Buffer.from(assets.fonts['Barlow-Bold.ttf'],'base64');
 const condensed=Buffer.from(assets.fonts['BarlowCondensed-Bold.ttf'],'base64');
 const element=box({width:1200,height:630,backgroundColor:c.bg,color:'#f4f0e6',fontFamily:'Barlow',position:'relative'},
  box({position:'absolute',left:48,top:42,alignItems:'center',gap:13},image(icon,42,42,{borderRadius:10}),text(c.brand,{fontSize:26,fontWeight:700})),
  box({position:'absolute',left:48,top:137,width:354,flexDirection:'column'},
   text(c.game,{fontFamily:'Barlow Condensed',fontSize:130,fontWeight:700,lineHeight:1,color:'#2BB7FF',letterSpacing:-3}),
   text(`Build an undefeated ${c.sport} team.`,{fontSize:40,fontWeight:700,lineHeight:1.13,marginTop:24,maxWidth:345}),
   text('Draw a team and decade.\nChoose your players.',{fontSize:23,lineHeight:1.35,color:kind==='diamond'?'#dcebff':'#c7c0b5',whiteSpace:'pre-wrap',marginTop:23,maxWidth:330})),
  text(c.domain,{position:'absolute',left:48,bottom:38,fontSize:18,color:'#9caab5'}),
  box({position:'absolute',left:550,top:28,width:600,height:564,backgroundColor:kind==='gridiron'?'#092419':c.surface,border:'2px solid #2BB7FF',borderRadius:18,overflow:'hidden'},surface(kind,background),...c.players.map((p,i)=>card(p,logos[i],kind))));
 return new ImageResponse(element,{width:1200,height:630,fonts:[{name:'Barlow',data:regular,weight:400,style:'normal'},{name:'Barlow',data:bold,weight:700,style:'normal'},{name:'Barlow Condensed',data:condensed,weight:700,style:'normal'}]});
}