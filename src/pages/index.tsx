import 'modern-normalize';
import React from 'react';
import { css } from '@emotion/core';
import { Head } from '../components/Head';

const styles = css({
  color: 'blue',
});

export default () => (
  <>
    <Head />
    <div css={styles}>Hello World!</div>
  </>
);
