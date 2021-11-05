import { FunctionComponent } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import tw from 'twin.macro';

export const Header: FunctionComponent = () => {
  return (
    <header tw="relative bg-gradient-to-b from-lemon-yellow-crayola to-celeste">
      <StaticImage
        css={tw`mix-blend-luminosity`}
        alt="Christian Rackerseder"
        src="../img/header-15.jpg"
        loading="eager"
        as="figure"
        layout="fullWidth"
        transformOptions={{
          grayscale: true,
        }}
      />
      <section tw="absolute top-0 w-full h-full flex flex-col justify-center items-center">
        <div tw="text-baby-powder font-jetbrains-mono flex flex-col bg-gray-700 bg-opacity-80 p-2 shadow rounded-xl sm:p-4 lg:p-7">
          <h1 tw="text-lg md:text-2xl lg:text-5xl">Hello, I'm Christian</h1>
          <h2 tw="text-sm md:text-lg lg:text-2xl mt-3">
            Full-Stack JavaScript Engineer
          </h2>
        </div>
      </section>
    </header>
  );
};
