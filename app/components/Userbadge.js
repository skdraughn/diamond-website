"use client";

import Image from "next/image";
import { Box } from "@mui/material";
import { getCurrentBadge } from "../utils/gridironThresholds";

export default function Userbadge({ user, small = false, size, noClick = false }) {
  const dimension = size ?? (small ? 35 : 45);
  const profileID = user?.id || user?.userID;

  return (
    <Box
      component={profileID && !noClick ? "a" : "span"}
      href={profileID && !noClick ? `/mlb/${profileID}/view` : undefined}
      sx={{ display: "inline-flex", flexShrink: 0 }}
    >
      <Image
        src={getCurrentBadge(user?.gridiron || 0)}
        alt={`${user?.username || "User"} rank badge`}
        width={dimension}
        height={dimension}
        style={{ objectFit: "cover", borderRadius: 8 }}
      />
    </Box>
  );
}
