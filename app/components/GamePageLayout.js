import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import Footer from "./Footer";
import { colors } from "../theme/colors";
import AppBenefitPromo from "./AppBenefitPromo";

function GameInfoSection({ title, children }) {
  return (
    <Box component="section" sx={{ mt: { xs: 4, md: 5 } }}>
      <Typography variant="h2" sx={{ fontSize: { xs: "1.4rem", md: "1.9rem" }, mb: 1.1 }}>
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
        pt: { xs: "6.8rem", md: "8.25rem" },
        pb: 0,
        background,
      }}
    >
      <Container maxWidth={maxWidth} sx={{ display: "flex", flexDirection: "column" }}>
        {showHeader ? (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h1" sx={{ fontSize: { md: "2.8rem", xs: "1.75rem" }, lineHeight: 1.05 }}>
              {heading}
            </Typography>
            {subtitle && (
              <Typography variant="h6" sx={{ color: colors.secondaryText, mt: 0.5, lineHeight: 1.35 }}>
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
      <Footer sx={{ mt: 5 }} />
    </Box>
  );
}
