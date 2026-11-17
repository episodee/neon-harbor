import {distance} from './rng.js';
export const JOBS=[
 {title:'First Fare',chapter:'01 / THE WELCOME',text:'Borrow a car and bring Mara’s package to the marina gate.',target:{x:112,z:-55},reward:650,time:0,kind:'drive'},
 {title:'Late Delivery',chapter:'02 / NO QUESTIONS',text:'Take the hot parcel across town before the signal dies.',target:{x:-105,z:84},reward:1100,time:75,kind:'timed'},
 {title:'Lose the Tail',chapter:'03 / OPEN WATER',text:'A patrol saw the handoff. Lose the heat, then reach the pier.',target:{x:139,z:-3},reward:1650,time:0,kind:'chase'},
 {title:'The Ledger',chapter:'04 / HIGH TIDE',text:'Clear the warehouse crew and escape with the harbor ledger.',target:{x:104,z:76},reward:3200,time:0,kind:'heist'}
];
export function createMissions(){return{index:0,active:false,complete:0,remaining:0,kills:0,justComplete:false,get current(){return JOBS[Math.min(this.index,JOBS.length-1)];},start(){if(this.index>=JOBS.length)this.index=0;this.active=true;this.remaining=this.current.time;this.kills=0;},update(dt,player,heat){if(!this.active)return null;const job=this.current;if(this.remaining>0){this.remaining=Math.max(0,this.remaining-dt);if(!this.remaining)return{failed:true};}if(job.kind==='chase'&&heat>0)return null;if(job.kind==='heist'&&this.kills<3)return null;if(distance(player,job.target)<8){this.active=false;this.complete++;this.index++;this.justComplete=true;return{complete:true,reward:job.reward,job};}return null;}};}
