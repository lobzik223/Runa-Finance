import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function AppleIcon(props: Readonly<{ size?: number; color?: string }>) {
  const size = props.size ?? 20;
  const color = props.color ?? '#FFFFFF';

  // Simple Apple mark (vector path). Kept small for production buttons.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M16.7 1.8c-1 .1-2.1.7-2.8 1.5-.7.8-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4.7-.8 1.2-2 1-3.1zM20.4 17.1c-.5 1.1-.7 1.6-1.3 2.5-.9 1.3-2.2 3-3.8 3-1.5 0-1.9-1-3.8-1-1.9 0-2.4 1-3.8 1-1.6 0-2.9-1.5-3.8-2.8-2.1-3.1-2.4-6.7-1-8.8 1-1.6 2.6-2.5 4.1-2.5 1.6 0 2.6 1 3.8 1 1.1 0 2.7-1.2 4.6-1 .8 0 3 .3 4.4 2.3-3.9 2.1-3.3 7.8.6 9.3z"
      />
    </Svg>
  );
}

