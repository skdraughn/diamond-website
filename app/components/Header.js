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
import Image from "next/image";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { colors } from "../theme/colors";
import { getPreferredStoreLink } from "../utils/appStore";
import { trackAppStoreClick } from "@/utils/firebaseAnalytics";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/strikeout", label: "Strikeout" },
  { href: "/reverseimmaculate", label: "Reverse Immaculate" },
  { href: "/higherlower", label: "Higher Lower" },
  { href: "/statstack", label: "Stat Stack" },
  { href: "/162-0", label: "162-0" },
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
          backgroundColor: "rgba(7,18,32,0.82)",
          backdropFilter: "blur(18px)",
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
              <Stack direction="row" spacing={1.1} sx={{ alignItems: "center" }}>
                <Image
                  src="/diamond-app-icon-v2.webp"
                  width={40}
                  height={40}
                  alt="Diamond Trivia"
                  style={{ borderRadius: 10, objectFit: "contain" }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    fontWeight: 800,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    color: colors.chalk,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Diamond Trivia
                </Typography>
              </Stack>
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
                onClick={() =>
                  trackAppStoreClick({
                    placement: "header",
                    platform: storeLink.platform,
                  })
                }
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
        slotProps={{
          paper: {
            sx: {
              width: 290,
              p: 2.5,
              background: "linear-gradient(160deg, #0e2238, #071220 70%)",
              borderLeft: `1px solid ${colors.primary}55`,
            },
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
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
        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          <Button
            component="a"
            href={storeLink.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackAppStoreClick({
                placement: "mobile_menu",
                platform: storeLink.platform,
              })
            }
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: colors.text,
              color: colors.background,
              "&:hover": { bgcolor: "#ded8ce" },
            }}
          >
            {storeLink.label}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
