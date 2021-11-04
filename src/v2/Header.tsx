import { FunctionComponent } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import tw from 'twin.macro';

export const Header: FunctionComponent = () => {
  return (
    <header tw="relative bg-gradient-to-bl from-baby-powder to-celeste">
      <StaticImage
        css={tw`filter grayscale mix-blend-luminosity`}
        alt="Christian Rackerseder"
        src="../img/header-12.jpg"
        loading="eager"
      />
      <section tw="absolute top-0 w-full h-full flex flex-col justify-center items-start ml-12">
        <div tw="text-baby-powder font-jetbrains-mono flex flex-col bg-gray-600 bg-opacity-60 p-7 shadow rounded-xl">
          <h1 tw="text-5xl">Hello, I'm Christian</h1>
          <h2 tw="text-2xl mt-3">Full-Stack JavaScript Engineer</h2>
        </div>
      </section>
    </header>
  );
};
