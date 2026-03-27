import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { fetchCategories, postJob, type JobCategory } from '../api/jobApi'
import { JOB_CATEGORY_ORDER, sortJobCategories } from '../constants/jobCategories'

const DEFAULT_CATEGORIES: JobCategory[] = JOB_CATEGORY_ORDER

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
        if (cats.length > 0) setCategories(sortJobCategories(cats))
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
    <div className="min-h-screen bg-white">
      <TopNav />

      <main className="px-6 py-6">
        <div className="max-w-[860px]">
          <h1 className="mb-6 text-lg font-semibold text-gray-900">求人投稿</h1>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">求人カテゴリ選択</label>
              <select
                className="w-[420px] max-w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
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
              <label className="mb-2 block text-sm font-semibold text-gray-900">年収（万円）</label>
              <input
                type="number"
                inputMode="numeric"
                step={1}
                min={0}
                value={salaryMan}
                onChange={(e) => setSalaryMan(e.target.value)}
                className="w-[420px] max-w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">求人タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-[220px] rounded bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '投稿中...' : '投稿'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

