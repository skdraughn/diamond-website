"use client";

import { FlagProvider } from "react-featureflags-client";

const DEFAULT_DEV_KEY = "env_c_I-iCAEvdd17BVQRudbVVHQ";
const DEFAULT_PROD_KEY = "env_c_mVBrNi7WKU25KiS2KyFAVQ";

const TRUFLAG_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TRUFLAG_CLIENT_KEY ||
  (process.env.NODE_ENV === "development" ? DEFAULT_DEV_KEY : DEFAULT_PROD_KEY);

if (!TRUFLAG_CLIENT_KEY) {
  throw new Error(
    "Truflag client key must be set via NEXT_PUBLIC_TRUFLAG_CLIENT_KEY or built-in defaults",
  );
}

export default function TruflagProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FlagProvider
      options={{
        apiKey: TRUFLAG_CLIENT_KEY,
      }}
    >
      {children}
    </FlagProvider>
  );
}
