import React from 'react';
import { CheckCircle2, Clock, Mail, AlertCircle } from 'lucide-react';

export interface StatusBadgeProps {
  activated?: boolean;
  hasActivationKey?: boolean;
  isKeyExpired?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  activated,
  hasActivationKey,
  isKeyExpired,
}) => {
  if (activated) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={13} />
        <span>Đã kích hoạt</span>
      </span>
    );
  }

  if (hasActivationKey) {
    if (isKeyExpired) {
      return (
        <span className="badge badge-error">
          <AlertCircle size={13} />
          <span>Email hết hạn</span>
        </span>
      );
    }
    return (
      <span className="badge badge-info">
        <Mail size={13} />
        <span>Đã gửi email</span>
      </span>
    );
  }

  return (
    <span className="badge badge-neutral">
      <Clock size={13} />
      <span>Chưa gửi email</span>
    </span>
  );
};
