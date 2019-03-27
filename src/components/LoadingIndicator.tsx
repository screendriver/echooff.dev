import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { darkerWhite } from '../colors';

interface LoadingIndicatorProps {
  runTime: number;
}

interface IndicatorProps extends Pick<LoadingIndicatorProps, 'runTime'> {
  indicatorWidth: number;
}

const Indicator = styled.div(
  {
    height: 3,
    backgroundColor: darkerWhite,
    zIndex: 1,
    position: 'absolute',
    top: 0,
  },
  ({ indicatorWidth, runTime }: IndicatorProps) => ({
    width: `${indicatorWidth}%`,
    transition: `width ${runTime}ms linear`,
  }),
);

interface LoadingIndicatorProps {
  start: boolean;
  runTime: number;
}

export function LoadingIndicator(props: LoadingIndicatorProps) {
  const [width, setWidth] = useState(0);
  useEffect(() => setWidth(props.start ? 100 : 0), [props.start]);
  return props.start ? (
    <Indicator indicatorWidth={width} runTime={props.runTime} />
  ) : null;
}
