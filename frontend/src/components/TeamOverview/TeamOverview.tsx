// File: src/components/TeamOverview/TeamOverview.tsx
import React, { useState } from 'react';
import type { TeamMember } from '../../types';
import TeamMemberCard from './TeamMemberCard';

interface TeamOverviewProps {
  team: TeamMember[];
  handleAddNewTeamMember: (name: string) => void;
}

const TeamOverview: React.FC<TeamOverviewProps> = ({ team, handleAddNewTeamMember }) => {
  const [newMemberName, setNewMemberName] = useState('');

  const onAddMember = () => {
    if (!newMemberName.trim()) return;
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
          className="p-2.5 border border-slate-300 rounded-lg flex-1 focus:ring-2 focus:ring-sky-300 shadow-sm transition-all text-sm"
        />
        <button
          onClick={onAddMember}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shadow-md transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default TeamOverview;