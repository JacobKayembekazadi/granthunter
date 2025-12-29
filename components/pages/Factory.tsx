'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, CheckCircle, Clock, Plus, Trash2, RotateCw,
  Settings, X, Save, Layers, ChevronRight, Download, Search,
  HelpCircle, Sparkles, ArrowRight, Play, Pause
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_OPPORTUNITIES } from '@/lib/data/mock';

interface JobLog {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface Job {
  id: string;
  name: string;
  type: string;
  stage: string;
  progress: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  eta: string;
  priority: 'High' | 'Normal' | 'Low';
  opportunityId?: string;
  logs: JobLog[];
  configuration: {
    model: string;
    creativity: 'Standard' | 'Creative' | 'Conservative';
    depth: 'Standard' | 'Deep' | 'Exhaustive';
  };
}

const INITIAL_JOBS: Job[] = [
  {
    id: 'PRJ-1024',
    name: 'Cybersecurity RFP Response',
    type: 'Technical Proposal',
    stage: 'Writing Section 3',
    progress: 45,
    status: 'processing',
    eta: '12 min',
    priority: 'High',
    opportunityId: '1',
    logs: [
      { timestamp: '09:00:01', message: 'Started proposal generation', type: 'info' },
      { timestamp: '09:00:05', message: 'Loaded RFP requirements', type: 'success' },
      { timestamp: '09:05:22', message: 'Analyzing evaluation criteria', type: 'info' }
    ],
    configuration: { model: 'GPT-4 / Gemini Pro', creativity: 'Standard', depth: 'Deep' }
  }
];

const Factory: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);

  const [formData, setFormData] = useState<Partial<Job>>({
    name: '',
    type: 'Technical Proposal',
    priority: 'Normal',
    status: 'queued',
    progress: 0,
    opportunityId: '',
    configuration: { model: 'Gemini-3-Pro', creativity: 'Standard', depth: 'Standard' }
  });

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.status === 'processing' && job.progress < 100) {
            const increment = Math.random() * 2.5;
            const newProgress = Math.min(100, job.progress + increment);

            let newLogs = [...job.logs];
            if (Math.random() > 0.8) {
              const messages = [
                'Writing executive summary...',
                'Adding past performance references...',
                'Checking compliance requirements...',
                'Formatting technical approach...',
                'Reviewing for clarity...'
              ];
              newLogs.push({
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                message: messages[Math.floor(Math.random() * messages.length)],
                type: 'info'
              });
            }

            if (newProgress >= 100) {
              toast.success(`Proposal Complete: ${job.name}`);
              return { ...job, progress: 100, status: 'completed', stage: 'Ready for Review', eta: '-', logs: newLogs };
            }

            return {
              ...job,
              progress: newProgress,
              logs: newLogs,
              stage: newProgress > 90 ? 'Final Review' : newProgress > 30 ? 'Writing Content' : 'Planning'
            };
          }
          return job;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData(job);
    } else {
      setEditingJob(null);
      setFormData({
        name: '',
        type: 'Technical Proposal',
        priority: 'Normal',
        status: 'queued',
        progress: 0,
        opportunityId: MOCK_OPPORTUNITIES[0]?.id,
        configuration: { model: 'Gemini-3-Pro', creativity: 'Standard', depth: 'Standard' }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Please enter a project name");
      return;
    }

    if (editingJob) {
      setJobs(prev => prev.map(j => {
        if (j.id === editingJob.id) {
          return {
            ...j,
            name: formData.name ?? j.name,
            type: formData.type ?? j.type,
            priority: formData.priority ?? j.priority,
            configuration: formData.configuration ?? j.configuration,
          };
        }
        return j;
      }));
      toast.success("Project updated successfully");
    } else {
      const newJob: Job = {
        id: `PRJ-${Math.floor(Math.random() * 9000) + 1000}`,
        name: formData.name ?? '',
        type: formData.type ?? 'Technical Proposal',
        stage: 'Planning',
        progress: 0,
        status: 'processing',
        eta: '~15 min',
        priority: formData.priority ?? 'Normal',
        opportunityId: formData.opportunityId,
        logs: [{ timestamp: new Date().toLocaleTimeString([], { hour12: false }), message: 'Started proposal generation', type: 'info' }],
        configuration: formData.configuration ?? { model: 'Gemini-3-Pro', creativity: 'Standard', depth: 'Standard' },
      };
      setJobs(prev => [newJob, ...prev]);
      toast.success("AI is now generating your proposal!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (selectedJobId === id) setSelectedJobId(null);
    toast.success("Project deleted");
  };

  const filteredJobs = jobs.filter(j => j.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full flex flex-col gap-6 pb-12 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Proposal Center</h2>
              <p className="text-slate-400 text-sm max-w-2xl">
                <strong className="text-white">AI-powered proposal generation.</strong> Create winning government
                contract proposals automatically. Just select an opportunity and let AI write compliant,
                professional proposals based on your company's past performance and capabilities.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {showHelp && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">1</div>
              <div>
                <h4 className="text-white font-semibold text-sm">Start a Project</h4>
                <p className="text-slate-500 text-xs mt-1">Click "New Proposal" and select an opportunity you want to respond to.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">2</div>
              <div>
                <h4 className="text-white font-semibold text-sm">AI Writes Your Proposal</h4>
                <p className="text-slate-500 text-xs mt-1">AI analyzes the RFP and generates compliant content tailored to your company.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">3</div>
              <div>
                <h4 className="text-white font-semibold text-sm">Review & Submit</h4>
                <p className="text-slate-500 text-xs mt-1">Download your completed proposal, review it, and submit to SAM.gov.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {!selectedJobId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={RotateCw} label="In Progress" value={jobs.filter(j => j.status === 'processing').length.toString()} color="blue" />
          <StatCard icon={Clock} label="Queued" value={jobs.filter(j => j.status === 'queued').length.toString()} color="amber" />
          <StatCard icon={CheckCircle} label="Completed" value={jobs.filter(j => j.status === 'completed').length.toString()} color="emerald" />
          <StatCard icon={FileText} label="Total Projects" value={jobs.length.toString()} color="purple" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Project List */}
        <div className={`${selectedJobId ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col gap-4 transition-all duration-500`}>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Your Proposals</h3>
                <p className="text-xs text-slate-500 mt-1">Click a project to see progress and details</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-blue-500 outline-none w-40"
                  />
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Proposal
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {filteredJobs.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-white font-semibold mb-2">No proposals yet</h4>
                  <p className="text-slate-500 text-sm mb-6">Create your first AI-generated proposal to get started.</p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Create Your First Proposal
                  </button>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-5 rounded-xl cursor-pointer transition-all
                      ${selectedJobId === job.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${selectedJobId === job.id ? 'bg-white/20' : 'bg-slate-900'}`}>
                          {job.status === 'processing' ? (
                            <RotateCw className={`w-5 h-5 ${selectedJobId === job.id ? 'text-white' : 'text-purple-400'} animate-spin`} />
                          ) : job.status === 'completed' ? (
                            <CheckCircle className={`w-5 h-5 ${selectedJobId === job.id ? 'text-white' : 'text-green-400'}`} />
                          ) : (
                            <Clock className={`w-5 h-5 ${selectedJobId === job.id ? 'text-white' : 'text-slate-400'}`} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {job.name}
                            {job.priority === 'High' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedJobId === job.id ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-400'}`}>
                                High Priority
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-1 ${selectedJobId === job.id ? 'text-white/70' : 'text-slate-500'}`}>
                            {Math.round(job.progress)}% complete • {job.type}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${selectedJobId === job.id ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4 h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${selectedJobId === job.id ? 'bg-white' : 'bg-purple-500'}`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Project Details Panel */}
        {selectedJob && (
          <div className="lg:col-span-7 animate-in slide-in-from-right-5 duration-300">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-600">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedJob.name}</h2>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      {selectedJob.status === 'processing' && (
                        <>
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                          AI is writing your proposal...
                        </>
                      )}
                      {selectedJob.status === 'completed' && (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Proposal ready for download
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedJobId(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-white">Progress</span>
                    <span className="text-sm text-purple-400 font-bold">{Math.round(selectedJob.progress)}%</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${selectedJob.progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">Current: {selectedJob.stage}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailBox label="Type" value={selectedJob.type} />
                  <DetailBox label="Priority" value={selectedJob.priority} />
                  <DetailBox label="Status" value={selectedJob.status === 'processing' ? 'In Progress' : selectedJob.status === 'completed' ? 'Complete' : 'Queued'} />
                  <DetailBox label="ETA" value={selectedJob.eta} />
                </div>

                {/* Activity Log */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Activity Log</h4>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 h-48 overflow-auto space-y-2">
                    {selectedJob.logs.map((log, i) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <span className="text-slate-600 font-mono">{log.timestamp}</span>
                        <span className={log.type === 'success' ? 'text-green-400' : 'text-slate-400'}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  {selectedJob.status === 'completed' ? (
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold">
                      <Download className="w-4 h-4" />
                      Download Proposal
                    </button>
                  ) : (
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold">
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedJob.id)}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{editingJob ? 'Edit Project' : 'New Proposal Project'}</h3>
                <p className="text-slate-500 text-sm mt-1">AI will generate a proposal based on your inputs</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., DoD Cybersecurity Response"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Proposal Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option>Technical Proposal</option>
                    <option>Price Proposal</option>
                    <option>Past Performance</option>
                    <option>Full Proposal Package</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold"
              >
                {editingJob ? 'Save Changes' : 'Start AI Generation'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: string; color: 'blue' | 'amber' | 'emerald' | 'purple' }> = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  };
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
};

const DetailBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
    <div className="text-[10px] text-slate-500 uppercase mb-1">{label}</div>
    <div className="text-sm font-semibold text-white">{value}</div>
  </div>
);

export default Factory;