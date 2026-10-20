import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { colors } from "../theme/colors";
import AppBenefitPromo from "./AppBenefitPromo";

function GameInfoSection({ title, children }) {
  return (
    <Box component="section" sx={{ mt: { xs: 4, md: 5 } }}>
      <Typography variant="h2" sx={{ fontSize: { xs: "1.3rem", md: "1.5rem" }, mb: 1.1 }}>
        {title}
      </Typography>
      <Stack spacing={1.1}>{children}</Stack>
    </Box>
  );
}

export default function GamePageLayout({
  children,
  heading,
  subtitle = "",
  intro = "",
  infoSections,
  maxWidth = "md",
  reserveRightRail = false,
  background = "transparent",
  showHeader = true,
}) {
  const sections = infoSections || [];
  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "100dvh",
        pt: 0,
        pb: 0,
        background,
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: reserveRightRail ? { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(17rem, 20rem)" } : "minmax(0, 1fr)", gap: "1.25rem", alignItems: "start", minWidth: 0 }}>
      <Container maxWidth={maxWidth} sx={{ display: "flex", flexDirection: "column", px: "0 !important" }}>
        {showHeader ? (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h1" sx={{ fontSize: { md: "1.85rem", xs: "1.5rem" }, lineHeight: 1.05 }}>
              {heading}
            </Typography>
            {subtitle && (
              <Typography variant="body1" component="p" sx={{ color: colors.secondaryText, mt: 0.5, lineHeight: 1.35 }}>
                {subtitle}
              </Typography>
            )}
            {intro && (
              <Typography variant="body1" sx={{ color: colors.secondaryText, mt: 1.35 }}>
                {intro}
              </Typography>
            )}
          </Box>
        ) : null}
        {children}
        {sections.length > 0 && (
          <>
            <Divider sx={{ mt: { xs: 4, md: 5 }, borderColor: colors.border }} />
            {sections.map((section) => (
              <GameInfoSection key={section.title} title={section.title}>
                {section.content}
              </GameInfoSection>
            ))}
          </>
        )}
        <AppBenefitPromo game={heading.replace(/^Play (Today’s |Today's )?/, "")} />
      </Container>
      {reserveRightRail && <Box aria-hidden="true" sx={{ display: { xs: "none", lg: "block" }, minWidth: 0 }} />}
      </Box>

    </Box>
  );
}
