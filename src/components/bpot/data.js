export const PLAYERS = [
  { id: 'satoshi', name: 'satoshi', initials: 'S', color: '#b5a0ed', amount: 0.0084, level: 42 },
  { id: 'blockboy', name: 'blockboy', initials: 'B', color: '#edaa65', amount: 0.0062, level: 28 },
  { id: 'orange', name: 'orange.pill', initials: 'O', color: '#8ebbd4', amount: 0.0048, level: 36 },
  { id: 'hodl', name: 'HODLgang', initials: 'H', color: '#acd59d', amount: 0.0036, level: 19 },
  { id: 'ghost', name: 'ghost.btc', initials: 'G', color: '#e58d9e', amount: 0.002, level: 24 },
];
export const FLIPS = [
  { id: 84217, name: 'pixelwhale', initials: 'P', color: '#b5a0ed', level: 32, amount: 0.005, side: 'heads' },
  { id: 84216, name: 'blockboy', initials: 'B', color: '#edaa65', level: 28, amount: 0.0025, side: 'tails' },
  { id: 84215, name: 'satoshi', initials: 'S', color: '#8ebbd4', level: 42, amount: 0.01, side: 'heads' },
  { id: 84214, name: 'degen101', initials: 'D', color: '#acd59d', level: 17, amount: 0.001, side: 'tails' },
];
export const MESSAGES = [
  {name:'satoshi',color:'#b5a0ed',level:42,text:'gm bitcoin people',time:'12:41'},
  {name:'orange.pill',color:'#edaa65',level:36,text:'that last pot was actually crazy',time:'12:42'},
  {name:'pixelwhale',color:'#8ebbd4',level:32,text:'5% chance and a dream',time:'12:42'},
  {name:'HODLgang',color:'#acd59d',level:19,text:'ggs to the winner',time:'12:43'},
  {name:'blockboy',color:'#edaa65',level:28,text:'anyone up for a flip?',time:'12:43'},
  {name:'ghost.btc',color:'#e58d9e',level:24,text:'orange is the new gold',time:'12:44'},
  {name:'satoshi',color:'#b5a0ed',level:42,text:'next pot looking good',time:'12:44'},
];
export const BTC_USD = 97420;
export const fmt = (value, places = 4) => Number(value).toFixed(places);
export const usd = (value) => (value * BTC_USD).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
export function randomNumber() { return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; }
export function readStorage(key, fallback) { try { const item = JSON.parse(localStorage.getItem(key)); return item ?? fallback; } catch { return fallback; } }
