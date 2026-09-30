import React from 'react';
import { N1Text } from '../../../shared/components';

type Props = {
  question: string;
  action: string;
  onPress?: () => void;
};

/** Footer line such as "Already have an account? Log in". */
function AuthPrompt({ question, action, onPress }: Props) {
  return (
    <N1Text color="secondary" align="center">
      {question}{' '}
      <N1Text weight="bold" accessibilityRole="link" onPress={onPress}>
        {action}
      </N1Text>
    </N1Text>
  );
}

export default React.memo(AuthPrompt);
