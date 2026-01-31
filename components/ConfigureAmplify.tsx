// components/ConfigureAmplify.tsx
"use client";

import { Amplify } from "aws-amplify";
import awsmobile from "@/src/aws-exports"; // Adjust path if needed

Amplify.configure(awsmobile, { ssr: true });

export default function ConfigureAmplify() {
  return null;
}
