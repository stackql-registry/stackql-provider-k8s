import {themes as prismThemes} from 'prism-react-renderer';
import { createConfig } from './.shared-config/index.js';
import { providerName, providerTitle } from './provider.js';

const config = createConfig({
  providerName,
  providerTitle,
  prismThemes,
  overrides: {
    // Docusaurus Faster (rspack + swc, via @docusaurus/faster) - not
    // strictly required at this site's page count, but kept for build
    // speed and consistency with the other provider microsites.
    future: {
      v4: true,
      faster: true,
    },
  },
});

// Use the locally vendored registry-branded logos (STACKQL>> | REGISTRY,
// matching the awscc microsite) instead of the shared config's hotlinked
// main-site wordmark - self-contained assets, no cross-origin fetch.
// global.css swaps in the -mobile variants below 996px.
const registryLogo = {
  alt: 'StackQL',
  href: '/',
  src: 'img/stackql-registry-logo.svg',
  srcDark: 'img/stackql-registry-logo-white.svg',
};
config.themeConfig.navbar.logo = { ...registryLogo };
config.themeConfig.footer.logo = { ...registryLogo };

export default config;
