const input = document.getElementById('display-input');
const sci = document.getElementById('scientific');
const historyList = document.getElementById('history-list');
const errorBox = document.getElementById('error-box');
let history = JSON.parse(sessionStorage.getItem('history') || "[]");
updateHistory();

const savedTheme = localStorage.getItem('theme');
if (savedTheme) setTheme(savedTheme);

function clearAll(){ input.value=""; errorBox.textContent=""; input.focus(); }
function backspace(){ input.value=input.value.slice(0,-1); input.focus(); }
function append(v){
  const pos = input.selectionStart; // current cursor
  const before = input.value.substring(0,pos);
  const after = input.value.substring(pos);
  input.value = before + v + after;
  const newPos = pos + v.length; // move cursor after inserted text
  input.setSelectionRange(newPos,newPos);
  input.focus();
}

function insertFunc(f){
  const pos = input.selectionStart;
  const before = input.value.substring(0,pos);
  const after = input.value.substring(pos);
  input.value = before + f + "()" + after;
  const newPos = before.length + f.length + 1; // inside the parentheses
  input.setSelectionRange(newPos,newPos);
  input.focus();
}


function setCaretToEnd(){
  const len = input.value.length;
  input.setSelectionRange(len,len);
}

function factorial(){
  try{
    let n=eval(toJS(input.value));
    if(n<0)throw "Invalid";
    let r=1;for(let i=1;i<=n;i++)r*=i;
    addHistory(input.value+"!",r);input.value=r;
  }catch{showError("Грешка");input.value="";}
  input.focus();
}

function toJS(e){
  return e.replace(/÷/g,'/').replace(/×/g,'*')
  .replace(/π/g,'Math.PI').replace(/e/g,'Math.E')
  .replace(/√/g,'Math.sqrt')
  .replace(/sin\(/g,'Math.sin(Math.PI/180*')
  .replace(/cos\(/g,'Math.cos(Math.PI/180*')
  .replace(/tan\(/g,'Math.tan(Math.PI/180*')
  .replace(/log\(/g,'Math.log10(')
  .replace(/ln\(/g,'Math.log(');
}

function calculate(){
  try{
    let res = eval(toJS(input.value));
    if(!isFinite(res) || isNaN(res)) throw "Err";
    res = Math.round(res * 1e10) / 1e10; // <-- round result
    addHistory(input.value, res);
    input.value = res;
    errorBox.textContent = "";
  } catch {
    showError("Невалидно изчисление");
    input.value = "";
  }
  input.focus();
}


function toggleScientific(){ sci.style.display=sci.style.display==="none"?"grid":"none"; }

function addHistory(exp,res){
  history.unshift(`${exp} = ${res}`);
  if(history.length>20)history.pop();
  sessionStorage.setItem('history',JSON.stringify(history));
  updateHistory();
}

function updateHistory(){
  historyList.innerHTML=history.map(h=>`<div onclick="loadFromHistory('${h.replace(/'/g,"\\'")}')">${h}</div>`).join('');
}

function clearHistory(){
  history=[];sessionStorage.removeItem('history');updateHistory();
}

function loadFromHistory(h){ input.value=h.split('=')[0].trim(); input.focus(); }

function setTheme(t){
  const r=document.documentElement, th={
    light:["#f0f0f0","#000","#e0e0e0","#1976d2"],
    dark:["#121212","#fff","#333","#ff9800"],
    blue:["#e3f2fd","#0d47a1","#bbdefb","#1976d2"],
    green:["#e8f5e9","#1b5e20","#c8e6c9","#388e3c"]
  }[t];
  ["--bg","--text","--btn","--accent"].forEach((v,i)=>r.style.setProperty(v,th[i]));
  localStorage.setItem('theme',t);
}

function showError(m){errorBox.textContent=m;setTimeout(()=>errorBox.textContent="",3000);}
input.addEventListener('keydown',e=>{if(e.key==='Enter')calculate();});
input.focus();