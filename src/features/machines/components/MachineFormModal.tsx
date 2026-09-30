import { useCallback, useEffect, useMemo } from 'react';
import { N1DropDown, N1Modal, N1Text, N1TextInput } from '../../../shared/components';
import { FormFooter, FormRow } from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { isBlank } from '../../../shared/utils';
import {
  MACHINE_STATUS_OPTIONS,
  MACHINE_STRINGS,
  MACHINE_TYPE_OPTIONS,
} from '../constants';
import { useMachines } from '../hooks/useMachines';
import type { Machine, MachineInput } from '../types';

const F = MACHINE_STRINGS.form;

const EMPTY: MachineInput = {
  name: '',
  code: '',
  model: '',
  type: 'cnc_lathe',
  location: '',
  status: 'running',
  notes: '',
};

const toValues = (m?: Machine | null): MachineInput =>
  m
    ? {
        name: m.name,
        code: m.code,
        model: m.model,
        type: m.type,
        location: m.location,
        status: m.status,
        notes: m.notes,
      }
    : EMPTY;

const normaliseCode = (code: string) => code.trim().toUpperCase();

/** Required fields, plus machine codes must be unique. */
export function makeMachineValidator(
  machines: readonly Machine[],
  editingId?: string,
) {
  const taken = new Set(
    machines.filter(m => m.id !== editingId).map(m => normaliseCode(m.code)),
  );
  return (v: MachineInput): FormErrors<MachineInput> => {
    const errors: FormErrors<MachineInput> = {};
    if (isBlank(v.name)) {
      errors.name = COMMON_STRINGS.required;
    }
    if (isBlank(v.code)) {
      errors.code = COMMON_STRINGS.required;
    } else if (taken.has(normaliseCode(v.code))) {
      errors.code = F.codeTaken;
    }
    if (isBlank(v.location)) {
      errors.location = COMMON_STRINGS.required;
    }
    return errors;
  };
}

type Props = {
  visible: boolean;
  machine?: Machine | null;
  onClose: () => void;
};

/** Add machine / Edit machine dialog (full screen on phones). */
export function MachineFormModal({ visible, machine, onClose }: Props) {
  const isEdit = Boolean(machine);
  const { items, create, update, saving, saveError, clearErrors } =
    useMachines();
  const validate = useMemo(
    () => makeMachineValidator(items, machine?.id),
    [items, machine?.id],
  );
  const form = useForm<MachineInput>(toValues(machine), validate);
  const { reset, values, errors, bind } = form;

  useEffect(() => {
    if (visible) {
      reset(toValues(machine));
      clearErrors();
    }
  }, [visible, machine, reset, clearErrors]);

  useOnSettled(saving, saveError, onClose);

  const save = useCallback(
    (v: MachineInput) => {
      const input = {
        ...v,
        name: v.name.trim(),
        code: normaliseCode(v.code),
        model: v.model.trim(),
        location: v.location.trim(),
        notes: v.notes.trim(),
      };
      return machine ? update(machine.id, input) : create(input);
    },
    [machine, create, update],
  );

  return (
    <N1Modal
      visible={visible}
      onClose={onClose}
      title={isEdit ? F.editTitle : F.addTitle}
      subtitle={isEdit ? F.editSubtitle(machine?.name ?? '') : F.addSubtitle}
      footer={
        <FormFooter
          onCancel={onClose}
          submitLabel={isEdit ? COMMON_STRINGS.save : F.submitAdd}
          onSubmit={form.submit(save)}
          loading={saving}
          submitTestID="machine-form-submit"
        />
      }
      testID="machine-form"
    >
      <N1TextInput
        label={F.name}
        required
        placeholder={F.namePlaceholder}
        value={values.name}
        onChangeText={bind('name')}
        errorText={errors.name}
        testID="machine-form-name"
      />
      <FormRow>
        <N1TextInput
          label={F.code}
          required
          placeholder={F.codePlaceholder}
          value={values.code}
          onChangeText={bind('code')}
          errorText={errors.code}
          autoCapitalize="characters"
          autoCorrect={false}
          testID="machine-form-code"
        />
        <N1TextInput
          label={F.model}
          placeholder={F.modelPlaceholder}
          value={values.model}
          onChangeText={bind('model')}
        />
      </FormRow>
      <N1DropDown
        label={F.type}
        required
        options={MACHINE_TYPE_OPTIONS}
        value={values.type}
        onChange={bind('type')}
      />
      <FormRow>
        <N1TextInput
          label={F.location}
          required
          placeholder={F.locationPlaceholder}
          value={values.location}
          onChangeText={bind('location')}
          errorText={errors.location}
          testID="machine-form-location"
        />
        <N1DropDown
          label={F.status}
          options={MACHINE_STATUS_OPTIONS}
          value={values.status}
          onChange={bind('status')}
          testID="machine-form-status"
        />
      </FormRow>
      <N1TextInput
        label={F.notes}
        placeholder={F.notesPlaceholder}
        value={values.notes}
        onChangeText={bind('notes')}
        multiline
      />
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </N1Modal>
  );
}
