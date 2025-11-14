export const Icons = {
  LightMode: () =>
    import("@mui/icons-material/LightMode").then((mod) => mod.default),
  DarkMode: () =>
    import("@mui/icons-material/DarkMode").then((mod) => mod.default),
  SettingsBrightness: () =>
    import("@mui/icons-material/SettingsBrightness").then((mod) => mod.default),
}
