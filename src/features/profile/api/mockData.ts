import { DAY_MS, MINUTE_MS, isoAgo } from '../../../services/mock/mockServer';
import type { Session } from '../types';

export const MOCK_SESSION: Session = {
  organization: {
    id: 'ORG-1',
    name: 'ABC Engineering Pvt Ltd',
    shortName: 'ABC Engineering',
    code: 'ABC001',
  },
  profile: {
    id: 'USR-1',
    name: 'Koushik Dasarathan',
    email: 'kousigaratchagan.pd@foodhub.com',
    designation: 'Founder & Administrator',
    phone: '+91 98765 00000',
    role: 'admin',
    status: 'active',
    memberSince: '2026-09-12',
    activity: [
      {
        id: 'a1',
        label: 'Logged in from Chrome',
        at: isoAgo(MINUTE_MS / 2),
        tone: 'success',
      },
      {
        id: 'a2',
        label: 'Created user Priya Sharma',
        at: isoAgo(2 * DAY_MS),
        tone: 'info',
      },
      {
        id: 'a3',
        label: 'Created organization',
        at: '2026-09-12T09:00:00',
        tone: 'neutral',
      },
    ],
  },
};
