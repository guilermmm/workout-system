// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
import withPWA from "next-pwa";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /* If trying out the experimental appDir, comment the i18n config out
   * @see https://github.com/vercel/next.js/issues/41980 */
  i18n: {
    locales: ["pt-BR"],
    defaultLocale: "pt-BR",
  },

  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default withPWA({ dest: "public" })(config);
