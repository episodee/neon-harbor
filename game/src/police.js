import {starsForHeat} from './simulation.js';
import {distance} from './rng.js';
export function createPolice(){return{heat:0,calm:0,best:0,stars:0,crime(amount=22){this.heat=Math.min(100,this.heat+amount);this.calm=0;this.best=Math.max(this.best,starsForHeat(this.heat));},update(dt,player,hidden){this.calm=hidden&&Math.hypot(player.vx,player.vz)<3?this.calm+dt:0;if(this.calm>4)this.heat=Math.max(0,this.heat-dt*5);this.stars=starsForHeat(this.heat);},caught(player,cops){return cops.some(c=>distance(player,c)<3.1)&&player.health<24;}};}
