import React from 'react';
import Img, { FluidObject } from 'gatsby-image';
import sample from 'lodash.sample';
import styled from '@emotion/styled';
import { LinkButton } from './LinkButton';

interface HeaderProps {
  edges: [{ node: { childImageSharp: { fluid: FluidObject } } }];
}

interface HeaderState {
  fluid: FluidObject;
}

const HeaderStyled = styled.header({
  color: 'white',
  position: 'relative',
  '@media (max-width: 768px)': {
    textAlign: 'center',
  },
});

const ImgStyled = styled(Img)({
  height: 720,
  '@media (max-width: 768px)': {
    height: 380,
  },
});

const Intro = styled.div({
  position: 'absolute',
  top: '39%',
  marginLeft: '8%',
  '@media (max-width: 768px)': {
    top: '13%',
    marginLeft: 0,
  },
});

const Hello = styled.h1({
  fontSize: 60,
  fontWeight: 500,
  letterSpacing: -2,
  marginBottom: 25,
  '@media (max-width: 768px)': {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 10,
  },
});

const JobTitle = styled.h2({
  fontSize: 20,
  fontFamily: 'Lato, sans-serif',
  fontWeight: 'lighter',
  marginBottom: 40,
  '@media (max-width: 768px)': {
    fontSize: 14,
    marginBottom: 20,
  },
});

const Name = styled.span({
  fontWeight: 600,
});

export class Header extends React.Component<HeaderProps, HeaderState> {
  private timer?: number;

  public constructor(props: HeaderProps) {
    super(props);
    this.getRandomFluidImage = this.getRandomFluidImage.bind(this);
    this.state = {
      fluid: this.getRandomFluidImage(),
    };
  }

  public componentDidMount() {
    this.timer = window.setInterval(() => {
      this.setState({
        fluid: this.getRandomFluidImage(),
      });
    }, 20000);
  }

  public componentWillUnmount() {
    clearInterval(this.timer);
  }

  public render() {
    return (
      <HeaderStyled id="header">
        <ImgStyled fluid={this.state.fluid} />
        <Intro>
          <Hello>
            Hello, I'm <Name>Christian</Name>
          </Hello>
          <JobTitle>Full Stack JavaScript Engineer</JobTitle>
          <LinkButton href="#about">Learn more</LinkButton>
        </Intro>
      </HeaderStyled>
    );
  }

  private getRandomFluidImage() {
    const randomImage = sample(this.props.edges)!;
    return randomImage.node.childImageSharp.fluid;
  }
}
