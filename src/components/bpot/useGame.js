import { useState, useEffect, useRef } from 'react';
import { PLAYERS, FLIPS, randomNumber, readStorage } from './data';

export function useGame() {
  const [connected, setConnected] = useState(() => readStorage('bpot-connected', false) === true);
  const [balance, setBalance] = useState(() => { const n = readStorage('bpot-balance', 0.1); return typeof n === 'number' && n >= 0 && Number.isFinite(n) ? n : 0.1; });
  const [history, setHistory] = useState(() => { const h = readStorage('bpot-history', []); return Array.isArray(h) ? h.slice(0, 30) : []; });
  const [players, setPlayers] = useState(PLAYERS);
  const [seconds, setSeconds] = useState(48);
  const [round, setRound] = useState(24819);
  const [roundState, setRoundState] = useState('open');
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [flips, setFlips] = useState(FLIPS);
  const [activeFlip, setActiveFlip] = useState(null);
  const [wallet, setWallet] = useState(() => readStorage('bpot-wallet', ''));
  const [address, setAddress] = useState(() => readStorage('bpot-address', ''));
  const [toast, setToast] = useState(null);
  const [sound, setSound] = useState(false);
  const timers = useRef([]);
  const toastTimer = useRef(null);
  const flipLock = useRef(false);
  const current = useRef({players, round, sound});
  current.current = {players, round, sound};
  const total = players.reduce((sum, p) => sum + p.amount, 0);
  const myBet = players.find(p => p.id === 'you')?.amount || 0;

  useEffect(() => { localStorage.setItem('bpot-connected', JSON.stringify(connected)); }, [connected]);
  useEffect(() => { localStorage.setItem('bpot-balance', JSON.stringify(balance)); }, [balance]);
  useEffect(() => { localStorage.setItem('bpot-history', JSON.stringify(history)); }, [history]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); clearTimeout(toastTimer.current); }, []);

  function notify(message, type = 'success') { setToast({message, type}); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 4000); }
  function tone(win = true) {
    if (!current.current.sound) return;
    try { const AudioCtx = window.AudioContext || window.webkitAudioContext; const ctx = new AudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.setValueAtTime(win ? 660 : 220, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(win ? 990 : 150, ctx.currentTime + 0.18); gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4); osc.start(); osc.stop(ctx.currentTime + 0.4); osc.onended = () => ctx.close(); } catch {}
  }
  function addHistory(item) { setHistory(h => [{...item, time: new Date().toISOString()}, ...h].slice(0, 30)); }
  function connect(name = 'Demo wallet', addr = null) { setConnected(true); setWallet(name); setAddress(addr || ''); localStorage.setItem('bpot-wallet', JSON.stringify(name)); localStorage.setItem('bpot-address', JSON.stringify(addr || '')); notify(addr ? `${name} connected · ${addr.slice(0,6)}…${addr.slice(-4)}` : `${name} connected. Your Bitcoin playground is ready.`); }
  function disconnect() { setConnected(false); setWallet(''); setAddress(''); localStorage.setItem('bpot-wallet', JSON.stringify('')); localStorage.setItem('bpot-address', JSON.stringify('')); notify('Wallet disconnected.', 'info'); }
  function validate(amount) {
    if (!connected) { notify('Connect a demo wallet to start playing.', 'error'); return false; }
    if (!Number.isFinite(amount) || amount < 0.0001) { notify('Enter at least 0.0001 BTC.', 'error'); return false; }
    if (amount > balance + 1e-10) { notify('Your demo balance is too low for this wager.', 'error'); return false; }
    return true;
  }
  function joinPot(amount) {
    if (roundState !== 'open') return notify('This round is spinning. The next round opens shortly.', 'error');
    if (!validate(amount)) return false;
    setBalance(b => Math.max(0, b - amount));
    setPlayers(p => p.some(x => x.id === 'you') ? p.map(x => x.id === 'you' ? {...x, amount: x.amount + amount} : x) : [...p, {id:'you', name:'You', initials:'Y', color:'#f8b43c', amount, level:1}]);
    notify('You’re in! Your tickets have been added to the pot.'); tone(); return true;
  }
  useEffect(() => {
    if (roundState !== 'open') return;
    const interval = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [roundState]);
  useEffect(() => {
    if (seconds !== 0 || roundState !== 'open') return;
    setRoundState('spinning');
    const snapshot = current.current.players;
    const pot = snapshot.reduce((sum, p) => sum + p.amount, 0);
    const ticket = randomNumber() * pot;
    let cursor = 0;
    const selected = snapshot.find(p => { cursor += p.amount; return ticket < cursor; }) || snapshot[snapshot.length - 1];
    let before = 0;
    for (const p of snapshot) { if (p.id === selected.id) break; before += p.amount; }
    const centerAngle = (before + selected.amount / 2) / pot * 360;
    setRotation(r => Math.ceil(r / 360) * 360 + 1800 + 360 - centerAngle);
    timers.current.push(setTimeout(() => {
      setWinner({...selected, pot}); setRoundState('result'); tone(selected.id === 'you');
      const user = snapshot.find(p => p.id === 'you');
      if (user) {
        const won = selected.id === 'you';
        if (won) setBalance(b => b + pot);
        addHistory({id:current.current.round, game:'Jackpot', amount:user.amount, payout:won ? pot : 0, won});
        notify(won ? `You won ${pot.toFixed(4)} BTC in demo credits!` : `${selected.name} won this round. A new pot opens shortly.`, won ? 'success' : 'info');
      }
    }, 5100));
    timers.current.push(setTimeout(() => { setPlayers(PLAYERS); setRound(r => r + 1); setSeconds(48); setWinner(null); setRoundState('open'); }, 11000));
  }, [seconds, roundState]);

  function playFlip(amount, side, opponent, existingId) {
    if (flipLock.current) return notify('Finish your current coinflip first.', 'error');
    if (!validate(amount)) return false;
    flipLock.current = true;
    setBalance(b => Math.max(0, b - amount));
    if (existingId) setFlips(f => f.filter(x => x.id !== existingId));
    const id = existingId || Date.now();
    setActiveFlip({id, amount, side, opponent:opponent || 'satoshi', phase:'matching'});
    timers.current.push(setTimeout(() => setActiveFlip(f => f ? {...f, phase:'flipping'} : f), 1500));
    timers.current.push(setTimeout(() => {
      const result = randomNumber() < 0.5 ? 'heads' : 'tails';
      const won = side === result;
      if (won) setBalance(b => b + amount * 2);
      setActiveFlip(f => f ? {...f, phase:'result', result, won} : f);
      addHistory({id, game:'Coinflip', amount, payout:won ? amount * 2 : 0, won}); tone(won); flipLock.current = false;
    }, 4600));
    return true;
  }
  function fund() { if (!connected) connect(); setBalance(b => b + 0.1); notify('0.1000 demo BTC added to your wallet.'); }
  return {connected, wallet, address, disconnect, balance, history, players, seconds, round, roundState, winner, rotation, total, myBet, flips, activeFlip, setActiveFlip, toast, setToast, sound, setSound, notify, connect, joinPot, playFlip, fund, setBalance};
}
