'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { MdClose, MdCheckCircle, MdCancel, MdAttachMoney, MdLocationOn, MdLink, MdAccountCircle } from 'react-icons/md'
import { formatDistanceToNow, parseISO } from 'date-fns'

// --- Supabase and Constants ---
const supabase = createClientComponentClient()
const PRIMARY_HEX = '#fca311'
const GRAPH_COLORS = [PRIMARY_HEX, '#14213d', '#4F46E5', '#10B981']

// --- Type Definitions for Data Structure (Crucial for TypeScript) ---

type UserRole = 'worker' | 'employer' | null
type ApplicationStatus = 'applied' | 'accepted' | 'rejected'

interface WorkerProfile {
  id: string
  name: string
  email: string
  rating: number | null
  trust_score: number | null
}

interface Application {
  id: number
  job_id: number
  worker_id: string
  status: ApplicationStatus
  cover_letter: string | null
  portfolio_url: string | null
  created_at: string
  worker?: WorkerProfile // Worker details are included when fetched by employer
  job?: { id: number; title: string; pay: number; description: string; location: string } // Job details are included when fetched by worker
  job_title?: string // Flattened for worker dashboard
  job_pay?: number // Flattened for worker dashboard
  job_location?: string // Flattened for worker dashboard
}

interface Job {
  id: number
  title: string
  pay: number
  status: 'open' | 'in_progress' | 'completed'
  posted_by: string
  location: string
  applicants?: Application[] // Applications linked to this job
}

interface CurrentUser {
  id: string
  role: UserRole
}

// --- Typography/Style Constants ---
const ProsperoHeading = 'text-3xl font-extrabold tracking-tight text-gray-900'
const ProsperoSubHeading = 'text-xl font-bold tracking-tight text-gray-800'

// --- 1. Job Applications Management Component (Employer Action Center) ---
function ApplicationCard({ app, onUpdateStatus }: { app: Application; onUpdateStatus: (app: Application, newStatus: ApplicationStatus) => void }) {
  const isApplied = app.status === 'applied'
  const statusColor = app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-amber-600'

  const worker = app.worker as WorkerProfile | undefined

  return (
    <motion.div
      className={`p-4 rounded-xl border-2 shadow-sm ${isApplied ? 'border-amber-300 bg-amber-50' : 'bg-white border-gray-100'} transition-all duration-300 hover:shadow-lg`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start border-b pb-2 mb-2">
        <div>
          <h3 className="font-extrabold text-lg text-gray-900">{worker?.name || 'Worker'}</h3>
          <p className="text-xs text-gray-500">{worker?.email}</p>
        </div>
        <span className={`font-bold text-sm ${statusColor}`}>{app.status.toUpperCase()}</span>
      </div>

      <p className="text-sm my-3">
        **Motivation:** {app.cover_letter || 'No cover letter provided.'}
      </p>
      {app.portfolio_url && (
        <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline flex items-center">
          <MdLink className="mr-1" /> View Portfolio
        </a>
      )}

      <div className="text-xs text-gray-600 mt-2">
        <p>Rating: {worker?.rating || 'N/A'} | Trust: {worker?.trust_score || 'N/A'}</p>
      </div>

      {isApplied && (
        <div className="flex space-x-3 mt-4 border-t pt-3">
          <motion.button
            onClick={() => onUpdateStatus(app, 'accepted')}
            className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700"
            whileTap={{ scale: 0.98 }}
          >
            <MdCheckCircle className="inline mr-1" /> Approve
          </motion.button>
          <motion.button
            onClick={() => onUpdateStatus(app, 'rejected')}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700"
            whileTap={{ scale: 0.98 }}
          >
            <MdCancel className="inline mr-1" /> Reject
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

// --- Worker Dashboard View ---
function WorkerDashboard({ applications, avgPay }: { applications: Application[]; avgPay: string }) {
  const totalApplications = applications.length
  const acceptedCount = applications.filter(a => a.status === 'accepted').length

  return (
    <div className="p-6 max-w-7xl mx-auto bg-stone-50 min-h-screen">
      <h1 className={`${ProsperoHeading} mb-8`} style={{ color: PRIMARY_HEX }}>My Prosperity Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metrics Cards */}
        <motion.div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-amber-500" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
          <h2 className="font-bold text-gray-600 text-sm">Total Applications Sent</h2>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalApplications}</p>
        </motion.div>
        <motion.div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-500" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
          <h2 className="font-bold text-gray-600 text-sm">Accepted Roles</h2>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{acceptedCount}</p>
        </motion.div>
        <motion.div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-blue-500" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
          <h2 className="font-bold text-gray-600 text-sm">Avg Pay of Applied Jobs</h2>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">${avgPay}</p>
        </motion.div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h2 className="font-semibold mb-3 text-black text-lg">My Application History</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-gray-800 text-left">Job Title</th>
                <th className="border border-gray-300 px-3 py-2 text-gray-800">Status</th>
                <th className="border border-gray-300 px-3 py-2 text-gray-800">Date Applied</th>
                <th className="border border-gray-300 px-3 py-2 text-gray-800">Pay</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} className={`text-center ${app.status === 'accepted' ? 'bg-green-50' : app.status === 'rejected' ? 'bg-red-50' : 'bg-amber-50'} text-gray-700`}>
                  <td className="border border-gray-300 px-3 py-2 font-medium text-left">{app.job_title}</td>
                  <td className={`border border-gray-300 px-3 py-2 font-bold ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                    {app.status.toUpperCase()}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">{formatDistanceToNow(parseISO(app.created_at))} ago</td>
                  <td className="border border-gray-300 px-3 py-2">${app.job_pay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// --- Employer Dashboard View (Refactored DesktopDashboard) ---
interface EmployerDashboardProps {
  jobs: Job[]
  selectedJob: Job | null
  handleUpdateStatus: (app: Application, newStatus: ApplicationStatus) => void
  setSelectedJob: (job: Job | null) => void
  statusData: { name: string; value: number }[]
  applicationsData: { name: string; applicants: number }[]
  avgPay: string
  renderJobTable: () => JSX.Element
  renderCityPay: () => JSX.Element
  ProsperoHeading: string
  PRIMARY_HEX: string
  GRAPH_COLORS: string[]
}

function EmployerDashboard({ jobs, selectedJob, handleUpdateStatus, setSelectedJob, statusData, applicationsData, avgPay, renderJobTable, renderCityPay, ProsperoHeading, PRIMARY_HEX, GRAPH_COLORS }: EmployerDashboardProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-stone-50 min-h-screen">
      <h1 className={`${ProsperoHeading} mb-8`} style={{ color: PRIMARY_HEX }}>Employer Analytics Dashboard</h1>

      {selectedJob ? (
        // Application Management View
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-2xl font-bold mb-4`}>Managing: {selectedJob.title}</h2>
          <button
            onClick={() => setSelectedJob(null)}
            className="text-gray-600 hover:text-gray-900 transition underline mb-6"
          >
            &larr; Back to Dashboard Overview
          </button>
          <div className="space-y-4">
            {selectedJob.applicants?.map(app => (
              <ApplicationCard
                key={app.id}
                app={app}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
            {(selectedJob.applicants?.length || 0) === 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-center text-gray-600">No applications received yet for this role.</p></div>
            )}
          </div>
        </div>
      ) : (
        // Overview Dashboard
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Metrics Cards */}
            <motion.div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-amber-500" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <h2 className="font-bold text-gray-600 text-sm">Total Jobs Posted</h2>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{jobs.length}</p>
            </motion.div>
            <motion.div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-500" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <h2 className="font-bold text-gray-600 text-sm">Average Pay (Hourly/Unit)</h2>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">${avgPay}</p>
            </motion.div>
            <motion.div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-blue-500" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <h2 className="font-bold text-gray-600 text-sm">Total Applicants</h2>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{jobs.reduce((acc, j) => acc + (j.applicants?.length || 0), 0)}</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart 1: Job Status Pie */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 col-span-1">
              <h2 className="font-semibold mb-2 text-black text-lg">Job Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {statusData.map((entry, index) => <Cell key={index} fill={GRAPH_COLORS[index % GRAPH_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #fca311', color: '#000' }} />
                  <Legend wrapperStyle={{ color: '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Applications Bar Chart */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 col-span-2">
              <h2 className="font-semibold mb-2 text-black text-lg">Applications Received per Role</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid stroke="#f1f1f1" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#000', fontSize: 12 }} angle={-15} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fill: '#000' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #fca311', color: '#000' }} />
                  <Legend wrapperStyle={{ color: '#000' }} />
                  <Bar dataKey="applicants" fill={PRIMARY_HEX} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table for All Jobs (Clickable to Manage) */}
            <div className="col-span-2">
              {renderJobTable()}
            </div>
            {/* City Pay Statistics */}
            <div className="col-span-1">
              {renderCityPay()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// --- Mobile Dashboard (Combined Mobile View) ---
interface MobileDashboardProps {
  jobs: Job[]
  selectedJob: Job | null
  setSelectedJob: (job: Job | null) => void
  handleUpdateStatus: (app: Application, newStatus: ApplicationStatus) => void
  renderCityPay: () => JSX.Element
  avgPay: string
  PRIMARY_HEX: string
  currentUserRole: UserRole
  applications: Application[]
}

function MobileDashboard({ jobs, selectedJob, setSelectedJob, handleUpdateStatus, renderCityPay, avgPay, PRIMARY_HEX, currentUserRole, applications }: MobileDashboardProps) {

  if (currentUserRole === 'worker') {
    return (
      <div className="p-4 bg-stone-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6" style={{ color: PRIMARY_HEX }}>My Applications</h1>
        <WorkerDashboard applications={applications} avgPay={avgPay} />
      </div>
    )
  }

  // Employer Mobile View
  if (selectedJob) {
    // Mobile Management View
    return (
      <div className="p-4 bg-stone-50 min-h-screen">
        <h2 className={`text-xl font-bold mb-4`} style={{ color: PRIMARY_HEX }}>Managing: {selectedJob.title}</h2>
        <button
          onClick={() => setSelectedJob(null)}
          className="text-gray-600 hover:text-gray-900 transition underline mb-4"
        >
          &larr; Back to Job List
        </button>
        <div className="space-y-4">
          {selectedJob.applicants?.map(app => (
            <ApplicationCard
              key={app.id}
              app={app}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
          {(selectedJob.applicants?.length || 0) === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-center text-gray-600">No applications received yet for this role.</p></div>
          )}
        </div>
      </div>
    )
  }

  // Mobile Job List (Employer's Main Mobile View)
  return (
    <div className="p-4 bg-stone-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6" style={{ color: PRIMARY_HEX }}>Employer Overview</h1>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg shadow border border-amber-500">
            <h3 className="font-bold text-gray-600 text-xs">Total Jobs</h3>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{jobs.length}</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow border border-green-500">
            <h3 className="font-bold text-gray-600 text-xs">Avg Pay</h3>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">${avgPay}</p>
          </div>
        </div>

        {jobs.map(job => (
          <motion.div
            key={job.id}
            className="p-4 rounded-xl shadow-lg border border-gray-200 bg-white"
            onClick={() => setSelectedJob(job)}
            whileTap={{ scale: 0.98 }}
            style={{ borderLeft: `5px solid ${PRIMARY_HEX}` }}
          >
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-bold text-lg">{job.title}</h2>
              <span className="text-sm font-semibold">{job.status}</span>
            </div>
            <p className="text-sm text-gray-600"><span className="font-bold">Apps:</span> {job.applicants?.length || 0}</p>
            <p className="text-sm text-gray-600"><span className="font-bold">Pay:</span> ${job.pay}</p>
            <p className="text-sm text-blue-500 mt-2 underline">Tap to Manage & View Applicants</p>
          </motion.div>
        ))}

        <div className="mt-8">{renderCityPay()}</div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function DashboardPage() {
  const router = useRouter()
  // FIX: Removed `id` from `useParams()` since we use the session ID.
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [jobs, setJobs] = useState<Job[]>([]) // Employer Jobs
  const [applications, setApplications] = useState<Application[]>([]) // Worker Applications
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // --- Core Data Fetcher based on User Role (FIXED) ---
  const fetchDashboardData = async () => {
    setLoading(true)
    let userRole: UserRole = null
    let userId: string | null = null
    let dashboardData: any[] = []
    let workerApps: Application[] = []

    // 1. Get the authenticated user's session ID (THE FIX)
    const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !authUser) {
      console.error('Authentication Error: No active session found.', sessionError?.message)
      // Redirect unauthenticated user to signin
      router.replace('/Signin')
      setLoading(false)
      return
    }

    userId = authUser.id

    // 2. Fetch User Profile (to get role and check if profile exists)
    const { data: userProfile, error: profileError } = await supabase
      .from('users') // Assuming your profile table is named 'users'
      .select('id, role')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError?.message || 'User profile not found in DB.')
      // This is a critical error: user is logged in but has no profile record
      // You might want to force them back to complete signup/profile creation
      setLoading(false)
      return
    }

    userRole = userProfile.role
    setCurrentUser({ id: userId, role: userRole })

    // 3. Fetch Role-Specific Data
    if (userRole === 'employer') {
      // --- EMPLOYER VIEW FETCH ---
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', userId)
        .order('created_at', { ascending: false })

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError.message)
        setLoading(false)
        return
      }

      const jobIds = jobsData.map(j => j.id)
      const { data: appsData } = await supabase
        .from('applications')
        .select(`*, worker:worker_id(id, name, email, rating, trust_score)`)
        .in('job_id', jobIds)

      dashboardData = jobsData.map(job => ({
        ...job,
        applicants: appsData?.filter(a => a.job_id === job.id) || []
      })) as Job[]
      setJobs(dashboardData)

    } else if (userRole === 'worker') {
      // --- WORKER VIEW FETCH ---
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        // Using `job_id(*)` to fetch all columns from the jobs table for the join
        .select(`*, job:job_id(id, title, pay, description, location)`) 
        .eq('worker_id', userId)
        .order('created_at', { ascending: false })

      if (appsError) {
        console.error('Error fetching worker applications:', appsError.message)
        setLoading(false)
        return
      }

      workerApps = appsData.map(app => {
        const jobDetails = app.job || {}
        return {
          ...app,
          job_title: jobDetails.title,
          job_pay: jobDetails.pay,
          job_location: jobDetails.location,
        }
      }) as Application[]
      setApplications(workerApps)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, []) // Removed dependency on `id` from useParams

  // --- Utility Functions (Shared between components) ---

  const { statusData, applicationsData, avgPay, cityPayData } = useMemo(() => {
    // Worker Aggregation
    if (currentUser?.role === 'worker') {
      const totalPay = applications.reduce((acc, app) => acc + Number(app.job_pay || 0), 0)
      const avgPay = applications.length > 0 ? (totalPay / applications.length).toFixed(2) : '0.00'

      const payMap = applications.reduce((acc: any, app: any) => {
        const location = app.job_location || 'Unknown'
        acc[location] = acc[location] || { sum: 0, count: 0 }
        acc[location].sum += Number(app.job_pay || 0)
        acc[location].count += 1
        return acc
      }, {})

      const cityPayData = Object.entries(payMap).map(([location, data]: [string, any]) => ({
        location,
        avgPay: Math.round(data.sum / data.count)
      }))

      return {
        statusData: [],
        applicationsData: [],
        avgPay,
        cityPayData
      }
    }

    // Employer Aggregation Logic
    const statusData = [
      { name: 'Open', value: jobs.filter(j => j.status === 'open').length },
      { name: 'In Progress', value: jobs.filter(j => j.status === 'in_progress').length },
      { name: 'Completed', value: jobs.filter(j => j.status === 'completed').length },
    ]
    const applicationsData = jobs.map(j => ({
      name: j.title,
      applicants: j.applicants?.length || 0
    }))

    const totalPay = jobs.reduce((acc, j) => acc + Number(j.pay), 0)
    const avgPay = jobs.length > 0 ? (totalPay / jobs.length).toFixed(2) : '0.00'

    const payMap = jobs.reduce((acc: any, job: Job) => {
      const location = job.location || 'Unknown'
      acc[location] = acc[location] || { sum: 0, count: 0 }
      acc[location].sum += Number(job.pay)
      acc[location].count += 1
      return acc
    }, {})

    const cityPayData = Object.entries(payMap).map(([location, data]: [string, any]) => ({
      location,
      avgPay: Math.round(data.sum / data.count)
    }))

    return { statusData, applicationsData, avgPay, cityPayData }
  }, [jobs, applications, currentUser?.role])


  const renderCityPay = () => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="font-semibold mb-3 text-black text-lg flex items-center">
        <MdLocationOn className="mr-2" style={{ color: PRIMARY_HEX }} /> Average Pay by Location
      </h2>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {cityPayData.length === 0 ? (
          <p className="text-sm text-gray-500">No location data available.</p>
        ) : (
          cityPayData
            .sort((a, b) => b.avgPay - a.avgPay)
            .map((data, i) => (
              <div key={i} className="flex justify-between items-center text-sm font-medium border-b border-dashed pb-1">
                <span className="text-gray-700">{data.location}</span>
                <span className="font-bold text-green-700">${data.avgPay}/hr</span>
              </div>
            ))
        )}
      </div>
    </div>
  )

  const renderJobTable = () => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="font-semibold mb-2 text-black text-lg">All Posted Jobs</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-gray-800">Title</th>
              <th className="border border-gray-300 px-3 py-2 text-gray-800">Status</th>
              <th className="border border-gray-300 px-3 py-2 text-gray-800">Applicants</th>
              <th className="border border-gray-300 px-3 py-2 text-gray-800">Pay</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="text-center text-gray-700 hover:bg-amber-50 cursor-pointer"
                onClick={() => setSelectedJob(job)}>
                <td className="border border-gray-300 px-3 py-2 font-medium">{job.title}</td>
                <td className="border border-gray-300 px-3 py-2">{job.status}</td>
                <td className="border border-gray-300 px-3 py-2 font-bold">{job.applicants?.length || 0}</td>
                <td className="border border-gray-300 px-3 py-2">${job.pay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const handleUpdateStatus = async (app: Application, newStatus: ApplicationStatus) => {
    // 1. Update DB application status
    const { error: appError } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', app.id)

    if (appError) {
      console.error("Failed to update status:", appError)
      alert("Failed to update status: " + appError.message)
      return
    }

    alert(`Status updated to ${newStatus.toUpperCase()}.`)

    // 2. Refresh job data to update UI instantly
    fetchDashboardData()
  }

  // --- Loading and Error States ---

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-center text-xl font-medium text-gray-700 flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading your dashboard data...
      </p>
    </div>
  )

  if (!currentUser) return (
    <div className="text-center mt-20 text-red-600">
      <p className='text-lg'>Authentication Error: Redirecting to Sign In.</p>
    </div>
  )

  // --- Main Render Switch ---

  if (currentUser.role === 'worker') {
    return isMobile
      ? <MobileDashboard
        jobs={[]} // Empty for worker
        applications={applications}
        currentUserRole={currentUser.role}
        avgPay={avgPay}
        renderCityPay={renderCityPay}
        selectedJob={null} // Not applicable
        setSelectedJob={() => { }} // Not applicable
        handleUpdateStatus={() => { }} // Not applicable
        PRIMARY_HEX={PRIMARY_HEX}
      />
      : <WorkerDashboard applications={applications} avgPay={avgPay} />
  }

  // Employer Render
  return isMobile
    ? <MobileDashboard
      jobs={jobs}
      applications={[]} // Empty for employer
      currentUserRole={currentUser.role}
      selectedJob={selectedJob}
      setSelectedJob={setSelectedJob}
      handleUpdateStatus={handleUpdateStatus}
      renderCityPay={renderCityPay}
      avgPay={avgPay}
      PRIMARY_HEX={PRIMARY_HEX}
    />
    : <EmployerDashboard
      jobs={jobs}
      selectedJob={selectedJob}
      setSelectedJob={setSelectedJob}
      handleUpdateStatus={handleUpdateStatus}
      statusData={statusData}
      applicationsData={applicationsData}
      avgPay={avgPay}
      renderJobTable={renderJobTable}
      renderCityPay={renderCityPay}
      ProsperoHeading={ProsperoHeading}
      PRIMARY_HEX={PRIMARY_HEX}
      GRAPH_COLORS={GRAPH_COLORS}
    />
}