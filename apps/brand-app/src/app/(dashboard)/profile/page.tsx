"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Field, Input } from "@clip/ui";
import { apiFetchClient } from "../../../lib/api-client";

interface Me {
  email: string;
  role: string;
  referralCode: string;
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetchClient<Me>("/v1/users/me").then(setMe).catch(() => setMe(null));
  }, []);

  return (
    <div>
      <PageHeader title="Profile" />
      <Card className="mx-auto max-w-md">
        <div className="flex flex-col gap-3">
          <Field label="Email"><Input value={me?.email ?? ""} disabled /></Field>
          <Field label="Role"><Input value={me?.role ?? ""} disabled /></Field>
        </div>
      </Card>
    </div>
  );
}
