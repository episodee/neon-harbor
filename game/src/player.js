import * as THREE from 'three';
import {person} from './models.js';
import {resolveCircle,ROAD,LIMIT} from './simulation.js';
export function createPlayer(scene){const mesh=person('#c48c5d',true);scene.add(mesh);return{x:0,z:-17,heading:0,vx:0,vz:0,health:100,cash:1250,ammo:12,reserve:72,mesh,car:null,grounded:true,jump:0,shootCooldown:0,hit:false};}
export function stepPlayer(p,intent,dt,world){
 if(p.car){p.car.input={throttle:intent.forward-intent.back,steer:intent.right-intent.left,brake:intent.brake,boost:intent.sprint};p.mesh.visible=false;p.x=p.car.x;p.z=p.car.z;p.vx=p.car.vx;p.vz=p.car.vz;return;}
 const forward={x:Math.sin(p.heading),z:Math.cos(p.heading)},right={x:Math.cos(p.heading),z:-Math.sin(p.heading)};
 const accel=intent.sprint?24:14;p.vx+=(forward.x*(intent.forward-intent.back)+right.x*(intent.right-intent.left))*accel*dt;p.vz+=(forward.z*(intent.forward-intent.back)+right.z*(intent.right-intent.left))*accel*dt;
 const speed=intent.sprint?7:4.4,mag=Math.hypot(p.vx,p.vz);if(mag>speed){p.vx*=speed/mag;p.vz*=speed/mag;}const drag=Math.exp(-(intent.forward||intent.back||intent.left||intent.right?2:8)*dt);p.vx*=drag;p.vz*=drag;
 const ox=p.x,oz=p.z;p.x+=p.vx*dt;p.z+=p.vz*dt;resolveCircle(p,world.buildings,.55);p.x=Math.max(-LIMIT,Math.min(LIMIT,p.x));p.z=Math.max(-LIMIT,Math.min(LIMIT,p.z));if(p.x!==ox||p.z!==oz){if(Math.abs(p.vx)+Math.abs(p.vz)>.1)p.heading=Math.atan2(p.vx,p.vz);}
 if(intent.jump&&p.grounded){p.jump=5;p.grounded=false;p.landed=false;}if(!p.grounded){p.jump-=18*dt;if(p.jump<=0){p.jump=0;p.grounded=true;p.landed=true;}}
 p.mesh.position.set(p.x,p.jump,p.z);p.mesh.rotation.y=p.heading;p.mesh.userData.limbs.forEach((l,i)=>l.rotation.x=Math.sin(performance.now()*.012+i*Math.PI)*Math.min(.5,mag*.15));p.shootCooldown=Math.max(0,p.shootCooldown-dt);
}
export function spawnPlayer(p,x,z){p.x=x;p.z=z;p.vx=0;p.vz=0;p.health=100;p.car=null;p.mesh.visible=true;p.mesh.position.set(x,0,z);p.mesh.rotation.y=p.heading;}
