'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { currencyChangeConsentBody, currencyChangeConsentTitle, findCurrency } from '@/lib/currencies';

interface CurrencyChangeConsentModalProps {
  isOpen: boolean;
  pendingCode: string | null;
  currentCode: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CurrencyChangeConsentModal({
  isOpen,
  pendingCode,
  currentCode,
  onConfirm,
  onCancel,
  isLoading = false,
}: CurrencyChangeConsentModalProps) {
  const pending = pendingCode ? findCurrency(pendingCode) : null;
  if (!pending) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={currencyChangeConsentTitle(pending.code)}
      footer={
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={onConfirm} isLoading={isLoading}>
            Use this currency
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-token-secondary">
        {currencyChangeConsentBody(pending.code, pending.name, currentCode)}
      </p>
    </Modal>
  );
}
