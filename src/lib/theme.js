/**
 * The functions here are for tracking and setting the current theme.
 * localStorage is used to store the currently preferred them, though
 * that doesn't work on the server, where we just use a default.
 */

const selector = 'link[data-name="eui-theme"]';
export const defaultTheme = 'amsterdam_light';

function getAllThemes() {
  // @ts-ignore
  return [...document.querySelectorAll(selector)];
}

export function setTheme(newThemeName) {
  const oldThemeName = getTheme();
  localStorage.setItem('theme', newThemeName);

  for (const themeLink of getAllThemes()) {
    // Disable all theme links, except for the desired theme, which we enable
    themeLink.disabled = themeLink.dataset.theme !== newThemeName;
  }

  // Add a class to the `body` element that indicates which theme we're using.
  // This allows any custom styling to adapt to the current theme.
  if (document.body.classList.contains(`appTheme-${oldThemeName}`)) {
    document.body.classList.replace(
      `appTheme-${oldThemeName}`,
      `appTheme-${newThemeName}`
    );
  } else {
    document.body.classList.add(`appTheme-${newThemeName}`);
  }
}

export function getTheme() {
  const storedTheme = localStorage.getItem('theme');

  return storedTheme || defaultTheme;
}

export function setInitialTheme() {
  if (typeof window !== 'object') {
    return defaultTheme;
  }

  const theme = getTheme();
  setTheme(theme);
  return theme;
}

// The config is generated during the build and made available in a JSON string.
export const themeConfig = JSON.parse(process.env.THEME_CONFIG);
