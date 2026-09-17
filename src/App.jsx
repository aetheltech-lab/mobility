import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, AlertTriangle, CheckCircle2, Calendar, Phone, BatteryCharging, Clock, ArrowRight } from 'lucide-react';
import { db } from './firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const assetId = queryParams.get('asset') || 'EB-01'; 

  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculatePrice = () => {
    if (!returnDate) return 0;
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 0) return 10; 
    if (diffDays >= 30) return 250; 
    return diffDays * 10; 
  };

  const calculatedRevenue = calculatePrice();

  useEffect(() => {
    const assetRef = doc(db, 'mobility_fleet', assetId);
    const unsubscribe = onSnapshot(assetRef, (docSnap) => {
      if (docSnap.exists()) setAssetData(docSnap.data());
      else setAssetData(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetId]);

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerContact.trim() || !returnDate || !acceptedTerms) return;
    setIsProcessing(true);

    try {
      const assetRef = doc(db, 'mobility_fleet', assetId);
      // ⚡ Set to PAYMENT_PENDING. Do not deploy yet. Do not add to final revenue yet.
      await updateDoc(assetRef, {
        status: 'PAYMENT_PENDING',
        rider: customerName.trim(),
        contact: customerContact.trim(),
        returnDate: returnDate,
        pendingRevenue: calculatedRevenue
      });
    } catch (error) {
      console.error("[CLOUD_FRACTURE] Failed to lock asset:", error);
      alert("Network error. Please try again or contact T-Force Security.");
    } finally {
      setIsProcessing(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  if (loading) return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-500 font-sans">
        <Zap className="animate-pulse text-green-500 mb-4" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest">Querying Cloud Registry...</p>
      </div>
  );

  if (!assetData) return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h1 className="text-white font-black uppercase tracking-widest mb-2">Asset Not Found</h1>
        <p className="text-zinc-500 text-sm">Asset {assetId} is not registered in the database.</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-green-500/30">
      
      <div className="p-6 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500 tracking-[0.2em] uppercase">Aetheltech</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">Mobility Division</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <ShieldCheck className="text-green-400" size={20} />
          </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Scanned Asset</p>
              <h2 className="text-3xl font-black tracking-wider text-white">{assetId}</h2>
            </div>
            <div className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
              assetData.status === 'STANDBY' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
              assetData.status === 'DEPLOYED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
              assetData.status === 'PAYMENT_PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' :
              'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {assetData.status.replace('_', ' ')}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center shrink-0">
                  <BatteryCharging className="text-green-400" size={20} />
              </div>
              <div>
                  <h4 className="text-[12px] font-bold text-white uppercase tracking-wider mb-0.5">Dual-Battery Kit Included</h4>
                  <p className="text-[10px] text-zinc-400 leading-snug">Includes 2x Smart Batteries, keys, and fast charger.</p>
              </div>
          </div>
        </div>

        {/* CONDITIONAL UI ROUTING BASED ON ASSET STATUS */}
        {assetData.status === 'STANDBY' ? (
          <form onSubmit={handleInitiatePayment} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Rider Full Name</label>
                  <input 
                    type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Match Passport/ID..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-green-500 transition-all" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">WhatsApp / Phone</label>
                  <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input 
                        type="tel" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)}
                        placeholder="+30..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[13px] text-white outline-none focus:border-green-500 transition-all" required
                      />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Return Date</label>
                  <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input 
                        type="date" min={minDateString} value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[13px] text-white outline-none focus:border-green-500 transition-all [color-scheme:dark]" required
                      />
                  </div>
                </div>
            </div>

            {returnDate && (
                <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total Rental Fee:</span>
                    <span className="text-xl font-black text-green-400">€{calculatedRevenue}</span>
                </div>
            )}

            <label className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
              <input 
                type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-green-500 focus:ring-green-500 bg-black/50" required
              />
              <span className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                I agree to the <span className="text-green-400">Terms of Service</span>. I accept full liability for Asset {assetId} and the dual-battery kit during this period.
              </span>
            </label>

            <button 
              type="submit" disabled={isProcessing || !acceptedTerms || !customerName.trim() || !returnDate}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Locking Asset...' : 'Proceed to Payment'}
            </button>
          </form>

        ) : assetData.status === 'PAYMENT_PENDING' ? (
          
          <div className="space-y-6 animate-in zoom-in-95">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <Clock className="text-amber-400 mx-auto mb-4 animate-bounce" size={48} />
                <h3 className="text-xl font-black text-amber-400 uppercase tracking-widest mb-2">Awaiting Payment</h3>
                <p className="text-zinc-400 text-sm mb-4">Please transfer <strong className="text-white text-lg">€{assetData.pendingRevenue}</strong> via Revolut to complete your rental.</p>
                
                {/* ⚡ DIRECT REVOLUT LINK */}
                <a 
                    href={`https://revolut.me/aetheltech/${assetData.pendingRevenue}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0075EB] hover:bg-[#005BBA] text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg transition-colors"
                >
                    Pay with Revolut <ArrowRight size={16} />
                </a>
              </div>
              <div className="text-center">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Once paid, T-Force Security will remotely deploy your asset.</p>
              </div>
          </div>

        ) : assetData.status === 'DEPLOYED' ? (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 text-center animate-in zoom-in-95">
            <CheckCircle2 className="text-blue-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-black text-blue-400 uppercase tracking-widest mb-2">Asset Active</h3>
            <p className="text-zinc-400 text-[12px] leading-relaxed">Deployed to <strong className="text-white">{assetData.rider}</strong> until <strong className="text-white">{new Date(assetData.returnDate).toLocaleDateString()}</strong>.</p>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center animate-in zoom-in-95">
            <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-black text-red-400 uppercase tracking-widest mb-2">Maintenance</h3>
            <p className="text-zinc-400 text-sm">Asset is grounded for service.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;