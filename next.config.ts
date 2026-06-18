import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import { codecovNextJSWebpackPlugin } from '@codecov/nextjs-webpack-plugin'
import createNextIntlPlugin from 'next-intl/plugin'
import withSerwist from '@serwist/next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const withSerwistConfig = withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
})

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: !!process.env.CODECOV_TOKEN,
        bundleName: 'miniyard',
        uploadToken: process.env.CODECOV_TOKEN,
        webpack: options.webpack,
      })
    )
    return config
  },
}

export default withSerwistConfig(withNextIntl(withSentryConfig(nextConfig, {
  org: 'hoferan',
  project: 'miniyard',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
})))
