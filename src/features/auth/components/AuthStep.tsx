import React from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Icon,
  N1Text,
  useN1Breakpoint,
  useN1Styles,
  useN1Theme,
  type N1IconName,
} from '../../../shared/components';
import { makeAuthStepStyles } from '../styles';

type Props = {
  icon: N1IconName;
  /** 'success' tints the icon green, e.g. once a code is verified. */
  iconTone?: 'neutral' | 'success';
  title: string;
  subtitle: ReactNode;
  /** Omit to hide the back link. */
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
};

/**
 * One step of a single-column auth flow: optional back link, icon badge,
 * title, subtitle and the step's fields.
 */
function AuthStep({
  icon,
  iconTone = 'neutral',
  title,
  subtitle,
  backLabel,
  onBack,
  children,
}: Props) {
  const styles = useN1Styles(makeAuthStepStyles);
  const theme = useN1Theme();
  const { isCompact } = useN1Breakpoint();
  const success = iconTone === 'success';

  const back =
    backLabel && onBack ? (
      <N1Button
        title={backLabel}
        variant="ghost"
        size="sm"
        leftIcon="chevron-left"
        onPress={onBack}
        style={[styles.backButton, !isCompact && styles.wideBack]}
      />
    ) : null;

  const body = (
    <View style={styles.body}>
      <View style={styles.heading}>
        <View style={[styles.iconCircle, success && styles.iconCircleSuccess]}>
          <N1Icon
            name={icon}
            size="lg"
            tintColor={
              success ? theme.colors.tone.success.foreground : undefined
            }
          />
        </View>
        <N1Text variant={isCompact ? 'h1' : 'display'}>{title}</N1Text>
        <N1Text color="secondary">{subtitle}</N1Text>
      </View>
      {children}
    </View>
  );

  if (isCompact) {
    return (
      <View style={styles.compactRoot}>
        {back}
        <View style={styles.compactBody}>{body}</View>
      </View>
    );
  }

  return (
    <View>
      {back}
      {body}
    </View>
  );
}

export default React.memo(AuthStep);
