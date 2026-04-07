const fs = require('fs');
const path = 'c:\\Users\\moham\\Downloads\\Blacklist-main\\Blacklist-main\\src\\pages\\distribution\\Distribution.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Live Activity sidebar tag
const activityTarget = "p className=\"text-[9px] font-medium text-slate-500 uppercase tracking-tight\">{d.eventType === 'MANUAL_TEST' ? 'Manual Test' : 'Auto Distribution'}</p>";
const activityReplacement = "p className={`text-[9px] font-black uppercase tracking-tight ${d.eventType === 'MANUAL_TEST' ? 'text-amber-500' : 'text-blue-500'}`}>{d.eventType === 'MANUAL_TEST' ? 'Test Signal' : 'Live Data'}</p>";

// 2. Update History table badge
const historyTarget = "span className=\"px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500\">\r\n                                     {log.eventType}\r\n                                  </span>";
// Since whitespace varies, I'll use a regex for this one in the actual replace call, or just use simpler string matches.

if (content.includes(activityTarget)) {
    content = content.replace(activityTarget, activityReplacement);
}

// History table badge (simpler match)
const historyInner = "{log.eventType}";
const historyNew = "{log.eventType}"; 
// Wait, I will use a more robust regex-like replacement for the whole span.
content = content.replace(/<span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-\[9px\] font-black uppercase tracking-widest text-slate-500">\s*\{log.eventType\}\s*<\/span>/g, 
    '<span className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest ${log.eventType === "MANUAL_TEST" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-indigo-50 border-indigo-100 text-indigo-600"}`}>{log.eventType}</span>');

fs.writeFileSync(path, content);
console.log('Successfully updated event colors');
