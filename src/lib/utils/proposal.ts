import type { ProposalOption } from "@/lib/types/document";

export function getAutoSupportHourlyRate(total: number): number {
  return Math.round(total * 0.2);
}

export function getProposalSupportHourlyRate(proposal: ProposalOption): number {
  if (
    typeof proposal.supportHourlyRate === "number" &&
    Number.isFinite(proposal.supportHourlyRate) &&
    proposal.supportHourlyRate >= 0
  ) {
    return proposal.supportHourlyRate;
  }

  return getAutoSupportHourlyRate(proposal.total);
}
