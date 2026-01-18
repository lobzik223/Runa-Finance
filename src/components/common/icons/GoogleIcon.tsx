import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function GoogleIcon(props: Readonly<{ size?: number }>) {
  const size = props.size ?? 20;

  // Official-ish multi-color "G" built with 4 paths.
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.4H42V20H24v8h11.3C33.6 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 2.9l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.6z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 2.9l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.1 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35 26.9 36 24 36c-5.2 0-9.6-3.4-11.1-8.1l-6.6 5.1C9.6 39.6 16.3 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.4H42V20H24v8h11.3c-1.1 3-3.2 5.4-6 6.9l6.2 5.2C38.9 37 44 31.9 44 24c0-1.3-.1-2.3-.4-3.6z"
      />
    </Svg>
  );
}

