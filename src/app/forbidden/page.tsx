'use client';
import AppIcon from '@/components/icons/appIcon';
import { IconShieldCheck } from '@/components/icons/icons';

export default function ForbiddenPage() {
  return (
    <div
      role="alert"
      className="w-full border-default border-border-primary rounded-default p-6 bg-background drop-shadow-default space-y-6"
    >
      <h1 className="text-title flex items-center gap-2 pb-4 border-b-default border-border-primary">
        <AppIcon icon={IconShieldCheck} tw="text-blue-primary" />
        403 — Access denied
      </h1>
      <div className="bg-panel-light border-default border-border-primary rounded-default p-6 space-y-2 text-default">
        <p>You do not have access to this page in your current workspace.</p>
        <p>
          Choose another workspace or ask your organization administrator for
          access.
        </p>
      </div>
    </div>
  );
}
