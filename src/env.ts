const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const

type AppEnvironment = (typeof APP_ENVIRONMENTS)[number]

function requireEnvironmentVariable(name: string, value: string | undefined) {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return normalizedValue
}

function parseAppEnvironment(value: string): AppEnvironment {
  if (APP_ENVIRONMENTS.some((environment) => environment === value)) {
    return value as AppEnvironment
  }

  throw new Error(
    `Invalid VITE_APP_ENV: ${value}. Expected one of: ${APP_ENVIRONMENTS.join(', ')}`,
  )
}

const appEnvironment = parseAppEnvironment(
  requireEnvironmentVariable('VITE_APP_ENV', import.meta.env.VITE_APP_ENV),
)

export const env = Object.freeze({
  appEnvironment,
  appTitle: requireEnvironmentVariable(
    'VITE_APP_TITLE',
    import.meta.env.VITE_APP_TITLE,
  ),
  apiBaseUrl: requireEnvironmentVariable(
    'VITE_API_BASE_URL',
    import.meta.env.VITE_API_BASE_URL,
  ),
  isProduction: appEnvironment === 'production',
})
