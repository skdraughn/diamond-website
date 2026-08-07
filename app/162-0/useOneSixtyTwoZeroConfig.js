"use client";

import { useMemo } from "react";
import { useRemoteConfigString } from "@/utils/remoteConfig";
import { localCatalogURL } from "./catalog";

export default function useOneSixtyTwoZeroConfig() {
  const remote = useRemoteConfigString("onesixtytwozerocatalogurl", localCatalogURL);
  return useMemo(() => ({
    config: { url: remote.value || localCatalogURL },
    loading: remote.loading,
    error: null,
    retry: remote.refresh,
  }), [remote.loading, remote.refresh, remote.value]);
}
