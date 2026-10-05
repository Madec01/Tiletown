// Architecture originale de Tiletown : maisons de bourg, commerces et équipements.
// Géométries réelles exportées en GLB, sans textures externes. Dimensions en unités de parcelle.
// Les grands volumes priment ; menuiseries, tuiles et plantations se lisent ensuite au zoom.

function builder() {
  const parts = [];
  const box = (w,h,d,x,y,z,color,bevel=0) => parts.push({ primitive:'box',size:[w,h,d],at:[x,y,z],color,bevel });
  const cylinder = (r,h,x,y,z,color,segments=12,topRadius=r) => parts.push({primitive:'cylinder',radius:r,height:h,at:[x,y,z],color,segments,topRadius,smooth:true});
  const prism = (points,depth,x,y,z,color,yaw=0) => parts.push({primitive:'prism',points,depth,at:[x,y,z],color,yaw});
  const beam = (a,b,width,color) => {
    const [dx,dy,dz]=b.map((v,i)=>v-a[i]), length=Math.hypot(dx,dy,dz);
    const yaw=Math.atan2(dx,dz)*180/Math.PI;
    parts.push({primitive:'box',size:[width,length,width],at:a,color,tilt:[Math.atan2(Math.hypot(dx,dz),dy)*180/Math.PI,0],yaw});
  };
  function arch(w,h,d,x,y,z,color,yaw=0) {
    const r=w/2, points=[[-r,0],[r,0]];
    for(let i=0;i<=10;i++) {const a=i*Math.PI/10;points.push([Math.cos(a)*r,h-r+Math.sin(a)*r]);}
    prism(points,d,x,y,z,color,yaw);
  }
  function plant(x,y,z,r=.04,flower=false) {
    cylinder(r*.6,r*1.2,x,y,z,'roofTerracotta',8,r*.85);
    parts.push({primitive:'blob',radii:[r,r*.75,r],at:[x,y+r*.7,z],color:'foliageDeep',segments:7,rings:4,jitter:.12,seed:7});
    if(flower) for(let i=0;i<3;i++) cylinder(r*.25,r*.3,x+(i-1)*r*.4,y+r*1.9,z,'blossom',6);
  }
  function windowAt(x,y,z,{w=.11,h=.14,shutters=false,balcony=false,color='roofSlateDark',side=0,arched=false}={}) {
    // Une façade est construite face au sud, puis tournée autour du centre de sa fenêtre.
    const start=parts.length;
    box(w+.026,h+.024,.018,0,-.012,0,'wallCream');
    if(arched) arch(w,h,.012,0,0,.014,'glassDeep');
    else box(w,h,.015,0,0,.014,'glassDeep');
    box(w*.39,h*.83,.006,-w*.24,h*.06,.026,'glass');
    box(.011,h,.012,0,0,.028,'wallCream');
    box(w,.009,.012,0,h*.48,.028,'wallCream');
    box(w+.044,.019,.047,0,-.022,.01,'baseWarm');
    if(shutters) for(const sign of [-1,1]) {
      box(w*.3,h+.016,.018,sign*w*.7,-.008,.002,color);
      for(let k=1;k<4;k++) box(w*.25,.006,.006,sign*w*.7,k*h/4,.014,'wallTan');
    }
    if(balcony) {
      box(w+.1,.022,.13,0,-.037,.057,'baseStone');
      box(w+.1,.012,.014,0,.025,.114,'trunkDark');
      for(let k=-2;k<=2;k++) box(.008,.055,.01,k*(w+.075)/4,-.03,.114,'trunkDark');
      plant(w*.35,-.013,.083,.02,true);
    }
    const angle=side*Math.PI/180;
    for(const p of parts.slice(start)) {
      const [px,py,pz]=p.at;
      p.at=[x+px*Math.cos(angle)+pz*Math.sin(angle),y+py,z-px*Math.sin(angle)+pz*Math.cos(angle)];
      p.yaw=(p.yaw||0)+side;
    }
  }
  function door(x,y,z,color='roofSlateDark',w=.13,h=.22) {
    arch(w+.04,h+.03,.035,x,y,z,'baseWarm');
    arch(w,h,.016,x,y,z+.024,color);
    arch(w*.7,h*.45,.006,x,y+h*.46,z+.035,'glassDeep');
    box(.016,.016,.014,x+w*.3,y+h*.38,z+.037,'sun');
    box(w+.08,.023,.105,x,y-.02,z+.03,'baseStone');
  }
  function roof(w,d,rise,x,y,z,color='roofTerracotta',{dormer=false}={}) {
    const half=w/2;
    prism([[-half,0],[half,0],[0,rise]],d,x,y,z,color);
    // Gouttières, faîtière et cinq rangs de tuiles par pan, intégrés au même mesh.
    box(w+.015,.025,d+.035,x,y-.025,z,'wallCream');
    box(.039,.03,d+.035,x,y+rise-.008,z,color);
    for(const sign of [-1,1]) for(let row=1;row<=5;row++) {
      const t=row/6, px=sign*half*t, py=rise*(1-t);
      const tileColor=color==='roofSlateDark'?'roofSlate':color==='roofBrown'?color:'roofTile';
      box(.012,.008,d+.016,x+px,y+py+.004,z,row%2?tileColor:color);
    }
    if(dormer) {
      const dx=x+w*.24, dy=y+rise*.36;
      box(.14,.135,.17,dx,dy,z+d*.27,'wallCream');
      windowAt(dx,dy+.025,z+d*.27+.088,{w:.08,h:.085});
      prism([[-.09,0],[.09,0],[0,.08]],.2,dx,dy+.135,z+d*.27,color);
    }
    box(.078,rise*.65+.16,.072,x-w*.25,y+rise*.32,z-d*.2,'wallBeige',.006);
    box(.108,.032,.098,x-w*.25,y+rise*.97+.14,z-d*.2,'roofBrown',.006);
    box(.054,.009,.05,x-w*.25,y+rise*.97+.173,z-d*.2,'trunkDark');
  }
  function facade(w,d,height,x,y,z,wall,{floors=2,shutters=true,balconies=false,accent='roofSlateDark',front=true}={}) {
    box(w,height,d,x,y,z,wall,.014);
    box(w+.022,.065,d+.02,x,y,z,'baseWarm',.008);
    for(let f=0;f<floors;f++) {
      const wy=y+.12+f*(height/floors), wh=Math.min(.16,height/floors-.13);
      for(const side of [0,90,180,270]) for(const sign of [-1,1]) {
        if(front && side===0 && f===0 && sign===1) continue;
        const along=sign*(side%180?d:w)*.25;
        const xx=side===0||side===180?x+along:x+(side===90?1:-1)*w/2;
        const zz=side===90||side===270?z+along:z+(side===0?1:-1)*d/2;
        windowAt(xx,wy,zz,{w:Math.min(.115,(side%180?d:w)*.22),h:wh,shutters,color:accent,side,balcony:balconies&&f>0&&side===0});
      }
      if(f>0) box(w+.018,.021,d+.018,x,y+f*height/floors-.025,z,'wallCream');
    }
    if(front) door(x+w*.23,y+.025,z+d/2,accent);
  }
  function garden({fence=true}={}) {
    box(.82,.014,.8,0,0,0,'baseWarm',.02);
    box(.25,.017,.31,-.24,.015,.22,'foliageOlive',.02);
    for(const x of [-.33,.32]) plant(x,.018,.29,.048,true);
    if(fence) for(let i=0;i<6;i++) box(.026,.10,.018,-.37+i*.09,.02,-.38,'wallCream');
    if(fence) box(.48,.017,.02,-.145,.095,-.38,'wallCream');
    for(let i=0;i<3;i++) box(.09,.019,.065,.12,.016,.25+i*.065,'wallCream',.006);
  }
  function awning(x,y,z,w,color='roofTerracotta') {
    for(let i=0;i<7;i++) {
      const c=i%2?'wallCream':color;
      parts.push({primitive:'box',size:[w/7,.026,.19],at:[x-w/2+(i+.5)*w/7,y,z],color:c,tilt:[-12,0]});
      box(w/7,.045,.015,x-w/2+(i+.5)*w/7,y-.04,z+.085,c);
    }
  }
  function cafeTable(x,z,color='roofTerracotta',umbrella=false) {
    cylinder(.044,.012,x,.105,z,'wood',12);cylinder(.008,.10,x,.01,z,'trunkDark',8);
    for(const sign of [-1,1]) {
      box(.038,.012,.038,x+sign*.075,.062,z,'wallCream');
      box(.01,.07,.035,x+sign*.09,.027,z,'trunkDark');
    }
    if(umbrella) {
      cylinder(.008,.3,x,.01,z,'wood',8);
      parts.push({primitive:'cone',radius:.13,height:.08,at:[x,.30,z],color,segments:12});
      cylinder(.13,.014,x,.291,z,'wallCream',12);
    }
  }
  return {parts,box,cylinder,prism,beam,arch,plant,windowAt,door,roof,facade,garden,awning,cafeTable};
}

function house(variant) {
  const b=builder(), colors=['wallCream','wallGreen','wallPink','wallOchre','wallBlue','wallBeige'];
  const roofs=['roofTerracotta','roofTile','roofSlateDark','roofTerracotta','roofSlateDark','roofBrown'];
  const accents=['foliageDeep','roofSlateDark','roofSlateDark','foliageDeep','roofTerracotta','trunkDark'];
  b.garden();
  if(variant===4) {
    for(const sign of [-1,1]) {
      const h=sign<0?.56:.68;
      b.facade(.31,.48,h,sign*.168,.03,-.065,sign<0?'wallBlue':'wallCream',{floors:2,accent:accents[variant]});
      b.roof(.35,.54,.16,sign*.168,h+.03,-.065,roofs[variant]);
    }
  } else {
    const height=variant===2?.84:variant===5?.50:.61, width=variant===1?.47:.61, depth=.49;
    b.facade(width,depth,height,0,.03,-.05,colors[variant],{floors:variant===2?3:2,accent:accents[variant],balconies:variant===0||variant===2});
    b.roof(width+.07,depth+.07,variant===5?.31:.24,0,height+.03,-.05,roofs[variant],{dormer:variant!==5});
    if(variant===1) {
      b.facade(.27,.32,.33,-.235,.03,.02,'wallCream',{floors:1,accent:accents[variant]});
      b.roof(.31,.37,.17,-.235,.36,.02,roofs[variant]);
    }
    if(variant===3) {
      b.cylinder(.105,.84,-.265,.025,.14,'wallOchre',8);
      b.parts.push({primitive:'cone',radius:.15,height:.27,at:[-.265,.865,.14],color:'roofSlateDark',segments:8});
      b.windowAt(-.265,.61,.247,{w:.07,h:.14,arched:true});
    }
    if(variant===5) {
      for(const x of [-.3,0,.3]) b.box(.025,height,.019,x,.03,.205,'trunkDark');
      b.box(.63,.024,.025,0,.28,.209,'trunkDark');
      for(const sign of [-1,1]) b.beam([sign*.3,.55,.234],[0,.83,.234],.024,'trunkDark');
      b.windowAt(0,.57,.232,{w:.08,h:.105,shutters:true,color:'trunkDark'});
    }
  }
  return b.parts;
}

function apartment(variant,tall=false) {
  const b=builder(), floors=tall?4+variant:2+variant%2, height=floors*.31;
  const wall=['wallOchre','wallCream','wallPink'][variant], roof=['roofSlateDark','roofTerracotta','roofBrown'][variant];
  b.garden({fence:false});
  b.facade(.64,.52,height,0,.025,-.065,wall,{floors,balconies:true,shutters:false,accent:'trunkDark'});
  b.box(.71,.045,.59,0,height+.025,-.065,'wallCream',.008);
  b.prism([[-.35,0],[.35,0],[.26,.17],[-.26,.17]],.60,0,height+.07,-.065,roof);
  b.box(.54,.028,.60,0,height+.24,-.065,roof);
  for(const x of [-.19,.19]) {
    b.box(.13,.13,.09,x,height+.08,.239,'wallCream');
    b.windowAt(x,height+.095,.287,{w:.078,h:.09});
    b.prism([[-.085,0],[.085,0],[0,.06]],.11,x,height+.21,.247,roof);
  }
  for(const x of [-.32,.32]) for(let f=0;f<floors*2;f++) b.box(.045,.075,.55,x,.035+f*.155,-.065,'wallCream');
  b.awning(-.16,.275,.29,.26,variant===1?'foliageDeep':'roofTerracotta');
  b.plant(.3,.028,.29,.05,true);
  return b.parts;
}

function shop(variant) {
  const b=builder(), wall=['wallCream','wallPink','wallOchre'][variant], accent=['foliageDeep','roofTerracotta','roofSlateDark'][variant];
  b.garden({fence:false});
  b.facade(.64,.46,.69,0,.025,-.07,wall,{floors:2,shutters:false,front:false});
  b.roof(.71,.53,.24,0,.715,-.07,variant===1?'roofSlateDark':'roofTerracotta',{dormer:true});
  // Grande vitrine en retrait, soubassement coloré et porte séparée.
  b.box(.42,.24,.027,-.095,.08,.171,accent);
  b.box(.37,.175,.025,-.095,.115,.19,'glassDeep');
  b.box(.011,.18,.012,-.09,.112,.21,'wallCream');
  b.box(.37,.012,.012,-.095,.23,.21,'wallCream');
  b.door(.235,.025,.169,accent,.1,.27);
  b.awning(0,.40,.235,.7,accent);
  b.box(.49,.072,.032,-.09,.31,.186,accent,.006);
  // Emblème sans texte : pain, fleur ou tasse selon le commerce.
  b.cylinder(.035,.12,-.095,.326,.209,'sun',10);
  b.parts[b.parts.length-1].tilt=[90,0];
  b.cafeTable(-.23,.31,accent,variant!==2);
  b.plant(.33,.016,.30,.044,true);
  return b.parts;
}

function office(variant) {
  const b=builder(), floors=variant?4:3,height=floors*.31;
  b.garden({fence:false});
  b.box(.62,height,.53,0,.02,-.065,variant?'wallBeige':'wallCream',.016);
  for(let f=0;f<floors;f++) {
    b.box(.66,.026,.57,0,.02+f*.31,-.065,'wallCream');
    for(const side of [0,90,180,270]) for(const k of [-1,0,1]) {
      const angle=side*Math.PI/180,offset=k*.17,radius=side%180?.316:.271;
      b.windowAt(offset*Math.cos(angle)+radius*Math.sin(angle),.095+f*.31,-.065+radius*Math.cos(angle)-offset*Math.sin(angle),{w:.135,h:.19,side});
    }
  }
  b.box(.67,.045,.59,0,height+.02,-.065,'baseStone',.008);
  b.box(.59,.026,.51,0,height+.066,-.065,'foliageOlive');
  for(const x of [-.24,.24]) b.plant(x,height+.09,-.18,.06);
  b.box(.23,.17,.2,.10,height+.08,.03,'wallCream',.012);
  b.box(.27,.021,.24,.10,height+.25,.03,'roofSlateDark');
  b.door(.05,.025,.208,'trunkDark',.17,.25);
  b.awning(.05,.30,.28,.33,'trunkDark');
  return b.parts;
}

function civic(kind) {
  const b=builder();b.garden({fence:false});
  if(kind==='townhall') {
    b.facade(.69,.46,.62,0,.025,-.055,'wallCream',{floors:2,shutters:false,front:false});
    b.roof(.76,.53,.24,0,.645,-.055,'roofSlateDark');
    for(const x of [-.13,.13]) b.cylinder(.021,.37,x,.035,.24,'wallCream',12);
    b.box(.35,.035,.15,0,.4,.235,'wallBeige');
    b.prism([[-.20,0],[.20,0],[0,.13]],.16,0,.435,.235,'wallCream');
    b.door(0,.025,.2,'trunkDark',.16,.30);
    b.box(.19,.24,.19,0,.78,-.055,'wallCream',.012);
    b.parts.push({primitive:'cone',radius:.17,height:.22,at:[0,1.02,-.055],color:'roofSlateDark',segments:4,yaw:45});
    // Cadran : disque et aiguilles, aucun texte dans la scène.
    b.cylinder(.062,.015,0,.924,.049,'wallCream',20);
    b.parts[b.parts.length-1].tilt=[90,0];
    b.box(.011,.043,.012,0,.896,.061,'trunkDark');
    b.box(.039,.009,.012,.014,.896,.063,'trunkDark');
    b.cylinder(.008,.21,.24,.84,-.08,'metal',8);b.box(.105,.065,.008,.287,.97,-.08,'roofTerracotta');
  } else if(kind==='school') {
    b.facade(.50,.40,.56,0,.025,-.09,'wallOchre',{floors:2,shutters:false});
    b.roof(.58,.47,.24,0,.585,-.09,'roofTerracotta',{dormer:true});
    for(const sign of [-1,1]) {
      b.facade(.16,.40,.31,sign*.32,.025,-.06,'wallCream',{floors:1,shutters:false,front:false});
      b.roof(.22,.46,.12,sign*.32,.335,-.06,'roofTerracotta');
    }
    for(let i=0;i<3;i++) b.box(.09,.007,.06,-.2+i*.1,.03,.29,['roofSlate','sun','blossom'][i]);
  } else {
    b.facade(.65,.48,.66,0,.025,-.06,'wallCream',{floors:2,shutters:false,accent:'foliageDeep'});
    b.box(.70,.04,.53,0,.685,-.06,'foliageDeep',.009);
    b.box(.59,.027,.42,0,.726,-.06,'foliageOlive');
    b.box(.14,.043,.035,0,.53,.20,'blossom');
    b.box(.043,.14,.035,0,.48,.20,'blossom');
    b.awning(.16,.29,.26,.28,'foliageDeep');
    b.plant(-.25,.75,-.2,.045);
  }
  return b.parts;
}

function market() {
  const b=builder();b.garden({fence:false});
  for(const sign of [-1,1]) {
    const x=sign*.21;
    b.box(.30,.18,.26,x,.02,0,'wood');
    for(const sx of [-1,1]) for(const sz of [-1,1]) b.box(.024,.43,.024,x+sx*.14,.02,sz*.12,'trunkDark');
    b.awning(x,.47,0,.34,sign<0?'roofTerracotta':'foliageDeep');
    for(let row=0;row<2;row++) for(let col=0;col<3;col++) {
      b.box(.066,.035,.08,x+(col-1)*.084,.20,(row-.5)*.1,'wallTan');
      for(let k=0;k<3;k++) b.cylinder(.014,.023,x+(col-1)*.084+(k-1)*.016,.235,(row-.5)*.1,['sun','blossom','foliageSpring'][col],7);
    }
  }
  b.cafeTable(0,.30,'roofTile',true);return b.parts;
}

const spec = (parts,note) => ({kit:'tiletown',parts,fit:.86,footprint:[1,1],note});
export const ARCHITECTURE = {};
for(let i=0;i<6;i++) ARCHITECTURE[`house-${String.fromCharCode(97+i)}`]=spec(house(i),'Maison de bourg originale : façade, menuiseries, toit et jardin');
for(let i=0;i<3;i++) {
  ARCHITECTURE[`building-small-${String.fromCharCode(97+i)}`]=spec(apartment(i),'Petit immeuble à mansarde, balcons et commerce');
  ARCHITECTURE[`building-tall-${String.fromCharCode(97+i)}`]=spec(apartment(i,true),'Immeuble de ville à corniches, balcons et lucarnes');
  ARCHITECTURE[`shop-${String.fromCharCode(97+i)}`]=spec(shop(i),'Commerce de quartier à vitrine, auvent rayé et terrasse');
}
for(let i=0;i<2;i++) ARCHITECTURE[`office-${String.fromCharCode(97+i)}`]=spec(office(i),'Bureaux à grandes baies et toiture végétalisée');
for(const id of ['townhall','school','clinic']) ARCHITECTURE[id]=spec(civic(id),'Équipement civique original avec architecture identifiable');
ARCHITECTURE.market=spec(market(),'Halle de marché avec étals, cagettes et produits');
