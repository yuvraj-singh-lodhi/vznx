// File: src/components/TeamOverview/TeamOverview.tsx
import React, { useState } from 'react';
import type { TeamMember } from '../../types';
import TeamMemberCard from './TeamMemberCard';
import Loader from '../UI/Loader'; 

interface TeamOverviewProps {
  team: TeamMember[];
  handleAddNewTeamMember: (name: string) => void;
  isActionLoading: boolean;
}

const TeamOverview: React.FC<TeamOverviewProps> = ({ team, handleAddNewTeamMember, isActionLoading }) => {
  const [newMemberName, setNewMemberName] = useState('');

  const isAddDisabled = !newMemberName.trim() || isActionLoading;

  const onAddMember = () => {
    if (isAddDisabled) return;

    handleAddNewTeamMember(newMemberName.trim());
    setNewMemberName('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-3xl font-extrabold text-slate-900">👥 Team Load</h2>
        <p className="text-slate-500 text-md mt-1">Monitor capacity and active task assignments.</p>
      </div>

      <div className="space-y-4 mb-6">
        {team.map(member => (
          <TeamMemberCard 
            key={member.name}
            member={member}
          />
        ))}
        {team.length === 0 && (
          <p className="text-sm italic text-slate-500 py-2 text-center">No team members added yet.</p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex gap-3">
        <input
          type="text"
          placeholder="New member name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onAddMember(); }}
          disabled={isActionLoading} 
          className="p-2.5 border border-slate-300 rounded-lg flex-1 focus:ring-2 focus:ring-sky-300 shadow-sm transition-all text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={onAddMember}
          disabled={isAddDisabled} 
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shadow-md transition-all disabled:bg-slate-400 disabled:shadow-none relative flex items-center justify-center"
        >
          {isActionLoading && !newMemberName.trim() ? (
            <Loader size={20} />
          ) : (
            'Add'
          )}
        </button>
      </div>
    </div>
  );
};

export default TeamOverview;