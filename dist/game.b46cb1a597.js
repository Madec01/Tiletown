var it={"assets/fonts/Nunito-latin-ext.woff2":"2c8d792869","assets/fonts/Nunito-latin.woff2":"ba344451ea","assets/icons/apple-touch-icon.png":"89a7440dad","assets/icons/favicon-32.png":"5006ed0364","assets/icons/icon-192.png":"f0e006b9bd","assets/icons/icon-512.png":"ff04655865","assets/icons/icon-maskable-192.png":"78fe1d888d","assets/icons/icon-maskable-512.png":"64571da092","assets/icons/icon-monochrome-512.png":"34e7df917e","assets/models/bee.glb":"f3a7a189df","assets/models/bridge.glb":"001930e968","assets/models/building-small-a.glb":"4e68cad04f","assets/models/building-small-b.glb":"4f92dca36f","assets/models/building-tall-a.glb":"fee56496a3","assets/models/building-tall-b.glb":"d9f4f5192a","assets/models/bus.glb":"455213785a","assets/models/bush.glb":"ec94ef3952","assets/models/car-a.glb":"f680d60696","assets/models/car-b.glb":"2645aed420","assets/models/citizen-a.glb":"630a156dfb","assets/models/citizen-b.glb":"af5c9ae3a8","assets/models/citizen-c.glb":"c924f4dd91","assets/models/clinic.glb":"6abcf67e91","assets/models/compost.glb":"36b0764219","assets/models/cow.glb":"6f733876b4","assets/models/crop-corn.glb":"8fff89afb5","assets/models/crop-wheat.glb":"3e7b221969","assets/models/cyclist.glb":"34367742f2","assets/models/deer.glb":"6413ca117d","assets/models/duck.glb":"317c1381c8","assets/models/factory-a.glb":"e2c6a7d19f","assets/models/factory-b.glb":"26588bb743","assets/models/flowers.glb":"2830556365","assets/models/fox.glb":"c6a4b1ba53","assets/models/heron.glb":"c410b77ecb","assets/models/house-a.glb":"6f4f0a5e4c","assets/models/house-b.glb":"daeb472919","assets/models/house-c.glb":"47a4da7c8a","assets/models/manifest.json":"dbf124ffc0","assets/models/market.glb":"2986605864","assets/models/office-a.glb":"a1ae95ee0c","assets/models/otter.glb":"0792002d9d","assets/models/owl.glb":"ff7e89c7ea","assets/models/park.glb":"948dea911b","assets/models/pine-a.glb":"822cadca3f","assets/models/pine-b.glb":"ddd4bfb351","assets/models/power-plant.glb":"9e1dbd9ae0","assets/models/road-corner.glb":"4560193436","assets/models/road-cross.glb":"80802c8477","assets/models/road-crosswalk.glb":"d2dbf10ca7","assets/models/road-edge-node-2.glb":"3bc23dbda5","assets/models/road-edge-node-3.glb":"88820965e4","assets/models/road-edge-node-4.glb":"1aac8c1260","assets/models/road-edge-straight.glb":"8fa46ad74a","assets/models/road-straight.glb":"980910ecdd","assets/models/road-t.glb":"6a95e4bbb5","assets/models/rock-a.glb":"62ead34227","assets/models/rock-b.glb":"fe4715e6e7","assets/models/school.glb":"f778a0c487","assets/models/shop-a.glb":"f23a336ce2","assets/models/shop-b.glb":"6c434162ad","assets/models/solar.glb":"343329c2be","assets/models/swallow.glb":"5d146673e1","assets/models/townhall.glb":"bdb8ec81b7","assets/models/tram-stop.glb":"ab8d3bdfb2","assets/models/tram.glb":"6db7d6692a","assets/models/tree-a.glb":"05a293930e","assets/models/tree-b.glb":"2fc229cf6f","assets/models/tree-c.glb":"11382f210c","assets/models/truck.glb":"1c19e9181b","assets/models/wastewater.glb":"828f751f42","assets/models/water-tower.glb":"01101f10c1","assets/models/wind-turbine.glb":"397b8abb2d"};function o0(i,e=""){let t=`${i}|${e}`,n=2166136261;for(let s=0;s<t.length;s++)n^=t.charCodeAt(s),n=Math.imul(n,16777619)>>>0;return n===0?2654435769:n}function js(i,e=""){let t=o0(i,e);function n(){t=t+1831565813>>>0;let s=t;return s=Math.imul(s^s>>>15,s|1),s^=s+Math.imul(s^s>>>7,s|61),((s^s>>>14)>>>0)/4294967296}return{seed:i,salt:e,next:n,int(s,r){return r<s&&([s,r]=[r,s]),s+Math.floor(n()*(r-s+1))},range(s,r){return s+n()*(r-s)},chance(s){return n()<s},pick(s){if(!(!s||s.length===0))return s[Math.floor(n()*s.length)]},shuffle(s){let r=Array.from(s);for(let a=r.length-1;a>0;a--){let o=Math.floor(n()*(a+1)),l=r[a];r[a]=r[o],r[o]=l}return r},fork(s){return js(i,`${e}/${s}`)},state(){return t}}}var Hi=Object.freeze([Object.freeze({dir:"N",dx:0,dy:-1}),Object.freeze({dir:"E",dx:1,dy:0}),Object.freeze({dir:"S",dx:0,dy:1}),Object.freeze({dir:"W",dx:-1,dy:0})]),c0=Object.freeze([...Hi,Object.freeze({dir:"NE",dx:1,dy:-1}),Object.freeze({dir:"SE",dx:1,dy:1}),Object.freeze({dir:"SW",dx:-1,dy:1}),Object.freeze({dir:"NW",dx:-1,dy:-1})]),XE=Object.freeze({N:"S",S:"N",E:"W",W:"E"});function _t(i,e,t){return t*i.cols+e}function ii(i,e,t){return e>=0&&t>=0&&e<i.cols&&t<i.rows}function Ht(i,e,t){return ii(i,e,t)?i.tiles[_t(i,e,t)]:null}function Rn(i,e,t){let n=[];for(let s of Hi){let r=e+s.dx,a=t+s.dy;ii(i,r,a)&&n.push({x:r,y:a,dir:s.dir})}return n}function Ks(i,e,t){let n=[];for(let s of c0){let r=e+s.dx,a=t+s.dy;ii(i,r,a)&&n.push({x:r,y:a,dir:s.dir,dx:s.dx,dy:s.dy})}return n}function l0(i,e,t){return t*i.cols+e}function u0(i,e,t){return t*(i.cols+1)+e}function en(i,e,t,n){return{kind:e,index:e==="h"?l0(i,t,n):u0(i,t,n),x:t,y:n}}function uo(i,e,t){return{n:en(i,"h",e,t),s:en(i,"h",e,t+1),w:en(i,"v",e,t),e:en(i,"v",e+1,t)}}function Xl(i,e){let t=e.kind==="h"?{x:e.x,y:e.y-1}:{x:e.x-1,y:e.y},n={x:e.x,y:e.y};return[ii(i,t.x,t.y)?t:null,ii(i,n.x,n.y)?n:null]}function Cn(i,e){return i.edges[e.kind][e.index]}function Kt(i,e,t){return t*(i.cols+1)+e}function Xf(i,e){return{cx:e%(i.cols+1),cy:Math.floor(e/(i.cols+1))}}function Ys(i,e,t){return[{cx:e,cy:t},{cx:e+1,cy:t},{cx:e,cy:t+1},{cx:e+1,cy:t+1}]}function jf(i,e,t){let n=[];return e<i.cols&&n.push({ref:en(i,"h",e,t),to:{cx:e+1,cy:t}}),e>0&&n.push({ref:en(i,"h",e-1,t),to:{cx:e-1,cy:t}}),t<i.rows&&n.push({ref:en(i,"v",e,t),to:{cx:e,cy:t+1}}),t>0&&n.push({ref:en(i,"v",e,t-1),to:{cx:e,cy:t-1}}),n}function jl(i,e){return{h:new Uint8Array((e+1)*i),v:new Uint8Array(e*(i+1))}}function $r(i,e){return{h:new Float32Array((e+1)*i),v:new Float32Array(e*(i+1))}}function h0(i){return{...i,building:i.building?{...i.building}:null}}function Kl(i){let e=i.edges?{h:Uint8Array.from(i.edges.h),v:Uint8Array.from(i.edges.v)}:jl(i.cols,i.rows),t=i.traffic?{h:Float32Array.from(i.traffic.h),v:Float32Array.from(i.traffic.v)}:$r(i.cols,i.rows);return{...i,tiles:i.tiles.map(h0),edges:e,traffic:t}}var yi=Object.freeze({grass:Object.freeze({id:"grass",label:"Herbe",color:"grass",buildable:!0,clearingCost:0,roadCost:1,habitat:null,airSink:0,water:!1,models:[]}),meadow:Object.freeze({id:"meadow",label:"Prairie fleurie",color:"grassLight",buildable:!0,clearingCost:0,roadCost:1,habitat:"meadow",airSink:1,water:!1,models:["flowers"]}),forest:Object.freeze({id:"forest",label:"Forêt ancienne",color:"forestDark",buildable:!0,clearingCost:80,roadCost:3,habitat:"forest",airSink:6,water:!1,models:["tree-a","tree-b","tree-c","pine-a","pine-b"]}),field:Object.freeze({id:"field",label:"Champ",color:"wheat",buildable:!0,clearingCost:20,roadCost:1,habitat:null,airSink:0,water:!1,models:["crop-wheat","crop-corn"]}),river:Object.freeze({id:"river",label:"Rivière",color:"river",buildable:!1,clearingCost:null,roadCost:5,habitat:null,airSink:0,water:!0,models:[]}),lake:Object.freeze({id:"lake",label:"Lac",color:"lakeDeep",buildable:!1,clearingCost:null,roadCost:null,habitat:"lake",airSink:1,water:!0,models:[]}),wetland:Object.freeze({id:"wetland",label:"Zone humide",color:"wetland",buildable:!1,clearingCost:null,roadCost:null,habitat:"wetland",airSink:3,water:!0,models:["bush"]}),hill:Object.freeze({id:"hill",label:"Colline",color:"rock",buildable:!1,clearingCost:null,roadCost:2,habitat:null,airSink:0,water:!1,models:["rock-a","rock-b"]})}),YE=Object.freeze(Object.keys(yi));var $E=Object.freeze([Object.freeze({id:"habitat",label:"Habitat"}),Object.freeze({id:"activity",label:"Activité"}),Object.freeze({id:"services",label:"Services"}),Object.freeze({id:"infrastructure",label:"Infrastructures"}),Object.freeze({id:"nature",label:"Nature"})]),f0=Object.freeze(["habitat","activity","services","infrastructure"]),Kf=Object.freeze({S:0,E:90,N:180,W:270}),d0=Object.freeze({forest:80,field:20}),p0=Object.freeze(["grass","meadow","field","forest"]),m0=Object.freeze(["grass","meadow","field"]);function cn(i){return{footprint:[1,1],terrains:p0,clearing:d0,buyable:!0,...i}}function Js(i){return{footprint:[1,1],terrains:m0,clearing:{field:20},buyable:!0,...i}}var Yl=Object.freeze([cn({id:"house",family:"habitat",label:"Quartier",description:"Des habitants, des taxes ; évolue en immeubles quand tout est réuni.",price:60,upkeep:5,levels:3,produce:{residents:20},consume:{energy:1,water:1,food:1},income:40,perLevel:{1:{label:"Maisons",residents:20,upkeep:5,income:40},2:{label:"Immeubles bas",residents:45,upkeep:10,income:90},3:{label:"Immeubles",residents:80,upkeep:20,income:160}},pollution:{air:0,water:4},models:{1:["house-a","house-b","house-c"],2:["building-small-a","building-small-b"],3:["building-tall-a","building-tall-b"]}}),cn({id:"shop",family:"activity",label:"Commerce",description:"Des emplois et des recettes, dopées par le tourisme.",price:80,upkeep:5,levels:2,produce:{jobs:15},consume:{energy:1},income:30,perLevel:{1:{jobs:15,income:30},2:{jobs:20,income:45}},pollution:{air:2,water:0},models:{1:["shop-a","shop-b"],2:["shop-a","shop-b"]}}),cn({id:"office",family:"activity",label:"Bureaux",description:"Beaucoup d’emplois, peu de nuisances.",price:120,upkeep:5,levels:2,produce:{jobs:25},consume:{energy:2},income:50,perLevel:{1:{jobs:25,income:50},2:{jobs:35,income:75}},pollution:{air:2,water:0},models:{1:["office-a"],2:["office-a"]}}),cn({id:"factory",family:"activity",label:"Usine",description:"Les meilleures recettes, au prix de l’air et de l’eau. À placer sous le vent.",price:150,upkeep:5,levels:2,produce:{jobs:30},consume:{energy:3,water:1},income:80,perLevel:{1:{label:"Usine",jobs:30,income:80},2:{label:"Usine propre",jobs:30,income:80}},pollution:{air:12,water:15},models:{1:["factory-a","factory-b"],2:["factory-a","factory-b"]}}),cn({id:"school",family:"services",label:"École",description:"Bonheur et montée de niveau des quartiers à 2 cases.",price:150,upkeep:5,levels:1,produce:{},consume:{energy:1},income:0,radius:2,models:{1:["school"]}}),cn({id:"clinic",family:"services",label:"Clinique",description:"Santé et bonheur ; condition des immeubles.",price:200,upkeep:5,levels:1,produce:{},consume:{energy:1},income:0,radius:2,models:{1:["clinic"]}}),cn({id:"market",family:"services",label:"Marché",description:"Les champs voisins nourrissent mieux ; les quartiers voisins sont plus heureux.",price:120,upkeep:5,levels:1,produce:{},consume:{energy:1},income:0,radius:2,models:{1:["market"]}}),cn({id:"townhall",family:"services",label:"Mairie",description:"Le point de départ de la ville : énergie, eau et emplois de base.",price:300,upkeep:0,levels:1,buyable:!1,produce:{jobs:20,energy:3,water:3},consume:{},income:0,models:{1:["townhall"]}}),cn({id:"tram-stop",family:"services",label:"Arrêt de tram",description:"Absorbe la moitié des trajets dans un rayon de 3.",price:100,upkeep:5,levels:1,produce:{},consume:{energy:1},income:0,radius:3,models:{1:["tram-stop"]}}),cn({id:"wastewater",family:"infrastructure",label:"Station d’épuration",description:"Dépollue la rivière et fournit de l’eau potable.",price:180,upkeep:5,levels:1,produce:{water:6},consume:{energy:1},income:0,pollution:{air:0,water:-20},models:{1:["wastewater"]}}),cn({id:"wind-turbine",family:"infrastructure",label:"Éolienne",description:"Énergie propre ; un peu de bruit pour les voisins.",price:90,upkeep:5,levels:1,produce:{energy:4},consume:{},income:0,models:{1:["wind-turbine"]}}),cn({id:"solar",family:"infrastructure",label:"Panneaux solaires",description:"Énergie propre et silencieuse, modeste.",price:60,upkeep:5,levels:1,produce:{energy:2},consume:{},income:0,models:{1:["solar"]}}),cn({id:"power-plant",family:"infrastructure",label:"Centrale",description:"Beaucoup d’énergie, beaucoup de fumée.",price:200,upkeep:5,levels:1,produce:{energy:15},consume:{},income:0,pollution:{air:20,water:0},models:{1:["power-plant"]}}),cn({id:"compost",family:"infrastructure",label:"Compost et recyclerie",description:"Traite les déchets ; les champs voisins y gagnent.",price:80,upkeep:5,levels:1,produce:{},consume:{},income:0,radius:2,models:{1:["compost"]}}),cn({id:"water-tower",family:"infrastructure",label:"Château d’eau",description:"Eau potable tirée de la nappe.",price:100,upkeep:5,levels:1,produce:{water:4},consume:{energy:1},income:0,models:{1:["water-tower"]}}),Js({id:"park",family:"nature",label:"Parc",description:"Puits d’air, bonheur des quartiers voisins, valeur des terrains.",price:40,upkeep:2,levels:1,produce:{},consume:{},income:0,airSink:4,habitat:null,models:{1:["park"]}}),Js({id:"tree-planting",family:"nature",label:"Forêt plantée",description:"Devient une forêt en deux saisons ; vaut moins qu’une forêt ancienne.",price:30,upkeep:0,levels:1,terrainAfter:"forest",maturity:6,produce:{},consume:{},income:0,airSink:5,habitat:"forest",models:{1:["tree-a","tree-b","tree-c"]}}),Js({id:"hedge",family:"nature",label:"Haie bocagère",description:"Annule l’érosion des champs voisins, filtre leurs rejets, abrite la faune.",price:20,upkeep:0,levels:1,produce:{},consume:{},income:0,airSink:1,habitat:null,models:{1:["bush"]}}),Js({id:"wetland-restored",family:"nature",label:"Zone humide restaurée",description:"Filtre la rivière voisine et accueille le héron. Se pose au bord de l’eau.",price:60,upkeep:0,levels:1,terrainAfter:"wetland",terrains:["grass","meadow"],requires:{adjacent:["river","lake"]},produce:{},consume:{},income:0,airSink:3,habitat:"wetland",models:{1:["bush"]}}),Js({id:"orchard",family:"nature",label:"Verger",description:"Un peu de nourriture, un peu d’air pur, des abeilles.",price:50,upkeep:2,levels:1,produce:{food:2},consume:{},income:10,airSink:2,habitat:null,models:{1:["tree-a","tree-b"]}}),Js({id:"field",family:"nature",label:"Champ cultivé",description:"Nourriture et recettes selon la fertilité du sol.",price:30,upkeep:0,levels:1,terrainAfter:"field",terrains:["grass","meadow","field"],produce:{food:4},consume:{},income:10,airSink:0,habitat:null,models:{1:["crop-wheat","crop-corn"]}})]),vi=Object.freeze(Object.fromEntries(Yl.map(i=>[i.id,i])));function g0(i){return f0.includes(i)}function si(i){if(!i||!i.building)return!1;let e=vi[i.building.type];return!!e&&g0(e.family)}function Qr(i){if(!i||!i.building)return 0;let e=vi[i.building.type];if(!e)return 0;let t=e.perLevel&&e.perLevel[i.building.level];return(t&&t.jobs)??e.produce.jobs??0}function Zs(i){if(!i||!i.building)return 0;let e=vi[i.building.type];if(!e)return 0;let t=e.perLevel&&e.perLevel[i.building.level];return(t&&t.residents)??e.produce.residents??0}function Yf(i){let e=vi[i.type];if(!e)return null;let t=e.models[i.level]||e.models[1];return!t||t.length===0?null:t[((i.variant||0)%t.length+t.length)%t.length]}var b0=Object.freeze({straight:"road-straight",corner:"road-corner",t:"road-t",cross:"road-cross",crosswalk:"road-crosswalk",bridge:"bridge"}),x0=Object.freeze(["car-a","car-b","bus","truck"]),_0="tram",y0=Object.freeze(["tree-a","tree-b","tree-c","pine-a","pine-b","bush","flowers","rock-a","rock-b","crop-wheat","crop-corn"]),QE=Object.freeze(["house-a","house-b","house-c","building-small-a","building-small-b","building-tall-a","building-tall-b","shop-a","shop-b","office-a","factory-a","factory-b","school","clinic","market","townhall","tram-stop","wastewater","wind-turbine","solar","power-plant","compost","water-tower","park",...y0,...Object.values(b0),_0,...x0]);var Ft=Object.freeze({NONE:0,PATH:1,STREET:2,BRIDGE:3});var Jl=class{constructor(){this.a=[]}get size(){return this.a.length}push(e,t){let n=this.a;n.push({cost:e,node:t});let s=n.length-1;for(;s>0;){let r=s-1>>1;if(n[r].cost<=n[s].cost)break;[n[r],n[s]]=[n[s],n[r]],s=r}}pop(){let e=this.a,t=e[0],n=e.pop();if(e.length>0){e[0]=n;let s=0;for(;;){let r=2*s+1,a=r+1,o=s;if(r<e.length&&e[r].cost<e[o].cost&&(o=r),a<e.length&&e[a].cost<e[o].cost&&(o=a),o===s)break;[e[o],e[s]]=[e[s],e[o]],s=o}}return t}};function Jf(i){return!!i&&i.terrain==="river"}function Zf(i,e){let[t,n]=Xl(i,e),s=t?Ht(i,t.x,t.y):null,r=n?Ht(i,n.x,n.y):null,a=si(s),o=si(r);return Cn(i,e)>=Ft.STREET?Jf(s)&&Jf(r)?Ft.BRIDGE:Ft.STREET:!s||!r?Ft.NONE:a||o?Ft.STREET:s.building&&!a||r.building&&!o?Ft.PATH:Ft.NONE}function ea(i){let e=Kl(i),{cols:t,rows:n}=i;for(let s=0;s<=n;s++)for(let r=0;r<t;r++){let a=en(i,"h",r,s);e.edges.h[a.index]=Zf(i,a)}for(let s=0;s<n;s++)for(let r=0;r<=t;r++){let a=en(i,"v",r,s);e.edges.v[a.index]=Zf(i,a)}return e}function $f(i,e,t,n=null){let s=uo(i,e,t),r=["S","E","N","W"],a={N:s.n,S:s.s,E:s.e,W:s.w},o=null,l=-1/0;for(let c of r){let u=Cn(i,a[c]),f=(u===Ft.BRIDGE?Ft.STREET:u)*10,d=Xl(i,a[c]).find(g=>g&&!(g.x===e&&g.y===t));if(u>=Ft.STREET&&d&&si(Ht(i,d.x,d.y))&&(f+=5),n){let g=Hi.find(y=>y.dir===c),x=n.x-e,m=n.y-t,p=Math.hypot(x,m)||1;f+=(g.dx*x+g.dy*m)/p}f>l&&(l=f,o=c)}return Kf[o]}function ho(i,e){return e.kind==="h"?e.index:i.edges.h.length+e.index}function Qf(i,e){let t=new Uint8Array((i.cols+1)*(i.rows+1)),n=new Uint8Array(i.edges.h.length+i.edges.v.length);for(let{x:s,y:r}of e){for(let a of Ys(i,s,r))t[Kt(i,a.cx,a.cy)]=1;for(let a of Object.values(uo(i,s,r)))n[ho(i,a)]=1}return{corners:t,edges:n}}function v0(i){return i>=Ft.STREET?1:i===Ft.PATH?2:null}function ed(i,e,t,n){let s=(i.cols+1)*(i.rows+1),r=new Float64Array(s).fill(1/0),a=new Array(s).fill(null),o=new Uint8Array(s),l=new Uint8Array(s),c=new Jl;for(let d of Ys(i,e,t)){let g=Kt(i,d.cx,d.cy);r[g]=0,l[g]=1,c.push(0,g)}let u=new Uint8Array(i.edges.h.length+i.edges.v.length);for(let d of Object.values(uo(i,e,t)))u[ho(i,d)]=1;let h={cost:1/0,node:-1,extra:null};for(;c.size;){let{cost:d,node:g}=c.pop();if(d>=h.cost)break;if(o[g]||d>r[g])continue;if(o[g]=1,!l[g]&&n.corners[g]){h={cost:d,node:g,extra:null};break}let x=Xf(i,g);for(let{ref:m,to:p}of jf(i,x.cx,x.cy)){let y=v0(Cn(i,m));if(y===null)continue;let v=d+y;if(n.edges[ho(i,m)]){let M=v-(u[ho(i,m)]?.001:0);M<h.cost&&(h={cost:M,node:g,extra:m})}let _=Kt(i,p.cx,p.cy);v<r[_]&&(r[_]=v,a[_]={from:g,ref:m},c.push(v,_))}}if(h.node<0)return null;let f=[];h.extra&&f.push(h.extra);for(let d=h.node;a[d];d=a[d].from)f.push(a[d].ref);return f.reverse(),f}function td(i,e,t,n){let s=[];for(let r=0;r<i.rows;r++)for(let a=0;a<i.cols;a++)(a!==e||r!==t)&&n(Ht(i,a,r),a,r)&&s.push({x:a,y:r});return s.length===0?null:ed(i,e,t,Qf(i,s))}function nd(i,e={}){let t=e.shopTypes||["shop","market"],n=Kl(i);n.traffic=$r(i.cols,i.rows);let s=[],r=[],a=[];for(let l=0;l<i.rows;l++)for(let c=0;c<i.cols;c++){let u=Ht(i,c,l);u.building&&(Zs(u)>0&&s.push({x:c,y:l}),Qr(u)>0&&r.push({x:c,y:l}),t.includes(u.building.type)&&a.push({x:c,y:l}))}let o=[r,a].filter(l=>l.length>0).map(l=>Qf(i,l));for(let l of s)for(let c of o){let u=ed(i,l.x,l.y,c);if(u)for(let h of u)n.traffic[h.kind][h.index]+=1}return n}var M0=12,S0=16,fo=8,Pn=2;function Gn(i,e){return Math.max(Math.abs(i.x-e.x),Math.abs(i.y-e.y))}function w0(i,e){return e.y<i.y?"N":e.y>i.y?"S":e.x>i.x?"E":"W"}function Vi(i,e,t){let n=Ht(i,e,t);return!!n&&n.terrain==="grass"&&!n.building}function E0(i,e,t,n){return Rn(i,e,t).some(s=>Ht(i,s.x,s.y).terrain===n)}function id(i,e,t,n){return Ks(i,e,t).some(s=>Ht(i,s.x,s.y).terrain===n)}function $s(i,e){let t=[];for(let n=0;n<i.rows;n++)for(let s=0;s<i.cols;s++)e(Ht(i,s,n),s,n)&&t.push({x:s,y:n});return t}function T0(i,e,t){return i.some(n=>n.x===e&&n.y===t)}function sd(i,e,t,n,s){return Ks(i,e,t).some(r=>Ht(i,r.x,r.y).terrain===n&&!T0(s,r.x,r.y))}function po(i,e,t,n,s,r){let a=[t];for(i.tiles[_t(i,t.x,t.y)].terrain=s;a.length<n;){let o=[];for(let c of a)for(let u of Rn(i,c.x,c.y))Vi(i,u.x,u.y)&&r(u.x,u.y,a)&&o.push(u);if(o.length===0)break;let l=e.pick(o);i.tiles[_t(i,l.x,l.y)].terrain=s,a.push({x:l.x,y:l.y})}return a}function A0(i,e,t){let{cols:n,rows:s}=i,r=e.chance(.7),a=r?s:n,o=r?n:s,l=r?t.x:t.y,c=[[1,l-Pn],[l+Pn,o-2]].filter(([v,_])=>_>=v),u=e.pick(c),h=e.chance(.5)?1:-1,f=e.int(u[0],u[1]),d=e.chance(.5)?1:-1,g=-2,x=[];for(let v=0;v<a;v++)if(x.push({along:v,across:f}),v<a-1&&v-g>=2&&e.chance(.45)){e.chance(.3)&&(d=-d);let _=f+d;(_<u[0]||_>u[1])&&(d=-d,_=f+d),_>=u[0]&&_<=u[1]&&(f=_,x.push({along:v,across:f}),g=v)}let m=h>0?x:x.slice().reverse(),p=v=>r?{x:v.across,y:v.along}:{x:v.along,y:v.across},y=r?h>0?"S":"N":h>0?"E":"W";for(let v=0;v<m.length;v++){let _=p(m[v]),M=i.tiles[_t(i,_.x,_.y)];M.terrain="river",M.flow=v+1<m.length?w0(_,p(m[v+1])):y}return{vertical:r,downstream:h,meanAcross:x.reduce((v,_)=>v+_.across,0)/x.length}}function R0(i,e,t){let n=e.int(1,2),s=$s(i,l=>l.terrain==="river"),r=(l,c)=>Gn({x:l,y:c},t)>Pn,a=(l,c)=>!id(i,l,c,"lake"),o=[];for(let l=0;l<n;l++)for(let c=0;c<30;c++){let u=e.pick(s),h=Rn(i,u.x,u.y).filter(g=>Vi(i,g.x,g.y)&&r(g.x,g.y)&&a(g.x,g.y));if(h.length===0)continue;let f=e.pick(h),d=po(i,e,f,e.int(3,6),"lake",(g,x,m)=>r(g,x)&&!sd(i,g,x,"lake",m));o.push(d);break}return o}function C0(i,e,t){let n=(o,l)=>Gn({x:o,y:l},t)>Pn,s=(o,l)=>Vi(i,o,l)&&n(o,l)&&!E0(i,o,l,"wetland"),r=e.int(2,5),a=0;for(let o of e.shuffle($s(i,l=>l.terrain==="river"))){if(a>=r)break;if(!e.chance(.35))continue;let l=Rn(i,o.x,o.y).filter(u=>s(u.x,u.y));if(l.length===0)continue;let c=e.pick(l);i.tiles[_t(i,c.x,c.y)].terrain="wetland",a++}for(let o of $s(i,l=>l.terrain==="lake")){if(!e.chance(.25))continue;let l=Rn(i,o.x,o.y).filter(u=>s(u.x,u.y));if(l.length===0)continue;let c=e.pick(l);i.tiles[_t(i,c.x,c.y)].terrain="wetland",a++}return a}function P0(i,e,t,n){let{cols:s,rows:r}=i,a=n.vertical?["W","E"]:["N","S"],o=n.vertical?s:r,l=n.vertical?t.x:t.y,c=n.meanAcross<l?a[1]:a[0],h=Math.min(n.meanAcross,o-1-n.meanAcross)<3||e.chance(.8)?c:a.find(x=>x!==c),f=h==="W"||h==="E"?r:s,d=1,g=[];for(let x=0;x<f;x++){(d===1?e.chance(.25):e.chance(.5))&&(d=3-d);let m=e.chance(.1)?0:d;for(let p=0;p<m;p++){let y,v;if(h==="W"?(y=p,v=x):h==="E"?(y=s-1-p,v=x):h==="N"?(y=x,v=p):(y=x,v=r-1-p),!Vi(i,y,v)||Gn({x:y,y:v},t)<=Pn+1)break;i.tiles[_t(i,y,v)].terrain="hill",g.push({x:y,y:v})}}return{side:h,placed:g}}function I0(i,e,t){let n=e.int(2,3),s=[],r=(a,o)=>Gn({x:a,y:o},t)>Pn;for(let a=0;a<n;a++){let o=$s(i,(c,u,h)=>Vi(i,u,h)&&Gn({x:u,y:h},t)>=Pn+1&&!s.some(f=>f.some(d=>Math.abs(d.x-u)+Math.abs(d.y-h)<5)));if(o.length===0)break;let l=e.pick(o);s.push(po(i,e,l,e.int(5,12),"forest",(c,u,h)=>r(c,u)&&!sd(i,c,u,"forest",h)))}return s}function L0(i,e,t){let n=e.int(2,3),s=[],r=(a,o)=>Gn({x:a,y:o},t)>Pn;for(let a=0;a<n;a++){let o=$s(i,(l,c,u)=>Vi(i,c,u)&&r(c,u)&&!id(i,c,u,"meadow"));if(o.length===0)break;s.push(po(i,e,e.pick(o),e.int(3,6),"meadow",r))}return s}function D0(i,e,t){let n=(r,a)=>{let o=Gn({x:r,y:a},t);return o>Pn&&o<=Pn+3},s=e.shuffle($s(i,(r,a,o)=>Vi(i,a,o)&&Gn({x:a,y:o},t)===Pn+1));for(let r of s){let a=po(i,e,r,e.int(2,4),"field",n);if(a.length>=2)return a;for(let o of a)i.tiles[_t(i,o.x,o.y)].terrain="grass"}return[]}function Zl(i,e,t,n,s){let r=i.tiles[_t(i,e,t)];r.building={type:n,level:1,variant:s,yaw:0},r.native=!1}function N0(i,e,t){let n=["shop","house","house","house","shop","house","house","house","house","house","house","house","field"],s=[t];for(let r of n){let a=[];for(let u of s)for(let h of Rn(i,u.x,u.y))Vi(i,h.x,h.y)&&Gn(h,t)<=Pn+1&&a.push(h);if(a.length===0)break;let o=Math.min(...a.map(u=>Gn(u,t))),l=e.chance(.7)?a.filter(u=>Gn(u,t)===o):a,c=e.pick(l);if(r==="field"){let u=i.tiles[_t(i,c.x,c.y)];u.terrain="field",Zl(i,c.x,c.y,"field",e.int(0,1))}else Zl(i,c.x,c.y,r,e.int(0,2));s.push({x:c.x,y:c.y})}}function $l({seed:i=1,cols:e=M0,rows:t=S0,map:n="valley",starterTown:s=!1}={}){if(n!=="valley")throw new Error(`Carte inconnue : ${n}`);if(!Number.isInteger(e)||!Number.isInteger(t)||e<fo||t<fo)throw new Error(`Carte trop petite : ${e} × ${t} (minimum ${fo} × ${fo})`);let r=js(i,"valley"),a={seed:i,cols:e,rows:t,map:n,wind:"W",tiles:Array.from({length:e*t},()=>({terrain:"grass",flow:null,native:!0,building:null})),edges:jl(e,t),traffic:$r(e,t)},o={x:Math.floor(e/2),y:Math.floor(t/2)},l=A0(a,r.fork("river"),o);R0(a,r.fork("lakes"),o),C0(a,r.fork("wetlands"),o),P0(a,r.fork("hills"),o,l),I0(a,r.fork("forests"),o),L0(a,r.fork("meadows"),o),D0(a,r.fork("fields"),o),a.wind=r.fork("wind").pick(Hi.map(u=>u.dir)),Zl(a,o.x,o.y,"townhall",0),s&&N0(a,r.fork("town"),o);let c=ea(a);for(let u=0;u<t;u++)for(let h=0;h<e;h++){let f=c.tiles[_t(c,h,u)];si(f)&&(f.building.yaw=$f(c,h,u,o))}return nd(c)}function Ql(i){return{x:Math.floor(i.cols/2),y:Math.floor(i.rows/2)}}var F0=Object.freeze({habitant:60,vehicle:20,animal:24}),O0=.12,U0=.07,k0=.6,nu=1.2,eu=.35,ld=.4,B0=1,rd=Object.freeze({1:2,2:4,3:6}),Wi=Object.freeze({bee:.4,swallowMin:1.6,swallowMax:2.5,heron:1,owlPerch:.5}),na=Object.freeze({"citizen-a":{group:"habitant",anim:"biped",height:.22,stride:eu},"citizen-b":{group:"habitant",anim:"biped",height:.22,stride:eu},"citizen-c":{group:"habitant",anim:"biped",height:.22,stride:eu},deer:{group:"animal",anim:"quadruped",height:.28,stride:.5},fox:{group:"animal",anim:"quadruped",height:.14,stride:.3},duck:{group:"animal",anim:"bird",height:.09,stride:.12,flap:6},heron:{group:"animal",anim:"wader",height:.3,stride:.3,flap:4},otter:{group:"animal",anim:"swimmer",height:.08,stride:.3},bee:{group:"animal",anim:"flyer",height:.05,stride:.1,flap:12},swallow:{group:"animal",anim:"flyer",height:.08,stride:.2,flap:8},owl:{group:"animal",anim:"bird",height:.11,stride:.1,flap:6},"car-a":{group:"vehicle",anim:"vehicle",height:.14,stride:.2},"car-b":{group:"vehicle",anim:"vehicle",height:.12,stride:.2},truck:{group:"vehicle",anim:"vehicle",height:.14,stride:.2},bus:{group:"vehicle",anim:"vehicle",height:.17,stride:.2}}),z0=["citizen-a","citizen-b","citizen-c"],G0=["deer","fox","duck","heron","otter","bee","swallow","owl"],au=.18,Qs=Math.PI*2;function ls(i,e,t){return i<e?e:i>t?t:i}function H0(i,e){let t=(e-i)%Qs;return t>Math.PI&&(t-=Qs),t<=-Math.PI&&(t+=Qs),t}function Hn(i,e,t,n){let s=H0(i.yaw,e),r=ls(s,-n*t,n*t);i.yaw+=r,i.yaw>Math.PI?i.yaw-=Qs:i.yaw<=-Math.PI&&(i.yaw+=Qs),i.turn=t>0?ls(r/t/n,-1,1):0}function ta(i,e,t){let n=Math.floor(e),s=Math.floor(t);return ii(i,n,s)?_t(i,n,s):-1}function In(i,e){let t=i.cols+1;return{x:e%t,z:Math.floor(e/t)}}function ou(i,e,t){let n=In(i,e),s=In(i,t);return n.z===s.z?en(i,"h",Math.min(n.x,s.x),n.z):en(i,"v",n.x,Math.min(n.z,s.z))}function mo(i,e,t,n=au){let s=e%i.cols,r=Math.floor(e/i.cols);return{x:s+t.range(n,1-n),z:r+t.range(n,1-n)}}function V0(i,e){let t=Object.keys(i),n=t.reduce((o,l)=>o+i[l],0);if(n<=e)return{...i};let s={},r=[],a=0;for(let o of t){let l=i[o]*e/n;s[o]=Math.floor(l),a+=s[o],r.push({k:o,f:l-s[o]})}r.sort((o,l)=>l.f-o.f||o.k.localeCompare(l.k));for(let o=0;a<e&&o<r.length;o++)s[r[o].k]++,a++;return s}function W0(i){let e=(i.cols+1)*(i.rows+1),t=Array.from({length:e},()=>[]),n=new Uint8Array(e),s=[],r=i.traffic||null,a=(o,l,c)=>{let u=Cn(i,o);if(u<Ft.STREET)return;let h=r&&r[o.kind]&&r[o.kind][o.index]||0;t[l].push({to:c,ref:o,value:u,traffic:h}),t[c].push({to:l,ref:o,value:u,traffic:h}),n[l]++,n[c]++,h>0&&s.push({ref:o,a:l,b:c,traffic:h,value:u})};for(let o=0;o<=i.rows;o++)for(let l=0;l<i.cols;l++)a(en(i,"h",l,o),Kt(i,l,o),Kt(i,l+1,o));for(let o=0;o<i.rows;o++)for(let l=0;l<=i.cols;l++)a(en(i,"v",l,o),Kt(i,l,o),Kt(i,l,o+1));return{n:e,adj:t,degree:n,trafficEdges:s}}function q0(i,e,t,n){let s=new Int32Array(i.n).fill(-2),r=[];for(let o of e)s[o]===-2&&(s[o]=-1,r.push(o));let a=0;for(;a<r.length;){let o=r[a++];if(t(o)&&s[o]!==-1){let c=[];for(let u=o;u!==-1;u=s[u])c.push(u);return c.reverse()}let l=n?n.shuffle(i.adj[o]):i.adj[o];for(let c of l)s[c.to]===-2&&(s[c.to]=o,r.push(c.to))}return null}function X0(i,e,t,n){let s=[e],r=-1;for(let a=0;a<t;a++){let o=s[s.length-1],l=i.adj[o].filter(h=>h.to!==r),c=l.length?l:i.adj[o];if(!c.length)break;let u=n.pick(c);r=o,s.push(u.to)}return s.length>1?s:null}function j0(i,e,t){let n=[],s=e.length;if(s<2)return n;let r=o=>{let l=In(i,e[o]),c=In(i,e[o+1]),u=Math.sign(c.x-l.x),h=Math.sign(c.z-l.z);return{a:l,b:c,dx:u,dz:h,rx:-h*t,rz:u*t,ref:ou(i,e[o],e[o+1])}},a=r(0);n.push({x:a.a.x+a.rx,z:a.a.z+a.rz,edge:null});for(let o=1;o<s-1;o++){let l=r(o),c=a.b;a.dx===l.dx&&a.dz===l.dz?n.push({x:c.x+a.rx,z:c.z+a.rz,edge:a.ref}):a.dx===-l.dx&&a.dz===-l.dz?(n.push({x:c.x+a.rx,z:c.z+a.rz,edge:a.ref}),n.push({x:c.x+l.rx,z:c.z+l.rz,edge:null})):n.push({x:c.x+a.rx+l.rx,z:c.z+a.rz+l.rz,edge:a.ref}),a=l}return n.push({x:a.b.x+a.rx,z:a.b.z+a.rz,edge:a.ref}),n}function Mi(i,e,t){let n=t*e,s=null;for(;n>0&&i.path.length;){let r=i.path[0];r.edge&&(i.edge=r.edge);let a=r.x-i.x,o=r.z-i.z,l=Math.hypot(a,o);l<=n?(i.x=r.x,i.z=r.z,n-=l,i.path.shift()):(i.x+=a/l*n,i.z+=o/l*n,s=Math.atan2(a,o),n=0)}return s!==null&&(i.targetYaw=s),i.path.length===0}function iu(i){return!!i&&i.terrain==="forest"&&!si(i)}function su(i){return!!i&&(i.terrain==="grass"||i.terrain==="meadow")&&!i.building}function K0(i){return!!i&&(i.terrain==="river"||i.terrain==="lake")}function Y0(i){let e=new Uint8Array(i.tiles.length),t=[];for(let n=0;n<i.rows;n++)for(let s=0;s<i.cols;s++){let r=_t(i,s,n);if(e[r]||!iu(i.tiles[r]))continue;let a=[],o=[{x:s,y:n}];for(e[r]=1;o.length;){let l=o.pop();a.push(_t(i,l.x,l.y));for(let c of Ks(i,l.x,l.y)){let u=_t(i,c.x,c.y);!e[u]&&iu(i.tiles[u])&&(e[u]=1,o.push(c))}}a.sort((l,c)=>l-c),t.push({tiles:a,size:a.length})}return t.sort((n,s)=>s.size-n.size||n.tiles[0]-s.tiles[0]),t}function J0(i){let e=Y0(i),t=[],n=new Set,s=[],r=[],a=[],o=new Set,l=[],c=[];for(let g=0;g<i.rows;g++)for(let x=0;x<i.cols;x++){let m=_t(i,x,g),p=i.tiles[m];if(iu(p)){let y=!1;for(let v of Rn(i,x,g))su(Ht(i,v.x,v.y))&&(y=!0,n.add(_t(i,v.x,v.y)));y&&t.push(m)}if(K0(p)){s.push(m),(p.terrain==="river"?r:a).push(m);for(let y of Rn(i,x,g))su(Ht(i,y.x,y.y))&&o.add(_t(i,y.x,y.y))}p.terrain==="wetland"&&o.add(m),(p.terrain==="meadow"||p.terrain==="field")&&!si(p)&&l.push(m),si(p)&&c.push(m)}let u=new Set;for(let g of c){let x=g%i.cols,m=Math.floor(g/i.cols);for(let p of[{x,y:m},...Ks(i,x,m)]){let y=Ht(i,p.x,p.y);y.building&&y.building.level>=3||u.add(_t(i,p.x,p.y))}}let h=g=>Array.from(g).sort((x,m)=>x-m),f=e.filter(g=>g.size>=4),d={deer:f.reduce((g,x)=>g+(x.size>=8?2:1),0),owl:Math.min(2,f.length),fox:t.length>=2?Math.min(3,1+Math.floor(t.length/8)):0,duck:s.length>=2?Math.min(6,1+Math.floor(s.length/4)):0,heron:o.size>=1?Math.min(3,1+Math.floor(o.size/5)):0,otter:r.length>=5?r.length>=14?2:1:0,bee:l.length>=1?Math.min(5,1+Math.floor(l.length/4)):0,swallow:c.length>=3?Math.min(4,1+Math.floor(c.length/8)):0};return{massifs:e,forestEdge:t,edgeMeadow:h(n),water:s,river:r,lake:a,banks:h(o),flowers:l,town:h(u),built:c,desired:d}}function ad(i,e){switch(e){case"fox":return i.forestEdge.concat(i.edgeMeadow);case"duck":return i.water;case"heron":return i.banks;case"otter":return i.river;case"bee":return i.flowers;case"swallow":return i.town;case"owl":return i.forestEdge;default:return[]}}function Z0(i){let e=W0(i),t=[],n=[],s=[],r=[];for(let l=0;l<i.rows;l++)for(let c=0;c<i.cols;c++){let u=Ht(i,c,l);if(!u.building)continue;let h=_t(i,c,l);Zs(u)>0&&t.push({x:c,y:l,i:h,level:u.building.level||1}),Qr(u)>0&&n.push(h),(u.building.type==="shop"||u.building.type==="market")&&s.push(h),u.building.type==="factory"&&r.push(h)}let a=0;for(let l of e.trafficEdges)a+=l.traffic;let o=new Map;return{world:i,graph:e,homes:t,jobs:n,shops:s,factories:r,trafficTotal:a,habitats:J0(i),cornerTiles:o}}function ud(i,e){let t=new Set;for(let n of e){let s=n%i.cols,r=Math.floor(n/i.cols);for(let a of Ys(i,s,r))t.add(Kt(i,a.cx,a.cy))}return t}function cu(i,e,t,n,s){let r=na[t];return{id:i.nextId++,kind:e,group:r.group,model:t,anim:r.anim,x:n,y:0,z:s,yaw:0,targetYaw:0,turn:0,speed:0,state:"idle",phase:i.rng.next(),path:[],home:null,ttl:0,stride:r.stride,flap:r.flap||6,bridge:!1,hidden:!1,edge:null}}function lu(i,e){let t=[];for(let n of Ys(i.world,e.x,e.y)){let s=Kt(i.world,n.cx,n.cy);i.graph.degree[s]>0&&t.push(s)}return t}function $0(i,e,t){let n=i.rng,s=lu(e,t),r=s.length?n.pick(s):Kt(e.world,t.x,t.y),a=In(e.world,r),o=O0+n.range(-.02,.02),l=cu(i,"habitant",n.pick(z0),a.x+(t.x+.5>a.x?o:-o),a.z+(t.y+.5>a.z?o:-o));return l.home={x:t.x,y:t.y},l.lane=o,l.corner=r,l.away=!1,l.corners=null,l.ttl=n.range(.5,4),l.yaw=n.range(-Math.PI,Math.PI),l.targetYaw=l.yaw,i.list.push(l),l}function Q0(i,e,t){let{world:n,graph:s}=e,r=i.rng,a=null;if(t.away&&t.corners&&t.corners.length>1)a=t.corners.slice().reverse();else{let o=lu(e,t.home),l=_t(n,t.home.x,t.home.y),c=Number.isInteger(t.corner)&&s.degree[t.corner]>0?[t.corner]:o,u=[e.jobs,e.shops].filter(h=>h.some(f=>f!==l));if(u.length&&c.length){let h=r.pick(u).filter(g=>g!==l),f=ud(n,h),d=new Set(o);a=q0(s,c,g=>f.has(g)&&!d.has(g),r)}!a&&c.length&&(a=X0(s,c[0],r.int(2,5),r)),t.away=!1}if(!a||a.length<2){t.state="idle",t.ttl=r.range(2,6);return}if(t.corners=a,t.away=!t.away,t.path=j0(n,a,t.lane),t.arrive&&t.path.length){let o=In(n,a[0]),l=In(n,a[1]),c=Math.sign(l.x-o.x),u=Math.sign(l.z-o.z),h=t.arrive,f=h.dx===c&&h.dz===u,d=h.dx===-c&&h.dz===-u;!f&&!d&&(t.path[0]={x:o.x+(-h.dz-u)*t.lane,z:o.z+(h.dx+c)*t.lane,edge:null})}t.state="walk",t.corner=a[a.length-1]}function eb(i,e){if(!e||e.length<2)return null;let t=In(i,e[e.length-2]),n=In(i,e[e.length-1]);return{dx:Math.sign(n.x-t.x),dz:Math.sign(n.z-t.z)}}function tu(i,e,t,n){let s=i.rng,{world:r,graph:a}=e;if(!a.trafficEdges.length)return null;let o=cu(i,t,n,0,0);o.state="drive",o.speed=nu,o.wait=0,o.uturn=!1;for(let l=0;l<10;l++){let c=tb(e,s,t==="truck"?e.factories:null),u=s.chance(.5),h=u?c.a:c.b,f=u?c.b:c.a,d=s.range(.05,.9),g=hd(c.ref,h);if(!(i.list.some(m=>m.group==="vehicle"&&m.laneKey===g&&Math.abs(m.s-d)<ld)&&l<9)){go(r,o,c.ref,h,f,d),o.yaw=o.targetYaw;break}}return o.laneKey?(i.list.push(o),o):null}function tb(i,e,t){let n=i.graph.trafficEdges,s=n;if(t&&t.length){let o=ud(i.world,t),l=n.filter(c=>o.has(c.a)||o.has(c.b));l.length&&(s=l)}let r=0;for(let o of s)r+=o.traffic;let a=e.range(0,r);for(let o of s)if(a-=o.traffic,a<=0)return o;return s[s.length-1]}function hd(i,e){return`${i.kind}${i.index}:${e}`}function go(i,e,t,n,s,r){let a=In(i,n),o=In(i,s);e.lane={ref:t,from:n,to:s,ax:a.x,az:a.z,dx:o.x-a.x,dz:o.z-a.z},e.laneKey=hd(t,n),e.s=r,e.edge=t,e.bridge=Cn(i,t)===Ft.BRIDGE,e.targetYaw=Math.atan2(e.lane.dx,e.lane.dz),ru(e)}function ru(i){let e=i.lane,t=i.uturn?-1+2*ls(i.s/.25,0,1):1,n=U0*t;i.x=e.ax+e.dx*i.s-e.dz*n,i.z=e.az+e.dz*i.s+e.dx*n,i.uturn&&i.s>=.25&&(i.uturn=!1)}function od(i,e,t){let{world:n,graph:s}=e,r=i.rng,a=t.lane.to,o=t.lane.from;if(t.route){let u=t.route,h=t.routeIndex+t.routeDir;(h<0||h>=u.length)&&(t.routeDir=-t.routeDir,h=t.routeIndex+t.routeDir,t.uturn=!0);let f=ou(n,a,u[h]);t.routeIndex=h,go(n,t,f,a,u[h],0);return}let l=s.adj[a].filter(u=>u.traffic>0&&u.to!==o),c;if(l.length){let u=0;for(let f of l)u+=f.traffic;let h=r.range(0,u);c=l[l.length-1];for(let f of l)if(h-=f.traffic,h<=0){c=f;break}}else c=s.adj[a].find(u=>u.to===o&&u.traffic>0)||s.adj[a].find(u=>u.to===o),t.uturn=!0;if(!c){t.dead=!0;return}go(n,t,c.ref,a,c.to,0)}function nb(i){let{world:e}=i,t=null;for(let r of i.homes){let a=td(e,r.x,r.y,o=>Qr(o)>0);!a||a.length<3||a.every(o=>Cn(e,o)>=Ft.STREET)&&(!t||a.length>t.length)&&(t=a)}if(!t)return null;let n=r=>r.kind==="h"?[Kt(e,r.x,r.y),Kt(e,r.x+1,r.y)]:[Kt(e,r.x,r.y),Kt(e,r.x,r.y+1)],s=[];for(let r=0;r<t.length;r++){let[a,o]=n(t[r]);if(r===0){let[l,c]=n(t[1]),u=a===l||a===c?a:o;s.push(u===a?o:a,u)}else{let l=s[s.length-1];if(a===l)s.push(o);else if(o===l)s.push(a);else return null}}return s}function cd(i,e,t,n,s=null){let r=i.rng,{world:a}=e;if(!n.length)return null;let o=new Set(i.list.filter(f=>f.kind===t).map(f=>ta(a,f.x,f.z))),l=n.filter(f=>!o.has(f)),c=r.pick(l.length?l:n),u=mo(a,c,r),h=cu(i,t,t,u.x,u.z);switch(h.habitat=n,h.habitatSet=new Set(n),h.massif=s,h.yaw=r.range(-Math.PI,Math.PI),h.targetYaw=h.yaw,h.ttl=r.range(.5,3),t){case"duck":h.state="swim",h.speed=0;break;case"otter":h.state="swim",h.speed=.35,h.leg="down";break;case"bee":h.state="fly",h.y=Wi.bee,h.speed=.7,h.ttl=0;break;case"swallow":h.state="fly",h.y=2,h.speed=1.6,h.ttl=0,h.clock=r.range(0,Qs);break;case"owl":{h.state="idle",h.y=Wi.owlPerch;let f=c%a.cols,d=Math.floor(c/a.cols),g=Rn(a,f,d).filter(x=>su(Ht(a,x.x,x.y)));if(g.length){let x=r.pick(g);h.x=f+.5+(x.x-f)*.3,h.z=d+.5+(x.y-d)*.3,h.yaw=Math.atan2(x.x-f,x.y-d),h.targetYaw=h.yaw}h.ttl=r.range(4,10);break}default:h.state="idle"}return i.list.push(h),h}function ib(i,e){let t=new Map,n=0;for(let a of i.homes)t.set(a.i,0),n+=rd[a.level]||2;let s=Math.min(e,n),r=0;for(let a=0;r<s;a++){let o=!1;for(let l of i.homes){if(r>=s)break;a<(rd[l.level]||2)&&(t.set(l.i,t.get(l.i)+1),r++,o=!0)}if(!o)break}return t}function sb(i,e){if(e.group!=="habitant")return!0;for(let t of e.path)if(t.edge&&Cn(i,t.edge)<Ft.STREET)return!1;return!0}function fd(i,e){let t=Z0(e);i.world=e,i.ctx=t;let n=i.rng,s=i.caps,r=[],a=ib(t,s.habitant),o=new Map;for(let w of i.list){if(w.group!=="habitant")continue;let b=w.home?_t(e,w.home.x,w.home.y):-1,T=a.get(b)||0,R=o.get(b)||0;if(!(R>=T)){if(o.set(b,R+1),!sb(e,w)){let P=lu(t,{x:w.home.x,y:w.home.y}),D=P.length?n.pick(P):Kt(e,w.home.x,w.home.y),I=In(e,D);w.x=I.x+(w.home.x+.5>I.x?w.lane:-w.lane),w.z=I.z+(w.home.y+.5>I.z?w.lane:-w.lane),w.corner=D,w.path=[],w.corners=null,w.away=!1,w.state="idle",w.ttl=n.range(1,3)}r.push(w)}}for(let w of i.list)w.group!=="habitant"&&r.push(w);i.list=r;for(let w of t.homes){let b=a.get(w.i)||0;for(let T=o.get(w.i)||0;T<b;T++)$0(i,t,w)}let l=new Set(t.graph.trafficEdges.map(w=>`${w.ref.kind}${w.ref.index}`)),c=t.homes.length&&t.jobs.length?nb(t):null,u=t.graph.trafficEdges.length?Math.min(s.vehicle,Math.max(1,Math.round(t.trafficTotal/2.5))):0,h=c&&u>=4?1:0,f=t.shops.length?Math.min(3,t.factories.length,Math.max(0,u-h-1)):0,g={car:Math.max(0,u-h-f),truck:f,bus:h},x={car:0,truck:0,bus:0},m=c?c.join(","):"";i.list=i.list.filter(w=>w.group!=="vehicle"?!0:w.dead||!w.lane||!l.has(`${w.lane.ref.kind}${w.lane.ref.index}`)||Cn(e,w.lane.ref)<Ft.STREET||w.kind==="bus"&&(w.route||[]).join(",")!==m||x[w.kind]>=g[w.kind]?!1:(x[w.kind]++,w.bridge=Cn(e,w.lane.ref)===Ft.BRIDGE,!0));for(let w=x.bus;w<g.bus;w++){let b=tu(i,t,"bus","bus");if(!b)break;b.route=c,b.routeIndex=0,b.routeDir=1,go(e,b,ou(e,c[0],c[1]),c[0],c[1],.1),b.routeIndex=1,b.yaw=b.targetYaw}for(let w=x.truck;w<g.truck&&tu(i,t,"truck","truck");w++);for(let w=x.car;w<g.car&&tu(i,t,"car",n.pick(["car-a","car-b"]));w++);let p=t.habitats,y=V0(p.desired,s.animal),v=p.massifs.filter(w=>w.size>=4),_=(w,b)=>{let T=[];for(let R of v){let P=w==="deer"&&R.size>=8?2:1;for(let D=0;D<P&&T.length<b;D++)T.push(R)}return T},M={deer:0,owl:0},E=new Map;i.list=i.list.filter(w=>{if(w.group!=="animal")return!0;let b=ta(e,w.x,w.z);if(w.kind==="deer"||w.kind==="owl"){let R=v.find(C=>C.tiles.includes(b));if(!R)return!1;let P=_(w.kind,y[w.kind]||0).filter(C=>C===R).length,D=`${w.kind}:${R.tiles[0]}`,I=E.get(D)||0;return!(I>=P||(E.set(D,I+1),M[w.kind]++,w.habitat=R.tiles,w.habitatSet=new Set(R.tiles),w.massif=R,w.kind==="owl"&&b!==-1&&!p.forestEdge.includes(b)))}let T=ad(p,w.kind);return!T.includes(b)||(M[w.kind]=(M[w.kind]||0)+1,M[w.kind]>(y[w.kind]||0))?!1:(w.habitat=T,w.habitatSet=new Set(T),w.path.every(R=>w.habitatSet.has(ta(e,R.x,R.z)))||(w.path=[],w.ttl=.1,w.kind==="heron"&&w.state==="fly"&&(w.flight=null)),!0)});for(let w of G0){let b=y[w]||0,T=M[w]||0;if(w==="deer"||w==="owl"){let R=_(w,b);for(let P=T;P<R.length;P++){let D=R[P],I=w==="owl"?D.tiles.filter(C=>p.forestEdge.includes(C)):D.tiles;cd(i,t,w,I.length?I:D.tiles,D)}}else{let R=ad(p,w);for(let P=T;P<b&&cd(i,t,w,R);P++);}}return i}function uu(i,e=i.seed,t={}){let s={rng:typeof e=="number"?js((e^659918)>>>0,"actors"):js(e,"actors"),list:[],caps:{...F0,...t.caps||{}},nextId:1,time:0,world:null,ctx:null};return fd(s,i)}function rb(i){switch(i.state){case"walk":case"run":case"swim":case"drive":return i.speed/i.stride;case"fly":return i.flap;case"hover":return i.flap;case"dive":return 2;default:return .5}}function ab(i,e){i.phase+=rb(i)*e,(i.phase>=1||i.phase<0)&&(i.phase-=Math.floor(i.phase))}function ob(i,e,t,n){if(t.state==="walk"){t.speed=k0;let s=Mi(t,n,t.speed);t.edge&&(t.bridge=Cn(e.world,t.edge)===Ft.BRIDGE),Hn(t,t.targetYaw,n,10),s&&(t.state="idle",t.speed=0,t.ttl=i.rng.range(1,3),t.turn=0,t.arrive=eb(e.world,t.corners))}else t.speed=0,t.ttl-=n,t.ttl<=0&&Q0(i,e,t)}function cb(i){let e=new Map;for(let t of i.list){if(t.group!=="vehicle"||!t.laneKey)continue;let n=e.get(t.laneKey);n||(n=[],e.set(t.laneKey,n)),n.push(t)}for(let t of e.values())t.sort((n,s)=>n.s-s.s||n.id-s.id);return e}function lb(i,e,t,n,s){if(t.state==="idle"){if(t.speed=0,t.wait-=n,t.wait<=0){if(od(i,e,t),t.dead)return;t.state="drive"}return}let r=nu,a=s.get(t.laneKey);if(a&&a.length>1){let l=a.indexOf(t),c=a[l+1];if(c){let u=c.s-t.s;r=nu*ls((u-.25)/(ld-.25),0,1)}}let o=r>t.speed?2:4;if(t.speed=r>t.speed?Math.min(r,t.speed+o*n):Math.max(r,t.speed-o*n),t.s+=t.speed*n,t.s>=1){t.s=1,ru(t);let l=t.lane.to,c=t.route&&(t.routeIndex===0||t.routeIndex===t.route.length-1);e.graph.degree[l]>=3||c?(t.state="idle",t.wait=c?1.5:B0,t.speed=0):od(i,e,t)}else ru(t);Hn(t,t.targetYaw,n,7)}function dd(i,e,t,n=au){let s=ta(i,e.x,e.z),r=s%i.cols,a=Math.floor(s/i.cols),o=Rn(i,r,a).map(c=>_t(i,c.x,c.y)).filter(c=>e.habitatSet.has(c)),l=o.length&&t.chance(.75)?t.pick(o):s;return mo(i,l,t,n)}function us(i,e,t,n,s=au){let r=[],a={x:e.x,z:e.z,habitatSet:e.habitatSet};for(let o=0;o<n;o++){let l=dd(i,a,t,s);r.push({x:l.x,z:l.z,edge:null}),a.x=l.x,a.z=l.z}return r}function ub(i,e,t,n){let s=i.rng;if(t.state==="walk"||t.state==="run"){let r=Mi(t,n,t.speed);Hn(t,t.targetYaw,n,4),r&&(t.state="idle",t.speed=0,t.ttl=t.kind==="deer"?s.range(3,8):s.range(1.5,5),t.turn=0)}else if(t.ttl-=n,t.ttl<=0){let r=s.chance(t.kind==="fox"?.2:.1);t.state=r?"run":"walk",t.speed=t.kind==="deer"?r?.9:.25:r?1:.4,t.path=us(e.world,t,s,r?2:s.int(1,3))}}function hb(i,e,t,n){let s=i.rng;if(t.path.length){t.speed=.2;let r=Mi(t,n,t.speed);Hn(t,t.targetYaw,n,3),r&&(t.speed=0,t.ttl=s.range(2,5),t.turn=0)}else t.speed=0,t.ttl-=n,t.ttl<=0&&(t.path=us(e.world,t,s,s.int(1,2)));t.state="swim"}function fb(i,e,t,n){let s=i.rng;if(t.state==="fly"){let r=t.flight;r.t+=n;let a=Mi(t,n,t.speed);Hn(t,t.targetYaw,n,3);let o=Math.min(r.t,r.total-r.t)/(.3*r.total),l=ls(o,0,1);t.y=Wi.heron*(l*l*(3-2*l)),(a||r.t>=r.total)&&(t.state="idle",t.y=0,t.speed=0,t.ttl=s.range(6,14),t.flight=null,t.turn=0);return}if(t.state==="walk"){let r=Mi(t,n,t.speed);Hn(t,t.targetYaw,n,2),r&&(t.state="idle",t.speed=0,t.ttl=s.range(6,14),t.turn=0);return}if(t.ttl-=n,!(t.ttl>0))if(s.chance(.35)){let r=[],a=0,o=t.x,l=t.z,c={x:t.x,z:t.z,habitatSet:t.habitatSet};for(let h=0;h<14&&a<2.4;h++){let f=dd(e.world,c,s,.25);r.push({x:f.x,z:f.z,edge:null}),a+=Math.hypot(f.x-o,f.z-l),o=f.x,l=f.z,c.x=f.x,c.z=f.z}let u=ls(a/.8,3,5);t.path=r,t.speed=a/u,t.flight={t:0,total:u},t.state="fly"}else t.path=us(e.world,t,s,1),t.speed=.2,t.state="walk"}function db(i,e,t){let n=[e],s=e;for(let r=0;r<t;r++){let a=i.tiles[s],o=Hi.find(h=>h.dir===a.flow);if(!o)break;let l=s%i.cols+o.dx,c=Math.floor(s/i.cols)+o.dy;if(!ii(i,l,c))break;let u=_t(i,l,c);if(i.tiles[u].terrain!=="river")break;n.push(u),s=u}return n}function pb(i,e,t,n){let s=i.rng,{world:r}=e;if(t.state==="dive"){if(t.ttl-=n,t.leg==="down")t.y=Math.max(-.25,t.y-.5*n),t.hidden=t.y<-.12,t.ttl<=0&&(t.leg="under",t.speed=1);else if(t.leg==="under"){t.hidden=!0;let a=Mi(t,n,t.speed);Hn(t,t.targetYaw,n,6),a&&(t.leg="up",t.speed=0,t.ttl=s.range(.5,1.5))}else t.ttl-=n,t.ttl<=0&&(t.y=Math.min(0,t.y+.5*n),t.hidden=t.y<-.12,t.y>=0&&(t.state="swim",t.hidden=!1,t.ttl=0,t.leg="down"));return}if(t.path.length){t.speed=.35;let a=Mi(t,n,t.speed);Hn(t,t.targetYaw,n,3),a&&(t.state="dive",t.ttl=.6,t.leg="down",t.speed=0,t.path=(t.trail||[]).slice().reverse().map(o=>{let l=mo(r,o,s,.3);return{x:l.x,z:l.z,edge:null}}),t.trail=null)}else{let a=ta(r,t.x,t.z),o=db(r,a,s.int(3,6));o.length<2?(t.path=us(r,t,s,1,.3),t.trail=[a]):(t.trail=o.slice(0,-1),t.path=o.slice(1).map(l=>{let c=mo(r,l,s,.3);return{x:c.x,z:c.z,edge:null}})),t.speed=.35,t.state="swim"}}function mb(i,e,t,n){let s=i.rng;if(t.state==="hover"){t.ttl-=n,t.speed=0,t.ttl<=0&&(t.state="fly",t.path=us(e.world,t,s,s.int(2,4),.2),t.speed=.7);return}t.path.length||(t.path=us(e.world,t,s,s.int(2,4),.2)),t.speed=.7;let r=Mi(t,n,t.speed);Hn(t,t.targetYaw,n,12),t.y=Wi.bee+.03*Math.sin(i.time*9+t.id),r&&(t.state="hover",t.ttl=s.range(.5,1.5),t.turn=0)}function gb(i,e,t,n){let s=i.rng;t.path.length||(t.path=us(e.world,t,s,s.int(6,10),.2)),t.speed=1.6,t.state="fly",Mi(t,n,t.speed),Hn(t,t.targetYaw,n,5),t.clock+=n;let r=(Wi.swallowMin+Wi.swallowMax)/2,a=(Wi.swallowMax-Wi.swallowMin)/2;t.y=r+a*Math.sin(t.clock*.7)}function bb(i,e,t,n){let s=i.rng;t.state="idle",t.ttl-=n,t.ttl<=0&&(t.targetYaw=t.yaw+s.range(-1.2,1.2),t.ttl=s.range(4,10)),Hn(t,t.targetYaw,n,1.5)}function pd(i,e,t){i.world!==e&&fd(i,e);let n=ls(Number(t)||0,0,.1);if(n<=0)return i;let s=i.ctx;i.time+=n;let r=cb(i);for(let a of i.list){switch(a.group){case"habitant":ob(i,s,a,n);break;case"vehicle":lb(i,s,a,n,r);break;default:switch(a.kind){case"deer":case"fox":ub(i,s,a,n);break;case"duck":hb(i,s,a,n);break;case"heron":fb(i,s,a,n);break;case"otter":pb(i,s,a,n);break;case"bee":mb(i,s,a,n);break;case"swallow":gb(i,s,a,n);break;case"owl":bb(i,s,a,n);break;default:break}}ab(a,n)}return i.list.some(a=>a.dead)&&(i.list=i.list.filter(a=>!a.dead)),i}var Qd=0,Ku=1,ep=2;var Fs=1,tp=2,Cr=3,hi=0,gn=1,On=2,fi=0,Pr=1,Yu=2,Ju=3,Zu=4,np=5;var Os=100,ip=101,sp=102,rp=103,ap=104,op=200,cp=201,lp=202,up=203,$u=204,Qu=205,hp=206,fp=207,dp=208,pp=209,mp=210,gp=211,bp=212,xp=213,_p=214,Xo=0,jo=1,Ko=2,mr=3,Yo=4,Jo=5,Zo=6,$o=7,_c=0,yp=1,vp=2,Tn=0,eh=1,th=2,nh=3,ih=4,sh=5,rh=6,ah=7,Uu="attached",Mp="detached",oh=300,ns=301,Us=302,yc=303,vc=304,Ba=306,Zi=1e3,Dn=1001,gr=1002,Ct=1003,Mc=1004;var ks=1005;var Pt=1006,Ir=1007;var $n=1008;var vn=1009,ch=1010,lh=1011,Lr=1012,Sc=1013,Un=1014,un=1015,Qn=1016,wc=1017,Ec=1018,Dr=1020,uh=35902,hh=35899,fh=1021,dh=1022,hn=1023,oi=1026,is=1027,Tc=1028,za=1029,ss=1030,Ac=1031;var Rc=1033,Ga=33776,Ha=33777,Va=33778,Wa=33779,Cc=35840,Pc=35841,Ic=35842,Lc=35843,Dc=36196,Nc=37492,Fc=37496,Oc=37488,Uc=37489,qa=37490,kc=37491,Bc=37808,zc=37809,Gc=37810,Hc=37811,Vc=37812,Wc=37813,qc=37814,Xc=37815,jc=37816,Kc=37817,Yc=37818,Jc=37819,Zc=37820,$c=37821,Qc=36492,el=36494,tl=36495,nl=36283,il=36284,Xa=36285,sl=36286,Sp=2200,wp=2201,Ep=2202,ys=2300,vs=2301,Wo=2302,ku=2303,bs=2400,xs=2401,ma=2402,rl=2500,ph=2501,mh=0,ja=1,Nr=2,Tp=3200;var Ka=0,Ap=1,Ui="",Et="srgb",fn="srgb-linear",ga="linear",lt="srgb";var qo=7680;var Rp=519,Cp=512,Pp=513,Ip=514,al=515,Lp=516,Dp=517,ol=518,Np=519,gh=35044;var bh="300 es",Nn=2e3,br=2001;function xb(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Fp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function xr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Op(){let i=xr("canvas");return i.style.display="block",i}var md={},_r=null;function ba(...i){let e="THREE."+i.shift();_r?_r("log",e,...i):console.log(e,...i)}function Up(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Oe(...i){i=Up(i);let e="THREE."+i.shift();if(_r)_r("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function qe(...i){i=Up(i);let e="THREE."+i.shift();if(_r)_r("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function _s(...i){let e=i.join(" ");e in md||(md[e]=!0,Oe(...i))}function kp(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Bp={[Xo]:jo,[Ko]:Zo,[Yo]:$o,[mr]:Jo,[jo]:Xo,[Zo]:Ko,[$o]:Yo,[Jo]:mr},Jn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},tn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],gd=1234567,fa=Math.PI/180,Ms=180/Math.PI;function Yn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(tn[i&255]+tn[i>>8&255]+tn[i>>16&255]+tn[i>>24&255]+"-"+tn[e&255]+tn[e>>8&255]+"-"+tn[e>>16&15|64]+tn[e>>24&255]+"-"+tn[t&63|128]+tn[t>>8&255]+"-"+tn[t>>16&255]+tn[t>>24&255]+tn[n&255]+tn[n>>8&255]+tn[n>>16&255]+tn[n>>24&255]).toLowerCase()}function nt(i,e,t){return Math.max(e,Math.min(t,i))}function xh(i,e){return(i%e+e)%e}function _b(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function yb(i,e,t){return i!==e?(t-i)/(e-i):0}function da(i,e,t){return(1-t)*i+t*e}function vb(i,e,t,n){return da(i,e,1-Math.exp(-t*n))}function Mb(i,e=1){return e-Math.abs(xh(i,e*2)-e)}function Sb(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function wb(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Eb(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Tb(i,e){return i+Math.random()*(e-i)}function Ab(i){return i*(.5-Math.random())}function Rb(i){i!==void 0&&(gd=i);let e=gd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Cb(i){return i*fa}function Pb(i){return i*Ms}function Ib(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Lb(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Db(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Nb(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),h=r((e-n)/2),f=a((e-n)/2),d=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*h,l*f,o*c);break;case"YZY":i.set(l*f,o*u,l*h,o*c);break;case"ZXZ":i.set(l*h,l*f,o*u,o*c);break;case"XZX":i.set(o*u,l*g,l*d,o*c);break;case"YXY":i.set(l*d,o*u,l*g,o*c);break;case"ZYZ":i.set(l*g,l*d,o*u,o*c);break;default:Oe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Kn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ht(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var _h={DEG2RAD:fa,RAD2DEG:Ms,generateUUID:Yn,clamp:nt,euclideanModulo:xh,mapLinear:_b,inverseLerp:yb,lerp:da,damp:vb,pingpong:Mb,smoothstep:Sb,smootherstep:wb,randInt:Eb,randFloat:Tb,randFloatSpread:Ab,seededRandom:Rb,degToRad:Cb,radToDeg:Pb,isPowerOfTwo:Ib,ceilPowerOfTwo:Lb,floorPowerOfTwo:Db,setQuaternionFromProperEuler:Nb,normalize:ht,denormalize:Kn},Ke=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ut=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],f=r[a+0],d=r[a+1],g=r[a+2],x=r[a+3];if(h!==x||l!==f||c!==d||u!==g){let m=l*f+c*d+u*g+h*x;m<0&&(f=-f,d=-d,g=-g,x=-x,m=-m);let p=1-o;if(m<.9995){let y=Math.acos(m),v=Math.sin(y);p=Math.sin(p*y)/v,o=Math.sin(o*y)/v,l=l*p+f*o,c=c*p+d*o,u=u*p+g*o,h=h*p+x*o}else{l=l*p+f*o,c=c*p+d*o,u=u*p+g*o,h=h*p+x*o;let y=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=y,c*=y,u*=y,h*=y}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[a],f=r[a+1],d=r[a+2],g=r[a+3];return e[t]=o*g+u*h+l*d-c*f,e[t+1]=l*g+u*f+c*h-o*d,e[t+2]=c*g+u*d+o*f-l*h,e[t+3]=u*g-o*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),h=o(r/2),f=l(n/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"YXZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"ZXY":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"ZYX":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"YZX":this._x=f*u*h+c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h-f*d*g;break;case"XZY":this._x=f*u*h-c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h+f*d*g;break;default:Oe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=n+o+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>h){let d=2*Math.sqrt(1+n-o-h);this._w=(u-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>h){let d=2*Math.sqrt(1+o-n-h);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+h-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),h=2*(r*n-a*t);return this.x=t+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return hu.copy(this).projectOnVector(e),this.sub(hu)}reflect(e){return this.sub(hu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},hu=new U,bd=new Ut,Xe=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],f=n[2],d=n[5],g=n[8],x=s[0],m=s[3],p=s[6],y=s[1],v=s[4],_=s[7],M=s[2],E=s[5],w=s[8];return r[0]=a*x+o*y+l*M,r[3]=a*m+o*v+l*E,r[6]=a*p+o*_+l*w,r[1]=c*x+u*y+h*M,r[4]=c*m+u*v+h*E,r[7]=c*p+u*_+h*w,r[2]=f*x+d*y+g*M,r[5]=f*m+d*v+g*E,r[8]=f*p+d*_+g*w,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,f=o*l-u*r,d=c*r-a*l,g=t*h+n*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(s*c-u*n)*x,e[2]=(o*n-s*a)*x,e[3]=f*x,e[4]=(u*t-s*l)*x,e[5]=(s*r-o*t)*x,e[6]=d*x,e[7]=(n*l-c*t)*x,e[8]=(a*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return _s("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(fu.makeScale(e,t)),this}rotate(e){return _s("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(fu.makeRotation(-e)),this}translate(e,t){return _s("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(fu.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},fu=new Xe,xd=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_d=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Fb(){let i={enabled:!0,workingColorSpace:fn,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===lt&&(s.r=Ci(s.r),s.g=Ci(s.g),s.b=Ci(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===lt&&(s.r=pr(s.r),s.g=pr(s.g),s.b=pr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ui?ga:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return _s("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return _s("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[fn]:{primaries:e,whitePoint:n,transfer:ga,toXYZ:xd,fromXYZ:_d,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Et},outputColorSpaceConfig:{drawingBufferColorSpace:Et}},[Et]:{primaries:e,whitePoint:n,transfer:lt,toXYZ:xd,fromXYZ:_d,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Et}}}),i}var Ze=Fb();function Ci(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function pr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var er,Qo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{er===void 0&&(er=xr("canvas")),er.width=e.width,er.height=e.height;let s=er.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=er}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=xr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ci(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ci(t[n]/255)*255):t[n]=Ci(t[n]);return{data:t,width:e.width,height:e.height}}else return Oe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Ob=0,yr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Ob++}),this.uuid=Yn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(du(s[a].image)):r.push(du(s[a]))}else r=du(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function du(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Qo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Oe("Texture: Unable to serialize Texture."),{})}var Ub=0,pu=new U,Xt=class i extends Jn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Dn,s=Dn,r=Pt,a=$n,o=hn,l=vn,c=i.DEFAULT_ANISOTROPY,u=Ui){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ub++}),this.uuid=Yn(),this.name="",this.source=new yr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ke(0,0),this.repeat=new Ke(1,1),this.center=new Ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(pu).x}get height(){return this.source.getSize(pu).y}get depth(){return this.source.getSize(pu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Oe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==oh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Zi:e.x=e.x-Math.floor(e.x);break;case Dn:e.x=e.x<0?0:1;break;case gr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Zi:e.y=e.y-Math.floor(e.y);break;case Dn:e.y=e.y<0?0:1;break;case gr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Xt.DEFAULT_IMAGE=null;Xt.DEFAULT_MAPPING=oh;Xt.DEFAULT_ANISOTROPY=1;var ft=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let v=(c+1)/2,_=(d+1)/2,M=(p+1)/2,E=(u+f)/4,w=(h+x)/4,b=(g+m)/4;return v>_&&v>M?v<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(v),s=E/n,r=w/n):_>M?_<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),n=E/s,r=b/s):M<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),n=w/r,s=b/r),this.set(n,s,r,t),this}let y=Math.sqrt((m-g)*(m-g)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(h-x)/y,this.z=(f-u)/y,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ec=class extends Jn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ft(0,0,e,t),this.scissorTest=!1,this.viewport=new ft(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Xt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Pt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new yr(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},xn=class extends ec{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},xa=class extends Xt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=Dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var tc=class extends Xt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=Dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Me=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,l,c,u,h,f,d,g,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,h,f,d,g,x,m)}set(e,t,n,s,r,a,o,l,c,u,h,f,d,g,x,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=f,p[3]=d,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/tr.setFromMatrixColumn(e,0).length(),r=1/tr.setFromMatrixColumn(e,1).length(),a=1/tr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=a*u,d=a*h,g=o*u,x=o*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+g*c,t[5]=f-x*c,t[9]=-o*l,t[2]=x-f*c,t[6]=g+d*c,t[10]=a*l}else if(e.order==="YXZ"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f+x*o,t[4]=g*o-d,t[8]=a*c,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=d*o-g,t[6]=x+f*o,t[10]=a*l}else if(e.order==="ZXY"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f-x*o,t[4]=-a*h,t[8]=g+d*o,t[1]=d+g*o,t[5]=a*u,t[9]=x-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let f=a*u,d=a*h,g=o*u,x=o*h;t[0]=l*u,t[4]=g*c-d,t[8]=f*c+x,t[1]=l*h,t[5]=x*c+f,t[9]=d*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let f=a*l,d=a*c,g=o*l,x=o*c;t[0]=l*u,t[4]=x-f*h,t[8]=g*h+d,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=d*h+g,t[10]=f-x*h}else if(e.order==="XZY"){let f=a*l,d=a*c,g=o*l,x=o*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+x,t[5]=a*u,t[9]=d*h-g,t[2]=g*h-d,t[6]=o*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(kb,e,Bb)}lookAt(e,t,n){let s=this.elements;return Sn.subVectors(e,t),Sn.lengthSq()===0&&(Sn.z=1),Sn.normalize(),qi.crossVectors(n,Sn),qi.lengthSq()===0&&(Math.abs(n.z)===1?Sn.x+=1e-4:Sn.z+=1e-4,Sn.normalize(),qi.crossVectors(n,Sn)),qi.normalize(),bo.crossVectors(Sn,qi),s[0]=qi.x,s[4]=bo.x,s[8]=Sn.x,s[1]=qi.y,s[5]=bo.y,s[9]=Sn.y,s[2]=qi.z,s[6]=bo.z,s[10]=Sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],f=n[9],d=n[13],g=n[2],x=n[6],m=n[10],p=n[14],y=n[3],v=n[7],_=n[11],M=n[15],E=s[0],w=s[4],b=s[8],T=s[12],R=s[1],P=s[5],D=s[9],I=s[13],C=s[2],N=s[6],z=s[10],F=s[14],W=s[3],V=s[7],Y=s[11],Q=s[15];return r[0]=a*E+o*R+l*C+c*W,r[4]=a*w+o*P+l*N+c*V,r[8]=a*b+o*D+l*z+c*Y,r[12]=a*T+o*I+l*F+c*Q,r[1]=u*E+h*R+f*C+d*W,r[5]=u*w+h*P+f*N+d*V,r[9]=u*b+h*D+f*z+d*Y,r[13]=u*T+h*I+f*F+d*Q,r[2]=g*E+x*R+m*C+p*W,r[6]=g*w+x*P+m*N+p*V,r[10]=g*b+x*D+m*z+p*Y,r[14]=g*T+x*I+m*F+p*Q,r[3]=y*E+v*R+_*C+M*W,r[7]=y*w+v*P+_*N+M*V,r[11]=y*b+v*D+_*z+M*Y,r[15]=y*T+v*I+_*F+M*Q,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],g=e[3],x=e[7],m=e[11],p=e[15],y=l*d-c*f,v=o*d-c*h,_=o*f-l*h,M=a*d-c*u,E=a*f-l*u,w=a*h-o*u;return t*(x*y-m*v+p*_)-n*(g*y-m*M+p*E)+s*(g*v-x*M+p*w)-r*(g*_-x*E+m*w)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],g=e[12],x=e[13],m=e[14],p=e[15],y=t*o-n*a,v=t*l-s*a,_=t*c-r*a,M=n*l-s*o,E=n*c-r*o,w=s*c-r*l,b=u*x-h*g,T=u*m-f*g,R=u*p-d*g,P=h*m-f*x,D=h*p-d*x,I=f*p-d*m,C=y*I-v*D+_*P+M*R-E*T+w*b;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let N=1/C;return e[0]=(o*I-l*D+c*P)*N,e[1]=(s*D-n*I-r*P)*N,e[2]=(x*w-m*E+p*M)*N,e[3]=(f*E-h*w-d*M)*N,e[4]=(l*R-a*I-c*T)*N,e[5]=(t*I-s*R+r*T)*N,e[6]=(m*_-g*w-p*v)*N,e[7]=(u*w-f*_+d*v)*N,e[8]=(a*D-o*R+c*b)*N,e[9]=(n*R-t*D-r*b)*N,e[10]=(g*E-x*_+p*y)*N,e[11]=(h*_-u*E-d*y)*N,e[12]=(o*T-a*P-l*b)*N,e[13]=(t*P-n*T+s*b)*N,e[14]=(x*v-g*M-m*y)*N,e[15]=(u*M-h*v+f*y)*N,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,h=o+o,f=r*c,d=r*u,g=r*h,x=a*u,m=a*h,p=o*h,y=l*c,v=l*u,_=l*h,M=n.x,E=n.y,w=n.z;return s[0]=(1-(x+p))*M,s[1]=(d+_)*M,s[2]=(g-v)*M,s[3]=0,s[4]=(d-_)*E,s[5]=(1-(f+p))*E,s[6]=(m+y)*E,s[7]=0,s[8]=(g+v)*w,s[9]=(m-y)*w,s[10]=(1-(f+x))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=tr.set(s[0],s[1],s[2]).length(),o=tr.set(s[4],s[5],s[6]).length(),l=tr.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Vn.copy(this);let c=1/a,u=1/o,h=1/l;return Vn.elements[0]*=c,Vn.elements[1]*=c,Vn.elements[2]*=c,Vn.elements[4]*=u,Vn.elements[5]*=u,Vn.elements[6]*=u,Vn.elements[8]*=h,Vn.elements[9]*=h,Vn.elements[10]*=h,t.setFromRotationMatrix(Vn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=Nn,l=!1){let c=this.elements,u=2*r/(t-e),h=2*r/(n-s),f=(t+e)/(t-e),d=(n+s)/(n-s),g,x;if(l)g=r/(a-r),x=a*r/(a-r);else if(o===Nn)g=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===br)g=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Nn,l=!1){let c=this.elements,u=2/(t-e),h=2/(n-s),f=-(t+e)/(t-e),d=-(n+s)/(n-s),g,x;if(l)g=1/(a-r),x=a/(a-r);else if(o===Nn)g=-2/(a-r),x=-(a+r)/(a-r);else if(o===br)g=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=h,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},tr=new U,Vn=new Me,kb=new U(0,0,0),Bb=new U(1,1,1),qi=new U,bo=new U,Sn=new U,yd=new Me,vd=new Ut,Fn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-nt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:Oe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return yd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(yd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return vd.setFromEuler(this),this.setFromQuaternion(vd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Fn.DEFAULT_ORDER="XYZ";var _a=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},zb=0,Md=new U,nr=new Ut,Si=new Me,xo=new U,ia=new U,Gb=new U,Hb=new Ut,Sd=new U(1,0,0),wd=new U(0,1,0),Ed=new U(0,0,1),Td={type:"added"},Vb={type:"removed"},ir={type:"childadded",child:null},mu={type:"childremoved",child:null},Mt=class i extends Jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:zb++}),this.uuid=Yn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new U,t=new Fn,n=new Ut,s=new U(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Me},normalMatrix:{value:new Xe}}),this.matrix=new Me,this.matrixWorld=new Me,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new _a,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return nr.setFromAxisAngle(e,t),this.quaternion.multiply(nr),this}rotateOnWorldAxis(e,t){return nr.setFromAxisAngle(e,t),this.quaternion.premultiply(nr),this}rotateX(e){return this.rotateOnAxis(Sd,e)}rotateY(e){return this.rotateOnAxis(wd,e)}rotateZ(e){return this.rotateOnAxis(Ed,e)}translateOnAxis(e,t){return Md.copy(e).applyQuaternion(this.quaternion),this.position.add(Md.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Sd,e)}translateY(e){return this.translateOnAxis(wd,e)}translateZ(e){return this.translateOnAxis(Ed,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Si.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?xo.copy(e):xo.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ia.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Si.lookAt(ia,xo,this.up):Si.lookAt(xo,ia,this.up),this.quaternion.setFromRotationMatrix(Si),s&&(Si.extractRotation(s.matrixWorld),nr.setFromRotationMatrix(Si),this.quaternion.premultiply(nr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(qe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Td),ir.child=e,this.dispatchEvent(ir),ir.child=null):qe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Vb),mu.child=e,this.dispatchEvent(mu),mu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Si.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Si.multiply(e.parent.matrixWorld)),e.applyMatrix4(Si),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Td),ir.child=e,this.dispatchEvent(ir),ir.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ia,e,Gb),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ia,Hb,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),f=a(e.skeletons),d=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Mt.DEFAULT_UP=new U(0,1,0);Mt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Rt=class extends Mt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Wb={type:"move"},vr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Rt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Rt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Rt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Wb)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Rt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},zp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xi={h:0,s:0,l:0},_o={h:0,s:0,l:0};function gu(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var ue=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Et){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ze.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ze.workingColorSpace){if(e=xh(e,1),t=nt(t,0,1),n=nt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=gu(a,r,e+1/3),this.g=gu(a,r,e),this.b=gu(a,r,e-1/3)}return Ze.colorSpaceToWorking(this,s),this}setStyle(e,t=Et){function n(r){r!==void 0&&parseFloat(r)<1&&Oe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Oe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Oe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Et){let n=zp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Oe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ci(e.r),this.g=Ci(e.g),this.b=Ci(e.b),this}copyLinearToSRGB(e){return this.r=pr(e.r),this.g=pr(e.g),this.b=pr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Et){return Ze.workingToColorSpace(nn.copy(this),e),Math.round(nt(nn.r*255,0,255))*65536+Math.round(nt(nn.g*255,0,255))*256+Math.round(nt(nn.b*255,0,255))}getHexString(e=Et){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.workingToColorSpace(nn.copy(this),t);let n=nn.r,s=nn.g,r=nn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ze.workingColorSpace){return Ze.workingToColorSpace(nn.copy(this),t),e.r=nn.r,e.g=nn.g,e.b=nn.b,e}getStyle(e=Et){Ze.workingToColorSpace(nn.copy(this),e);let t=nn.r,n=nn.g,s=nn.b;return e!==Et?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Xi),this.setHSL(Xi.h+e,Xi.s+t,Xi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Xi),e.getHSL(_o);let n=da(Xi.h,_o.h,t),s=da(Xi.s,_o.s,t),r=da(Xi.l,_o.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},nn=new ue;ue.NAMES=zp;var ya=class extends Mt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Fn,this.environmentIntensity=1,this.environmentRotation=new Fn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Wn=new U,wi=new U,bu=new U,Ei=new U,sr=new U,rr=new U,Ad=new U,xu=new U,_u=new U,yu=new U,vu=new ft,Mu=new ft,Su=new ft,Ji=class i{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Wn.subVectors(e,t),s.cross(Wn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Wn.subVectors(s,t),wi.subVectors(n,t),bu.subVectors(e,t);let a=Wn.dot(Wn),o=Wn.dot(wi),l=Wn.dot(bu),c=wi.dot(wi),u=wi.dot(bu),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;let f=1/h,d=(c*l-o*u)*f,g=(a*u-o*l)*f;return r.set(1-d-g,g,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ei)===null?!1:Ei.x>=0&&Ei.y>=0&&Ei.x+Ei.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Ei)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ei.x),l.addScaledVector(a,Ei.y),l.addScaledVector(o,Ei.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return vu.setScalar(0),Mu.setScalar(0),Su.setScalar(0),vu.fromBufferAttribute(e,t),Mu.fromBufferAttribute(e,n),Su.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(vu,r.x),a.addScaledVector(Mu,r.y),a.addScaledVector(Su,r.z),a}static isFrontFacing(e,t,n,s){return Wn.subVectors(n,t),wi.subVectors(e,t),Wn.cross(wi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Wn.subVectors(this.c,this.b),wi.subVectors(this.a,this.b),Wn.cross(wi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;sr.subVectors(s,n),rr.subVectors(r,n),xu.subVectors(e,n);let l=sr.dot(xu),c=rr.dot(xu);if(l<=0&&c<=0)return t.copy(n);_u.subVectors(e,s);let u=sr.dot(_u),h=rr.dot(_u);if(u>=0&&h<=u)return t.copy(s);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(sr,a);yu.subVectors(e,r);let d=sr.dot(yu),g=rr.dot(yu);if(g>=0&&d<=g)return t.copy(r);let x=d*c-l*g;if(x<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(rr,o);let m=u*g-d*h;if(m<=0&&h-u>=0&&d-g>=0)return Ad.subVectors(r,s),o=(h-u)/(h-u+(d-g)),t.copy(s).addScaledVector(Ad,o);let p=1/(m+x+f);return a=x*p,o=f*p,t.copy(n).addScaledVector(sr,a).addScaledVector(rr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Tt=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(qn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(qn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=qn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,qn):qn.fromBufferAttribute(r,a),qn.applyMatrix4(e.matrixWorld),this.expandByPoint(qn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),yo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),yo.copy(n.boundingBox)),yo.applyMatrix4(e.matrixWorld),this.union(yo)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,qn),qn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(sa),vo.subVectors(this.max,sa),ar.subVectors(e.a,sa),or.subVectors(e.b,sa),cr.subVectors(e.c,sa),ji.subVectors(or,ar),Ki.subVectors(cr,or),hs.subVectors(ar,cr);let t=[0,-ji.z,ji.y,0,-Ki.z,Ki.y,0,-hs.z,hs.y,ji.z,0,-ji.x,Ki.z,0,-Ki.x,hs.z,0,-hs.x,-ji.y,ji.x,0,-Ki.y,Ki.x,0,-hs.y,hs.x,0];return!wu(t,ar,or,cr,vo)||(t=[1,0,0,0,1,0,0,0,1],!wu(t,ar,or,cr,vo))?!1:(Mo.crossVectors(ji,Ki),t=[Mo.x,Mo.y,Mo.z],wu(t,ar,or,cr,vo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,qn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(qn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ti),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ti=[new U,new U,new U,new U,new U,new U,new U,new U],qn=new U,yo=new Tt,ar=new U,or=new U,cr=new U,ji=new U,Ki=new U,hs=new U,sa=new U,vo=new U,Mo=new U,fs=new U;function wu(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){fs.fromArray(i,r);let o=s.x*Math.abs(fs.x)+s.y*Math.abs(fs.y)+s.z*Math.abs(fs.z),l=e.dot(fs),c=t.dot(fs),u=n.dot(fs);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Ot=new U,So=new Ke,qb=0,st=class extends Jn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:qb++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=gh,this.updateRanges=[],this.gpuType=un,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)So.fromBufferAttribute(this,t),So.applyMatrix3(e),this.setXY(t,So.x,So.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix3(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix4(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyNormalMatrix(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.transformDirection(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Kn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Kn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Kn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Kn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array),r=ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Ss=class extends st{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var ws=class extends st{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var mt=class extends st{constructor(e,t,n){super(new Float32Array(e),t,n)}},Xb=new Tt,ra=new U,Eu=new U,qt=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Xb.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ra.subVectors(e,this.center);let t=ra.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ra,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Eu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ra.copy(e.center).add(Eu)),this.expandByPoint(ra.copy(e.center).sub(Eu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},jb=0,Ln=new Me,Tu=new Mt,lr=new U,wn=new Tt,aa=new Tt,Vt=new U,St=class i extends Jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:jb++}),this.uuid=Yn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(xb(e)?ws:Ss)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Xe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Ln.makeRotationFromQuaternion(e),this.applyMatrix4(Ln),this}rotateX(e){return Ln.makeRotationX(e),this.applyMatrix4(Ln),this}rotateY(e){return Ln.makeRotationY(e),this.applyMatrix4(Ln),this}rotateZ(e){return Ln.makeRotationZ(e),this.applyMatrix4(Ln),this}translate(e,t,n){return Ln.makeTranslation(e,t,n),this.applyMatrix4(Ln),this}scale(e,t,n){return Ln.makeScale(e,t,n),this.applyMatrix4(Ln),this}lookAt(e){return Tu.lookAt(e),Tu.updateMatrix(),this.applyMatrix4(Tu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(lr).negate(),this.translate(lr.x,lr.y,lr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new mt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Oe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Tt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){qe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];wn.setFromBufferAttribute(r),this.morphTargetsRelative?(Vt.addVectors(this.boundingBox.min,wn.min),this.boundingBox.expandByPoint(Vt),Vt.addVectors(this.boundingBox.max,wn.max),this.boundingBox.expandByPoint(Vt)):(this.boundingBox.expandByPoint(wn.min),this.boundingBox.expandByPoint(wn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&qe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){qe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(wn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];aa.setFromBufferAttribute(o),this.morphTargetsRelative?(Vt.addVectors(wn.min,aa.min),wn.expandByPoint(Vt),Vt.addVectors(wn.max,aa.max),wn.expandByPoint(Vt)):(wn.expandByPoint(aa.min),wn.expandByPoint(aa.max))}wn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Vt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Vt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Vt.fromBufferAttribute(o,c),l&&(lr.fromBufferAttribute(e,c),Vt.add(lr)),s=Math.max(s,n.distanceToSquared(Vt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&qe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){qe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new st(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let b=0;b<n.count;b++)o[b]=new U,l[b]=new U;let c=new U,u=new U,h=new U,f=new Ke,d=new Ke,g=new Ke,x=new U,m=new U;function p(b,T,R){c.fromBufferAttribute(n,b),u.fromBufferAttribute(n,T),h.fromBufferAttribute(n,R),f.fromBufferAttribute(r,b),d.fromBufferAttribute(r,T),g.fromBufferAttribute(r,R),u.sub(c),h.sub(c),d.sub(f),g.sub(f);let P=1/(d.x*g.y-g.x*d.y);isFinite(P)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-d.y).multiplyScalar(P),m.copy(h).multiplyScalar(d.x).addScaledVector(u,-g.x).multiplyScalar(P),o[b].add(x),o[T].add(x),o[R].add(x),l[b].add(m),l[T].add(m),l[R].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let b=0,T=y.length;b<T;++b){let R=y[b],P=R.start,D=R.count;for(let I=P,C=P+D;I<C;I+=3)p(e.getX(I+0),e.getX(I+1),e.getX(I+2))}let v=new U,_=new U,M=new U,E=new U;function w(b){M.fromBufferAttribute(s,b),E.copy(M);let T=o[b];v.copy(T),v.sub(M.multiplyScalar(M.dot(T))).normalize(),_.crossVectors(E,T);let P=_.dot(l[b])<0?-1:1;a.setXYZW(b,v.x,v.y,v.z,P)}for(let b=0,T=y.length;b<T;++b){let R=y[b],P=R.start,D=R.count;for(let I=P,C=P+D;I<C;I+=3)w(e.getX(I+0)),w(e.getX(I+1)),w(e.getX(I+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new st(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);let s=new U,r=new U,a=new U,o=new U,l=new U,c=new U,u=new U,h=new U;if(e)for(let f=0,d=e.count;f<d;f+=3){let g=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Vt.fromBufferAttribute(e,t),Vt.normalize(),e.setXYZ(t,Vt.x,Vt.y,Vt.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,h=o.normalized,f=new c.constructor(l.length*u),d=0,g=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?d=l[x]*o.data.stride+o.offset:d=l[x]*u;for(let p=0;p<u;p++)f[g++]=c[d++]}return new st(f,u,h)}if(this.index===null)return Oe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){let f=c[u],d=e(f,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Mr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=gh,this.updateRanges=[],this.version=0,this.uuid=Yn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},ln=new U,Sr=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyMatrix4(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyNormalMatrix(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.transformDirection(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Kn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Kn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Kn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Kn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array),r=ht(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){ba("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new st(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){ba("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Au=new U,Kb=new U,Yb=new Xe,Xn=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Au.subVectors(n,t).cross(Kb.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Au),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Yb.getNormalMatrix(e),s=this.coplanarPoint(Au).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Jb=0,dn=class extends Jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Jb++}),this.uuid=Yn(),this.name="",this.type="Material",this.blending=Pr,this.side=hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$u,this.blendDst=Qu,this.blendEquation=Os,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ue(0,0,0),this.blendAlpha=0,this.depthFunc=mr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Rp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=qo,this.stencilZFail=qo,this.stencilZPass=qo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Oe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ue().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Xn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ke().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ke().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Ai=new U,Ru=new U,wo=new U,Eo=new U,Es=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ai)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ai.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ai.copy(this.origin).addScaledVector(this.direction,t),Ai.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Ru.copy(e).add(t).multiplyScalar(.5),wo.copy(t).sub(e).normalize(),Eo.copy(this.origin).sub(Ru);let r=e.distanceTo(t)*.5,a=-this.direction.dot(wo),o=Eo.dot(this.direction),l=-Eo.dot(wo),c=Eo.lengthSq(),u=Math.abs(1-a*a),h,f,d,g;if(u>0)if(h=a*l-o,f=a*o-l,g=r*u,h>=0)if(f>=-g)if(f<=g){let x=1/u;h*=x,f*=x,d=h*(h+a*f+2*o)+f*(a*h+f+2*l)+c}else f=r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;else f=-r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;else f<=-g?(h=Math.max(0,-(-a*r+o)),f=h>0?-r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c):f<=g?(h=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(h=Math.max(0,-(a*r+o)),f=h>0?r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c);else f=a>0?-r:r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Ru).addScaledVector(wo,f),d}intersectSphere(e,t){if(e.radius<0)return null;Ai.subVectors(e.center,this.origin);let n=Ai.dot(this.direction),s=Ai.dot(Ai)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),u>=0?(r=(e.min.y-f.y)*u,a=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,a=(e.min.y-f.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(o=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ai)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,h=e.x-a.x,f=e.y-a.y,d=e.z-a.z,g=t.x-a.x,x=t.y-a.y,m=t.z-a.z,p=n.x-a.x,y=n.y-a.y,v=n.z-a.z,_=Math.abs(l),M=Math.abs(c),E=Math.abs(u),w,b,T,R,P,D,I,C,N,z,F,W;if(_>=M&&_>=E?(T=l,D=h,N=g,W=p,l>=0?(w=c,b=u,R=f,P=d,I=x,C=m,z=y,F=v):(w=u,b=c,R=d,P=f,I=m,C=x,z=v,F=y)):M>=E?(T=c,D=f,N=x,W=y,c>=0?(w=u,b=l,R=d,P=h,I=m,C=g,z=v,F=p):(w=l,b=u,R=h,P=d,I=g,C=m,z=p,F=v)):(T=u,D=d,N=m,W=v,u>=0?(w=l,b=c,R=h,P=f,I=g,C=x,z=p,F=y):(w=c,b=l,R=f,P=h,I=x,C=g,z=y,F=p)),T===0)return null;let V=w/T,Y=b/T,Q=1/T,he=R-V*D,fe=P-Y*D,Ge=I-V*N,Te=C-Y*N,Fe=z-V*W,k=F-Y*W,$=Fe*Te-k*Ge,O=he*k-fe*Fe,ee=Ge*fe-Te*he;if(s){if($<0||O<0||ee<0)return null}else if(($<0||O<0||ee<0)&&($>0||O>0||ee>0))return null;let te=$+O+ee;if(te===0)return null;let ce=Q*($*D+O*N+ee*W);return(te>0?ce<0:ce>0)?null:this.at(ce/te,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Zn=class extends dn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Fn,this.combine=_c,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Rd=new Me,ds=new Es,To=new qt,Cd=new U,Ao=new U,Ro=new U,Co=new U,Cu=new U,Po=new U,Pd=new U,Io=new U,It=class extends Mt{constructor(e=new St,t=new Zn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Po.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],h=r[l];u!==0&&(Cu.fromBufferAttribute(h,e),a?Po.addScaledVector(Cu,u):Po.addScaledVector(Cu.sub(t),u))}t.add(Po)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),To.copy(n.boundingSphere),To.applyMatrix4(r),ds.copy(e.ray).recast(e.near),!(To.containsPoint(ds.origin)===!1&&(ds.intersectSphere(To,Cd)===null||ds.origin.distanceToSquared(Cd)>(e.far-e.near)**2))&&(Rd.copy(r).invert(),ds.copy(e.ray).applyMatrix4(Rd),!(n.boundingBox!==null&&ds.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ds)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){let m=f[g],p=a[m.materialIndex],y=Math.max(m.start,d.start),v=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let _=y,M=v;_<M;_+=3){let E=o.getX(_),w=o.getX(_+1),b=o.getX(_+2);s=Lo(this,p,e,n,c,u,h,E,w,b),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(o.count,d.start+d.count);for(let m=g,p=x;m<p;m+=3){let y=o.getX(m),v=o.getX(m+1),_=o.getX(m+2);s=Lo(this,a,e,n,c,u,h,y,v,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){let m=f[g],p=a[m.materialIndex],y=Math.max(m.start,d.start),v=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let _=y,M=v;_<M;_+=3){let E=_,w=_+1,b=_+2;s=Lo(this,p,e,n,c,u,h,E,w,b),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let m=g,p=x;m<p;m+=3){let y=m,v=m+1,_=m+2;s=Lo(this,a,e,n,c,u,h,y,v,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Zb(i,e,t,n,s,r,a,o){let l;if(e.side===gn?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===hi,o),l===null)return null;Io.copy(o),Io.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Io);return c<t.near||c>t.far?null:{distance:c,point:Io.clone(),object:i}}function Lo(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ao),i.getVertexPosition(l,Ro),i.getVertexPosition(c,Co);let u=Zb(i,e,t,n,Ao,Ro,Co,Pd);if(u){let h=new U;Ji.getBarycoord(Pd,Ao,Ro,Co,h),s&&(u.uv=Ji.getInterpolatedAttribute(s,o,l,c,h,new Ke)),r&&(u.uv1=Ji.getInterpolatedAttribute(r,o,l,c,h,new Ke)),a&&(u.normal=Ji.getInterpolatedAttribute(a,o,l,c,h,new U),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let f={a:o,b:l,c,normal:new U,materialIndex:0};Ji.getNormal(Ao,Ro,Co,f.normal),u.face=f,u.barycoord=h}return u}var oa=new ft,Id=new ft,Ld=new ft,$b=new ft,Dd=new Me,Do=new U,Pu=new qt,Nd=new Me,Iu=new Es,Ts=class extends It{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Uu,this.bindMatrix=new Me,this.bindMatrixInverse=new Me,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Tt),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Do),this.boundingBox.expandByPoint(Do)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new qt),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Do),this.boundingSphere.expandByPoint(Do)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Pu.copy(this.boundingSphere),Pu.applyMatrix4(s),e.ray.intersectsSphere(Pu)!==!1&&(Nd.copy(s).invert(),Iu.copy(e.ray).applyMatrix4(Nd),!(this.boundingBox!==null&&Iu.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Iu)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new ft,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Uu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Mp?this.bindMatrixInverse.copy(this.bindMatrix).invert():Oe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Id.fromBufferAttribute(s.attributes.skinIndex,e),Ld.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(oa.copy(t),t.set(0,0,0,0)):(oa.set(...t,1),t.set(0,0,0)),oa.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=Ld.getComponent(r);if(a!==0){let o=Id.getComponent(r);Dd.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector($b.copy(oa).applyMatrix4(Dd),a)}}return t.isVector4&&(t.w=oa.w),t.applyMatrix4(this.bindMatrixInverse)}},wr=class extends Mt{constructor(){super(),this.isBone=!0,this.type="Bone"}},Pi=class extends Xt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ct,u=Ct,h,f){super(null,a,o,l,c,u,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Fd=new Me,Qb=new Me,va=class i{constructor(e=[],t=[]){this.uuid=Yn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Oe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Me)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Me;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:Qb;Fd.multiplyMatrices(o,t[r]),Fd.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Pi(t,e,e,hn,un);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],a=t[r];a===void 0&&(Oe("Skeleton: No bone found with UUID:",r),a=new wr),this.bones.push(a),this.boneInverses.push(new Me().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let a=t[s];e.bones.push(a.uuid);let o=n[s];e.boneInverses.push(o.toArray())}return e}},pn=class extends st{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ur=new Me,Od=new Me,No=[],Ud=new Tt,ex=new Me,ca=new It,la=new qt,Yt=class extends It{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new pn(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,ex)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Tt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ur),Ud.copy(e.boundingBox).applyMatrix4(ur),this.boundingBox.union(Ud)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new qt),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ur),la.copy(e.boundingSphere).applyMatrix4(ur),this.boundingSphere.union(la)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(ca.geometry=this.geometry,ca.material=this.material,ca.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),la.copy(this.boundingSphere),la.applyMatrix4(n),e.ray.intersectsSphere(la)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ur),Od.multiplyMatrices(n,ur),ca.matrixWorld=Od,ca.raycast(e,No);for(let a=0,o=No.length;a<o;a++){let l=No[a];l.instanceId=r,l.object=this,t.push(l)}No.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new pn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Pi(new Float32Array(s*this.count),s,this.count,Tc,un));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ps=new qt,tx=new Ke(.5,.5),Fo=new U,Ii=class{constructor(e=new Xn,t=new Xn,n=new Xn,s=new Xn,r=new Xn,a=new Xn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Nn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],f=r[6],d=r[7],g=r[8],x=r[9],m=r[10],p=r[11],y=r[12],v=r[13],_=r[14],M=r[15];if(s[0].setComponents(c-a,d-u,p-g,M-y).normalize(),s[1].setComponents(c+a,d+u,p+g,M+y).normalize(),s[2].setComponents(c+o,d+h,p+x,M+v).normalize(),s[3].setComponents(c-o,d-h,p-x,M-v).normalize(),n)s[4].setComponents(l,f,m,_).normalize(),s[5].setComponents(c-l,d-f,p-m,M-_).normalize();else if(s[4].setComponents(c-l,d-f,p-m,M-_).normalize(),t===Nn)s[5].setComponents(c+l,d+f,p+m,M+_).normalize();else if(t===br)s[5].setComponents(l,f,m,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ps.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ps.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ps)}intersectsSprite(e){ps.center.set(0,0,0);let t=tx.distanceTo(e.center);return ps.radius=.7071067811865476+t,ps.applyMatrix4(e.matrixWorld),this.intersectsSphere(ps)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Fo.x=s.normal.x>0?e.max.x:e.min.x,Fo.y=s.normal.y>0?e.max.y:e.min.y,Fo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Fo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},kd=new Me,nc=class i{constructor(){this.coordinateSystem=Nn,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];kd.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Ii),n[s].setFromProjectionMatrix(kd,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new Ii),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};function Lu(i,e){return i-e}function nx(i,e){return i.z-e.z}function ix(i,e){return e.z-i.z}var Bu=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n,s){let r=this.pool,a=this.list;this.index>=r.length&&r.push({start:-1,count:-1,z:-1,index:-1});let o=r[this.index];a.push(o),this.index++,o.start=e,o.count=t,o.z=n,o.index=s}reset(){this.list.length=0,this.index=0}},bn=new Me,sx=new ue(1,1,1),rx=new Ii,ax=new nc,Oo=new Tt,ms=new qt,ua=new U,Bd=new U,ox=new U,Du=new Bu,sn=new It,Uo=[];function cx(i,e,t=0){let n=e.itemSize;if(i.isInterleavedBufferAttribute||i.array.constructor!==e.array.constructor){let s=i.count;for(let r=0;r<s;r++)for(let a=0;a<n;a++)e.setComponent(r+t,a,i.getComponent(r,a))}else e.array.set(i.array,t*n);e.needsUpdate=!0}function gs(i,e){if(i.constructor!==e.constructor){let t=Math.min(i.length,e.length);for(let n=0;n<t;n++)e[n]=i[n]}else{let t=Math.min(i.length,e.length);e.set(new i.constructor(i.buffer,0,t))}}var As=class extends It{constructor(e,t,n=t*2,s){super(new St,s),this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=e,this._maxVertexCount=t,this._maxIndexCount=n,this._multiDrawCounts=new Int32Array(e),this._multiDrawStarts=new Int32Array(e),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let e=Math.sqrt(this._maxInstanceCount*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4),n=new Pi(t,e,e,hn,un);this._matricesTexture=n}_initIndirectTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Uint32Array(e*e),n=new Pi(t,e,e,za,Un);this._indirectTexture=n}_initColorsTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Float32Array(e*e*4).fill(1),n=new Pi(t,e,e,hn,un);n.colorSpace=Ze.workingColorSpace,this._colorsTexture=n}_initializeGeometry(e){let t=this.geometry,n=this._maxVertexCount,s=this._maxIndexCount;if(this._geometryInitialized===!1){for(let r in e.attributes){let a=e.getAttribute(r),{array:o,itemSize:l,normalized:c}=a,u=new o.constructor(n*l),h=new st(u,l,c);t.setAttribute(r,h)}if(e.getIndex()!==null){let r=n>65535?new Uint32Array(s):new Uint16Array(s);t.setIndex(new st(r,1))}this._geometryInitialized=!0}}_validateGeometry(e){let t=this.geometry;if(!!e.getIndex()!=!!t.getIndex())throw new Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let n in t.attributes){if(!e.hasAttribute(n))throw new Error(`THREE.BatchedMesh: Added geometry missing "${n}". All geometries must have consistent attributes.`);let s=e.getAttribute(n),r=t.getAttribute(n);if(s.itemSize!==r.itemSize||s.normalized!==r.normalized)throw new Error("THREE.BatchedMesh: All attributes must have a consistent itemSize and normalized value.")}}validateInstanceId(e){let t=this._instanceInfo;if(e<0||e>=t.length||t[e].active===!1)throw new Error(`THREE.BatchedMesh: Invalid instanceId ${e}. Instance is either out of range or has been deleted.`)}validateGeometryId(e){let t=this._geometryInfo;if(e<0||e>=t.length||t[e].active===!1)throw new Error(`THREE.BatchedMesh: Invalid geometryId ${e}. Geometry is either out of range or has been deleted.`)}setCustomSort(e){return this.customSort=e,this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Tt);let e=this.boundingBox,t=this._instanceInfo;e.makeEmpty();for(let n=0,s=t.length;n<s;n++){if(t[n].active===!1)continue;let r=t[n].geometryIndex;this.getMatrixAt(n,bn),this.getBoundingBoxAt(r,Oo).applyMatrix4(bn),e.union(Oo)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qt);let e=this.boundingSphere,t=this._instanceInfo;e.makeEmpty();for(let n=0,s=t.length;n<s;n++){if(t[n].active===!1)continue;let r=t[n].geometryIndex;this.getMatrixAt(n,bn),this.getBoundingSphereAt(r,ms).applyMatrix4(bn),e.union(ms)}}addInstance(e){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw new Error("THREE.BatchedMesh: Maximum item count reached.");let n={visible:!0,active:!0,geometryIndex:e},s=null;this._availableInstanceIds.length>0?(this._availableInstanceIds.sort(Lu),s=this._availableInstanceIds.shift(),this._instanceInfo[s]=n):(s=this._instanceInfo.length,this._instanceInfo.push(n));let r=this._matricesTexture;bn.identity().toArray(r.image.data,s*16),r.needsUpdate=!0;let a=this._colorsTexture;return a&&(sx.toArray(a.image.data,s*4),a.needsUpdate=!0),this._visibilityChanged=!0,s}addGeometry(e,t=-1,n=-1){this._initializeGeometry(e),this._validateGeometry(e);let s={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},r=this._geometryInfo;s.vertexStart=this._nextVertexStart,s.reservedVertexCount=t===-1?e.getAttribute("position").count:t;let a=e.getIndex();if(a!==null&&(s.indexStart=this._nextIndexStart,s.reservedIndexCount=n===-1?a.count:n),s.indexStart!==-1&&s.indexStart+s.reservedIndexCount>this._maxIndexCount||s.vertexStart+s.reservedVertexCount>this._maxVertexCount)throw new Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let l;return this._availableGeometryIds.length>0?(this._availableGeometryIds.sort(Lu),l=this._availableGeometryIds.shift(),r[l]=s):(l=this._geometryCount,this._geometryCount++,r.push(s)),this.setGeometryAt(l,e),this._nextIndexStart=s.indexStart+s.reservedIndexCount,this._nextVertexStart=s.vertexStart+s.reservedVertexCount,l}setGeometryAt(e,t){if(e>=this._geometryCount)throw new Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(t);let n=this.geometry,s=n.getIndex()!==null,r=n.getIndex(),a=t.getIndex(),o=this._geometryInfo[e];if(s&&a.count>o.reservedIndexCount||t.attributes.position.count>o.reservedVertexCount)throw new Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let l=o.vertexStart,c=o.reservedVertexCount;o.vertexCount=t.getAttribute("position").count;for(let u in n.attributes){let h=t.getAttribute(u),f=n.getAttribute(u);cx(h,f,l);let d=h.itemSize;for(let g=h.count,x=c;g<x;g++){let m=l+g;for(let p=0;p<d;p++)f.setComponent(m,p,0)}f.needsUpdate=!0,f.addUpdateRange(l*d,c*d)}if(s){let u=o.indexStart,h=o.reservedIndexCount;o.indexCount=t.getIndex().count;for(let f=0;f<a.count;f++)r.setX(u+f,l+a.getX(f));for(let f=a.count,d=h;f<d;f++)r.setX(u+f,l);r.needsUpdate=!0,r.addUpdateRange(u,o.reservedIndexCount)}return o.start=s?o.indexStart:o.vertexStart,o.count=s?o.indexCount:o.vertexCount,o.boundingBox=null,t.boundingBox!==null&&(o.boundingBox=t.boundingBox.clone()),o.boundingSphere=null,t.boundingSphere!==null&&(o.boundingSphere=t.boundingSphere.clone()),this._visibilityChanged=!0,e}deleteGeometry(e){let t=this._geometryInfo;if(e>=t.length||t[e].active===!1)return this;let n=this._instanceInfo;for(let s=0,r=n.length;s<r;s++)n[s].active&&n[s].geometryIndex===e&&this.deleteInstance(s);return t[e].active=!1,this._availableGeometryIds.push(e),this._visibilityChanged=!0,this}deleteInstance(e){return this.validateInstanceId(e),this._instanceInfo[e].active=!1,this._availableInstanceIds.push(e),this._visibilityChanged=!0,this}optimize(){let e=0,t=0,n=this._geometryInfo,s=n.map((a,o)=>o).sort((a,o)=>n[a].vertexStart-n[o].vertexStart),r=this.geometry;for(let a=0,o=n.length;a<o;a++){let l=s[a],c=n[l];if(c.active!==!1){if(r.index!==null){if(c.indexStart!==t){let{indexStart:u,vertexStart:h,reservedIndexCount:f}=c,d=r.index,g=d.array,x=e-h;for(let m=u;m<u+f;m++)g[m]=g[m]+x;d.array.copyWithin(t,u,u+f),d.addUpdateRange(t,f),d.needsUpdate=!0,c.indexStart=t}t+=c.reservedIndexCount}if(c.vertexStart!==e){let{vertexStart:u,reservedVertexCount:h}=c,f=r.attributes;for(let d in f){let g=f[d],{array:x,itemSize:m}=g;x.copyWithin(e*m,u*m,(u+h)*m),g.addUpdateRange(e*m,h*m),g.needsUpdate=!0}c.vertexStart=e}e+=c.reservedVertexCount,c.start=r.index?c.indexStart:c.vertexStart}}return this._nextIndexStart=t,this._nextVertexStart=e,this._visibilityChanged=!0,this}getBoundingBoxAt(e,t){if(e>=this._geometryCount)return null;let n=this.geometry,s=this._geometryInfo[e];if(s.boundingBox===null){let r=new Tt,a=n.index,o=n.attributes.position;for(let l=s.start,c=s.start+s.count;l<c;l++){let u=l;a&&(u=a.getX(u)),r.expandByPoint(ua.fromBufferAttribute(o,u))}s.boundingBox=r}return t.copy(s.boundingBox),t}getBoundingSphereAt(e,t){if(e>=this._geometryCount)return null;let n=this.geometry,s=this._geometryInfo[e];if(s.boundingSphere===null){let r=new qt;this.getBoundingBoxAt(e,Oo),Oo.getCenter(r.center);let a=n.index,o=n.attributes.position,l=0;for(let c=s.start,u=s.start+s.count;c<u;c++){let h=c;a&&(h=a.getX(h)),ua.fromBufferAttribute(o,h),l=Math.max(l,r.center.distanceToSquared(ua))}r.radius=Math.sqrt(l),s.boundingSphere=r}return t.copy(s.boundingSphere),t}setMatrixAt(e,t){this.validateInstanceId(e);let n=this._matricesTexture,s=this._matricesTexture.image.data;return t.toArray(s,e*16),n.needsUpdate=!0,this}getMatrixAt(e,t){return this.validateInstanceId(e),t.fromArray(this._matricesTexture.image.data,e*16)}setColorAt(e,t){return this.validateInstanceId(e),this._colorsTexture===null&&this._initColorsTexture(),t.toArray(this._colorsTexture.image.data,e*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(e,t){return this.validateInstanceId(e),this._colorsTexture===null?t.isVector4?t.set(1,1,1,1):t.setRGB(1,1,1):t.fromArray(this._colorsTexture.image.data,e*4)}setVisibleAt(e,t){return this.validateInstanceId(e),this._instanceInfo[e].visible===t?this:(this._instanceInfo[e].visible=t,this._visibilityChanged=!0,this)}getVisibleAt(e){return this.validateInstanceId(e),this._instanceInfo[e].visible}setGeometryIdAt(e,t){return this.validateInstanceId(e),this.validateGeometryId(t),this._instanceInfo[e].geometryIndex=t,this._visibilityChanged=!0,this}getGeometryIdAt(e){return this.validateInstanceId(e),this._instanceInfo[e].geometryIndex}getGeometryRangeAt(e,t={}){this.validateGeometryId(e);let n=this._geometryInfo[e];return t.vertexStart=n.vertexStart,t.vertexCount=n.vertexCount,t.reservedVertexCount=n.reservedVertexCount,t.indexStart=n.indexStart,t.indexCount=n.indexCount,t.reservedIndexCount=n.reservedIndexCount,t.start=n.start,t.count=n.count,t}setInstanceCount(e){let t=this._availableInstanceIds,n=this._instanceInfo;for(t.sort(Lu);t[t.length-1]===n.length-1;)n.pop(),t.pop();if(e<n.length)throw new Error(`THREE.BatchedMesh: Instance ids outside the range ${e} are being used. Cannot shrink instance count.`);let s=new Int32Array(e),r=new Int32Array(e);gs(this._multiDrawCounts,s),gs(this._multiDrawStarts,r),this._multiDrawCounts=s,this._multiDrawStarts=r,this._maxInstanceCount=e;let a=this._indirectTexture,o=this._matricesTexture,l=this._colorsTexture;a.dispose(),this._initIndirectTexture(),gs(a.image.data,this._indirectTexture.image.data),o.dispose(),this._initMatricesTexture(),gs(o.image.data,this._matricesTexture.image.data),l&&(l.dispose(),this._initColorsTexture(),gs(l.image.data,this._colorsTexture.image.data))}setGeometrySize(e,t){let n=[...this._geometryInfo].filter(o=>o.active);if(Math.max(...n.map(o=>o.vertexStart+o.reservedVertexCount))>e)throw new Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${t}. Cannot shrink further.`);if(this.geometry.index&&Math.max(...n.map(l=>l.indexStart+l.reservedIndexCount))>t)throw new Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${t}. Cannot shrink further.`);let r=this.geometry;r.dispose(),this._maxVertexCount=e,this._maxIndexCount=t,this._geometryInitialized&&(this._geometryInitialized=!1,this.geometry=new St,this._initializeGeometry(r));let a=this.geometry;r.index&&gs(r.index.array,a.index.array);for(let o in r.attributes)gs(r.attributes[o].array,a.attributes[o].array)}raycast(e,t){let n=this._instanceInfo,s=this._geometryInfo,r=this.matrixWorld,a=this.geometry;sn.material=this.material,sn.geometry.index=a.index,sn.geometry.attributes=a.attributes,sn.geometry.boundingBox===null&&(sn.geometry.boundingBox=new Tt),sn.geometry.boundingSphere===null&&(sn.geometry.boundingSphere=new qt);for(let o=0,l=n.length;o<l;o++){if(!n[o].visible||!n[o].active)continue;let c=n[o].geometryIndex,u=s[c];sn.geometry.setDrawRange(u.start,u.count),this.getMatrixAt(o,sn.matrixWorld).premultiply(r),this.getBoundingBoxAt(c,sn.geometry.boundingBox),this.getBoundingSphereAt(c,sn.geometry.boundingSphere),sn.raycast(e,Uo);for(let h=0,f=Uo.length;h<f;h++){let d=Uo[h];d.object=this,d.batchId=o,t.push(d)}Uo.length=0}sn.material=null,sn.geometry.index=null,sn.geometry.attributes={},sn.geometry.setDrawRange(0,1/0)}copy(e){return super.copy(e),this.geometry=e.geometry.clone(),this.perObjectFrustumCulled=e.perObjectFrustumCulled,this.sortObjects=e.sortObjects,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this._geometryInfo=e._geometryInfo.map(t=>({...t,boundingBox:t.boundingBox!==null?t.boundingBox.clone():null,boundingSphere:t.boundingSphere!==null?t.boundingSphere.clone():null})),this._instanceInfo=e._instanceInfo.map(t=>({...t})),this._availableInstanceIds=e._availableInstanceIds.slice(),this._availableGeometryIds=e._availableGeometryIds.slice(),this._nextIndexStart=e._nextIndexStart,this._nextVertexStart=e._nextVertexStart,this._geometryCount=e._geometryCount,this._maxInstanceCount=e._maxInstanceCount,this._maxVertexCount=e._maxVertexCount,this._maxIndexCount=e._maxIndexCount,this._geometryInitialized=e._geometryInitialized,this._multiDrawCounts=e._multiDrawCounts.slice(),this._multiDrawStarts=e._multiDrawStarts.slice(),this._multiDrawBytesPerElement=e._multiDrawBytesPerElement,this._indirectTexture=e._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=e._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),this._colorsTexture!==null&&(this._colorsTexture=e._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice()),this}dispose(){super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null&&(this._colorsTexture.dispose(),this._colorsTexture=null)}onBeforeRender(e,t,n,s,r){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let a=s.getIndex(),o=a===null?1:a.array.BYTES_PER_ELEMENT,l=1;r.wireframe&&(l=2,o=s.attributes.position.count>65535?4:2);let c=this._instanceInfo,u=this._multiDrawStarts,h=this._multiDrawCounts,f=this._geometryInfo,d=this.perObjectFrustumCulled,g=this._indirectTexture,x=g.image.data,m=n.isArrayCamera?ax:rx;d&&(n.isArrayCamera?m.setFromArrayCamera(n):(bn.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse).multiply(this.matrixWorld),m.setFromProjectionMatrix(bn,n.coordinateSystem,n.reversedDepth)));let p=0;if(this.sortObjects){bn.copy(this.matrixWorld).invert(),ua.setFromMatrixPosition(n.matrixWorld).applyMatrix4(bn),Bd.set(0,0,-1).transformDirection(n.matrixWorld).transformDirection(bn);for(let _=0,M=c.length;_<M;_++)if(c[_].visible&&c[_].active){let E=c[_].geometryIndex;this.getMatrixAt(_,bn),this.getBoundingSphereAt(E,ms).applyMatrix4(bn);let w=!1;if(d&&(w=!m.intersectsSphere(ms)),!w){let b=f[E],T=ox.subVectors(ms.center,ua).dot(Bd);Du.push(b.start,b.count,T,_)}}let y=Du.list,v=this.customSort;v===null?y.sort(r.transparent?ix:nx):v.call(this,y,n);for(let _=0,M=y.length;_<M;_++){let E=y[_];u[p]=E.start*o*l,h[p]=E.count*l,x[p]=E.index,p++}Du.reset()}else for(let y=0,v=c.length;y<v;y++)if(c[y].visible&&c[y].active){let _=c[y].geometryIndex,M=!1;if(d&&(this.getMatrixAt(y,bn),this.getBoundingSphereAt(_,ms).applyMatrix4(bn),M=!m.intersectsSphere(ms)),!M){let E=f[_];u[p]=E.start*o*l,h[p]=E.count*l,x[p]=y,p++}}g.needsUpdate=!0,this._multiDrawCount=p,this._multiDrawBytesPerElement=o,this._visibilityChanged=!1}onBeforeShadow(e,t,n,s,r,a){this.onBeforeRender(e,null,s,r,a)}},Er=class extends dn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ic=new U,sc=new U,zd=new Me,ha=new Es,ko=new qt,Nu=new U,Gd=new U,Rs=class extends Mt{constructor(e=new St,t=new Er){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)ic.fromBufferAttribute(t,s-1),sc.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=ic.distanceTo(sc);e.setAttribute("lineDistance",new mt(n,1))}else Oe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ko.copy(n.boundingSphere),ko.applyMatrix4(s),ko.radius+=r,e.ray.intersectsSphere(ko)===!1)return;zd.copy(s).invert(),ha.copy(e.ray).applyMatrix4(zd);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,f=n.attributes.position;if(u!==null){let d=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let x=d,m=g-1;x<m;x+=c){let p=u.getX(x),y=u.getX(x+1),v=Bo(this,e,ha,l,p,y,x);v&&t.push(v)}if(this.isLineLoop){let x=u.getX(g-1),m=u.getX(d),p=Bo(this,e,ha,l,x,m,g-1);p&&t.push(p)}}else{let d=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let x=d,m=g-1;x<m;x+=c){let p=Bo(this,e,ha,l,x,x+1,x);p&&t.push(p)}if(this.isLineLoop){let x=Bo(this,e,ha,l,g-1,d,g-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Bo(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(ic.fromBufferAttribute(o,s),sc.fromBufferAttribute(o,r),t.distanceSqToSegment(ic,sc,Nu,Gd)>n)return;Nu.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Nu);if(!(c<e.near||c>e.far))return{distance:c,point:Gd.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Hd=new U,Vd=new U,Ma=class extends Rs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Hd.fromBufferAttribute(t,s),Vd.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Hd.distanceTo(Vd);e.setAttribute("lineDistance",new mt(n,1))}else Oe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Sa=class extends Rs{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Tr=class extends dn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ue(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Wd=new Me,zu=new Es,zo=new qt,Go=new U,wa=class extends Mt{constructor(e=new St,t=new Tr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),zo.copy(n.boundingSphere),zo.applyMatrix4(s),zo.radius+=r,e.ray.intersectsSphere(zo)===!1)return;Wd.copy(s).invert(),zu.copy(e.ray).applyMatrix4(Wd);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,h=n.attributes.position;if(c!==null){let f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=f,x=d;g<x;g++){let m=c.getX(g);Go.fromBufferAttribute(h,m),qd(Go,m,l,s,e,t,this)}}else{let f=Math.max(0,a.start),d=Math.min(h.count,a.start+a.count);for(let g=f,x=d;g<x;g++)Go.fromBufferAttribute(h,g),qd(Go,g,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function qd(i,e,t,n,s,r,a){let o=zu.distanceSqToPoint(i);if(o<t){let l=new U;zu.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Ea=class extends Xt{constructor(e=[],t=ns,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var $i=class extends Xt{constructor(e,t,n=Un,s,r,a,o=Ct,l=Ct,c,u=oi,h=1){if(u!==oi&&u!==is)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:h};super(f,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new yr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},rc=class extends $i{constructor(e,t=Un,n=ns,s,r,a=Ct,o=Ct,l,c=oi){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ta=class extends Xt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},kt=class i extends St{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],h=[],f=0,d=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new mt(c,3)),this.setAttribute("normal",new mt(u,3)),this.setAttribute("uv",new mt(h,2));function g(x,m,p,y,v,_,M,E,w,b,T){let R=_/w,P=M/b,D=_/2,I=M/2,C=E/2,N=w+1,z=b+1,F=0,W=0,V=new U;for(let Y=0;Y<z;Y++){let Q=Y*P-I;for(let he=0;he<N;he++){let fe=he*R-D;V[x]=fe*y,V[m]=Q*v,V[p]=C,c.push(V.x,V.y,V.z),V[x]=0,V[m]=0,V[p]=E>0?1:-1,u.push(V.x,V.y,V.z),h.push(he/w),h.push(1-Y/b),F+=1}}for(let Y=0;Y<b;Y++)for(let Q=0;Q<w;Q++){let he=f+Q+N*Y,fe=f+Q+N*(Y+1),Ge=f+(Q+1)+N*(Y+1),Te=f+(Q+1)+N*Y;l.push(he,fe,Te),l.push(fe,Ge,Te),W+=6}o.addGroup(d,W,T),d+=W,f+=F}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var mn=class i extends St{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],d=[],g=0,x=[],m=n/2,p=0;y(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(u),this.setAttribute("position",new mt(h,3)),this.setAttribute("normal",new mt(f,3)),this.setAttribute("uv",new mt(d,2));function y(){let _=new U,M=new U,E=0,w=(t-e)/n;for(let b=0;b<=r;b++){let T=[],R=b/r,P=R*(t-e)+e;for(let D=0;D<=s;D++){let I=D/s,C=I*l+o,N=Math.sin(C),z=Math.cos(C);M.x=P*N,M.y=-R*n+m,M.z=P*z,h.push(M.x,M.y,M.z),_.set(N,w,z).normalize(),f.push(_.x,_.y,_.z),d.push(I,1-R),T.push(g++)}x.push(T)}for(let b=0;b<s;b++)for(let T=0;T<r;T++){let R=x[T][b],P=x[T+1][b],D=x[T+1][b+1],I=x[T][b+1];(e>0||T!==0)&&(u.push(R,P,I),E+=3),(t>0||T!==r-1)&&(u.push(P,D,I),E+=3)}c.addGroup(p,E,0),p+=E}function v(_){let M=g,E=new Ke,w=new U,b=0,T=_===!0?e:t,R=_===!0?1:-1;for(let D=1;D<=s;D++)h.push(0,m*R,0),f.push(0,R,0),d.push(.5,.5),g++;let P=g;for(let D=0;D<=s;D++){let C=D/s*l+o,N=Math.cos(C),z=Math.sin(C);w.x=T*z,w.y=m*R,w.z=T*N,h.push(w.x,w.y,w.z),f.push(0,R,0),E.x=N*.5+.5,E.y=z*.5*R+.5,d.push(E.x,E.y),g++}for(let D=0;D<s;D++){let I=M+D,C=P+D;_===!0?u.push(C,C+1,I):u.push(C+1,C,I),b+=3}c.addGroup(p,b,_===!0?1:2),p+=b}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Qi=class i extends mn{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Aa=class i extends St{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),c(n),u(),this.setAttribute("position",new mt(r,3)),this.setAttribute("normal",new mt(r.slice(),3)),this.setAttribute("uv",new mt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(y){let v=new U,_=new U,M=new U;for(let E=0;E<t.length;E+=3)d(t[E+0],v),d(t[E+1],_),d(t[E+2],M),l(v,_,M,y)}function l(y,v,_,M){let E=M+1,w=[];for(let b=0;b<=E;b++){w[b]=[];let T=y.clone().lerp(_,b/E),R=v.clone().lerp(_,b/E),P=E-b;for(let D=0;D<=P;D++)D===0&&b===E?w[b][D]=T:w[b][D]=T.clone().lerp(R,D/P)}for(let b=0;b<E;b++)for(let T=0;T<2*(E-b)-1;T++){let R=Math.floor(T/2);T%2===0?(f(w[b][R+1]),f(w[b+1][R]),f(w[b][R])):(f(w[b][R+1]),f(w[b+1][R+1]),f(w[b+1][R]))}}function c(y){let v=new U;for(let _=0;_<r.length;_+=3)v.x=r[_+0],v.y=r[_+1],v.z=r[_+2],v.normalize().multiplyScalar(y),r[_+0]=v.x,r[_+1]=v.y,r[_+2]=v.z}function u(){let y=new U;for(let v=0;v<r.length;v+=3){y.x=r[v+0],y.y=r[v+1],y.z=r[v+2];let _=m(y)/2/Math.PI+.5,M=p(y)/Math.PI+.5;a.push(_,1-M)}g(),h()}function h(){for(let y=0;y<a.length;y+=6){let v=a[y+0],_=a[y+2],M=a[y+4],E=Math.max(v,_,M),w=Math.min(v,_,M);E>.9&&w<.1&&(v<.2&&(a[y+0]+=1),_<.2&&(a[y+2]+=1),M<.2&&(a[y+4]+=1))}}function f(y){r.push(y.x,y.y,y.z)}function d(y,v){let _=y*3;v.x=e[_+0],v.y=e[_+1],v.z=e[_+2]}function g(){let y=new U,v=new U,_=new U,M=new U,E=new Ke,w=new Ke,b=new Ke;for(let T=0,R=0;T<r.length;T+=9,R+=6){y.set(r[T+0],r[T+1],r[T+2]),v.set(r[T+3],r[T+4],r[T+5]),_.set(r[T+6],r[T+7],r[T+8]),E.set(a[R+0],a[R+1]),w.set(a[R+2],a[R+3]),b.set(a[R+4],a[R+5]),M.copy(y).add(v).add(_).divideScalar(3);let P=m(M);x(E,R+0,y,P),x(w,R+2,v,P),x(b,R+4,_,P)}}function x(y,v,_,M){M<0&&y.x===1&&(a[v]=y.x-1),_.x===0&&_.z===0&&(a[v]=M/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}},Ra=class i extends Aa{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var es=class i extends Aa{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var Cs=class i extends St{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,h=e/o,f=t/l,d=[],g=[],x=[],m=[];for(let p=0;p<u;p++){let y=p*f-a;for(let v=0;v<c;v++){let _=v*h-r;g.push(_,-y,0),x.push(0,0,1),m.push(v/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let y=0;y<o;y++){let v=y+c*p,_=y+c*(p+1),M=y+1+c*(p+1),E=y+1+c*p;d.push(v,_,E),d.push(_,M,E)}this.setIndex(d),this.setAttribute("position",new mt(g,3)),this.setAttribute("normal",new mt(x,3)),this.setAttribute("uv",new mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Ps=class i extends St{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],h=new U,f=new U,d=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){let y=[],v=p/n,_=a+v*o,M=e*Math.cos(_),E=Math.sqrt(e*e-M*M),w=0;p===0&&a===0?w=.5/t:p===n&&l===Math.PI&&(w=-.5/t);for(let b=0;b<=t;b++){let T=b/t,R=s+T*r;h.x=-E*Math.cos(R),h.y=M,h.z=E*Math.sin(R),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),m.push(T+w,1-v),y.push(c++)}u.push(y)}for(let p=0;p<n;p++)for(let y=0;y<t;y++){let v=u[p][y+1],_=u[p][y],M=u[p+1][y],E=u[p+1][y+1];(p!==0||a>0)&&d.push(v,_,E),(p!==n-1||l<Math.PI)&&d.push(_,M,E)}this.setIndex(d),this.setAttribute("position",new mt(g,3)),this.setAttribute("normal",new mt(x,3)),this.setAttribute("uv",new mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Bs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Xd(s))s.isRenderTargetTexture?(Oe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Xd(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function an(i){let e={};for(let t=0;t<i.length;t++){let n=Bs(i[t]);for(let s in n)e[s]=n[s]}return e}function Xd(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function lx(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function yh(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}var Gp={clone:Bs,merge:an},ux=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,hx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,En=class extends dn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ux,this.fragmentShader=hx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Bs(e.uniforms),this.uniformsGroups=lx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new ue().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ke().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new ft().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Xe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Me().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ac=class extends En{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Is=class extends dn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ka,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Fn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},_n=class extends Is{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ke(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return nt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ue(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ue(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ue(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var rn=class extends dn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ka,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Fn,this.combine=_c,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},oc=class extends dn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Tp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},cc=class extends dn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function jn(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function pa(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function Hp(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Gu(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function Vp(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}function fx(i,e,t,n,s=30){let r=i.clone();r.name=e;let a=[];for(let l=0;l<r.tracks.length;++l){let c=r.tracks[l],u=c.getValueSize(),h=[],f=[];for(let d=0;d<c.times.length;++d){let g=c.times[d]*s;if(!(g<t||g>=n)){h.push(c.times[d]);for(let x=0;x<u;++x)f.push(c.values[d*u+x])}}h.length!==0&&(c.times=jn(h,c.times.constructor),c.values=jn(f,c.values.constructor),a.push(c))}r.tracks=a;let o=1/0;for(let l=0;l<r.tracks.length;++l)o>r.tracks[l].times[0]&&(o=r.tracks[l].times[0]);for(let l=0;l<r.tracks.length;++l)r.tracks[l].shift(-1*o);return r.resetDuration(),r}function dx(i,e=0,t=i,n=30){n<=0&&(n=30);let s=t.tracks.length,r=e/n;for(let a=0;a<s;++a){let o=t.tracks[a],l=o.ValueTypeName;if(l==="bool"||l==="string")continue;let c=i.tracks.find(function(p){return p.name===o.name&&p.ValueTypeName===l});if(c===void 0)continue;let u=0,h=o.getValueSize();o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(u=h/3);let f=0,d=c.getValueSize();c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(f=d/3);let g=o.times.length-1,x;if(r<=o.times[0]){let p=u,y=h-u;x=o.values.slice(p,y)}else if(r>=o.times[g]){let p=g*h+u,y=p+h-u;x=o.values.slice(p,y)}else{let p=o.createInterpolant(),y=u,v=h-u;p.evaluate(r),x=p.resultBuffer.slice(y,v)}l==="quaternion"&&new Ut().fromArray(x).normalize().conjugate().toArray(x);let m=c.times.length;for(let p=0;p<m;++p){let y=p*d+f;if(l==="quaternion")Ut.multiplyQuaternionsFlat(c.values,y,x,0,c.values,y);else{let v=d-f*2;for(let _=0;_<v;++_)c.values[y+_]-=x[_]}}}return i.blendMode=ph,i}var Ca=class{static convertArray(e,t){return jn(e,t)}static isTypedArray(e){return Fp(e)}static hasTangents(e){return pa(e)}static getKeyframeOrder(e){return Hp(e)}static sortedArray(e,t,n){return Gu(e,t,n)}static flattenJSON(e,t,n,s){Vp(e,t,n,s)}static subclip(e,t,n,s,r=30){return fx(e,t,n,s,r)}static makeClipAdditive(e,t=0,n=e,s=30){return dx(e,t,n,s)}},ci=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break t}a=t.length;break n}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},lc=class extends ci{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:bs,endingEnd:bs}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case xs:r=e,o=2*t-n;break;case ma:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case xs:a=e,l=2*n-t;break;case ma:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(n-t)/(s-t),x=g*g,m=x*g,p=-f*m+2*f*x-f*g,y=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*g+1,v=(-1-d)*m+(1.5+d)*x+.5*g,_=d*m-d*x;for(let M=0;M!==o;++M)r[M]=p*a[u+M]+y*a[c+M]+v*a[l+M]+_*a[h+M];return r}},Pa=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),h=1-u;for(let f=0;f!==o;++f)r[f]=a[c+f]*h+a[l+f]*u;return r}},uc=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},hc=class extends ci{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,h=this.outTangents;if(!u||!h){let g=(n-t)/(s-t),x=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*x+a[l+m]*g;return r}let f=o*2,d=e-1;for(let g=0;g!==o;++g){let x=a[c+g],m=a[l+g],p=d*f+g*2,y=h[p],v=h[p+1],_=e*f+g*2,M=u[_],E=u[_+1],w=mx(n,t,y,M,s);r[g]=Wp(w,x,v,E,m)}return r}};function Wp(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function px(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function mx(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=Wp(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=px(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var yn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=jn(t,this.TimeBufferType),this.values=jn(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:jn(e.times,Array),values:jn(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),pa(e.settings)&&(n.settings={inTangents:jn(e.settings.inTangents,Array),outTangents:jn(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new uc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Pa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new lc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new hc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case ys:t=this.InterpolantFactoryMethodDiscrete;break;case vs:t=this.InterpolantFactoryMethodLinear;break;case Wo:t=this.InterpolantFactoryMethodSmooth;break;case ku:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Oe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ys;case this.InterpolantFactoryMethodLinear:return vs;case this.InterpolantFactoryMethodSmooth:return Wo;case this.InterpolantFactoryMethodBezier:return ku}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;pa(this.settings)&&(jd(this.settings.inTangents,e),jd(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(qe("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(qe("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){qe("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){qe("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Fp(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){qe("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Wo,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let h=o*n,f=h-n,d=h+n;for(let g=0;g!==n;++g){let x=t[h+g];if(x!==t[f+g]||x!==t[d+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let h=o*n,f=a*n;for(let d=0;d!==n;++d)t[f+d]=t[h+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,pa(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function jd(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}yn.prototype.ValueTypeName="";yn.prototype.TimeBufferType=Float32Array;yn.prototype.ValueBufferType=Float32Array;yn.prototype.DefaultInterpolation=vs;var Li=class extends yn{constructor(e,t,n){super(e,t,n)}};Li.prototype.ValueTypeName="bool";Li.prototype.ValueBufferType=Array;Li.prototype.DefaultInterpolation=ys;Li.prototype.InterpolantFactoryMethodLinear=void 0;Li.prototype.InterpolantFactoryMethodSmooth=void 0;var Ia=class extends yn{constructor(e,t,n,s){super(e,t,n,s)}};Ia.prototype.ValueTypeName="color";var Di=class extends yn{constructor(e,t,n,s){super(e,t,n,s)}};Di.prototype.ValueTypeName="number";var fc=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)Ut.slerpFlat(r,0,a,c-o,a,c,l);return r}},Ni=class extends yn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new fc(this.times,this.values,this.getValueSize(),e)}};Ni.prototype.ValueTypeName="quaternion";Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var Fi=class extends yn{constructor(e,t,n){super(e,t,n)}};Fi.prototype.ValueTypeName="string";Fi.prototype.ValueBufferType=Array;Fi.prototype.DefaultInterpolation=ys;Fi.prototype.InterpolantFactoryMethodLinear=void 0;Fi.prototype.InterpolantFactoryMethodSmooth=void 0;var ts=class extends yn{constructor(e,t,n,s){super(e,t,n,s)}};ts.prototype.ValueTypeName="vector";var Ls=class{constructor(e="",t=-1,n=[],s=rl){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Yn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(bx(n[a]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(yn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let u=Hp(l);l=Gu(l,1,u),c=Gu(c,1,u),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new Di(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],u=c.name.match(r);if(u&&u.length>1){let h=u[1],f=s[h];f||(s[h]=f=[]),f.push(c)}}let a=[];for(let o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function gx(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Di;case"vector":case"vector2":case"vector3":case"vector4":return ts;case"color":return Ia;case"quaternion":return Ni;case"bool":case"boolean":return Li;case"string":return Fi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function bx(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=gx(i.type);if(i.times===void 0){let n=[],s=[];Vp(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),pa(i.settings)&&(t.settings={inTangents:jn(i.settings.inTangents,Float32Array),outTangents:jn(i.settings.outTangents,Float32Array)}),t}var ai={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Kd(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Kd(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Kd(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var dc=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let d=c[h],g=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},qp=new dc,li=class{constructor(e){this.manager=e!==void 0?e:qp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};li.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ri={},Hu=class extends Error{constructor(e,t){super(e),this.response=t}},Ar=class extends li{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ai.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Ri[e]!==void 0){Ri[e].push({onLoad:t,onProgress:n,onError:s});return}Ri[e]=[],Ri[e].push({onLoad:t,onProgress:n,onError:s});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&Oe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=Ri[e],h=c.body.getReader(),f=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),d=f?parseInt(f):0,g=d!==0,x=0,m=new ReadableStream({start(p){y();function y(){h.read().then(({done:v,value:_})=>{if(v)p.close();else{x+=_.byteLength;let M=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:d});for(let E=0,w=u.length;E<w;E++){let b=u[E];b.onProgress&&b.onProgress(M)}p.enqueue(_),y()}},v=>{p.error(v)})}}});return new Response(m)}else throw new Hu(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return c.json();default:if(o==="")return c.text();{let h=/charset="?([^;"\s]*)"?/i.exec(o),f=h&&h[1]?h[1].toLowerCase():void 0,d=new TextDecoder(f);return c.arrayBuffer().then(g=>d.decode(g))}}}).then(c=>{ai.add(`file:${e}`,c);let u=Ri[e];delete Ri[e];for(let h=0,f=u.length;h<f;h++){let d=u[h];d.onLoad&&d.onLoad(c)}}).catch(c=>{let u=Ri[e];if(u===void 0)throw this.manager.itemError(e),c;delete Ri[e];for(let h=0,f=u.length;h<f;h++){let d=u[h];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var hr=new WeakMap,pc=class extends li{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ai.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let h=hr.get(a);h===void 0&&(h=[],hr.set(a,h)),h.push({onLoad:t,onError:s})}return a}let o=xr("img");function l(){u(),t&&t(this);let h=hr.get(this)||[];for(let f=0;f<h.length;f++){let d=h[f];d.onLoad&&d.onLoad(this)}hr.delete(this),r.manager.itemEnd(e)}function c(h){u(),s&&s(h),ai.remove(`image:${e}`);let f=hr.get(this)||[];for(let d=0;d<f.length;d++){let g=f[d];g.onError&&g.onError(h)}hr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),ai.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var La=class extends li{constructor(e){super(e)}load(e,t,n,s){let r=new Xt,a=new pc(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Ds=class extends Mt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ue(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Da=class extends Ds{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Fu=new Me,Yd=new U,Jd=new U,Rr=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ke(512,512),this.mapType=vn,this.map=null,this.mapPass=null,this.matrix=new Me,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ii,this._frameExtents=new Ke(1,1),this._viewportCount=1,this._viewports=[new ft(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Yd.setFromMatrixPosition(e.matrixWorld),t.position.copy(Yd),Jd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Jd),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Fu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Fu,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===br||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Fu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ho=new U,Vo=new Ut,ri=new U,Na=class extends Mt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Me,this.projectionMatrix=new Me,this.projectionMatrixInverse=new Me,this.coordinateSystem=Nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ho,Vo,ri),ri.x===1&&ri.y===1&&ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ho,Vo,ri.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ho,Vo,ri),ri.x===1&&ri.y===1&&ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ho,Vo,ri.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Yi=new U,Zd=new Ke,$d=new Ke,Wt=class extends Na{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ms*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(fa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ms*2*Math.atan(Math.tan(fa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z),Yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z)}getViewSize(e,t){return this.getViewBounds(e,Zd,$d),t.subVectors($d,Zd)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(fa*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Vu=class extends Rr{constructor(){super(new Wt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Ms*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},Fa=class extends Ds{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.target=new Mt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Vu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Wu=class extends Rr{constructor(){super(new Wt(90,1,.5,500)),this.isPointLightShadow=!0}},Oa=class extends Ds{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Wu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},ui=class extends Na{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},qu=class extends Rr{constructor(){super(new ui(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ns=class extends Ds{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.target=new Mt,this.shadow=new qu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Oi=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Ou=new WeakMap,Ua=class extends li{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Oe("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Oe("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ai.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{Ou.has(a)===!0?(s&&s(Ou.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ai.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),Ou.set(l,c),ai.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ai.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var fr=-90,dr=1,mc=class extends Mt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Wt(fr,dr,e,t);s.layers=this.layers,this.add(s);let r=new Wt(fr,dr,e,t);r.layers=this.layers,this.add(r);let a=new Wt(fr,dr,e,t);a.layers=this.layers,this.add(a);let o=new Wt(fr,dr,e,t);o.layers=this.layers,this.add(o);let l=new Wt(fr,dr,e,t);l.layers=this.layers,this.add(l);let c=new Wt(fr,dr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===Nn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===br)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},gc=class extends Wt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var bc=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let s,r,a;switch(t){case"quaternion":s=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:s=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,s=this.valueSize,r=e*s+s,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==s;++o)n[r+o]=n[o];a=t}else{a+=t;let o=t/a;this._mixBufferRegion(n,r,0,o,s)}this.cumulativeWeight=a}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,s=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,s,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,s=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,s,l,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,s,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,s);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,s=n*this._origIndex;e.getValue(t,s);for(let r=n,a=s;r!==a;++r)t[r]=t[s+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,s,r){if(s>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,s){Ut.slerpFlat(e,t,e,t,e,n,s)}_slerpAdditive(e,t,n,s,r){let a=this._workIndex*r;Ut.multiplyQuaternionsFlat(e,a,e,t,e,n),Ut.slerpFlat(e,t,e,t,e,a,s)}_lerp(e,t,n,s,r){let a=1-s;for(let o=0;o!==r;++o){let l=t+o;e[l]=e[l]*a+e[n+o]*s}}_lerpAdditive(e,t,n,s,r){for(let a=0;a!==r;++a){let o=t+a;e[o]=e[o]+e[n+a]*s}}},vh="\\[\\]\\.:\\/",xx=new RegExp("["+vh+"]","g"),Mh="[^"+vh+"]",_x="[^"+vh.replace("\\.","")+"]",yx=/((?:WC+[\/:])*)/.source.replace("WC",Mh),vx=/(WCOD+)?/.source.replace("WCOD",_x),Mx=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Mh),Sx=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Mh),wx=new RegExp("^"+yx+vx+Mx+Sx+"$"),Ex=["material","materials","bones","map"],Xu=class{constructor(e,t,n){let s=n||pt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},pt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(xx,"")}static parseTrackName(e){let t=wx.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Ex.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Oe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){qe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){qe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){qe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){qe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){qe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){qe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){qe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;qe("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){qe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){qe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};pt.Composite=Xu;pt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};pt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};pt.prototype.GetterByBindingType=[pt.prototype._getValue_direct,pt.prototype._getValue_array,pt.prototype._getValue_arrayElement,pt.prototype._getValue_toArray];pt.prototype.SetterByBindingTypeAndVersioning=[[pt.prototype._setValue_direct,pt.prototype._setValue_direct_setNeedsUpdate,pt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_array,pt.prototype._setValue_array_setNeedsUpdate,pt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_arrayElement,pt.prototype._setValue_arrayElement_setNeedsUpdate,pt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_fromArray,pt.prototype._setValue_fromArray_setNeedsUpdate,pt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var xc=class{constructor(e,t,n=null,s=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=s;let r=t.tracks,a=r.length,o=new Array(a),l={endingStart:bs,endingEnd:bs};for(let c=0;c!==a;++c){let u=r[c].createInterpolant(null);o[c]=u,u.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=wp,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let s=this._clip.duration,r=e._clip.duration,a=r/s,o=s/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let s=this._mixer,r=s.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=s._lendControlInterpolant(),this._timeScaleInterpolant=o);let l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,s){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let a=this._updateTime(t),o=this._updateWeight(e);if(o>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case ph:for(let u=0,h=l.length;u!==h;++u)l[u].evaluate(a),c[u].accumulateAdditive(o);break;case rl:default:for(let u=0,h=l.length;u!==h;++u)l[u].evaluate(a),c[u].accumulate(s,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,s=this.time+e,r=this._loopCount,a=n===Ep;if(e===0)return r===-1?s:a&&(r&1)===1?t-s:s;if(n===Sp){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(s>=t)s=t;else if(s<0)s=0;else{this.time=s;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),s>=t||s<0){let o=Math.floor(s/t);s-=t*o,r+=Math.abs(o);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=e>0?t:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this._loopCount=r,this.time=s;if(a&&(r&1)===1)return t-s}return s}_setEndings(e,t,n){let s=this._interpolantSettings;n?(s.endingStart=xs,s.endingEnd=xs):(e?s.endingStart=this.zeroSlopeAtStart?xs:bs:s.endingStart=ma,t?s.endingEnd=this.zeroSlopeAtEnd?xs:bs:s.endingEnd=ma)}_scheduleFading(e,t,n){let s=this._mixer,r=s.time,a=this._weightInterpolant;a===null&&(a=s._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=t,o[1]=r+e,l[1]=n,this}},Tx=new Float32Array(1),ka=class extends Jn{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,s=e._clip.tracks,r=s.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,u=c[l];u===void 0&&(u={},c[l]=u);for(let h=0;h!==r;++h){let f=s[h],d=f.name,g=u[d];if(g!==void 0)++g.referenceCount,a[h]=g;else{if(g=a[h],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,d));continue}let x=t&&t._propertyBindings[h].binding.parsedPath;g=new bc(pt.create(n,d,x),f.ValueTypeName,f.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,d),a[h]=g}o[h].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,s=e._clip.uuid,r=this._actionsByClip[s];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,s,n)}let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let s=this._actions,r=this._actionsByClip,a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{let o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=s.length,s.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],s=e._cacheIndex;n._cacheIndex=s,t[s]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],u=e._byClipCacheIndex;c._byClipCacheIndex=u,l[u]=c,l.pop(),e._byClipCacheIndex=null;let h=o.actionByRoot,f=(e._localRoot||this._root).uuid;delete h[f],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,s=this._nActiveActions++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,s=--this._nActiveActions,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let s=this._bindingsByRootAndName,r=this._bindings,a=s[t];a===void 0&&(a={},s[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,s=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[s],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[s]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,s=this._nActiveBindings++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,s=--this._nActiveBindings,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new Pa(new Float32Array(2),new Float32Array(2),1,Tx),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,s=--this._nActiveControlInterpolants,r=t[s];e.__cacheIndex=s,t[s]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let s=t||this._root,r=s.uuid,a=typeof e=="string"?Ls.findByName(s,e):e,o=a!==null?a.uuid:e,l=this._actionsByClip[o],c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=rl),l!==void 0){let h=l.actionByRoot[r];if(h!==void 0&&h.blendMode===n)return h;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;let u=new xc(this,a,t,n);return this._bindAction(u,c),this._addInactiveAction(u,o,r),u}existingAction(e,t){let n=t||this._root,s=n.uuid,r=typeof e=="string"?Ls.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[s]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,s=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(s,e,r,a);let o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,s=this._actionsByClip,r=s[n];if(r!==void 0){let a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){let c=a[o];this._deactivateAction(c);let u=c._cacheIndex,h=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(c)}delete s[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let a in n){let o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let s=this._bindingsByRootAndName,r=s[t];if(r!==void 0)for(let a in r){let o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var ju=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};function Sh(i,e,t,n){let s=Ax(n);switch(t){case fh:return i*e;case Tc:return i*e/s.components*s.byteLength;case za:return i*e/s.components*s.byteLength;case ss:return i*e*2/s.components*s.byteLength;case Ac:return i*e*2/s.components*s.byteLength;case dh:return i*e*3/s.components*s.byteLength;case hn:return i*e*4/s.components*s.byteLength;case Rc:return i*e*4/s.components*s.byteLength;case Ga:case Ha:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Va:case Wa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Pc:case Lc:return Math.max(i,16)*Math.max(e,8)/4;case Cc:case Ic:return Math.max(i,8)*Math.max(e,8)/2;case Dc:case Nc:case Oc:case Uc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Fc:case qa:case kc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Bc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case zc:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Gc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Hc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Vc:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Wc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case qc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Xc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case jc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Kc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Yc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Jc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Zc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case $c:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Qc:case el:case tl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case nl:case il:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Xa:case sl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Ax(i){switch(i){case vn:case ch:return{byteLength:1,components:1};case Lr:case lh:case Qn:return{byteLength:2,components:1};case wc:case Ec:return{byteLength:2,components:4};case Un:case Sc:case un:return{byteLength:4,components:1};case uh:case hh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Oe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function dm(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Cx(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,h=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,u),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){let u=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,u);else{h.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<h.length;d++){let g=h[f],x=h[d];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++f,h[f]=x)}h.length=f+1;for(let d=0,g=h.length;d<g;d++){let x=h[d];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Px=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ix=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Lx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Dx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Nx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Fx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ox=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ux=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,kx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Bx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,zx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Hx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Vx=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Wx=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,qx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Xx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,jx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Kx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Yx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Jx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Zx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,$x=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Qx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,e_=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,t_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,n_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,i_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,s_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,r_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,a_="gl_FragColor = linearToOutputTexel( gl_FragColor );",o_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,c_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,l_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,u_=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,h_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,f_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,d_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,p_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,m_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,g_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,b_=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,x_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,__=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,y_=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,v_=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,M_=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,S_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,w_=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,E_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,T_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,A_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,R_=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,C_=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,P_=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,I_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,L_=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,D_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,N_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,F_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,O_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,U_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,k_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,B_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,z_=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,G_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,H_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,V_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,W_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,q_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,X_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,j_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,K_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Y_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,J_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Z_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Q_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,ey=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ty=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ny=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iy=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,sy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ry=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,ay=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,oy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,cy=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ly=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,uy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,fy=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,dy=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,py=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,my=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,gy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,by=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,xy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,_y=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,yy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,vy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,My=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sy=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,wy=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ey=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ty=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ay=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ry=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Cy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Py=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Iy=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ly=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Dy=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ny=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Fy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Oy=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Uy=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,ky=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,By=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,zy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Gy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hy=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vy=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Wy=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,qy=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xy=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jy=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ky=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Yy=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jy=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Zy=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,$y=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qy=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ev=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,tv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,iv=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sv=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,rv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,av=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ov=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,$e={alphahash_fragment:Px,alphahash_pars_fragment:Ix,alphamap_fragment:Lx,alphamap_pars_fragment:Dx,alphatest_fragment:Nx,alphatest_pars_fragment:Fx,aomap_fragment:Ox,aomap_pars_fragment:Ux,batching_pars_vertex:kx,batching_vertex:Bx,begin_vertex:zx,beginnormal_vertex:Gx,bsdfs:Hx,iridescence_fragment:Vx,bumpmap_pars_fragment:Wx,clipping_planes_fragment:qx,clipping_planes_pars_fragment:Xx,clipping_planes_pars_vertex:jx,clipping_planes_vertex:Kx,color_fragment:Yx,color_pars_fragment:Jx,color_pars_vertex:Zx,color_vertex:$x,common:Qx,cube_uv_reflection_fragment:e_,defaultnormal_vertex:t_,displacementmap_pars_vertex:n_,displacementmap_vertex:i_,emissivemap_fragment:s_,emissivemap_pars_fragment:r_,colorspace_fragment:a_,colorspace_pars_fragment:o_,envmap_fragment:c_,envmap_common_pars_fragment:l_,envmap_pars_fragment:u_,envmap_pars_vertex:h_,envmap_physical_pars_fragment:M_,envmap_vertex:f_,fog_vertex:d_,fog_pars_vertex:p_,fog_fragment:m_,fog_pars_fragment:g_,gradientmap_pars_fragment:b_,lightmap_pars_fragment:x_,lights_lambert_fragment:__,lights_lambert_pars_fragment:y_,lights_pars_begin:v_,lights_toon_fragment:S_,lights_toon_pars_fragment:w_,lights_phong_fragment:E_,lights_phong_pars_fragment:T_,lights_physical_fragment:A_,lights_physical_pars_fragment:R_,lights_fragment_begin:C_,lights_fragment_maps:P_,lights_fragment_end:I_,lightprobes_pars_fragment:L_,logdepthbuf_fragment:D_,logdepthbuf_pars_fragment:N_,logdepthbuf_pars_vertex:F_,logdepthbuf_vertex:O_,map_fragment:U_,map_pars_fragment:k_,map_particle_fragment:B_,map_particle_pars_fragment:z_,metalnessmap_fragment:G_,metalnessmap_pars_fragment:H_,morphinstance_vertex:V_,morphcolor_vertex:W_,morphnormal_vertex:q_,morphtarget_pars_vertex:X_,morphtarget_vertex:j_,normal_fragment_begin:K_,normal_fragment_maps:Y_,normal_pars_fragment:J_,normal_pars_vertex:Z_,normal_vertex:$_,normalmap_pars_fragment:Q_,clearcoat_normal_fragment_begin:ey,clearcoat_normal_fragment_maps:ty,clearcoat_pars_fragment:ny,iridescence_pars_fragment:iy,opaque_fragment:sy,packing:ry,premultiplied_alpha_fragment:ay,project_vertex:oy,dithering_fragment:cy,dithering_pars_fragment:ly,roughnessmap_fragment:uy,roughnessmap_pars_fragment:hy,shadowmap_pars_fragment:fy,shadowmap_pars_vertex:dy,shadowmap_vertex:py,shadowmask_pars_fragment:my,skinbase_vertex:gy,skinning_pars_vertex:by,skinning_vertex:xy,skinnormal_vertex:_y,specularmap_fragment:yy,specularmap_pars_fragment:vy,tonemapping_fragment:My,tonemapping_pars_fragment:Sy,transmission_fragment:wy,transmission_pars_fragment:Ey,uv_pars_fragment:Ty,uv_pars_vertex:Ay,uv_vertex:Ry,worldpos_vertex:Cy,background_vert:Py,background_frag:Iy,backgroundCube_vert:Ly,backgroundCube_frag:Dy,cube_vert:Ny,cube_frag:Fy,depth_vert:Oy,depth_frag:Uy,distance_vert:ky,distance_frag:By,equirect_vert:zy,equirect_frag:Gy,linedashed_vert:Hy,linedashed_frag:Vy,meshbasic_vert:Wy,meshbasic_frag:qy,meshlambert_vert:Xy,meshlambert_frag:jy,meshmatcap_vert:Ky,meshmatcap_frag:Yy,meshnormal_vert:Jy,meshnormal_frag:Zy,meshphong_vert:$y,meshphong_frag:Qy,meshphysical_vert:ev,meshphysical_frag:tv,meshtoon_vert:nv,meshtoon_frag:iv,points_vert:sv,points_frag:rv,shadow_vert:av,shadow_frag:ov,sprite_vert:cv,sprite_frag:lv},_e={common:{diffuse:{value:new ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new Ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new ue(16777215)},opacity:{value:1},center:{value:new Ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},pi={basic:{uniforms:an([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:an([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new ue(0)},envMapIntensity:{value:1}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:an([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new ue(0)},specular:{value:new ue(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:an([_e.common,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.roughnessmap,_e.metalnessmap,_e.fog,_e.lights,{emissive:{value:new ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:an([_e.common,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.gradientmap,_e.fog,_e.lights,{emissive:{value:new ue(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:an([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:an([_e.points,_e.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:an([_e.common,_e.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:an([_e.common,_e.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:an([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:an([_e.sprite,_e.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distance:{uniforms:an([_e.common,_e.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distance_vert,fragmentShader:$e.distance_frag},shadow:{uniforms:an([_e.lights,_e.fog,{color:{value:new ue(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};pi.physical={uniforms:an([pi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new Ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new Ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new ue(0)},specularColor:{value:new ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new Ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var cl={r:0,b:0,g:0},uv=new Me,pm=new Xe;pm.set(-1,0,0,0,1,0,0,0,1);function hv(i,e,t,n,s,r){let a=new ue(0),o=s===!0?0:1,l,c,u=null,h=0,f=null;function d(y){let v=y.isScene===!0?y.background:null;if(v&&v.isTexture){let _=y.backgroundBlurriness>0;v=e.get(v,_)}return v}function g(y){let v=!1,_=d(y);_===null?m(a,o):_&&_.isColor&&(m(_,1),v=!0);let M=i.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||v)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(y,v){let _=d(v);_&&(_.isCubeTexture||_.mapping===Ba)?(c===void 0&&(c=new It(new kt(1,1,1),new En({name:"BackgroundCubeMaterial",uniforms:Bs(pi.backgroundCube.uniforms),vertexShader:pi.backgroundCube.vertexShader,fragmentShader:pi.backgroundCube.fragmentShader,side:gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(M,E,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(uv.makeRotationFromEuler(v.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(pm),c.material.toneMapped=Ze.getTransfer(_.colorSpace)!==lt,(u!==_||h!==_.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,u=_,h=_.version,f=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new It(new Cs(2,2),new En({name:"BackgroundMaterial",uniforms:Bs(pi.background.uniforms),vertexShader:pi.background.vertexShader,fragmentShader:pi.background.fragmentShader,side:hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,l.material.toneMapped=Ze.getTransfer(_.colorSpace)!==lt,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||h!==_.version||f!==i.toneMapping)&&(l.material.needsUpdate=!0,u=_,h=_.version,f=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function m(y,v){y.getRGB(cl,yh(i)),t.buffers.color.setClear(cl.r,cl.g,cl.b,v,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,v=1){a.set(y),o=v,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(y){o=y,m(a,o)},render:g,addToRenderList:x,dispose:p}}function fv(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,a=!1;function o(P,D,I,C,N){let z=!1,F=h(P,C,I,D);r!==F&&(r=F,c(r.object)),z=d(P,C,I,N),z&&g(P,C,I,N),N!==null&&e.update(N,i.ELEMENT_ARRAY_BUFFER),(z||a)&&(a=!1,_(P,D,I,C),N!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(N).buffer))}function l(){return i.createVertexArray()}function c(P){return i.bindVertexArray(P)}function u(P){return i.deleteVertexArray(P)}function h(P,D,I,C){let N=C.wireframe===!0,z=n[D.id];z===void 0&&(z={},n[D.id]=z);let F=P.isInstancedMesh===!0?P.id:0,W=z[F];W===void 0&&(W={},z[F]=W);let V=W[I.id];V===void 0&&(V={},W[I.id]=V);let Y=V[N];return Y===void 0&&(Y=f(l()),V[N]=Y),Y}function f(P){let D=[],I=[],C=[];for(let N=0;N<t;N++)D[N]=0,I[N]=0,C[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:I,attributeDivisors:C,object:P,attributes:{},index:null}}function d(P,D,I,C){let N=r.attributes,z=D.attributes,F=0,W=I.getAttributes();for(let V in W)if(W[V].location>=0){let Q=N[V],he=z[V];if(he===void 0&&(V==="instanceMatrix"&&P.instanceMatrix&&(he=P.instanceMatrix),V==="instanceColor"&&P.instanceColor&&(he=P.instanceColor)),Q===void 0||Q.attribute!==he||he&&Q.data!==he.data)return!0;F++}return r.attributesNum!==F||r.index!==C}function g(P,D,I,C){let N={},z=D.attributes,F=0,W=I.getAttributes();for(let V in W)if(W[V].location>=0){let Q=z[V];Q===void 0&&(V==="instanceMatrix"&&P.instanceMatrix&&(Q=P.instanceMatrix),V==="instanceColor"&&P.instanceColor&&(Q=P.instanceColor));let he={};he.attribute=Q,Q&&Q.data&&(he.data=Q.data),N[V]=he,F++}r.attributes=N,r.attributesNum=F,r.index=C}function x(){let P=r.newAttributes;for(let D=0,I=P.length;D<I;D++)P[D]=0}function m(P){p(P,0)}function p(P,D){let I=r.newAttributes,C=r.enabledAttributes,N=r.attributeDivisors;I[P]=1,C[P]===0&&(i.enableVertexAttribArray(P),C[P]=1),N[P]!==D&&(i.vertexAttribDivisor(P,D),N[P]=D)}function y(){let P=r.newAttributes,D=r.enabledAttributes;for(let I=0,C=D.length;I<C;I++)D[I]!==P[I]&&(i.disableVertexAttribArray(I),D[I]=0)}function v(P,D,I,C,N,z,F){F===!0?i.vertexAttribIPointer(P,D,I,N,z):i.vertexAttribPointer(P,D,I,C,N,z)}function _(P,D,I,C){x();let N=C.attributes,z=I.getAttributes(),F=D.defaultAttributeValues;for(let W in z){let V=z[W];if(V.location>=0){let Y=N[W];if(Y===void 0&&(W==="instanceMatrix"&&P.instanceMatrix&&(Y=P.instanceMatrix),W==="instanceColor"&&P.instanceColor&&(Y=P.instanceColor)),Y!==void 0){let Q=Y.normalized,he=Y.itemSize,fe=e.get(Y);if(fe===void 0)continue;let Ge=fe.buffer,Te=fe.type,Fe=fe.bytesPerElement,k=Te===i.INT||Te===i.UNSIGNED_INT||Y.gpuType===Sc;if(Y.isInterleavedBufferAttribute){let $=Y.data,O=$.stride,ee=Y.offset;if($.isInstancedInterleavedBuffer){for(let te=0;te<V.locationSize;te++)p(V.location+te,$.meshPerAttribute);P.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let te=0;te<V.locationSize;te++)m(V.location+te);i.bindBuffer(i.ARRAY_BUFFER,Ge);for(let te=0;te<V.locationSize;te++)v(V.location+te,he/V.locationSize,Te,Q,O*Fe,(ee+he/V.locationSize*te)*Fe,k)}else{if(Y.isInstancedBufferAttribute){for(let $=0;$<V.locationSize;$++)p(V.location+$,Y.meshPerAttribute);P.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let $=0;$<V.locationSize;$++)m(V.location+$);i.bindBuffer(i.ARRAY_BUFFER,Ge);for(let $=0;$<V.locationSize;$++)v(V.location+$,he/V.locationSize,Te,Q,he*Fe,he/V.locationSize*$*Fe,k)}}else if(F!==void 0){let Q=F[W];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(V.location,Q);break;case 3:i.vertexAttrib3fv(V.location,Q);break;case 4:i.vertexAttrib4fv(V.location,Q);break;default:i.vertexAttrib1fv(V.location,Q)}}}}y()}function M(){T();for(let P in n){let D=n[P];for(let I in D){let C=D[I];for(let N in C){let z=C[N];for(let F in z)u(z[F].object),delete z[F];delete C[N]}}delete n[P]}}function E(P){if(n[P.id]===void 0)return;let D=n[P.id];for(let I in D){let C=D[I];for(let N in C){let z=C[N];for(let F in z)u(z[F].object),delete z[F];delete C[N]}}delete n[P.id]}function w(P){for(let D in n){let I=n[D];for(let C in I){let N=I[C];if(N[P.id]===void 0)continue;let z=N[P.id];for(let F in z)u(z[F].object),delete z[F];delete N[P.id]}}}function b(P){for(let D in n){let I=n[D],C=P.isInstancedMesh===!0?P.id:0,N=I[C];if(N!==void 0){for(let z in N){let F=N[z];for(let W in F)u(F[W].object),delete F[W];delete N[z]}delete I[C],Object.keys(I).length===0&&delete n[D]}}}function T(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:R,dispose:M,releaseStatesOfGeometry:E,releaseStatesOfObject:b,releaseStatesOfProgram:w,initAttributes:x,enableAttribute:m,disableUnusedAttributes:y}}function dv(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let f=0;for(let d=0;d<u;d++)f+=c[d];t.update(f,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function pv(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==hn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let b=w===Qn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==vn&&w!==un&&!b&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(Oe("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&Oe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),v=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:v,maxFragmentUniforms:_,maxSamples:M,samples:E}}function mv(i){let e=this,t=null,n=0,s=!1,r=!1,a=new Xn,o=new Xe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||n!==0||s;return s=f,n=h.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let g=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let y=r?0:n,v=y*4,_=p.clippingState||null;l.value=_,_=u(g,f,v,d);for(let M=0;M!==v;++M)_[M]=t[M];p.clippingState=_,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,f,d,g){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=l.value,g!==!0||m===null){let p=d+x*4,y=f.matrixWorldInverse;o.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let v=0,_=d;v!==x;++v,_+=4)a.copy(h[v]).applyMatrix4(y,o),a.normal.toArray(m,_),m[_+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}var Or=4,gv=6,bv=20,xv=256,Ya=new ui,Xp=new ue,wh=null,Eh=0,Th=0,Ah=!1,_v=new U,zs=new U,ul=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=_v}=r;wh=this._renderer.getRenderTarget(),Eh=this._renderer.getActiveCubeFace(),Th=this._renderer.getActiveMipmapLevel(),Ah=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Yp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Kp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(wh,Eh,Th),this._renderer.xr.enabled=Ah,e.scissorTest=!1,Fr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ns||e.mapping===Us?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),wh=this._renderer.getRenderTarget(),Eh=this._renderer.getActiveCubeFace(),Th=this._renderer.getActiveMipmapLevel(),Ah=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Pt,minFilter:Pt,generateMipmaps:!1,type:Qn,format:hn,colorSpace:fn,depthBuffer:!1},s=jp(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=jp(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=yv(r)),this._blurMaterial=Mv(r,e,t),this._ggxMaterial=vv(r,e,t)}return s}_compileMaterial(e){let t=new It(new St,e);this._renderer.compile(t,Ya)}_sceneToCubeUV(e,t,n,s,r){let l=new Wt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,d=h.toneMapping;h.getClearColor(Xp),h.toneMapping=Tn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new It(new kt,new Zn({name:"PMREM.Background",side:gn,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,p=!1,y=e.background;y?y.isColor&&(m.color.copy(y),e.background=null,p=!0):(m.color.copy(Xp),p=!0);for(let v=0;v<6;v++){let _=v%3;_===0?(l.up.set(0,c[v],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[v],r.y,r.z)):_===1?(l.up.set(0,0,c[v]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[v],r.z)):(l.up.set(0,c[v],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[v]));let M=this._cubeSize;Fr(s,_*M,v>2?M:0,M,M),h.setRenderTarget(s),p&&h.render(x,l),h.render(e,l)}h.toneMapping=d,h.autoClear=f,e.background=y}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ns||e.mapping===Us;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Yp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Kp());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Fr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Ya)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(c*c-u*u),f=c*1.25,d=h*f,{_lodMax:g}=this,x=this._sizeLods[n],m=3*x*(n>g-Or?n-g+Or:0),p=4*(this._cubeSize-x);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=g-t,Fr(r,m,p,3*x,2*x),s.setRenderTarget(r),s.render(o,Ya),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Fr(e,m,p,3*x,2*x),s.setRenderTarget(e),s.render(o,Ya)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],h=3*u*(s>this._lodMax-Or?s-this._lodMax+Or:0),f=4*(this._cubeSize-u);Fr(t,h,f,3*u,2*u),a.setRenderTarget(t),a.render(l,Ya)}};function yv(i){let e=[],t=[],n=i,s=i-Or+1+gv;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],h=6,f=6,d=3,g=new Float32Array(d*f*h),x=new Float32Array(d*f*h);for(let p=0;p<h;p++){let y=p%3*2/3-1,v=p>2?0:-1,_=[y,v,0,y+2/3,v,0,y+2/3,v+1,0,y,v,0,y+2/3,v+1,0,y,v+1,0];g.set(_,d*f*p);for(let M=0;M<f;M++){let E=u[M*2]*2-1,w=u[M*2+1]*2-1;p===0?zs.set(1,w,E):p===1?zs.set(-E,1,-w):p===2?zs.set(-E,w,1):p===3?zs.set(-1,w,-E):p===4?zs.set(-E,-1,w):zs.set(E,w,-1),zs.toArray(x,(p*f+M)*d)}}let m=new St;m.setAttribute("position",new st(g,d)),m.setAttribute("outputDirection",new st(x,d)),t.push(new It(m,null)),n>Or&&n--}return{lodMeshes:t,sizeLods:e}}function jp(i,e,t){let n=new xn(i,e,t);return n.texture.mapping=Ba,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Fr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function vv(i,e,t){return new En({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:xv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:dl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Mv(i,e,t){return new En({name:"SphericalGaussianBlur",defines:{SAMPLES:bv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:dl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Kp(){return new En({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Yp(){return new En({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function dl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var hl=class extends xn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Ea(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new kt(5,5,5),r=new En({name:"CubemapFromEquirect",uniforms:Bs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:gn,blending:fi});r.uniforms.tEquirect.value=t;let a=new It(s,r),o=t.minFilter;return t.minFilter===$n&&(t.minFilter=Pt),new mc(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function Sv(i){let e=new WeakMap,t=new WeakMap,n=null;function s(f,d=!1){return f==null?null:d?a(f):r(f)}function r(f){if(f&&f.isTexture){let d=f.mapping;if(d===yc||d===vc)if(e.has(f)){let g=e.get(f).texture;return o(g,f.mapping)}else{let g=f.image;if(g&&g.height>0){let x=new hl(g.height);return x.fromEquirectangularTexture(i,f),e.set(f,x),f.addEventListener("dispose",c),o(x.texture,f.mapping)}else return null}}return f}function a(f){if(f&&f.isTexture){let d=f.mapping,g=d===yc||d===vc,x=d===ns||d===Us;if(g||x){let m=t.get(f),p=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==p)return n===null&&(n=new ul(i)),m=g?n.fromEquirectangular(f,m):n.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),m.texture;if(m!==void 0)return m.texture;{let y=f.image;return g&&y&&y.height>0||x&&y&&l(y)?(n===null&&(n=new ul(i)),m=g?n.fromEquirectangular(f):n.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),f.addEventListener("dispose",u),m.texture):null}}}return f}function o(f,d){return d===yc?f.mapping=ns:d===vc&&(f.mapping=Us),f}function l(f){let d=0,g=6;for(let x=0;x<g;x++)f[x]!==void 0&&d++;return d===g}function c(f){let d=f.target;d.removeEventListener("dispose",c);let g=e.get(d);g!==void 0&&(e.delete(d),g.dispose())}function u(f){let d=f.target;d.removeEventListener("dispose",u);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:h}}function wv(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&_s("WebGLRenderer: "+n+" extension not supported."),s}}}function Ev(i,e,t,n){let s={},r=new WeakMap;function a(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete s[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(h,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let d in f)e.update(f[d],i.ARRAY_BUFFER)}function c(h){let f=[],d=h.index,g=h.attributes.position,x=0;if(g===void 0)return;if(d!==null){let y=d.array;x=d.version;for(let v=0,_=y.length;v<_;v+=3){let M=y[v+0],E=y[v+1],w=y[v+2];f.push(M,E,E,w,w,M)}}else{let y=g.array;x=g.version;for(let v=0,_=y.length/3-1;v<_;v+=3){let M=v+0,E=v+1,w=v+2;f.push(M,E,E,w,w,M)}}let m=new(g.count>=65535?ws:Ss)(f,1);m.version=x;let p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){let f=r.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function Tv(i,e,t){let n;function s(h){n=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,f){i.drawElements(n,f,r,h*a),t.update(f,n,1)}function c(h,f,d){d!==0&&(i.drawElementsInstanced(n,f,r,h*a,d),t.update(f,n,d))}function u(h,f,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,h,0,d);let x=0;for(let m=0;m<d;m++)x+=f[m];t.update(x,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Av(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:qe("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Rv(i,e,t){let n=new WeakMap,s=new ft;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0,f=n.get(o);if(f===void 0||f.count!==h){let T=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();let d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],y=o.morphAttributes.color||[],v=0;d===!0&&(v=1),g===!0&&(v=2),x===!0&&(v=3);let _=o.attributes.position.count*v,M=1;_>e.maxTextureSize&&(M=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);let E=new Float32Array(_*M*4*h),w=new xa(E,_,M,h);w.type=un,w.needsUpdate=!0;let b=v*4;for(let R=0;R<h;R++){let P=m[R],D=p[R],I=y[R],C=_*M*4*R;for(let N=0;N<P.count;N++){let z=N*b;d===!0&&(s.fromBufferAttribute(P,N),E[C+z+0]=s.x,E[C+z+1]=s.y,E[C+z+2]=s.z,E[C+z+3]=0),g===!0&&(s.fromBufferAttribute(D,N),E[C+z+4]=s.x,E[C+z+5]=s.y,E[C+z+6]=s.z,E[C+z+7]=0),x===!0&&(s.fromBufferAttribute(I,N),E[C+z+8]=s.x,E[C+z+9]=s.y,E[C+z+10]=s.z,E[C+z+11]=I.itemSize===4?s.w:1)}}f={count:h,texture:w,size:new Ke(_,M)},n.set(o,f),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];let g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function Cv(i,e,t,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,h=c.geometry,f=e.get(c,h);if(r.get(f)!==u&&(e.update(f),r.set(f,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return f}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var Pv={[eh]:"LINEAR_TONE_MAPPING",[th]:"REINHARD_TONE_MAPPING",[nh]:"CINEON_TONE_MAPPING",[ih]:"ACES_FILMIC_TONE_MAPPING",[rh]:"AGX_TONE_MAPPING",[ah]:"NEUTRAL_TONE_MAPPING",[sh]:"CUSTOM_TONE_MAPPING"};function Iv(i,e,t,n,s,r){let a=new xn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new St;c.setAttribute("position",new mt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new mt([0,2,0,0,2,0],2));let u=new ac({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new It(c,u),f=new ui(-1,1,1,-1,0,1),d=null,g=null,x=!1,m,p=null,y=[],v=!1;this.setSize=function(_,M){a.setSize(_,M),o!==null&&o.setSize(_,M),l!==null&&l.setSize(_,M);for(let E=0;E<y.length;E++){let w=y[E];w.setSize&&w.setSize(_,M)}},this.setEffects=function(_){y=_,v=y.length>0&&y[0].isRenderPass===!0;let M=a.width,E=a.height;y.length>0&&o===null&&(o=new xn(M,E,{type:Qn,depthBuffer:!1,stencilBuffer:!1}),l=new xn(M,E,{type:Qn,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<y.length;w++){let b=y[w];b.setSize&&b.setSize(M,E)}},this.begin=function(_,M){if(x||_.toneMapping===Tn&&y.length===0)return!1;if(p=M,M!==null){let E=M.width,w=M.height;(a.width!==E||a.height!==w)&&this.setSize(E,w)}return v===!1&&_.setRenderTarget(a),m=_.toneMapping,_.toneMapping=Tn,!0},this.hasRenderPass=function(){return v},this.end=function(_,M){_.toneMapping=m,x=!0;let E=a,w=o;for(let b=0;b<y.length;b++){let T=y[b];T.enabled!==!1&&(T.render(_,w,E,M),T.needsSwap!==!1&&(E=w,w=w===o?l:o))}if(d!==_.outputColorSpace||g!==_.toneMapping){d=_.outputColorSpace,g=_.toneMapping,u.defines={},Ze.getTransfer(d)===lt&&(u.defines.SRGB_TRANSFER="");let b=Pv[g];b&&(u.defines[b]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=E.texture,_.setRenderTarget(p),_.render(h,f),p=null,x=!1},this.isCompositing=function(){return x},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var mm=new Xt,Ph=new $i(1,1),gm=new xa,bm=new tc,xm=new Ea,Jp=[],Zp=[],$p=new Float32Array(16),Qp=new Float32Array(9),em=new Float32Array(4);function kr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Jp[s];if(r===void 0&&(r=new Float32Array(s),Jp[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function zt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Gt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function pl(i,e){let t=Zp[e];t===void 0&&(t=new Int32Array(e),Zp[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Lv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Dv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(zt(t,e))return;i.uniform2fv(this.addr,e),Gt(t,e)}}function Nv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(zt(t,e))return;i.uniform3fv(this.addr,e),Gt(t,e)}}function Fv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(zt(t,e))return;i.uniform4fv(this.addr,e),Gt(t,e)}}function Ov(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Gt(t,e)}else{if(zt(t,n))return;em.set(n),i.uniformMatrix2fv(this.addr,!1,em),Gt(t,n)}}function Uv(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Gt(t,e)}else{if(zt(t,n))return;Qp.set(n),i.uniformMatrix3fv(this.addr,!1,Qp),Gt(t,n)}}function kv(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Gt(t,e)}else{if(zt(t,n))return;$p.set(n),i.uniformMatrix4fv(this.addr,!1,$p),Gt(t,n)}}function Bv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function zv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(zt(t,e))return;i.uniform2iv(this.addr,e),Gt(t,e)}}function Gv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(zt(t,e))return;i.uniform3iv(this.addr,e),Gt(t,e)}}function Hv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(zt(t,e))return;i.uniform4iv(this.addr,e),Gt(t,e)}}function Vv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Wv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(zt(t,e))return;i.uniform2uiv(this.addr,e),Gt(t,e)}}function qv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(zt(t,e))return;i.uniform3uiv(this.addr,e),Gt(t,e)}}function Xv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(zt(t,e))return;i.uniform4uiv(this.addr,e),Gt(t,e)}}function jv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ph.compareFunction=t.isReversedDepthBuffer()?ol:al,r=Ph):r=mm,t.setTexture2D(e||r,s)}function Kv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||bm,s)}function Yv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||xm,s)}function Jv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||gm,s)}function Zv(i){switch(i){case 5126:return Lv;case 35664:return Dv;case 35665:return Nv;case 35666:return Fv;case 35674:return Ov;case 35675:return Uv;case 35676:return kv;case 5124:case 35670:return Bv;case 35667:case 35671:return zv;case 35668:case 35672:return Gv;case 35669:case 35673:return Hv;case 5125:return Vv;case 36294:return Wv;case 36295:return qv;case 36296:return Xv;case 35678:case 36198:case 36298:case 36306:case 35682:return jv;case 35679:case 36299:case 36307:return Kv;case 35680:case 36300:case 36308:case 36293:return Yv;case 36289:case 36303:case 36311:case 36292:return Jv}}function $v(i,e){i.uniform1fv(this.addr,e)}function Qv(i,e){let t=kr(e,this.size,2);i.uniform2fv(this.addr,t)}function eM(i,e){let t=kr(e,this.size,3);i.uniform3fv(this.addr,t)}function tM(i,e){let t=kr(e,this.size,4);i.uniform4fv(this.addr,t)}function nM(i,e){let t=kr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function iM(i,e){let t=kr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function sM(i,e){let t=kr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function rM(i,e){i.uniform1iv(this.addr,e)}function aM(i,e){i.uniform2iv(this.addr,e)}function oM(i,e){i.uniform3iv(this.addr,e)}function cM(i,e){i.uniform4iv(this.addr,e)}function lM(i,e){i.uniform1uiv(this.addr,e)}function uM(i,e){i.uniform2uiv(this.addr,e)}function hM(i,e){i.uniform3uiv(this.addr,e)}function fM(i,e){i.uniform4uiv(this.addr,e)}function dM(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);zt(n,r)||(i.uniform1iv(this.addr,r),Gt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Ph:a=mm;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function pM(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);zt(n,r)||(i.uniform1iv(this.addr,r),Gt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||bm,r[a])}function mM(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);zt(n,r)||(i.uniform1iv(this.addr,r),Gt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||xm,r[a])}function gM(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);zt(n,r)||(i.uniform1iv(this.addr,r),Gt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||gm,r[a])}function bM(i){switch(i){case 5126:return $v;case 35664:return Qv;case 35665:return eM;case 35666:return tM;case 35674:return nM;case 35675:return iM;case 35676:return sM;case 5124:case 35670:return rM;case 35667:case 35671:return aM;case 35668:case 35672:return oM;case 35669:case 35673:return cM;case 5125:return lM;case 36294:return uM;case 36295:return hM;case 36296:return fM;case 35678:case 36198:case 36298:case 36306:case 35682:return dM;case 35679:case 36299:case 36307:return pM;case 35680:case 36300:case 36308:case 36293:return mM;case 36289:case 36303:case 36311:case 36292:return gM}}var Ih=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Zv(t.type)}},Lh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=bM(t.type)}},Dh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Rh=/(\w+)(\])?(\[|\.)?/g;function tm(i,e){i.seq.push(e),i.map[e.id]=e}function xM(i,e,t){let n=i.name,s=n.length;for(Rh.lastIndex=0;;){let r=Rh.exec(n),a=Rh.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){tm(t,c===void 0?new Ih(o,i,e):new Lh(o,i,e));break}else{let h=t.map[o];h===void 0&&(h=new Dh(o),tm(t,h)),t=h}}}var Ur=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);xM(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function nm(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var _M=37297,yM=0;function vM(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var im=new Xe;function MM(i){Ze._getMatrix(im,Ze.workingColorSpace,i);let e=`mat3( ${im.elements.map(t=>t.toFixed(4))} )`;switch(Ze.getTransfer(i)){case ga:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return Oe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function sm(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+vM(i.getShaderSource(e),o)}else return r}function SM(i,e){let t=MM(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var wM={[eh]:"Linear",[th]:"Reinhard",[nh]:"Cineon",[ih]:"ACESFilmic",[rh]:"AgX",[ah]:"Neutral",[sh]:"Custom"};function EM(i,e){let t=wM[e];return t===void 0?(Oe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ll=new U;function TM(){Ze.getLuminanceCoefficients(ll);let i=ll.x.toFixed(4),e=ll.y.toFixed(4),t=ll.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function AM(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Za).join(`
`)}function RM(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function CM(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Za(i){return i!==""}function rm(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function am(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var PM=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nh(i){return i.replace(PM,LM)}var IM=new Map;function LM(i,e){let t=$e[e];if(t===void 0){let n=IM.get(e);if(n!==void 0)t=$e[n],Oe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Nh(t)}var DM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function om(i){return i.replace(DM,NM)}function NM(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function cm(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var FM={[Fs]:"SHADOWMAP_TYPE_PCF",[Cr]:"SHADOWMAP_TYPE_VSM"};function OM(i){return FM[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var UM={[ns]:"ENVMAP_TYPE_CUBE",[Us]:"ENVMAP_TYPE_CUBE",[Ba]:"ENVMAP_TYPE_CUBE_UV"};function kM(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":UM[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var BM={[Us]:"ENVMAP_MODE_REFRACTION"};function zM(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":BM[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var GM={[_c]:"ENVMAP_BLENDING_MULTIPLY",[yp]:"ENVMAP_BLENDING_MIX",[vp]:"ENVMAP_BLENDING_ADD"};function HM(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":GM[i.combine]||"ENVMAP_BLENDING_NONE"}function VM(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function WM(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=OM(t),c=kM(t),u=zM(t),h=HM(t),f=VM(t),d=AM(t),g=RM(r),x=s.createProgram(),m,p,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Za).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Za).join(`
`),p.length>0&&(p+=`
`)):(m=[cm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Za).join(`
`),p=[cm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Tn?"#define TONE_MAPPING":"",t.toneMapping!==Tn?$e.tonemapping_pars_fragment:"",t.toneMapping!==Tn?EM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,SM("linearToOutputTexel",t.outputColorSpace),TM(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Za).join(`
`)),a=Nh(a),a=rm(a,t),a=am(a,t),o=Nh(o),o=rm(o,t),o=am(o,t),a=om(a),o=om(o),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===bh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===bh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let v=y+m+a,_=y+p+o,M=nm(s,s.VERTEX_SHADER,v),E=nm(s,s.FRAGMENT_SHADER,_);s.attachShader(x,M),s.attachShader(x,E),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function w(P){if(i.debug.checkShaderErrors){let D=s.getProgramInfoLog(x)||"",I=s.getShaderInfoLog(M)||"",C=s.getShaderInfoLog(E)||"",N=D.trim(),z=I.trim(),F=C.trim(),W=!0,V=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(W=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,M,E);else{let Y=sm(s,M,"vertex"),Q=sm(s,E,"fragment");qe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+N+`
`+Y+`
`+Q)}else N!==""?Oe("WebGLProgram: Program Info Log:",N):(z===""||F==="")&&(V=!1);V&&(P.diagnostics={runnable:W,programLog:N,vertexShader:{log:z,prefix:m},fragmentShader:{log:F,prefix:p}})}s.deleteShader(M),s.deleteShader(E),b=new Ur(s,x),T=CM(s,x)}let b;this.getUniforms=function(){return b===void 0&&w(this),b};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(x,_M)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=yM++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=M,this.fragmentShader=E,this}var qM=0,Fh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Oh(e),t.set(e,n)),n}},Oh=class{constructor(e){this.id=qM++,this.code=e,this.usedTimes=0}};function XM(i){return i===ss||i===qa||i===Xa}function jM(i,e,t,n,s,r){let a=new _a,o=new Fh,l=new Set,c=[],u=new Map,h=n.logarithmicDepthBuffer,f=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(b){return l.add(b),b===0?"uv":`uv${b}`}function x(b,T,R,P,D,I){let C=P.fog,N=D.geometry,z=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?P.environment:null,F=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,W=e.get(b.envMap||z,F),V=W&&W.mapping===Ba?W.image.height:null,Y=d[b.type];b.precision!==null&&(f=n.getMaxPrecision(b.precision),f!==b.precision&&Oe("WebGLProgram.getParameters:",b.precision,"not supported, using",f,"instead."));let Q=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,he=Q!==void 0?Q.length:0,fe=0;N.morphAttributes.position!==void 0&&(fe=1),N.morphAttributes.normal!==void 0&&(fe=2),N.morphAttributes.color!==void 0&&(fe=3);let Ge,Te,Fe,k;if(Y){let bt=pi[Y];Ge=bt.vertexShader,Te=bt.fragmentShader}else{Ge=b.vertexShader,Te=b.fragmentShader;let bt=o.getVertexShaderStage(b),ot=o.getFragmentShaderStage(b);o.update(b,bt,ot),Fe=bt.id,k=ot.id}let $=i.getRenderTarget(),O=i.state.buffers.depth.getReversed(),ee=D.isInstancedMesh===!0,te=D.isBatchedMesh===!0,ce=!!b.map,Ve=!!b.matcap,oe=!!W,Ae=!!b.aoMap,je=!!b.lightMap,Ee=!!b.bumpMap&&b.wireframe===!1,rt=!!b.normalMap,wt=!!b.displacementMap,Zt=!!b.emissiveMap,yt=!!b.metalnessMap,Dt=!!b.roughnessMap,H=b.anisotropy>0,$t=b.clearcoat>0,ut=b.dispersion>0,L=b.retroreflectivity>0,S=b.iridescence>0,q=b.sheen>0,J=b.transmission>0,ne=H&&!!b.anisotropyMap,le=$t&&!!b.clearcoatMap,de=$t&&!!b.clearcoatNormalMap,ie=$t&&!!b.clearcoatRoughnessMap,re=S&&!!b.iridescenceMap,pe=S&&!!b.iridescenceThicknessMap,Ue=q&&!!b.sheenColorMap,xe=q&&!!b.sheenRoughnessMap,me=!!b.specularMap,ke=!!b.specularColorMap,He=!!b.specularIntensityMap,Ye=J&&!!b.transmissionMap,G=J&&!!b.thicknessMap,ge=!!b.gradientMap,se=!!b.alphaMap,be=b.alphaTest>0,Se=!!b.alphaHash,ae=!!b.extensions,ze=Tn;b.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(ze=i.toneMapping);let De={shaderID:Y,shaderType:b.type,shaderName:b.name,vertexShader:Ge,fragmentShader:Te,defines:b.defines,customVertexShaderID:Fe,customFragmentShaderID:k,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:f,batching:te,batchingColor:te&&D._colorsTexture!==null,instancing:ee,instancingColor:ee&&D.instanceColor!==null,instancingMorph:ee&&D.morphTexture!==null,outputColorSpace:$===null?i.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:Ze.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:ce,matcap:Ve,envMap:oe,envMapMode:oe&&W.mapping,envMapCubeUVHeight:V,aoMap:Ae,lightMap:je,bumpMap:Ee,normalMap:rt,displacementMap:wt,emissiveMap:Zt,normalMapObjectSpace:rt&&b.normalMapType===Ap,normalMapTangentSpace:rt&&b.normalMapType===Ka,packedNormalMap:rt&&b.normalMapType===Ka&&XM(b.normalMap.format),metalnessMap:yt,roughnessMap:Dt,anisotropy:H,anisotropyMap:ne,clearcoat:$t,clearcoatMap:le,clearcoatNormalMap:de,clearcoatRoughnessMap:ie,dispersion:ut,retroreflection:L,iridescence:S,iridescenceMap:re,iridescenceThicknessMap:pe,sheen:q,sheenColorMap:Ue,sheenRoughnessMap:xe,specularMap:me,specularColorMap:ke,specularIntensityMap:He,transmission:J,transmissionMap:Ye,thicknessMap:G,gradientMap:ge,opaque:b.transparent===!1&&b.blending===Pr&&b.alphaToCoverage===!1,alphaMap:se,alphaTest:be,alphaHash:Se,combine:b.combine,mapUv:ce&&g(b.map.channel),aoMapUv:Ae&&g(b.aoMap.channel),lightMapUv:je&&g(b.lightMap.channel),bumpMapUv:Ee&&g(b.bumpMap.channel),normalMapUv:rt&&g(b.normalMap.channel),displacementMapUv:wt&&g(b.displacementMap.channel),emissiveMapUv:Zt&&g(b.emissiveMap.channel),metalnessMapUv:yt&&g(b.metalnessMap.channel),roughnessMapUv:Dt&&g(b.roughnessMap.channel),anisotropyMapUv:ne&&g(b.anisotropyMap.channel),clearcoatMapUv:le&&g(b.clearcoatMap.channel),clearcoatNormalMapUv:de&&g(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ie&&g(b.clearcoatRoughnessMap.channel),iridescenceMapUv:re&&g(b.iridescenceMap.channel),iridescenceThicknessMapUv:pe&&g(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ue&&g(b.sheenColorMap.channel),sheenRoughnessMapUv:xe&&g(b.sheenRoughnessMap.channel),specularMapUv:me&&g(b.specularMap.channel),specularColorMapUv:ke&&g(b.specularColorMap.channel),specularIntensityMapUv:He&&g(b.specularIntensityMap.channel),transmissionMapUv:Ye&&g(b.transmissionMap.channel),thicknessMapUv:G&&g(b.thicknessMap.channel),alphaMapUv:se&&g(b.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(rt||H),vertexNormals:!!N.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!N.attributes.uv&&(ce||se),fog:!!C,useFog:b.fog===!0,fogExp2:!!C&&C.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||N.attributes.normal===void 0&&rt===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:O,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:N.attributes.position!==void 0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:he,morphTextureStride:fe,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:I.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:ze,decodeVideoTexture:ce&&b.map.isVideoTexture===!0&&Ze.getTransfer(b.map.colorSpace)===lt,decodeVideoTextureEmissive:Zt&&b.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(b.emissiveMap.colorSpace)===lt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===On,flipSided:b.side===gn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:ae&&b.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ae&&b.extensions.multiDraw===!0||te)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return De.vertexUv1s=l.has(1),De.vertexUv2s=l.has(2),De.vertexUv3s=l.has(3),l.clear(),De}function m(b){let T=[];if(b.shaderID?T.push(b.shaderID):(T.push(b.customVertexShaderID),T.push(b.customFragmentShaderID)),b.defines!==void 0)for(let R in b.defines)T.push(R),T.push(b.defines[R]);return b.isRawShaderMaterial===!1&&(p(T,b),y(T,b),T.push(i.outputColorSpace)),T.push(b.customProgramCacheKey),T.join()}function p(b,T){b.push(T.precision),b.push(T.outputColorSpace),b.push(T.envMapMode),b.push(T.envMapCubeUVHeight),b.push(T.mapUv),b.push(T.alphaMapUv),b.push(T.lightMapUv),b.push(T.aoMapUv),b.push(T.bumpMapUv),b.push(T.normalMapUv),b.push(T.displacementMapUv),b.push(T.emissiveMapUv),b.push(T.metalnessMapUv),b.push(T.roughnessMapUv),b.push(T.anisotropyMapUv),b.push(T.clearcoatMapUv),b.push(T.clearcoatNormalMapUv),b.push(T.clearcoatRoughnessMapUv),b.push(T.iridescenceMapUv),b.push(T.iridescenceThicknessMapUv),b.push(T.sheenColorMapUv),b.push(T.sheenRoughnessMapUv),b.push(T.specularMapUv),b.push(T.specularColorMapUv),b.push(T.specularIntensityMapUv),b.push(T.transmissionMapUv),b.push(T.thicknessMapUv),b.push(T.combine),b.push(T.fogExp2),b.push(T.sizeAttenuation),b.push(T.morphTargetsCount),b.push(T.morphAttributeCount),b.push(T.numSunLights),b.push(T.numDirLights),b.push(T.numPointLights),b.push(T.numSpotLights),b.push(T.numSpotLightMaps),b.push(T.numHemiLights),b.push(T.numRectAreaLights),b.push(T.numSunLightShadows),b.push(T.numDirLightShadows),b.push(T.numPointLightShadows),b.push(T.numSpotLightShadows),b.push(T.numSpotLightShadowsWithMaps),b.push(T.numLightProbes),b.push(T.shadowMapType),b.push(T.toneMapping),b.push(T.numClippingPlanes),b.push(T.numClipIntersection),b.push(T.depthPacking)}function y(b,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),b.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),b.push(a.mask)}function v(b){let T=d[b.type],R;if(T){let P=pi[T];R=Gp.clone(P.uniforms)}else R=b.uniforms;return R}function _(b,T){let R=u.get(T);return R!==void 0?++R.usedTimes:(R=new WM(i,T,b,s),c.push(R),u.set(T,R)),R}function M(b){if(--b.usedTimes===0){let T=c.indexOf(b);c[T]=c[c.length-1],c.pop(),u.delete(b.cacheKey),b.destroy()}}function E(b){o.remove(b)}function w(){o.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:v,acquireProgram:_,releaseProgram:M,releaseShaderCache:E,programs:c,dispose:w}}function KM(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function YM(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function lm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function um(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(f){let d=0;return f.isInstancedMesh&&(d+=2),f.isSkinnedMesh&&(d+=1),d}function o(f,d,g,x,m,p){let y=i[e];return y===void 0?(y={id:f.id,object:f,geometry:d,material:g,materialVariant:a(f),groupOrder:x,renderOrder:f.renderOrder,z:m,group:p},i[e]=y):(y.id=f.id,y.object=f,y.geometry=d,y.material=g,y.materialVariant=a(f),y.groupOrder=x,y.renderOrder=f.renderOrder,y.z=m,y.group=p),e++,y}function l(f,d,g,x,m,p,y){y.reversedDepth===!0&&(m=-m);let v=o(f,d,g,x,m,p);g.transmission>0?n.push(v):g.transparent===!0?s.push(v):t.push(v)}function c(f,d,g,x,m,p){let y=o(f,d,g,x,m,p);g.transmission>0?n.unshift(y):g.transparent===!0?s.unshift(y):t.unshift(y)}function u(f,d){t.length>1&&t.sort(f||YM),n.length>1&&n.sort(d||lm),s.length>1&&s.sort(d||lm)}function h(){for(let f=e,d=i.length;f<d;f++){let g=i[f];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:h,sort:u}}function JM(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new um,i.set(n,[a])):s>=r.length?(a=new um,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function ZM(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new U,color:new ue};break;case"SpotLight":t={position:new U,direction:new U,color:new ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new ue,groundColor:new ue};break;case"RectAreaLight":t={color:new ue,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function $M(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var QM=0;function eS(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function tS(i){let e=new ZM,t=$M(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new Me,a=new Me;function o(c){let u=0,h=0,f=0;for(let D=0;D<9;D++)n.probe[D].set(0,0,0);let d=0,g=0,x=0,m=0,p=0,y=0,v=0,_=0,M=0,E=0,w=0,b=0,T=0,R=0;c.sort(eS);for(let D=0,I=c.length;D<I;D++){let C=c[D],N=C.color,z=C.intensity,F=C.distance,W=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===ss?W=C.shadow.map.texture:W=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)u+=N.r*z,h+=N.g*z,f+=N.b*z;else if(C.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(C.sh.coefficients[V],z);R++}else if(C.isSunLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Y=C.shadow,Q=t.get(C);Q.shadowIntensity=Y.intensity,Q.shadowBias=Y.bias,Q.shadowNormalBias=Y.normalBias,Q.shadowRadius=Y.radius,Q.shadowMapSize.copy(Y.mapSize).multiply(Y.getFrameExtents()),n.sunShadow[g]=Q,n.sunShadowMap[g]=W;let he=Y.getViewportCount();for(let fe=0;fe<he;fe++)n.sunShadowMatrix[x+fe]=Y.getMatrix(fe),n.sunShadowCascade[x+fe]=Y._cascadeData[fe];x+=he,g++}n.sun[d]=V,d++}else if(C.isDirectionalLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Y=C.shadow,Q=t.get(C);Q.shadowIntensity=Y.intensity,Q.shadowBias=Y.bias,Q.shadowNormalBias=Y.normalBias,Q.shadowRadius=Y.radius,Q.shadowMapSize=Y.mapSize,n.directionalShadow[m]=Q,n.directionalShadowMap[m]=W,n.directionalShadowMatrix[m]=C.shadow.matrix,M++}n.directional[m]=V,m++}else if(C.isSpotLight){let V=e.get(C);V.position.setFromMatrixPosition(C.matrixWorld),V.color.copy(N).multiplyScalar(z),V.distance=F,V.coneCos=Math.cos(C.angle),V.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),V.decay=C.decay,n.spot[y]=V;let Y=C.shadow;if(C.map&&(n.spotLightMap[b]=C.map,b++,Y.updateMatrices(C),C.castShadow&&T++),n.spotLightMatrix[y]=Y.matrix,C.castShadow){let Q=t.get(C);Q.shadowIntensity=Y.intensity,Q.shadowBias=Y.bias,Q.shadowNormalBias=Y.normalBias,Q.shadowRadius=Y.radius,Q.shadowMapSize=Y.mapSize,n.spotShadow[y]=Q,n.spotShadowMap[y]=W,w++}y++}else if(C.isRectAreaLight){let V=e.get(C);V.color.copy(N).multiplyScalar(z),V.halfWidth.set(C.width*.5,0,0),V.halfHeight.set(0,C.height*.5,0),n.rectArea[v]=V,v++}else if(C.isPointLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),V.distance=C.distance,V.decay=C.decay,C.castShadow){let Y=C.shadow,Q=t.get(C);Q.shadowIntensity=Y.intensity,Q.shadowBias=Y.bias,Q.shadowNormalBias=Y.normalBias,Q.shadowRadius=Y.radius,Q.shadowMapSize=Y.mapSize,Q.shadowCameraNear=Y.camera.near,Q.shadowCameraFar=Y.camera.far,n.pointShadow[p]=Q,n.pointShadowMap[p]=W,n.pointShadowMatrix[p]=C.shadow.matrix,E++}n.point[p]=V,p++}else if(C.isHemisphereLight){let V=e.get(C);V.skyColor.copy(C.color).multiplyScalar(z),V.groundColor.copy(C.groundColor).multiplyScalar(z),n.hemi[_]=V,_++}}v>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=_e.LTC_FLOAT_1,n.rectAreaLTC2=_e.LTC_FLOAT_2):(n.rectAreaLTC1=_e.LTC_HALF_1,n.rectAreaLTC2=_e.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=f;let P=n.hash;(P.sunLength!==d||P.directionalLength!==m||P.pointLength!==p||P.spotLength!==y||P.rectAreaLength!==v||P.hemiLength!==_||P.numSunShadows!==g||P.numDirectionalShadows!==M||P.numPointShadows!==E||P.numSpotShadows!==w||P.numSpotMaps!==b||P.numLightProbes!==R)&&(n.sun.length=d,n.directional.length=m,n.spot.length=y,n.rectArea.length=v,n.point.length=p,n.hemi.length=_,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.directionalShadowMatrix.length=M,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=w,n.spotShadowMap.length=w,n.spotLightMatrix.length=w+b-T,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=R,P.sunLength=d,P.directionalLength=m,P.pointLength=p,P.spotLength=y,P.rectAreaLength=v,P.hemiLength=_,P.numSunShadows=g,P.numDirectionalShadows=M,P.numPointShadows=E,P.numSpotShadows=w,P.numSpotMaps=b,P.numLightProbes=R,n.version=QM++)}function l(c,u){let h=0,f=0,d=0,g=0,x=0,m=0,p=u.matrixWorldInverse;for(let y=0,v=c.length;y<v;y++){let _=c[y];if(_.isSunLight){let M=n.sun[h];M.direction.setFromMatrixPosition(_.matrixWorld),M.direction.transformDirection(p),h++}else if(_.isDirectionalLight){let M=n.directional[f];M.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),f++}else if(_.isSpotLight){let M=n.spot[g];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(p),M.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),g++}else if(_.isRectAreaLight){let M=n.rectArea[x];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(p),a.identity(),r.copy(_.matrixWorld),r.premultiply(p),a.extractRotation(r),M.halfWidth.set(_.width*.5,0,0),M.halfHeight.set(0,_.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),x++}else if(_.isPointLight){let M=n.point[d];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(p),d++}else if(_.isHemisphereLight){let M=n.hemi[m];M.direction.setFromMatrixPosition(_.matrixWorld),M.direction.transformDirection(p),m++}}}return{setup:o,setupView:l,state:n}}function hm(i){let e=new tS(i),t=[],n=[],s=[];function r(f){h.camera=f,t.length=0,n.length=0,s.length=0}function a(f){t.push(f)}function o(f){n.push(f)}function l(f){s.push(f)}function c(){e.setup(t)}function u(f){e.setupView(t,f)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function nS(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new hm(i),e.set(s,[o])):r>=a.length?(o=new hm(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var iS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,sS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,rS=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],aS=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],fm=new Me,Ja=new U,Ch=new U;function oS(i,e,t){let n=new Ii,s=new Ke,r=new Ke,a=new ft,o=new oc,l=new cc,c={},u=t.maxTextureSize,h={[hi]:gn,[gn]:hi,[On]:On},f=new En({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ke},radius:{value:4}},vertexShader:iS,fragmentShader:sS}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new St;g.setAttribute("position",new st(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new It(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fs;let p=this.type;this.render=function(E,w,b){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===tp&&(Oe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Fs);let T=i.getRenderTarget(),R=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),D=i.state;D.setBlending(fi),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);let I=p!==this.type;I&&w.traverse(function(C){C.material&&(Array.isArray(C.material)?C.material.forEach(N=>N.needsUpdate=!0):C.material.needsUpdate=!0)});for(let C=0,N=E.length;C<N;C++){let z=E[C],F=z.shadow;if(F===void 0){Oe("WebGLShadowMap:",z,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;s.copy(F.mapSize);let W=F.getFrameExtents();s.multiply(W),r.copy(F.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/W.x),s.x=r.x*W.x,F.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/W.y),s.y=r.y*W.y,F.mapSize.y=r.y));let V=i.state.buffers.depth.getReversed();if(F.camera._reversedDepth=V,F.map===null||I===!0){if(F.map!==null&&(F.map.depthTexture!==null&&(F.map.depthTexture.dispose(),F.map.depthTexture=null),F.map.dispose()),this.type===Cr){if(z.isPointLight){Oe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}F.map=new xn(s.x,s.y,{format:ss,type:Qn,minFilter:Pt,magFilter:Pt,generateMipmaps:!1}),F.map.texture.name=z.name+".shadowMap",F.map.depthTexture=new $i(s.x,s.y,un),F.map.depthTexture.name=z.name+".shadowMapDepth",F.map.depthTexture.format=oi,F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Ct,F.map.depthTexture.magFilter=Ct}else z.isPointLight?(F.map=new hl(s.x),F.map.depthTexture=new rc(s.x,Un)):(F.map=new xn(s.x,s.y),F.map.depthTexture=new $i(s.x,s.y,Un)),F.map.depthTexture.name=z.name+".shadowMap",F.map.depthTexture.format=oi,this.type===Fs?(F.map.depthTexture.compareFunction=V?ol:al,F.map.depthTexture.minFilter=Pt,F.map.depthTexture.magFilter=Pt):(F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Ct,F.map.depthTexture.magFilter=Ct);F.camera.updateProjectionMatrix()}F.map.isWebGLCubeRenderTarget!==!0&&(F.map.width!==s.x||F.map.height!==s.y)&&F.map.setSize(s.x,s.y);let Y=F.map.isWebGLCubeRenderTarget?6:F.getViewportCount();z.isPointLight!==!0&&F.updateMatrices(z,b);for(let Q=0;Q<Y;Q++){let he=F.getCamera(Q);if(z.isPointLight){let fe=F.camera,Ge=F.matrix,Te=z.distance||fe.far;Te!==fe.far&&(fe.far=Te,fe.updateProjectionMatrix()),Ja.setFromMatrixPosition(z.matrixWorld),fe.position.copy(Ja),Ch.copy(fe.position),Ch.add(rS[Q]),fe.up.copy(aS[Q]),fe.lookAt(Ch),fe.updateMatrixWorld(),Ge.makeTranslation(-Ja.x,-Ja.y,-Ja.z),fm.multiplyMatrices(fe.projectionMatrix,fe.matrixWorldInverse),F._frustum.setFromProjectionMatrix(fm,fe.coordinateSystem,fe.reversedDepth)}if(F.map.isWebGLCubeRenderTarget)i.setRenderTarget(F.map,Q),i.clear();else{Q===0&&(i.setRenderTarget(F.map),i.clear());let fe=F.getViewport(Q);a.set(r.x*fe.x,r.y*fe.y,r.x*fe.z,r.y*fe.w),D.viewport(a)}n=F.getFrustum(Q),_(w,b,he,z,this.type)}F.isPointLightShadow!==!0&&this.type===Cr&&y(F,b),F.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(T,R,P)};function y(E,w){let b=e.update(x);f.defines.VSM_SAMPLES!==E.blurSamples&&(f.defines.VSM_SAMPLES=E.blurSamples,d.defines.VSM_SAMPLES=E.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),E.mapPass===null?E.mapPass=new xn(s.x,s.y,{format:ss,type:Qn}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),f.uniforms.shadow_pass.value=E.map.depthTexture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(w,null,b,f,x,null),d.uniforms.shadow_pass.value=E.mapPass.texture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(w,null,b,d,x,null)}function v(E,w,b,T){let R=null,P=b.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(P!==void 0)R=P;else if(R=b.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let D=R.uuid,I=w.uuid,C=c[D];C===void 0&&(C={},c[D]=C);let N=C[I];N===void 0&&(N=R.clone(),C[I]=N,w.addEventListener("dispose",M)),R=N}if(R.visible=w.visible,R.wireframe=w.wireframe,T===Cr?R.side=w.shadowSide!==null?w.shadowSide:w.side:R.side=w.shadowSide!==null?w.shadowSide:h[w.side],R.alphaMap=w.alphaMap,R.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,R.map=w.map,R.clipShadows=w.clipShadows,R.clippingPlanes=w.clippingPlanes,R.clipIntersection=w.clipIntersection,R.displacementMap=w.displacementMap,R.displacementScale=w.displacementScale,R.displacementBias=w.displacementBias,R.wireframeLinewidth=w.wireframeLinewidth,R.linewidth=w.linewidth,b.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let D=i.properties.get(R);D.light=b}return R}function _(E,w,b,T,R){if(E.visible===!1)return;if(E.layers.test(w.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&R===Cr)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,E.matrixWorld);let I=e.update(E),C=E.material;if(Array.isArray(C)){let N=I.groups;for(let z=0,F=N.length;z<F;z++){let W=N[z],V=C[W.materialIndex];if(V&&V.visible){let Y=v(E,V,T,R);E.onBeforeShadow(i,E,w,b,I,Y,W),i.renderBufferDirect(b,null,I,Y,E,W),E.onAfterShadow(i,E,w,b,I,Y,W)}}}else if(C.visible){let N=v(E,C,T,R);E.onBeforeShadow(i,E,w,b,I,N,null),i.renderBufferDirect(b,null,I,N,E,null),E.onAfterShadow(i,E,w,b,I,N,null)}}let D=E.children;for(let I=0,C=D.length;I<C;I++)_(D[I],w,b,T,R)}function M(E){E.target.removeEventListener("dispose",M);for(let b in c){let T=c[b],R=E.target.uuid;R in T&&(T[R].dispose(),delete T[R])}}}function cS(i,e){function t(){let G=!1,ge=new ft,se=null,be=new ft(0,0,0,0);return{setMask:function(Se){se!==Se&&!G&&(i.colorMask(Se,Se,Se,Se),se=Se)},setLocked:function(Se){G=Se},setClear:function(Se,ae,ze,De,bt){bt===!0&&(Se*=De,ae*=De,ze*=De),ge.set(Se,ae,ze,De),be.equals(ge)===!1&&(i.clearColor(Se,ae,ze,De),be.copy(ge))},reset:function(){G=!1,se=null,be.set(-1,0,0,0)}}}function n(){let G=!1,ge=!1,se=null,be=null,Se=null;return{setReversed:function(ae){if(ge!==ae){let ze=e.get("EXT_clip_control");ae?ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.ZERO_TO_ONE_EXT):ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.NEGATIVE_ONE_TO_ONE_EXT),ge=ae;let De=Se;Se=null,this.setClear(De)}},getReversed:function(){return ge},setTest:function(ae){ae?$(i.DEPTH_TEST):O(i.DEPTH_TEST)},setMask:function(ae){se!==ae&&!G&&(i.depthMask(ae),se=ae)},setFunc:function(ae){if(ge&&(ae=Bp[ae]),be!==ae){switch(ae){case Xo:i.depthFunc(i.NEVER);break;case jo:i.depthFunc(i.ALWAYS);break;case Ko:i.depthFunc(i.LESS);break;case mr:i.depthFunc(i.LEQUAL);break;case Yo:i.depthFunc(i.EQUAL);break;case Jo:i.depthFunc(i.GEQUAL);break;case Zo:i.depthFunc(i.GREATER);break;case $o:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}be=ae}},setLocked:function(ae){G=ae},setClear:function(ae){Se!==ae&&(Se=ae,ge&&(ae=1-ae),i.clearDepth(ae))},reset:function(){G=!1,se=null,be=null,Se=null,ge=!1}}}function s(){let G=!1,ge=null,se=null,be=null,Se=null,ae=null,ze=null,De=null,bt=null;return{setTest:function(ot){G||(ot?$(i.STENCIL_TEST):O(i.STENCIL_TEST))},setMask:function(ot){ge!==ot&&!G&&(i.stencilMask(ot),ge=ot)},setFunc:function(ot,zn,ti){(se!==ot||be!==zn||Se!==ti)&&(i.stencilFunc(ot,zn,ti),se=ot,be=zn,Se=ti)},setOp:function(ot,zn,ti){(ae!==ot||ze!==zn||De!==ti)&&(i.stencilOp(ot,zn,ti),ae=ot,ze=zn,De=ti)},setLocked:function(ot){G=ot},setClear:function(ot){bt!==ot&&(i.clearStencil(ot),bt=ot)},reset:function(){G=!1,ge=null,se=null,be=null,Se=null,ae=null,ze=null,De=null,bt=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},h={},f={},d=new WeakMap,g=[],x=null,m=!1,p=null,y=null,v=null,_=null,M=null,E=null,w=null,b=new ue(0,0,0),T=0,R=!1,P=null,D=null,I=null,C=null,N=null,z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),F=!1,W=0,V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(V)[1]),F=W>=1):V.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),F=W>=2);let Y=null,Q={},he=i.getParameter(i.SCISSOR_BOX),fe=i.getParameter(i.VIEWPORT),Ge=new ft().fromArray(he),Te=new ft().fromArray(fe);function Fe(G,ge,se,be){let Se=new Uint8Array(4),ae=i.createTexture();i.bindTexture(G,ae),i.texParameteri(G,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(G,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ze=0;ze<se;ze++)G===i.TEXTURE_3D||G===i.TEXTURE_2D_ARRAY?i.texImage3D(ge,0,i.RGBA,1,1,be,0,i.RGBA,i.UNSIGNED_BYTE,Se):i.texImage2D(ge+ze,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Se);return ae}let k={};k[i.TEXTURE_2D]=Fe(i.TEXTURE_2D,i.TEXTURE_2D,1),k[i.TEXTURE_CUBE_MAP]=Fe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),k[i.TEXTURE_2D_ARRAY]=Fe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),k[i.TEXTURE_3D]=Fe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),$(i.DEPTH_TEST),a.setFunc(mr),Ee(!1),rt(Ku),$(i.CULL_FACE),Ae(fi);function $(G){u[G]!==!0&&(i.enable(G),u[G]=!0)}function O(G){u[G]!==!1&&(i.disable(G),u[G]=!1)}function ee(G,ge){return f[G]!==ge?(i.bindFramebuffer(G,ge),f[G]=ge,G===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=ge),G===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=ge),!0):!1}function te(G,ge){let se=g,be=!1;if(G){se=d.get(ge),se===void 0&&(se=[],d.set(ge,se));let Se=G.textures;if(se.length!==Se.length||se[0]!==i.COLOR_ATTACHMENT0){for(let ae=0,ze=Se.length;ae<ze;ae++)se[ae]=i.COLOR_ATTACHMENT0+ae;se.length=Se.length,be=!0}}else se[0]!==i.BACK&&(se[0]=i.BACK,be=!0);be&&i.drawBuffers(se)}function ce(G){return x!==G?(i.useProgram(G),x=G,!0):!1}let Ve={[Os]:i.FUNC_ADD,[ip]:i.FUNC_SUBTRACT,[sp]:i.FUNC_REVERSE_SUBTRACT};Ve[rp]=i.MIN,Ve[ap]=i.MAX;let oe={[op]:i.ZERO,[cp]:i.ONE,[lp]:i.SRC_COLOR,[$u]:i.SRC_ALPHA,[mp]:i.SRC_ALPHA_SATURATE,[dp]:i.DST_COLOR,[hp]:i.DST_ALPHA,[up]:i.ONE_MINUS_SRC_COLOR,[Qu]:i.ONE_MINUS_SRC_ALPHA,[pp]:i.ONE_MINUS_DST_COLOR,[fp]:i.ONE_MINUS_DST_ALPHA,[gp]:i.CONSTANT_COLOR,[bp]:i.ONE_MINUS_CONSTANT_COLOR,[xp]:i.CONSTANT_ALPHA,[_p]:i.ONE_MINUS_CONSTANT_ALPHA};function Ae(G,ge,se,be,Se,ae,ze,De,bt,ot){if(G===fi){m===!0&&(O(i.BLEND),m=!1);return}if(m===!1&&($(i.BLEND),m=!0),G!==np){if(G!==p||ot!==R){if((y!==Os||M!==Os)&&(i.blendEquation(i.FUNC_ADD),y=Os,M=Os),ot)switch(G){case Pr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Yu:i.blendFunc(i.ONE,i.ONE);break;case Ju:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Zu:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:qe("WebGLState: Invalid blending: ",G);break}else switch(G){case Pr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Yu:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Ju:qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Zu:qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:qe("WebGLState: Invalid blending: ",G);break}v=null,_=null,E=null,w=null,b.set(0,0,0),T=0,p=G,R=ot}return}Se=Se||ge,ae=ae||se,ze=ze||be,(ge!==y||Se!==M)&&(i.blendEquationSeparate(Ve[ge],Ve[Se]),y=ge,M=Se),(se!==v||be!==_||ae!==E||ze!==w)&&(i.blendFuncSeparate(oe[se],oe[be],oe[ae],oe[ze]),v=se,_=be,E=ae,w=ze),(De.equals(b)===!1||bt!==T)&&(i.blendColor(De.r,De.g,De.b,bt),b.copy(De),T=bt),p=G,R=!1}function je(G,ge){G.side===On?O(i.CULL_FACE):$(i.CULL_FACE);let se=G.side===gn;ge&&(se=!se),Ee(se),G.blending===Pr&&G.transparent===!1?Ae(fi):Ae(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),a.setFunc(G.depthFunc),a.setTest(G.depthTest),a.setMask(G.depthWrite),r.setMask(G.colorWrite);let be=G.stencilWrite;o.setTest(be),be&&(o.setMask(G.stencilWriteMask),o.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),o.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),Zt(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?$(i.SAMPLE_ALPHA_TO_COVERAGE):O(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ee(G){P!==G&&(G?i.frontFace(i.CW):i.frontFace(i.CCW),P=G)}function rt(G){G!==Qd?($(i.CULL_FACE),G!==D&&(G===Ku?i.cullFace(i.BACK):G===ep?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):O(i.CULL_FACE),D=G}function wt(G){G!==I&&(F&&i.lineWidth(G),I=G)}function Zt(G,ge,se){G?($(i.POLYGON_OFFSET_FILL),(C!==ge||N!==se)&&(C=ge,N=se,a.getReversed()&&(ge=-ge),i.polygonOffset(ge,se))):O(i.POLYGON_OFFSET_FILL)}function yt(G){G?$(i.SCISSOR_TEST):O(i.SCISSOR_TEST)}function Dt(G){G===void 0&&(G=i.TEXTURE0+z-1),Y!==G&&(i.activeTexture(G),Y=G)}function H(G,ge,se){se===void 0&&(Y===null?se=i.TEXTURE0+z-1:se=Y);let be=Q[se];be===void 0&&(be={type:void 0,texture:void 0},Q[se]=be),(be.type!==G||be.texture!==ge)&&(Y!==se&&(i.activeTexture(se),Y=se),i.bindTexture(G,ge||k[G]),be.type=G,be.texture=ge)}function $t(){let G=Q[Y];G!==void 0&&G.type!==void 0&&(i.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function ut(){try{i.compressedTexImage2D(...arguments)}catch(G){qe("WebGLState:",G)}}function L(){try{i.compressedTexImage3D(...arguments)}catch(G){qe("WebGLState:",G)}}function S(){try{i.texSubImage2D(...arguments)}catch(G){qe("WebGLState:",G)}}function q(){try{i.texSubImage3D(...arguments)}catch(G){qe("WebGLState:",G)}}function J(){try{i.compressedTexSubImage2D(...arguments)}catch(G){qe("WebGLState:",G)}}function ne(){try{i.compressedTexSubImage3D(...arguments)}catch(G){qe("WebGLState:",G)}}function le(){try{i.texStorage2D(...arguments)}catch(G){qe("WebGLState:",G)}}function de(){try{i.texStorage3D(...arguments)}catch(G){qe("WebGLState:",G)}}function ie(){try{i.texImage2D(...arguments)}catch(G){qe("WebGLState:",G)}}function re(){try{i.texImage3D(...arguments)}catch(G){qe("WebGLState:",G)}}function pe(G){return h[G]!==void 0?h[G]:i.getParameter(G)}function Ue(G,ge){h[G]!==ge&&(i.pixelStorei(G,ge),h[G]=ge)}function xe(G){Ge.equals(G)===!1&&(i.scissor(G.x,G.y,G.z,G.w),Ge.copy(G))}function me(G){Te.equals(G)===!1&&(i.viewport(G.x,G.y,G.z,G.w),Te.copy(G))}function ke(G,ge){let se=c.get(ge);se===void 0&&(se=new WeakMap,c.set(ge,se));let be=se.get(G);be===void 0&&(be=i.getUniformBlockIndex(ge,G.name),se.set(G,be))}function He(G,ge){let be=c.get(ge).get(G);l.get(ge)!==be&&(i.uniformBlockBinding(ge,be,G.__bindingPointIndex),l.set(ge,be))}function Ye(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},h={},Y=null,Q={},f={},d=new WeakMap,g=[],x=null,m=!1,p=null,y=null,v=null,_=null,M=null,E=null,w=null,b=new ue(0,0,0),T=0,R=!1,P=null,D=null,I=null,C=null,N=null,Ge.set(0,0,i.canvas.width,i.canvas.height),Te.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:$,disable:O,bindFramebuffer:ee,drawBuffers:te,useProgram:ce,setBlending:Ae,setMaterial:je,setFlipSided:Ee,setCullFace:rt,setLineWidth:wt,setPolygonOffset:Zt,setScissorTest:yt,activeTexture:Dt,bindTexture:H,unbindTexture:$t,compressedTexImage2D:ut,compressedTexImage3D:L,texImage2D:ie,texImage3D:re,pixelStorei:Ue,getParameter:pe,updateUBOMapping:ke,uniformBlockBinding:He,texStorage2D:le,texStorage3D:de,texSubImage2D:S,texSubImage3D:q,compressedTexSubImage2D:J,compressedTexSubImage3D:ne,scissor:xe,viewport:me,reset:Ye}}function lS(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ke,u=new WeakMap,h=new Set,f,d=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(L,S){return g?new OffscreenCanvas(L,S):xr("canvas")}function m(L,S,q){let J=1,ne=ut(L);if((ne.width>q||ne.height>q)&&(J=q/Math.max(ne.width,ne.height)),J<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let le=Math.floor(J*ne.width),de=Math.floor(J*ne.height);f===void 0&&(f=x(le,de));let ie=S?x(le,de):f;return ie.width=le,ie.height=de,ie.getContext("2d").drawImage(L,0,0,le,de),Oe("WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+le+"x"+de+")."),ie}else return"data"in L&&Oe("WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),L;return L}function p(L){return L.generateMipmaps}function y(L){i.generateMipmap(L)}function v(L){return L.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?i.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function _(L,S,q,J,ne,le=!1){if(L!==null){if(i[L]!==void 0)return i[L];Oe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let de;J&&(de=e.get("EXT_texture_norm16"),de||Oe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ie=S;if(S===i.RED&&(q===i.FLOAT&&(ie=i.R32F),q===i.HALF_FLOAT&&(ie=i.R16F),q===i.UNSIGNED_BYTE&&(ie=i.R8),q===i.UNSIGNED_SHORT&&de&&(ie=de.R16_EXT),q===i.SHORT&&de&&(ie=de.R16_SNORM_EXT)),S===i.RED_INTEGER&&(q===i.UNSIGNED_BYTE&&(ie=i.R8UI),q===i.UNSIGNED_SHORT&&(ie=i.R16UI),q===i.UNSIGNED_INT&&(ie=i.R32UI),q===i.BYTE&&(ie=i.R8I),q===i.SHORT&&(ie=i.R16I),q===i.INT&&(ie=i.R32I)),S===i.RG&&(q===i.FLOAT&&(ie=i.RG32F),q===i.HALF_FLOAT&&(ie=i.RG16F),q===i.UNSIGNED_BYTE&&(ie=i.RG8),q===i.UNSIGNED_SHORT&&de&&(ie=de.RG16_EXT),q===i.SHORT&&de&&(ie=de.RG16_SNORM_EXT)),S===i.RG_INTEGER&&(q===i.UNSIGNED_BYTE&&(ie=i.RG8UI),q===i.UNSIGNED_SHORT&&(ie=i.RG16UI),q===i.UNSIGNED_INT&&(ie=i.RG32UI),q===i.BYTE&&(ie=i.RG8I),q===i.SHORT&&(ie=i.RG16I),q===i.INT&&(ie=i.RG32I)),S===i.RGB_INTEGER&&(q===i.UNSIGNED_BYTE&&(ie=i.RGB8UI),q===i.UNSIGNED_SHORT&&(ie=i.RGB16UI),q===i.UNSIGNED_INT&&(ie=i.RGB32UI),q===i.BYTE&&(ie=i.RGB8I),q===i.SHORT&&(ie=i.RGB16I),q===i.INT&&(ie=i.RGB32I)),S===i.RGBA_INTEGER&&(q===i.UNSIGNED_BYTE&&(ie=i.RGBA8UI),q===i.UNSIGNED_SHORT&&(ie=i.RGBA16UI),q===i.UNSIGNED_INT&&(ie=i.RGBA32UI),q===i.BYTE&&(ie=i.RGBA8I),q===i.SHORT&&(ie=i.RGBA16I),q===i.INT&&(ie=i.RGBA32I)),S===i.RGB&&(q===i.UNSIGNED_SHORT&&de&&(ie=de.RGB16_EXT),q===i.SHORT&&de&&(ie=de.RGB16_SNORM_EXT),q===i.UNSIGNED_INT_5_9_9_9_REV&&(ie=i.RGB9_E5),q===i.UNSIGNED_INT_10F_11F_11F_REV&&(ie=i.R11F_G11F_B10F)),S===i.RGBA){let re=le?ga:Ze.getTransfer(ne);q===i.FLOAT&&(ie=i.RGBA32F),q===i.HALF_FLOAT&&(ie=i.RGBA16F),q===i.UNSIGNED_BYTE&&(ie=re===lt?i.SRGB8_ALPHA8:i.RGBA8),q===i.UNSIGNED_SHORT&&de&&(ie=de.RGBA16_EXT),q===i.SHORT&&de&&(ie=de.RGBA16_SNORM_EXT),q===i.UNSIGNED_SHORT_4_4_4_4&&(ie=i.RGBA4),q===i.UNSIGNED_SHORT_5_5_5_1&&(ie=i.RGB5_A1)}return(ie===i.R16F||ie===i.R32F||ie===i.RG16F||ie===i.RG32F||ie===i.RGBA16F||ie===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ie}function M(L,S){let q;return L?S===null||S===Un||S===Dr?q=i.DEPTH24_STENCIL8:S===un?q=i.DEPTH32F_STENCIL8:S===Lr&&(q=i.DEPTH24_STENCIL8,Oe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Un||S===Dr?q=i.DEPTH_COMPONENT24:S===un?q=i.DEPTH_COMPONENT32F:S===Lr&&(q=i.DEPTH_COMPONENT16),q}function E(L,S){return p(L)===!0||L.isFramebufferTexture&&L.minFilter!==Ct&&L.minFilter!==Pt?Math.log2(Math.max(S.width,S.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?S.mipmaps.length:1}function w(L){let S=L.target;S.removeEventListener("dispose",w),T(S),S.isVideoTexture&&u.delete(S),S.isHTMLTexture&&h.delete(S)}function b(L){let S=L.target;S.removeEventListener("dispose",b),P(S)}function T(L){let S=n.get(L);if(S.__webglInit===void 0)return;let q=L.source,J=d.get(q);if(J){let ne=J[S.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&R(L),Object.keys(J).length===0&&d.delete(q)}n.remove(L)}function R(L){let S=n.get(L);i.deleteTexture(S.__webglTexture);let q=L.source,J=d.get(q);delete J[S.__cacheKey],a.memory.textures--}function P(L){let S=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(S.__webglFramebuffer[J]))for(let ne=0;ne<S.__webglFramebuffer[J].length;ne++)i.deleteFramebuffer(S.__webglFramebuffer[J][ne]);else i.deleteFramebuffer(S.__webglFramebuffer[J]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[J])}else{if(Array.isArray(S.__webglFramebuffer))for(let J=0;J<S.__webglFramebuffer.length;J++)i.deleteFramebuffer(S.__webglFramebuffer[J]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let J=0;J<S.__webglColorRenderbuffer.length;J++)S.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[J]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let q=L.textures;for(let J=0,ne=q.length;J<ne;J++){let le=n.get(q[J]);le.__webglTexture&&(i.deleteTexture(le.__webglTexture),a.memory.textures--),n.remove(q[J])}n.remove(L)}let D=0;function I(){D=0}function C(){return D}function N(L){D=L}function z(){let L=D;return L>=s.maxTextures&&Oe("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+s.maxTextures),D+=1,L}function F(L){let S=[];return S.push(L.wrapS),S.push(L.wrapT),S.push(L.wrapR||0),S.push(L.magFilter),S.push(L.minFilter),S.push(L.anisotropy),S.push(L.internalFormat),S.push(L.format),S.push(L.type),S.push(L.generateMipmaps),S.push(L.premultiplyAlpha),S.push(L.flipY),S.push(L.unpackAlignment),S.push(L.colorSpace),S.join()}function W(L,S){let q=n.get(L);if(L.isVideoTexture&&H(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&q.__version!==L.version){let J=L.image;if(J===null)Oe("WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)Oe("WebGLRenderer: Texture marked for update but image is incomplete");else{O(q,L,S);return}}else L.isExternalTexture&&(q.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,q.__webglTexture,i.TEXTURE0+S)}function V(L,S){let q=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&q.__version!==L.version){O(q,L,S);return}else L.isExternalTexture&&(q.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,q.__webglTexture,i.TEXTURE0+S)}function Y(L,S){let q=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&q.__version!==L.version){O(q,L,S);return}t.bindTexture(i.TEXTURE_3D,q.__webglTexture,i.TEXTURE0+S)}function Q(L,S){let q=n.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&q.__version!==L.version){ee(q,L,S);return}t.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture,i.TEXTURE0+S)}let he={[Zi]:i.REPEAT,[Dn]:i.CLAMP_TO_EDGE,[gr]:i.MIRRORED_REPEAT},fe={[Ct]:i.NEAREST,[Mc]:i.NEAREST_MIPMAP_NEAREST,[ks]:i.NEAREST_MIPMAP_LINEAR,[Pt]:i.LINEAR,[Ir]:i.LINEAR_MIPMAP_NEAREST,[$n]:i.LINEAR_MIPMAP_LINEAR},Ge={[Cp]:i.NEVER,[Np]:i.ALWAYS,[Pp]:i.LESS,[al]:i.LEQUAL,[Ip]:i.EQUAL,[ol]:i.GEQUAL,[Lp]:i.GREATER,[Dp]:i.NOTEQUAL};function Te(L,S){if(S.type===un&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Pt||S.magFilter===Ir||S.magFilter===ks||S.magFilter===$n||S.minFilter===Pt||S.minFilter===Ir||S.minFilter===ks||S.minFilter===$n)&&Oe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(L,i.TEXTURE_WRAP_S,he[S.wrapS]),i.texParameteri(L,i.TEXTURE_WRAP_T,he[S.wrapT]),(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)&&i.texParameteri(L,i.TEXTURE_WRAP_R,he[S.wrapR]),i.texParameteri(L,i.TEXTURE_MAG_FILTER,fe[S.magFilter]),i.texParameteri(L,i.TEXTURE_MIN_FILTER,fe[S.minFilter]),S.compareFunction&&(i.texParameteri(L,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(L,i.TEXTURE_COMPARE_FUNC,Ge[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Ct||S.minFilter!==ks&&S.minFilter!==$n||S.type===un&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){let q=e.get("EXT_texture_filter_anisotropic");i.texParameterf(L,q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Fe(L,S){let q=!1;L.__webglInit===void 0&&(L.__webglInit=!0,S.addEventListener("dispose",w));let J=S.source,ne=d.get(J);ne===void 0&&(ne={},d.set(J,ne));let le=F(S);if(le!==L.__cacheKey){ne[le]===void 0&&(ne[le]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,q=!0),ne[le].usedTimes++;let de=ne[L.__cacheKey];de!==void 0&&(ne[L.__cacheKey].usedTimes--,de.usedTimes===0&&R(S)),L.__cacheKey=le,L.__webglTexture=ne[le].texture}return q}function k(L,S,q){return Math.floor(Math.floor(L/q)/S)}function $(L,S,q,J){let le=L.updateRanges;if(le.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,q,J,S.data);else{le.sort((Ue,xe)=>Ue.start-xe.start);let de=0;for(let Ue=1;Ue<le.length;Ue++){let xe=le[de],me=le[Ue],ke=xe.start+xe.count,He=k(me.start,S.width,4),Ye=k(xe.start,S.width,4);me.start<=ke+1&&He===Ye&&k(me.start+me.count-1,S.width,4)===He?xe.count=Math.max(xe.count,me.start+me.count-xe.start):(++de,le[de]=me)}le.length=de+1;let ie=t.getParameter(i.UNPACK_ROW_LENGTH),re=t.getParameter(i.UNPACK_SKIP_PIXELS),pe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let Ue=0,xe=le.length;Ue<xe;Ue++){let me=le[Ue],ke=Math.floor(me.start/4),He=Math.ceil(me.count/4),Ye=ke%S.width,G=Math.floor(ke/S.width),ge=He,se=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,Ye),t.pixelStorei(i.UNPACK_SKIP_ROWS,G),t.texSubImage2D(i.TEXTURE_2D,0,Ye,G,ge,se,q,J,S.data)}L.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,ie),t.pixelStorei(i.UNPACK_SKIP_PIXELS,re),t.pixelStorei(i.UNPACK_SKIP_ROWS,pe)}}function O(L,S,q){let J=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(J=i.TEXTURE_3D);let ne=Fe(L,S),le=S.source;t.bindTexture(J,L.__webglTexture,i.TEXTURE0+q);let de=n.get(le);if(le.version!==de.__version||ne===!0){if(t.activeTexture(i.TEXTURE0+q),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let se=Ze.getPrimaries(Ze.workingColorSpace),be=S.colorSpace===Ui?null:Ze.getPrimaries(S.colorSpace),Se=S.colorSpace===Ui||se===be?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se)}t.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment);let re=m(S.image,!1,s.maxTextureSize);re=$t(S,re);let pe=r.convert(S.format,S.colorSpace),Ue=r.convert(S.type),xe=_(S.internalFormat,pe,Ue,S.normalized,S.colorSpace,S.isVideoTexture);Te(J,S);let me,ke=S.mipmaps,He=S.isVideoTexture!==!0,Ye=de.__version===void 0||ne===!0,G=le.dataReady,ge=E(S,re);if(S.isDepthTexture)xe=M(S.format===is,S.type),Ye&&(He?t.texStorage2D(i.TEXTURE_2D,1,xe,re.width,re.height):t.texImage2D(i.TEXTURE_2D,0,xe,re.width,re.height,0,pe,Ue,null));else if(S.isDataTexture)if(ke.length>0){He&&Ye&&t.texStorage2D(i.TEXTURE_2D,ge,xe,ke[0].width,ke[0].height);for(let se=0,be=ke.length;se<be;se++)me=ke[se],He?G&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,me.width,me.height,pe,Ue,me.data):t.texImage2D(i.TEXTURE_2D,se,xe,me.width,me.height,0,pe,Ue,me.data);S.generateMipmaps=!1}else He?(Ye&&t.texStorage2D(i.TEXTURE_2D,ge,xe,re.width,re.height),G&&$(S,re,pe,Ue)):t.texImage2D(i.TEXTURE_2D,0,xe,re.width,re.height,0,pe,Ue,re.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){He&&Ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,xe,ke[0].width,ke[0].height,re.depth);for(let se=0,be=ke.length;se<be;se++)if(me=ke[se],S.format!==hn)if(pe!==null)if(He){if(G)if(S.layerUpdates.size>0){let Se=Sh(me.width,me.height,S.format,S.type);for(let ae of S.layerUpdates){let ze=me.data.subarray(ae*Se/me.data.BYTES_PER_ELEMENT,(ae+1)*Se/me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,ae,me.width,me.height,1,pe,ze)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,me.width,me.height,re.depth,pe,me.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,se,xe,me.width,me.height,re.depth,0,me.data,0,0);else Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else He?G&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,me.width,me.height,re.depth,pe,Ue,me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,se,xe,me.width,me.height,re.depth,0,pe,Ue,me.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{He&&Ye&&t.texStorage2D(i.TEXTURE_2D,ge,xe,ke[0].width,ke[0].height);for(let se=0,be=ke.length;se<be;se++)me=ke[se],S.format!==hn?pe!==null?He?G&&t.compressedTexSubImage2D(i.TEXTURE_2D,se,0,0,me.width,me.height,pe,me.data):t.compressedTexImage2D(i.TEXTURE_2D,se,xe,me.width,me.height,0,me.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):He?G&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,me.width,me.height,pe,Ue,me.data):t.texImage2D(i.TEXTURE_2D,se,xe,me.width,me.height,0,pe,Ue,me.data)}else if(S.isDataArrayTexture)if(He){if(Ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,xe,re.width,re.height,re.depth),G)if(S.layerUpdates.size>0){let se=Sh(re.width,re.height,S.format,S.type);for(let be of S.layerUpdates){let Se=re.data.subarray(be*se/re.data.BYTES_PER_ELEMENT,(be+1)*se/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,be,re.width,re.height,1,pe,Ue,Se)}S.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,pe,Ue,re.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,xe,re.width,re.height,re.depth,0,pe,Ue,re.data);else if(S.isData3DTexture)He?(Ye&&t.texStorage3D(i.TEXTURE_3D,ge,xe,re.width,re.height,re.depth),G&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,pe,Ue,re.data)):t.texImage3D(i.TEXTURE_3D,0,xe,re.width,re.height,re.depth,0,pe,Ue,re.data);else if(S.isFramebufferTexture){if(Ye)if(He)t.texStorage2D(i.TEXTURE_2D,ge,xe,re.width,re.height);else{let se=re.width,be=re.height;for(let Se=0;Se<ge;Se++)t.texImage2D(i.TEXTURE_2D,Se,xe,se,be,0,pe,Ue,null),se>>=1,be>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in i){let se=i.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),re.parentNode!==se){se.appendChild(re),h.add(S),se.onpaint=be=>{let Se=be.changedElements;for(let ae of h)Se.includes(ae.image)&&(ae.needsUpdate=!0)},se.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,re);else{let Se=i.RGBA,ae=i.RGBA,ze=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Se,ae,ze,re)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(ke.length>0){if(He&&Ye){let se=ut(ke[0]);t.texStorage2D(i.TEXTURE_2D,ge,xe,se.width,se.height)}for(let se=0,be=ke.length;se<be;se++)me=ke[se],He?G&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,pe,Ue,me):t.texImage2D(i.TEXTURE_2D,se,xe,pe,Ue,me);S.generateMipmaps=!1}else if(He){if(Ye){let se=ut(re);t.texStorage2D(i.TEXTURE_2D,ge,xe,se.width,se.height)}G&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,pe,Ue,re)}else t.texImage2D(i.TEXTURE_2D,0,xe,pe,Ue,re);p(S)&&y(J),de.__version=le.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function ee(L,S,q){if(S.image.length!==6)return;let J=Fe(L,S),ne=S.source;t.bindTexture(i.TEXTURE_CUBE_MAP,L.__webglTexture,i.TEXTURE0+q);let le=n.get(ne);if(ne.version!==le.__version||J===!0){t.activeTexture(i.TEXTURE0+q);let de=Ze.getPrimaries(Ze.workingColorSpace),ie=S.colorSpace===Ui?null:Ze.getPrimaries(S.colorSpace),re=S.colorSpace===Ui||de===ie?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,re);let pe=S.isCompressedTexture||S.image[0].isCompressedTexture,Ue=S.image[0]&&S.image[0].isDataTexture,xe=[];for(let ae=0;ae<6;ae++)!pe&&!Ue?xe[ae]=m(S.image[ae],!0,s.maxCubemapSize):xe[ae]=Ue?S.image[ae].image:S.image[ae],xe[ae]=$t(S,xe[ae]);let me=xe[0],ke=r.convert(S.format,S.colorSpace),He=r.convert(S.type),Ye=_(S.internalFormat,ke,He,S.normalized,S.colorSpace),G=S.isVideoTexture!==!0,ge=le.__version===void 0||J===!0,se=ne.dataReady,be=E(S,me);Te(i.TEXTURE_CUBE_MAP,S);let Se;if(pe){G&&ge&&t.texStorage2D(i.TEXTURE_CUBE_MAP,be,Ye,me.width,me.height);for(let ae=0;ae<6;ae++){Se=xe[ae].mipmaps;for(let ze=0;ze<Se.length;ze++){let De=Se[ze];S.format!==hn?ke!==null?G?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze,0,0,De.width,De.height,ke,De.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze,Ye,De.width,De.height,0,De.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):G?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze,0,0,De.width,De.height,ke,He,De.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze,Ye,De.width,De.height,0,ke,He,De.data)}}}else{if(Se=S.mipmaps,G&&ge){Se.length>0&&be++;let ae=ut(xe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,be,Ye,ae.width,ae.height)}for(let ae=0;ae<6;ae++)if(Ue){G?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,xe[ae].width,xe[ae].height,ke,He,xe[ae].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,Ye,xe[ae].width,xe[ae].height,0,ke,He,xe[ae].data);for(let ze=0;ze<Se.length;ze++){let bt=Se[ze].image[ae].image;G?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze+1,0,0,bt.width,bt.height,ke,He,bt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze+1,Ye,bt.width,bt.height,0,ke,He,bt.data)}}else{G?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,ke,He,xe[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,Ye,ke,He,xe[ae]);for(let ze=0;ze<Se.length;ze++){let De=Se[ze];G?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze+1,0,0,ke,He,De.image[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ze+1,Ye,ke,He,De.image[ae])}}}p(S)&&y(i.TEXTURE_CUBE_MAP),le.__version=ne.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function te(L,S,q,J,ne,le){let de=r.convert(q.format,q.colorSpace),ie=r.convert(q.type),re=_(q.internalFormat,de,ie,q.normalized,q.colorSpace),pe=n.get(S),Ue=n.get(q);if(Ue.__renderTarget=S,!pe.__hasExternalTextures){let xe=Math.max(1,S.width>>le),me=Math.max(1,S.height>>le);ne===i.TEXTURE_3D||ne===i.TEXTURE_2D_ARRAY?t.texImage3D(ne,le,re,xe,me,S.depth,0,de,ie,null):t.texImage2D(ne,le,re,xe,me,0,de,ie,null)}t.bindFramebuffer(i.FRAMEBUFFER,L),Dt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,ne,Ue.__webglTexture,0,yt(S)):(ne===i.TEXTURE_2D||ne>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,ne,Ue.__webglTexture,le),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ce(L,S,q){if(i.bindRenderbuffer(i.RENDERBUFFER,L),S.depthBuffer){let J=S.depthTexture,ne=J&&J.isDepthTexture?J.type:null,le=M(S.stencilBuffer,ne),de=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Dt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,yt(S),le,S.width,S.height):q?i.renderbufferStorageMultisample(i.RENDERBUFFER,yt(S),le,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,le,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,L)}else{let J=S.textures;for(let ne=0;ne<J.length;ne++){let le=J[ne],de=r.convert(le.format,le.colorSpace),ie=r.convert(le.type),re=_(le.internalFormat,de,ie,le.normalized,le.colorSpace);Dt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,yt(S),re,S.width,S.height):q?i.renderbufferStorageMultisample(i.RENDERBUFFER,yt(S),re,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,re,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ve(L,S,q){let J=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,L),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ne=n.get(S.depthTexture);if(ne.__renderTarget=S,(!ne.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),J){if(ne.__webglInit===void 0&&(ne.__webglInit=!0,S.depthTexture.addEventListener("dispose",w)),ne.__webglTexture===void 0){ne.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,ne.__webglTexture),Te(i.TEXTURE_CUBE_MAP,S.depthTexture);let pe=r.convert(S.depthTexture.format),Ue=r.convert(S.depthTexture.type),xe;S.depthTexture.format===oi?xe=i.DEPTH_COMPONENT24:S.depthTexture.format===is&&(xe=i.DEPTH24_STENCIL8);for(let me=0;me<6;me++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,xe,S.width,S.height,0,pe,Ue,null)}}else W(S.depthTexture,0);let le=ne.__webglTexture,de=yt(S),ie=J?i.TEXTURE_CUBE_MAP_POSITIVE_X+q:i.TEXTURE_2D,re=S.depthTexture.format===is?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(S.depthTexture.format===oi)Dt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,re,ie,le,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,re,ie,le,0);else if(S.depthTexture.format===is)Dt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,re,ie,le,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,re,ie,le,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function oe(L){let S=n.get(L),q=L.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==L.depthTexture){let J=L.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),J){let ne=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,J.removeEventListener("dispose",ne)};J.addEventListener("dispose",ne),S.__depthDisposeCallback=ne}S.__boundDepthTexture=J}if(L.depthTexture&&!S.__autoAllocateDepthBuffer)if(q)for(let J=0;J<6;J++)Ve(S.__webglFramebuffer[J],L,J);else{let J=L.texture.mipmaps;J&&J.length>0?Ve(S.__webglFramebuffer[0],L,0):Ve(S.__webglFramebuffer,L,0)}else if(q){S.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[J]),S.__webglDepthbuffer[J]===void 0)S.__webglDepthbuffer[J]=i.createRenderbuffer(),ce(S.__webglDepthbuffer[J],L,!1);else{let ne=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=S.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,le),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,le)}}else{let J=L.texture.mipmaps;if(J&&J.length>0?t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),ce(S.__webglDepthbuffer,L,!1);else{let ne=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,le),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,le)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ae(L,S,q){let J=n.get(L);S!==void 0&&te(J.__webglFramebuffer,L,L.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),q!==void 0&&oe(L)}function je(L){let S=L.texture,q=n.get(L),J=n.get(S);L.addEventListener("dispose",b);let ne=L.textures,le=L.isWebGLCubeRenderTarget===!0,de=ne.length>1;if(de||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=S.version,a.memory.textures++),le){q.__webglFramebuffer=[];for(let ie=0;ie<6;ie++)if(S.mipmaps&&S.mipmaps.length>0){q.__webglFramebuffer[ie]=[];for(let re=0;re<S.mipmaps.length;re++)q.__webglFramebuffer[ie][re]=i.createFramebuffer()}else q.__webglFramebuffer[ie]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){q.__webglFramebuffer=[];for(let ie=0;ie<S.mipmaps.length;ie++)q.__webglFramebuffer[ie]=i.createFramebuffer()}else q.__webglFramebuffer=i.createFramebuffer();if(de)for(let ie=0,re=ne.length;ie<re;ie++){let pe=n.get(ne[ie]);pe.__webglTexture===void 0&&(pe.__webglTexture=i.createTexture(),a.memory.textures++)}if(L.samples>0&&Dt(L)===!1){q.__webglMultisampledFramebuffer=i.createFramebuffer(),q.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,q.__webglMultisampledFramebuffer);for(let ie=0;ie<ne.length;ie++){let re=ne[ie];q.__webglColorRenderbuffer[ie]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,q.__webglColorRenderbuffer[ie]);let pe=r.convert(re.format,re.colorSpace),Ue=r.convert(re.type),xe=_(re.internalFormat,pe,Ue,re.normalized,re.colorSpace,L.isXRRenderTarget===!0),me=yt(L);i.renderbufferStorageMultisample(i.RENDERBUFFER,me,xe,L.width,L.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ie,i.RENDERBUFFER,q.__webglColorRenderbuffer[ie])}i.bindRenderbuffer(i.RENDERBUFFER,null),L.depthBuffer&&(q.__webglDepthRenderbuffer=i.createRenderbuffer(),ce(q.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(le){t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Te(i.TEXTURE_CUBE_MAP,S);for(let ie=0;ie<6;ie++)if(S.mipmaps&&S.mipmaps.length>0)for(let re=0;re<S.mipmaps.length;re++)te(q.__webglFramebuffer[ie][re],L,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,re);else te(q.__webglFramebuffer[ie],L,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0);p(S)&&y(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let ie=0,re=ne.length;ie<re;ie++){let pe=ne[ie],Ue=n.get(pe),xe=i.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(xe=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(xe,Ue.__webglTexture),Te(xe,pe),te(q.__webglFramebuffer,L,pe,i.COLOR_ATTACHMENT0+ie,xe,0),p(pe)&&y(xe)}t.unbindTexture()}else{let ie=i.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(ie=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ie,J.__webglTexture),Te(ie,S),S.mipmaps&&S.mipmaps.length>0)for(let re=0;re<S.mipmaps.length;re++)te(q.__webglFramebuffer[re],L,S,i.COLOR_ATTACHMENT0,ie,re);else te(q.__webglFramebuffer,L,S,i.COLOR_ATTACHMENT0,ie,0);p(S)&&y(ie),t.unbindTexture()}L.depthBuffer&&oe(L)}function Ee(L){let S=L.textures;for(let q=0,J=S.length;q<J;q++){let ne=S[q];if(p(ne)){let le=v(L),de=n.get(ne).__webglTexture;t.bindTexture(le,de),y(le),t.unbindTexture()}}}let rt=[],wt=[];function Zt(L){if(L.samples>0){if(Dt(L)===!1){let S=L.textures,q=L.width,J=L.height,ne=i.COLOR_BUFFER_BIT,le=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=n.get(L),ie=S.length>1;if(ie)for(let pe=0;pe<S.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);let re=L.texture.mipmaps;re&&re.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let pe=0;pe<S.length;pe++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(ne|=i.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(ne|=i.STENCIL_BUFFER_BIT)),ie){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,de.__webglColorRenderbuffer[pe]);let Ue=n.get(S[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ue,0)}i.blitFramebuffer(0,0,q,J,0,0,q,J,ne,i.NEAREST),l===!0&&(rt.length=0,wt.length=0,rt.push(i.COLOR_ATTACHMENT0+pe),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&(rt.push(le),wt.push(le),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,wt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,rt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ie)for(let pe=0;pe<S.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,de.__webglColorRenderbuffer[pe]);let Ue=n.get(S[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,Ue,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&l){let S=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function yt(L){return Math.min(s.maxSamples,L.samples)}function Dt(L){let S=n.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function H(L){let S=a.render.frame;u.get(L)!==S&&(u.set(L,S),L.update())}function $t(L,S){let q=L.colorSpace,J=L.format,ne=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||q!==fn&&q!==Ui&&(Ze.getTransfer(q)===lt?(J!==hn||ne!==vn)&&Oe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):qe("WebGLTextures: Unsupported texture color space:",q)),S}function ut(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(c.width=L.naturalWidth||L.width,c.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(c.width=L.displayWidth,c.height=L.displayHeight):(c.width=L.width,c.height=L.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=I,this.getTextureUnits=C,this.setTextureUnits=N,this.setTexture2D=W,this.setTexture2DArray=V,this.setTexture3D=Y,this.setTextureCube=Q,this.rebindTextures=Ae,this.setupRenderTarget=je,this.updateRenderTargetMipmap=Ee,this.updateMultisampleRenderTarget=Zt,this.setupDepthRenderbuffer=oe,this.setupFrameBufferTexture=te,this.useMultisampledRTT=Dt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function uS(i,e){function t(n,s=Ui){let r,a=Ze.getTransfer(s);if(n===vn)return i.UNSIGNED_BYTE;if(n===wc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ec)return i.UNSIGNED_SHORT_5_5_5_1;if(n===uh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===hh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===ch)return i.BYTE;if(n===lh)return i.SHORT;if(n===Lr)return i.UNSIGNED_SHORT;if(n===Sc)return i.INT;if(n===Un)return i.UNSIGNED_INT;if(n===un)return i.FLOAT;if(n===Qn)return i.HALF_FLOAT;if(n===fh)return i.ALPHA;if(n===dh)return i.RGB;if(n===hn)return i.RGBA;if(n===oi)return i.DEPTH_COMPONENT;if(n===is)return i.DEPTH_STENCIL;if(n===Tc)return i.RED;if(n===za)return i.RED_INTEGER;if(n===ss)return i.RG;if(n===Ac)return i.RG_INTEGER;if(n===Rc)return i.RGBA_INTEGER;if(n===Ga||n===Ha||n===Va||n===Wa)if(a===lt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ga)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ha)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Va)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Wa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ga)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ha)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Va)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Wa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Cc||n===Pc||n===Ic||n===Lc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Cc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Pc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ic)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Lc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Dc||n===Nc||n===Fc||n===Oc||n===Uc||n===qa||n===kc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Dc||n===Nc)return a===lt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Fc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Oc)return r.COMPRESSED_R11_EAC;if(n===Uc)return r.COMPRESSED_SIGNED_R11_EAC;if(n===qa)return r.COMPRESSED_RG11_EAC;if(n===kc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Bc||n===zc||n===Gc||n===Hc||n===Vc||n===Wc||n===qc||n===Xc||n===jc||n===Kc||n===Yc||n===Jc||n===Zc||n===$c)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Bc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===zc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Gc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Hc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Vc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Wc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===qc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Xc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===jc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Kc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Yc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Jc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Zc)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===$c)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Qc||n===el||n===tl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Qc)return a===lt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===el)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===tl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===nl||n===il||n===Xa||n===sl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===nl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===il)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Xa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===sl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Dr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var hS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fS=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Uh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ta(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new En({vertexShader:hS,fragmentShader:fS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new It(new Cs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},kh=class extends Jn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,g=null,x=typeof XRWebGLBinding<"u",m=new Uh,p={},y=t.getContextAttributes(),v=null,_=null,M=[],E=[],w=new Ke,b=null,T=null,R=new Wt;R.viewport=new ft;let P=new Wt;P.viewport=new ft;let D=[R,P],I=new gc,C=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let $=M[k];return $===void 0&&($=new vr,M[k]=$),$.getTargetRaySpace()},this.getControllerGrip=function(k){let $=M[k];return $===void 0&&($=new vr,M[k]=$),$.getGripSpace()},this.getHand=function(k){let $=M[k];return $===void 0&&($=new vr,M[k]=$),$.getHandSpace()};function z(k){let $=E.indexOf(k.inputSource);if($===-1)return;let O=M[$];O!==void 0&&(O.update(k.inputSource,k.frame,c||a),O.dispatchEvent({type:k.type,data:k.inputSource}))}function F(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",F),s.removeEventListener("inputsourceschange",W);for(let k=0;k<M.length;k++){let $=E[k];$!==null&&(E[k]=null,M[k].disconnect($))}C=null,N=null,m.reset();for(let k in p)delete p[k];if(e.setRenderTarget(v),d=null,f=null,h=null,s=null,_=null,Fe.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(w.width,w.height,!1),T!==null){let k=T.camera;k.fov=T.fov,k.zoom=T.zoom,k.updateProjectionMatrix(),T=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){r=k,n.isPresenting===!0&&Oe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){o=k,n.isPresenting===!0&&Oe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(k){c=k},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(k){if(s=k,s!==null){if(v=e.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",F),s.addEventListener("inputsourceschange",W),y.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(w),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let O=null,ee=null,te=null;y.depth&&(te=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,O=y.stencil?is:oi,ee=y.stencil?Dr:Un);let ce={colorFormat:t.RGBA8,depthFormat:te,scaleFactor:r};h=this.getBinding(),f=h.createProjectionLayer(ce),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),_=new xn(f.textureWidth,f.textureHeight,{format:hn,type:vn,depthTexture:new $i(f.textureWidth,f.textureHeight,ee,void 0,void 0,void 0,void 0,void 0,void 0,O),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let O={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,O),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new xn(d.framebufferWidth,d.framebufferHeight,{format:hn,type:vn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Fe.setContext(s),Fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function W(k){for(let $=0;$<k.removed.length;$++){let O=k.removed[$],ee=E.indexOf(O);ee>=0&&(E[ee]=null,M[ee].disconnect(O))}for(let $=0;$<k.added.length;$++){let O=k.added[$],ee=E.indexOf(O);if(ee===-1){for(let ce=0;ce<M.length;ce++)if(ce>=E.length){E.push(O),ee=ce;break}else if(E[ce]===null){E[ce]=O,ee=ce;break}if(ee===-1)break}let te=M[ee];te&&te.connect(O)}}let V=new U,Y=new U;function Q(k,$,O){V.setFromMatrixPosition($.matrixWorld),Y.setFromMatrixPosition(O.matrixWorld);let ee=V.distanceTo(Y),te=$.projectionMatrix.elements,ce=O.projectionMatrix.elements,Ve=te[14]/(te[10]-1),oe=te[14]/(te[10]+1),Ae=(te[9]+1)/te[5],je=(te[9]-1)/te[5],Ee=(te[8]-1)/te[0],rt=(ce[8]+1)/ce[0],wt=Ve*Ee,Zt=Ve*rt,yt=ee/(-Ee+rt),Dt=yt*-Ee;if($.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(Dt),k.translateZ(yt),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),te[10]===-1)k.projectionMatrix.copy($.projectionMatrix),k.projectionMatrixInverse.copy($.projectionMatrixInverse);else{let H=Ve+yt,$t=oe+yt,ut=wt-Dt,L=Zt+(ee-Dt),S=Ae*oe/$t*H,q=je*oe/$t*H;k.projectionMatrix.makePerspective(ut,L,S,q,H,$t),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function he(k,$){$===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices($.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(s===null)return;let $=k.near,O=k.far;m.texture!==null&&(m.depthNear>0&&($=m.depthNear),m.depthFar>0&&(O=m.depthFar)),I.near=P.near=R.near=$,I.far=P.far=R.far=O,(C!==I.near||N!==I.far)&&(s.updateRenderState({depthNear:I.near,depthFar:I.far}),C=I.near,N=I.far),I.layers.mask=k.layers.mask|6,R.layers.mask=I.layers.mask&-5,P.layers.mask=I.layers.mask&-3;let ee=k.parent,te=I.cameras;he(I,ee);for(let ce=0;ce<te.length;ce++)he(te[ce],ee);te.length===2?Q(I,R,P):I.projectionMatrix.copy(R.projectionMatrix),T===null&&k.isPerspectiveCamera&&(T={camera:k,fov:k.fov,zoom:k.zoom}),fe(k,I,ee)};function fe(k,$,O){O===null?k.matrix.copy($.matrixWorld):(k.matrix.copy(O.matrixWorld),k.matrix.invert(),k.matrix.multiply($.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy($.projectionMatrix),k.projectionMatrixInverse.copy($.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=Ms*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(k){l=k,f!==null&&(f.fixedFoveation=k),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=k)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(I)},this.getCameraTexture=function(k){return p[k]};let Ge=null;function Te(k,$){if(u=$.getViewerPose(c||a),g=$,u!==null){let O=u.views;d!==null&&(e.setRenderTargetFramebuffer(_,d.framebuffer),e.setRenderTarget(_));let ee=!1;O.length!==I.cameras.length&&(I.cameras.length=0,ee=!0);for(let oe=0;oe<O.length;oe++){let Ae=O[oe],je=null;if(d!==null)je=d.getViewport(Ae);else{let rt=h.getViewSubImage(f,Ae);je=rt.viewport,oe===0&&(e.setRenderTargetTextures(_,rt.colorTexture,rt.depthStencilTexture),e.setRenderTarget(_))}let Ee=D[oe];Ee===void 0&&(Ee=new Wt,Ee.layers.enable(oe),Ee.viewport=new ft,D[oe]=Ee),Ee.matrix.fromArray(Ae.transform.matrix),Ee.matrix.decompose(Ee.position,Ee.quaternion,Ee.scale),Ee.projectionMatrix.fromArray(Ae.projectionMatrix),Ee.projectionMatrixInverse.copy(Ee.projectionMatrix).invert(),Ee.viewport.set(je.x,je.y,je.width,je.height),oe===0&&(I.matrix.copy(Ee.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),ee===!0&&I.cameras.push(Ee)}let te=s.enabledFeatures;if(te&&te.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=n.getBinding();let oe=h.getDepthInformation(O[0]);oe&&oe.isValid&&oe.texture&&m.init(oe,s.renderState)}if(te&&te.includes("camera-access")&&x){e.state.unbindTexture(),h=n.getBinding();for(let oe=0;oe<O.length;oe++){let Ae=O[oe].camera;if(Ae){let je=p[Ae];je||(je=new Ta,p[Ae]=je);let Ee=h.getCameraImage(Ae);je.sourceTexture=Ee}}}}for(let O=0;O<M.length;O++){let ee=E[O],te=M[O];ee!==null&&te!==void 0&&te.update(ee,$,c||a)}Ge&&Ge(k,$),$.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:$}),g=null}let Fe=new dm;Fe.setAnimationLoop(Te),this.setAnimationLoop=function(k){Ge=k},this.dispose=function(){}}},dS=new Me,_m=new Xe;_m.set(-1,0,0,0,1,0,0,0,1);function pS(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,yh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,y,v,_){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,_)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,y,v):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===gn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===gn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let y=e.get(p),v=y.envMap,_=y.envMapRotation;v&&(m.envMap.value=v,m.envMapRotation.value.setFromMatrix4(dS.makeRotationFromEuler(_)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(_m),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,y,v){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=v*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===gn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){let y=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function mS(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,M){let E=M.program;n.uniformBlockBinding(_,E)}function c(_,M){let E=s[_.id];E===void 0&&(m(_),E=u(_),s[_.id]=E,_.addEventListener("dispose",y));let w=M.program;n.updateUBOMapping(_,w);let b=e.render.frame;r[_.id]!==b&&(f(_),r[_.id]=b)}function u(_){let M=h();_.__bindingPointIndex=M;let E=i.createBuffer(),w=_.__size,b=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,w,b),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,E),E}function h(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){let M=s[_.id],E=_.uniforms,w=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let b=0,T=E.length;b<T;b++){let R=E[b];if(Array.isArray(R))for(let P=0,D=R.length;P<D;P++)d(R[P],b,P,w);else d(R,b,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(_,M,E,w){if(x(_,M,E,w)===!0){let b=_.__offset,T=_.value;if(Array.isArray(T)){let R=0;for(let P=0;P<T.length;P++){let D=T[P],I=p(D);g(D,_.__data,R),typeof D!="number"&&typeof D!="boolean"&&!D.isMatrix3&&!ArrayBuffer.isView(D)&&(R+=I.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,_.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,b,_.__data)}}function g(_,M,E){typeof _=="number"||typeof _=="boolean"?M[0]=_:_.isMatrix3?(M[0]=_.elements[0],M[1]=_.elements[1],M[2]=_.elements[2],M[3]=0,M[4]=_.elements[3],M[5]=_.elements[4],M[6]=_.elements[5],M[7]=0,M[8]=_.elements[6],M[9]=_.elements[7],M[10]=_.elements[8],M[11]=0):ArrayBuffer.isView(_)?M.set(new _.constructor(_.buffer,_.byteOffset,M.length)):_.toArray(M,E)}function x(_,M,E,w){let b=_.value,T=M+"_"+E;if(w[T]===void 0)return typeof b=="number"||typeof b=="boolean"?w[T]=b:ArrayBuffer.isView(b)?w[T]=b.slice():w[T]=b.clone(),!0;{let R=w[T];if(typeof b=="number"||typeof b=="boolean"){if(R!==b)return w[T]=b,!0}else{if(ArrayBuffer.isView(b))return!0;if(R.equals(b)===!1)return R.copy(b),!0}}return!1}function m(_){let M=_.uniforms,E=0,w=16;for(let T=0,R=M.length;T<R;T++){let P=Array.isArray(M[T])?M[T]:[M[T]];for(let D=0,I=P.length;D<I;D++){let C=P[D],N=Array.isArray(C.value)?C.value:[C.value];for(let z=0,F=N.length;z<F;z++){let W=N[z],V=p(W),Y=E%w,Q=Y%V.boundary,he=Y+Q;E+=Q,he!==0&&w-he<V.storage&&(E+=w-he),C.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),C.__offset=E,E+=V.storage}}}let b=E%w;return b>0&&(E+=w-b),_.__size=E,_.__cache={},this}function p(_){let M={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(M.boundary=4,M.storage=4):_.isVector2?(M.boundary=8,M.storage=8):_.isVector3||_.isColor?(M.boundary=16,M.storage=12):_.isVector4?(M.boundary=16,M.storage=16):_.isMatrix3?(M.boundary=48,M.storage=48):_.isMatrix4?(M.boundary=64,M.storage=64):_.isTexture?Oe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(M.boundary=16,M.storage=_.byteLength):Oe("WebGLRenderer: Unsupported uniform value type.",_),M}function y(_){let M=_.target;M.removeEventListener("dispose",y);let E=a.indexOf(M.__bindingPointIndex);a.splice(E,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function v(){for(let _ in s)i.deleteBuffer(s[_]);a=[],s={},r={}}return{bind:l,update:c,dispose:v}}var gS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),di=null;function bS(){return di===null&&(di=new Pi(gS,16,16,ss,Qn),di.name="DFG_LUT",di.minFilter=Pt,di.magFilter=Pt,di.wrapS=Dn,di.wrapT=Dn,di.generateMipmaps=!1,di.needsUpdate=!0),di}var fl=class{constructor(e={}){let{canvas:t=Op(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1,outputBufferType:d=vn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let x=d,m=new Set([Rc,Ac,za]),p=new Set([vn,Un,Lr,Dr,wc,Ec]),y=new Uint32Array(4),v=new Int32Array(4),_=new U,M=null,E=null,w=[],b=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Tn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,P=!1,D=null,I=null,C=null,N=null;this._outputColorSpace=Et;let z=0,F=0,W=null,V=-1,Y=null,Q=new ft,he=new ft,fe=null,Ge=new ue(0),Te=0,Fe=t.width,k=t.height,$=1,O=null,ee=null,te=new ft(0,0,Fe,k),ce=new ft(0,0,Fe,k),Ve=!1,oe=new Ii,Ae=!1,je=!1,Ee=new Me,rt=new U,wt=new ft,Zt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},yt=!1;function Dt(){return W===null?$:1}let H=n;function $t(A,B){return t.getContext(A,B)}let ut,L,S,q,J,ne,le,de,ie,re,pe,Ue,xe,me,ke,He,Ye,G,ge,se,be,Se,ae;try{let A={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",bt,!1),t.addEventListener("webglcontextrestored",ot,!1),t.addEventListener("webglcontextcreationerror",zn,!1),H===null){let B="webgl2";if(H=$t(B,A),H===null)throw $t(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ze()}catch(A){throw t.removeEventListener("webglcontextlost",bt,!1),t.removeEventListener("webglcontextrestored",ot,!1),t.removeEventListener("webglcontextcreationerror",zn,!1),qe("WebGLRenderer: "+A.message),A}function ze(){ut=new wv(H),ut.init(),be=new uS(H,ut),L=new pv(H,ut,e,be),S=new cS(H,ut),L.reversedDepthBuffer&&f&&S.buffers.depth.setReversed(!0),I=H.createFramebuffer(),C=H.createFramebuffer(),N=H.createFramebuffer(),q=new Av(H),J=new KM,ne=new lS(H,ut,S,J,L,be,q),le=new Sv(R),de=new Cx(H),Se=new fv(H,de),ie=new Ev(H,de,q,Se),re=new Cv(H,ie,de,Se,q),G=new Rv(H,L,ne),ke=new mv(J),pe=new jM(R,le,ut,L,Se,ke),Ue=new pS(R,J),xe=new JM,me=new nS(ut),Ye=new hv(R,le,S,re,g,l),He=new oS(R,re,L),ae=new mS(H,q,L,S),ge=new dv(H,ut,q),se=new Tv(H,ut,q),q.programs=pe.programs,R.capabilities=L,R.extensions=ut,R.properties=J,R.renderLists=xe,R.shadowMap=He,R.state=S,R.info=q}x!==vn&&(T=new Iv(x,t.width,t.height,o,s,r));let De=new kh(R,H);this.xr=De,this.getContext=function(){return H},this.getContextAttributes=function(){return H.getContextAttributes()},this.forceContextLoss=function(){let A=ut.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=ut.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(A){A!==void 0&&($=A,this.setSize(Fe,k,!1))},this.getSize=function(A){return A.set(Fe,k)},this.setSize=function(A,B,Z=!0){if(De.isPresenting){Oe("WebGLRenderer: Can't change size while VR device is presenting.");return}Fe=A,k=B,t.width=Math.floor(A*$),t.height=Math.floor(B*$),Z===!0&&(t.style.width=A+"px",t.style.height=B+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,A,B)},this.getDrawingBufferSize=function(A){return A.set(Fe*$,k*$).floor()},this.setDrawingBufferSize=function(A,B,Z){Fe=A,k=B,$=Z,t.width=Math.floor(A*Z),t.height=Math.floor(B*Z),this.setViewport(0,0,A,B)},this.setEffects=function(A){if(x===vn){qe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let B=0;B<A.length;B++)if(A[B].isOutputPass===!0){Oe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(Q)},this.getViewport=function(A){return A.copy(te)},this.setViewport=function(A,B,Z,j){A.isVector4?te.set(A.x,A.y,A.z,A.w):te.set(A,B,Z,j),S.viewport(Q.copy(te).multiplyScalar($).round())},this.getScissor=function(A){return A.copy(ce)},this.setScissor=function(A,B,Z,j){A.isVector4?ce.set(A.x,A.y,A.z,A.w):ce.set(A,B,Z,j),S.scissor(he.copy(ce).multiplyScalar($).round())},this.getScissorTest=function(){return Ve},this.setScissorTest=function(A){S.setScissorTest(Ve=A)},this.setOpaqueSort=function(A){O=A},this.setTransparentSort=function(A){ee=A},this.getClearColor=function(A){return A.copy(Ye.getClearColor())},this.setClearColor=function(){Ye.setClearColor(...arguments)},this.getClearAlpha=function(){return Ye.getClearAlpha()},this.setClearAlpha=function(){Ye.setClearAlpha(...arguments)},this.clear=function(A=!0,B=!0,Z=!0){let j=0;if(A){let K=!1;if(W!==null){let ve=W.texture.format;K=m.has(ve)}if(K){let ve=W.texture.type,Ce=p.has(ve),ye=Ye.getClearColor(),Ie=Ye.getClearAlpha(),Ne=ye.r,Je=ye.g,tt=ye.b;Ce?(y[0]=Ne,y[1]=Je,y[2]=tt,y[3]=Ie,H.clearBufferuiv(H.COLOR,0,y)):(v[0]=Ne,v[1]=Je,v[2]=tt,v[3]=Ie,H.clearBufferiv(H.COLOR,0,v))}else j|=H.COLOR_BUFFER_BIT}B&&(j|=H.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(j|=H.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),j!==0&&H.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),D=A},this.dispose=function(){t.removeEventListener("webglcontextlost",bt,!1),t.removeEventListener("webglcontextrestored",ot,!1),t.removeEventListener("webglcontextcreationerror",zn,!1),Ye.dispose(),xe.dispose(),me.dispose(),J.dispose(),le.dispose(),re.dispose(),Se.dispose(),ae.dispose(),pe.dispose(),De.dispose(),De.removeEventListener("sessionstart",Uf),De.removeEventListener("sessionend",kf),cs.stop()};function bt(A){A.preventDefault(),ba("WebGLRenderer: Context Lost."),P=!0}function ot(){ba("WebGLRenderer: Context Restored."),P=!1;let A=q.autoReset,B=He.enabled,Z=He.autoUpdate,j=He.needsUpdate,K=He.type;ze(),q.autoReset=A,He.enabled=B,He.autoUpdate=Z,He.needsUpdate=j,He.type=K}function zn(A){qe("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function ti(A){let B=A.target;B.removeEventListener("dispose",ti),Qg(B)}function Qg(A){e0(A),J.remove(A)}function e0(A){let B=J.get(A).programs;B!==void 0&&(B.forEach(function(Z){pe.releaseProgram(Z)}),A.isShaderMaterial&&pe.releaseShaderCache(A))}this.renderBufferDirect=function(A,B,Z,j,K,ve){B===null&&(B=Zt);let Ce=K.isMesh&&K.matrixWorld.determinantAffine()<0,ye=i0(A,B,Z,j,K);S.setMaterial(j,Ce);let Ie=Z.index,Ne=1;if(j.wireframe===!0){if(Ie=ie.getWireframeAttribute(Z),Ie===void 0)return;Ne=2}let Je=Z.drawRange,tt=Z.attributes.position,Le=Je.start*Ne,ct=(Je.start+Je.count)*Ne;ve!==null&&(Le=Math.max(Le,ve.start*Ne),ct=Math.min(ct,(ve.start+ve.count)*Ne)),Ie!==null?(Le=Math.max(Le,0),ct=Math.min(ct,Ie.count)):tt!=null&&(Le=Math.max(Le,0),ct=Math.min(ct,tt.count));let Nt=ct-Le;if(Nt<0||Nt===1/0)return;Se.setup(K,j,ye,Z,Ie);let vt,gt=ge;if(Ie!==null&&(vt=de.get(Ie),gt=se,gt.setIndex(vt)),K.isMesh)j.wireframe===!0?(S.setLineWidth(j.wireframeLinewidth*Dt()),gt.setMode(H.LINES)):gt.setMode(H.TRIANGLES);else if(K.isLine){let Qt=j.linewidth;Qt===void 0&&(Qt=1),S.setLineWidth(Qt*Dt()),K.isLineSegments?gt.setMode(H.LINES):K.isLineLoop?gt.setMode(H.LINE_LOOP):gt.setMode(H.LINE_STRIP)}else K.isPoints?gt.setMode(H.POINTS):K.isSprite&&gt.setMode(H.TRIANGLES);if(K.isBatchedMesh)if(ut.get("WEBGL_multi_draw"))gt.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{let Qt=K._multiDrawStarts,Re=K._multiDrawCounts,on=K._multiDrawCount,at=Ie?de.get(Ie).bytesPerElement:1,An=J.get(j).currentProgram.getUniforms();for(let ni=0;ni<on;ni++)An.setValue(H,"_gl_DrawID",ni),gt.render(Qt[ni]/at,Re[ni])}else if(K.isInstancedMesh)gt.renderInstances(Le,Nt,K.count);else if(Z.isInstancedBufferGeometry){let Qt=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Re=Math.min(Z.instanceCount,Qt);gt.renderInstances(Le,Nt,Re)}else gt.render(Le,Nt)};function Of(A,B,Z,j){D!==null&&A.isNodeMaterial&&D.setObject(j,A),Ae===!0&&ke.setState(A,Z,!1),A.transparent===!0&&A.side===On&&A.forceSinglePass===!1?(A.side=gn,A.needsUpdate=!0,lo(A,B,j),A.side=hi,A.needsUpdate=!0,lo(A,B,j),A.side=On):lo(A,B,j)}this.compile=function(A,B,Z=null){Z===null&&(Z=A),D!==null&&D.renderStart(A,B,Z),E=me.get(Z),E.init(B),b.push(E),Z.traverseVisible(function(K){K.isLight&&K.layers.test(B.layers)&&(E.pushLight(K),K.castShadow&&E.pushShadow(K))}),A!==Z&&A.traverseVisible(function(K){K.isLight&&K.layers.test(B.layers)&&(E.pushLight(K),K.castShadow&&E.pushShadow(K))}),E.setupLights(),D!==null&&D.updateLights(E.state.lightsArray),je=this.localClippingEnabled,Ae=ke.init(this.clippingPlanes,je),Ae===!0&&ke.setGlobalState(this.clippingPlanes,B),D!==null&&He.render(E.state.shadowsArray,Z,B);let j=new Set;return A.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;let ve=K.material;if(ve)if(Array.isArray(ve))for(let Ce=0;Ce<ve.length;Ce++){let ye=ve[Ce];Of(ye,Z,B,K),j.add(ye)}else Of(ve,Z,B,K),j.add(ve)}),E=b.pop(),D!==null&&D.renderEnd(),j},this.compileAsync=function(A,B,Z=null){let j=this.compile(A,B,Z);return new Promise(K=>{function ve(){if(j.forEach(function(Ce){let Ie=J.get(Ce).currentProgram;(Ie===void 0||Ie.isReady())&&j.delete(Ce)}),j.size===0){K(A);return}setTimeout(ve,10)}ut.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let Wl=null;function t0(A){Wl&&Wl(A)}function Uf(){cs.stop()}function kf(){cs.start()}let cs=new dm;cs.setAnimationLoop(t0),typeof self<"u"&&cs.setContext(self),this.setAnimationLoop=function(A){Wl=A,De.setAnimationLoop(A),A===null?cs.stop():cs.start()},De.addEventListener("sessionstart",Uf),De.addEventListener("sessionend",kf),this.render=function(A,B){if(B!==void 0&&B.isCamera!==!0){qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;D!==null&&D.renderStart(A,B);let Z=De.enabled===!0&&De.isPresenting===!0,j=T!==null&&(W===null||Z)&&T.begin(R,W);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),De.enabled===!0&&De.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(De.cameraAutoUpdate===!0&&De.updateCamera(B),B=De.getCamera()),A.isScene===!0&&A.onBeforeRender(R,A,B,W),E=me.get(A,b.length),E.init(B),E.state.textureUnits=ne.getTextureUnits(),b.push(E),Ee.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),oe.setFromProjectionMatrix(Ee,Nn,B.reversedDepth),je=this.localClippingEnabled,Ae=ke.init(this.clippingPlanes,je),M=xe.get(A,w.length),M.init(),w.push(M),De.enabled===!0&&De.isPresenting===!0){let Ce=R.xr.getDepthSensingMesh();Ce!==null&&ql(Ce,B,-1/0,R.sortObjects)}ql(A,B,0,R.sortObjects),M.finish(),D!==null&&D.updateLights(E.state.lightsArray),R.sortObjects===!0&&M.sort(O,ee),yt=De.enabled===!1||De.isPresenting===!1||De.hasDepthSensing()===!1,yt&&Ye.addToRenderList(M,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ae===!0&&ke.beginShadows();let K=E.state.shadowsArray;if(He.render(K,A,B),Ae===!0&&ke.endShadows(),(j&&T.hasRenderPass())===!1){let Ce=M.opaque,ye=M.transmissive;if(E.setupLights(),B.isArrayCamera){let Ie=B.cameras;if(ye.length>0)for(let Ne=0,Je=Ie.length;Ne<Je;Ne++){let tt=Ie[Ne];zf(Ce,ye,A,tt)}yt&&Ye.render(A);for(let Ne=0,Je=Ie.length;Ne<Je;Ne++){let tt=Ie[Ne];Bf(M,A,tt,tt.viewport)}}else ye.length>0&&zf(Ce,ye,A,B),yt&&Ye.render(A),Bf(M,A,B)}W!==null&&F===0&&(ne.updateMultisampleRenderTarget(W),ne.updateRenderTargetMipmap(W)),j&&T.end(R),A.isScene===!0&&A.onAfterRender(R,A,B),Se.resetDefaultState(),V=-1,Y=null,b.pop(),b.length>0?(E=b[b.length-1],ne.setTextureUnits(E.state.textureUnits),Ae===!0&&ke.setGlobalState(R.clippingPlanes,E.state.camera)):E=null,w.pop(),w.length>0?M=w[w.length-1]:M=null,D!==null&&D.renderEnd()};function ql(A,B,Z,j){if(A.visible===!1)return;if(A.layers.test(B.layers)){if(A.isGroup)Z=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(B);else if(A.isLightProbeGrid)E.pushLightProbeGrid(A);else if(A.isLight)E.pushLight(A),A.castShadow&&E.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||A.intersectsFrustum(oe)){j&&wt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Ee);let Ce=re.update(A),ye=A.material;ye.visible&&M.push(A,Ce,ye,Z,wt.z,null,B)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||A.intersectsFrustum(oe))){let Ce=re.update(A),ye=A.material;if(j&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),wt.copy(A.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),wt.copy(Ce.boundingSphere.center)),wt.applyMatrix4(A.matrixWorld).applyMatrix4(Ee)),Array.isArray(ye)){let Ie=Ce.groups;for(let Ne=0,Je=Ie.length;Ne<Je;Ne++){let tt=Ie[Ne],Le=ye[tt.materialIndex];Le&&Le.visible&&M.push(A,Ce,Le,Z,wt.z,tt,B)}}else ye.visible&&M.push(A,Ce,ye,Z,wt.z,null,B)}}let ve=A.children;for(let Ce=0,ye=ve.length;Ce<ye;Ce++)ql(ve[Ce],B,Z,j)}function Bf(A,B,Z,j){let{opaque:K,transmissive:ve,transparent:Ce}=A;E.setupLightsView(Z),Ae===!0&&ke.setGlobalState(R.clippingPlanes,Z),j&&S.viewport(Q.copy(j)),K.length>0&&co(K,B,Z),ve.length>0&&co(ve,B,Z),Ce.length>0&&co(Ce,B,Z),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function zf(A,B,Z,j){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[j.id]===void 0){let Le=ut.has("EXT_color_buffer_half_float")||ut.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[j.id]=new xn(1,1,{generateMipmaps:!0,type:Le?Qn:vn,minFilter:$n,samples:Math.max(4,L.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ze.workingColorSpace})}let ve=E.state.transmissionRenderTarget[j.id],Ce=j.viewport||Q;ve.setSize(Ce.z*R.transmissionResolutionScale,Ce.w*R.transmissionResolutionScale);let ye=R.getRenderTarget(),Ie=R.getActiveCubeFace(),Ne=R.getActiveMipmapLevel();R.setRenderTarget(ve),R.getClearColor(Ge),Te=R.getClearAlpha(),Te<1&&R.setClearColor(16777215,.5),R.clear(),yt&&Ye.render(Z);let Je=R.toneMapping;R.toneMapping=Tn;let tt=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),E.setupLightsView(j),Ae===!0&&ke.setGlobalState(R.clippingPlanes,j),co(A,Z,j),ne.updateMultisampleRenderTarget(ve),ne.updateRenderTargetMipmap(ve),ut.has("WEBGL_multisampled_render_to_texture")===!1){let Le=!1;for(let ct=0,Nt=B.length;ct<Nt;ct++){let vt=B[ct],{object:gt,geometry:Qt,material:Re,group:on}=vt;if(Re.side===On&&gt.layers.test(j.layers)){let at=Re.side;Re.side=gn,Re.needsUpdate=!0,Gf(gt,Z,j,Qt,Re,on),Re.side=at,Re.needsUpdate=!0,Le=!0}}Le===!0&&(ne.updateMultisampleRenderTarget(ve),ne.updateRenderTargetMipmap(ve))}R.setRenderTarget(ye,Ie,Ne),R.setClearColor(Ge,Te),tt!==void 0&&(j.viewport=tt),R.toneMapping=Je}function co(A,B,Z){let j=B.isScene===!0?B.overrideMaterial:null;for(let K=0,ve=A.length;K<ve;K++){let Ce=A[K],{object:ye,geometry:Ie,group:Ne}=Ce,Je=Ce.material;Je.allowOverride===!0&&j!==null&&(Je=j),ye.layers.test(Z.layers)&&Gf(ye,B,Z,Ie,Je,Ne)}}function Gf(A,B,Z,j,K,ve){D!==null&&K.isNodeMaterial&&D.setObject(A,K),A.onBeforeRender(R,B,Z,j,K,ve),A.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),K.onBeforeRender(R,B,Z,j,A,ve),K.transparent===!0&&K.side===On&&K.forceSinglePass===!1?(K.side=gn,K.needsUpdate=!0,R.renderBufferDirect(Z,B,j,K,A,ve),K.side=hi,K.needsUpdate=!0,R.renderBufferDirect(Z,B,j,K,A,ve),K.side=On):R.renderBufferDirect(Z,B,j,K,A,ve),A.onAfterRender(R,B,Z,j,K,ve)}function lo(A,B,Z){B.isScene!==!0&&(B=Zt);let j=J.get(A),K=E.state.lights,ve=E.state.shadowsArray,Ce=K.state.version,ye=pe.getParameters(A,K.state,ve,B,Z,E.state.lightProbeGridArray),Ie=pe.getProgramCacheKey(ye),Ne=j.programs;j.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?B.environment:null,j.fog=B.fog;let Je=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;j.envMap=le.get(A.envMap||j.environment,Je),j.envMapRotation=j.environment!==null&&A.envMap===null?B.environmentRotation:A.envMapRotation,Ne===void 0&&(A.addEventListener("dispose",ti),Ne=new Map,j.programs=Ne);let tt=Ne.get(Ie);if(tt!==void 0){if(j.currentProgram===tt&&j.lightsStateVersion===Ce)return Vf(A,ye),tt}else ye.uniforms=pe.getUniforms(A),D!==null&&A.isNodeMaterial&&D.build(A,Z,ye),A.onBeforeCompile(ye,R),tt=pe.acquireProgram(ye,Ie),Ne.set(Ie,tt),j.uniforms=ye.uniforms;let Le=j.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Le.clippingPlanes=ke.uniform),Vf(A,ye),j.needsLights=r0(A),j.lightsStateVersion=Ce,j.needsLights&&(Le.ambientLightColor.value=K.state.ambient,Le.lightProbe.value=K.state.probe,Le.sunLights.value=K.state.sun,Le.sunLightShadows.value=K.state.sunShadow,Le.directionalLights.value=K.state.directional,Le.directionalLightShadows.value=K.state.directionalShadow,Le.spotLights.value=K.state.spot,Le.spotLightShadows.value=K.state.spotShadow,Le.rectAreaLights.value=K.state.rectArea,Le.ltc_1.value=K.state.rectAreaLTC1,Le.ltc_2.value=K.state.rectAreaLTC2,Le.pointLights.value=K.state.point,Le.pointLightShadows.value=K.state.pointShadow,Le.hemisphereLights.value=K.state.hemi,Le.sunShadowMatrix.value=K.state.sunShadowMatrix,Le.sunShadowCascade.value=K.state.sunShadowCascade,Le.directionalShadowMatrix.value=K.state.directionalShadowMatrix,Le.spotLightMatrix.value=K.state.spotLightMatrix,Le.spotLightMap.value=K.state.spotLightMap,Le.pointShadowMatrix.value=K.state.pointShadowMatrix),j.lightProbeGrid=E.state.lightProbeGridArray.length>0,j.currentProgram=tt,j.uniformsList=null,tt}function Hf(A){if(A.uniformsList===null){let B=A.currentProgram.getUniforms();A.uniformsList=Ur.seqWithValue(B.seq,A.uniforms)}return A.uniformsList}function Vf(A,B){let Z=J.get(A);Z.outputColorSpace=B.outputColorSpace,Z.batching=B.batching,Z.batchingColor=B.batchingColor,Z.instancing=B.instancing,Z.instancingColor=B.instancingColor,Z.instancingMorph=B.instancingMorph,Z.skinning=B.skinning,Z.morphTargets=B.morphTargets,Z.morphNormals=B.morphNormals,Z.morphColors=B.morphColors,Z.morphTargetsCount=B.morphTargetsCount,Z.numClippingPlanes=B.numClippingPlanes,Z.numIntersection=B.numClipIntersection,Z.vertexAlphas=B.vertexAlphas,Z.vertexTangents=B.vertexTangents,Z.toneMapping=B.toneMapping}function n0(A,B){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;_.setFromMatrixPosition(B.matrixWorld);for(let Z=0,j=A.length;Z<j;Z++){let K=A[Z];if(K.texture!==null&&K.boundingBox.containsPoint(_))return K}return null}function i0(A,B,Z,j,K){B.isScene!==!0&&(B=Zt),ne.resetTextureUnits();let ve=B.fog,Ce=j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial?B.environment:null,ye=W===null?R.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:Ze.workingColorSpace,Ie=j.isMeshStandardMaterial||j.isMeshLambertMaterial&&!j.envMap||j.isMeshPhongMaterial&&!j.envMap,Ne=le.get(j.envMap||Ce,Ie),Je=j.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,tt=!!Z.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Le=!!Z.morphAttributes.position,ct=!!Z.morphAttributes.normal,Nt=!!Z.morphAttributes.color,vt=Tn;j.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&(vt=R.toneMapping);let gt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Qt=gt!==void 0?gt.length:0,Re=J.get(j),on=E.state.lights;if(Ae===!0&&(je===!0||A!==Y)){let xt=A===Y&&j.id===V;ke.setState(j,A,xt)}let at=!1;j.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==on.state.version||Re.outputColorSpace!==ye||K.isBatchedMesh&&Re.batching===!1||!K.isBatchedMesh&&Re.batching===!0||K.isBatchedMesh&&Re.batchingColor===!0&&K._colorsTexture===null||K.isBatchedMesh&&Re.batchingColor===!1&&K._colorsTexture!==null||K.isInstancedMesh&&Re.instancing===!1||!K.isInstancedMesh&&Re.instancing===!0||K.isSkinnedMesh&&Re.skinning===!1||!K.isSkinnedMesh&&Re.skinning===!0||K.isInstancedMesh&&Re.instancingColor===!0&&K.instanceColor===null||K.isInstancedMesh&&Re.instancingColor===!1&&K.instanceColor!==null||K.isInstancedMesh&&Re.instancingMorph===!0&&K.morphTexture===null||K.isInstancedMesh&&Re.instancingMorph===!1&&K.morphTexture!==null||Re.envMap!==Ne||j.fog===!0&&Re.fog!==ve||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==ke.numPlanes||Re.numIntersection!==ke.numIntersection)||Re.vertexAlphas!==Je||Re.vertexTangents!==tt||Re.morphTargets!==Le||Re.morphNormals!==ct||Re.morphColors!==Nt||Re.toneMapping!==vt||Re.morphTargetsCount!==Qt||!!Re.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(at=!0):(at=!0,Re.__version=j.version);let An=Re.currentProgram;at===!0&&(An=lo(j,B,K),D&&j.isNodeMaterial&&D.onUpdateProgram(j,An,Re));let ni=!1,Bi=!1,qs=!1,dt=An.getUniforms(),At=Re.uniforms;if(S.useProgram(An.program)&&(ni=!0,Bi=!0,qs=!0),j.id!==V&&(V=j.id,Bi=!0),Re.needsLights){let xt=n0(E.state.lightProbeGridArray,K);Re.lightProbeGrid!==xt&&(Re.lightProbeGrid=xt,Bi=!0)}if(ni||Y!==A){S.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),dt.setValue(H,"projectionMatrix",A.projectionMatrix),dt.setValue(H,"viewMatrix",A.matrixWorldInverse);let Gi=dt.map.cameraPosition;Gi!==void 0&&Gi.setValue(H,rt.setFromMatrixPosition(A.matrixWorld)),L.logarithmicDepthBuffer&&dt.setValue(H,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&dt.setValue(H,"isOrthographic",A.isOrthographicCamera===!0),Y!==A&&(Y=A,Bi=!0,qs=!0)}if(Re.needsLights&&(on.state.sunShadowMap.length>0&&dt.setValue(H,"sunShadowMap",on.state.sunShadowMap,ne),on.state.directionalShadowMap.length>0&&dt.setValue(H,"directionalShadowMap",on.state.directionalShadowMap,ne),on.state.spotShadowMap.length>0&&dt.setValue(H,"spotShadowMap",on.state.spotShadowMap,ne),on.state.pointShadowMap.length>0&&dt.setValue(H,"pointShadowMap",on.state.pointShadowMap,ne)),K.isSkinnedMesh){dt.setOptional(H,K,"bindMatrix"),dt.setOptional(H,K,"bindMatrixInverse");let xt=K.skeleton;xt&&(xt.boneTexture===null&&xt.computeBoneTexture(),dt.setValue(H,"boneTexture",xt.boneTexture,ne))}K.isBatchedMesh&&(dt.setOptional(H,K,"batchingTexture"),dt.setValue(H,"batchingTexture",K._matricesTexture,ne),dt.setOptional(H,K,"batchingIdTexture"),dt.setValue(H,"batchingIdTexture",K._indirectTexture,ne),dt.setOptional(H,K,"batchingColorTexture"),K._colorsTexture!==null&&dt.setValue(H,"batchingColorTexture",K._colorsTexture,ne));let zi=Z.morphAttributes;if((zi.position!==void 0||zi.normal!==void 0||zi.color!==void 0)&&G.update(K,Z,An),(Bi||Re.receiveShadow!==K.receiveShadow)&&(Re.receiveShadow=K.receiveShadow,dt.setValue(H,"receiveShadow",K.receiveShadow)),(j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial)&&j.envMap===null&&B.environment!==null&&(At.envMapIntensity.value=B.environmentIntensity),At.dfgLUT!==void 0&&(At.dfgLUT.value=bS()),Bi){if(dt.setValue(H,"toneMappingExposure",R.toneMappingExposure),Re.needsLights&&s0(At,qs),ve&&j.fog===!0&&Ue.refreshFogUniforms(At,ve),Ue.refreshMaterialUniforms(At,j,$,k,E.state.transmissionRenderTarget[A.id]),Re.needsLights&&Re.lightProbeGrid){let xt=Re.lightProbeGrid;At.probesSH.value=xt.texture,At.probesMin.value.copy(xt.boundingBox.min),At.probesMax.value.copy(xt.boundingBox.max),At.probesResolution.value.copy(xt.resolution)}Ur.upload(H,Hf(Re),At,ne)}if(j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(Ur.upload(H,Hf(Re),At,ne),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&dt.setValue(H,"center",K.center),dt.setValue(H,"modelViewMatrix",K.modelViewMatrix),dt.setValue(H,"normalMatrix",K.normalMatrix),dt.setValue(H,"modelMatrix",K.matrixWorld),j.uniformsGroups!==void 0){let xt=j.uniformsGroups;for(let Gi=0,Xs=xt.length;Gi<Xs;Gi++){let qf=xt[Gi];ae.update(qf,An),ae.bind(qf,An)}}return An}function s0(A,B){A.ambientLightColor.needsUpdate=B,A.lightProbe.needsUpdate=B,A.sunLights.needsUpdate=B,A.sunLightShadows.needsUpdate=B,A.directionalLights.needsUpdate=B,A.directionalLightShadows.needsUpdate=B,A.pointLights.needsUpdate=B,A.pointLightShadows.needsUpdate=B,A.spotLights.needsUpdate=B,A.spotLightShadows.needsUpdate=B,A.rectAreaLights.needsUpdate=B,A.hemisphereLights.needsUpdate=B}function r0(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return z},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return W},this.setRenderTargetTextures=function(A,B,Z){let j=J.get(A);j.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,j.__autoAllocateDepthBuffer===!1&&(j.__useRenderToTexture=!1),J.get(A.texture).__webglTexture=B,J.get(A.depthTexture).__webglTexture=j.__autoAllocateDepthBuffer?void 0:Z,j.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,B){let Z=J.get(A);Z.__webglFramebuffer=B,Z.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(A,B=0,Z=0){W=A,z=B,F=Z;let j=null,K=!1,ve=!1;if(A){let ye=J.get(A);if(ye.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(H.FRAMEBUFFER,ye.__webglFramebuffer),Q.copy(A.viewport),he.copy(A.scissor),fe=A.scissorTest,S.viewport(Q),S.scissor(he),S.setScissorTest(fe),V=-1;return}else if(ye.__webglFramebuffer===void 0)ne.setupRenderTarget(A);else if(ye.__hasExternalTextures)ne.rebindTextures(A,J.get(A.texture).__webglTexture,J.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let Je=A.depthTexture;if(ye.__boundDepthTexture!==Je){if(Je!==null&&J.has(Je)&&(A.width!==Je.image.width||A.height!==Je.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ne.setupDepthRenderbuffer(A)}}let Ie=A.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(ve=!0);let Ne=J.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ne[B])?j=Ne[B][Z]:j=Ne[B],K=!0):A.samples>0&&ne.useMultisampledRTT(A)===!1?j=J.get(A).__webglMultisampledFramebuffer:Array.isArray(Ne)?j=Ne[Z]:j=Ne,Q.copy(A.viewport),he.copy(A.scissor),fe=A.scissorTest}else Q.copy(te).multiplyScalar($).floor(),he.copy(ce).multiplyScalar($).floor(),fe=Ve;if(Z!==0&&(j=I),S.bindFramebuffer(H.FRAMEBUFFER,j)&&S.drawBuffers(A,j),S.viewport(Q),S.scissor(he),S.setScissorTest(fe),K){let ye=J.get(A.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_CUBE_MAP_POSITIVE_X+B,ye.__webglTexture,Z)}else if(ve){let ye=B;for(let Ie=0;Ie<A.textures.length;Ie++){let Ne=J.get(A.textures[Ie]);H.framebufferTextureLayer(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0+Ie,Ne.__webglTexture,Z,ye)}}else if(A!==null&&Z!==0){let ye=J.get(A.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,ye.__webglTexture,Z)}V=-1};function Wf(A){let B=J.get(A);return(B.__readFormat!==A.format||B.__readType!==A.type)&&(B.__readFormat=A.format,B.__readType=A.type,B.__formatReadable=L.textureFormatReadable(A.format),B.__typeReadable=L.textureTypeReadable(A.type)),B}this.readRenderTargetPixels=function(A,B,Z,j,K,ve,Ce,ye=0){if(!(A&&A.isWebGLRenderTarget)){qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ie=J.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ce!==void 0&&(Ie=Ie[Ce]),Ie){S.bindFramebuffer(H.FRAMEBUFFER,Ie);try{let Ne=A.textures[ye],Je=Ne.format,tt=Ne.type;A.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+ye);let Le=Wf(Ne);if(Le.__formatReadable===!1){qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Le.__typeReadable===!1){qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=A.width-j&&Z>=0&&Z<=A.height-K&&H.readPixels(B,Z,j,K,be.convert(Je),be.convert(tt),ve)}finally{let Ne=W!==null?J.get(W).__webglFramebuffer:null;S.bindFramebuffer(H.FRAMEBUFFER,Ne)}}},this.readRenderTargetPixelsAsync=async function(A,B,Z,j,K,ve,Ce,ye=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ie=J.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ce!==void 0&&(Ie=Ie[Ce]),Ie)if(B>=0&&B<=A.width-j&&Z>=0&&Z<=A.height-K){S.bindFramebuffer(H.FRAMEBUFFER,Ie);let Ne=A.textures[ye],Je=Ne.format,tt=Ne.type;A.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+ye);let Le=Wf(Ne);if(Le.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Le.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ct=H.createBuffer();H.bindBuffer(H.PIXEL_PACK_BUFFER,ct),H.bufferData(H.PIXEL_PACK_BUFFER,ve.byteLength,H.STREAM_READ),H.readPixels(B,Z,j,K,be.convert(Je),be.convert(tt),0),H.bindBuffer(H.PIXEL_PACK_BUFFER,null);let Nt=W!==null?J.get(W).__webglFramebuffer:null;S.bindFramebuffer(H.FRAMEBUFFER,Nt);let vt=H.fenceSync(H.SYNC_GPU_COMMANDS_COMPLETE,0);return H.flush(),await kp(H,vt,4),H.bindBuffer(H.PIXEL_PACK_BUFFER,ct),H.getBufferSubData(H.PIXEL_PACK_BUFFER,0,ve),H.bindBuffer(H.PIXEL_PACK_BUFFER,null),H.deleteBuffer(ct),H.deleteSync(vt),ve}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,B=null,Z=0){let j=Math.pow(2,-Z),K=Math.floor(A.image.width*j),ve=Math.floor(A.image.height*j),Ce=B!==null?B.x:0,ye=B!==null?B.y:0;ne.setTexture2D(A,0),H.copyTexSubImage2D(H.TEXTURE_2D,Z,0,0,Ce,ye,K,ve),S.unbindTexture()},this.copyTextureToTexture=function(A,B,Z=null,j=null,K=0,ve=0){let Ce,ye,Ie,Ne,Je,tt,Le,ct,Nt,vt=A.isCompressedTexture?A.mipmaps[ve]:A.image;if(Z!==null)Ce=Z.max.x-Z.min.x,ye=Z.max.y-Z.min.y,Ie=Z.isBox3?Z.max.z-Z.min.z:1,Ne=Z.min.x,Je=Z.min.y,tt=Z.isBox3?Z.min.z:0;else{let At=Math.pow(2,-K);Ce=Math.floor(vt.width*At),ye=Math.floor(vt.height*At),A.isDataArrayTexture?Ie=vt.depth:A.isData3DTexture?Ie=Math.floor(vt.depth*At):Ie=1,Ne=0,Je=0,tt=0}j!==null?(Le=j.x,ct=j.y,Nt=j.z):(Le=0,ct=0,Nt=0);let gt=be.convert(B.format),Qt=be.convert(B.type),Re;B.isData3DTexture?(ne.setTexture3D(B,0),Re=H.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(ne.setTexture2DArray(B,0),Re=H.TEXTURE_2D_ARRAY):(ne.setTexture2D(B,0),Re=H.TEXTURE_2D),S.activeTexture(H.TEXTURE0),S.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,B.flipY),S.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),S.pixelStorei(H.UNPACK_ALIGNMENT,B.unpackAlignment);let on=S.getParameter(H.UNPACK_ROW_LENGTH),at=S.getParameter(H.UNPACK_IMAGE_HEIGHT),An=S.getParameter(H.UNPACK_SKIP_PIXELS),ni=S.getParameter(H.UNPACK_SKIP_ROWS),Bi=S.getParameter(H.UNPACK_SKIP_IMAGES);S.pixelStorei(H.UNPACK_ROW_LENGTH,vt.width),S.pixelStorei(H.UNPACK_IMAGE_HEIGHT,vt.height),S.pixelStorei(H.UNPACK_SKIP_PIXELS,Ne),S.pixelStorei(H.UNPACK_SKIP_ROWS,Je),S.pixelStorei(H.UNPACK_SKIP_IMAGES,tt);let qs=A.isDataArrayTexture||A.isData3DTexture,dt=B.isDataArrayTexture||B.isData3DTexture;if(A.isDepthTexture){let At=J.get(A),zi=J.get(B),xt=J.get(At.__renderTarget),Gi=J.get(zi.__renderTarget);S.bindFramebuffer(H.READ_FRAMEBUFFER,xt.__webglFramebuffer),S.bindFramebuffer(H.DRAW_FRAMEBUFFER,Gi.__webglFramebuffer);for(let Xs=0;Xs<Ie;Xs++)qs&&(H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,J.get(A).__webglTexture,K,tt+Xs),H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,J.get(B).__webglTexture,ve,Nt+Xs)),H.blitFramebuffer(Ne,Je,Ce,ye,Le,ct,Ce,ye,H.DEPTH_BUFFER_BIT,H.NEAREST);S.bindFramebuffer(H.READ_FRAMEBUFFER,null),S.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else if(K!==0||A.isRenderTargetTexture||J.has(A)){let At=J.get(A),zi=J.get(B);S.bindFramebuffer(H.READ_FRAMEBUFFER,C),S.bindFramebuffer(H.DRAW_FRAMEBUFFER,N);for(let xt=0;xt<Ie;xt++)qs?H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,At.__webglTexture,K,tt+xt):H.framebufferTexture2D(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,At.__webglTexture,K),dt?H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,zi.__webglTexture,ve,Nt+xt):H.framebufferTexture2D(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,zi.__webglTexture,ve),K!==0?H.blitFramebuffer(Ne,Je,Ce,ye,Le,ct,Ce,ye,H.COLOR_BUFFER_BIT,H.NEAREST):dt?H.copyTexSubImage3D(Re,ve,Le,ct,Nt+xt,Ne,Je,Ce,ye):H.copyTexSubImage2D(Re,ve,Le,ct,Ne,Je,Ce,ye);S.bindFramebuffer(H.READ_FRAMEBUFFER,null),S.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else dt?A.isDataTexture||A.isData3DTexture?H.texSubImage3D(Re,ve,Le,ct,Nt,Ce,ye,Ie,gt,Qt,vt.data):B.isCompressedArrayTexture?H.compressedTexSubImage3D(Re,ve,Le,ct,Nt,Ce,ye,Ie,gt,vt.data):H.texSubImage3D(Re,ve,Le,ct,Nt,Ce,ye,Ie,gt,Qt,vt):A.isDataTexture?H.texSubImage2D(H.TEXTURE_2D,ve,Le,ct,Ce,ye,gt,Qt,vt.data):A.isCompressedTexture?H.compressedTexSubImage2D(H.TEXTURE_2D,ve,Le,ct,vt.width,vt.height,gt,vt.data):H.texSubImage2D(H.TEXTURE_2D,ve,Le,ct,Ce,ye,gt,Qt,vt);S.pixelStorei(H.UNPACK_ROW_LENGTH,on),S.pixelStorei(H.UNPACK_IMAGE_HEIGHT,at),S.pixelStorei(H.UNPACK_SKIP_PIXELS,An),S.pixelStorei(H.UNPACK_SKIP_ROWS,ni),S.pixelStorei(H.UNPACK_SKIP_IMAGES,Bi),ve===0&&B.generateMipmaps&&H.generateMipmap(Re),S.unbindTexture()},this.initRenderTarget=function(A){J.get(A).__webglFramebuffer===void 0&&ne.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?ne.setTextureCube(A,0):A.isData3DTexture?ne.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?ne.setTexture2DArray(A,0):ne.setTexture2D(A,0),S.unbindTexture()},this.resetState=function(){z=0,F=0,W=null,S.reset(),Se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}};var X=Object.freeze({grassLight:"#8fcf6f",grass:"#6fb85a",forestDark:"#4f9a4a",wheat:"#e9c46a",soil:"#c9a86a",river:"#5fb3d9",lakeDeep:"#3f8fc2",wetland:"#7fb89a",rock:"#a8a39a",rockLight:"#c9c4b8",roofRed:"#d9654a",roofOrange:"#e59a5a",roofSlate:"#7a8fb5",wallCream:"#f4efe6",wallBeige:"#e8d8c0",wallTan:"#c9b8a0",wood:"#8b5a3c",asphalt:"#5a5a66",sidewalk:"#9a9aa6",marking:"#f2f2f2",metal:"#7d8591",metalLight:"#b8bcc4",blossom:"#e85d75",sun:"#f7d84a"}),ym=Object.freeze(Object.values(X));var vm=Math.PI/180;function Bh(i={}){return Object.freeze({cx:0,cz:0,zoom:12,yaw:45*vm,pitch:35*vm,...i})}function Mm(i){let e=Math.sin(i.yaw),t=Math.cos(i.yaw),n=Math.sin(i.pitch),s=Math.cos(i.pitch);return{dir:[e*s,n,t*s],right:[t,0,-e],up:[-n*e,s,-n*t]}}function Qa(i,e){return i.zoom/Math.max(1,e.width)}function Sm(i,e){let t=i.zoom/2,n=t*(Math.max(1,e.height)/Math.max(1,e.width)),{dir:s}=Mm(i);return{left:-t,right:t,top:n,bottom:-n,near:1,far:160,position:[i.cx+s[0]*60,s[1]*60,i.cz+s[2]*60],target:[i.cx,0,i.cz],up:[0,1,0]}}function wm(i,e,t,n){let{right:s,up:r}=Mm(i),a=e-i.cx,o=n-i.cz;return{sX:a*s[0]+o*s[2],sY:a*r[0]+t*r[1]+o*r[2]}}function Em(i,e,t,n,s){let{sX:r,sY:a}=wm(i,t,n,s),o=Qa(i,e);return{x:e.width/2+r/o,y:e.height/2-a/o}}function $a(i,e,t,n){let s=e-(n.left||0),r=t-(n.top||0),a=Qa(i,n),o=(s-n.width/2)*a,l=(n.height/2-r)*a,c=Math.sin(i.yaw),u=Math.cos(i.yaw),h=Math.sin(i.pitch),f=l/h;return{x:i.cx+u*o-c*f,z:i.cz-c*o-u*f}}function Tm(i,e,t,n,s){if(!s)return null;let r=$a(i,e,t,n),a=Math.floor(r.x),o=Math.floor(r.z);return a<0||o<0||a>=s.cols||o>=s.rows?null:{x:a,y:o}}function Am(i,e,t,n){let s=Qa(i,n),r=Math.sin(i.yaw),a=Math.cos(i.yaw),o=Math.sin(i.pitch),l=-e*s,c=t*s/o;return{...i,cx:i.cx+a*l-r*c,cz:i.cz-r*l-a*c}}function Rm(i,e,t,n,s,r=null){if(!(e>0)||!Number.isFinite(e))return i;let a=r?zh(r,s):24,o=Math.min(a,Math.max(6,i.zoom/e));if(o===i.zoom)return i;let l={...s,left:0,top:0},c=$a(i,t,n,l),u={...i,zoom:o},h=$a(u,t,n,l),f={...u,cx:u.cx+c.x-h.x,cz:u.cz+c.z-h.z};return r?eo(f,r,s):f}function xS(i){let e=[];for(let t of[0,i.cols])for(let n of[0,i.rows])for(let s of[-.7,2.6])e.push([t,s,n]);return e}function Cm(i,e){let t=1/0,n=-1/0,s=1/0,r=-1/0;for(let[a,o,l]of xS(e)){let{sX:c,sY:u}=wm(i,a,o,l);c<t&&(t=c),c>n&&(n=c),u<s&&(s=u),u>r&&(r=u)}return{minX:t,maxX:n,minY:s,maxY:r}}function ml(i,e,t=Bh(),n={}){let s=n.margin??.6,r={top:0,bottom:0,left:0,right:0,...n.insets||{}},a=Math.max(1,e.width-r.left-r.right),o=Math.max(1,e.height-r.top-r.bottom),l=Cm(t,i),c=l.maxX-l.minX+2*s,u=l.maxY-l.minY+2*s,h=c*(e.width/a),f=u*(e.width/o);return Math.max(h,f)}function zh(i,e){return!i||!e?24:Math.max(24,ml(i,e))}function Pm(i,e,t,n={}){let s={top:0,bottom:0,left:0,right:0,...n.insets||{}},r={...i,cx:e.cols/2,cz:e.rows/2},a=ml(e,t,r,n),o={...r,zoom:a},l=Cm(o,e),c=Qa(o,t),u=(l.minX+l.maxX)/2+(s.right-s.left)/2*c,h=(l.minY+l.maxY)/2+(s.top-s.bottom)/2*c;return Lm(o,u,h)}function Im(i,e,t,n,s,r,a={}){let o={top:0,bottom:0,left:0,right:0,...a.insets||{}},l=zh(e,t),c=Math.min(l,Math.max(6,r??i.zoom)),u={...i,cx:n,cz:s,zoom:c},h=Qa(u,t),f=(o.right-o.left)/2*h,d=(o.top-o.bottom)/2*h;return Lm(u,f,d)}function Lm(i,e,t){let n=Math.sin(i.yaw),s=Math.cos(i.yaw),r=t/Math.sin(i.pitch);return{...i,cx:i.cx+s*e-n*r,cz:i.cz-n*e-s*r}}function eo(i,e,t=null){let s=t?zh(e,t):24,r=Math.min(s,Math.max(6,i.zoom)),a=Math.min(e.cols+.5,Math.max(-.5,i.cx)),o=Math.min(e.rows+.5,Math.max(-.5,i.cz));return r===i.zoom&&a===i.cx&&o===i.cz?i:{...i,zoom:r,cx:a,cz:o}}function gl(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},a={},o=i[0].morphTargetsRelative,l=new St,c=0;for(let u=0;u<i.length;++u){let h=i[u],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in h.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(h.attributes[d]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(o!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in h.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(h.morphAttributes[d])}if(e){let d;if(t)d=h.index.count;else if(h.attributes.position!==void 0)d=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,u),c+=d}}if(t){let u=0,h=[];for(let f=0;f<i.length;++f){let d=i[f].index;for(let g=0;g<d.count;++g)h.push(d.getX(g)+u);u+=i[f].attributes.position.count}l.setIndex(h)}for(let u in r){let h=Dm(r[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in a){let h=a[u][0].length;if(h!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let d=[];for(let x=0;x<a[u].length;++x)d.push(a[u][x][f]);let g=Dm(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}}return l}function Dm(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){let u=i[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*t}let a=new e(r),o=new st(a,t,n),l=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let f=0,d=u.count;f<d;f++)for(let g=0;g<t;g++){let x=u.getComponent(f,g);o.setComponent(f+h,g,x)}}else a.set(u.array,l);l+=u.count*t}return s!==void 0&&(o.gpuType=s),o}function Gh(i,e){if(e===mh)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Nr||e===ja){let t=i.getIndex();if(t===null){let r=[],a=i.getAttribute("position");if(a!==void 0){for(let o=0;o<a.count;o++)r.push(o);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===Nr)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function bl(i){let e=new Map,t=new Map,n=i.clone();return Nm(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,a=e.get(s),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Nm(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)Nm(i.children[n],e.children[n],t)}var zr=class extends li{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Kh(t)}),this.register(function(t){return new Yh(t)}),this.register(function(t){return new rf(t)}),this.register(function(t){return new af(t)}),this.register(function(t){return new of(t)}),this.register(function(t){return new Zh(t)}),this.register(function(t){return new $h(t)}),this.register(function(t){return new Qh(t)}),this.register(function(t){return new ef(t)}),this.register(function(t){return new jh(t)}),this.register(function(t){return new tf(t)}),this.register(function(t){return new Jh(t)}),this.register(function(t){return new sf(t)}),this.register(function(t){return new nf(t)}),this.register(function(t){return new qh(t)}),this.register(function(t){return new xl(t,et.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new xl(t,et.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new cf(t)})}load(e,t,n,s){let r=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let c=Oi.extractUrlBase(e);a=Oi.resolveURL(c,this.path)}else a=Oi.extractUrlBase(e);this.manager.itemStart(e);let o=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ar(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(u){t(u),r.manager.itemEnd(e)},o)}catch(u){o(u)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Bm){try{a[et.KHR_BINARY_GLTF]=new lf(e)}catch(h){s&&s(h);return}r=JSON.parse(a[et.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new gf(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](c);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[h.name]=h,a[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],f=r.extensionsRequired||[];switch(h){case et.KHR_MATERIALS_UNLIT:a[h]=new Xh;break;case et.KHR_DRACO_MESH_COMPRESSION:a[h]=new uf(r,this.dracoLoader);break;case et.KHR_TEXTURE_TRANSFORM:a[h]=new hf;break;case et.KHR_MESH_QUANTIZATION:a[h]=new ff;break;default:f.indexOf(h)>=0&&o[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function vS(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function Lt(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var et={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},qh=class{constructor(e){this.parser=e,this.name=et.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,u=new ue(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],fn);let h=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Ns(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Oa(u),c.distance=h;break;case"spot":c=new Fa(u),c.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),gi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}},Xh=class{constructor(){this.name=et.KHR_MATERIALS_UNLIT}getMaterialType(){return Zn}extendParams(e,t,n){let s=[];e.color=new ue(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],fn),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Et))}return Promise.all(s)}},jh=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Kh=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ke(r,r)}return Promise.all(s)}},Yh=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},Jh=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}},Zh=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_SHEEN}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(t.sheenColor=new ue(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],fn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Et)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}},$h=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}},Qh=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_VOLUME}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new ue().setRGB(r[0],r[1],r[2],fn),Promise.all(s)}},ef=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_IOR}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},tf=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new ue().setRGB(r[0],r[1],r[2],fn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Et)),Promise.all(s)}},nf=class{constructor(e){this.parser=e,this.name=et.EXT_MATERIALS_BUMP}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}},sf=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Lt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Lt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}},rf=class{constructor(e){this.parser=e,this.name=et.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}},af=class{constructor(e){this.parser=e,this.name=et.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},of=class{constructor(e){this.parser=e,this.name=et.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},xl=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){let l=s.byteOffset||0,c=s.byteLength||0,u=s.count,h=s.byteStride,f=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(u,h,f,s.mode,s.filter).then(function(d){return d.buffer}):a.ready.then(function(){let d=new ArrayBuffer(u*h);return a.decodeGltfBuffer(new Uint8Array(d),u,h,f,s.mode,s.filter),d})})}else return null}},cf=class{constructor(e){this.name=et.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==kn.TRIANGLES&&c.mode!==kn.TRIANGLE_STRIP&&c.mode!==kn.TRIANGLE_FAN&&c.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],l={};for(let c in a)o.push(this.parser.getDependency("accessor",a[c]).then(u=>(l[c]=u,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{let u=c.pop(),h=u.isGroup?u.children:[u],f=c[0].count,d=[];for(let g of h){let x=new Me,m=new U,p=new Ut,y=new U(1,1,1),v=new Yt(g.geometry,g.material,f);for(let M=0;M<f;M++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,M),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,M),l.SCALE&&y.fromBufferAttribute(l.SCALE,M),v.setMatrixAt(M,x.compose(m,p,y));let _=null;for(let M in l)if(M==="_COLOR_0"){let E=l[M];v.instanceColor=new pn(E.array,E.itemSize,E.normalized)}else if(M!=="TRANSLATION"&&M!=="ROTATION"&&M!=="SCALE"){if(_===null){let w=v.geometry;_=new St,_.name=w.name;for(let b in w.attributes)_.setAttribute(b,w.attributes[b]);for(let b in w.morphAttributes)_.morphAttributes[b]=w.morphAttributes[b];w.index!==null&&_.setIndex(w.index),_.morphTargetsRelative=w.morphTargetsRelative;for(let b of w.groups)_.addGroup(b.start,b.count,b.materialIndex);w.boundingBox!==null&&(_.boundingBox=w.boundingBox.clone()),w.boundingSphere!==null&&(_.boundingSphere=w.boundingSphere.clone()),_.drawRange.start=w.drawRange.start,_.drawRange.count=w.drawRange.count,_.userData=Object.assign({},w.userData),v.geometry=_}let E=l[M];_.setAttribute(M,new pn(E.array,E.itemSize,E.normalized))}Mt.prototype.copy.call(v,g),this.parser.assignFinalMaterial(v),d.push(v)}return u.isGroup?(u.clear(),u.add(...d),u):d[0]}))}},Bm="glTF",to=12,Fm={JSON:1313821514,BIN:5130562},lf=class{constructor(e){this.name=et.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,to),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Bm)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-to,r=new DataView(e,to),a=0;for(;a<s;){let o=r.getUint32(a,!0);a+=4;let l=r.getUint32(a,!0);if(a+=4,l===Fm.JSON){let c=new Uint8Array(e,to+a,o);this.content=n.decode(c)}else if(l===Fm.BIN){let c=to+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},uf=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=et.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(let u in a){let h=pf[u]||u.toLowerCase();o[h]=a[u]}for(let u in e.attributes){let h=pf[u]||u.toLowerCase();if(a[u]!==void 0){let f=n.accessors[e.attributes[u]],d=Br[f.componentType];c[h]=d.name,l[h]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,f){s.decodeDracoFile(u,function(d){for(let g in d.attributes){let x=d.attributes[g],m=l[g];m!==void 0&&(x.normalized=m)}h(d)},o,c,fn,f)})})}},hf=class{constructor(){this.name=et.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},ff=class{constructor(){this.name=et.KHR_MESH_QUANTIZATION}},_l=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,u=s-t,h=(n-t)/u,f=h*h,d=f*h,g=e*c,x=g-c,m=-2*d+3*f,p=d-f,y=1-m,v=p-f+h;for(let _=0;_!==o;_++){let M=a[x+_+o],E=a[x+_+l]*u,w=a[g+_+o],b=a[g+_]*u;r[_]=y*M+v*E+m*w+p*b}return r}},MS=new Ut,df=class extends _l{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return MS.fromArray(r).normalize().toArray(r),r}},kn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Br={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Om={9728:Ct,9729:Pt,9984:Mc,9985:Ir,9986:ks,9987:$n},Um={33071:Dn,33648:gr,10497:Zi},Hh={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},pf={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},rs={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},SS={CUBICSPLINE:void 0,LINEAR:vs,STEP:ys},Vh={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function wS(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Is({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:hi})),i.DefaultMaterial}function Gs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function gi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function ES(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,u=e.length;c<u;c++){let h=e[c];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let a=[],o=[],l=[];for(let c=0,u=e.length;c<u;c++){let h=e[c];if(n){let f=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):i.attributes.position;a.push(f)}if(s){let f=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):i.attributes.normal;o.push(f)}if(r){let f=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):i.attributes.color;l.push(f)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let u=c[0],h=c[1],f=c[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=h),r&&(i.morphAttributes.color=f),i.morphTargetsRelative=!0,i})}function TS(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function AS(i){let e,t=i.extensions&&i.extensions[et.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Wh(t.attributes):e=i.indices+":"+Wh(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Wh(i.targets[n]);return e}function Wh(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function mf(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function RS(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var CS=new Me,gf=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new vS,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let l=o.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?this.textureLoader=new La(this.options.manager):this.textureLoader=new Ua(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ar(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return Gs(r,o,s),gi(o,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(let l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let a=t[s].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(a,o)=>{let l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(let[c,u]of a.children.entries())r(u,o.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[et.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,a){n.load(Oi.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let a=Hh[s.type],o=Br[s.componentType],l=s.normalized===!0,c=new o(s.count*a);return Promise.resolve(new st(c,a,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){let o=a[0],l=Hh[s.type],c=Br[s.componentType],u=c.BYTES_PER_ELEMENT,h=u*l,f=s.byteOffset||0,d=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,x,m;if(d&&d!==h){let p=Math.floor(f/d),y="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count,v=t.cache.get(y);v||(x=new c(o,p*d,s.count*d/u),v=new Mr(x,d/u),t.cache.add(y,v)),m=new Sr(v,l,f%d/u,g)}else o===null?x=new c(s.count*l):x=new c(o,f,s.count*l),m=new st(x,l,g);if(s.sparse!==void 0){let p=Hh.SCALAR,y=Br[s.sparse.indices.componentType],v=s.sparse.indices.byteOffset||0,_=s.sparse.values.byteOffset||0,M=new y(a[1],v,s.sparse.count*p),E=new c(a[2],_,s.sparse.count*l);o!==null&&(m=new st(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let w=0,b=M.length;w<b;w++){let T=M[w];if(m.setX(T,E[w*l]),l>=2&&m.setY(T,E[w*l+1]),l>=3&&m.setZ(T,E[w*l+2]),l>=4&&m.setW(T,E[w*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r],o=this.textureLoader;if(a.uri){let l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){let s=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=a.name||o.name||"",u.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(u.name=o.uri);let f=(r.samplers||{})[a.sampler]||{};return u.magFilter=Om[f.magFilter]||Pt,u.minFilter=Om[f.minFilter]||$n,u.wrapS=Um[f.wrapS]||Zi,u.wrapT=Um[f.wrapT]||Zi,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Ct&&u.minFilter!==Pt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let a=s.images[e],o=self.URL||self.webkitURL,l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(h){c=!0;let f=new Blob([h],{type:a.mimeType});return l=o.createObjectURL(f),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(l).then(function(h){return new Promise(function(f,d){let g=f;t.isImageBitmapLoader===!0&&(g=function(x){let m=new Xt(x);m.needsUpdate=!0,f(m)}),t.load(Oi.resolveURL(h,r.path),g,void 0,d)})}).then(function(h){return c===!0&&o.revokeObjectURL(l),gi(h,a),h.userData.mimeType=a.mimeType||RS(a.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[et.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[et.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let l=r.associations.get(a);a=r.extensions[et.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Tr,dn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Er,dn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Is}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],a,o={},l=r.extensions||{},c=[];if(l[et.KHR_MATERIALS_UNLIT]){let h=s[et.KHR_MATERIALS_UNLIT];a=h.getMaterialType(),c.push(h.extendParams(o,r,t))}else{let h=r.pbrMetallicRoughness||{};if(o.color=new ue(1,1,1),o.opacity=1,Array.isArray(h.baseColorFactor)){let f=h.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],fn),o.opacity=f[3]}h.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",h.baseColorTexture,Et)),o.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,o.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",h.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",h.metallicRoughnessTexture))),a=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=On);let u=r.alphaMode||Vh.OPAQUE;if(u===Vh.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,u===Vh.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==Zn&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new Ke(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;o.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&a!==Zn&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==Zn){let h=r.emissiveFactor;o.emissive=new ue().setRGB(h[0],h[1],h[2],fn)}return r.emissiveTexture!==void 0&&a!==Zn&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Et)),Promise.all(c).then(function(){let h=new a(o);return r.name&&(h.name=r.name),gi(h,r),t.associations.set(h,{materials:e}),r.extensions&&Gs(s,h,r),h})}createUniqueName(e){let t=pt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[et.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return km(l,o,t)})}let a=[];for(let o=0,l=e.length;o<l;o++){let c=e[o],u=AS(c),h=s[u];if(h)a.push(h.promise);else{let f;c.extensions&&c.extensions[et.KHR_DRACO_MESH_COMPRESSION]?f=r(c):f=km(new St,c,t),c.mode===kn.TRIANGLE_STRIP?f=f.then(d=>Gh(d,ja)):c.mode===kn.TRIANGLE_FAN&&(f=f.then(d=>Gh(d,Nr))),s[u]={primitive:c,promise:f},a.push(f)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){let u=a[l].material===void 0?wS(this.cache):this.getDependency("material",a[l].material);o.push(u)}return o.push(t.loadGeometries(a)),Promise.all(o).then(async function(l){let c=l.slice(0,l.length-1),u=l[l.length-1],h=[];for(let d=0,g=u.length;d<g;d++){let x=u[d],m=a[d],p,y=c[d];if(m.mode===kn.TRIANGLES||m.mode===kn.TRIANGLE_STRIP||m.mode===kn.TRIANGLE_FAN||m.mode===void 0){let v=r.isSkinnedMesh===!0,_=x.hasAttribute("skinIndex")&&x.hasAttribute("skinWeight");v&&_===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),p=v&&_?new Ts(x,y):new It(x,y),p.isSkinnedMesh===!0&&p.normalizeSkinWeights()}else if(m.mode===kn.LINES)p=new Ma(x,y);else if(m.mode===kn.LINE_STRIP)p=new Rs(x,y);else if(m.mode===kn.LINE_LOOP)p=new Sa(x,y);else if(m.mode===kn.POINTS)p=new wa(x,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&TS(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),gi(p,r),m.extensions&&Gs(s,p,m),t.assignFinalMaterial(p),h.push(p)}for(let d=0,g=h.length;d<g;d++)t.associations.set(h[d],{meshes:e,primitives:d});if(h.length===1)return r.extensions&&Gs(s,h[0],r),h[0];let f=new Rt;r.extensions&&Gs(s,f,r),t.associations.set(f,{meshes:e});for(let d=0,g=h.length;d<g;d++)f.add(h[d]);return f})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Wt(_h.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new ui(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),gi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),a=s,o=[],l=[];for(let c=0,u=a.length;c<u;c++){let h=a[c];if(h){o.push(h);let f=new Me;r!==null&&f.fromArray(r.array,c*16),l.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new va(o,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],l=[],c=[],u=[];for(let h=0,f=s.channels.length;h<f;h++){let d=s.channels[h],g=s.samplers[d.sampler],x=d.target,m=x.node,p=s.parameters!==void 0?s.parameters[g.input]:g.input,y=s.parameters!==void 0?s.parameters[g.output]:g.output;x.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",y)),c.push(g),u.push(x))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(h){let f=h[0],d=h[1],g=h[2],x=h[3],m=h[4],p=[];for(let v=0,_=f.length;v<_;v++){let M=f[v],E=d[v],w=g[v],b=x[v],T=m[v];if(M===void 0)continue;M.updateMatrix&&M.updateMatrix();let R=n._createAnimationTracks(M,E,w,b,T);if(R)for(let P=0;P<R.length;P++)p.push(R[P])}let y=new Ls(r,void 0,p);return gi(y,s),y})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=s.weights.length;l<c;l++)o.morphTargetInfluences[l]=s.weights[l]}),a})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let c=0,u=o.length;c<u;c++)a.push(n.getDependency("node",o[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){let u=c[0],h=c[1],f=c[2];f!==null&&u.traverse(function(d){d.isSkinnedMesh&&d.bind(f,CS)});for(let d=0,g=h.length;d<g;d++)u.add(h[d]);if(u.userData.pivot!==void 0&&h.length>0){let d=u.userData.pivot,g=h[0];u.pivot=new U().fromArray(d),u.position.x-=d[0],u.position.y-=d[1],u.position.z-=d[2],g.position.set(0,0,0),delete u.userData.pivot}return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let u;if(r.isBone===!0?u=new wr:c.length>1?u=new Rt:c.length===1?u=c[0]:u=new Mt,u!==c[0])for(let h=0,f=c.length;h<f;h++)u.add(c[h]);if(r.name&&(u.userData.name=r.name,u.name=a),gi(u,r),r.extensions&&Gs(n,u,r),r.matrix!==void 0){let h=new Me;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!s.associations.has(u))s.associations.set(u,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let h=s.associations.get(u);s.associations.set(u,{...h})}return s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Rt;n.name&&(r.name=s.createUniqueName(n.name)),gi(r,n),n.extensions&&Gs(t,r,n);let a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(s.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let u=0,h=l.length;u<h;u++){let f=l[u];f.parent!==null?r.add(bl(f)):r.add(f)}let c=u=>{let h=new Map;for(let[f,d]of s.associations)(f instanceof dn||f instanceof Xt)&&h.set(f,d);return u.traverse(f=>{let d=s.associations.get(f);d!=null&&h.set(f,d)}),h};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let a=[],o=e.name?e.name:e.uuid,l=[];function c(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}rs[r.path]===rs.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(o);let u;switch(rs[r.path]){case rs.weights:u=Di;break;case rs.rotation:u=Ni;break;case rs.translation:case rs.scale:u=ts;break;default:n.itemSize===1?u=Di:u=ts;break}let h=s.interpolation!==void 0?SS[s.interpolation]:vs,f=this._getArrayFromAccessor(n);for(let d=0,g=l.length;d<g;d++){let x=new u(l[d]+"."+rs[r.path],t.array,f,h);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(x),a.push(x)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=mf(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof Ni?df:_l;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function PS(i,e,t){let n=e.attributes,s=new Tt;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(s.set(new U(l[0],l[1],l[2]),new U(c[0],c[1],c[2])),o.normalized){let u=mf(Br[o.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let o=new U,l=new U;for(let c=0,u=r.length;c<u;c++){let h=r[c];if(h.POSITION!==void 0){let f=t.json.accessors[h.POSITION],d=f.min,g=f.max;if(d!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(g[2]))),f.normalized){let x=mf(Br[f.componentType]);l.multiplyScalar(x)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;let a=new qt;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function km(i,e,t){let n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){i.setAttribute(o,l)})}for(let a in n){let o=pf[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return Ze.workingColorSpace!==fn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ze.workingColorSpace}" not supported.`),gi(i,e),PS(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?ES(i,e.targets,t):i})}var Gr=(function(){var i="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuixkbeeeddddillviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WboY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbrl79IV9Rbwq:VZkdbk:XYi5ud9:du8Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaicefhxcj;abad9Uc;WFbGcjdadca0EhmaialfgPar9Rgoadfhsavaoadz:jjjjbgzceVhHcbhOdndninaeaO9nmeaPax9RaD6mdamaeaO9RaOamfgoae6EgAcsfglc9WGhCabaOad2fhXaAcethQaxaDfhiaOaeaoaeao6E9RhLalcl4cifcd4hKazcj;cbfaAfhYcbh8AazcjdfhEaHh3incbh5dnawTmbaxa8Acd4fRbbh5kcbh8Eazcj;cbfhqinaih8Fdndndndna5a8Ecet4ciGgoc9:fPdebdkaPa8F9RaA6mrazcj;cbfa8EaA2fa8FaAz:jjjjb8Aa8FaAfhixdkazcj;cbfa8EaA2fcbaAz:kjjjb8Aa8FhixekaPa8F9RaK6mva8FaKfhidnaCTmbaPai9RcK6mbaocdtc:q:G:cjbfcj:G:cjbawEhaczhrcbhlinargoc9Wfghaqfhrdndndndndndnaaa8Fahco4fRbbalcoG4ciGcdtfydbPDbedvivvvlvkar9cb83bwar9cb83bbxlkarcbaiRbdai8Xbb9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbaqaofgrcGfcbaicdfa8J9c8N1:NfghRbbag9cjjjjjw:dg8J9qE86bbarcVfcbaha8J9c8M1:NfghRbbag9cjjjjjl:dg8J9qE86bbarc7fcbaha8J9c8L1:NfghRbbag9cjjjjjd:dg8J9qE86bbarctfcbaha8J9c8K1:NfghRbbag9cjjjjje:dg8J9qE86bbarc91fcbaha8J9c8J1:NfghRbbag9cjjjj;ab:dg8J9qE86bbarc4fcbaha8J9cg1:NfghRbbag9cjjjja:dg8J9qE86bbarc93fcbaha8J9ch1:NfghRbbag9cjjjjz:dgg9qE86bbarc94fcbahag9ca1:NfghRbbai8Xbe9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbarc95fcbaha8J9c8N1:NfgiRbbag9cjjjjjw:dg8J9qE86bbarc96fcbaia8J9c8M1:NfgiRbbag9cjjjjjl:dg8J9qE86bbarc97fcbaia8J9c8L1:NfgiRbbag9cjjjjjd:dg8J9qE86bbarc98fcbaia8J9c8K1:NfgiRbbag9cjjjjje:dg8J9qE86bbarc99fcbaia8J9c8J1:NfgiRbbag9cjjjj;ab:dg8J9qE86bbarc9:fcbaia8J9cg1:NfgiRbbag9cjjjja:dg8J9qE86bbarcufcbaia8J9ch1:NfgiRbbag9cjjjjz:dgg9qE86bbaiag9ca1:NfhixikaraiRblaiRbbghco4g8Ka8KciSg8KE86bbaqaofgrcGfaiclfa8Kfg8KRbbahcl4ciGg8La8LciSg8LE86bbarcVfa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc7fa8Ka8Lfg8KRbbahciGghahciSghE86bbarctfa8Kahfg8KRbbaiRbeghco4g8La8LciSg8LE86bbarc91fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc4fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc93fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc94fa8Kahfg8KRbbaiRbdghco4g8La8LciSg8LE86bbarc95fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc96fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc97fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc98fa8KahfghRbbaiRbigico4g8Ka8KciSg8KE86bbarc99faha8KfghRbbaicl4ciGg8Ka8KciSg8KE86bbarc9:faha8KfghRbbaicd4ciGg8Ka8KciSg8KE86bbarcufaha8KfgrRbbaiciGgiaiciSgiE86bbaraifhixdkaraiRbwaiRbbghcl4g8Ka8KcsSg8KE86bbaqaofgrcGfaicwfa8Kfg8KRbbahcsGghahcsSghE86bbarcVfa8KahfghRbbaiRbeg8Kcl4g8La8LcsSg8LE86bbarc7faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarctfaha8KfghRbbaiRbdg8Kcl4g8La8LcsSg8LE86bbarc91faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc4faha8KfghRbbaiRbig8Kcl4g8La8LcsSg8LE86bbarc93faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc94faha8KfghRbbaiRblg8Kcl4g8La8LcsSg8LE86bbarc95faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc96faha8KfghRbbaiRbvg8Kcl4g8La8LcsSg8LE86bbarc97faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc98faha8KfghRbbaiRbog8Kcl4g8La8LcsSg8LE86bbarc99faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc9:faha8KfghRbbaiRbrgicl4g8Ka8KcsSg8KE86bbarcufaha8KfgrRbbaicsGgiaicsSgiE86bbaraifhixekarai8Pbw83bwarai8Pbb83bbaiczfhikdnaoaC9pmbalcdfhlaoczfhraPai9RcL0mekkaoaC6moaimexokaCmva8FTmvkaqaAfhqa8Ecefg8Ecl9hmbkdndndndnawTmbasa8Acd4fRbbgociGPlbedrbkaATmdaza8Afh8Fazcj;cbfhhcbh8EaEhaina8FRbbhraahocbhlinaoahalfRbbgqce4cbaqceG9R7arfgr86bbaoadfhoaAalcefgl9hmbkaacefhaa8Fcefh8FahaAfhha8Ecefg8Ecl9hmbxikkaATmeaza8Afhaazcj;cbfhhcbhoceh8EaYh8FinaEaofhlaa8Vbbhrcbhoinala8FaofRbbcwtahaofRbbgqVc;:FiGce4cbaqceG9R7arfgr87bbaladfhlaLaocefgofmbka8FaQfh8FcdhoaacdfhaahaQfhha8EceGhlcbh8EalmbxdkkaATmbaocl4h8Eaza8AfRbbhqcwhoa3hlinalRbbaotaqVhqalcefhlaocwfgoca9hmbkcbhhaEh8FaYhainazcj;cbfahfRbbhrcwhoaahlinalRbbaotarVhralaAfhlaocwfgoca9hmbkara8E94aq7hqcbhoa8Fhlinalaqao486bbalcefhlaocwfgoca9hmbka8Fadfh8FaacefhaahcefghaA9hmbkkaEclfhEa3clfh3a8Aclfg8Aad6mbkaXazcjdfaAad2z:jjjjb8AazazcjdfaAcufad2fadz:jjjjb8AaAaOfhOaihxaimbkc9:hoxdkcbc99aPax9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaok:ysezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:kjjjb8Aav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk:4ioiue99dud99dud99dnaeTmbcbhiabhlindndnal8Uebgv:YgoJ:ji:1Salcof8UebgrciVgw:Y:vgDNJbbbZJbbb:;avcu9kEMgq:lJbbb9p9DTmbaq:Ohkxekcjjjj94hkkalclf8Uebhvalcdf8UebhxalarcefciGcetfak87ebdndnax:YgqaDNJbbbZJbbb:;axcu9kEMgm:lJbbb9p9DTmbam:Ohxxekcjjjj94hxkabaiarciGgkfcd7cetfax87ebdndnav:YgmaDNJbbbZJbbb:;avcu9kEMgP:lJbbb9p9DTmbaP:Ohvxekcjjjj94hvkalarcufciGcetfav87ebdndnawaw2:ZgPaPMaoaoN:taqaqN:tamamN:tgoJbbbbaoJbbbb9GE:raDNJbbbZMgD:lJbbb9p9DTmbaD:Ohrxekcjjjj94hrkalakcetfar87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk:Tvirud99eudndnadcl9hmbaeTmeindndnabRbbgiabcefgl8Sbbgvabcdfgo8Sbbgrf9R:YJbbuJabcifgwRbbgdce4adVgDcd4aDVgDcl4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax86bbdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao86bbdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai86bbdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad86bbabclfhbaecufgembxdkkaeTmbindndnab8Vebgiabcdfgl8Uebgvabclfgo8Uebgrf9R:YJbFu9habcofgw8Vebgdce4adVgDcd4aDVgDcl4aDVgDcw4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax87ebdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao87ebdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai87ebdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad87ebabcwfhbaecufgembkkk9teiucbcbyd:K:G:cjbgeabcifc98GfgbBd:K:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkk83dbcj:Gdk8Kbbbbdbbblbbbwbbbbbbbebbbdbbblbbbwbbbbc:K:Gdkl8W:qbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuixkbbebeeddddilve9Weeeviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WbwY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbDl79IV9Rbqq:W9Dklbzik94evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaeai86b:q:W:cjbaecitab8Piw83i:q:G:cjbaecefgecjd9hmbkk:JBl8Aud97dur978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaialfgxar9RhodnadTgmmbavaoad;8qbbkaicefhPcj;abad9Uc;WFbGcjdadca0EhsdndndnadTmbaoadfhzcbhHinaeaH9nmdaxaP9RaD6miabaHad2fhOaPaDfhAasaeaH9RaHasfae6EgCcsfgocl4cifcd4hXavcj;cbfaoc9WGgQcetfhLavcj;cbfaQci2fhKavcj;cbfaQfhYcbh8Aaoc;ab6hEincbh3dnawTmbaPa8Acd4fRbbh3kcbh5avcj;cbfh8Eindndndndna3a5cet4ciGgoc9:fPdebdkaxaA9RaQ6mwdnaQTmbavcj;cbfa5aQ2faAaQ;8qbbkaAaCfhAxdkaQTmeavcj;cbfa5aQ2fcbaQ;8kbxekaxaA9RaX6moaoclVcbawEhraAaXfhocbhidnaEmbaxao9Rc;Gb6mbcbhlina8EalfhidndndndndndnaAalco4fRbbgqciGarfPDbedibledibkaipxbbbbbbbbbbbbbbbbpklbxlkaiaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiaopbbbpklbaoczfhoxekaiaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcd4ciGarfPDbedibledibkaiczfpxbbbbbbbbbbbbbbbbpklbxlkaiczfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiczfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiczfaopbbbpklbaoczfhoxekaiczfaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcl4ciGarfPDbedibledibkaicafpxbbbbbbbbbbbbbbbbpklbxlkaicafaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaicafaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaicafaopbbbpklbaoczfhoxekaicafaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqco4arfPDbedibledibkaic8Wfpxbbbbbbbbbbbbbbbbpklbxlkaic8Wfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaoclffaqRb:q:W:cjbfhoxikaic8Wfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaocwffaqRb:q:W:cjbfhoxdkaic8Wfaopbbbpklbaoczfhoxekaic8WfaopbbdaoRbbgicitpbi:q:G:cjbaiRb:q:W:cjbgipsaoRbegqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbaiaocdffaqRb:q:W:cjbfhokalc;abfhialcjefaQ0meaihlaxao9Rc;Fb0mbkkdnaiaQ9pmbaici4hlinaxao9RcK6mwa8EaifhqdndndndndndnaAaico4fRbbalcoG4ciGarfPDbedibledibkaqpxbbbbbbbbbbbbbbbbpkbbxlkaqaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaoclffagRb:q:W:cjbfhoxikaqaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaocwffagRb:q:W:cjbfhoxdkaqaopbbbpkbbaoczfhoxekaqaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpkbbahaocdffagRb:q:W:cjbfhokalcdfhlaiczfgiaQ6mbkkaohAaoTmoka8EaQfh8Ea5cefg5cl9hmbkdndndndnawTmbaza8Acd4fRbbglciGPlbedwbkaQTmdavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep9Ta8Fpxeeeeeeeeeeeeeeeegap9op9Hp9rg8Fa8Jp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ugap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp9Ugap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp9Ugap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9AbbbaladfhlaoczfgoaQ6mbxikkaQTmeavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep:nea8Fpxebebebebebebebebgap9op:bep9rg8Fa8Jp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oegap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp:oegap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp:oegap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9AbbbaladfhlaoczfgoaQ6mbxdkkaQTmbcbhocbalcl4gl9Rc8FGhiavcjdfa8Afhrava8Afpbdbhainaravcj;cbfaofpblbg8JaYaofpblbg8KpmbzeHdOiAlCvXoQrLg8LaLaofpblbg8MaKaofpblbg8NpmbzeHdOiAlCvXoQrLgypmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Faap9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8LaypmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwKDYq8AkEx3m5P8Es8Fg8Ja8Ma8NpmwKDYq8AkEx3m5P8Es8Fg8KpmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9AbbbaradfhraoczfgoaQ6mbkka8Aclfg8Aad6mbkdnaCad2goTmbaOavcjdfao;8qbbkdnammbavavcjdfaCcufad2fad;8qbbkaCaHfhHc9:hoaAhPaAmbxlkkaeTmbaDalfhrcbhocuhlinaralaD9RglfaD6mdasaeao9Raoasfae6Eaofgoae6mbkaial9RhPkcbc99axaP9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaokwbz:bjjjbkNsezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk;Toio97eue97aec98Ghedndnadcl9hmbaeTmecbhdinababpbbbgicKp:RecKp:Sep;6eglaicwp:RecKp:Sep;6ealp;Geaiczp:RecKp:Sep;6egvp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgwp9op9rp;Keglpxbb;:9cbb;:9cbb;:9cbb;:9calalp;Meaoaop;Meavaravawp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFbbbFbbbFbbbFbbbp9oaipxbbbFbbbFbbbFbbbFp9op9qalavp;Mearp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaoavp;Mearp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgDaDpbbbgipxbbbbbbFFbbbbbbFFgwp9oabpbbbgoaipmbediwDqkzHOAKY8AEgvczp:Reczp:Sep;6eglaoaipmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eavczp:Sep;6egvp;Gealp;Gep;Kep;Legipxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgqp9op9rp;Keglpxb;:FSb;:FSb;:FSb;:FSalalp;Meaiaip;Meavaravaqp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbp9oaiavp;Mearp;Keczp:Rep9qgialavp;Mearp;KepxFFbbFFbbFFbbFFbbp9oglpmwDKYqk8AExm35Ps8E8Fp9qpkbbabaoawp9oaialpmbezHdiOAlvCXorQLp9qpkbbabcafhbadclfgdae6mbkkk;2ileue97euo97dnaec98GgiTmbcbheinabcKfpx:ji:1S:ji:1S:ji:1S:ji:1SabpbbbglabczfgvpbbbgopmlvorxmPsCXQL358E8Fgrczp:Segwpxibbbibbbibbbibbbp9qp;6egDp;NegqaDaDp;MegDaDp;KealaopmbediwDqkzHOAKY8AEgDczp:Reczp:Sep;6eglalp;MeaDczp:Sep;6egoaop;Mearczp:Reczp:Sep;6egrarp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jep;Mepxbbn0bbn0bbn0bbn0gDp;KepxFFbbFFbbFFbbFFbbgkp9oaqaop;MeaDp;Keczp:Rep9qgoaqalp;MeaDp;Keakp9oaqarp;MeaDp;Keczp:Rep9qgDpmwDKYqk8AExm35Ps8E8Fglp5eawclp:RegqpEi:T:j83ibavalp5baqpEd:T:j83ibabcwfaoaDpmbezHdiOAlvCXorQLgDp5eaqpEe:T:j83ibabaDp5baqpEb:T:j83ibabcafhbaeclfgeai6mbkkkuee97dnadcd4ae2c98GgeTmbcbhdinababpbbbgicwp:Recwp:Sep;6eaicep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbabczfhbadclfgdae6mbkkk:Sodw97euaec98Ghedndnadcl9hmbaeTmecbhdinabpxbbuJbbuJbbuJbbuJabpbbbgicKp:TeglaicYp:Tep9qgvcdp:Teavp9qgvclp:Teavp9qgop;6ep;Negvaicwp:RecKp:SegraipxFbbbFbbbFbbbFbbbgwp9ogDp:Uep;6ep;Mepxbbn0bbn0bbn0bbn0gqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9oavaDarp:Xeaiczp:RecKp:Segip:Uep;6ep;Meaqp;Keawp9op9qavaDaraip:Uep:Xep;6ep;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qavaoalcep:Rep9oalpxebbbebbbebbbebbbp9op9qp;6ep;Meaqp;KecKp:Rep9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgkpxbFu9hbFu9hbFu9hbFu9habpbbbglakpbbbgrpmlvorxmPsCXQL358E8Fgvczp:TegqavcHp:Tep9qgicdp:Teaip9qgiclp:Teaip9qgicwp:Teaip9qgop;6ep;NegialarpmbediwDqkzHOAKY8AEgDpxFFbbFFbbFFbbFFbbglp9ograDczp:Segwp:Ueavczp:Reczp:SegDp:Xep;6ep;Mepxbbn0bbn0bbn0bbn0gvp;Kealp9oaiarawaDp:Uep:Xep;6ep;Meavp;Keczp:Rep9qgwaiaoaqcep:Rep9oaqpxebbbebbbebbbebbbp9op9qp;6ep;Meavp;Keczp:ReaiaDarp:Uep;6ep;Meavp;Kealp9op9qgipmwDKYqk8AExm35Ps8E8FpkbbabawaipmbezHdiOAlvCXorQLpkbbabcafhbadclfgdae6mbkkk9teiucbcbydj:G:cjbgeabcifc98GfgbBdj:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkxebcj:Gdklz:zbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var s=WebAssembly.validate(t)?o(e):o(i),r,a=WebAssembly.instantiate(s,{}).then(function(p){r=p.instance,r.exports.__wasm_call_ctors()});function o(p){for(var y=new Uint8Array(p.length),v=0;v<p.length;++v){var _=p.charCodeAt(v);y[v]=_>96?_-97:_>64?_-39:_+4}for(var M=0,v=0;v<p.length;++v)y[M++]=y[v]<60?n[y[v]]:(y[v]-60)*64+y[++v];return y.buffer.slice(0,M)}function l(p,y,v,_,M,E,w){var b=p.exports.sbrk,T=_+3&-4,R=b(T*M),P=b(E.length),D=new Uint8Array(p.exports.memory.buffer);D.set(E,P);var I=y(R,_,M,P,E.length);if(I==0&&w&&w(R,T,M),v.set(D.subarray(R,R+_*M)),b(R-b(0)),I!=0)throw new Error("Malformed buffer data: "+I)}var c={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp",COLOR:"meshopt_decodeFilterColor"},u={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},h=[],f=0;function d(p){var y={object:new Worker(p),pending:0,requests:{}};return y.object.onmessage=function(v){var _=v.data;y.pending-=_.count,y.requests[_.id][_.action](_.value),delete y.requests[_.id]},y}function g(p){for(var y="self.ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(s)+"]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = "+m.name+";"+l.toString()+m.toString(),v=new Blob([y],{type:"text/javascript"}),_=URL.createObjectURL(v),M=h.length;M<p;++M)h[M]=d(_);for(var M=p;M<h.length;++M)h[M].object.postMessage({});h.length=p,URL.revokeObjectURL(_)}function x(p,y,v,_,M){for(var E=h[0],w=1;w<h.length;++w)h[w].pending<E.pending&&(E=h[w]);return new Promise(function(b,T){var R=new Uint8Array(v),P=++f;E.pending+=p,E.requests[P]={resolve:b,reject:T},E.object.postMessage({id:P,count:p,size:y,source:R,mode:_,filter:M},[R.buffer])})}function m(p){var y=p.data;self.ready.then(function(v){if(!y.id)return self.close();try{var _=new Uint8Array(y.count*y.size);l(v,v.exports[y.mode],_,y.count,y.size,y.source,v.exports[y.filter]),self.postMessage({id:y.id,count:y.count,action:"resolve",value:_},[_.buffer])}catch(M){self.postMessage({id:y.id,count:y.count,action:"reject",value:M})}})}return{ready:a,supported:!0,useWorkers:function(p){g(p)},decodeVertexBuffer:function(p,y,v,_,M){l(r,r.exports.meshopt_decodeVertexBuffer,p,y,v,_,r.exports[c[M]])},decodeIndexBuffer:function(p,y,v,_){l(r,r.exports.meshopt_decodeIndexBuffer,p,y,v,_)},decodeIndexSequence:function(p,y,v,_){l(r,r.exports.meshopt_decodeIndexSequence,p,y,v,_)},decodeGltfBuffer:function(p,y,v,_,M,E){l(r,r.exports[u[M]],p,y,v,_,r.exports[c[E]])},decodeGltfBufferAsync:function(p,y,v,_,M){return h.length>0?x(p,y,v,u[_],c[M]):a.then(function(){var E=new Uint8Array(p*y);return l(r,r.exports[u[_]],E,p,y,v,r.exports[c[M]]),E})}}})();var IS=.85,zm=Object.freeze({"building-tall":2.2,"building-small":1.2,house:.6,shop:.7,office:1.6,factory:.9,school:.8,clinic:.9,market:.5,townhall:1.1,station:.7,"tram-stop":.45,wastewater:.5,"water-tower":1.4,"wind-turbine":1.8,solar:.15,"power-plant":1.3,compost:.4,treatment:.5,park:.3,tree:.9,pine:1.1,bush:.35,flower:.12,crop:.12,rock:.3,grass:.15,reed:.3,"road-edge-node":.02,"road-edge-straight":.02}),LS=Object.freeze({"building-tall":[X.wallBeige,X.roofSlate],"building-small":[X.wallCream,X.roofOrange],house:[X.wallCream,X.roofRed],shop:[X.wallBeige,X.roofOrange],office:[X.sidewalk,X.roofSlate],factory:[X.metal,X.metalLight],school:[X.wallTan,X.roofRed],clinic:[X.wallCream,X.marking],market:[X.wallTan,X.sun],townhall:[X.wallCream,X.roofSlate],station:[X.wallBeige,X.metal],"tram-stop":[X.metal,X.roofSlate],wastewater:[X.sidewalk,X.river],"water-tower":[X.metalLight,X.metal],"wind-turbine":[X.metalLight,X.marking],solar:[X.roofSlate,X.metal],"power-plant":[X.metal,X.rock],compost:[X.wood,X.soil],treatment:[X.sidewalk,X.river],park:[X.grassLight,X.blossom],tree:[X.wood,X.forestDark],pine:[X.wood,X.forestDark],bush:[X.forestDark,X.grass],flower:[X.forestDark,X.blossom],crop:[X.soil,X.wheat],rock:[X.rock,X.rockLight],grass:[X.grassLight,X.grassLight],reed:[X.wetland,X.soil],"road-edge-node":[X.asphalt,X.asphalt],"road-edge-straight":[X.asphalt,X.asphalt]}),DS=[X.wallBeige,X.roofOrange];function Hs(i){let e=null;for(let t of Object.keys(zm))(i===t||i.startsWith(t+"-")||i.startsWith(t))&&(!e||t.length>e.length)&&(e=t);return e}function NS(i){let e=Hs(i);return e?zm[e]:.8}function FS(){return new rn({vertexColors:!0})}var yl=new ue;function jt(i,e){return yl.set(e),xf(i,yl.r,yl.g,yl.b)}function xf(i,e,t,n){let s=i.attributes.position.count,r=new Float32Array(s*3);for(let a=0;a<s;a++)r[a*3]=e,r[a*3+1]=t,r[a*3+2]=n;return i.setAttribute("color",new st(r,3)),i}function vl(i,e=i.itemSize){if(i.array instanceof Float32Array&&!i.normalized&&i.itemSize===e&&!i.isInterleavedBufferAttribute)return i;let t=i.count,n=new Float32Array(t*e),s=[r=>i.getX(r),r=>i.getY(r),r=>i.getZ(r),r=>i.getW(r)];for(let r=0;r<t;r++)for(let a=0;a<e;a++)n[r*e+a]=a<i.itemSize?s[a](r):1;return new st(n,e)}function Gm(i,e){for(let t of Object.keys(i.attributes))t==="position"||t==="normal"||t==="color"||e&&t==="uv"||i.deleteAttribute(t);if(i.morphAttributes={},i.setAttribute("position",vl(i.attributes.position,3)),i.attributes.normal?i.setAttribute("normal",vl(i.attributes.normal,3)):i.computeVertexNormals(),i.attributes.color&&i.setAttribute("color",vl(i.attributes.color,3)),e&&i.attributes.uv&&i.setAttribute("uv",vl(i.attributes.uv,2)),i.index)!(i.index.array instanceof Uint32Array)&&!(i.index.array instanceof Uint16Array)&&i.setIndex(new st(Uint32Array.from(i.index.array),1));else{let t=i.attributes.position.count,n=t>65535?new Uint32Array(t):new Uint16Array(t);for(let s=0;s<t;s++)n[s]=s;i.setIndex(new st(n,1))}return i}function ki(i){let e=i.length===1?i[0]:gl(i,!1);if(!e)throw new Error("fusion de géométries impossible (attributs incompatibles)");return e.clearGroups(),e.computeBoundingBox(),e.computeBoundingSphere(),e}function OS(i){i.computeBoundingBox();let e=i.boundingBox;return i.translate(-(e.min.x+e.max.x)/2,-e.min.y,-(e.min.z+e.max.z)/2),i.computeBoundingBox(),i.computeBoundingSphere(),i}function Jt(i,e,t,n,s=0,r=0,a=0){let o=new kt(i,e,t);return o.translate(s,r+e/2,a),jt(o,n)}function US(i,e,t,n,s){let r=new mn(0,Math.SQRT1_2,e,4,1,!1);return r.rotateY(Math.PI/4),r.rotateX(Math.PI/2),r.scale(i*1.08,t,1.04),r.translate(0,s+t/2,0),jt(r,n)}function kS(i){let e=Hs(i),t=NS(i),[n,s]=LS[e]||DS,r=IS,a;switch(e){case"tree":{let l=new mn(.05,.07,.3,6);l.translate(0,.15,0);let c=new es(.3,1);c.scale(1,(t-.3)/.6,1),c.translate(0,.3+(t-.3)/2,0),a=[jt(l,n),jt(c,s)];break}case"pine":{let l=new mn(.04,.06,.25,6);l.translate(0,.125,0);let c=new Qi(.27,t-.2,7);c.translate(0,.2+(t-.2)/2,0),a=[jt(l,n),jt(c,s)];break}case"bush":{let l=new es(.22,1);l.scale(1.1,t/.44,1),l.translate(0,t/2,0),a=[jt(l,n)];break}case"flower":{let l=new mn(.012,.012,.09,4);l.translate(0,.045,0);let c=new Ps(.035,6,4);c.translate(0,.1,0),a=[jt(l,n),jt(c,s)];break}case"rock":{let l=new Ra(.2,0);l.scale(1,.75,.85),l.translate(0,.14,0),a=[jt(l,n)];break}case"crop":{a=[Jt(.8,.03,.8,n)];for(let l=0;l<4;l++)a.push(Jt(.8,.09,.12,s,0,.03,-.3+l*.2));break}case"grass":case"reed":{let l=new Qi(.06,t,4);l.translate(0,t/2,0),a=[jt(l,n)];break}case"road-edge-node":a=[Jt(.3,.022,.3,n)];break;case"road-edge-straight":a=[Jt(1,.02,.3,n)];break;case"house":case"school":case"townhall":case"shop":case"market":case"station":case"clinic":{let l=t*.7;a=[Jt(r*.9,l,r*.9,n),US(r*.9,r*.9,t-l,s,l)];break}case"factory":{a=[Jt(r,t,r,n),Jt(.14,.7,.14,s,r*.3,t,-r*.3)];break}case"wastewater":{a=[Jt(r,.06,r,n)];for(let l of[-.2,.2]){let c=new mn(.18,.18,t-.06,10);c.translate(l,.06+(t-.06)/2,0),a.push(jt(c,s))}break}case"tram-stop":{a=[Jt(r*.9,.04,r*.5,X.sidewalk),Jt(.05,t,.05,n,-.3,.04,0),Jt(.05,t,.05,n,.3,.04,0),Jt(r*.85,.04,.4,s,0,t,0)];break}case"wind-turbine":{let l=new mn(.03,.05,t,6);l.translate(0,t/2,0),a=[jt(l,n),Jt(.06,.9,.06,s,0,t-.45,.05)];break}case"solar":a=[Jt(r,t,r,n),Jt(r*.9,.02,r*.9,s,0,t,0)];break;default:a=[Jt(r,t,r,n),Jt(r,.04,r,s,0,t,0)]}let o=ki(a.map(l=>Gm(l,!1)));return OS(o)}var bf=i=>i<=.04045?i/12.92:Math.pow((i+.055)/1.055,2.4);function BS(i,e){if(e.has(i.uuid))return e.get(i.uuid);let t=null;try{let n=i.image,s=n.width||n.naturalWidth,r=n.height||n.naturalHeight;if(n&&s&&r){let a=typeof OffscreenCanvas=="function"?new OffscreenCanvas(s,r):typeof document<"u"?document.createElement("canvas"):null;if(a){a.width=s,a.height=r;let o=a.getContext("2d",{willReadFrequently:!0});o.drawImage(n,0,0),t={width:s,height:r,data:o.getImageData(0,0,s,r).data}}}}catch(n){console.warn("[models] texture illisible, matériau texturé conservé",n),t=null}return e.set(i.uuid,t),t}function zS(i,e,t,n){let s=i.attributes.uv,r=i.attributes.position.count,a=new Float32Array(r*3);e.updateMatrix();let o=e.matrix.elements,l=e.flipY;for(let c=0;c<r;c++){let u=s.getX(c),h=s.getY(c),f=o[0]*u+o[3]*h+o[6],d=o[1]*u+o[4]*h+o[7];f-=Math.floor(f),d-=Math.floor(d);let g=Math.min(t.width-1,Math.floor(f*t.width)),x=Math.floor(l?(1-d)*t.height:d*t.height),p=(Math.min(t.height-1,Math.max(0,x))*t.width+g)*4;a[c*3]=bf(t.data[p]/255)*n.r,a[c*3+1]=bf(t.data[p+1]/255)*n.g,a[c*3+2]=bf(t.data[p+2]/255)*n.b}return i.setAttribute("color",new st(a,3)),i.deleteAttribute("uv"),i}function GS(i,e){if(/^(https?:)?\/\//.test(e)||e.startsWith("/")||e.startsWith("data:"))return e;let t=i.split(/[?#]/)[0];return t.slice(0,t.lastIndexOf("/")+1)+e}var HS=new ue(1,1,1);function VS(i){return i?(Array.isArray(i.exclude)?i.exclude:Array.isArray(i.nodes)?i.nodes:[]).filter(t=>typeof t=="string"&&t.length>0):[]}function WS(i,e){if(!e.length)return null;for(let t=i;t;t=t.parent)if(e.includes(t.name))return t;return null}function qS(i,e){return e.set(i.elements[12],i.elements[13],i.elements[14])}function XS(i,e,t=[]){i.updateMatrixWorld(!0);let n=[],s=[],r=new Map,a=null,o=new Me;if(i.traverse(p=>{if(!p.isMesh||!p.geometry)return;let y=WS(p,t),v=null;y&&(v=r.get(y),v||(v={geometries:[],pivot:qS(y.matrixWorld,new U)},r.set(y,v)));let _=Array.isArray(p.material)?p.material:[p.material],M=p.geometry.groups.length&&Array.isArray(p.material)?p.geometry.groups:[null];for(let E of M){let w=_[E?E.materialIndex:0]||_[0],b=p.geometry.clone();E&&b.index&&b.setIndex(new st(b.index.array.slice(E.start,E.start+E.count),1));let T=w&&w.color?w.color:HS,R=w&&w.map;Gm(b,!!R),v?(o.copy(p.matrixWorld),o.elements[12]-=v.pivot.x,o.elements[13]-=v.pivot.y,o.elements[14]-=v.pivot.z,b.applyMatrix4(o)):b.applyMatrix4(p.matrixWorld);let P=!1;if(R&&b.attributes.uv){let D=BS(R,e);D?zS(b,R,D,T):(a=a||R,b.attributes.color||xf(b,T.r,T.g,T.b),P=!0)}else if(b.deleteAttribute("uv"),b.attributes.color){let D=b.attributes.color.array;for(let I=0;I<D.length;I+=3)D[I]*=T.r,D[I+1]*=T.g,D[I+2]*=T.b}else xf(b,T.r,T.g,T.b);v?(b.attributes.uv&&b.deleteAttribute("uv"),v.geometries.push(b)):P?s.push(b):n.push(b)}}),!n.length&&!s.length){if(!r.size)throw new Error("aucun mesh dans le GLB");for(let p of r.values())for(let y of p.geometries)y.translate(p.pivot.x,p.pivot.y,p.pivot.z),n.push(y);r.clear()}let l,c;if(s.length){for(let p of n)p.setAttribute("uv",new st(new Float32Array(p.attributes.position.count*2),2));l=s.concat(n),c="textured"}else l=n,c="colored";let u=ki(l),h={};for(let[p,y]of r)h[p.name]={geometry:ki(y.geometries),pivot:y.pivot};let f=u.boundingBox.clone(),d=new Tt;for(let p of Object.values(h))d.copy(p.geometry.boundingBox).translate(p.pivot),f.union(d);let g=-(f.min.x+f.max.x)/2,x=-f.min.y,m=-(f.min.z+f.max.z)/2;u.translate(g,x,m),u.computeBoundingBox(),u.computeBoundingSphere();for(let p of Object.values(h))p.pivot=[p.pivot.x+g,p.pivot.y+x,p.pivot.z+m];return{geometry:u,kind:c,texture:a,parts:h}}async function Hm(i,e={}){let t=e.fetch||(typeof fetch=="function"?fetch.bind(globalThis):null),n=new Map,s=new Map,r=new Map,a=new Map,o=FS(),l=null,c=ym,u=[];if(i&&t)try{let d=await t(i);if(!d.ok)throw new Error(`HTTP ${d.status}`);l=await d.json(),Array.isArray(l.palette)&&l.palette.length&&(c=l.palette)}catch(d){u.push({id:"(manifest)",error:String(d&&d.message||d)}),console.warn(`[models] manifeste absent ou illisible (${i}) : boîtes de remplacement.`,d)}let h=l&&l.models?Object.entries(l.models):[];if(h.length){let d=new zr;try{await Gr.ready,d.setMeshoptDecoder(Gr)}catch(x){console.warn("[models] décodeur meshopt indisponible",x)}let g=0;await Promise.all(h.map(async([x,m])=>{try{let p=GS(i,m.file||`${x}.glb`),y=await d.loadAsync(p),{geometry:v,kind:_,texture:M,parts:E}=XS(y.scene,a,VS(m)),w=o;_==="textured"&&M&&(r.has(M.uuid)||(M.colorSpace=Et,r.set(M.uuid,new rn({map:M,vertexColors:!0}))),w=r.get(M.uuid));let b={};for(let[T,R]of Object.entries(E))b[T]={name:T,geometry:R.geometry,material:o,pivot:R.pivot,height:R.geometry.boundingBox.max.y,source:"glb"};n.set(x,{geometry:v,material:w,height:v.boundingBox.max.y,source:"glb",entry:m,parts:b})}catch(p){u.push({id:x,error:String(p&&p.message||p)}),console.warn(`[models] modèle « ${x} » illisible : remplacement.`,p)}finally{g++,e.onProgress&&e.onProgress(g,h.length)}}))}let f={palette:c,manifest:l,errors:u,materials:{vertex:o,textured:r},get ids(){return Array.from(n.keys())},has(d){return n.has(d)},get(d){return n.get(d)||null},fallback(d){if(!s.has(d)){let g=kS(d);s.set(d,{geometry:g,material:o,height:g.boundingBox.max.y,source:"fallback"})}return s.get(d)},resolve(d){return n.get(d)||f.fallback(d)},getPart(d,g){let x=n.get(d);return x&&x.parts&&x.parts[g]||null},partNames(d){let g=n.get(d);return g&&g.parts?Object.keys(g.parts):[]},dispose(){for(let d of n.values())if(d.geometry.dispose(),d.parts)for(let g of Object.values(d.parts))g.geometry.dispose();for(let d of s.values())d.geometry.dispose();for(let d of r.values())d.map&&d.map.dispose(),d.dispose();o.dispose(),n.clear(),s.clear(),r.clear(),a.clear()}};return f}function bi(i,e,t,n=0){let s=(i|0)^2654435769;return s=Math.imul(s^(e|0),2246822507),s^=s>>>13,s=Math.imul(s^(t|0),3266489909),s^=s>>>16,s=Math.imul(s^(n|0),668265263),s^=s>>>15,s=Math.imul(s,374761393),s^=s>>>13,(s>>>0)/4294967296}function Mn(i,e,t){return i+(e-i)*t}var Ml=new U,Sl=new Ut,wl=new U,jS=new U(0,1,0);function xi(i,e,t,n,s=0,r=1){return Ml.set(e,t,n),Sl.setFromAxisAngle(jS,s),wl.set(r,r,r),i.compose(Ml,Sl,wl)}function El(i,e,t,n,s,r,a){return Ml.set(e,t,n),Sl.identity(),wl.set(s,r,a),i.compose(Ml,Sl,wl)}function Tl(i,e=new Set){i.traverse(t=>{if(t.geometry&&!t.geometry.userData.shared&&t.geometry.dispose(),t.material&&!e.has(t.material)){let n=Array.isArray(t.material)?t.material:[t.material];for(let s of n)s.dispose()}t.isBatchedMesh&&typeof t.dispose=="function"&&t.dispose()})}var Vs=.12,jm=-.05,KS=.006,Vm=Object.freeze([.22,.42]),Wm=.5,qm=.015,YS=.25,_f=Object.freeze({river:Object.freeze([qm,1]),lake:Object.freeze([qm,0]),wetland:Object.freeze([.0025,0])}),Km=1,Ym=2,Jm=4,Zm=8,JS=X.grass,ZS=Object.freeze({N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]});function $S(i){let e=yi[i];return e&&X[e.color]||JS}function Hr(i){return i==="river"||i==="lake"}function Xm(i){return i==="wetland"}function QS(i){let e=ZS[i];return e?[e[0],e[1]]:[0,0]}function ew(i,e,t){let n=(r,a)=>{if(r<0||a<0||r>=i.cols||a>=i.rows)return!1;let o=i.tiles[a*i.cols+r];return!o||!Hr(o.terrain)},s=0;return n(e,t-1)&&(s|=Km),n(e+1,t)&&(s|=Ym),n(e,t+1)&&(s|=Jm),n(e-1,t)&&(s|=Zm),s}function tw(i){return[i&Km?1:0,i&Ym?1:0,i&Jm?1:0,i&Zm?1:0]}function $m(i,e,t){return Mn(Vm[0],Vm[1],bi(i.seed||0,e,t,7))}function Al(i,e,t){let n=i.tiles[t*i.cols+e];return n?n.terrain==="hill"?$m(i,e,t):Hr(n.terrain)?jm:0:0}var nw=`
uniform float uTime;
attribute vec2 aFlow;
attribute vec4 aBanks;
attribute vec2 aStyle;
varying vec2 vWaterPos;
varying vec2 vLocalPos;
varying vec2 vFlow;
varying vec4 vBanks;
varying vec2 vStyle;
`,iw=`
vec3 transformed = vec3( position );
{
	vec4 wp = vec4( position, 1.0 );
	#ifdef USE_INSTANCING
		wp = instanceMatrix * wp;
	#endif
	wp = modelMatrix * wp;
	vWaterPos = wp.xz;
	vLocalPos = position.xz;
	vFlow = aFlow;
	vBanks = aBanks;
	vStyle = aStyle;
	// Ondulation douce : deux fréquences croisées, fonction de la position monde (continue d'une case à l'autre).
	float w1 = sin( wp.x * 6.1 + wp.z * 2.3 + uTime * 1.9 );
	float w2 = sin( wp.x * 2.7 - wp.z * 5.3 - uTime * 1.3 );
	transformed.y += aStyle.x * ( 0.6 * w1 + 0.4 * w2 );
}
`,sw=`
uniform float uTime;
varying vec2 vWaterPos;
varying vec2 vLocalPos;
varying vec2 vFlow;
varying vec4 vBanks;
varying vec2 vStyle;
`,rw=`
{
	// Bandes claires qui défilent dans le sens du courant (FLOW_SPEED u/s) ; nulles sur l'eau dormante (aStyle.y = 0).
	float along = dot( vWaterPos, vFlow );
	float across = vWaterPos.x * vFlow.y - vWaterPos.y * vFlow.x;
	float phase = ( along - uTime * ${YS.toFixed(3)} ) * 12.566 + sin( across * 4.0 + uTime * 0.6 ) * 0.8;
	float bands = smoothstep( 0.55, 0.98, sin( phase ) ) * 0.12 * vStyle.y; // bandes douces, lisibles sans dominer
	// Scintillement : deux ondes croisées, lentes et gauchies l'une par l'autre (pas de grille régulière), sur toute eau.
	float sx = sin( vWaterPos.x * 9.0 + uTime * 1.5 + sin( vWaterPos.y * 3.1 + uTime * 0.5 ) * 1.7 );
	float sz = sin( vWaterPos.y * 7.0 - uTime * 1.1 + sin( vWaterPos.x * 2.3 - uTime * 0.4 ) * 1.9 );
	float shimmer = smoothstep( 0.6, 1.0, sx * sz ) * 0.07;
	// Écume : fin liseré clair le long des côtés bordés de terre (nord = z local −0,5, est = x local +0,5).
	float edge = 0.075 + 0.02 * sin( ( vWaterPos.x + vWaterPos.y ) * 9.0 + uTime * 1.4 );
	float foam = 0.0;
	foam = max( foam, vBanks.x * ( 1.0 - smoothstep( 0.0, edge, 0.5 + vLocalPos.y ) ) );
	foam = max( foam, vBanks.y * ( 1.0 - smoothstep( 0.0, edge, 0.5 - vLocalPos.x ) ) );
	foam = max( foam, vBanks.z * ( 1.0 - smoothstep( 0.0, edge, 0.5 - vLocalPos.y ) ) );
	foam = max( foam, vBanks.w * ( 1.0 - smoothstep( 0.0, edge, 0.5 + vLocalPos.x ) ) );
	foam *= 0.75 + 0.25 * sin( uTime * 2.1 + along * 7.0 );
	float light = clamp( bands + shimmer + foam * 0.5, 0.0, 0.6 );
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0 ), light );
}
`;function aw(){let i={uTime:{value:0}},e=new rn({color:16777215,emissive:new ue(X.river).multiplyScalar(.22)});return e.onBeforeCompile=t=>{t.uniforms.uTime=i.uTime,t.vertexShader=nw+t.vertexShader.replace("#include <begin_vertex>",iw),t.fragmentShader=sw+t.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+rw)},e.customProgramCacheKey=()=>"tiletown-water-2",{material:e,uniforms:i}}function Qm(){let i=new Rt;i.name="ground";let e=new kt(1,1,1),t=new rn({color:16777215}),n=new Cs(1,1,2,2);n.rotateX(-Math.PI/2);let{material:s,uniforms:r}=aw(),a=new rn({color:new ue(X.soil).multiplyScalar(.72)}),o=new kt(1,1,1),l=new ue(X.river),c=null,u=null,h=null,f=null,d=null,g=null,x=null,m=null,p={tiles:0,land:0,water:0,wetland:0,hills:0,drawables:0},y=new ue,v=new ue,_=new Me;function M(I,C){return I.copy(C).lerp(l,.5)}function E(I,C){let N=Math.max(1,C),z=n.clone();z.setAttribute("aFlow",new pn(new Float32Array(N*2),2)),z.setAttribute("aBanks",new pn(new Float32Array(N*4),4)),z.setAttribute("aStyle",new pn(new Float32Array(N*2),2));let F=new Yt(z,s,N);return F.name=I,F.count=C,F.castShadow=!1,F.receiveShadow=!0,F.frustumCulled=!1,F.visible=C>0,F}function w(I,C,N,z,F){let W=I.geometry.attributes,V=QS(z);W.aFlow.array[C*2]=V[0],W.aFlow.array[C*2+1]=V[1];let Y=tw(F);for(let Q=0;Q<4;Q++)W.aBanks.array[C*4+Q]=Y[Q];W.aStyle.array[C*2]=N[0],W.aStyle.array[C*2+1]=N[1]}function b(){for(let I of[c,u,h,f])I&&(i.remove(I),(I===u||I===h)&&I.geometry.dispose());c=u=h=f=null,p.drawables=0}function T(I){b(),d=I;let{cols:C,rows:N,tiles:z}=d,F=C*N;g=new Int32Array(F),x=new Int32Array(F).fill(-1),m=new Float32Array(F*3);let W=0,V=0,Y=0,Q=0;for(let Te=0;Te<F;Te++){let Fe=z[Te];Fe&&Hr(Fe.terrain)?V++:W++,Fe&&Fe.terrain==="hill"&&Q++,Fe&&Xm(Fe.terrain)&&Y++}c=new Yt(e,t,Math.max(1,W)),c.name="land",c.castShadow=!0,c.receiveShadow=!0,c.frustumCulled=!1,u=E("water",V),h=E("wetland-film",Y);let he=0,fe=0,Ge=0;for(let Te=0;Te<N;Te++)for(let Fe=0;Fe<C;Fe++){let k=Te*C+Fe,$=z[k],O=$?$.terrain:"grass";if(y.set($S(O)),y.toArray(m,k*3),Hr(O))El(_,Fe+.5,jm,Te+.5,1,1,1),u.setMatrixAt(fe,_),u.setColorAt(fe,y),w(u,fe,_f[O]||_f.lake,$?$.flow:null,ew(d,Fe,Te)),g[k]=-(fe+1),fe++;else{let ee=O==="hill"?$m(d,Fe,Te):0,te=ee+Vs;El(_,Fe+.5,ee-te/2,Te+.5,1,te,1),c.setMatrixAt(he,_),c.setColorAt(he,y),g[k]=he,he++,Xm(O)&&(El(_,Fe+.5,KS,Te+.5,1,1,1),h.setMatrixAt(Ge,_),h.setColorAt(Ge,M(v,y)),w(h,Ge,_f.wetland,null,0),x[k]=Ge,Ge++)}}c.count=W,c.instanceMatrix.needsUpdate=!0,c.instanceColor&&(c.instanceColor.needsUpdate=!0);for(let Te of[u,h]){Te.instanceMatrix.needsUpdate=!0,Te.instanceColor&&(Te.instanceColor.needsUpdate=!0);for(let Fe of["aFlow","aBanks","aStyle"])Te.geometry.attributes[Fe].needsUpdate=!0}f=new It(o,a),f.name="base",f.scale.set(C,Wm,N),f.position.set(C/2,-Vs-Wm/2,N/2),f.receiveShadow=!0,i.add(c,u,h,f),p.tiles=F,p.land=W,p.water=V,p.wetland=Y,p.hills=Q,p.drawables=2+(V>0?1:0)+(Y>0?1:0)}function R(I){if(!d||!c||!u)return;let C=I||m,N=d.cols*d.rows;for(let z=0;z<N;z++){let F=g[z];y.setRGB(C[z*3],C[z*3+1],C[z*3+2]),F>=0?c.setColorAt(F,y):u.setColorAt(-F-1,y),x[z]>=0&&h.setColorAt(x[z],M(v,y))}c.instanceColor&&(c.instanceColor.needsUpdate=!0),u.instanceColor&&(u.instanceColor.needsUpdate=!0),h.instanceColor&&(h.instanceColor.needsUpdate=!0)}function P(I){Number.isFinite(I)&&I>0&&(r.uTime.value+=I)}function D(){b();for(let I of[e,n,o])I.dispose();for(let I of[t,s,a])I.dispose()}return{group:i,stats:p,setWorld:T,update:P,setTime(I){r.uTime.value=Number.isFinite(I)?I:0},get time(){return r.uTime.value},get waterMaterial(){return s},setTileColors:R,baseColors(){return m?m.slice():null},dispose:D}}var ow=Math.PI/180,eg=Math.PI/2,tg=Object.freeze([[-.22,-.2],[.21,-.23],[.02,.23]]),yf=Object.freeze([[-.26,.12],[.22,-.26],[.1,.27],[-.2,-.24],[.28,.08]]);function Vr(i,e){let[t,n]=i;for(let s=0;s<(e&3);s++)[t,n]=[-n,t];return[t,n]}function as(i,e){return i[Math.min(i.length-1,Math.floor(e*i.length))]}var cw=.82;function Rl(i,e={}){let t=e.modelFor||Yf,n=i.seed|0,s=[],{cols:r,rows:a,tiles:o}=i;for(let l=0;l<a;l++)for(let c=0;c<r;c++){let u=l*r+c,h=o[u];if(!h)continue;let f=c+.5,d=l+.5,g=Al(i,c,l),x=v=>bi(n,c,l,v);if(h.building){let v=h.building,_=null;try{_=t(v)}catch{_=null}_||(_=v.type);let M=vi[v.type],E=(Number(v.yaw)||0)*ow,w=Hs(_),b=v.level||1,T=M&&M.models&&(M.models[b]||M.models[1])||[_];if(M&&M.family==="nature"&&v.type==="hedge"){let R=Math.round((Number(v.yaw)||0)/90)%2===1;for(let P=-1;P<=1;P++)s.push({id:_,x:f+(R?0:P*.3),y:g,z:d+(R?P*.3:0),yaw:x(20+P)*Math.PI*2,scale:.8,tile:u})}else if(M&&M.family==="nature"&&v.type==="wetland-restored"){let R=Math.floor(x(1)*4);for(let P=0;P<3;P++){let[D,I]=Vr(yf[P],R);s.push({id:as(T,x(10+P)),x:f+D,y:g,z:d+I,yaw:x(20+P)*Math.PI*2,scale:Mn(.6,.8,x(30+P)),tile:u})}}else if(M&&M.family==="nature"&&(w==="tree"||w==="pine"))if(v.type==="orchard"){let R=0;for(let P of[-.22,.22])for(let D of[-.22,.22])s.push({id:as(T,x(10+R)),x:f+P,y:g,z:d+D,yaw:x(20+R)*Math.PI*2,scale:.62,tile:u}),R++}else{let R=Math.floor(x(1)*4);tg.forEach((P,D)=>{let[I,C]=Vr(P,R);s.push({id:as(T,x(10+D)),x:f+I,y:g,z:d+C,yaw:x(20+D)*Math.PI*2,scale:Mn(.85,1,x(30+D)),tile:u})})}else s.push({id:_,x:f,y:g,z:d,yaw:E,scale:cw,tile:u});continue}let m=yi[h.terrain];if(!m||!m.models||m.models.length===0||Hr(h.terrain))continue;let p=m.models,y=Math.floor(x(1)*4);switch(h.terrain){case"forest":{let v=x(2)<.35?2:3;for(let _=0;_<v;_++){let[M,E]=Vr(tg[_],y);s.push({id:as(p,x(10+_)),x:f+M+(x(40+_)-.5)*.08,y:g,z:d+E+(x(50+_)-.5)*.08,yaw:x(20+_)*Math.PI*2,scale:Mn(.85,1.1,x(30+_)),tile:u})}break}case"meadow":{let v=2+Math.floor(x(2)*2);for(let _=0;_<v;_++){let[M,E]=Vr(yf[_],y);s.push({id:as(p,x(10+_)),x:f+M,y:g,z:d+E,yaw:x(20+_)*Math.PI*2,scale:Mn(.8,1.1,x(30+_)),tile:u})}break}case"field":{let v=Number.isInteger(h.variant)?h.variant:Math.floor(x(10)*p.length);s.push({id:p[(v%p.length+p.length)%p.length],x:f,y:g,z:d,yaw:y*eg,scale:1,tile:u});break}case"hill":{let v=x(2)<.5?1:2;for(let _=0;_<v;_++){let[M,E]=v===1?[0,0]:Vr([-.18+_*.36,(_?-1:1)*.12],y);s.push({id:as(p,x(10+_)),x:f+M,y:g,z:d+E,yaw:x(20+_)*Math.PI*2,scale:Mn(.8,1.3,x(30+_)),tile:u})}break}case"wetland":{let v=2+Math.floor(x(2)*2);for(let _=0;_<v;_++){let[M,E]=Vr(yf[_+1],y);s.push({id:as(p,x(10+_)),x:f+M,y:g,z:d+E,yaw:x(20+_)*Math.PI*2,scale:Mn(.55,.8,x(30+_)),tile:u})}break}default:s.push({id:as(p,x(10)),x:f,y:g,z:d,yaw:y*eg,scale:1,tile:u})}}return s}function ng(i,e={}){let t=e.strategy==="instanced"?"instanced":"batched",n=e.shadows!==!1,s=new Rt;s.name="buildings";let r={strategy:t,placements:0,drawables:0,uniqueModels:0,triangles:0,fallbacks:0},a=new Set([i.materials.vertex,...i.materials.textured.values()]),o=new Me;function l(){for(let d of[...s.children])s.remove(d),Tl(d,a);r.placements=0,r.drawables=0,r.uniqueModels=0,r.triangles=0,r.fallbacks=0}function c(d){let g=new Map,x=new Set;for(let m of d){let p=i.resolve(m.id);p.source==="fallback"&&x.add(m.id);let y=g.get(p.material);y||(y=new Map,g.set(p.material,y));let v=y.get(m.id);v||(v={geometry:p.geometry,placements:[]},y.set(m.id,v)),v.placements.push(m),r.triangles+=p.geometry.index.count/3}return r.fallbacks=x.size,g}function u(d){for(let[g,x]of d){let m=0,p=0,y=0;for(let _ of x.values())m+=_.placements.length,p+=_.geometry.attributes.position.count,y+=_.geometry.index.count;let v=new As(m,p,y,g);v.name="batch",v.castShadow=n,v.receiveShadow=!0,v.perObjectFrustumCulled=!0,v.sortObjects=!1,v.frustumCulled=!1;for(let _ of x.values()){let M=v.addGeometry(_.geometry);for(let E of _.placements){let w=v.addInstance(M);v.setMatrixAt(w,xi(o,E.x,E.y,E.z,E.yaw,E.scale))}}s.add(v),r.drawables++}}function h(d){for(let[g,x]of d)for(let[m,p]of x){let y=new Yt(p.geometry,g,p.placements.length);y.name=m,y.geometry.userData.shared=!0,y.castShadow=n&&p.geometry.boundingBox.max.y>=.35,y.receiveShadow=!0,y.frustumCulled=!1,p.placements.forEach((v,_)=>{y.setMatrixAt(_,xi(o,v.x,v.y,v.z,v.yaw,v.scale))}),y.instanceMatrix.needsUpdate=!0,s.add(y),r.drawables++}}function f(d){l();let g=Rl(d,{modelFor:e.modelFor});if(r.placements=g.length,!g.length)return;let x=c(g),m=0;for(let p of x.values())m+=p.size;r.uniqueModels=m,t==="batched"?u(x):h(x)}return{group:s,stats:r,setWorld:f,dispose:l}}var vf=1,lw=2,ig=3,Mf=.36,os=.02,Sf=.5,sg=.012,wf=.16,rg=.015,Wr=.07,uw=3,hw=6;function fw(i){let e={streets:[],paths:[],bridges:[],streetNodes:[],pathNodes:[]},t=i&&i.edges;if(!t||!t.h||!t.v)return e;let{cols:n,rows:s}=i,r=i.traffic||null,a=(l,c)=>l>=0&&l<n&&c>=0&&c<=s?t.h[c*n+l]:0,o=(l,c)=>l>=0&&l<=n&&c>=0&&c<s?t.v[c*(n+1)+l]:0;for(let l=0;l<=s;l++)for(let c=0;c<n;c++){let u=t.h[l*n+c];if(!u)continue;let h={x:c+.5,z:l,horizontal:!0,traffic:r&&r.h&&r.h[l*n+c]||0};u===vf?e.paths.push(h):u===ig?e.bridges.push(h):e.streets.push(h)}for(let l=0;l<s;l++)for(let c=0;c<=n;c++){let u=t.v[l*(n+1)+c];if(!u)continue;let h={x:c,z:l+.5,horizontal:!1,traffic:r&&r.v&&r.v[l*(n+1)+c]||0};u===vf?e.paths.push(h):u===ig?e.bridges.push(h):e.streets.push(h)}for(let l=0;l<=s;l++)for(let c=0;c<=n;c++){let u=a(c,l),h=a(c-1,l),f=o(c,l),d=o(c,l-1),g=m=>m>=lw,x=m=>m===vf;for(let[m,p]of[[g,e.streetNodes],[x,e.pathNodes]]){let y=m(u),v=m(h),_=m(f),M=m(d),E=y+v+_+M;(E>=3||E===2&&!(y&&v||M&&_))&&p.push({x:c,z:l,degree:E})}}return e}function Bn(i,e,t,n,s=0,r=0,a=0){let o=new kt(i,e,t);return o.translate(r,s+e/2,a),jt(o,n)}function dw({markings:i}){let e=[Bn(1,sg,Sf,X.sidewalk)];i&&e.push(Bn(.42,.004,.03,X.marking,os));let t=[Bn(1,Wr-os,.34,X.wallTan,os),Bn(1,.09,.025,X.wood,Wr,0,.165),Bn(1,.09,.025,X.wood,Wr,0,-.165),Bn(.1,os+Vs,.3,X.rock,-Vs,-.3,0),Bn(.1,os+Vs,.3,X.rock,-Vs,.3,0)];return i&&t.push(Bn(.42,.004,.03,X.marking,Wr)),{street:new kt(1,os,Mf).translate(0,os/2,0),streetTrim:ki(e),streetNode:ki([Bn(Mf,os+.002,Mf,X.asphalt),Bn(Sf,sg,Sf,X.sidewalk)]),path:Bn(1,rg,wf,X.soil),pathNode:Bn(wf,rg+.001,wf,X.soil),bridge:ki(t)}}function Ef(i,e){let t=i.get(e);if(!t)return null;let n=t.geometry.boundingBox;return Math.min(n.max.x-n.min.x,n.max.z-n.min.z)<=.5?t:null}function ag(i,e={}){let t=e.markings!==!1,n=e.useEdgeModels===!0,s=new Rt;s.name="roads";let r={streets:0,paths:0,bridges:0,streetNodes:0,pathNodes:0,drawables:0},a=dw({markings:t}),o=i.materials.vertex,l=new rn({color:16777215}),c=new Set([o,l,...i.materials.textured.values()]),u=new Me,h=new ue,f=new ue(X.asphalt),d=new ue(X.roofOrange),g=new ue(X.roofRed),x=n?Ef(i,"road-edge-straight"):null,m=n?Ef(i,"road-edge-node"):null,p=n?Ef(i,"road-edge-bridge"):null;function y(){for(let w of[...s.children])s.remove(w),Tl(w,c);for(let w of Object.keys(r))r[w]=0}function v(w,b,T,R,{cast:P=!1,colorize:D=null}={}){if(!R.length)return null;let I=new Yt(b,T,R.length);return I.name=w,I.geometry.userData.shared=!0,I.castShadow=P,I.receiveShadow=!0,I.frustumCulled=!1,R.forEach((C,N)=>{let z=C.horizontal===!1?Math.PI/2:0;I.setMatrixAt(N,xi(u,C.x,0,C.z,z,1)),D&&I.setColorAt(N,D(C))}),I.instanceMatrix.needsUpdate=!0,I.instanceColor&&(I.instanceColor.needsUpdate=!0),s.add(I),r.drawables++,I}function _(w){return w.traffic>=hw?h.copy(g):w.traffic>=uw?h.copy(d):h.copy(f)}function M(w){y();let b=fw(w);r.streets=b.streets.length,r.paths=b.paths.length,r.bridges=b.bridges.length,r.streetNodes=b.streetNodes.length,r.pathNodes=b.pathNodes.length,x?v("streets",x.geometry,x.material,b.streets):(v("streets",a.street,l,b.streets,{colorize:_}),v("street-trim",a.streetTrim,o,b.streets));let T=b.streetNodes.map(R=>({...R,horizontal:!0}));v("street-nodes",m?m.geometry:a.streetNode,m?m.material:o,T),v("paths",a.path,o,b.paths),v("path-nodes",a.pathNode,o,b.pathNodes.map(R=>({...R,horizontal:!0}))),v("bridges",p?p.geometry:a.bridge,p?p.material:o,b.bridges,{cast:!0})}function E(){y();for(let w of Object.values(a))w.dispose();l.dispose()}return{group:s,stats:r,setWorld:M,dispose:E}}var no=3,pw=.25,og=.1,io=8,qr=160,Tf=Object.freeze([.05,.18]),Cl=.6,mw=1.2,gw=.12,bw=Object.freeze(["factory","power-plant"]),cg=Object.freeze({"factory-a":Object.freeze([Object.freeze([.055,.83,.31])]),"factory-b":Object.freeze([Object.freeze([-.105,.88,.23]),Object.freeze([-.31,.88,.23])]),"power-plant":Object.freeze([Object.freeze([.205,.72,-.325]),Object.freeze([.26,.63,.025])])}),xw=Object.freeze({N:[0,1],S:[0,-1],E:[-1,0],W:[1,0]});function _w(i){let e=xw[i];return e?[e[0],e[1]]:[0,0]}function Pl(i){let e=parseInt(i.slice(1),16),t=n=>{let s=n/255;return s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4)};return[t(e>>16&255),t(e>>8&255),t(e&255)]}var lg=i=>i<=0?0:i>=1?1:i*i*(3-2*i),yw=Object.freeze([0,0]),vw=Object.freeze(Pl(X.metalLight)),Mw=Object.freeze(Pl(X.wallCream));function Sw(i,e){let t=[];if(e&&typeof e.partNames=="function")for(let r of e.partNames(i)){if(!/^chimney/i.test(r))continue;let a=e.getPart(i,r);a&&a.pivot&&t.push([a.pivot[0],a.pivot[1]+(Number.isFinite(a.height)?a.height:0),a.pivot[2]])}if(t.length)return t.slice(0,2);if(cg[i])return cg[i].map(r=>r.slice());let n=e&&typeof e.resolve=="function"?e.resolve(i):null;return[[.22,n&&Number.isFinite(n.height)?n.height:.9,-.22]]}function ww(i,e){return!!(e&&typeof e.partNames=="function"&&e.partNames(i).some(t=>/^chimney/i.test(t)))}function Ew(i,e=null,t={}){let n=[],s=i.seed|0;for(let r of Rl(i,{modelFor:t.modelFor})){let a=Hs(r.id);if(!bw.includes(a)&&!ww(r.id,e))continue;let o=Math.cos(r.yaw),l=Math.sin(r.yaw);Sw(r.id,e).forEach((c,u)=>{n.push({x:r.x+r.scale*(o*c[0]+l*c[2]),y:r.y+r.scale*c[1],z:r.z+r.scale*(-l*c[0]+o*c[2]),tile:r.tile,model:r.id,seed:bi(s,r.tile,u,1504)})})}return n}function Tw(i,e,t,n={},s={color:[0,0,0]}){let r=n.wind||yw,a=Number.isFinite(n.level)?Math.min(1,Math.max(0,n.level)):1,o=n.puffs||io,l=n.colorFrom||vw,c=n.colorTo||Mw,u=Number.isFinite(e.seed)?e.seed:0,h=(t+.6*bi(Math.floor(u*65536),t,0,3))/o*no,f=((i+h)%no+no)%no,d=f/no,g=u*Math.PI*2+t*2.1,x=.035*d;s.x=e.x+r[0]*og*f+x*Math.sin(f*2.3+g),s.y=e.y+pw*f*(.75+.25*a),s.z=e.z+r[1]*og*f+x*Math.cos(f*1.9+g*1.7);let m;return d<Cl?m=Mn(Tf[0],Tf[1],lg(d/Cl)):m=Tf[1]*(1-lg((d-Cl)/(1-Cl))),s.scale=m*(.7+.3*a)*(.9+.2*bi(Math.floor(u*65536),t,1,3)),s.u=d,s.color[0]=Mn(l[0],c[0],d),s.color[1]=Mn(l[1],c[1],d),s.color[2]=Mn(l[2],c[2],d),s}function Aw(i){let e=i.max.x-i.min.x,t=i.max.y-i.min.y,n=i.max.z-i.min.z;return e<=t&&e<=n?"x":t<=e&&t<=n?"y":"z"}function Rw(i,e){let t=e&&typeof e.getPart=="function"?e.getPart(i,"blades"):null;if(t&&t.geometry&&t.geometry.boundingBox){let o=t.geometry.boundingBox,l=Aw(o),c=Math.max(l==="x"?0:Math.max(-o.min.x,o.max.x),l==="y"?0:Math.max(-o.min.y,o.max.y),l==="z"?0:Math.max(-o.min.z,o.max.z));return{pivot:t.pivot.slice(),axis:l,radius:c,source:"part"}}let n=e&&typeof e.resolve=="function"?e.resolve(i):null,s=n&&Number.isFinite(n.height)&&n.height>0?n.height:1.8;if(n&&n.source==="fallback")return{pivot:[0,s,.09],axis:"z",radius:.45,source:"fallback"};let r=n&&n.geometry&&n.geometry.boundingBox,a=r?Math.min(.14,r.max.z*.75+.03):.08;return{pivot:[0,s*.785,a],axis:"z",radius:s*.24,source:"fallback"}}function Cw(i,e=null,t={}){let n=[],s=i.seed|0;for(let r of Rl(i,{modelFor:t.modelFor})){let a=e&&typeof e.getPart=="function"&&!!e.getPart(r.id,"blades");if(Hs(r.id)!=="wind-turbine"&&!a)continue;let o=Rw(r.id,e),l=bi(s,r.tile,0,45485);n.push({x:r.x,y:r.y,z:r.z,yaw:r.yaw,scale:r.scale,tile:r.tile,model:r.id,pivot:o.pivot,axis:o.axis,radius:o.radius,source:o.source,speed:mw*(1+(l*2-1)*gw),phase:bi(s,r.tile,1,45485)*Math.PI*2})}return n}function Pw(i,e){return-(i.phase+Math.PI*2*i.speed*e)}function Iw(i,e){let t=[],n=new mn(.035,.035,.05,8);n.rotateX(Math.PI/2),t.push(jt(n,e));for(let s=0;s<3;s++){let r=new kt(.045,i,.012);r.translate(0,i/2+.02,0),r.rotateZ(s*2*Math.PI/3),t.push(jt(r,e))}return ki(t)}function ug(i,e={}){let t=e.palette||X,n=e.shadows!==!1,s=new Rt;s.name="effects";let r=new es(.5,1),a=new rn({color:16777215,emissive:new ue(t.metalLight||X.metalLight).multiplyScalar(.2)}),o=new Yt(r,a,qr);o.name="smoke",o.castShadow=!1,o.receiveShadow=!1,o.frustumCulled=!1,o.instanceColor=new pn(new Float32Array(qr*3),3),o.count=0,o.visible=!1,s.add(o);let l=[],c=io,u=io,h=1,f={wind:[0,0],level:1,puffs:io,colorFrom:Pl(t.metalLight||X.metalLight),colorTo:Pl(t.wallCream||X.wallCream)},d={x:0,y:0,z:0,scale:0,u:0,color:[0,0,0]},g=new Map,x=0,m=0,p=new Me,y=new Me,v=new ue;function _(){u=l.length?Math.round(c*h):0,f.level=h,f.puffs=Math.max(1,c),o.visible=u>0,o.visible||(o.count=0)}function M(){for(let I of g.values())s.remove(I.mesh),I.owned&&I.mesh.geometry.dispose();g.clear(),x=0}function E(I){f.wind=_w(I.wind),l=Ew(I,i,{modelFor:e.modelFor}),l.length>qr&&(l=l.slice(0,qr)),c=l.length?Math.min(io,Math.floor(qr/l.length)):0,_(),M();let C=Cw(I,i,{modelFor:e.modelFor}),N=new Map;for(let z of C)N.has(z.model)||N.set(z.model,[]),N.get(z.model).push(z);for(let[z,F]of N){let W=i&&typeof i.getPart=="function"?i.getPart(z,"blades"):null,V,Y,Q=!1;W?(V=W.geometry,Y=W.material):(V=Iw(F[0].radius,t.marking||X.marking),Y=i&&i.materials&&i.materials.vertex?i.materials.vertex:a,Q=!0);let he=new Yt(V,Y,F.length);he.name=`blades:${z}`,he.castShadow=n,he.receiveShadow=!1,he.frustumCulled=!1;let fe=F.map(Ge=>xi(new Me,Ge.x,Ge.y,Ge.z,Ge.yaw,Ge.scale).multiply(new Me().makeTranslation(Ge.pivot[0],Ge.pivot[1],Ge.pivot[2])));s.add(he),g.set(z,{mesh:he,anchors:F,bases:fe,owned:Q}),x+=F.length}T(0,m)}function w(I){if(!o.visible)return;let C=0;for(let N=0;N<l.length;N++){let z=l[N];for(let F=0;F<u&&C<qr;F++){Tw(I,z,F,f,d);let W=Math.max(1e-4,d.scale);p.makeScale(W,W*.92,W),p.setPosition(d.x,d.y,d.z),o.setMatrixAt(C,p),v.setRGB(d.color[0],d.color[1],d.color[2]),o.setColorAt(C,v),C++}}o.count=C,o.instanceMatrix.needsUpdate=!0,o.instanceColor.needsUpdate=!0}function b(I){for(let C of g.values()){for(let N=0;N<C.anchors.length;N++){let z=C.anchors[N],F=Pw(z,I);z.axis==="x"?y.makeRotationX(F):z.axis==="y"?y.makeRotationY(F):y.makeRotationZ(F),p.multiplyMatrices(C.bases[N],y),C.mesh.setMatrixAt(N,p)}C.mesh.instanceMatrix.needsUpdate=!0}}function T(I,C){m=Number.isFinite(C)?C:m+(Number.isFinite(I)?Math.max(0,I):0),w(m),b(m)}function R(I){h=Number.isFinite(I)?Math.min(1,Math.max(0,I)):1,_()}function P(){let I=g.size;return{smoke:o.visible?l.length*u:0,emitters:l.length,blades:x,calls:(o.visible?1:0)+I,shadowCalls:n?I:0}}function D(){M(),s.remove(o),r.dispose(),a.dispose(),l=[]}return{group:s,setWorld:E,update:T,setSmokeLevel:R,stats:P,dispose:D,get emitters(){return l},get time(){return m},get smokeLevel(){return h}}}var Lw=Math.PI*2,Pe=Math.PI/180,aC=Object.freeze(["biped","quadruped","bird","flyer","wader","swimmer","wheeled","vehicle"]),hg=Object.freeze({biped:["Body","Head","ArmL","ArmR","LegL","LegR"],quadruped:["Body","Neck","Head","LegFL","LegFR","LegBL","LegBR","Tail"],bird:["Body","Head","WingL","WingR","LegL","LegR","Tail"],flyer:["Body","Head","WingL","WingR","Tail"],wader:["Body","Neck","Head","LegL","LegR","WingL","WingR"],swimmer:["Body","Head","Tail"],wheeled:["Frame","WheelF","WheelB","Body","Head","LegL","LegR"],vehicle:["Body"]}),Dw=Object.freeze(Array.from(new Set(Object.values(hg).flat())));function Xr(i){return i==="wheeled"?"Frame":"Body"}function Ll(i){if(!i)return null;let e=String(i),t=Dw.find(c=>c.toLowerCase()===e.toLowerCase());if(t)return t;let n=e.toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),s=n.split(" "),r=c=>c.test(n),a=s.find(c=>/^(f|b)(l|r)$/.test(c)),o=()=>a?a[1].toUpperCase():r(/\b(left|l)\b/)||/(^|[^a-z])l$/.test(n)||/left/.test(n)?"L":r(/\b(right|r)\b/)||/(^|[^a-z])r$/.test(n)||/right/.test(n)?"R":null,l=()=>a?a[0].toUpperCase():r(/front|fore|\bf\b|avant/)?"F":r(/back|hind|rear|\bb\b|arriere/)?"B":null;if(r(/wheel|roue/)){let c=l();return c?`Wheel${c}`:"WheelF"}if(r(/frame|cadre|bike|velo/))return"Frame";if(r(/head|tete|skull|face|beak|bec/))return"Head";if(r(/neck|cou\b/))return"Neck";if(r(/tail|queue/))return"Tail";if(r(/wing|aile/)){let c=o();return c?`Wing${c}`:null}if(r(/arm|bras|hand|main|shoulder|epaule/)){let c=o();return c?`Arm${c}`:null}if(r(/leg|jambe|patte|paw|foot|pied|thigh|cuisse|shin|knee/)){let c=o(),u=l();return c?u?`Leg${u}${c}`:`Leg${c}`:null}return r(/body|corps|torso|hips|pelvis|spine|chest|root|trunk/)||s.length===0?"Body":null}function we(i,e,t=0,n=0,s=0,r=0,a=0,o=0){i[e]={rx:t,ry:n,rz:s,dx:r,dy:a,dz:o}}function Il(i,e){return e*(.5-.5*Math.cos(2*i))}var Nw=new Set(["walk","run","swim","drive"]);function fg(i,e,t,n={}){let r=((Number(t)||0)%1+1)%1*Lw,a=Math.sin(r),o=Math.cos(r),l=Math.max(-1,Math.min(1,Number(n.turn)||0)),c={};switch(i){case"biped":{if(e==="walk"||e==="run"){let u=(e==="run"?35:25)*Pe;we(c,"LegL",u*a),we(c,"LegR",-u*a),we(c,"ArmL",-.8*u*a),we(c,"ArmR",.8*u*a),we(c,"Body",e==="run"?6*Pe:0,0,0,0,Il(r,e==="run"?.016:.01))}else we(c,"Body",0,0,0,0,.003*a),we(c,"ArmL",0,0,3*Pe*a),we(c,"ArmR",0,0,-3*Pe*a);break}case"quadruped":{if(e==="walk"||e==="run"){let u=(e==="run"?32:20)*Pe;we(c,"LegFL",u*a),we(c,"LegBR",u*a),we(c,"LegFR",-u*a),we(c,"LegBL",-u*a),we(c,"Head",6*Pe*Math.sin(2*r)),we(c,"Neck",3*Pe*Math.sin(2*r)),we(c,"Tail",0,12*Pe*a),we(c,"Body",e==="run"?5*Pe*o:0,0,0,0,Il(r,e==="run"?.02:.006))}else we(c,"Head",4*Pe*a,10*Pe*Math.sin(r*.5)),we(c,"Tail",0,15*Pe*a),we(c,"Body",0,0,0,0,.002*a);break}case"bird":{if(e==="fly"){let u=40*Pe*a;we(c,"WingL",0,0,u),we(c,"WingR",0,0,-u),we(c,"LegL",60*Pe),we(c,"LegR",60*Pe),we(c,"Body",-8*Pe,0,-25*Pe*l,0,.01*a)}else if(e==="walk"||e==="run"){let u=25*Pe;we(c,"LegL",u*a),we(c,"LegR",-u*a),we(c,"Body",0,0,5*Pe*a,0,Il(r,.004)),we(c,"Head",8*Pe*Math.sin(2*r)),we(c,"Tail",0,8*Pe*a)}else e==="swim"?(we(c,"Body",3*Pe*a,0,2*Pe*o,0,.003*a),we(c,"Head",4*Pe*Math.sin(r*.5),15*Pe*Math.sin(r*.25)),we(c,"Tail",0,6*Pe*a)):(we(c,"Head",0,35*Pe*Math.sin(r*.5),0),we(c,"Body",0,0,0,0,.002*a),we(c,"WingL",0,0,2*Pe*a),we(c,"WingR",0,0,-2*Pe*a));break}case"flyer":{let u=(e==="hover"?55:40)*Pe*a;we(c,"WingL",0,0,u),we(c,"WingR",0,0,-u),we(c,"Body",e==="hover"?10*Pe:-5*Pe,0,-35*Pe*l,0,.004*a),we(c,"Tail",0,8*Pe*l,0);break}case"wader":{if(e==="fly"){let u=40*Pe*a;we(c,"WingL",0,0,u),we(c,"WingR",0,0,-u),we(c,"LegL",70*Pe),we(c,"LegR",70*Pe),we(c,"Neck",20*Pe),we(c,"Head",-20*Pe),we(c,"Body",-10*Pe,0,-20*Pe*l,0,.01*a)}else if(e==="walk"){let u=30*Pe;we(c,"LegL",u*a),we(c,"LegR",-u*a),we(c,"Neck",10*Pe+6*Pe*Math.sin(2*r)),we(c,"Head",-6*Pe*Math.sin(2*r)),we(c,"Body",0,0,0,0,Il(r,.004))}else{let u=12*Pe*Math.sin(r*.5);we(c,"Neck",u),we(c,"Head",-u+5*Pe*Math.sin(r*.25),10*Pe*Math.sin(r*.3)),we(c,"Body",0,0,0,0,.002*a)}break}case"swimmer":{e==="dive"?(we(c,"Body",30*Pe,6*Pe*a),we(c,"Tail",0,25*Pe*a),we(c,"Head",10*Pe)):e==="swim"?(we(c,"Body",2*Pe*o,6*Pe*a,0,0,.003*o),we(c,"Tail",0,30*Pe*Math.sin(r-1.2)),we(c,"Head",0,-5*Pe*a)):(we(c,"Tail",0,10*Pe*a),we(c,"Head",4*Pe*Math.sin(r*.5),12*Pe*Math.sin(r*.3)));break}case"wheeled":{we(c,"WheelF",r),we(c,"WheelB",r),Nw.has(e)?(we(c,"LegL",35*Pe*a,0,0,0,.012*o),we(c,"LegR",-35*Pe*a,0,0,0,-.012*o),we(c,"Body",8*Pe,0,0,0,.002*Math.sin(2*r)),we(c,"Frame",0,0,-8*Pe*l)):we(c,"Body",4*Pe);break}default:we(c,"Body",0,0,-3*Pe*l)}return c}var gC=Math.PI/180,Ul=1.3,Dl=new ue;function jr(i,e=i.itemSize){if(i.array instanceof Float32Array&&!i.normalized&&i.itemSize===e&&!i.isInterleavedBufferAttribute)return i;let t=i.count,n=new Float32Array(t*e),s=[r=>i.getX(r),r=>i.getY(r),r=>i.getZ(r),r=>i.getW(r)];for(let r=0;r<t;r++)for(let a=0;a<e;a++)n[r*e+a]=a<i.itemSize?s[a](r):1;return new st(n,e)}function kl(i,e=!1,t=!1){for(let n of Object.keys(i.attributes))n==="position"||n==="normal"||n==="color"||e&&n==="uv"||t&&(n==="skinIndex"||n==="skinWeight")||i.deleteAttribute(n);if(i.morphAttributes={},t&&i.attributes.skinIndex&&i.setAttribute("skinIndex",jr(i.attributes.skinIndex,4)),t&&i.attributes.skinWeight&&i.setAttribute("skinWeight",jr(i.attributes.skinWeight,4)),i.setAttribute("position",jr(i.attributes.position,3)),i.attributes.normal?i.setAttribute("normal",jr(i.attributes.normal,3)):i.computeVertexNormals(),i.attributes.color&&i.setAttribute("color",jr(i.attributes.color,3)),e&&i.attributes.uv&&i.setAttribute("uv",jr(i.attributes.uv,2)),!i.index){let n=i.attributes.position.count,s=n>65535?new Uint32Array(n):new Uint16Array(n);for(let r=0;r<n;r++)s[r]=r;i.setIndex(new st(s,1))}return i}function mg(i,e,t,n){let s=i.attributes.position.count,r=new Float32Array(s*3);for(let a=0;a<s;a++)r[a*3]=e,r[a*3+1]=t,r[a*3+2]=n;return i.setAttribute("color",new st(r,3)),i}function Yr(i,e){return Dl.set(e),kl(i,!1),mg(i,Dl.r,Dl.g,Dl.b)}function Kr(i){let e=i.length===1?i[0]:gl(i,!1);if(!e)throw new Error("rigs : fusion de géométries impossible");return e.clearGroups(),e.computeBoundingBox(),e.computeBoundingSphere(),e}var Af=i=>i<=.04045?i/12.92:Math.pow((i+.055)/1.055,2.4);function Fw(i,e){if(e.has(i.uuid))return e.get(i.uuid);let t=null;try{let n=i.image,s=n&&(n.width||n.naturalWidth),r=n&&(n.height||n.naturalHeight);if(s&&r){let a=typeof OffscreenCanvas=="function"?new OffscreenCanvas(s,r):typeof document<"u"?document.createElement("canvas"):null;if(a){a.width=s,a.height=r;let o=a.getContext("2d",{willReadFrequently:!0});o.drawImage(n,0,0),t={width:s,height:r,data:o.getImageData(0,0,s,r).data}}}}catch(n){console.warn("[rigs] texture illisible, couleur du matériau utilisée",n)}return e.set(i.uuid,t),t}function Pf(i,e,t){let n=e&&e.color?e.color:{r:1,g:1,b:1},s=e&&e.map,r=i.attributes.uv;if(s&&r){let a=Fw(s,t);if(a){let o=i.attributes.position.count,l=new Float32Array(o*3);s.updateMatrix();let c=s.matrix.elements;for(let u=0;u<o;u++){let h=r.getX(u),f=r.getY(u),d=c[0]*h+c[3]*f+c[6],g=c[1]*h+c[4]*f+c[7];d-=Math.floor(d),g-=Math.floor(g);let x=Math.min(a.width-1,Math.floor(d*a.width)),m=s.flipY?Math.floor((1-g)*a.height):Math.floor(g*a.height),y=(Math.min(a.height-1,Math.max(0,m))*a.width+x)*4;l[u*3]=Af(a.data[y]/255)*n.r,l[u*3+1]=Af(a.data[y+1]/255)*n.g,l[u*3+2]=Af(a.data[y+2]/255)*n.b}return i.setAttribute("color",new st(l,3)),i.deleteAttribute("uv"),i}}if(i.deleteAttribute("uv"),i.attributes.color){let a=i.attributes.color.array;for(let o=0;o<a.length;o+=3)a[o]*=n.r,a[o+1]*=n.g,a[o+2]*=n.b}else mg(i,n.r,n.g,n.b);return i}function If(i,e){let t=i.clone();return e&&t.index&&t.setIndex(new st(t.index.array.slice(e.start,e.start+e.count),1)),t}function gg(i,e,t={}){let n=Object.keys(e),s=n.filter(c=>!e[c].parent),r=s.includes(Xr(i))?Xr(i):s[0]||n[0];for(let c of s)c!==r&&(e[c].parent=r);e[r].parent&&(e[r].parent=null);for(let c of n)e[c].parent&&!e[e[c].parent]&&(e[c].parent=c===r?null:r);let a=[],o=new Set(n.filter(c=>c!==r));for(a.push(r);o.size;){let c=!1;for(let u of Array.from(o))a.includes(e[u].parent)&&(a.push(u),o.delete(u),c=!0);if(!c){for(let u of o)e[u].parent=r,a.push(u);o.clear()}}for(let c of n)e[c].geometry.computeBoundingBox();let l={kind:"puppet",anim:i,root:r,order:a,parts:e,height:0};return bg(l,t.targetHeight),l}function Ow(i){let e={};for(let t of i.order){let n=i.parts[t],s=n.pivotMatrix.clone();n.parent&&s.premultiply(e[n.parent]),e[t]=s}return e}function Fl(i){let e=Ow(i),t=new Tt,n=new Tt;for(let s of i.order){let r=i.parts[s].geometry;r.boundingBox||r.computeBoundingBox(),n.copy(r.boundingBox).applyMatrix4(e[s]),t.union(n)}return t}function bg(i,e){let t=Fl(i),n=t.max.y-t.min.y;if(e&&n>1e-6&&(n>e*Ul||n<e/Ul)){let a=e/n;for(let o of i.order){i.parts[o].geometry.scale(a,a,a),i.parts[o].geometry.computeBoundingBox();let l=i.parts[o].pivotMatrix.elements;l[12]*=a,l[13]*=a,l[14]*=a}t=Fl(i),n=t.max.y-t.min.y}let r=i.parts[i.root].pivotMatrix.elements;return r[12]-=(t.min.x+t.max.x)/2,r[14]-=(t.min.z+t.max.z)/2,i.float||(r[13]-=t.min.y),i.height=n,i.bounds=Fl(i),i}function Ol(i,e){if(!i)return null;if(e){for(let[t,n]of Object.entries(e))if(String(n).toLowerCase()===i.toLowerCase())return Ll(t)||Ll(n)}return Ll(i)}function Rf(i,e){for(let t=i;t;t=t.parent)if(e.has(t))return t;return null}function Uw(i,e,t,n){i.updateMatrixWorld(!0);let s=n.textureCache||new Map,r=new Map,a=new Map;i.traverse(f=>{if(f===i)return;let d=Ol(f.name,e.parts);d&&!a.has(d)&&(r.set(f,d),a.set(d,f))});let o=new Map,l=new Me,c=new Me,u=Xr(t);if(i.traverse(f=>{if(!f.isMesh||!f.geometry)return;let d=Rf(f,r),g=d?r.get(d):a.has(u)?u:"__root__",x=Array.isArray(f.material)?f.material:[f.material],m=f.geometry.groups.length&&Array.isArray(f.material)?f.geometry.groups:[null];for(let p of m){let y=x[p?p.materialIndex:0]||x[0],v=If(f.geometry,p);kl(v,!!(y&&y.map)),d?l.copy(d.matrixWorld).invert():l.identity(),c.multiplyMatrices(l,f.matrixWorld),v.applyMatrix4(c),Pf(v,y,s),o.has(g)||o.set(g,[]),o.get(g).push(v)}}),!o.size)throw new Error("aucun mesh dans le GLB");let h={};for(let[f,d]of a){let g=o.get(f);if(!g)continue;let x=d.parent?Rf(d.parent,r):null,m=new Me;x?m.copy(x.matrixWorld).invert().multiply(d.matrixWorld):m.copy(d.matrixWorld),h[f]={geometry:Kr(g),pivotMatrix:m,parent:x?r.get(x):null}}if(o.has("__root__")){let f=o.get("__root__");if(h[u]){let d=a.get(u).matrixWorld.clone().invert();for(let g of f)g.applyMatrix4(d);h[u].geometry=Kr([h[u].geometry,...f])}else h[u]={geometry:Kr(f),pivotMatrix:new Me,parent:null}}for(let f of Object.keys(h)){let d=h[f].parent,g=a.get(f);for(;d&&!h[d];){let x=a.get(d);h[f].pivotMatrix.premultiply(x.matrix);let m=x.parent?Rf(x.parent,r):null;d=m?r.get(m):null,g=x}h[f].parent=d}return gg(t,h,n)}function xg(i,e,t,n){i.updateMatrixWorld(!0);let s=n.textureCache||new Map,r=Xr(t),a=new Map,o=new Map,l=new U,c=new U,u=new Me,h=new Xe;if(i.traverse(d=>{if(!d.isSkinnedMesh)return;let g=d.skeleton,x=g.bones,m=x.map(_=>{for(let M=_;M&&!(!M.isBone&&M!==_);M=M.parent){let E=Ol(M.name,e.parts);if(E)return E}return r}),p=new Map;x.forEach((_,M)=>{let E=m[M];!p.has(E)&&(Ol(_.name,e.parts)===E||E===r)&&p.set(E,_)});for(let[_,M]of p){if(o.has(_))continue;let E=null;for(let w=M.parent;w&&w.isBone;w=w.parent){let b=Ol(w.name,e.parts);if(b&&b!==_&&p.has(b)){E=b;break}}o.set(_,{node:M,parent:E})}let y=Array.isArray(d.material)?d.material:[d.material],v=d.geometry.groups.length&&Array.isArray(d.material)?d.geometry.groups:[null];for(let _ of v){let M=y[_?_.materialIndex:0]||y[0],E=If(d.geometry,_);kl(E,!!(M&&M.map),!0),Pf(E,M,s);let w=E.attributes.position,b=E.attributes.normal,T=E.attributes.color,R=E.attributes.skinIndex,P=E.attributes.skinWeight,D=E.index.array,I=new Array(w.count);for(let N=0;N<w.count;N++){let z=0,F=-1;for(let W=0;W<4;W++){let V=P?[P.getX(N),P.getY(N),P.getZ(N),P.getW(N)][W]:W===0?1:0;V>F&&(F=V,z=R?[R.getX(N),R.getY(N),R.getZ(N),R.getW(N)][W]:0)}I[N]=m[z]||r}let C=new Map;for(let N=0;N<D.length;N+=3){let z=I[D[N]],F=I[D[N+1]],W=I[D[N+2]],V=z===F||z===W?z:F===W?F:z;C.has(V)||C.set(V,[]),C.get(V).push(D[N],D[N+1],D[N+2])}for(let[N,z]of C){let F=o.get(N)||o.get(r),W=F?x.indexOf(F.node):-1;u.identity(),W>=0&&u.copy(g.boneInverses[W]),u.multiply(d.bindMatrix),h.getNormalMatrix(u);let V=new Map,Y=[],Q=[],he=[],fe=[];for(let Te of z){let Fe=V.get(Te);Fe===void 0&&(Fe=Y.length/3,V.set(Te,Fe),l.fromBufferAttribute(w,Te).applyMatrix4(u),c.fromBufferAttribute(b,Te).applyMatrix3(h).normalize(),Y.push(l.x,l.y,l.z),Q.push(c.x,c.y,c.z),he.push(T.getX(Te),T.getY(Te),T.getZ(Te))),fe.push(Fe)}let Ge=new St;Ge.setAttribute("position",new mt(Y,3)),Ge.setAttribute("normal",new mt(Q,3)),Ge.setAttribute("color",new mt(he,3)),Ge.setIndex(fe.length>65535?new ws(fe,1):new Ss(fe,1)),a.has(N)||a.set(N,[]),a.get(N).push(Ge)}}}),!a.size)throw new Error("aucun SkinnedMesh");let f={};for(let[d,g]of a){let x=o.get(d),m=new Me,p=null;if(x){let y=x.parent?o.get(x.parent):null;y?m.copy(y.node.matrixWorld).invert().multiply(x.node.matrixWorld):m.copy(x.node.matrixWorld),p=x.parent}f[d]={geometry:Kr(g),pivotMatrix:m,parent:p}}return gg(t,f,n)}function kw(i){let e=!1;return i.traverse(t=>{t.isSkinnedMesh&&(e=!0)}),e}var Bw={idle:[/idle/,/stand/,/rest/],walk:[/walk/,/march/],run:[/run/,/gallop/,/sprint/,/trot/],fly:[/fly/,/flap/,/glide/],swim:[/swim/],hover:[/hover/,/fly/],dive:[/dive/,/swim/]};function zw(i,e){let t={};if(!i||!i.length)return t;let n=s=>i.find(r=>r.name===s)||i.find(r=>r.name.toLowerCase()===String(s).toLowerCase());if(e.clips)for(let[s,r]of Object.entries(e.clips)){let a=n(r);a&&(t[s]=a)}if(e.clipRanges){let s=e.fps||24,r=e.clipSource&&n(e.clipSource)||i[0];for(let[a,o]of Object.entries(e.clipRanges))!Array.isArray(o)||o.length<2||(t[a]=Ca.subclip(r,a,o[0],o[1]+1,s))}if(!Object.keys(t).length){for(let[s,r]of Object.entries(Bw)){let a=i.find(o=>r.some(l=>l.test(o.name.toLowerCase())));a&&(t[s]=a)}t.idle||(t.idle=i[0])}return t}function dg(i,e){for(let t=0;t<16;t++)if(Math.abs(i.elements[t]-e.elements[t])>1e-6)return!1;return!0}function Gw(i,e=new Map){i.updateMatrixWorld(!0);let t=new Map;i.traverse(s=>{s.isSkinnedMesh&&(t.has(s.skeleton)||t.set(s.skeleton,[]),t.get(s.skeleton).push(s))});let n=0;for(let[s,r]of t){let a=r[0],o=r.length>1||Array.isArray(a.material);if(!r.every(d=>d.parent===a.parent&&dg(d.matrix,a.matrix)&&dg(d.bindMatrix,a.bindMatrix)))continue;let c=[];for(let d of r){let g=Array.isArray(d.material)?d.material:[d.material],x=d.geometry.groups.length&&Array.isArray(d.material)?d.geometry.groups:[null];for(let m of x){let p=g[m?m.materialIndex:0]||g[0],y=If(d.geometry,m);if(kl(y,!!(p&&p.map),!0),Pf(y,p,e),y.attributes.uv&&y.deleteAttribute("uv"),!y.attributes.skinIndex||!y.attributes.skinWeight){c.length=0;break}c.push(y)}if(!c.length)break}if(!c.length||!o&&c.length===1&&!(a.material&&a.material.map))continue;let u=Kr(c),h=new rn({vertexColors:!0}),f=new Ts(u,h);f.name=a.name||"skinned",f.position.copy(a.position),f.quaternion.copy(a.quaternion),f.scale.copy(a.scale),f.frustumCulled=!1,a.parent.add(f),f.bind(s,a.bindMatrix);for(let d of r)d.parent.remove(d);n++}return i.updateMatrixWorld(!0),n}function Hw(i,e,t,n){let s=i.scene;s.updateMatrixWorld(!0);try{Gw(s,n.textureCache||new Map)}catch(u){console.warn("[rigs] fusion des meshes skinnés impossible",u)}let r=new Tt().setFromObject(s),a=r.max.y-r.min.y,o=n.targetHeight;if(o&&a>1e-6&&(a>o*Ul||a<o/Ul)){let u=o/a;s.scale.multiplyScalar(u),s.updateMatrixWorld(!0),r.setFromObject(s),a=r.max.y-r.min.y}s.position.x-=(r.min.x+r.max.x)/2,s.position.z-=(r.min.z+r.max.z)/2,n.float||(s.position.y-=r.min.y),s.updateMatrixWorld(!0),s.traverse(u=>{u.isMesh&&(u.castShadow=!0,u.receiveShadow=!1,u.frustumCulled=!1)});let l=zw(i.animations,e),c=null;try{c=xg(i.scene,e,t,{...n,textureCache:new Map})}catch(u){console.warn("[rigs] pantin dérivé du squelette impossible",u)}return{kind:"skinned",anim:t,template:s,clips:l,height:a,puppet:c,entry:e}}var Cf=null;async function Vw(){if(Cf)return Cf;let i=new zr;try{await Gr.ready,i.setMeshoptDecoder(Gr)}catch(e){console.warn("[rigs] décodeur meshopt indisponible",e)}return Cf=i,i}async function _g(i,e={},t={}){let s=await(t.loader||await Vw()).loadAsync(i);return Ww(s,e,t)}function Ww(i,e={},t={}){let n=e.anim||t.anim||"biped",s={...t,textureCache:new Map},r=kw(i.scene);if(e.rig==="skinned"||e.rig!=="puppet"&&r&&i.animations&&i.animations.length)return Hw(i,e,n,s);let a=r?xg(i.scene,e,n,s):Uw(i.scene,e,n,s);return a.entry=e,a}function Be(i,e,t,n,s=0,r=0,a=0){let o=new kt(i,e,t);return o.translate(s,r,a),Yr(o,n)}function Bt(i,e,t=0,n=0,s=0,r=1,a=1,o=1,l=8){let c=new Ps(i,l,Math.max(4,Math.round(l*.75)));return c.scale(r,a,o),c.translate(t,n,s),Yr(c,e)}function Nl(i,e,t,n,s,r,a=1){let o=new Qi(i,e,6);return o.rotateX(a>0?Math.PI/2:-Math.PI/2),o.translate(n,s,r+a*e/2),Yr(o,t)}function pg(i,e,t){let n=new mn(i,i,e,12);return n.rotateZ(Math.PI/2),Yr(n,t)}function We(i,e,t,n,s){let r=new Me().makeTranslation(n[0],n[1],n[2]);i[e]={geometry:Kr(t),pivotMatrix:r,parent:s}}var qw={"citizen-a":{shirt:X.roofRed,pants:X.roofSlate,skin:X.wallBeige,hair:X.wood},"citizen-b":{shirt:X.forestDark,pants:X.asphalt,skin:X.wallTan,hair:X.asphalt},"citizen-c":{shirt:X.river,pants:X.wallTan,skin:X.wallCream,hair:X.sun},cyclist:{shirt:X.sun,pants:X.asphalt,skin:X.wallBeige,hair:X.wood},deer:{fur:X.wood,belly:X.wallTan,dark:X.asphalt,accent:X.wallCream},fox:{fur:X.roofOrange,belly:X.wallCream,dark:X.asphalt,accent:X.marking},duck:{body:X.wallCream,head:X.forestDark,beak:X.sun,dark:X.roofOrange},owl:{body:X.wallTan,head:X.wallCream,beak:X.sun,dark:X.wood},heron:{body:X.sidewalk,neck:X.wallCream,beak:X.sun,dark:X.asphalt},otter:{fur:X.wood,belly:X.wallTan,dark:X.asphalt},bee:{body:X.sun,stripe:X.asphalt,wing:X.marking},swallow:{body:X.roofSlate,belly:X.wallCream,wing:X.asphalt}},Xw={shirt:X.roofOrange,pants:X.asphalt,skin:X.wallBeige,hair:X.wood,fur:X.wallTan,belly:X.wallCream,dark:X.asphalt,accent:X.marking,body:X.wallTan,head:X.wallCream,beak:X.sun,neck:X.wallCream,stripe:X.asphalt,wing:X.marking};function Lf(i,e="",t=null){let n={...Xw,...qw[e]||{}},s={},r=!1;switch(i){case"quadruped":{let u=e==="fox",h=.13,f=.26;We(s,"Body",[Be(.1,.1,f,n.fur,0,.05,0),Be(.08,.03,f*.8,n.belly,0,-.005,0)],[0,h,0],null);let d={LegFL:[-.035,.09],LegFR:[.035,.09],LegBL:[-.035,-.09],LegBR:[.035,-.09]};for(let[x,[m,p]]of Object.entries(d))We(s,x,[Be(.025,h,.025,n.dark,0,-h/2,0)],[m,0,p],"Body");We(s,"Neck",[Be(.05,.11,.05,n.fur,0,.05,.015)],[0,.085,.11],"Body");let g=[Be(.055,.055,.09,n.fur,0,.02,.03),Be(.03,.02,.03,n.dark,0,.005,.08)];if(u)g.push(Be(.012,.03,.012,n.fur,-.02,.06,.01),Be(.012,.03,.012,n.fur,.02,.06,.01));else for(let x of[-1,1])g.push(Be(.008,.08,.008,n.accent,x*.02,.085,.02),Be(.03,.008,.008,n.accent,x*.03,.1,.02));We(s,"Head",g,[0,.105,.02],"Neck"),We(s,"Tail",u?[Be(.035,.035,.1,n.fur,0,-.01,-.05),Be(.03,.03,.03,n.accent,0,-.01,-.1)]:[Be(.02,.025,.05,n.belly,0,0,-.025)],[0,.08,-f/2],"Body");break}case"bird":{let u=e==="owl",h=u?.012:.02;u?(We(s,"Body",[Bt(.035,n.body,0,.045,0,1,1.3,.9)],[0,h,0],null),We(s,"Head",[Bt(.03,n.head,0,.02,0,1,.9,.9),Bt(.008,n.dark,-.012,.025,.024),Bt(.008,n.dark,.012,.025,.024),Nl(.005,.012,n.beak,0,.012,.025,1),Be(.01,.015,.01,n.body,-.018,.045,0),Be(.01,.015,.01,n.body,.018,.045,0)],[0,.085,.005],"Body"),We(s,"WingL",[Be(.012,.07,.04,n.dark,-.004,-.035,0)],[-.032,.07,0],"Body"),We(s,"WingR",[Be(.012,.07,.04,n.dark,.004,-.035,0)],[.032,.07,0],"Body"),We(s,"Tail",[Be(.03,.01,.03,n.dark,0,0,-.015)],[0,.02,-.03],"Body")):(We(s,"Body",[Bt(.035,n.body,0,.03,0,1,.8,1.4)],[0,h,0],null),We(s,"Head",[Bt(.022,n.head,0,.012,0,1,1,1.1),Be(.016,.008,.028,n.beak,0,.004,.03)],[0,.05,.038],"Body"),We(s,"WingL",[Be(.05,.008,.06,n.dark,-.025,0,-.005)],[-.03,.04,0],"Body"),We(s,"WingR",[Be(.05,.008,.06,n.dark,.025,0,-.005)],[.03,.04,0],"Body"),We(s,"Tail",[Be(.02,.01,.03,n.body,0,.005,-.015)],[0,.04,-.045],"Body")),We(s,"LegL",[Be(.006,h,.006,n.beak,0,-h/2,0),Be(.014,.004,.018,n.beak,0,-h,.005)],[-.012,0,0],"Body"),We(s,"LegR",[Be(.006,h,.006,n.beak,0,-h/2,0),Be(.014,.004,.018,n.beak,0,-h,.005)],[.012,0,0],"Body");break}case"flyer":{if(r=!0,e==="bee")We(s,"Body",[Bt(.02,n.body,0,0,0,1,1,1.5),Be(.042,.042,.008,n.stripe,0,0,-.005),Be(.038,.038,.008,n.stripe,0,0,-.018)],[0,0,0],null),We(s,"Head",[Bt(.012,n.stripe,0,0,.006)],[0,.004,.03],"Body"),We(s,"WingL",[Be(.036,.003,.016,n.wing,-.018,0,0)],[-.012,.016,0],"Body"),We(s,"WingR",[Be(.036,.003,.016,n.wing,.018,0,0)],[.012,.016,0],"Body");else{We(s,"Body",[Bt(.02,n.body,0,0,0,1,.9,2.2),Bt(.018,n.belly,0,-.006,.004,.9,.6,1.8)],[0,0,0],null),We(s,"Head",[Bt(.015,n.body,0,.002,.006),Nl(.004,.012,n.wing,0,0,.018,1)],[0,.006,.04],"Body"),We(s,"WingL",[Be(.09,.004,.035,n.wing,-.045,0,-.008)],[-.015,.008,.005],"Body"),We(s,"WingR",[Be(.09,.004,.035,n.wing,.045,0,-.008)],[.015,.008,.005],"Body");let u=new kt(.006,.003,.05);u.translate(0,0,-.025),u.rotateY(.25);let h=new kt(.006,.003,.05);h.translate(0,0,-.025),h.rotateY(-.25),We(s,"Tail",[Yr(u,n.wing),Yr(h,n.wing)],[0,0,-.04],"Body")}break}case"wader":{We(s,"Body",[Bt(.04,n.body,0,.035,0,.9,.9,1.6)],[0,.14,0],null),We(s,"LegL",[Be(.008,.14,.008,n.dark,0,-.14/2,0)],[-.015,0,0],"Body"),We(s,"LegR",[Be(.008,.14,.008,n.dark,0,-.14/2,0)],[.015,0,0],"Body"),We(s,"WingL",[Be(.12,.006,.07,n.body,-.06,0,-.01)],[-.03,.06,0],"Body"),We(s,"WingR",[Be(.12,.006,.07,n.body,.06,0,-.01)],[.03,.06,0],"Body"),We(s,"Neck",[Be(.015,.12,.015,n.neck,0,.06,.01)],[0,.06,.06],"Body"),We(s,"Head",[Bt(.018,n.body,0,.005,0,1,.9,1.2),Nl(.006,.05,n.beak,0,.002,.018,1)],[0,.12,.015],"Neck");break}case"swimmer":{r=!0,We(s,"Body",[Bt(.03,n.fur,0,.012,0,1,.75,3.4),Be(.035,.01,.12,n.belly,0,.03,0)],[0,0,0],null),We(s,"Head",[Bt(.025,n.fur,0,.004,.01,1,.9,1.1),Bt(.008,n.dark,0,0,.034)],[0,.03,.1],"Body"),We(s,"Tail",[Nl(.018,.13,n.fur,0,0,0,-1)],[0,.015,-.1],"Body");break}case"wheeled":{We(s,"Frame",[Be(.004,.004,.11,n.dark,0,0,0),Be(.004,.05,.004,n.dark,0,.025,-.02),Be(.004,.05,.004,n.dark,0,.025,.05),Be(.06,.004,.004,n.dark,0,.05,.05)],[0,.045,0],null),We(s,"WheelF",[pg(.045,.008,n.dark)],[0,0,.06],"Frame"),We(s,"WheelB",[pg(.045,.008,n.dark)],[0,0,-.06],"Frame"),We(s,"Body",[Be(.05,.08,.04,n.shirt,0,.04,.01),Be(.02,.07,.02,n.shirt,-.03,.03,.03),Be(.02,.07,.02,n.shirt,.03,.03,.03)],[0,.065,-.02],"Frame"),We(s,"Head",[Bt(.03,n.skin,0,.03,0),Bt(.03,n.hair,0,.038,-.004,1.02,.6,1.02)],[0,.08,.01],"Body"),We(s,"LegL",[Be(.02,.07,.02,n.pants,0,-.035,0)],[-.02,.005,0],"Body"),We(s,"LegR",[Be(.02,.07,.02,n.pants,0,-.035,0)],[.02,.005,0],"Body");break}case"vehicle":{We(s,"Body",[Be(.14,.06,.26,n.shirt,0,.05,0),Be(.12,.05,.14,n.skin,0,.105,-.02)],[0,0,0],null);break}default:We(s,"Body",[Be(.08,.09,.05,n.shirt,0,.09/2,0)],[0,.09,0],null),We(s,"Head",[Bt(.042,n.skin,0,.04,0),Bt(.043,n.hair,0,.05,-.006,1,.7,1),Be(.012,.012,.01,n.skin,0,.035,.042)],[0,.09,0],"Body"),We(s,"ArmL",[Be(.022,.07,.022,n.shirt,0,-.035,0),Be(.02,.018,.02,n.skin,0,-.078,0)],[-.052,.09-.008,0],"Body"),We(s,"ArmR",[Be(.022,.07,.022,n.shirt,0,-.035,0),Be(.02,.018,.02,n.skin,0,-.078,0)],[.052,.09-.008,0],"Body"),We(s,"LegL",[Be(.03,.09,.035,n.pants,0,-.09/2,0)],[-.021,0,0],"Body"),We(s,"LegR",[Be(.03,.09,.035,n.pants,0,-.09/2,0)],[.021,0,0],"Body")}let a={kind:"puppet",anim:i,root:Xr(i),order:[],parts:s,height:0,float:r,fallback:!0},o=Object.keys(s);a.order=o.filter(u=>!s[u].parent).concat(o.filter(u=>s[u].parent));let l=[],c=new Set(a.order);for(;c.size;)for(let u of Array.from(c)){let h=s[u].parent;(!h||l.includes(h))&&(l.push(u),c.delete(u))}if(a.order=l,t){let u=Fl(a),h=u.max.y-u.min.y;if(h>1e-6){let f=t/h;for(let d of a.order){s[d].geometry.scale(f,f,f),s[d].geometry.computeBoundingBox();let g=s[d].pivotMatrix.elements;g[12]*=f,g[13]*=f,g[14]*=f}}}return bg(a,null)}function Bl(i){if(i){if(i.kind==="puppet")for(let e of Object.keys(i.parts))i.parts[e].geometry.dispose();i.puppet&&Bl(i.puppet)}}var jw=.26,Kw={idle:["idle"],walk:["walk","run","idle"],run:["run","walk","idle"],fly:["fly","walk","idle"],hover:["hover","fly","idle"],swim:["swim","walk","idle"],dive:["dive","swim","idle"],drive:["drive","idle"]};function Yw(i,e){if(/^(https?:)?\/\//.test(e)||e.startsWith("/")||e.startsWith("data:"))return e;let t=String(i||"").split(/[?#]/)[0];return t.slice(0,t.lastIndexOf("/")+1)+e}function yg(i,e={}){let t=e.maxSkinned??12,n=e.shadows!==!1,s=e.skinnedShadows===!0,r=e.manifestUrl||"assets/models/manifest.json",a=e.vehicleScale??jw,o=new Rt;o.name="actors";let l=i.materials.vertex,c=i.manifest&&i.manifest.models||{},u=new Map,h=new Map,f=new Map,d=new Set,g=null,x=!1,m=null,p=0,y=new Map,v=!0,_=new Map,M={skinned:0,puppets:0,vehicles:0,drawables:0,instances:0,rigs:{loaded:0,failed:0,pending:0}},E=new Me,w=new Me,b=new Me,T=new Fn,R=new Map,P=O=>{let ee=R.get(O);return ee||(ee=new Me,R.set(O,ee)),ee};function D(O){let ee=u.get(O);if(ee)return ee;let te=na[O]||{anim:"biped",height:.22},ce=c[O],Ve=ce&&ce.anim||te.anim;if(ee=e.rigs&&e.rigs.get&&e.rigs.get(O)||Lf(Ve,O,te.height),u.set(O,ee),ce&&(ce.animated||ce.rig)&&!h.has(O)&&!(e.rigs&&e.rigs.has&&e.rigs.has(O))){let Ae=Yw(r,ce.file||`${O}.glb`);M.rigs.pending++;let je=_g(Ae,{...ce,anim:Ve},{anim:Ve,targetHeight:te.height,float:ee.float}).then(Ee=>{if(x)return;let rt=u.get(O);u.set(O,Ee),rt&&rt.fallback&&Bl(rt);for(let wt of f.values())wt.model===O&&(wt.stale=!0);v=!0,M.rigs.loaded++}).catch(Ee=>{M.rigs.failed++,console.warn(`[actors] modèle animé « ${O} » illisible : pantin de repli.`,Ee)}).finally(()=>{M.rigs.pending--});h.set(O,je)}return ee}function I(O,ee){if(ee.kind==="puppet")return ee;if(ee.puppet)return ee.puppet;let te=u.get(`${O}#fallback`);if(!te){let ce=na[O]||{anim:ee.anim,height:.2};te=Lf(ee.anim,O,ce.height),u.set(`${O}#fallback`,te)}return te}for(let O of Object.keys(na))c[O]&&(c[O].animated||c[O].rig)&&D(O);function C(O){if(O.kind==="puppet"&&O.ids&&m){for(let ee of Object.values(O.ids))try{m.deleteInstance(ee)}catch{}O.ids=null}else O.kind==="skinned"&&O.object&&(O.mixer.stopAllAction(),O.mixer.uncacheRoot(O.object),o.remove(O.object),O.object=null)}function N(O,ee){let te=Kw[ee]||["idle"];for(let Ve of te)if(O.clips[Ve])return{name:Ve,clip:O.clips[Ve]};let ce=Object.keys(O.clips)[0];return ce?{name:ce,clip:O.clips[ce]}:null}function z(O,ee){let te=D(O.model);if(O.group==="vehicle")return{kind:"vehicle",model:O.model,id:O.id};if(te.kind==="skinned"&&ee<t){let ce=bl(te.template);ce.name=`actor-${O.id}`,ce.traverse(oe=>{oe.isMesh&&(oe.castShadow=s)});let Ve=new ka(ce);return o.add(ce),{kind:"skinned",model:O.model,id:O.id,rig:te,object:ce,mixer:Ve,action:null,clipName:null}}return{kind:"puppet",model:O.model,id:O.id,rig:I(O.model,te),ids:null,visible:!0}}function F(O){d.clear();for(let te of O.list)d.add(te.id);for(let[te,ce]of f)(!d.has(te)||ce.stale)&&(C(ce),f.delete(te));let ee=0;for(let te of f.values())te.kind==="skinned"&&ee++;for(let te of O.list){let ce=f.get(te.id);ce&&ce.model!==te.model&&(C(ce),f.delete(te.id),ce=null),ce||(ce=z(te,ee),ce.kind==="skinned"&&ee++,ce.kind==="puppet"&&(v=v||!m||!y.has(ce.rig)),f.set(te.id,ce))}}function W(){let O=Array.from(f.values()).filter(Ae=>Ae.kind==="puppet"),ee=new Set(O.map(Ae=>Ae.rig)),te=0,ce=0,Ve=0;for(let Ae of ee)for(let je of Ae.order){let Ee=Ae.parts[je].geometry;te+=Ee.attributes.position.count,ce+=Ee.index?Ee.index.count:Ee.attributes.position.count}for(let Ae of O)Ve+=Ae.rig.order.length;let oe=Math.max(64,Math.ceil(Ve*1.3)+16);m&&(o.remove(m),m.dispose()),m=new As(oe,Math.max(te,3),Math.max(ce,3),l),m.name="actors-batch",m.castShadow=n,m.receiveShadow=!1,m.perObjectFrustumCulled=!0,m.sortObjects=!1,m.frustumCulled=!1,p=oe,y=new Map;for(let Ae of ee){let je=new Map;for(let Ee of Ae.order)je.set(Ee,m.addGeometry(Ae.parts[Ee].geometry));y.set(Ae,je)}for(let Ae of O)V(Ae);o.add(m),v=!1}function V(O){let ee=y.get(O.rig);O.ids={};for(let te of O.rig.order)O.ids[te]=m.addInstance(ee.get(te));O.visible=!0}function Y(){if(v){W();return}let O=0;for(let ee of f.values())ee.kind==="puppet"&&!ee.ids&&(O+=ee.rig.order.length);if(O){if(!m||m.instanceCount+O>p){W();return}for(let ee of f.values())ee.kind==="puppet"&&!ee.ids&&V(ee)}}function Q(O){if(O.group==="habitant"||O.group==="vehicle")return O.bridge?Wr:0;if(!g)return 0;let ee=Math.floor(O.x),te=Math.floor(O.z);return ee<0||te<0||ee>=g.cols||te>=g.rows?0:Al(g,ee,te)}function he(O,ee){let te=ee.rig,ce=!!O.hidden;if(ce!==!ee.visible){for(let oe of Object.values(ee.ids))m.setVisibleAt(oe,!ce);ee.visible=!ce}if(ce)return;xi(E,O.x,Q(O)+O.y,O.z,O.yaw,1);let Ve=fg(te.anim,O.state,O.phase,O);for(let oe of te.order){let Ae=te.parts[oe],je=P(oe);je.multiplyMatrices(Ae.parent?R.get(Ae.parent):E,Ae.pivotMatrix);let Ee=Ve[oe];Ee&&((Ee.dx||Ee.dy||Ee.dz)&&je.multiply(w.makeTranslation(Ee.dx,Ee.dy,Ee.dz)),(Ee.rx||Ee.ry||Ee.rz)&&je.multiply(b.makeRotationFromEuler(T.set(Ee.rx,Ee.ry,Ee.rz)))),m.setMatrixAt(ee.ids[oe],je)}}function fe(O,ee,te){let ce=ee.object;ce.visible=!O.hidden,ce.position.set(O.x,Q(O)+O.y,O.z),ce.rotation.y=O.yaw;let Ve=N(ee.rig,O.state);if(Ve&&Ve.name!==ee.clipName){let oe=ee.mixer.clipAction(Ve.clip);oe.enabled=!0,oe.setEffectiveWeight(1),oe.reset().play(),ee.action&&ee.action!==oe&&ee.action.crossFadeTo(oe,.2,!1),ee.action=oe,ee.clipName=Ve.name}ee.action&&(ee.action.timeScale=O.state==="run"?1.4:1),ee.mixer.update(te)}function Ge(O,ee){let te=_.get(O);if(te&&te.capacity>=ee)return te;let ce=Math.max(24,ee*2);te&&(o.remove(te.mesh),te.mesh.dispose());let Ve=i.resolve(O),oe=new Yt(Ve.geometry,Ve.material,ce);return oe.name=`vehicles-${O}`,oe.geometry.userData.shared=!0,oe.castShadow=n,oe.receiveShadow=!1,oe.frustumCulled=!1,oe.count=0,o.add(oe),te={mesh:oe,capacity:ce,count:0},_.set(O,te),te}function Te(O,ee){if(x||!ee)return;let te=Math.min(.1,Math.max(0,Number(O)||0));F(ee),Y();let ce=new Map;for(let oe of ee.list)oe.group==="vehicle"&&ce.set(oe.model,(ce.get(oe.model)||0)+1);for(let oe of _.values())oe.count=0;M.skinned=0,M.puppets=0,M.vehicles=0;for(let oe of ee.list){let Ae=f.get(oe.id);if(Ae)if(Ae.kind==="puppet")Ae.ids&&he(oe,Ae),M.puppets++;else if(Ae.kind==="skinned")fe(oe,Ae,te),M.skinned++;else{let je=Ge(oe.model,ce.get(oe.model)||1);if(oe.hidden)continue;xi(E,oe.x,Q(oe)+oe.y,oe.z,oe.yaw,a),je.mesh.setMatrixAt(je.count++,E),M.vehicles++}}for(let oe of _.values())oe.mesh.count=oe.count,oe.mesh.instanceMatrix.needsUpdate=!0;let Ve=m&&m.instanceCount>0?1:0;for(let oe of _.values())oe.count>0&&Ve++;for(let oe of f.values())oe.kind==="skinned"&&oe.object&&oe.object.traverse(Ae=>{Ae.isMesh&&Ae.visible&&Ve++});M.drawables=Ve,M.instances=(m?m.instanceCount:0)+M.vehicles}function Fe(O){g=O}function k(){return Promise.all(Array.from(h.values())).then(()=>{})}function $(){x=!0;for(let O of f.values())C(O);f.clear(),m&&(o.remove(m),m.dispose(),m=null);for(let O of _.values())o.remove(O.mesh),O.mesh.dispose();_.clear();for(let O of u.values())O.kind==="puppet"&&Bl(O);u.clear()}return{group:o,setWorld:Fe,update:Te,ready:k,stats:()=>({...M,rigs:{...M.rigs},batchCapacity:p,maxSkinned:t}),debug:{rigs:u,slots:f,get batch(){return m}},dispose:$}}var RC=Object.freeze(["none","air","water","fauna"]),Jw=Object.freeze({air:Object.freeze([X.rockLight,"#7a4a30"]),water:Object.freeze([X.river,"#6f8a3a"]),fauna:Object.freeze(["#d6e9bf","#1f8a3c"])}),Zw=.8,vg=new ue,Mg=new ue,Sg=new ue,so=new ue;function $w(i){let e=0;for(let t=0;t<i.length;t++)i[t]>e&&(e=i[t]);return e>1?100:1}function wg(i,e,t){if(!i||i==="none"||!e||!t)return null;let n=Jw[i];if(!n)throw new Error(`Calque inconnu : ${i}`);vg.set(n[0]),Mg.set(n[1]);let s=$w(e),r=t.length/3,a=new Float32Array(t.length);for(let o=0;o<r;o++){let l=o<e.length?e[o]:0,c=Math.min(1,Math.max(0,(Number.isFinite(l)?l:0)/s));Sg.copy(vg).lerp(Mg,c),so.setRGB(t[o*3],t[o*3+1],t[o*3+2]),so.lerp(Sg,Zw),a[o*3]=so.r,a[o*3+1]=so.g,a[o*3+2]=so.b}return a}var iE=new U(-.62,1,.42).normalize(),sE=40;async function Eg(i,e={}){let{manifestUrl:t="assets/models/manifest.json",pixelRatioMax:n=2,shadows:s=!0,shadowMapSize:r=2048,markings:a=!0,background:o=X.wallCream}=e,l;try{l=new fl({canvas:i,antialias:!0,powerPreference:"high-performance",alpha:!1,stencil:!1})}catch(k){throw new Error(`WebGL2 indisponible : ${k&&k.message?k.message:k}`)}l.setPixelRatio(Math.min(n,(typeof devicePixelRatio=="number"?devicePixelRatio:1)||1)),l.shadowMap.enabled=s,l.shadowMap.type=Fs,l.toneMapping=Tn,l.outputColorSpace=Et;let c=l.extensions.has("WEBGL_multi_draw"),u=e.strategy&&e.strategy!=="auto"?e.strategy:c?"batched":"instanced",h=new ya;h.background=new ue(o);let f=new Da(16774372,10473354,1.4),d=new Ns(16773596,2.2);d.castShadow=s,d.shadow.mapSize.set(r,r),d.shadow.bias=-4e-4,d.shadow.normalBias=.02,d.shadow.radius=2,h.add(f,d,d.target);let g=new ui(-1,1,1,-1,1,200),x=Bh({yaw:e.yaw??45*Math.PI/180,pitch:e.pitch??35*Math.PI/180}),m={width:Math.max(1,i.clientWidth||i.width||1),height:Math.max(1,i.clientHeight||i.height||1)},p=null,y={top:0,bottom:0,left:0,right:0,...e.insets||{}},v=!0,_=!1,M=!1,E=!1,w=!0,b={calls:0,triangles:0,frameMs:0,frames:0};function T(){let k=Sm(x,m);g.left=k.left,g.right=k.right,g.top=k.top,g.bottom=k.bottom,g.near=k.near,g.far=k.far,g.position.set(k.position[0],k.position[1],k.position[2]),g.up.set(0,1,0),g.lookAt(k.target[0],k.target[1],k.target[2]),g.updateProjectionMatrix(),g.updateMatrixWorld(),v=!0}function R(k){k!==x&&(x=p?eo(k,p,m):k,T())}let P=await Hm(t,{fetch:e.fetch}),D=Qm(),I=ng(P,{strategy:u,modelFor:e.modelFor,shadows:s}),C=ag(P,{markings:a}),N=ug(P,{palette:X,shadows:s}),z=yg(P,{maxSkinned:e.maxSkinned??8,manifestUrl:e.manifestUrl});h.add(D.group,I.group,C.group,N.group,z.group);let F=null,W=0,V={ms:0},Y={kind:"none",values:null};function Q(){if(!p||!s)return;let k=p.cols/2,$=p.rows/2;d.target.position.set(k,0,$),d.position.copy(iE).multiplyScalar(sE).add(d.target.position),d.target.updateMatrixWorld(),d.updateMatrixWorld();let O=new Me().lookAt(d.position,d.target.position,new U(0,1,0));O.setPosition(d.position),O.invert();let ee=new U,te=1/0,ce=-1/0,Ve=1/0,oe=-1/0,Ae=1/0,je=-1/0;for(let wt of[0,p.cols])for(let Zt of[0,p.rows])for(let yt of[-.7,2.6])ee.set(wt,yt,Zt).applyMatrix4(O),te=Math.min(te,ee.x),ce=Math.max(ce,ee.x),Ve=Math.min(Ve,ee.y),oe=Math.max(oe,ee.y),Ae=Math.min(Ae,ee.z),je=Math.max(je,ee.z);let Ee=d.shadow.camera,rt=.5;Ee.left=te-rt,Ee.right=ce+rt,Ee.bottom=Ve-rt,Ee.top=oe+rt,Ee.near=Math.max(.1,-je-rt),Ee.far=-Ae+rt,Ee.updateProjectionMatrix(),d.shadow.needsUpdate=!0}function he(){let k=D.baseColors(),$=k?wg(Y.kind,Y.values,k):null;D.setTileColors($),v=!0}function fe(k){k.preventDefault(),M=!0}function Ge(){M=!1,s&&(d.shadow.needsUpdate=!0),v=!0}i.addEventListener("webglcontextlost",fe,!1),i.addEventListener("webglcontextrestored",Ge,!1);let Te={get state(){return x},setState(k){R(k)},pan(k,$){R(Am(x,k,$,m))},zoomAt(k,$,O){R(Rm(x,k,$,O,m,p))},fitAll(k={}){p&&(x=Pm(x,p,m,{insets:y,...k}),T())},lookAt(k,$,O,ee={}){p&&(x=Im(x,p,m,k+.5,$+.5,O,{insets:y,...ee}),T())},ground(k,$){let O=i.getBoundingClientRect?i.getBoundingClientRect():{left:0,top:0};return $a(x,k,$,{...m,left:O.left,top:O.top})},toScreen(k,$,O){return Em(x,m,k,$,O)}},Fe={debug:{scene:h,camera:g,renderer:l,models:P,ground:D,buildings:I,roads:C,sun:d},camera:Te,get world(){return p},get strategy(){return u},setWorld(k){p=k,N.setWorld(p),z.setWorld(p),_=!0,D.setWorld(p),I.setWorld(p),C.setWorld(p),Q(),he(),w?(w=!1,Te.fitAll()):R(eo(x,p,m)),v=!0},setInsets(k){let $=y;if(y={top:0,bottom:0,left:0,right:0,...k||{}},!p)return;Math.abs(x.zoom-ml(p,m,x,{insets:$}))<1e-6&&Te.fitAll()},setLayer(k,$){Y={kind:k||"none",values:$||null},he()},resize(k,$,O){let ee=Math.max(1,Math.round(k)),te=Math.max(1,Math.round($));m={width:ee,height:te},l.setPixelRatio(Math.min(n,O||1)),l.setSize(ee,te,!1),p&&(x=eo(x,p,m)),T()},pick(k,$){let O=i.getBoundingClientRect?i.getBoundingClientRect():{left:0,top:0};return Tm(x,k,$,{...m,left:O.left,top:O.top},p)},invalidate(){v=!0},setActors(k){F=k||null,v=!0},setAnimating(k){_=!!k},get needsRender(){return v||_},render(k=0){if(E||M||!v&&!_)return!1;let $=performance.now();if(_&&k>0){let O=performance.now();W+=k,N.update(k,W),typeof D.update=="function"&&D.update(k),F&&z.update(k,F),V.ms=performance.now()-O}return l.render(h,g),b.frameMs=performance.now()-$,b.calls=l.info.render.calls,b.triangles=l.info.render.triangles,b.frames++,v=!1,!0},stats(){return{calls:b.calls,triangles:b.triangles,frameMs:b.frameMs,frames:b.frames,geometries:l.info.memory.geometries,textures:l.info.memory.textures,programs:l.info.programs?l.info.programs.length:0,pixelRatio:l.getPixelRatio(),strategy:u,multiDraw:c,buildings:{...I.stats},roads:{...C.stats},ground:{...D.stats},effects:N.stats?N.stats():null,actors:z.stats?z.stats():null,layersUpdateMs:V.ms,models:{loaded:P.ids.length,errors:P.errors.length}}},dispose(){E||(E=!0,i.removeEventListener("webglcontextlost",fe,!1),i.removeEventListener("webglcontextrestored",Ge,!1),z.dispose(),N.dispose(),I.dispose(),C.dispose(),D.dispose(),P.dispose(),d.shadow.map&&d.shadow.map.dispose(),l.dispose())}};return T(),Fe}var Tg=it||null;function Ag(i){let e=Tg&&Tg[i];return e?`${i}?v=${e}`:i}function Rg(){let i=typeof window<"u"?window.__TILETOWN_BUILD__:null;return!i||!!i.dev}var Df={update:new Set,install:new Set,installed:new Set,offline:new Set},Jr=(i,...e)=>Df[i].forEach(t=>{try{t(...e)}catch(n){console.error(n)}}),Lg=(i,e)=>(Df[i].add(e),()=>Df[i].delete(e)),ro=null,Dg=null,zl=!1,Gl=!1,Ng=!1,Cg=null,Pg=!1,rE=1800*1e3;function aE(i){i&&(Dg=i,zl=!0,Jr("update"))}function oE(){let i=typeof window<"u"?window.__TILETOWN_BUILD__:null;return i&&i.id&&!i.dev?i.id:null}function cE(){let i=oE();!i||!navigator.serviceWorker.controller||lE().then(e=>{e&&e!==i&&!zl&&(zl=!0,Jr("update"))})}function Ig(i){i&&i.addEventListener("statechange",()=>{i.state==="installed"&&(navigator.serviceWorker.controller||Jr("offline"))})}function Fg({serviceWorker:i=!0}={}){if(Pg)return;Pg=!0,window.addEventListener("beforeinstallprompt",n=>{n.preventDefault(),Cg=n,Jr("install",!0)}),window.addEventListener("appinstalled",()=>{Cg=null,Jr("install",!1),Jr("installed")}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(Bg&&hE(),ro&&ro.update().catch(()=>{}))});let e=new URLSearchParams(location.search).has("nosw")||!!(window.__TILETOWN_BUILD__&&window.__TILETOWN_BUILD__.dev);if(!i||e||!("serviceWorker"in navigator)||!window.isSecureContext)return;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(Ng&&!Gl){Gl=!0,location.reload();return}cE()});let t=()=>{navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"}).then(n=>{ro=n,n.waiting&&navigator.serviceWorker.controller&&aE(n.waiting),Ig(n.installing),n.addEventListener("updatefound",()=>Ig(n.installing)),setInterval(()=>{document.visibilityState==="visible"&&n.update().catch(()=>{})},rE)}).catch(n=>console.warn("Service worker non enregistré :",n))};document.readyState==="complete"?t():window.addEventListener("load",t,{once:!0})}function Og(i){return zl&&queueMicrotask(()=>i()),Lg("update",i)}function Ug(){Ng=!0;let i=ro&&ro.waiting||Dg||null;if(!i){location.reload();return}i.postMessage({type:"SKIP_WAITING"}),setTimeout(()=>{Gl||(Gl=!0,location.reload())},4e3)}function kg(i){return Lg("offline",i)}function lE(){let i="serviceWorker"in navigator?navigator.serviceWorker.controller:null;return i?new Promise(e=>{let t=new MessageChannel,n=setTimeout(()=>e(null),2e3);t.port1.onmessage=s=>{clearTimeout(n),e(s.data&&s.data.version||null)},i.postMessage({type:"GET_VERSION"},[t.port2])}):Promise.resolve(null)}var Bg=!1,Ws=null;function uE(){return"wakeLock"in navigator}async function hE(){if(!(!uE()||Ws||document.visibilityState!=="visible"))try{Ws=await navigator.wakeLock.request("screen"),Ws.addEventListener("release",()=>{Ws=null}),Bg||fE()}catch{Ws=null}}function fE(){let i=Ws;Ws=null,i&&i.release().catch(()=>{})}var Hg="tiletown.a11y",pE="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",mE="width=device-width, initial-scale=1, viewport-fit=cover",zg=[1,1.15,1.3,1.5],Gg=Object.freeze({textScale:1,reducedMotion:!1,highContrast:!1,vibration:!0,pinchZoom:!1});function gE(){try{let i=JSON.parse(localStorage.getItem(Hg)||"null");return{...Gg,...i&&typeof i=="object"?i:{}}}catch{return{...Gg}}}function bE(i){try{localStorage.setItem(Hg,JSON.stringify(i))}catch{}}function xE(i){let e=Number(i)||1;return zg.reduce((t,n)=>Math.abs(n-e)<Math.abs(t-e)?n:t,zg[0])}function _E(i){let e=document.querySelector('meta[name="viewport"]');if(!e)return;let t=i?mE:pE;e.getAttribute("content")!==t&&e.setAttribute("content",t)}function Vg(i={}){let e={...gE(),...i},t=document.documentElement,n=!1;try{let a=matchMedia("(prefers-reduced-motion: reduce)");n=a.matches,a.addEventListener?.("change",()=>{n=a.matches,s()})}catch{}function s(a){a&&Object.assign(e,a),e.textScale=xE(e.textScale),t.style.setProperty("--text-scale",String(e.textScale)),t.dataset.textScale=String(Math.round(e.textScale*100)),t.classList.toggle("reduced-motion",!!e.reducedMotion||n),t.classList.toggle("high-contrast",!!e.highContrast),_E(!!e.pinchZoom),a&&bE(e)}function r(a=10){if(!e.vibration)return!1;try{return typeof navigator.vibrate=="function"?navigator.vibrate(a):!1}catch{return!1}}return s(),{apply:s,vibrate:r,reducedMotion:()=>!!e.reducedMotion||n,get settings(){return{...e}}}}function Qe(i,e,...t){let[n,...s]=i.split("."),r=document.createElement(n||"div");if(s.length&&(r.className=s.join(" ")),e&&(typeof e!="object"||e instanceof Node||Array.isArray(e))&&(t.unshift(e),e=null),e){for(let[a,o]of Object.entries(e))if(!(o==null||o===!1))if(a==="dataset")Object.assign(r.dataset,o);else if(a==="style"&&typeof o=="object")for(let[l,c]of Object.entries(o))l.startsWith("--")?r.style.setProperty(l,c):r.style[l]=c;else a.startsWith("on")&&typeof o=="function"?r.addEventListener(a.slice(2),o):a==="class"?r.className+=` ${o}`:a==="html"?r.innerHTML=o:a in r&&typeof o!="string"?r[a]=o:r.setAttribute(a,o===!0?"":o)}return yE(r,t),r}function yE(i,e){for(let t of e.flat(1/0))t==null||t===!1||i.append(t instanceof Node?t:document.createTextNode(ao(String(t))));return i}var Hl=" ";function ao(i){return!i||typeof i!="string"?i:i.replace(/ ([:;!?%»])/g,`${Hl}$1`).replace(/« /g,`«${Hl}`).replace(/(\d) (mois|ans?|habitants?|cases?|pièces?)\b/g,`$1${Hl}$2`)}function _i(i,e){let t=ao(String(e));return i.textContent!==t&&(i.textContent=t),i}function oo(i){for(;i.firstChild;)i.removeChild(i.firstChild);return i}var ei=(i,e=document)=>e.querySelector(i);function Vl(i){let e=Math.round(Number(i)||0),t=String(Math.abs(e)).replace(/\B(?=(\d{3})+(?!\d))/g,Hl);return e<0?`−${t}`:t}var vE=2,ME=new Set(["info","success","warn","error","money"]);function SE(i,e=i.kind||"info"){let t=Math.min(7e3,i.duration||3e3);return!!i.onClick||e==="error"||e==="warn"?Math.max(5e3,t):t}function Wg(i){let e=new Map,t=()=>[...i.children].filter(r=>r.classList.contains("toast")&&!r.classList.contains("is-leaving"));function n(r){!r.isConnected||r.classList.contains("is-leaving")||(r.classList.add("is-leaving"),setTimeout(()=>r.remove(),260))}function s(r){let a=typeof r=="string"?{text:r}:r,o=ME.has(a.kind)?a.kind:"info",l=a.key?`key|${a.key}`:`${o}|${a.title||""}|${a.text}`,c=SE(a,o),u=e.get(l);if(u&&u.node.isConnected&&!u.node.classList.contains("is-leaving")){if(a.key){let x=u.node.querySelector(".toast-text");x&&(x.textContent=ao(a.text));let m=u.node.querySelector(".toast-title");m&&a.title&&(m.textContent=ao(a.title))}return clearTimeout(u.timer),clearTimeout(u.forget),u.node.classList.remove("is-bump"),u.node.offsetWidth,u.node.classList.add("is-bump"),u.timer=setTimeout(()=>n(u.node),c),u.forget=setTimeout(()=>{e.get(l)===u&&e.delete(l)},c+400),u.node}let h=a.onClick?Qe("button.btn.toast-go",{type:"button","aria-label":`${a.actionLabel||"Voir"} : ${a.title||a.text}`,onclick:x=>{x.stopPropagation(),n(f);try{a.onClick()}catch(m){console.warn("Message :",m)}}},a.actionLabel||"Voir"):null,f=Qe(`div.toast.toast--${o}`,{role:o==="error"?"alert":"status"},Qe("div.toast-body",a.title?Qe("strong.toast-title",a.title):null,Qe("span.toast-text",a.text)),h);a.key&&(f.dataset.key=String(a.key)),i.prepend(f);let d=t();for(let x of d.slice(vE))n(x);let g={node:f,timer:setTimeout(()=>n(f),c)};return g.forget=setTimeout(()=>{e.get(l)===g&&e.delete(l)},c+400),e.set(l,g),f}return{show:s,hide(r){r&&r.nodeType===1&&n(r)},clearAll(){for(let r of[...i.children])r.remove();for(let r of e.values())clearTimeout(r.timer),clearTimeout(r.forget);e.clear()},stats:()=>({visible:t().length})}}var Ff=Object.freeze([{id:"habitat",label:"Habitat",title:"Habitat"},{id:"activity",label:"Activité",title:"Activité"},{id:"services",label:"Services",title:"Services"},{id:"infrastructure",label:"Réseaux",title:"Infrastructures"},{id:"nature",label:"Nature",title:"Nature"}]),Nf=Object.freeze([{id:"demolish",label:"Démolir",title:"Démolir"},{id:"layers",label:"Calques",title:"Calques : air, eau, faune"}]),wE=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],EE=["Hiver","Hiver","Printemps","Printemps","Printemps","Été","Été","Été","Automne","Automne","Automne","Hiver"];function TE(i){return EE[(Math.round(i)%12+12)%12]}function qg(i){return i?i===.5?"×½":`×${i}`:"Pause"}function AE(i){let e=[1,2,4];if(!i)return e[0];let t=e.indexOf(i);return t===-1?1:t===e.length-1?0:e[t+1]}var RE={habitat:[["Quartier",60,"var(--c-roof-red)"],["Immeuble",140,"var(--c-roof-orange)"],["Tour",320,"var(--c-roof-slate)"]],activity:[["Commerce",90,"var(--c-sun)"],["Bureaux",160,"var(--c-roof-slate)"],["Usine",220,"var(--c-metal)"]],services:[["École",180,"var(--c-wall-beige)"],["Dispensaire",240,"var(--c-blossom)"],["Caserne",260,"var(--c-roof-red)"]],infrastructure:[["Éolienne",150,"var(--c-metal-light)"],["Château d’eau",120,"var(--c-river)"],["Gare",400,"var(--c-asphalt)"]],nature:[["Parc",40,"var(--c-grass-light)"],["Bosquet",30,"var(--c-forest-dark)"],["Mare",50,"var(--c-lake-deep)"],["Prairie fleurie",25,"var(--c-wheat)"]],demolish:[],layers:[["Air",0,"var(--c-metal-light)"],["Eau",0,"var(--c-river)"],["Faune",0,"var(--c-forest-dark)"]]},CE={habitat:"var(--c-roof-red)",activity:"var(--c-roof-slate)",services:"var(--c-sun)",infrastructure:"var(--c-metal)",nature:"var(--c-forest-dark)"};function PE(i,e){if(Array.isArray(e)&&e.length){let t=e.filter(n=>n.family===i).map(n=>[n.label,n.price||0,CE[n.family]||"var(--c-sidewalk)"]);if(t.length||Ff.some(n=>n.id===i))return t}return RE[i]||[]}function Xg({hud:i,tabbar:e,sheetLayer:t},{onSpeed:n,onTab:s,vibrate:r,catalog:a}={}){let o=C=>{try{r?.(C)}catch{}},l={},c=(C,N,z=N)=>{let F=Qe("span.gauge-value","0"),W=z===N?N:[Qe("span.gauge-label-long",N),Qe("span.gauge-label-short",z)],V=Qe(`button.gauge.gauge--${C}`,{type:"button","aria-label":N,title:N},Qe("span.gauge-label",W),F);return l[C]={node:V,value:F},V},u=Qe("span.date-season","Printemps"),h=Qe("span.date-month","mars"),f=Qe("span.date-year","an 1"),d=Qe("div.hud-date",{"aria-live":"polite"},u,Qe("span.date-sep","·"),h,Qe("span.date-sep","·"),f),g=Qe("span.speed-glyph",{"aria-hidden":"true"},"▶"),x=Qe("span.speed-text","×1"),m=1,p=Qe("button.hud-speed",{type:"button",id:"speed","aria-label":"Vitesse du temps",onclick:()=>{o(8);let C=AE(m);_(C),n?.(C)}},g,x);oo(i).append(c("population","Population","Habitants"),c("happiness","Bonheur"),c("nature","Nature"),c("money","Argent"),d,p);function y(C={}){C.population!==void 0&&_i(l.population.value,Vl(C.population)),C.happiness!==void 0&&_i(l.happiness.value,`${Math.round(C.happiness)} %`),C.nature!==void 0&&_i(l.nature.value,`${Math.round(C.nature)} %`),C.money!==void 0&&(_i(l.money.value,Vl(C.money)),l.money.node.classList.toggle("is-negative",C.money<0))}function v({month:C=2,year:N=1}={}){_i(u,TE(C)),_i(h,wE[(C%12+12)%12]),_i(f,`an ${N}`)}function _(C){m=C,p.classList.toggle("is-paused",!C),g.textContent=C?"▶":"❚❚",_i(x,C?qg(C):"Pause"),p.setAttribute("aria-label",C?`Vitesse ${qg(C)} — toucher pour changer`:"En pause — toucher pour reprendre")}let M=Qe("h2.sheet-title",{id:"sheet-title"},""),E=Qe("div.sheet-body"),w=Qe("section.sheet",{role:"dialog","aria-labelledby":"sheet-title","aria-modal":"false"},Qe("div.sheet-grab",{"aria-hidden":"true"},Qe("span.sheet-grab-bar")),Qe("div.sheet-head",M,Qe("button.sheet-x",{type:"button","aria-label":"Fermer",onclick:()=>I()},"✕")),E),b=Qe("div.sheet-backdrop",{onclick:()=>I()});oo(t).append(b,w);let T=null;function R(C){let N=[...Ff,...Nf].find(W=>W.id===C);if(_i(M,N?N.title:C),oo(E),C==="demolish"){E.append(Qe("p.sheet-hint","Touchez un îlot de la carte pour le démolir (confirmation en deux temps). Bientôt disponible."));return}let z=!(Array.isArray(a)&&a.length);E.append(Qe("p.sheet-hint",C==="layers"?"Un seul calque à la fois, coloré sur la carte (bientôt).":`${z?"Catalogue de démonstration. ":""}Pose en deux temps : premier toucher = fantôme avec aperçu des effets, second toucher = confirmation (bientôt).`));let F=Qe("div.card-grid");for(let[W,V,Y]of PE(C,a))F.append(Qe("button.card",{type:"button",onclick:Q=>{o(6);for(let he of F.children)he.classList.toggle("is-selected",he===Q.currentTarget)}},Qe("span.card-swatch",{style:{"--sw":Y}}),Qe("span.card-body",Qe("span.card-title",W),Qe("span.card-price",V?`${Vl(V)} pièces`:"calque"))));E.append(F)}function P(){let C=t.classList.contains("is-open")?Math.round(w.getBoundingClientRect().height):0;document.documentElement.style.setProperty("--sheet-h",`${C}px`)}function D(C){T=C,R(C),t.classList.add("is-open"),document.body.classList.add("has-sheet");for(let N of e.children)N.classList.toggle("is-active",N.dataset.id===C);requestAnimationFrame(P),setTimeout(P,280)}function I(){if(T){T=null,t.classList.remove("is-open"),document.body.classList.remove("has-sheet");for(let C of e.children)C.classList.remove("is-active");P()}}oo(e);for(let C of[...Ff,...Nf]){let N=Nf.includes(C);e.append(Qe(`button.tab.tab--${C.id}${N?".tab--tool":""}`,{type:"button",dataset:{id:C.id},"aria-label":C.title,onclick:()=>{o(8),T===C.id?I():D(C.id),s?.(C.id,T===C.id)}},Qe("span.tab-ico",{"aria-hidden":"true"}),Qe("span.tab-label",C.label)))}return y({population:0,happiness:50,nature:50,money:0}),v({month:2,year:1}),_(1),{setGauges:y,setDate:v,setSpeed:_,openSheet:D,closeSheet:I,isSheetOpen:()=>!!T,get speed(){return m},insets:()=>({top:i.offsetHeight,bottom:e.offsetHeight})}}function jg(i,e){let t=new URLSearchParams(i||"").get("stats");return t==="1"||t==="true"?!0:t==="0"||t==="false"?!1:!!e}function IE({calls:i=0,triangles:e=0,frameMs:t=0,fps:n=0}){let s=e>=1e4?`${(e/1e3).toFixed(0)} k`:String(Math.round(e));return`${Math.round(i)} appels · ${s} tri
${t.toFixed(1)} ms · ${Math.round(n)} i/s`}function Kg(i,{visible:e=!1}={}){let t={calls:0,triangles:0,frameMs:0,fps:0},n=0,s=0,r=performance.now();function a(c){n+=1,s+=Number(c)||0}function o(c={}){let u=performance.now(),h=Math.max(1,u-r),f=n*1e3/h,d=Number.isFinite(c.frameMs)&&c.frameMs>0?c.frameMs:n?s/n:0;if(t={calls:c.calls||0,triangles:c.triangles||0,frameMs:d,fps:f},n=0,s=0,r=u,i&&i.classList.contains("is-visible")){let g=IE(t);i.textContent!==g&&(i.textContent=g)}return t}function l(c){i&&i.classList.toggle("is-visible",!!c)}return l(e),{frame:a,update:o,setVisible:l,snapshot:()=>({...t})}}function LE(i,e=0){let t=e===1?16:e===2?400:1;return Math.exp(-i*t*.0018)}function Yg(i,e={}){let t=e,n=(b,T)=>{let R=t[b];if(typeof R=="function")try{R(T)}catch(P){console.warn(`Geste ${b} :`,P)}},s=null,r=new Map,a=null,o=null,l=!1;function c(b){let T=i.getBoundingClientRect();return{x:b.clientX-T.left,y:b.clientY-T.top,clientX:b.clientX,clientY:b.clientY}}function u(b){try{i.setPointerCapture(b.pointerId)}catch{}}function h(){let b=r.get(a.a),T=r.get(a.b);return!b||!T?null:{cx:(b.x+T.x)/2,cy:(b.y+T.y)/2,d:Math.max(8,Math.hypot(b.x-T.x,b.y-T.y))}}function f(){let b=[...r.keys()].slice(-2);x(!0),o=null,a={a:b[0],b:b[1],d:1,cx:0,cy:0};let T=h();if(!T){a=null;return}Object.assign(a,T)}function d(){let b=h();if(!b)return;let T=b.d/a.d,R=b.cx-a.cx,P=b.cy-a.cy;Object.assign(a,b),!(Math.abs(T-1)<1e-6&&!R&&!P)&&n("onPinch",{factor:T,cx:b.cx,cy:b.cy,dx:R,dy:P})}function g(){a&&(a=null,n("onPinchEnd"))}function x(b){if(!s)return;let T=s;s=null,clearTimeout(T.timer),T.mode==="pan"&&n("onPanEnd",{vx:b?0:T.vx,vy:b?0:T.vy})}function m(b){if(l)return;if(b.pointerType==="touch"&&r.set(b.pointerId,c(b)),b.pointerType==="touch"&&r.size>=2){u(b),a||f();return}if(a||!b.isPrimary)return;if(b.pointerType==="mouse"&&b.button!==0){b.pointerType==="mouse"&&b.button===2&&n("onLongPress",c(b));return}let T=c(b);u(b),s={id:b.pointerId,touch:b.pointerType!=="mouse",x0:T.x,y0:T.y,lastX:T.x,lastY:T.y,lastT:performance.now(),vx:0,vy:0,mode:null,long:!1,timer:null},s.timer=setTimeout(()=>{!s||s.mode||(s.long=!0,n("onLongPress",{x:s.x0,y:s.y0,clientX:T.clientX,clientY:T.clientY}))},450)}function p(b){if(l)return;if(r.has(b.pointerId)&&r.set(b.pointerId,c(b)),a){(b.pointerId===a.a||b.pointerId===a.b)&&d();return}if(!s||b.pointerId!==s.id)return;let T=c(b),R=T.x-s.x0,P=T.y-s.y0,D=s.touch?10:4;if(!s.mode&&!s.long&&R*R+P*P>D*D&&(clearTimeout(s.timer),s.mode="pan",o=null,n("onPanStart",{x:s.x0,y:s.y0}),s.lastX=s.x0,s.lastY=s.y0),s.mode==="pan"){let I=performance.now(),C=T.x-s.lastX,N=T.y-s.lastY,z=Math.max(1,I-s.lastT);s.vx=.8*(C/z)+.2*s.vx,s.vy=.8*(N/z)+.2*s.vy,s.lastT=I,(C||N)&&n("onPan",{dx:C,dy:N,x:T.x,y:T.y})}s.lastX=T.x,s.lastY=T.y}function y(b,T=!1){if(l||(r.has(b.pointerId)&&(r.delete(b.pointerId),a&&(b.pointerId===a.a||b.pointerId===a.b)&&g()),!s||b.pointerId!==s.id))return;let R=s,P=c(b);if(s=null,clearTimeout(R.timer),T){R.mode==="pan"&&n("onPanEnd",{vx:0,vy:0});return}if(R.mode==="pan"){let C=performance.now()-R.lastT>80;n("onPanEnd",{vx:C?0:R.vx,vy:C?0:R.vy});return}if(R.long)return;let D=performance.now(),I={x:R.x0,y:R.y0,clientX:P.clientX,clientY:P.clientY,touch:R.touch};if(o&&D-o.t<=320&&Math.hypot(I.x-o.x,I.y-o.y)<=36){o=null,n("onDoubleTap",I);return}o={t:D,x:I.x,y:I.y},n("onTap",I)}function v(b){if(l||(b.preventDefault(),!b.deltaY&&!b.deltaX))return;let T=c(b);if(b.ctrlKey||!b.shiftKey)n("onPinch",{factor:LE(b.deltaY,b.deltaMode),cx:T.x,cy:T.y,dx:0,dy:0}),n("onPinchEnd");else{let R=b.deltaMode===1?16:b.deltaMode===2?400:1;n("onPan",{dx:-b.deltaY*R,dy:-b.deltaX*R,x:T.x,y:T.y})}}let _=b=>y(b,!0),M=b=>b.preventDefault(),E=b=>b.preventDefault();i.addEventListener("pointerdown",m),i.addEventListener("pointermove",p),i.addEventListener("pointerup",y),i.addEventListener("pointercancel",_),i.addEventListener("lostpointercapture",_),i.addEventListener("contextmenu",M),i.addEventListener("dblclick",E),i.addEventListener("wheel",v,{passive:!1});function w(){g(),x(!0),r.clear()}return{cancel:w,destroy(){w(),l=!0,i.removeEventListener("pointerdown",m),i.removeEventListener("pointermove",p),i.removeEventListener("pointerup",y),i.removeEventListener("pointercancel",_),i.removeEventListener("lostpointercapture",_),i.removeEventListener("contextmenu",M),i.removeEventListener("dblclick",E),i.removeEventListener("wheel",v)},get active(){return!!s||!!a}}}var DE=12345,Jg=12,Zg=16,NE=8,FE=30,OE=300,UE=500,kE=500,Zr={progress:i=>{try{window.__bootProgress?.(i)}catch{}},ok:()=>{try{window.__bootOk?.()}catch{}},fail:i=>{try{window.__bootFail?.(i)}catch{}console.error(i)}};function BE(i,e=DE){let t=new URLSearchParams(i||"").get("seed");if(t===null||t==="")return e;let n=Number(t);if(Number.isFinite(n))return Math.trunc(n);let s=2166136261;for(let r of String(t))s=Math.imul(s^r.charCodeAt(0),16777619);return s>>>0}function zE(i){let e=new URLSearchParams(i||""),t={},n=e.get("strategy");n&&["batched","instanced","auto"].includes(n)&&(t.strategy=n);let s=e.get("shadows");(s==="0"||s==="false")&&(t.shadows=!1);let r=Number(e.get("dpr"));return Number.isFinite(r)&&r>=1&&r<=3&&(t.pixelRatioMax=r),t}function GE(i,e,t){let n=i.tiles[t*i.cols+e];if(!n)return null;let s=yi[n.terrain]?.label||n.terrain,r=n.building,a=r?(vi[r.type]?.label||r.type)+(r.level>1?` (niveau ${r.level})`:""):null;return{terrain:s,building:a,native:!!n.native,text:`Case ${e},${t} : ${s}${a?` · ${a}`:""}`}}function $g(i){let e=0,t=0;for(let s of i.tiles){if(s.building){let r=vi[s.building.type];r&&(e+=Zs({...r,level:s.building.level}))}s.native&&yi[s.terrain]?.habitat&&(t+=1)}let n=Math.round(100*t/Math.max(1,i.tiles.length)*2.2);return{population:e,happiness:72,nature:Math.min(100,n),money:kE}}async function HE(){let i={};window.__tiletown={ready:!1};let e=0,t=null,n=()=>{e=performance.now()+OE},s=Rg(),r=ei("#scene"),a=ei("#stage");if(!r||!a)throw new Error("page incomplète : #scene introuvable");i.a11y=Vg(),i.toasts=Wg(ei("#toasts")),i.stats=Kg(ei("#stats"),{visible:jg(location.search,s)}),i.hud=Xg({hud:ei("#hud"),tabbar:ei("#tabbar"),sheetLayer:ei("#sheet-layer")},{catalog:Yl,vibrate:F=>i.a11y.vibrate(F),onSpeed:F=>{i.speed=F},onTab:()=>{h(),n()}}),i.speed=1,Zr.progress(.15);function o(){let F=window.visualViewport;return Math.round(F?F.height*(F.scale>1.01?F.scale:1):window.innerHeight)}let l=matchMedia("(pointer: coarse)").matches;function c(){let F=o(),W=window.innerWidth;document.documentElement.style.setProperty("--app-h",`${F}px`);let V=l&&W>F&&F<520;document.body.classList.toggle("is-rotated",V);let Y=window.visualViewport;Y&&(Y.offsetTop||Y.offsetLeft)&&Y.scale<=1.01&&window.scrollTo(0,0)}let u="";function h(){let{top:F,bottom:W}=i.hud.insets(),V=`${F},${W}`;V!==u&&(u=V,document.documentElement.style.setProperty("--inset-top",`${F}px`),document.documentElement.style.setProperty("--inset-bottom",`${W}px`),typeof i.renderer?.setInsets=="function"&&i.renderer.setInsets({top:F,bottom:W,left:0,right:0}))}let f="";function d(){if(!i.renderer)return;let F=a.getBoundingClientRect(),W=Math.max(1,Math.round(F.width)),V=Math.max(1,Math.round(F.height)),Y=window.devicePixelRatio||1,Q=`${W}x${V}@${Y}`;Q!==f&&(f=Q,i.renderer.resize(W,V,Y),n()),h()}c(),window.addEventListener("resize",()=>{c(),d()}),window.visualViewport?.addEventListener("resize",()=>{c(),d()}),window.addEventListener("orientationchange",()=>setTimeout(()=>{c(),d()},150)),new ResizeObserver(()=>d()).observe(a),new ResizeObserver(()=>h()).observe(ei("#hud")),new ResizeObserver(()=>h()).observe(ei("#tabbar")),(function F(){let W=matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`),V=()=>{W.removeEventListener?.("change",V),f="",d(),F()};W.addEventListener?.("change",V)})();let g=BE(location.search),x=ea($l({seed:g,cols:Jg,rows:Zg,map:"valley",starterTown:!0})),m=uu(x,g),p=1,y=0;i.world=x,i.hud.setGauges($g(x)),i.hud.setDate({month:2,year:1}),Zr.progress(.3);let v=await Eg(r,{manifestUrl:Ag("assets/models/manifest.json"),pixelRatioMax:2,...zE(location.search)});i.renderer=v,Zr.progress(.8),v.setWorld(x),v.setActors(m),f="",d(),Zr.progress(.92);function _(){let{top:F,bottom:W}=i.hud.insets();v.camera.fitAll({insets:{top:F,bottom:W,left:0,right:0}}),w="all"}function M(){let{top:F,bottom:W}=i.hud.insets(),V=Ql(x);v.camera.lookAt(V.x,V.y,NE,{insets:{top:F,bottom:W,left:0,right:0}}),w="home"}function E(){w==="home"?_():M()}let w="home";function b(F,W){let V=v.pick(F.clientX,F.clientY);if(!V){i.toasts.show({key:"tile",text:"Hors de la vallée",duration:1500});return}let Y=GE(x,V.x,V.y);Y&&(W&&i.a11y.vibrate(20),i.toasts.show({key:"tile",kind:"info",title:W?Y.building||Y.terrain:void 0,text:W?`Case ${V.x},${V.y}${Y.native?" · nature d’origine":""}`:Y.text,duration:W?3500:2200}))}i.gestures=Yg(r,{onTap:F=>b(F,!1),onLongPress:F=>b(F,!0),onDoubleTap:()=>{E(),t=null,i.a11y.vibrate(8),n()},onPanStart:()=>{t=null,n()},onPan:({dx:F,dy:W})=>{v.camera.pan(F,W),n()},onPanEnd:({vx:F,vy:W})=>{!i.a11y.reducedMotion()&&Math.hypot(F,W)>.05&&(t={vx:F,vy:W}),n()},onPinch:({factor:F,cx:W,cy:V,dx:Y,dy:Q})=>{t=null,F&&F!==1&&v.camera.zoomAt(F,W,V),(Y||Q)&&v.camera.pan(Y,Q),n()},onPinchEnd:()=>n()});let T=0,R=!1,P=performance.now(),D=P;function I(F){if(!R)return;T=requestAnimationFrame(I);let W=F-P;if(t){let fe=Math.min(40,W);v.camera.pan(t.vx*fe,t.vy*fe);let Ge=Math.pow(.94,fe/16);t.vx*=Ge,t.vy*=Ge,Math.hypot(t.vx,t.vy)<.02&&(t=null),n()}if(!(i.gestures.active||F<e)&&W<1e3/FE-1)return;P=F;let Y=Math.min(.1,W/1e3),Q=performance.now();p>0&&pd(m,x,Y*p),y=performance.now()-Q;let he=performance.now();v.render(Y),i.stats.frame(performance.now()-he),F-D>=UE&&(D=F,i.stats.update(v.stats()))}function C(){R||(R=!0,P=performance.now(),T=requestAnimationFrame(I))}function N(){R=!1,cancelAnimationFrame(T)}document.addEventListener("visibilitychange",()=>document.hidden?N():C()),r.addEventListener("webglcontextlost",F=>{F.preventDefault(),N(),i.toasts.show({key:"gl",kind:"warn",text:"Affichage interrompu par le système… reprise automatique."})}),r.addEventListener("webglcontextrestored",()=>{try{v.setWorld(x),f="",d()}catch(F){console.warn("Restauration du contexte :",F)}C(),i.toasts.show({key:"gl",kind:"success",text:"Affichage rétabli."})});{let F=new URLSearchParams(location.search),W=Number(F.get("zoom"));if(F.get("view")==="all")_();else if(Number.isFinite(W)&&W>0){let{top:V,bottom:Y}=i.hud.insets(),Q=Ql(x);v.camera.lookAt(Q.x,Q.y,W,{insets:{top:V,bottom:Y,left:0,right:0}})}else M()}v.render(0),i.stats.update(v.stats()),C(),Fg(),Og(()=>{i.toasts.show({key:"update",kind:"info",title:"Nouvelle version disponible",text:"Rechargez pour en profiter.",actionLabel:"Recharger",onClick:()=>Ug(),duration:1e4})}),kg(()=>i.toasts.show({key:"offline",kind:"success",text:"Tiletown est prêt à jouer hors ligne."})),window.__tiletown={ready:!0,seed:g,world:x,renderer:v,hud:i.hud,toasts:i.toasts,stats:()=>({...i.stats.snapshot(),...v.stats(),updateMs:y+(v.stats().layersUpdateMs||0)}),get actors(){return m},regenerate(F){return x=ea($l({seed:F,cols:Jg,rows:Zg,map:"valley",starterTown:!0})),i.world=x,window.__tiletown.world=x,m=uu(x,F),v.setWorld(x),v.setActors(m),M(),i.hud.setGauges($g(x)),n(),x}},Zr.ok(),document.body.classList.remove("is-loading");let z=ei("#loading");z&&(z.classList.add("is-done"),setTimeout(()=>z.remove(),600))}HE().catch(i=>Zr.fail(i));export{GE as describeTile,$g as initialGauges,zE as renderOptionsFromSearch,BE as seedFromSearch};
//# sourceMappingURL=game.b46cb1a597.js.map
