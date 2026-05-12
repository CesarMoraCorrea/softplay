import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, PenLine } from "lucide-react";

export function MiniCalendar({ value, onChange }) {
  const [vm, setVm] = useState(new Date());
  const today = new Date(); today.setHours(0,0,0,0);
  const days = useMemo(() => {
    const y=vm.getFullYear(),m=vm.getMonth();
    const first=new Date(y,m,1).getDay(),last=new Date(y,m+1,0).getDate();
    const prev=new Date(y,m,0).getDate(),cells=[];
    for(let i=first-1;i>=0;i--) cells.push({d:new Date(y,m-1,prev-i),cur:false});
    for(let i=1;i<=last;i++) cells.push({d:new Date(y,m,i),cur:true});
    while(cells.length<42) cells.push({d:new Date(y,m+1,cells.length-first-last+1),cur:false});
    return cells;
  },[vm]);
  const sel=value?value.split("T")[0]:null;
  const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 dark:border-white/10 select-none transition-all">
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={()=>setVm(new Date(vm.getFullYear(),vm.getMonth()-1))} className="p-2 rounded-xl bg-gray-50/50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-600 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
        </button>
        <span className="text-sm font-bold text-gray-800 dark:text-white capitalize tracking-wide">
          {vm.toLocaleDateString("es-AR",{month:"long",year:"numeric"})}
        </span>
        <button onClick={()=>setVm(new Date(vm.getFullYear(),vm.getMonth()+1))} className="p-2 rounded-xl bg-gray-50/50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-600 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["D","L","M","M","J","V","S"].map((d,i)=><div key={i} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 py-1">{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell,i)=>{
          const past=cell.d<today,iso=fmt(cell.d),isSel=sel===iso,isToday=cell.d.getTime()===today.getTime();
          return (
            <button key={i} disabled={past||!cell.cur} onClick={()=>onChange(iso)}
              className={`relative aspect-square flex items-center justify-center rounded-xl text-xs font-semibold transition-all duration-300 ${
                past||!cell.cur
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                  : isSel
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : isToday
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-105"
              }`}>
              {cell.d.getDate()}
              {isToday && !isSel && <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Stepper({ current, steps }) {
  return (
    <div className="flex items-center w-full mb-10 px-2">
      {steps.map((s,i)=>(
        <div key={i} className="flex items-center flex-1 last:flex-none relative">
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
              i<current
                ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-green-500/20"
                : i===current
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20 scale-110"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
            }`}>
              {i<current?"✓":i+1}
            </div>
            <span className={`absolute top-12 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap transition-colors duration-300 ${
              i<=current ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"
            }`}>
              {s}
            </span>
          </div>
          {i<steps.length-1 && (
            <div className="flex-1 h-1 mx-3 rounded-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full w-full bg-gradient-to-r from-emerald-400 to-green-500 transition-transform duration-700 ease-in-out origin-left ${
                i<current ? "scale-x-100" : "scale-x-0"
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SelectionChip({ icon, label, onEdit }) {
  return (
    <button onClick={onEdit} className="group relative flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:-translate-y-0.5">
      {icon && <span className="opacity-80 group-hover:text-blue-500 transition-colors">{icon}</span>}
      <span>{label}</span>
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100/80 dark:bg-gray-700/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
        <PenLine className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
      </span>
    </button>
  );
}
