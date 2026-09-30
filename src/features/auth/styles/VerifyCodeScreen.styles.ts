import { createN1Styles } from '../../../theme';

export const makeVerifyCodeScreenStyles = createN1Styles(t => ({
  // Resend / different email links, right under the Verify button.
  footer: {
    alignItems: 'center',
    gap: t.spacing.lg,
    marginTop: t.spacing.sm,
  },
  // N1Button aligns itself to the start by default.
  centred: {
    alignSelf: 'center',
  },
}));
