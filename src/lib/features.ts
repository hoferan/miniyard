export type Feature = {
  id: string
  title: string
  description: string
  defaultEnabled: boolean
}

export const FEATURES: Feature[] = [
  {
    id: 'tag-filter',
    title: 'Tag-based module filtering',
    description:
      'Adds tag chips to category pages. Click a tag to filter the module grid in real time. Active tag syncs with the URL so filtered views are bookmarkable.',
    defaultEnabled: false,
  },
]
