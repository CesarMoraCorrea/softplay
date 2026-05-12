import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={()=>setVm(new Date(vm.getFullYear(),vm.getMonth()-1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft className="w-4 h-4"/></button>
        <span className="text-sm font-bold text-gray-800 dark:text-white capitalize">{vm.toLocaleDateString("es-AR",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setVm(new Date(vm.getFullYear(),vm.getMonth()+1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight className="w-4 h-4"/></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["D","L","M","M","J","V","S"].map((d,i)=><div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((cell,i)=>{
          const past=cell.d<today,iso=fmt(cell.d),isSel=sel===iso,isToday=cell.d.getTime()===today.getTime();
          return <button key={i} disabled={past||!cell.cur} onClick={()=>onChange(iso)}
            className={`aspect-square rounded-lg text-xs font-medium transition-all ${
              past||!cell.cur?"text-gray-300 dark:text-gray-600 cursor-not-allowed":
              isSel?"bg-blue-600 text-white shadow font-bold":
              isToday?"border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold":
              "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30"
            }`}>{cell.d.getDate()}</button>;
        })}
      </div>
    </div>
  );
}

export function Stepper({ current, steps }) {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((s,i)=>(
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i<current?"bg-green-500 text-white":i===current?"bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900":"bg-gray-200 dark:bg-gray-700 text-gray-400"
            }`}>
              {i<current?"✓":i+1}
            </div>
            <span className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${i===current?"text-blue-600 dark:text-blue-400":"text-gray-400"}`}>{s}</span>
          </div>
          {i<steps.length-1&&<div className={`flex-1 h-0.5 mx-2 transition-all ${i<current?"bg-green-500":"bg-gray-200 dark:bg-gray-700"}`}/>}
        </div>
      ))}
    </div>
  );
}

export function SelectionChip({ icon, label, onEdit }) {
  return (
    <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
      {icon && <span>{icon}</span>}{label}<span className="text-blue-400 ml-0.5">✏</span>
    </button>
  );
}
