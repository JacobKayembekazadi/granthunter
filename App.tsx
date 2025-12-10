import React, { useState } from 'react';
import { runAudit } from './services/auditService';
import AuditResults from './components/AuditResults';
import { AuditItem } from './types';
import { BrainCircuitIcon, FilterIcon, ZapIcon, AlertCircleIcon } from './components/Icons';

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    try {
      const data = await runAudit(input);
      setResults(data);
    } catch (err) {
      setError("Audit protocol failed. Ensure API access is configured and try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setInput(`Solicitation: 47QFNA24R0001 - FADGI Compliant Digitization Services for NARA
Solicitation: W912DR24B0004 - Repair and Replace Duct Bank at Fort Meade
Solicitation: 75N95024Q00035 - NHLBI Cloud Computing and Bioinformatics Support
Solicitation: FA4600-24-Q-0005 - 55th Wing Paving and Concrete Repair
Solicitation: HE1254-24-R-2001 - Enterprise Data Modernization and ETL Pipeline for DoDEA
Solicitation: N40085-24-R-2500 - Security Guard Services for Naval Station Norfolk
Solicitation: 123456-24-R-0001 - Advanced AI Transcription and Analysis for Legal Depositions`);
  };

  return (
    <div className="min-h-screen bg-sloe-black font-sans selection:bg-sloe-accent selection:text-sloe-black">
      {/* Header */}
      <header className="border-b border-sloe-border bg-sloe-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sloe-accent rounded flex items-center justify-center text-sloe-black shadow-[0_0_15px_rgba(0,255,157,0.3)]">
              <BrainCircuitIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                THE SLOE <span className="text-sloe-accent">AUDIT PROTOCOL</span>
              </h1>
              <p className="text-[10px] font-mono text-sloe-muted uppercase tracking-[0.2em] mt-1">
                GovCon Intelligence Filter v2.5
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-mono text-sloe-accent bg-sloe-accent/10 px-3 py-1 rounded-full border border-sloe-accent/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sloe-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sloe-accent"></span>
              </span>
              SYSTEM ONLINE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-sloe-panel border border-sloe-border rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-mono font-bold uppercase text-sloe-muted flex items-center gap-2">
                  <FilterIcon className="w-4 h-4" />
                  Input Data Stream
                </h2>
                <button 
                  onClick={loadExample}
                  className="text-xs text-sloe-focus hover:text-white transition-colors underline decoration-dotted"
                >
                  Load Example Data
                </button>
              </div>
              
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste government contract titles/dates here..."
                  className="w-full h-96 bg-sloe-dark border border-sloe-border rounded-lg p-4 font-mono text-sm text-sloe-text focus:outline-none focus:ring-1 focus:ring-sloe-accent focus:border-sloe-accent resize-none placeholder:text-sloe-border"
                />
                <div className="absolute bottom-4 right-4 text-xs text-sloe-border font-mono pointer-events-none">
                  {input.length} chars
                </div>
              </div>

              <button
                onClick={handleAudit}
                disabled={loading || !input.trim()}
                className={`w-full mt-4 py-4 px-6 rounded-lg font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
                  loading 
                    ? 'bg-sloe-border cursor-not-allowed text-sloe-muted'
                    : 'bg-sloe-accent text-sloe-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Running Protocol...</span>
                  </>
                ) : (
                  <>
                    <ZapIcon className="w-5 h-5 fill-current" />
                    <span>Run Audit</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-lg bg-sloe-accent/5 border border-sloe-accent/10">
              <h3 className="text-sloe-accent text-xs font-bold uppercase tracking-wider mb-2">Protocol Parameters</h3>
              <ul className="space-y-2 text-xs text-sloe-muted">
                <li className="flex items-start gap-2">
                  <span className="text-sloe-accent">•</span>
                  Filters out Construction & Hardware noise.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sloe-accent">•</span>
                  Identifies AI, Data, & Software opportunities.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sloe-accent">•</span>
                  Generates custom AI winning strategies.
                </li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-sloe-accent">⚡</span> 
              The Sloe Audit Results
            </h2>
            
            {error && (
              <div className="bg-sloe-trash/10 border border-sloe-trash/30 text-sloe-trash p-4 rounded-lg mb-6 flex items-center gap-3">
                <AlertCircleIcon className="w-5 h-5" />
                {error}
              </div>
            )}

            {!loading && results.length === 0 && !error && (
              <div className="h-96 flex flex-col items-center justify-center text-sloe-border border-2 border-dashed border-sloe-border rounded-xl bg-sloe-panel/50">
                <BrainCircuitIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-mono text-sm uppercase tracking-widest opacity-50">Awaiting Input Stream</p>
              </div>
            )}

            <AuditResults items={results} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;