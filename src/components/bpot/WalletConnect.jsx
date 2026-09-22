import React, {useEffect, useState} from 'react';
import {ArrowRight, ShieldCheck, Loader2, Check, Bitcoin} from 'lucide-react';

export const WALLETS = [
  {id:'phantom', name:'Phantom', chain:'Bitcoin · Solana', color:'#ab9ff2', glyph:'P', detect:()=>!!(window.phantom?.bitcoin||window.phantom?.solana), site:'https://phantom.app/download'},
  {id:'metamask', name:'MetaMask', chain:'EVM · wrapped BTC', color:'#f6851b', glyph:'M', detect:()=>!!(window.ethereum?.isMetaMask), site:'https://metamask.io/download/'},
  {id:'xverse', name:'Xverse', chain:'Bitcoin · Ordinals', color:'#ee7a30', glyph:'X', detect:()=>!!(window.XverseProviders?.BitcoinProvider||window.BitcoinProvider), site:'https://www.xverse.app/download'},
  {id:'unisat', name:'UniSat', chain:'Bitcoin · BRC-20', color:'#f7931a', glyph:'U', detect:()=>!!window.unisat, site:'https://unisat.io/download'},
  {id:'leather', name:'Leather', chain:'Bitcoin · Stacks', color:'#d9b48a', glyph:'L', detect:()=>!!window.LeatherProvider, site:'https://leather.io/install-extension'},
  {id:'okx', name:'OKX Wallet', chain:'Bitcoin · multi-chain', color:'#c9cbd3', glyph:'O', detect:()=>!!(window.okxwallet?.bitcoin||window.okxwallet), site:'https://www.okx.com/web3'},
];

function shorten(a){return a && a.length>12 ? `${a.slice(0,6)}…${a.slice(-4)}` : a;}

async function request(wallet){
  if(wallet.id==='phantom' && window.phantom?.bitcoin){const accounts=await window.phantom.bitcoin.requestAccounts();return accounts?.[0]?.address;}
  if(wallet.id==='phantom' && window.phantom?.solana){const r=await window.phantom.solana.connect();return r?.publicKey?.toString();}
  if(wallet.id==='metamask' && window.ethereum){const a=await window.ethereum.request({method:'eth_requestAccounts'});return a?.[0];}
  if(wallet.id==='unisat' && window.unisat){const a=await window.unisat.requestAccounts();return a?.[0];}
  if(wallet.id==='leather' && window.LeatherProvider){const r=await window.LeatherProvider.request('getAddresses');return r?.result?.addresses?.[0]?.address;}
  if(wallet.id==='okx' && window.okxwallet?.bitcoin){const r=await window.okxwallet.bitcoin.connect();return r?.address;}
  if(wallet.id==='xverse'){const p=window.XverseProviders?.BitcoinProvider||window.BitcoinProvider;if(p?.request){const r=await p.request('getAccounts',{purposes:['payment']});return r?.result?.[0]?.address;}}
  return null;
}

export default function WalletConnect({game, close}) {
  const [installed, setInstalled] = useState({});
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');

  useEffect(()=>{
    const scan=()=>{const map={};WALLETS.forEach(w=>{try{map[w.id]=!!w.detect();}catch{map[w.id]=false;}});setInstalled(map);};
    scan(); const t=setTimeout(scan,700); return ()=>clearTimeout(t);
  },[]);

  async function pick(wallet){
    setError(''); setPending(wallet.id);
    try{
      const address = await request(wallet);
      game.connect(wallet.name, address || null);
      close();
    }catch(e){
      setPending(null);
      setError(e?.message?.includes('reject') ? `${wallet.name} connection was cancelled.` : `Couldn’t reach ${wallet.name}. You can continue in demo mode below.`);
    }
  }

  return <>
    <p className="modal-description">Pick your wallet to take a seat. Bitcoin, Ordinals and EVM wallets are all welcome.</p>
    <div className="wallet-list">
      {WALLETS.map(w=>{
        const isPending = pending===w.id;
        return <button key={w.id} className={`wallet-option${isPending?' is-pending':''}`} disabled={!!pending} onClick={()=>pick(w)}>
          <span className="wallet-mark" style={{'--wallet-color': w.color}}>{w.glyph}</span>
          <span className="wallet-meta"><strong>{w.name}</strong><small>{w.chain}</small></span>
          {installed[w.id] && <span className="wallet-chip">Detected</span>}
          {isPending ? <Loader2 size={16} className="wallet-spin"/> : <ArrowRight size={15} className="wallet-arrow"/>}
        </button>;
      })}
    </div>
    {error && <p className="wallet-error">{error}</p>}
    <button className="ghost-wallet-button" disabled={!!pending} onClick={()=>{game.connect('Demo wallet');close();}}>
      <Bitcoin size={15}/>Continue with the demo wallet · 0.1000 BTC credits
    </button>
    <div className="modal-note"><ShieldCheck size={15}/><span>Bpot never asks for a seed phrase and cannot move your funds. Connecting only shares your public address — all play is still demo credits.</span></div>
  </>;
}

export {shorten};
