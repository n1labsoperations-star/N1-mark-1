import React, { useCallback, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { N1Text, useN1Styles, useN1Theme } from '../../../shared/components';
import { DASHBOARD_STRINGS as S } from '../constants';
import { HERO_OVERSCROLL, makeDashboardHeroStyles } from '../styles';
import type { DashboardPeriod } from '../types';

/** How far the black runs into the stat cards below the period chips. */
const CARD_OVERLAP = 64;

type Props = {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
};

/**
 * Top of the phone dashboard's scrolling page, under the CompactTopBar header: the
 * period chips on black. The black reaches into the stat cards below.
 */
function DashboardHero({ period, onPeriodChange }: Props) {
  const styles = useN1Styles(makeDashboardHeroStyles);
  const theme = useN1Theme();
  const [heroBottom, setHeroBottom] = useState(0);

  const onLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) =>
      setHeroBottom(layout.y + layout.height),
    [],
  );

  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.backdrop,
          {
            height:
              HERO_OVERSCROLL + heroBottom + theme.spacing.lg + CARD_OVERLAP,
          },
        ]}
      />
      {/* Period chips: dark on the black, the chosen one white. */}
      <View
        style={styles.periods}
        accessibilityRole="tablist"
        onLayout={onLayout}
      >
        {S.periods.map(tab => {
          const selected = tab.key === period;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              aria-selected={selected}
              onPress={() => onPeriodChange(tab.key)}
              style={({ pressed }) => [
                styles.period,
                selected && styles.periodSelected,
                pressed && styles.pressed,
              ]}
            >
              <N1Text variant="label" color={selected ? 'primary' : 'inverse'}>
                {tab.label}
              </N1Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export default React.memo(DashboardHero);
