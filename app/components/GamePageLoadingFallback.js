import { Skeleton } from "@mui/material";
import { colors } from "../theme/colors";

export default function GamePageLoadingFallback() {
  return (
    <Skeleton
      variant="rectangular"
      height={520}
      width="100%"
      animation="wave"
      sx={{ bgcolor: colors.backgroundHighlight, borderRadius: 2 }}
    />
  );
}
