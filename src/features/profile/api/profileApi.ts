import { delay, respond } from '../../../services/mock/mockServer';
import { newOrganization, shortNameOf } from '../organization';
import type {
  MyProfile,
  Organization,
  OrganizationInput,
  OrganizationUpdate,
  PasswordChangeInput,
  ProfileInput,
  Session,
} from '../types';
import { MOCK_SESSION } from './mockData';

// Mock backend. Replace with GET /me, PATCH /me and POST /me/password.
let session: Session = MOCK_SESSION;

export const profileApi = {
  fetchSession: () => respond(session),
  /** Create organization: the new organization becomes the session's. */
  createOrganization: (input: OrganizationInput): Promise<Session> => {
    session = {
      ...session,
      organization: newOrganization(input, new Date().toISOString()),
    };
    return respond(session);
  },
  updateOrganization: async (
    changes: OrganizationUpdate,
  ): Promise<Organization> => {
    const organization = { ...session.organization, ...changes };
    if (changes.name !== undefined) {
      organization.shortName = shortNameOf(changes.name);
    }
    session = { ...session, organization };
    return respond(session.organization);
  },
  updateProfile: async (changes: ProfileInput): Promise<MyProfile> => {
    session = { ...session, profile: { ...session.profile, ...changes } };
    return respond(session.profile);
  },
  changePassword: async (_input: PasswordChangeInput): Promise<void> => {
    await delay();
    session = {
      ...session,
      profile: { ...session.profile, hasPassword: true },
    };
  },
  reset: () => {
    session = MOCK_SESSION;
  },
};
