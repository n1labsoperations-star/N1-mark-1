import { delay, respond } from '../../../services/mock/mockServer';
import type {
  MyProfile,
  PasswordChangeInput,
  ProfileInput,
  Session,
} from '../types';
import { MOCK_SESSION } from './mockData';

// Mock backend. Replace with GET /me, PATCH /me and POST /me/password.
let session: Session = MOCK_SESSION;

export const profileApi = {
  fetchSession: () => respond(session),
  updateProfile: async (changes: ProfileInput): Promise<MyProfile> => {
    session = { ...session, profile: { ...session.profile, ...changes } };
    return respond(session.profile);
  },
  changePassword: async (_input: PasswordChangeInput): Promise<void> => {
    await delay();
  },
  reset: () => {
    session = MOCK_SESSION;
  },
};
