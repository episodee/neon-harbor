// Pure simulation. X east, Z south, heading zero faces +Z.
import {mulberry32,clamp,angleDelta} from './rng.js';
export const ROAD=42,LIMIT=148;
export function generateCity(seed=1){
 const random=mulberry32(seed),buildings=[],roads=[],parking=[],pedestrians=[];
 for(let n=-3;n<=3;n++)roads.push(n*ROAD);
 for(let bx=-3;bx<3;bx++)for(let bz=-3;bz<3;bz++)for(let ix=0;ix<2;ix++)for(let iz=0;iz<2;iz++){
  const x=bx*ROAD+13+ix*16,z=bz*ROAD+13+iz*16;
  buildings.push({x,z,w:11+random()*2,d:11+random()*2,h:6+random()*22+(bz<-1?random()*22:0),color:Math.floor(random()*6),sign:Math.floor(random()*8)});
 }
 for(let i=0;i<24;i++){const axis=i%2,road=roads[1+Math.floor(random()*5)],along=-113+random()*226;parking.push({x:axis?along:road+6,z:axis?road+6:along,heading:axis?Math.PI/2:0});}
 parking.unshift({x:0,z:-11,heading:0});
 for(let i=0;i<28;i++)pedestrians.push({x:roads[Math.floor(random()*roads.length)]+(i%2?9:-9),z:-120+random()*240,dir:i%2?1:-1,speed:.7+random()*.7,fear:0,health:100});
 return{buildings,roads,parking,pedestrians,seed};
}
export class SpatialGrid{
 constructor(buildings,size=20){this.size=size;this.cells=new Map();for(const b of buildings)for(let x=Math.floor((b.x-b.w/2)/size);x<=Math.floor((b.x+b.w/2)/size);x++)for(let z=Math.floor((b.z-b.d/2)/size);z<=Math.floor((b.z+b.d/2)/size);z++){const key=x+','+z;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(b);}}
 near(x,z,r=3){const all=new Set();for(let a=Math.floor((x-r)/this.size);a<=Math.floor((x+r)/this.size);a++)for(let b=Math.floor((z-r)/this.size);b<=Math.floor((z+r)/this.size);b++)for(const o of this.cells.get(a+','+b)||[])all.add(o);return [...all];}
}
export function resolveCircle(body,buildings,radius){let hit=false;for(const b of buildings){const nx=clamp(body.x,b.x-b.w/2,b.x+b.w/2),nz=clamp(body.z,b.z-b.d/2,b.z+b.d/2),dx=body.x-nx,dz=body.z-nz,len=Math.hypot(dx,dz);if(len<radius){hit=true;if(len>.001){body.x+=dx/len*(radius-len);body.z+=dz/len*(radius-len);}else body.x=b.x+(body.x>b.x?1:-1)*(b.w/2+radius);}}body.x=clamp(body.x,-LIMIT,LIMIT);body.z=clamp(body.z,-LIMIT,LIMIT);return hit;}
export function carState(x,z,heading=0,type='sedan',role='parked',color=0){return{x,z,heading,type,role,color,vx:0,vz:0,speed:0,health:100,steer:0,turn:0,cooldown:0};}
export function stepCar(car,input,dt){
 const f={x:Math.sin(car.heading),z:Math.cos(car.heading)},l={x:f.z,z:-f.x};
 let longitudinal=car.vx*f.x+car.vz*f.z,lateral=car.vx*l.x+car.vz*l.z;
 longitudinal+=input.throttle*(input.boost?24:16)*dt;longitudinal*=Math.exp(-(input.brake?3.8:.24)*dt);longitudinal=clamp(longitudinal,-11,(car.type==='sports'?42:31)*(input.boost?1.2:1));
 lateral*=Math.exp(-(input.brake?1.2:9)*dt);car.heading+=input.steer*clamp(longitudinal/12,-1,1)*dt*(input.brake?2.1:1.45);
 car.vx=Math.sin(car.heading)*longitudinal+Math.cos(car.heading)*lateral;car.vz=Math.cos(car.heading)*longitudinal-Math.sin(car.heading)*lateral;
 car.x+=car.vx*dt;car.z+=car.vz*dt;car.speed=longitudinal;car.steer=input.steer;
}
export function starsForHeat(heat){return clamp(Math.ceil(heat/20),0,5);}
export function safeApproachSpeed(gap,decel=8){return Math.sqrt(Math.max(0,2*decel*gap));}
export function steeringToward(car,x,z){return clamp(angleDelta(car.heading,Math.atan2(x-car.x,z-car.z))*1.5,-1,1);}
