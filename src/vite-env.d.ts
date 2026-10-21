/// <reference types="vite/client" />

type AppEnvironment = 'development' | 'staging' | 'production'

interface ImportMetaEnv {
  readonly VITE_APP_ENV: AppEnvironment
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
