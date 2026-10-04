import { useCallback, useState } from 'react';
import { View } from 'react-native';
import {
  AvatarPicker,
  N1Badge,
  N1Divider,
  N1KeyValueList,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { useOnSettled } from '../../../shared/hooks';
import { formatDate } from '../../../shared/utils';
import { pickImage } from '../../../services/files/pickImage';
import { ROLE_LABELS } from '../../auth/constants';
import { PROFILE_STRINGS as S } from '../constants';
import { useSession } from '../hooks/useSession';
import type { MyProfile, Organization } from '../types';

const makeStyles = createN1Styles(t => ({
  identity: { alignItems: 'center', gap: t.spacing.xs },
  name: { marginTop: t.spacing.sm },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: t.spacing.sm,
    marginTop: t.spacing.xs,
  },
}));

type Props = {
  profile: MyProfile;
  organization: Organization | null;
};

/** My profile's left column: photo, name, role and organization. */
export function ProfileSummary({ profile, organization }: Props) {
  const styles = useN1Styles(makeStyles);
  const { updateProfile, saving } = useSession();
  const [photoSaving, setPhotoSaving] = useState(false);

  // The photo saves as soon as it's picked.
  const changePhoto = useCallback(async () => {
    const photo = await pickImage('photo', 'photo.png');
    if (photo) {
      setPhotoSaving(true);
      updateProfile({ photo });
    }
  }, [updateProfile]);
  useOnSettled(saving, null, () => setPhotoSaving(false));

  return (
    <View testID="profile-summary">
      <View style={styles.identity}>
        <AvatarPicker
          name={profile.name}
          imageUri={profile.photo?.uri}
          onPress={changePhoto}
          accessibilityLabel={S.changePhoto}
          loading={photoSaving}
          testID="profile-photo"
        />
        <N1Text variant="h3" align="center" style={styles.name}>
          {profile.name}
        </N1Text>
        {profile.designation ? (
          <N1Text variant="small" color="secondary" align="center">
            {profile.designation}
          </N1Text>
        ) : null}
        <View style={styles.badges}>
          <N1Badge label={ROLE_LABELS[profile.role]} tone="info" />
          <N1Badge label={S.active} tone="success" dot />
        </View>
      </View>
      <N1Divider spacing="lg" />
      <N1KeyValueList
        variant="plain"
        items={[
          { label: S.organization, value: organization?.name ?? '' },
          { label: S.organizationCode, value: organization?.code ?? '' },
          { label: S.memberSince, value: formatDate(profile.memberSince) },
        ]}
      />
    </View>
  );
}
