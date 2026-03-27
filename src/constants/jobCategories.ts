import type { JobCategory } from '../api/jobApi'

// Category order must match the reference UI screenshots.
export const JOB_CATEGORY_ORDER: JobCategory[] = [
  '事務',
  'エンジニア',
  '営業',
  'デザイン',
  'マーケティング',
  '財務・経理',
  '人事',
  'カスタマーサポート',
  '製造',
  '医療・介護',
]

export function sortJobCategories(input: JobCategory[]): JobCategory[] {
  const orderIndex = new Map(JOB_CATEGORY_ORDER.map((c, i) => [c, i] as const))
  const uniq = Array.from(new Set(input.map(String)))
  return uniq.sort((a, b) => {
    const ai = orderIndex.get(a)
    const bi = orderIndex.get(b)
    if (ai === undefined && bi === undefined) return a.localeCompare(b, 'ja')
    if (ai === undefined) return 1
    if (bi === undefined) return -1
    return ai - bi
  })
}

