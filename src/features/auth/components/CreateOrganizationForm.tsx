import React, { useState } from 'react';
import { View } from 'react-native';
import {
  N1Badge,
  N1Button,
  N1Checklist,
  N1Divider,
  N1DropDown,
  N1Text,
  N1TextInput,
  useN1Styles,
} from '../../../shared/components';
import { INDUSTRY_OPTIONS } from '../constants';
import { makeCreateOrganizationFormStyles } from '../styles';
import {
  checkPassword,
  generateOrganizationCode,
  isValidEmail,
  passwordChecklist,
} from '../utils';

export type CreateOrganizationValues = {
  name: string;
  code: string;
  industry: string;
  email: string;
  phone: string;
  password: string;
};

type Props = {
  /** Phone layout: one field per row and shorter intro copy. */
  compact: boolean;
  onBack: () => void;
  onSubmit: (values: CreateOrganizationValues) => void;
};

function CreateOrganizationForm({ compact, onBack, onSubmit }: Props) {
  const styles = useN1Styles(makeCreateOrganizationFormStyles);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Errors only show once the user has tried to submit.
  const [submitted, setSubmitted] = useState(false);

  const code = generateOrganizationCode(name);
  const rules = checkPassword(password, confirmPassword);
  const errors = {
    name: name.trim() ? undefined : 'Enter the organization name',
    industry: industry ? undefined : 'Select an industry',
    email: isValidEmail(email) ? undefined : 'Enter a valid email',
    phone: phone.trim() ? undefined : 'Enter a phone number',
    password:
      rules.minLength && rules.lettersAndNumbers
        ? undefined
        : 'Password does not meet the rules below',
    confirmPassword: rules.matches ? undefined : 'Passwords do not match',
  };
  const shown = (error?: string) => (submitted ? error : undefined);

  const handleSubmit = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !industry) {
      return;
    }
    onSubmit({
      name: name.trim(),
      code,
      industry,
      email: email.trim(),
      phone: phone.trim(),
      password,
    });
  };

  // Two fields side by side on wide screens, stacked on phones.
  const rowStyle = compact ? styles.form : styles.row;
  const itemStyle = compact ? undefined : styles.rowItem;

  return (
    <View style={styles.form}>
      <View style={styles.header}>
        <N1Button
          title="Back to log in"
          variant="ghost"
          size="sm"
          leftIcon="chevron-left"
          onPress={onBack}
          style={styles.backButton}
        />
        <N1Text variant={compact ? 'h1' : 'display'}>
          Create Organization
        </N1Text>
        <N1Text color="secondary">
          {compact
            ? "You'll be the admin. "
            : "You'll be the admin of this organization. Fields marked "}
          <N1Text color="danger">*</N1Text>
          {compact ? ' required.' : ' are required.'}
        </N1Text>
      </View>
      {compact ? <N1Divider /> : null}

      <View style={rowStyle}>
        <N1TextInput
          label="Organization name"
          required
          value={name}
          onChangeText={setName}
          placeholder="ABC Engineering Pvt Ltd"
          autoCapitalize="words"
          errorText={shown(errors.name)}
          containerStyle={itemStyle}
        />
        <N1TextInput
          label="Organization code"
          readOnly
          value={code}
          placeholder="Generated from name"
          rightElement={<N1Badge label="Auto" tone="info" />}
          containerStyle={itemStyle}
        />
      </View>
      <View style={rowStyle}>
        <N1DropDown
          label="Industry"
          required
          options={INDUSTRY_OPTIONS}
          value={industry}
          onChange={setIndustry}
          placeholder="Select industry"
          errorText={shown(errors.industry)}
          containerStyle={itemStyle}
        />
        <N1TextInput
          label="Business email"
          required
          value={email}
          onChangeText={setEmail}
          placeholder="owner@abcengineering.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          errorText={shown(errors.email)}
          containerStyle={itemStyle}
        />
      </View>
      <N1TextInput
        label="Phone number"
        required
        value={phone}
        onChangeText={setPhone}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        errorText={shown(errors.phone)}
      />
      <View style={rowStyle}>
        <N1TextInput
          label="Password"
          required
          secure
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          autoComplete="new-password"
          textContentType="newPassword"
          errorText={shown(errors.password)}
          containerStyle={itemStyle}
        />
        <N1TextInput
          label="Confirm password"
          required
          secure
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          autoComplete="new-password"
          textContentType="newPassword"
          errorText={shown(errors.confirmPassword)}
          containerStyle={itemStyle}
        />
      </View>
      <N1Checklist items={passwordChecklist(rules)} />
      <N1Button
        title="Create organization"
        size="lg"
        fullWidth
        onPress={handleSubmit}
      />
    </View>
  );
}

export default React.memo(CreateOrganizationForm);
