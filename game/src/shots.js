export function parseShot(){const u=new URL(location.href),name=u.searchParams.get('shot');const seed=Number.parseInt(u.searchParams.get('seed')||'1',10);return{name,seed:Number.isFinite(seed)?seed:1};}
export function stageShot(name,game){
 const p=game.player,c=game.vehicles.all.find(x=>x.type==='sports'&&x.role==='parked')||game.vehicles.all[0];
 game.missions.active=true;game.missions.index=name==='3-mission'?1:0;game.missions.remaining=54;
 if(name==='2-street'){
  p.x=4;p.z=0;p.heading=Math.PI/2;p.car=null;p.mesh.visible=true;p.mesh.position.set(p.x,0,p.z);
 }else{
  game.vehicles.setPlayerCar(c);p.car=c;c.x=0;c.z=18;c.heading=Math.PI;c.speed=22;c.vx=0;c.vz=-22;p.x=c.x;p.z=c.z;p.vx=0;p.vz=-22;p.heading=c.heading;p.mesh.visible=false;
 }
 if(name==='1-cover'||name==='4-chase'){
  game.police.heat=name==='4-chase'?84:63;game.police.stars=name==='4-chase'?5:4;
  const count=name==='4-chase'?2:2;
  for(let i=0;i<count;i++){
   const cop=game.vehicles.addPolice(i===0?-3.3:3.3,34+i*4);cop.speed=24;cop.vx=0;cop.vz=-24;cop.heading=Math.PI;cop.mesh.position.set(cop.x,0,cop.z);cop.mesh.rotation.y=cop.heading;
  }
 }
 if(name==='2-street'||name==='3-mission')game.vehicles.all.filter(x=>x.role==='traffic').forEach((v,i)=>{v.x=-13+(i%6)*5;v.z=-22+Math.floor(i/6)*13;v.heading=0;});
 if(name==='3-mission'){game.missions.index=1;game.missions.remaining=48;}
 if(name==='4-chase'){game.scene.background.set('#dc8259');game.scene.fog.color.set('#d88967');game.sun.color.set('#ffbe7c');game.sun.position.set(-20,25,-15);game.camera.far=350;game.scene.fog.far=240;}
 for(const v of game.vehicles.all)game.vehicles.sync(v);
 const target=name==='2-street'?p:c;
 game.shotCamera={target,name};
 if(name==='2-street'){game.camera.position.set(target.x-13,7,target.z-14);game.camera.lookAt(target.x+9,1,target.z);}else{game.camera.position.set(0,14,c.z+30);game.camera.lookAt(0,1.1,c.z+(name==='3-mission'?-3:7));game.camera.fov=67;game.camera.updateProjectionMatrix();}
}
