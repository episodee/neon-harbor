import * as THREE from 'three';
import {carMesh,box,material} from './models.js';
import {carState,stepCar,resolveCircle,steeringToward,ROAD} from './simulation.js';
import {mulberry32} from './rng.js';
const COLORS=['#e6a25f','#62b7a9','#d9574f','#6b8793','#e6dfc6','#263945','#a8799b'];
export function createVehicles(scene,city,seed){const rand=mulberry32(seed+9),all=[],marks=new THREE.Group();scene.add(marks);
 const make=(s,type,color,police=false)=>{const mesh=carMesh(type,color,police);scene.add(mesh);const c={...s,mesh,police,player:false,life:0};all.push(c);return c;};
 for(const p of city.parking)make(carState(p.x,p.z,p.heading,['sedan','taxi','pickup','sports','van'][Math.floor(rand()*5)],'parked',Math.floor(rand()*COLORS.length)),['sedan','taxi','pickup','sports','van'][Math.floor(rand()*5)],COLORS[Math.floor(rand()*COLORS.length)]);
 for(let i=0;i<18;i++){const axis=i%2,r=city.roads[1+Math.floor(rand()*5)],along=-125+rand()*250,type=['sedan','taxi','pickup','sports','van'][i%5],heading=axis?Math.PI/2:0,c=make(carState(axis?along:r,axis?r:along,heading,type,'traffic',i%COLORS.length),type,COLORS[i%COLORS.length]);c.lane=axis?r:Math.round(along/ROAD)*ROAD;c.forward=rand()>.5?1:-1;c.speed=5+rand()*5;c.mesh.rotation.y=heading;}
 const shadows=new THREE.Group();scene.add(shadows);
 function sync(c){c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.heading;c.mesh.visible=c.health>0;if(c.police&&c.mesh.userData.lights){for(const [i,l] of c.mesh.userData.lights.entries())l.material.emissiveIntensity=(Math.sin(performance.now()*.018+(i?Math.PI:0))>0)?2.8:.12;}}
 function update(dt,playerCar,player,heat,time){
  const cops=all.filter(c=>c.police&&c.health>0),wanted=Math.ceil(heat/20);while(cops.length<wanted){const a=time*1.73+cops.length*2.4;const x=player.x+Math.cos(a)*42,z=player.z+Math.sin(a)*42;const c=make(carState(x,z,Math.atan2(player.x-x,player.z-z),'sedan','police'), 'sedan','#eeeedd',true);c.speed=13;cops.push(c);}
  while(cops.length>wanted){const c=cops.pop();c.role='retiring';}
  for(const c of all){if(c.health<=0)continue;c.life+=dt;
   if(c.role==='traffic'){const axis=Math.abs(Math.sin(c.heading))>.6,sign=c.forward;const next=all.find(o=>o!==c&&o.role==='traffic'&&o.health>0&&Math.abs((axis?o.x-c.x:o.z-c.z)*sign)>0&&Math.abs((axis?o.z-c.z:o.x-c.x))<2.2&&Math.abs((axis?o.x-c.x:o.z-c.z)*sign)<11);const nearPlayer=!playerCar&&Math.hypot(c.x-player.x,c.z-player.z)<8;c.speed=nearPlayer?0:next?Math.max(0,Math.min(8,(Math.hypot(next.x-c.x,next.z-c.z)-4)*1.2)):8;if(axis)c.x+=sign*c.speed*dt;else c.z+=sign*c.speed*dt;if(c.x>142||c.x<-142||c.z>142||c.z<-142){if(Math.abs(c.x)>142)c.x=-c.x*.92;if(Math.abs(c.z)>142)c.z=-c.z*.92;}if(c.life>4&&rand()<dt*.035){const turn=rand()>.5?1:-1;c.heading+=turn*Math.PI/2;c.forward=1;c.life=0;}c.mesh.rotation.y=c.heading;}
   if(c.police){if(c.role==='retiring'){c.health=0;c.mesh.visible=false;continue;}const aim=steeringToward(c,player.x+player.vx*.7,player.z+player.vz*.7);c.heading+=aim*dt*1.15;const speed=Math.min(27,Math.hypot(player.vx,player.vz)+8);c.vx=Math.sin(c.heading)*speed;c.vz=Math.cos(c.heading)*speed;c.x+=c.vx*dt;c.z+=c.vz*dt;c.speed=speed;if(Math.hypot(c.x-player.x,c.z-player.z)<3.8&&c.cooldown<=0){c.cooldown=1.7;player.health-=7;player.hit=true;player.vx-=c.vx*.22;player.vz-=c.vz*.22;}}
   if(c===playerCar){c.cooldown=Math.max(0,c.cooldown-dt);const oldx=c.x,oldz=c.z;stepCar(c,c.input||{throttle:0,steer:0,brake:false},dt);if(resolveCircle(c,city.buildings,1.55)){const impact=Math.hypot(c.x-oldx,c.z-oldz)/dt;if(impact>2){c.health-=impact*.3;player.health-=impact*.13;player.hit=true;c.vx*=.5;c.vz*=.5;}}if(Math.hypot(c.x-oldx,c.z-oldz)>3&&c.cooldown<=0){c.cooldown=.16;c.skid=true;}}
   if(c.role==='parked'){}sync(c);
  }
  // Traffic cars preserve a breathing gap and react to the player on foot.
  const moving=all.filter(c=>c.role==='traffic'&&c.health>0);for(const c of moving)for(const other of moving)if(c!==other&&Math.hypot(c.x-other.x,c.z-other.z)<7)c.speed=Math.max(3,c.speed-5*dt);
  for(let i=0;i<city.pedestrians.length;i++){const p=city.pedestrians[i],d=Math.hypot(p.x-player.x,p.z-player.z);p.fear=d<12?1:Math.max(0,p.fear-dt);p.z+=p.dir*p.speed*(p.fear?2.2:1)*dt;if(p.z>145)p.z=-145;else if(p.z<-145)p.z=145;}
 }
 function enter(player){let best=null,bd=8;for(const c of all){if(c.role!=='parked'&&c.role!=='traffic')continue;const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<bd){best=c;bd=d;}}return best;}
 function setPlayerCar(c){c.role='player';c.player=true;c.input={throttle:0,steer:0,brake:false,boost:false};}
 function addPolice(x,z){return make(carState(x,z,0,'sedan','police'),'sedan','#eeeedd',true);}
 return{all,update,enter,setPlayerCar,addPolice,sync,get police(){return all.filter(x=>x.police&&x.health>0)},get traffic(){return all.filter(x=>x.role==='traffic'&&x.health>0)}};
}
