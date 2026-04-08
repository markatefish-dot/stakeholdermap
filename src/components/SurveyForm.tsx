import React, { useEffect, useState } from 'react';
import { Stakeholder, Relationship, PowerBase, InfluenceTactic } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface SurveyFormProps {
  stakeholders: Stakeholder[];
  onAddStakeholder: (stakeholder: Stakeholder) => void;
  onAddRelationship: (relationship: Relationship) => void;
  onDeleteStakeholder?: (id: string) => void;
  onDeleteRelationship?: (id: string) => void;
}

const POWER_BASES: { key: PowerBase; label: string; desc: string }[] = [
  { key: 'legitimate', label: 'Legitimate', desc: 'Formal authority' },
  { key: 'reward', label: 'Reward', desc: 'Ability to reward' },
  { key: 'coercive', label: 'Coercive', desc: 'Ability to punish/block' },
  { key: 'expert', label: 'Expert', desc: 'Specialist knowledge' },
  { key: 'referent', label: 'Referent', desc: 'Trust, admiration' },
  { key: 'information', label: 'Information', desc: 'Access to info' },
];

const TACTICS: InfluenceTactic[] = [
  'Rational Persuasion',
  'Inspirational Appeals',
  'Consultation',
  'Ingratiation',
  'Personal Appeals',
  'Coalition Tactics',
];

export function SurveyForm({ stakeholders, onAddStakeholder, onAddRelationship, onDeleteStakeholder }: SurveyFormProps) {
  const [activeTab, setActiveTab] = useState<'stakeholder' | 'relationship'>('stakeholder');
  const canCreateRelationship = stakeholders.length >= 2;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState('');
  const [notes, setNotes] = useState('');
  const [powerScores, setPowerScores] = useState<Record<PowerBase, number>>({
    legitimate: 3,
    reward: 3,
    coercive: 3,
    expert: 3,
    referent: 3,
    information: 3,
  });
  const [tactics, setTactics] = useState<InfluenceTactic[]>([]);

  const [sourceId, setSourceId] = useState('');
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [strength, setStrength] = useState(3);
  const [relType, setRelType] = useState<'formal' | 'informal' | 'both'>('informal');

  useEffect(() => {
    if (!canCreateRelationship && activeTab === 'relationship') {
      setActiveTab('stakeholder');
    }
  }, [activeTab, canCreateRelationship]);

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    const newStakeholder: Stakeholder = {
      id: crypto.randomUUID(),
      name,
      role,
      team,
      notes,
      powerScores,
      tactics,
    };

    onAddStakeholder(newStakeholder);

    setName('');
    setRole('');
    setTeam('');
    setNotes('');
    setPowerScores({ legitimate: 3, reward: 3, coercive: 3, expert: 3, referent: 3, information: 3 });
    setTactics([]);
  };

  const handleAddRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || targetIds.length === 0) return;

    targetIds.forEach(targetId => {
      const newRelationship: Relationship = {
        id: crypto.randomUUID(),
        sourceId,
        targetId,
        strength,
        type: relType,
      };
      onAddRelationship(newRelationship);
    });

    setSourceId('');
    setTargetIds([]);
    setStrength(3);
    setRelType('informal');
  };

  const toggleTactic = (tactic: InfluenceTactic) => {
    setTactics(prev => (prev.includes(tactic) ? prev.filter(t => t !== tactic) : [...prev, tactic]));
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Data</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('stakeholder')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'stakeholder' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Stakeholder
          </button>
          <button
            type="button"
            onClick={() => canCreateRelationship && setActiveTab('relationship')}
            disabled={!canCreateRelationship}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'relationship'
                ? 'bg-blue-50 text-blue-700'
                : canCreateRelationship
                ? 'text-gray-500 hover:bg-gray-50'
                : 'text-gray-300 bg-gray-100 cursor-not-allowed'
            }`}
          >
            Relationship
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'stakeholder' ? (
          <form onSubmit={handleAddStakeholder} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Basic Info</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="VP of Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team / Function</label>
                <input
                  type="text"
                  value={team}
                  onChange={e => setTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Power Bases (1-5)</h3>
              <div className="space-y-3">
                {POWER_BASES.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={powerScores[key]}
                      onChange={e => setPowerScores(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                      className="w-32"
                    />
                    <span className="text-sm font-medium text-gray-900 w-4 text-right">{powerScores[key]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Influence Tactics</h3>
              <div className="flex flex-wrap gap-2">
                {TACTICS.map(tactic => (
                  <button
                    key={tactic}
                    type="button"
                    onClick={() => toggleTactic(tactic)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      tactics.includes(tactic)
                        ? 'bg-blue-100 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tactic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Notes</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Any additional context..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stakeholder
            </button>

            {stakeholders.length > 0 && onDeleteStakeholder && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">Manage Stakeholders</h3>
                <ul className="space-y-2">
                  {stakeholders.map(s => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <span className="truncate pr-2">{s.name} <span className="text-gray-500">({s.role})</span></span>
                      <button
                        type="button"
                        onClick={() => onDeleteStakeholder(s.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleAddRelationship} className="space-y-6">
            {stakeholders.length < 2 ? (
              <div className="text-sm text-gray-500 text-center py-8">
                Add at least two stakeholders to create relationships.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source (Influencer) *</label>
                    <select
                      required
                      value={sourceId}
                      onChange={e => {
                        setSourceId(e.target.value);
                        setTargetIds(prev => prev.filter(id => id !== e.target.value));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select stakeholder</option>
                      {stakeholders.map(s => (
                        <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Targets (Choose one or more) *</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                      {stakeholders.filter(s => s.id !== sourceId).map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={targetIds.includes(s.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setTargetIds(prev => [...prev, s.id]);
                              } else {
                                setTargetIds(prev => prev.filter(id => id !== s.id));
                              }
                            }}
                            disabled={!sourceId}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{s.name} <span className="text-gray-500">({s.role})</span></span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Pick one or more stakeholders who are influenced by the selected source.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Strength (1-5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={strength}
                      onChange={e => setStrength(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-right text-sm font-medium text-gray-900">{strength}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship type</label>
                    <select
                      value={relType}
                      onChange={e => setRelType(e.target.value as 'formal' | 'informal' | 'both')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="informal">Informal</option>
                      <option value="formal">Formal</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!sourceId || targetIds.length === 0}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Relationship{targetIds.length > 1 ? 's' : ''}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
