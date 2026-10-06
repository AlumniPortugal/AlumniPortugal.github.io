/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  trailingSlash: true, // Pages serves /directory/ from directory/index.html
  images: { unoptimized: true },
  // If this repo is NOT named `AlumniPortugal.github.io`, add:
  // basePath: '/<repo-name>',
};
