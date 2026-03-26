import type { Job } from '../api/jobApi'
import { formatSalaryMan } from '../api/jobApi'

export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-gray-50">
      <h3 className="truncate text-sm font-semibold text-gray-900">{job.title}</h3>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">カテゴリ:</span>
          <span>{job.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">年収:</span>
          <span>{typeof job.salary === 'number' ? formatSalaryMan(job.salary) : '—'}</span>
        </div>
      </div>
    </article>
  )
}

