import React from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { N1Icon, type N1IconName } from '../N1Icon/N1Icon';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import type { N1Spacing } from '../../../theme/tokens';
import { N1Text } from '../N1Text/N1Text';
import { N1View, type N1ViewProps } from '../N1View/N1View';

export type N1CardProps = N1ViewProps & {
  title?: string;
  subtitle?: string;
  /** Icon shown before the title, e.g. "Account" or "Recent activity". */
  icon?: N1IconName;
  /** Rendered at the right of the header, e.g. a "View all" link or badge. */
  headerRight?: ReactNode;
  padding?: N1Spacing;
  children?: ReactNode;
};

const makeStyles = createN1Styles(t => ({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  titles: { flex: 1, gap: t.spacing.xxs },
}));

/** White rounded panel on the grey page background. */
export const N1Card = React.memo(function N1CardComponent({
  title,
  subtitle,
  icon,
  headerRight,
  padding = 'xl',
  children,
  ...rest
}: N1CardProps) {
  const styles = useN1Styles(makeStyles);
  const hasHeader = Boolean(title || subtitle || headerRight);
  return (
    <N1View background="surface" radius="lg" padding={padding} {...rest}>
      {hasHeader && (
        <View style={styles.header}>
          <View style={styles.titles}>
            {title && (
              <View style={styles.titleRow}>
                {icon && <N1Icon name={icon} size="sm" />}
                <N1Text variant="h3">{title}</N1Text>
              </View>
            )}
            {subtitle && (
              <N1Text variant="small" color="secondary">
                {subtitle}
              </N1Text>
            )}
          </View>
          {headerRight}
        </View>
      )}
      {children}
    </N1View>
  );
});
N1Card.displayName = 'N1Card';
