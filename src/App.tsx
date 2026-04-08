import React, { useState, useEffect } from 'react';
import { Stakeholder, Relationship, PowerBase, SessionData } from './types';
import { SurveyForm } from './components/SurveyForm';
import { NetworkGraph } from './components/NetworkGraph';
import { StakeholderDetail } from './components/StakeholderDetail';
import { Network, Share2, Download, Settings } from 'lucide-react';

const TABS: { key: PowerBase | 'overview'; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'legitimate', label: 'Legitimate' },
  { key: 'reward', label: 'Reward' },
  { key: 'coercive', label: 'Coercive' },
  { key: 'expert', label: 'Expert' },
  { key: 'referent', label: 'Referent' },
  { key: 'information', label: 'Information' },
];

export default function App() {
  const [sessionName, setSessionName] = useState('New Project Engagement');
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  
  const [activeTab, setActiveTab] = useState<PowerBase | 'overview'>('overview');
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stakeholder-map-data');
    if (saved) {
      try {
        const data: SessionData = JSON.parse(saved);
        setSessionName(data.projectName || 'New Project Engagement');
        setStakeholders(data.stakeholders || []);
        setRelationships(data.relationships || []);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    const data: SessionData = { projectName: sessionName, stakeholders, relationships };
    localStorage.setItem('stakeholder-map-data', JSON.stringify(data));
  }, [sessionName, stakeholders, relationships]);

  const handleAddStakeholder = (s: Stakeholder) => {
    setStakeholders(prev => [...prev, s]);
  };

  const handleAddRelationship = (r: Relationship) => {
    setRelationships(prev => [...prev, r]);
  };

  const handleDeleteStakeholder = (id: string) => {
    if (window.confirm('Are you sure you want to delete this stakeholder? This will also delete all their relationships.')) {
      setStakeholders(prev => prev.filter(s => s.id !== id));
      setRelationships(prev => prev.filter(r => r.sourceId !== id && r.targetId !== id));
      if (selectedStakeholder?.id === id) {
        setSelectedStakeholder(null);
      }
    }
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setStakeholders([]);
      setRelationships([]);
      setSelectedStakeholder(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            {isEditingName ? (
              <input
                type="text"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                className="text-xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <h1 
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {sessionName}
              </h1>
            )}
            <p className="text-xs text-gray-500">Stakeholder Power Map</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500 mr-4">
            <span className="font-medium text-gray-900">{stakeholders.length}</span> stakeholders
          </div>
          <button onClick={clearData} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Clear Data">
            <Settings className="w-4 h-4" />
          </button>
          <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            <Share2 className="w-4 h-4 mr-2" />
            Share Survey
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel: Survey Entry */}
        <div className="w-80 shrink-0 z-10 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)]">
          <SurveyForm 
            stakeholders={stakeholders}
            onAddStakeholder={handleAddStakeholder}
            onAddRelationship={handleAddRelationship}
            onDeleteStakeholder={handleDeleteStakeholder}
          />
        </div>

        {/* Right Panel: Visualization */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-4 flex space-x-1 overflow-x-auto shrink-0 z-10 shadow-sm">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Network Graph Area */}
          <div className="flex-1 relative" onClick={() => setSelectedStakeholder(null)}>
            <NetworkGraph
              stakeholders={stakeholders}
              relationships={relationships}
              activeTab={activeTab}
              onNodeClick={setSelectedStakeholder}
            />
            
            {/* Legend (only show if not overview) */}
            {activeTab !== 'overview' && stakeholders.length > 0 && (
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-200 pointer-events-none">
                <div className="text-xs font-medium text-gray-700 mb-2">Power Score ({TABS.find(t => t.key === activeTab)?.label})</div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Low</span>
                  <div className="w-24 h-3 bg-gradient-to-r from-blue-100 to-blue-900 rounded-sm"></div>
                  <span className="text-xs text-gray-500">High</span>
                </div>
              </div>
            )}
          </div>

          {/* Stakeholder Detail Drawer */}
          <StakeholderDetail
            stakeholder={selectedStakeholder}
            onClose={() => setSelectedStakeholder(null)}
          />
        </div>
      </div>
    </div>
  );
}
