import 'twin.macro';
import emotionStyled from '@emotion/styled';
import { css as emotionReactCss } from '@emotion/react';

declare module 'twin.macro' {
  const styled: typeof emotionStyled;
  const css: typeof emotionReactCss;
}
