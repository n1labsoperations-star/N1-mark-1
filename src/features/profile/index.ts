// Public API of the Profile feature.
// Bottom-tab profile screen from the starter app.
export { default as ProfileScreen } from './screens/ProfileScreen';
// Admin "My profile" and the signed-in session.
export { MyProfileScreen } from './screens/MyProfileScreen';
export { useSession, useOrganizationName } from './hooks/useSession';
export { profileActions } from './store/profileSlice';
export type { MyProfile, Organization, Session } from './types';
