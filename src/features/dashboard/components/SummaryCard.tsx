import React from 'react';
import { View } from 'react-native';
import {
  N1Icon,
  N1IconButton,
  N1Text,
  useN1Styles,
  useN1Theme,
  type N1IconName,
  type N1Tone,
} from '../../../shared/components';
import { DASHBOARD_STRINGS as S } from '../constants';
import { makeSummaryCardStyles } from '../styles';

type Props = {
  label: string;
  value: string | number;
  icon: N1IconName;
  /** Colours the icon badge. */
  tone: N1Tone;
  /** The lead card: dark, with light text. */
  featured?: boolean;
  onOpen: () => void;
  testID?: string;
};

/** Dashboard headline number: icon badge, open arrow, label and value. */
function SummaryCard({
  label,
  value,
  icon,
  tone,
  featured = false,
  onOpen,
  testID,
}: Props) {
  const styles = useN1Styles(makeSummaryCardStyles);
  const theme = useN1Theme();
  const toneColors = theme.colors.tone[tone];

  return (
    <View style={[styles.card, featured && styles.featured]} testID={testID}>
      <View style={styles.top}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: featured
                ? theme.colors.surfaceInverseActive
                : toneColors.background,
            },
          ]}
        >
          <N1Icon
            name={icon}
            size="md"
            tintColor={
              featured ? theme.colors.textInverse : toneColors.foreground
            }
          />
        </View>
        <N1IconButton
          icon="arrow-up-right"
          variant={featured ? 'inverse' : 'secondary'}
          size="sm"
          accessibilityLabel={S.stats.open(label)}
          onPress={onOpen}
        />
      </View>
      <View style={styles.text}>
        <N1Text variant="small" color={featured ? 'tertiary' : 'secondary'}>
          {label}
        </N1Text>
        <N1Text variant="stat" color={featured ? 'inverse' : 'primary'}>
          {value}
        </N1Text>
      </View>
    </View>
  );
}

export default React.memo(SummaryCard);
