import { WebpackOverrideFn } from '@remotion/bundler';
import path from 'path';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      alias: {
        ...currentConfiguration.resolve?.alias,
        'remotion/ui-components': path.resolve(process.cwd(), 'remotion/ui-components/index.ts'),
        '@contentfork/remotion-runtime/components': path.resolve(process.cwd(), 'stubs/remotion-runtime-components.tsx'),
      },
    },
    module: {
      ...currentConfiguration.module,
      rules: [
        ...currentConfiguration.module?.rules || [],
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
  };
};
