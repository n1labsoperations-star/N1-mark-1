import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import {
  N1Button,
  N1Divider,
  N1Modal,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useHeldWhileVisible } from '../../../shared/hooks';
import { BILLING_STRINGS } from '../constants';
import type { InvoiceDocument } from '../invoiceDocument';

const P = BILLING_STRINGS.preview;
const I = BILLING_STRINGS.invoice;

/** A4 is 1 : √2; the sheet is at least that tall, so it reads as a page. */
const A4_RATIO = Math.SQRT2;
/** The organization's logo in the page's top-left corner. */
const LOGO_SIZE = 56;

const makeStyles = createN1Styles(t => ({
  // Grey desk with the white page on it, like a PDF viewer.
  desk: {
    maxHeight: '100%',
    borderRadius: t.radius.md,
    backgroundColor: t.colors.background,
  },
  deskContent: { padding: t.spacing.lg },
  sheet: {
    width: '100%',
    gap: t.spacing.lg,
    padding: t.spacing.xl,
    borderRadius: t.radius.tight,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: t.spacing.lg,
  },
  grow: { flex: 1 },
  brand: { flex: 1, flexDirection: 'row', gap: t.spacing.md },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
  // No logo uploaded: the organization's initials in its place.
  mark: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.md,
    backgroundColor: t.colors.textPrimary,
  },
  end: { alignItems: 'flex-end' },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md },
  field: { minWidth: '28%' },
  totals: { alignSelf: 'flex-end', minWidth: '50%', gap: t.spacing.xxs },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between' },
  totalStrong: {
    marginTop: t.spacing.xs,
    paddingTop: t.spacing.sm,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  block: { gap: t.spacing.xxs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.sm,
  },
}));

type Props = {
  /** The invoice to show; null closes the viewer. */
  doc: InvoiceDocument | null;
  onClose: () => void;
  onPrint: (doc: InvoiceDocument) => void;
  onDownload: () => void;
};

/**
 * Preview Invoice / Preview Quote: the document laid out as an A4 page, as
 * it prints, with Print (web: Save as PDF from the print dialog) and
 * Download PDF.
 */
export function InvoicePreviewModal({
  doc: docProp,
  onClose,
  onPrint,
  onDownload,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const visible = docProp !== null;
  // Kept while the dialog fades out.
  const doc = useHeldWhileVisible(visible, docProp);
  // At least A4-tall for its width; longer invoices grow past it.
  const [sheetWidth, setSheetWidth] = useState(0);

  return (
    <N1Modal
      visible={visible}
      onClose={onClose}
      size="lg"
      title={doc?.previewTitle}
      subtitle={doc?.meta[0].value}
      footer={
        <View style={styles.footer}>
          <N1Button
            title={I.downloadPdf}
            leftIcon="download"
            variant="secondary"
            onPress={onDownload}
            testID="invoice-preview-download"
          />
          <N1Button
            title={P.print}
            leftIcon="printer"
            onPress={() => doc && onPrint(doc)}
            testID="invoice-preview-print"
          />
        </View>
      }
      testID="invoice-preview"
    >
      {doc && (
        <ScrollView
          style={styles.desk}
          contentContainerStyle={styles.deskContent}
        >
          <View
            style={[styles.sheet, { minHeight: sheetWidth * A4_RATIO }]}
            onLayout={e => setSheetWidth(e.nativeEvent.layout.width)}
            testID="invoice-preview-sheet"
          >
            <View style={styles.top}>
              <View style={styles.brand}>
                {doc.seller.logoUri ? (
                  <Image
                    source={{ uri: doc.seller.logoUri }}
                    resizeMode="contain"
                    style={styles.logo}
                    accessibilityLabel={doc.seller.name}
                    testID="invoice-preview-logo"
                  />
                ) : (
                  <View style={styles.mark} testID="invoice-preview-mark">
                    <N1Text variant="title" weight="bold" color="inverse">
                      {doc.seller.initials}
                    </N1Text>
                  </View>
                )}
                <View style={styles.grow}>
                  <N1Text variant="title" weight="bold">
                    {doc.seller.name}
                  </N1Text>
                  {doc.seller.lines.map(line => (
                    <N1Text key={line} variant="caption" color="secondary">
                      {line}
                    </N1Text>
                  ))}
                </View>
              </View>
              <View style={styles.end}>
                <N1Text variant="h3" weight="bold">
                  {doc.title}
                </N1Text>
                {doc.meta.map(m => (
                  <N1Text key={m.label} variant="caption">
                    <N1Text variant="caption" color="secondary">
                      {`${m.label} `}
                    </N1Text>
                    {m.value}
                  </N1Text>
                ))}
              </View>
            </View>
            <N1Divider />
            <View style={styles.details}>
              {doc.details.map(f => (
                <View key={f.label} style={styles.field}>
                  <N1Text variant="overline">{f.label}</N1Text>
                  <N1Text variant="small" weight="semiBold">
                    {f.value}
                  </N1Text>
                </View>
              ))}
            </View>
            <View style={styles.totals}>
              {doc.totals.map(t => (
                <View
                  key={t.label}
                  style={[styles.totalLine, t.strong && styles.totalStrong]}
                >
                  <N1Text
                    variant={t.strong ? 'title' : 'small'}
                    weight={t.strong ? 'bold' : undefined}
                    color={t.strong ? undefined : 'secondary'}
                  >
                    {t.label}
                  </N1Text>
                  <N1Text
                    variant={t.strong ? 'title' : 'small'}
                    weight="bold"
                    testID={t.strong ? 'invoice-preview-total' : undefined}
                  >
                    {t.value}
                  </N1Text>
                </View>
              ))}
            </View>
            {doc.notes ? (
              <View style={styles.block}>
                <N1Text variant="overline">{I.notes}</N1Text>
                <N1Text variant="small">{doc.notes}</N1Text>
              </View>
            ) : null}
            {doc.terms ? (
              <View style={styles.block}>
                <N1Text variant="overline">{P.terms}</N1Text>
                <N1Text variant="caption" color="secondary">
                  {doc.terms}
                </N1Text>
              </View>
            ) : null}
            <N1Text variant="caption" color="secondary" align="center">
              {doc.footer || COMMON_STRINGS.dash}
            </N1Text>
          </View>
        </ScrollView>
      )}
    </N1Modal>
  );
}
