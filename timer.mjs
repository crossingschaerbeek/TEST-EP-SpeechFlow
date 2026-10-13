export function elapsed(run, now=Date.now()){return run ? run.elapsedMs+(run.startedAt===null?0:Math.max(0,now-run.startedAt)):0;}
export function remaining(run,now=Date.now()){return run?run.allowedMs-elapsed(run,now):0;}
export function phase(run,now=Date.now()){if(!run)return 'idle';const r=remaining(run,now);return r<0?'over':r<=5000?'pulse':r<=10000?'red':'normal';}
export function format(ms){const seconds=Math.ceil(Math.abs(ms)/1000);return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;}
