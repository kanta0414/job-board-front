export type Job = {
  id: string | number
  title: string
  category: string
  salary?: number
  company?: string
  location?: string
  createdAt?: string
}

export type JobCategory = string

export type JobsQuery = {
  categories: JobCategory[]
  minSalaryMan?: number
  page?: number
  perPage?: number
  signal?: AbortSignal
}

export type JobsResult = {
  jobs: Job[]
  page: number
  perPage: number
  totalPages: number
  totalCount?: number
}

export type PostJobPayload = {
  category: JobCategory
  minSalaryMan?: number
  salaryMan?: number
  title: string
}

//const API_BASE_URL = 'http://localhost:3000'
const DEFAULT_PER_PAGE = 10

async function requestJson(url: string, init: RequestInit) {
  const res = await fetch(url, init)
  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  let bodyText = ''
  try {
    bodyText = await res.text()
  } catch {
    // ignore
  }

  let body: unknown = undefined
  if (isJson && bodyText) {
    try {
      body = JSON.parse(bodyText)
    } catch {
      body = undefined
    }
  } else if (!isJson && bodyText) {
    body = bodyText
  }

  if (!res.ok) {
    const maybeMessage =
      typeof body === 'object' && body !== null
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (body as any).message ?? (body as any).error
        : undefined
    const message = maybeMessage
      ? String(maybeMessage)
      : res.statusText || `Request failed (${res.status})`
    throw new Error(message)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return body as any
}

function normalizeCategories(raw: unknown): JobCategory[] {
  if (Array.isArray(raw)) return raw.map(String)
  if (raw && typeof raw === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = raw as any
    if (Array.isArray(r.categories)) return r.categories.map(String)
    if (Array.isArray(r.data)) return r.data.map(String)
  }
  return []
}

function normalizeJobsResponse(raw: unknown, fallbackPage: number, fallbackPerPage: number): JobsResult {
  if (!raw || typeof raw !== 'object') {
    return { jobs: [], page: fallbackPage, perPage: fallbackPerPage, totalPages: 1 }
  }

  type AnyRecord = Record<string, unknown>
  const r = raw as AnyRecord

  const jobsRaw = r.jobs ?? r.items ?? r.data ?? []
  const jobsArr = Array.isArray(jobsRaw) ? jobsRaw : []

  const readString = (v: unknown) => (typeof v === 'string' ? v : undefined)
  const readNumber = (v: unknown) => {
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string') {
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }

  const jobs = jobsArr
    .map((j) => {
      if (!j || typeof j !== 'object') {
        return {
          id: '',
          title: '',
          category: '',
          salary: undefined,
          company: undefined,
          location: undefined,
          createdAt: undefined,
        } satisfies Job
      }
      const jo = j as AnyRecord
      return {
        id: readString(jo.id) ?? readNumber(jo.id) ?? readString(jo._id) ?? readNumber(jo._id) ?? '',
        title: readString(jo.title) ?? readString(jo.name) ?? '',
        category: readString(jo.category) ?? readString(jo.jobCategory) ?? readString(jo.type) ?? '',
        salary:
          readNumber(jo.salary) ??
          readNumber(jo.minSalary) ??
          readNumber(jo.expectedSalary),
        company: readString(jo.company),
        location: readString(jo.location) ?? readString(jo.area),
        createdAt: readString(jo.createdAt) ?? readString(jo.created_at),
      } satisfies Job
    })
    .filter((job) => job.title !== '' || job.category !== '')

  const pageCandidate = readNumber(r.page ?? r.currentPage) ?? fallbackPage
  const page = pageCandidate > 0 ? pageCandidate : fallbackPage

  const perPage = readNumber(r.perPage ?? r.limit ?? r.pageSize) ?? fallbackPerPage

  const readNestedTotal = (obj: unknown): number | undefined => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined
    const o = obj as Record<string, unknown>
    return readNumber(o.totalCount ?? o.total ?? o.count ?? o.totalRecords)
  }

  const totalCount =
    readNumber(r.totalCount ?? r.total ?? r.count ?? r.totalRecords) ??
    readNestedTotal(r.meta) ??
    readNestedTotal(r.data)

  const totalPagesCandidate = readNumber(r.totalPages ?? r.pageCount)
  const totalPages =
    totalPagesCandidate && totalPagesCandidate > 0
      ? totalPagesCandidate
      : totalCount && perPage
        ? Math.ceil(totalCount / perPage)
        : 1

  return {
    jobs,
    page,
    perPage,
    totalPages,
    totalCount: typeof totalCount === 'number' ? totalCount : undefined,
  }
}

async function fetchWithFallback<T>(
  paths: string[], 
  buildInit: (path: string) => { url: string; init: RequestInit }
): Promise<T> {
  let lastError: unknown = null
  for (const path of paths) {
    const { url, init } = buildInit(path)
    try {
      const res = await requestJson(url, init)
      return res as T
    } catch (err) {
      lastError = err
      const message = err instanceof Error ? err.message : String(err)
      if (!message || message.includes('404') || message.toLowerCase().includes('not found')) continue
      break
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed')
}

export async function fetchCategories(signal?: AbortSignal): Promise<JobCategory[]> {
  // /api/categories を優先
  const paths = ['/api/categories', '/categories']
  const raw = await fetchWithFallback<unknown[]>(paths, (path) => ({
    url: `${import.meta.env.VITE_API_URL}${path}`,               // ← ここが重要：相対パスのまま
    init: { method: 'GET', signal }
  }))
  return normalizeCategories(raw)
}

export async function fetchJobs(query: JobsQuery): Promise<JobsResult> {
  const {
    categories,
    minSalaryMan,
    page = 1,
    perPage = DEFAULT_PER_PAGE,
    signal,
  } = query

  const categoriesCsv = categories.join(',')

  // /api/jobs を優先
  const paths = ['/api/jobs', '/jobs', '/api/job-search', '/jobs/search']

  const raw = await fetchWithFallback<unknown>(paths, (path) => {
    const url = new URL(path, import.meta.env.VITE_API_URL)  // 相対パスを安全に絶対URL化（Vite内では5173になる）
    const params = new URLSearchParams()

    if (categoriesCsv) {
      params.set('categories', categoriesCsv)
    }
    if (typeof minSalaryMan === 'number' && !Number.isNaN(minSalaryMan)) {
      params.set('minSalary', String(minSalaryMan))
    }

    params.set('page', String(page))
    params.set('perPage', String(perPage))
    params.set('limit', String(perPage))

    url.search = params.toString()

    return {
      url: url.toString(),
      init: { method: 'GET', signal },
    }
  })

  return normalizeJobsResponse(raw, page, perPage)
}

export async function postJob(payload: PostJobPayload, signal?: AbortSignal): Promise<void> {
  const paths = ['/api/jobs', '/jobs']

  await fetchWithFallback<void>(paths, (path) => {
    const url = new URL(path, import.meta.env.VITE_API_URL)  // ← ここも修正
    const body = {
      category: payload.category,
      title: payload.title,
      salary: payload.minSalaryMan ?? payload.salaryMan,
      // 必要に応じて他のフィールド
    }

    return {
      url: url.toString(),
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      },
    }
  })
}
export function formatSalaryMan(salary?: number): string {
  if (typeof salary !== 'number' || Number.isNaN(salary)) return ''
  // If backend returns yen, convert to "万円".
  const man = salary > 1_000_000 ? Math.floor(salary / 10_000) : salary
  return `${man}万円`
}

