import React from 'react';
import { Stakeholder, PowerBase } from '../types';
import { X, User, Briefcase, Users, Shield, Award, Zap, BookOpen, Heart, Info } from 'lucide-react';

interface StakeholderDetailProps {
  stakeholder: Stakeholder | null;
  onClose: () => void;
}

const POWER_ICONS: Record<PowerBase, React.ElementType> = {
  legitimate: Shield,
  reward: Award,
  coercive: Zap,
  expert: BookOpen,
  referent: Heart,
  information: Info,
};

const POWER_LABELS: Record<PowerBase, string> = {
  legitimate: 'Legitimate',
  reward: 'Reward',
  coercive: 'Coercive',
  expert: 'Expert',
  referent: 'Referent',
  information: 'Information',
};

export function StakeholderDetail({ stakeholder, onClose }: StakeholderDetailProps) {
  if (!stakeholder) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out z-20">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900">Stakeholder Profile</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{stakeholder.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Briefcase className="w-4 h-4 mr-1.5" />
              {stakeholder.role}
            </div>
            {stakeholder.team && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Users className="w-4 h-4 mr-1.5" />
                {stakeholder.team}
              </div>
            )}
          </div>
        </div>

        {/* Power Bases */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Power Profile</h4>
          <div className="space-y-3">
            {(Object.entries(stakeholder.powerScores) as [PowerBase, number][]).map(([base, score]) => {
              const Icon = POWER_ICONS[base];
              return (
                <div key={base} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{POWER_LABELS[base]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm ${
                            i <= score ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900 w-3 text-right">{score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Influence Tactics */}
        {stakeholder.tactics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Influence Tactics</h4>
            <div className="flex flex-wrap gap-2">
              {stakeholder.tactics.map(tactic => (
                <span
                  key={tactic}
                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                >
                  {tactic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {stakeholder.notes && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic">
              "{stakeholder.notes}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
