import { useCallback, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AdminScreen,
  AsyncContent,
  DetailHeader,
  EntityHero,
  N1Badge,
  N1Card,
  N1DetailGrid,
  N1IconButton,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { formatDate } from '../../../shared/utils';
import { EditOrganizationSectionModal } from '../components/EditOrganizationSectionModal';
import { GstSettingsModal } from '../components/GstSettingsModal';
import { taxRatesSummary } from '../gst';
import { useSession } from '../hooks/useSession';
import {
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  ORGANIZATION_SECTIONS,
  ORGANIZATION_STRINGS as S,
  PAYMENT_TERMS_OPTIONS,
  optionLabel,
  type OrganizationSection,
} from '../organization';
import type { Organization } from '../types';
import type { Attachment } from '../../../shared/types';

const F = S.fields;

const makeStyles = createN1Styles(t => ({
  sections: { gap: t.spacing.lg },
}));

const orDash = (value: string) => value || COMMON_STRINGS.dash;
const fileName = (file: Attachment | null) => file?.name ?? S.notSet;

/** Label / value rows for each section, as shown on the page. */
function sectionItems(
  section: OrganizationSection,
  o: Organization,
): { label: string; value: ReactNode }[] {
  switch (section) {
    case 'general':
      return [
        { label: F.name, value: o.name },
        { label: S.code, value: o.code },
        { label: F.logo, value: fileName(o.logo) },
        { label: F.phone, value: orDash(o.phone) },
        { label: F.email, value: orDash(o.email) },
        { label: F.website, value: orDash(o.website) },
      ];
    case 'business':
      return [
        {
          label: F.businessType,
          value: orDash(optionLabel(BUSINESS_TYPE_OPTIONS, o.businessType)),
        },
        {
          label: F.industry,
          value: orDash(optionLabel(INDUSTRY_OPTIONS, o.industry)),
        },
        {
          label: F.registrationDetails,
          value: orDash(o.registrationDetails),
        },
        { label: S.createdAt, value: orDash(formatDate(o.createdAt)) },
      ];
    case 'address':
      return [
        { label: F.address, value: orDash(o.address) },
        { label: F.city, value: orDash(o.city) },
        { label: F.state, value: orDash(o.state) },
        { label: F.pinCode, value: orDash(o.pinCode) },
        { label: F.country, value: orDash(o.country) },
      ];
    case 'gst':
      return [
        { label: F.gstRegistered, value: o.gstRegistered ? S.yes : S.no },
        { label: F.gstNumber, value: orDash(o.gstNumber) },
        { label: F.gstState, value: orDash(o.gstState) },
        { label: F.taxRates, value: orDash(taxRatesSummary(o.taxRates)) },
      ];
    case 'invoice':
      return [
        { label: F.invoicePrefix, value: orDash(o.invoicePrefix) },
        { label: F.invoiceStartNumber, value: String(o.invoiceStartNumber) },
        {
          label: F.paymentTerms,
          value: orDash(optionLabel(PAYMENT_TERMS_OPTIONS, o.paymentTerms)),
        },
        { label: F.invoiceFooter, value: orDash(o.invoiceFooter) },
      ];
    case 'documents':
      return [
        { label: F.invoiceLogo, value: fileName(o.invoiceLogo) },
        { label: F.termsAndConditions, value: orDash(o.termsAndConditions) },
        { label: F.signature, value: fileName(o.signature) },
      ];
  }
}

/**
 * The signed-in organization: General, Business details, Address, GST & tax,
 * Invoice settings and Document settings, each edited on its own.
 */
export function OrganizationScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation();
  const { organization, status, error, reload } = useSession();
  const [editing, setEditing] = useState<OrganizationSection | null>(null);
  const closeEdit = useCallback(() => setEditing(null), []);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const header = <DetailHeader title={S.title} onBack={goBack} />;

  if (!organization) {
    return (
      <AdminScreen header={header} testID="organization-screen">
        <AsyncContent status={status} error={error} onRetry={reload}>
          {null}
        </AsyncContent>
      </AdminScreen>
    );
  }

  return (
    <AdminScreen header={header} testID="organization-screen">
      <N1Card>
        <EntityHero
          name={organization.name}
          subtitle={optionLabel(INDUSTRY_OPTIONS, organization.industry)}
          badges={<N1Badge label={organization.code} tone="info" />}
        />
      </N1Card>
      <View style={styles.sections}>
        {ORGANIZATION_SECTIONS.map(section => (
          <N1Card
            key={section.key}
            title={section.title}
            icon={section.icon}
            headerRight={
              <N1IconButton
                icon="edit"
                variant="primary"
                size="sm"
                accessibilityLabel={S.edit(section.title)}
                onPress={() => setEditing(section.key)}
                testID={`edit-organization-${section.key}`}
              />
            }
            testID={`organization-${section.key}`}
          >
            <N1DetailGrid items={sectionItems(section.key, organization)} />
          </N1Card>
        ))}
      </View>
      <EditOrganizationSectionModal
        section={editing === 'gst' ? null : editing}
        organization={organization}
        onClose={closeEdit}
      />
      <GstSettingsModal
        visible={editing === 'gst'}
        organization={organization}
        onClose={closeEdit}
      />
    </AdminScreen>
  );
}
