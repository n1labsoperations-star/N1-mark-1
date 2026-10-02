import { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useOnSettled } from '../../../shared/hooks';
import type { BillingScreenProps, Quote } from '../types';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import type { RootState } from '../../../app/store';
import { workflowActions } from '../store/workflowSlice';

const selectWorkflow = (state: RootState) => state.billing.workflow;

/** Convert a quote to an order, or bill a dispatched job. */
export function useBillingWorkflow() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectWorkflow);
  const convertQuote = useCallback(
    (quoteId: string) => dispatch(workflowActions.convertQuoteRequest(quoteId)),
    [dispatch],
  );
  const generateInvoice = useCallback(
    (jobCardId: string, quoteId: string | null, gstRate: number) =>
      dispatch(
        workflowActions.generateInvoiceRequest({ jobCardId, quoteId, gstRate }),
      ),
    [dispatch],
  );
  return { ...state, convertQuote, generateInvoice };
}

type Navigation = BillingScreenProps<'BillingHome'>['navigation'];

/**
 * Convert to Order: a converted quote opens its order; otherwise the order
 * is created from the quote, then opened (Back returns to billing).
 */
export function useConvertToOrder() {
  const navigation = useNavigation<Navigation>();
  const { convertQuote, busy, error, orderId } = useBillingWorkflow();
  const converting = useRef<string | null>(null);

  const openOrder = useCallback(
    (id: string) =>
      navigation.navigate('Orders', {
        screen: 'OrderDetails',
        params: { orderId: id },
        initial: false,
      }),
    [navigation],
  );

  useOnSettled(busy, error, () => {
    if (converting.current && orderId) {
      converting.current = null;
      openOrder(orderId);
    }
  });

  const convert = useCallback(
    (quote: Quote) => {
      if (quote.orderId) {
        openOrder(quote.orderId);
      } else {
        converting.current = quote.id;
        convertQuote(quote.id);
      }
    },
    [openOrder, convertQuote],
  );

  return {
    convert,
    /** The quote being converted right now, for its spinner. */
    convertingId: busy ? converting.current : null,
    error,
  };
}
