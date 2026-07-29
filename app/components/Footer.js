import Link from "next/link";
import { Box, Container, Stack, Typography } from "@mui/material";
import { colors } from "../theme/colors";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/support", label: "Support" },
  { href: "/terms.pdf", label: "Terms", external: true },
];

export default function Footer({ sx = {} }) {
  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 2.5, md: 3 },
        width: "100%",
        borderTop: `1px solid ${colors.border}`,
        bgcolor: "rgba(7,18,32,0.78)",
        ...sx,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Typography variant="body2" color={colors.secondaryText}>
          {`© ${new Date().getFullYear()} Diamond Trivia.`}
        </Typography>

        <Stack direction="row" spacing={2.25} sx={{ flexWrap: "wrap" }}>
          {footerLinks.map(({ href, label, external }) => (
            <Link
              key={href}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondaryText,
                  fontWeight: 700,
                  "&:hover": { color: colors.text },
                }}
              >
                {label}
              </Typography>
            </Link>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
