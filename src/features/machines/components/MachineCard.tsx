import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../N1Modules';
import { MACHINE_STRINGS, MACHINE_TYPE_LABELS } from '../constants';
import type { Machine } from '../types';
import { CurrentWork } from './CurrentWork';
import { MachineStatusBadge } from './MachineBadge';

const makeStyles = createN1Styles(t => ({
  card: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm },
  text: { flex: 1, gap: t.spacing.xxs },
}));

type Props = { machine: Machine; onEdit: (machine: Machine) => void };

/** One machine on the phone list. */
export const MachineCard = memo(function MachineCardComponent({
  machine,
  onEdit,
}: Props) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.card} testID={`machine-card-${machine.id}`}>
      <View style={styles.top}>
        <View style={styles.text}>
          <N1Text
            variant="title"
            weight="bold"
          >{`${machine.code} · ${machine.name}`}</N1Text>
          <N1Text variant="small" color="secondary">
            {`${MACHINE_TYPE_LABELS[machine.type]} · ${machine.location}`}
          </N1Text>
        </View>
        <MachineStatusBadge status={machine.status} />
      </View>
      <CurrentWork work={machine.currentWork} variant="panel" />
      <N1Button
        title={MACHINE_STRINGS.edit}
        leftIcon="edit"
        fullWidth
        onPress={() => onEdit(machine)}
        accessibilityLabel={MACHINE_STRINGS.a11y.edit(machine.name)}
      />
    </View>
  );
});
