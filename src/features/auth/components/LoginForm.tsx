import React, { useState } from 'react';
import { Image, View } from 'react-native';
import {
  N1Button,
  N1Checkbox,
  N1Logo,
  N1Text,
  N1TextInput,
  useN1Styles,
} from '../../../shared/components';
import { isPhone } from '../../../shared/utils';
import { makeLoginFormStyles } from '../styles';
import { isValidEmail } from '../utils';

// The N1 brand mark (cropped from the design file, 240 × 171).
const BRAND_LOGO = require('../../../../assets/images/n1-logo.png');

type FieldErrors = { email?: string; password?: string };

const LOGIN_ID_REQUIRED = 'Email or phone number is required';
const LOGIN_ID_INVALID = 'Enter a valid email or phone number';
const PASSWORD_REQUIRED = 'Password is required';

/** Both fields are required; the login ID must be an email or a phone number. */
function validate(email: string, password: string): FieldErrors {
  return {
    email: !email.trim()
      ? LOGIN_ID_REQUIRED
      : isValidEmail(email) || isPhone(email)
      ? undefined
      : LOGIN_ID_INVALID,
    password: password ? undefined : PASSWORD_REQUIRED,
  };
}

type Props = {
  title: string;
  subtitle?: string;
  /** Shows the "Remember me" checkbox (wide layout only in the design). */
  showRememberMe?: boolean;
  /** Small logo above the title (phones, where the hero panel is hidden). */
  showLogo?: boolean;
  /** Small brand mark, left aligned above the title (wide layout). */
  showBrand?: boolean;
  /** Shown under the password field, e.g. for wrong credentials. */
  errorText?: string;
  onSubmit: (email: string, password: string) => void;
  onForgotPassword?: () => void;
};

function LoginForm({
  title,
  subtitle,
  showRememberMe = false,
  showLogo = false,
  showBrand = false,
  errorText,
  onSubmit,
  onForgotPassword,
}: Props) {
  const styles = useN1Styles(makeLoginFormStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Only a filled-in, well-formed form reaches the credentials check.
  const submit = () => {
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (!errors.email && !errors.password) {
      onSubmit(email, password);
    }
  };

  return (
    <View style={styles.form}>
      {showLogo ? (
        <View style={styles.logo}>
          <N1Logo size="sm" />
        </View>
      ) : null}
      <View style={styles.heading}>
        {showBrand ? (
          <Image
            source={BRAND_LOGO}
            style={styles.brand}
            resizeMode="contain"
            accessibilityLabel="N1"
            testID="login-brand"
          />
        ) : null}

        <N1Text variant="display">{title}</N1Text>
        {subtitle ? <N1Text color="secondary">{subtitle}</N1Text> : null}
      </View>
      <N1TextInput
        label="Email or phone number"
        value={email}
        onChangeText={value => {
          setEmail(value);
          setFieldErrors(prev => ({ ...prev, email: undefined }));
        }}
        errorText={fieldErrors.email}
        placeholder="you@company.com or 98765 43210"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="username"
        textContentType="username"
      />
      <N1TextInput
        label="Password"
        value={password}
        onChangeText={value => {
          setPassword(value);
          setFieldErrors(prev => ({ ...prev, password: undefined }));
        }}
        placeholder="Enter your password"
        secure
        // A missing password first; wrong credentials after that.
        errorText={fieldErrors.password ?? errorText}
        autoComplete="password"
        textContentType="password"
      />
      <View
        style={[styles.optionsRow, !showRememberMe && styles.optionsRowEnd]}
      >
        {showRememberMe ? (
          <N1Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={setRememberMe}
          />
        ) : null}
        <N1Button
          title="Forgot password?"
          variant="ghost"
          size="sm"
          onPress={onForgotPassword}
        />
      </View>
      <N1Button title="Log in" size="lg" fullWidth onPress={submit} />
    </View>
  );
}

export default React.memo(LoginForm);
