export function mulberry32(seed=1){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
