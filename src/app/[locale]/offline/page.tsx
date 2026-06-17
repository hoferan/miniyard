import { getTranslations } from 'next-intl/server'

export default async function OfflinePage() {
  const t = await getTranslations('offline')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="max-w-sm text-muted-foreground">{t('description')}</p>
    </main>
  )
}
