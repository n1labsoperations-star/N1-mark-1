import { N1PageHeader } from '../../../shared/components';
import { AdminScreen, ComingSoon } from '../../../shared/components';
import { NAV_STRINGS } from '../../../shared/constants';

export const JOB_CARD_STRINGS = {
  subtitle:
    'Shop-floor operations in progress, with the machine and operator assigned to each.',
  comingSoonTitle: 'Job Cards are on the way',
  comingSoonMessage:
    'Route cards, operation progress and QC history will live here. This module is not part of the current build.',
} as const;

/** Placeholder until the Job Cards module is built. */
export function JobCardsScreen() {
  return (
    <AdminScreen testID="job-cards-screen">
      <N1PageHeader
        title={NAV_STRINGS.jobCards}
        subtitle={JOB_CARD_STRINGS.subtitle}
      />
      <ComingSoon
        icon="clipboard"
        title={JOB_CARD_STRINGS.comingSoonTitle}
        message={JOB_CARD_STRINGS.comingSoonMessage}
      />
    </AdminScreen>
  );
}
