const fs = require('fs');
const path = 'c:\\Users\\moham\\Downloads\\Blacklist-main\\Blacklist-main\\src\\pages\\distribution\\Distribution.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = 'className="text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest shadow-sm shadow-orange-500/10"';
const replacement = 'onClick={() => { setSelectedLog(log); setIsPayloadModalOpen(true); }} className="text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest shadow-sm shadow-orange-500/10"';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully replaced button content');
} else {
    console.log('Target string not found');
}
