import React from 'react';
import Img, { FluidObject } from 'gatsby-image';
import sample from 'lodash.sample';

interface HeaderProps {
  edges: [{ node: { childImageSharp: { fluid: FluidObject } } }];
}

interface HeaderState {
  fluid: FluidObject;
}

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
      <header>
        <Img fluid={this.state.fluid} />
      </header>
    );
  }

  private getRandomFluidImage() {
    const randomImage = sample(this.props.edges)!;
    return randomImage.node.childImageSharp.fluid;
  }
}
