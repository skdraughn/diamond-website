"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { colors } from "../theme/colors";
import { getPreferredStoreLink } from "../utils/appStore";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/strikeout", label: "Strikeout" },
  { href: "/reverseimmaculate", label: "Reverse Immaculate" },
  { href: "/higherlower", label: "Higher Lower" },
];

function HeaderLink({ href, label, active, onClick }) {
  return (
    <Link href={href} onClick={onClick}>
      <Typography
        sx={{
          color: active ? colors.text : colors.secondaryText,
          fontWeight: active ? 800 : 600,
          lineHeight: 1.1,
          "&:hover": { color: colors.text },
        }}
      >
        {label}
      </Typography>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeLink, setStoreLink] = useState(() => getPreferredStoreLink());

  const activePath = useMemo(
    () =>
      navLinks.find(
        ({ href }) => pathname === href || (href !== "/" && pathname.startsWith(href))
      )?.href || "/",
    [pathname]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const id = window.setTimeout(() => {
        setStoreLink(getPreferredStoreLink(navigator.userAgent));
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          py: { xs: 0.75, md: 1 },
          backgroundColor: "rgba(7,9,8,0.72)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Toolbar sx={{ p: 0 }}>
          <Container
            maxWidth="xl"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minHeight: { xs: 62, md: 72 },
            }}
          >
            <Link href="/" aria-label="Go to homepage">
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  fontWeight: 800,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Diamond Trivia
              </Typography>
            </Link>

            <Stack
              direction="row"
              spacing={2.5}
              sx={{ ml: 3, alignItems: "center", display: { xs: "none", lg: "flex" } }}
            >
              {navLinks.map(({ href, label }) => (
                <HeaderLink key={href} href={href} label={label} active={activePath === href} />
              ))}
            </Stack>

            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                component="a"
                href={storeLink.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: colors.border,
                  color: colors.text,
                  px: 1.5,
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                {storeLink.shortLabel}
              </Button>
              <IconButton
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                sx={{ display: { xs: "inline-flex", lg: "none" }, color: colors.text }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 300, p: 2.5, background: colors.surface } }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
          Menu
        </Typography>
        <Stack spacing={2}>
          {navLinks.map(({ href, label }) => (
            <HeaderLink
              key={href}
              href={href}
              label={label}
              active={activePath === href}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </Stack>
        <Button
          component="a"
          href={storeLink.href}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ mt: 3 }}
        >
          {storeLink.label}
        </Button>
      </Drawer>
    </>
  );
}
