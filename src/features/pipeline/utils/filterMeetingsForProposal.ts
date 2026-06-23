import type { Meeting } from '@/features/reunioes/types';

interface ProposalRef {
  id: number;
  createdAt?: string;
}

function toDayStart(value: string): number {
  const datePart = value.split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return new Date(value).getTime();
  return new Date(y, m - 1, d).getTime();
}

function proposalSortTime(p: ProposalRef): number {
  return p.createdAt ? toDayStart(p.createdAt) : p.id;
}

/**
 * Heuristic: meetings are enterprise-scoped (no proposalId on API yet).
 * Assigns each meeting to one proposal by date window until backend links them.
 */
function assignProposalIdForMeeting(
  meeting: Meeting,
  sortedProposals: ProposalRef[],
): number | null {
  if (sortedProposals.length === 0) return null;
  if (sortedProposals.length === 1) return sortedProposals[0].id;

  if (!meeting.date) {
    return sortedProposals[sortedProposals.length - 1].id;
  }

  const meetingTime = toDayStart(meeting.date);

  for (let i = 0; i < sortedProposals.length; i++) {
    const windowStart = i === 0 ? 0 : proposalSortTime(sortedProposals[i]);
    const next = sortedProposals[i + 1];
    const windowEnd = next?.createdAt ? toDayStart(next.createdAt) : Infinity;

    if (meetingTime >= windowStart && meetingTime < windowEnd) {
      return sortedProposals[i].id;
    }
  }

  const firstStart = sortedProposals[0].createdAt
    ? toDayStart(sortedProposals[0].createdAt)
    : 0;
  if (meetingTime < firstStart) {
    return sortedProposals[0].id;
  }

  return sortedProposals[sortedProposals.length - 1].id;
}

export function filterMeetingsForProposal(
  meetings: Meeting[],
  proposal: ProposalRef,
  allProposals: ProposalRef[],
): Meeting[] {
  if (allProposals.length <= 1) return meetings;

  const sorted = [...allProposals].sort((a, b) => {
    const diff = proposalSortTime(a) - proposalSortTime(b);
    return diff !== 0 ? diff : a.id - b.id;
  });

  return meetings.filter(
    (m) => assignProposalIdForMeeting(m, sorted) === proposal.id,
  );
}
