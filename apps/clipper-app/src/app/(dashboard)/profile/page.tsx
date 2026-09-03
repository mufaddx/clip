"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Field, Input } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

interface Me {
  email: string;
  role: string;
  createdAt: string;
  referralCode: string;
}

// /profile — see docs/ui-ux/PAGE_SPECIFICATIONS.md.
export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetchClient<Me>("/v1/users/me").then(setMe).catch(() => setMe(null));
  }, []);

  return (
    <div>
      <PageHeader title="Profile" />
      <Card className="max-w-md">
        <div className="flex flex-col gap-3">
          <Field label="Email">
            <Input value={me?.email ?? ""} disabled />
          </Field>
          <Field label="Role">
            <Input value={me?.role ?? ""} disabled />
          </Field>
          <Field label="Referral code">
            <Input value={me?.referralCode ?? ""} disabled />
          </Field>
        </div>
      </Card>
    </div>
  );
}
