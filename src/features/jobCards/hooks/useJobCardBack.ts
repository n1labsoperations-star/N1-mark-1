import { useCallback } from 'react';
import { JOB_CARD_STRINGS } from '../constants';
import type { JobCardsScreenProps } from '../types';

const D = JOB_CARD_STRINGS.details;

type Props = JobCardsScreenProps<'JobCardDetails'>;

/**
 * Back for the job card screens: to the admin screen that opened the card
 * (Dashboard, an order, an employee), else the screen below it
 * (the Job Cards list, or My Jobs on the shop floor).
 */
export function useJobCardBack({ route, navigation }: Props) {
  const { jobCardId, from, fromUserId } = route.params;
  const goBack = useCallback(() => {
    switch (from) {
      case 'dashboard':
        navigation.navigate('Overview');
        return;
      case 'order':
        navigation.navigate('Orders', {
          screen: 'OrderDetails',
          params: { orderId: jobCardId },
          initial: false,
        });
        return;
      case 'employee':
        if (fromUserId) {
          navigation.navigate('Users', {
            screen: 'UserDetails',
            params: { userId: fromUserId, section: 'work' },
            initial: false,
          });
          return;
        }
        break;
    }
    navigation.goBack();
  }, [navigation, from, fromUserId, jobCardId]);

  const label = from ? D.backTo[from] : D.back;
  return { goBack, label };
}
