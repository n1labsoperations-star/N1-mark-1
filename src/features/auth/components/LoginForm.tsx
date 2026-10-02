import React, { useState } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Checkbox,
  N1Logo,
  N1Text,
  N1TextInput,
  useN1Styles,
} from '../../../shared/components';
import { makeLoginFormStyles } from '../styles';

type Props = {
  title: string;
  subtitle?: string;
  /** Shows the "Remember me" checkbox (wide layout only in the design). */
  showRememberMe?: boolean;
  /** Small logo above the title (phones, where the hero panel is hidden). */
  showLogo?: boolean;
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
  errorText,
  onSubmit,
  onForgotPassword,
}: Props) {
  const styles = useN1Styles(makeLoginFormStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={styles.form}>
      {showLogo ? (
        <View style={styles.logo}>
          <N1Logo size="sm" />
        </View>
      ) : null}
      <View style={styles.heading}>
        <N1Text variant="display">{title}</N1Text>
        {subtitle ? <N1Text color="secondary">{subtitle}</N1Text> : null}
      </View>
      <N1TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@company.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <N1TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secure
        errorText={errorText}
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
      <N1Button
        title="Log in"
        size="lg"
        fullWidth
        onPress={() => onSubmit(email, password)}
      />
    </View>
  );
}

export default React.memo(LoginForm);
