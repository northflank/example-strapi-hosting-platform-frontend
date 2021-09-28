import React, { useState } from 'react';
import { EuiButtonIcon } from '@elastic/eui';

import { setInitialTheme, setTheme, themeConfig } from '../../lib/theme';

const initialTheme = setInitialTheme();

/**
 * Renders a dropdown menu for selecting the current theme. The selection
 * is set in localStorage, so that it persists between visits.
 */
const ThemeSwitcher = () => {
  const [theme, setThemeInState] = useState(initialTheme);

  const handleChangeTheme = newTheme => {
    setTheme(newTheme);
    setThemeInState(newTheme);
  };

  return (
    <>
      <EuiButtonIcon
        iconType={theme === 'amsterdam_light' ? 'moon' : 'cloudSunny'}
        aria-label="Open theme menu"
        onClick={() =>
          handleChangeTheme(
            theme === 'amsterdam_light' ? 'amsterdam_dark' : 'amsterdam_light'
          )
        }
      />
    </>
  );
};

export default ThemeSwitcher;
