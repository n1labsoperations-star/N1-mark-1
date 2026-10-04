import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AdminScreen,
  AsyncContent,
  DonutChart,
  DetailHeader,
  EntityHero,
  N1Badge,
  N1Card,
  N1Divider,
  N1Tabs,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';
import { SECTION_NAV_WIDTH } from '../../../shared/constants';
import { useOnSettled } from '../../../shared/hooks';
import { pickImage } from '../../../services/files/pickImage';
import { GstSettingsForm } from '../components/GstSettingsForm';
import { OrganizationSectionForm } from '../components/OrganizationSectionForm';
import { useSession } from '../hooks/useSession';
import {
  INDUSTRY_OPTIONS,
  ORGANIZATION_SECTIONS,
  ORGANIZATION_STRINGS as S,
  optionLabel,
  organizationCompletion,
  type OrganizationSection,
} from '../organization';

const makeStyles = createN1Styles(t => ({
  hero: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xl },
  heroCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: t.spacing.lg,
  },
  heroIdentity: { flex: 1 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  progressText: { gap: t.spacing.xxs },
  // Wide screens: the card fills the window; only the fields scroll.
  card: { flex: 1, minHeight: 0 },
  panel: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: t.spacing.xl,
  },
  nav: {
    width: SECTION_NAV_WIDTH,
    paddingRight: t.spacing.xl,
    borderRightWidth: t.borderWidth.hairline,
    borderRightColor: t.colors.border,
  },
  content: { flex: 1 },
  contentInner: { flexGrow: 1, paddingBottom: t.spacing.xs },
  // The loader / error sits in the middle of the form area.
  loading: { flexGrow: 1, justifyContent: 'center' },
  heroPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.lg,
  },
  placeholderAvatar: {
    width: t.avatarSize.lg,
    height: t.avatarSize.lg,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surfaceMuted,
  },
  placeholderLines: { flex: 1, gap: t.spacing.sm },
  placeholderLine: {
    height: t.typography.h3.lineHeight,
    borderRadius: t.radius.xs,
    backgroundColor: t.colors.surfaceMuted,
  },
  placeholderTitle: { width: '40%' },
  placeholderSubtitle: { width: '25%' },
  compactTabs: { marginBottom: t.spacing.lg },
}));

/**
 * The signed-in organization: General, Business details, Address, GST & tax,
 * Invoice settings and Document settings, one tab each. Fields stay locked
 * until the section's Edit is pressed.
 */
export function OrganizationScreen() {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const { isCompact } = useN1Breakpoint();
  const navigation = useNavigation();
  const { organization, status, error, reload, updateOrganization, saving } =
    useSession();
  const [logoSaving, setLogoSaving] = useState(false);
  const [tab, setTab] = useState<OrganizationSection>('general');
  const [editing, setEditing] = useState(false);
  const startEdit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(() => setEditing(false), []);
  // Leaving a section drops its unsaved edits.
  const changeTab = useCallback((key: OrganizationSection) => {
    setTab(key);
    setEditing(false);
  }, []);
  // The logo saves as soon as it's picked; no Edit needed.
  const changeLogo = useCallback(async () => {
    const logo = await pickImage('logo', 'logo.png');
    if (logo) {
      setLogoSaving(true);
      updateOrganization({ logo });
    }
  }, [updateOrganization]);
  useOnSettled(saving, null, () => setLogoSaving(false));
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const header = <DetailHeader title={S.title} onBack={goBack} />;

  const completion = useMemo(
    () => (organization ? organizationCompletion(organization) : null),
    [organization],
  );
  const sectionTabs = useMemo(
    () =>
      ORGANIZATION_SECTIONS.map(({ key, title, icon }) => ({
        key,
        label: title,
        icon,
        badge: completion?.missingBySection[key],
      })),
    [completion],
  );

  const tabs = (
    <N1Tabs
      tabs={sectionTabs}
      value={tab}
      onChange={changeTab}
      variant={isCompact ? 'segmented' : 'menu'}
      scrollable={isCompact}
      style={isCompact && styles.compactTabs}
      testID="organization-tab"
    />
  );

  return (
    <AdminScreen header={header} fixed testID="organization-screen">
      <N1Card radius="sm" style={!isCompact && styles.card}>
        {organization && completion ? (
          <View style={[styles.hero, isCompact && styles.heroCompact]}>
            <View style={!isCompact && styles.heroIdentity}>
              <EntityHero
                name={organization.name}
                subtitle={optionLabel(INDUSTRY_OPTIONS, organization.industry)}
                badges={<N1Badge label={organization.code} tone="info" />}
                avatarUri={organization.logo?.uri}
                onAvatarPress={changeLogo}
                avatarLabel={S.changeLogo}
                avatarLoading={logoSaving}
                testID="organization-hero"
              />
            </View>
            <View style={styles.progress} testID="organization-completion">
              <DonutChart
                size="xs"
                centerValue={`${completion.percent}%`}
                // Empty segments are dropped so a full ring has no gap.
                segments={[
                  {
                    key: 'done',
                    label: S.completion,
                    value: completion.percent,
                    color: theme.colors.primary,
                  },
                  {
                    key: 'left',
                    label: S.completionLeft,
                    value: 100 - completion.percent,
                    color: theme.colors.surfaceMuted,
                  },
                ].filter(segment => segment.value > 0)}
              />
              <View style={styles.progressText}>
                <N1Text weight="semiBold">{S.completion}</N1Text>
                <N1Text variant="small" color="secondary">
                  {completion.missing
                    ? S.completionMissing(completion.missing)
                    : S.completionDone}
                </N1Text>
              </View>
            </View>
          </View>
        ) : (
          // Same size as the hero, so nothing jumps when it loads.
          <View style={styles.heroPlaceholder}>
            <View style={styles.placeholderAvatar} />
            <View style={styles.placeholderLines}>
              <View style={[styles.placeholderLine, styles.placeholderTitle]} />
              <View
                style={[styles.placeholderLine, styles.placeholderSubtitle]}
              />
            </View>
          </View>
        )}
        <N1Divider spacing="xl" />
        {isCompact && tabs}
        <View style={!isCompact && styles.panel}>
          {!isCompact && <View style={styles.nav}>{tabs}</View>}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!isCompact}
            testID={`organization-${tab}`}
          >
            {!organization ? (
              <View style={styles.loading}>
                <AsyncContent status={status} error={error} onRetry={reload}>
                  {null}
                </AsyncContent>
              </View>
            ) : tab === 'gst' ? (
              <GstSettingsForm
                organization={organization}
                editing={editing}
                onEdit={startEdit}
                onDone={stopEdit}
              />
            ) : (
              <OrganizationSectionForm
                key={tab}
                section={tab}
                organization={organization}
                editing={editing}
                onEdit={startEdit}
                onDone={stopEdit}
              />
            )}
          </ScrollView>
        </View>
      </N1Card>
    </AdminScreen>
  );
}
