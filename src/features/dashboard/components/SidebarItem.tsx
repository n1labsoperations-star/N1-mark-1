import React from 'react';
import { Pressable } from 'react-native';
import { N1Icon, N1Text, useN1Styles } from '../../../shared/components';
import { makeSidebarItemStyles } from '../styles';
import type { MenuItem } from '../types';

type Props = {
  item: MenuItem;
  active: boolean;
  /** Icon-only rail: the label moves to the accessibility label. */
  collapsed: boolean;
  onPress: (item: MenuItem) => void;
};

function SidebarItem({ item, active, collapsed, onPress }: Props) {
  const styles = useN1Styles(makeSidebarItemStyles);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.item,
        collapsed && styles.collapsed,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      <N1Icon name={item.icon} size="lg" color="textInverse" />
      {collapsed ? null : (
        <N1Text
          variant="title"
          weight={active ? 'bold' : 'regular'}
          color="inverse"
        >
          {item.label}
        </N1Text>
      )}
    </Pressable>
  );
}

export default React.memo(SidebarItem);
