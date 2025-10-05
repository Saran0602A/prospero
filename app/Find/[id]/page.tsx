'use client'

import React, { useEffect, useState, ChangeEvent } from 'react'
import { useParams } from 'next/navigation' // for dynamic route
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface Applicant {
  name?: string
  email?: string
  skills?: string
  phone?: string
  trusted_value?: number
  cover_letter?: string
  portfolio_url?: string
  status: string
}

interface Job {
  id: string
  title: string
  description?: string
  pay: number
  category: string
  location: string
  deadline: string
  status: 'open' | 'in_progress' | 'completed'
  applicants: Applicant[]
  created_at: string
}

export default function EmployerDashboard() {
  const params = useParams()
  const employerId = params?.id as string // dynamic employer ID from /Find/[id]
  const supabase = createClientComponentClient()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [graphData, setGraphData] = useState<{ category: string; avgSalary: number }[]>([])

  useEffect(() => {
    const fetchJobs = async () => {
      if (!employerId) return

      try {
        setLoading(true)

        const { data: jobsData, error } = await supabase
          .from('jobs')
          .select(`
            *,
            applications (
              worker_id,
              status,
              cover_letter,
              portfolio_url,
              users!inner (
                name,
                email,
                skills,
                phone,
                trust_score
              )
            )
          `)
          .eq('posted_by', employerId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const updatedJobs: Job[] = (jobsData || []).map(job => ({
          ...job,
          applicants: job.applications?.map((app: any) => ({
            name: app.users?.name,
            email: app.users?.email,
            skills: app.users?.skills?.join(', '),
            phone: app.users?.phone,
            trusted_value: app.users?.trust_score,
            cover_letter: app.cover_letter,
            portfolio_url: app.portfolio_url,
            status: app.status,
          })) || [],
        }))

        setJobs(updatedJobs)

        // Graph data
        const categoryMap: Record<string, { total: number; count: number }> = {}
        updatedJobs.forEach(job => {
          const cat = job.category || 'Other'
          if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 }
          categoryMap[cat].total += job.pay
          categoryMap[cat].count += 1
        })

        setGraphData(
          Object.keys(categoryMap).map(cat => ({
            category: cat,
            avgSalary: categoryMap[cat].count
              ? categoryMap[cat].total / categoryMap[cat].count
              : 0,
          }))
        )
      } catch (err) {
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [employerId]) // only refetch if employer ID changes

  if (loading) return <div className="text-center p-6">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-[#fca311]">Employer Dashboard</h1>

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-4 rounded shadow-md">
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p>
                  Pay: {job.pay} | Category: {job.category} | Status: {job.status}
                </p>
                <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Applicants Table */}
            {job.applicants?.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">Name</th>
                      <th className="border p-2">Email</th>
                      <th className="border p-2">Skills</th>
                      <th className="border p-2">Phone</th>
                      <th className="border p-2">Trusted Value</th>
                      <th className="border p-2">Cover Letter</th>
                      <th className="border p-2">Portfolio</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.applicants.map((app, idx) => (
                      <tr key={idx}>
                        <td className="border p-2">{app.name || '-'}</td>
                        <td className="border p-2">{app.email || '-'}</td>
                        <td className="border p-2">{app.skills || '-'}</td>
                        <td className="border p-2">{app.phone || '-'}</td>
                        <td className="border p-2">{app.trusted_value || 0}</td>
                        <td className="border p-2">{app.cover_letter || '-'}</td>
                        <td className="border p-2">
                          {app.portfolio_url ? (
                            <a
                              href={app.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              View
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="border p-2">{app.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Salary Graph */}
      {graphData.length > 0 && (
        <div className="bg-white p-6 rounded shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Average Salary by Category</h2>
          <BarChart width={600} height={300} data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgSalary" fill="#fca311" />
          </BarChart>
        </div>
      )}
    </div>
  )
}
