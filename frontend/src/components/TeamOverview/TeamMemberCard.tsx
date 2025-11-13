// src/components/TeamOverview/TeamMemberCard.tsx
import React from 'react';
import type { TeamMember } from '../../types';

interface TeamMemberCardProps {
  member: TeamMember;
  isActionLoading?: boolean; 
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, isActionLoading }) => {
  const assignedTasks = (member.tasks?.length ?? 0); 
  const capacity = member.capacity || 5; 
  
  const workloadPercentage = Math.min(100, (assignedTasks / capacity) * 100);

  let colorCls = 'bg-emerald-500';
  if (workloadPercentage > 75 && workloadPercentage <= 100) {
    colorCls = 'bg-amber-500';
  } else if (workloadPercentage > 100) {
    colorCls = 'bg-red-500';
  }

  return (
    <div 
      className={`p-4 border border-slate-200 rounded-lg bg-slate-50 transition-shadow hover:shadow-inner ${
        isActionLoading ? 'opacity-70 cursor-wait' : ''
      }`}
    >
      <h4 className="text-lg font-semibold text-slate-800 mb-2">{member.name}</h4>
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 mb-1">{assignedTasks} Tasks ({workloadPercentage.toFixed(0)}% Capacity)</span>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colorCls} transition-all duration-700 ease-out`}
            style={{ width: `${workloadPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;