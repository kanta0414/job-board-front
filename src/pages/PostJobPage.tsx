import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { fetchCategories, postJob, type JobCategory } from '../api/jobApi'

const DEFAULT_CATEGORIES: JobCategory[] = [
  '事務',
  'エンジニア',
  '営業',
  'マーケティング',
  'デザイン',
  '教育・講師',
  '医療・福祉',
  '保育士',
  '接客・販売',
  '物流・軽作業',
]

export default function PostJobPage() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<JobCategory[]>(DEFAULT_CATEGORIES)

  const [category, setCategory] = useState<JobCategory>(DEFAULT_CATEGORIES[0])
  const [salaryMan, setSalaryMan] = useState<string>('') // input value (万円)
  const [title, setTitle] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchCategories(controller.signal)
      .then((cats) => {
        if (cats.length > 0) setCategories(cats)
      })
      .catch(() => {
        // ignore and keep defaults
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0] ?? DEFAULT_CATEGORIES[0])
    }
  }, [categories, category])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalizedTitle = title.trim()
    if (!normalizedTitle) {
      setError('タイトルを入力してください。')
      return
    }

    const n = salaryMan.trim() ? Number(salaryMan) : undefined
    if (salaryMan.trim() && (!Number.isFinite(n) || (n as number) <= 0)) {
      setError('年収（万円）は正の数で入力してください。')
      return
    }

    setLoading(true)
    try {
      await postJob(
        {
          category,
          title: normalizedTitle,
          minSalaryMan: n,
          salaryMan: n,
        },
        undefined,
      )
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />

      <main className="mx-auto w-full max-w-[1126px] px-4 py-8">
        <div className="mx-auto w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-xl font-semibold text-gray-900">求人投稿</h1>
          <p className="mb-6 text-sm text-gray-600">
            条件は一覧ページの検索に反映されます（カテゴリと年収）。
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">求人カテゴリ</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">年収（万円）</label>
              <input
                type="number"
                inputMode="numeric"
                step={1}
                min={0}
                placeholder="例: 350"
                value={salaryMan}
                onChange={(e) => setSalaryMan(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">求人タイトル</label>
              <input
                type="text"
                placeholder="例: UI/UXデザイナー募集"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '投稿中...' : '投稿'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

