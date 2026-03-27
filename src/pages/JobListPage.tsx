import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FiltersSidebar from '../components/FiltersSidebar'
import JobCard from '../components/JobCard'
import Pagination from '../components/Pagination'
import TopNav from '../components/TopNav'
import type { Job, JobCategory } from '../api/jobApi'
import { fetchCategories, fetchJobs } from '../api/jobApi'
import { JOB_CATEGORY_ORDER, sortJobCategories } from '../constants/jobCategories'

const DEFAULT_CATEGORIES: JobCategory[] = JOB_CATEGORY_ORDER

const SALARY_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: '指定なし' },
  { value: 300, label: '300万円以上' },
  { value: 350, label: '350万円以上' },
  { value: 400, label: '400万円以上' },
  { value: 450, label: '450万円以上' },
  { value: 500, label: '500万円以上' },
  { value: 550, label: '550万円以上' },
  { value: 600, label: '600万円以上' },
  { value: 650, label: '650万円以上' },
  { value: 700, label: '700万円以上' },
]

function parseCategoriesParam(searchParams: URLSearchParams): JobCategory[] {
  const raw = searchParams.get('categories') ?? searchParams.get('category')
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseMinSalaryParam(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get('minSalary') ?? searchParams.get('min_salary') ?? searchParams.get('salaryMin')
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

function parsePageParam(searchParams: URLSearchParams): number {
  const raw = searchParams.get('page')
  const n = raw ? Number(raw) : 1
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [categories, setCategories] = useState<JobCategory[]>(DEFAULT_CATEGORIES)
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const selectedCategories = useMemo(() => parseCategoriesParam(searchParams), [searchParams])
  const minSalaryOption = useMemo(() => parseMinSalaryParam(searchParams), [searchParams])
  const page = useMemo(() => parsePageParam(searchParams), [searchParams])

  const [jobs, setJobs] = useState<Job[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setCategoriesLoading(true)
      try {
        const cats = await fetchCategories(controller.signal)
        if (cats.length > 0) setCategories(sortJobCategories(cats))
      } catch {
        // keep defaults if backend doesn't support categories endpoint
      } finally {
        setCategoriesLoading(false)
      }
    })()

    return () => controller.abort()
  }, [])

  const onToggleCategory = (cat: JobCategory) => {
    const next = new URLSearchParams(searchParams)
    const current = parseCategoriesParam(searchParams)
    const exists = current.includes(cat)
    const updated = exists ? current.filter((c) => c !== cat) : [...current, cat]
    next.set('categories', updated.join(','))
    next.delete('category')
    next.set('page', '1')
    setSearchParams(next, { replace: true })
  }

  const onMinSalaryChange = (value: number | null) => {
    const next = new URLSearchParams(searchParams)
    if (value === null) next.delete('minSalary')
    else next.set('minSalary', String(value))
    next.set('page', '1')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const res = await fetchJobs({
          categories: selectedCategories,
          minSalaryMan: minSalaryOption ?? undefined,
          page,
          perPage: 10,
          signal: controller.signal,
        })
        setJobs(res.jobs)
        setTotalPages(res.totalPages)
      } catch (e) {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : String(e))
        setJobs([])
        setTotalPages(1)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [selectedCategories, minSalaryOption, page])

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <main className="px-0 py-0">
        <div className="flex items-stretch gap-0">
          <FiltersSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={onToggleCategory}
            minSalaryOption={minSalaryOption}
            salaryOptions={SALARY_OPTIONS}
            onMinSalaryChange={onMinSalaryChange}
          />

          <section className="min-w-0 flex-1 bg-white px-6 py-5">
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-gray-900">求人一覧</h1>
              <div className="mt-1 text-xs text-gray-600">
                総件数: {jobs.length}件
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                条件に一致する求人がありません。
                {/* <p>{jobs.length}</p> */}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={String(job.id)} job={job} />
                ))}
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) => {
                const next = new URLSearchParams(searchParams)
                next.set('page', String(nextPage))
                setSearchParams(next, { replace: true })
              }}
            />

            {categoriesLoading && (
              <div className="mt-3 text-xs text-gray-500">カテゴリはバックエンドから取得しています...</div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

