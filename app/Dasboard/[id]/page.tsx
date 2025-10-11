'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation' // FIX: Added useRouter
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
import { motion } from 'framer-motion';
import { MdClose, MdCheckCircle, MdCancel, MdAttachMoney, MdLocationOn, MdLink, MdAccountCircle } from 'react-icons/md'; 
import { formatDistanceToNow, parseISO } from 'date-fns'; // Added for worker dashboard

const supabase = createClientComponentClient()
const PRIMARY_HEX = '#fca311';
// Custom color palette matching the theme for graph clarity
const GRAPH_COLORS = [PRIMARY_HEX, '#14213d', '#4F46E5', '#10B981']; 

// --- Typography/Style Constants (FIXED SCOPE) ---
const ProsperoHeading = "text-3xl font-extrabold tracking-tight text-gray-900";
const ProsperoSubHeading = "text-xl font-bold tracking-tight text-gray-800";
const ProsperoBody = "text-base text-gray-700 leading-normal";


// --- 1. Job Applications Management Component (Employer Action Center) ---
function ApplicationCard({ app, jobTitle, onUpdateStatus }: any) {
    const isApplied = app.status === 'applied';
    const statusColor = app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-amber-600';

    return (
        <motion.div
            className={`p-4 rounded-xl border-2 shadow-sm ${isApplied ? 'border-amber-300 bg-amber-50' : 'bg-white border-gray-100'} transition-all duration-300 hover:shadow-lg`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-start border-b pb-2 mb-2">
                <div>
                    <h3 className="font-extrabold text-lg text-gray-900">{app.worker?.name || 'Worker'}</h3>
                    <p className="text-xs text-gray-500">{app.worker?.email}</p>
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
                <p>Rating: {app.worker?.rating || 'N/A'} | Trust: {app.worker?.trust_score || 'N/A'}</p>
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
    );
}

// --- Worker Dashboard View (New Component) ---
function WorkerDashboard({ applications, avgPay }) {
    const totalApplications = applications.length;
    const acceptedCount = applications.filter((a: any) => a.status === 'accepted').length;

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
                            {applications.map((app: any) => (
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
    );
}

// --- Employer Dashboard View (Refactored DesktopDashboard) ---
// FIX: Added handleUpdateStatus to the props destructuring
function EmployerDashboard({ jobs, selectedJob, handleUpdateStatus, setSelectedJob, statusData, applicationsData, avgPay, renderJobTable, renderCityPay, ProsperoHeading, PRIMARY_HEX, GRAPH_COLORS }) {
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
                        {selectedJob.applicants.map((app: any) => (
                            <ApplicationCard 
                                key={app.id} 
                                app={app} 
                                jobTitle={selectedJob.title}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                        {selectedJob.applicants.length === 0 && (
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
    );
}

// --- Mobile Dashboard (Refactored MobileDashboard) ---
// FIX: Added handleUpdateStatus to the props destructuring
function MobileDashboard({ jobs, selectedJob, setSelectedJob, handleUpdateStatus, renderCityPay, avgPay, ProsperoHeading, PRIMARY_HEX }) {
    
    // Determine which dashboard to render on mobile based on role
    if (selectedJob) {
        // Mobile Management View (Shared with Employer view below, but needs its own component definition)
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
                    {selectedJob.applicants.map((app: any) => (
                        <ApplicationCard 
                            key={app.id} 
                            app={app} 
                            jobTitle={selectedJob.title}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                    {selectedJob.applicants.length === 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-center text-gray-600">No applications received yet for this role.</p></div>
                    )}
                </div>
            </div>
        );
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

              {jobs.map((job: any) => (
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
    );
}

// --- Refactored Main Component ---
export default function DashboardPage() {
  const { id } = useParams() 
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null); // State to hold user object (id, role)
  const [jobs, setJobs] = useState<any[]>([]) // Jobs (Employer) or Applications (Worker)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // --- Core Data Fetcher based on User Role ---
  const fetchDashboardData = async () => {
    if (!id) return
    setLoading(true)

    // 1. Fetch Current User (to get role)
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', id)
        .single();
    
    if (userError || !user) {
        console.error('Error fetching current user:', userError?.message || 'User not found');
        setLoading(false);
        return;
    }
    setCurrentUser(user);
    
    let dashboardData: any[] = []; // Used to store either jobs or applications
    let totalPayAgg = 0;

    if (user.role === 'employer') {
        // --- EMPLOYER VIEW FETCH ---
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('posted_by', id)
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Error fetching jobs:', jobsError.message);
          setLoading(false);
          return;
        }
        
        const jobIds = jobsData.map(j => j.id);
        const { data: appsData } = await supabase
            .from('applications')
            .select(`*, worker:worker_id(id, name, email, rating, trust_score)`)
            .in('job_id', jobIds);

        dashboardData = jobsData.map(job => {
            totalPayAgg += Number(job.pay);
            return {
                ...job,
                applicants: appsData?.filter(a => a.job_id === job.id) || []
            }
        });

    } else if (user.role === 'worker') {
        // --- WORKER VIEW FETCH ---
        const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select(`*, job:job_id(id, title, pay, description, location)`) // Fetch job details
            .eq('worker_id', id)
            .order('created_at', { ascending: false });
        
        if (appsError) {
            console.error('Error fetching worker applications:', appsError.message);
            setLoading(false);
            return;
        }

        dashboardData = appsData.map(app => {
            const jobDetails = app.job || {};
            return {
                ...app,
                job_title: jobDetails.title,
                job_pay: jobDetails.pay,
                job_location: jobDetails.location,
                created_at: app.created_at // Ensure created_at is present for date formatting
            };
        });
    }
    
    setJobs(dashboardData); // Store data regardless of type (jobs or applications)
    setLoading(false);
  }

  useEffect(() => {
    fetchDashboardData()
  }, [id])

  // --- Utility Functions (Shared between components) ---

  const { statusData, applicationsData, avgPay, cityPayData } = useMemo(() => {
    if (currentUser?.role === 'worker') {
        const totalPay = jobs.reduce((acc, app) => acc + Number(app.job_pay || 0), 0);
        const avgPay = jobs.length > 0 ? (totalPay / jobs.length).toFixed(2) : '0.00';
        
        // City Pay Aggregation for Worker (Based on applied jobs' pay)
        const payMap = jobs.reduce((acc: any, app: any) => {
            const location = app.job_location || 'Unknown';
            acc[location] = acc[location] || { sum: 0, count: 0 };
            acc[location].sum += Number(app.job_pay || 0);
            acc[location].count += 1;
            return acc;
        }, {});

        const cityPayData = Object.entries(payMap).map(([location, data]: [string, any]) => ({
            location,
            avgPay: Math.round(data.sum / data.count)
        }));

        return { 
            statusData: [], 
            applicationsData: [], 
            avgPay, 
            cityPayData 
        };
    }
    
    // Employer Aggregation Logic
    const statusData = [
      { name: 'Open', value: jobs.filter(j => j.status === 'open').length },
      { name: 'In Progress', value: jobs.filter(j => j.status === 'in_progress').length },
      { name: 'Completed', value: jobs.filter(j => j.status === 'completed').length },
    ];
    const applicationsData = jobs.map((j: any) => ({
      name: j.title,
      applicants: j.applicants?.length || 0
    }));

    const totalPay = jobs.reduce((acc, j) => acc + Number(j.pay), 0);
    const avgPay = jobs.length > 0 ? (totalPay / jobs.length).toFixed(2) : '0.00';
    
    const payMap = jobs.reduce((acc: any, job: any) => {
        const location = job.location || 'Unknown';
        acc[location] = acc[location] || { sum: 0, count: 0 };
        acc[location].sum += Number(job.pay);
        acc[location].count += 1;
        return acc;
    }, {});

    const cityPayData = Object.entries(payMap).map(([location, data]: [string, any]) => ({
        location,
        avgPay: Math.round(data.sum / data.count)
    }));


    return { statusData, applicationsData, avgPay, cityPayData };
  }, [jobs, currentUser?.role]);
  

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
  );

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
  );

  const handleUpdateStatus = async (app: any, newStatus: 'accepted' | 'rejected') => {
    // 1. Update DB application status
    const { data: appData, error: appError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', app.id)
        .select('worker_id')
        .single();

    if (appError) {
        console.error("Failed to update status:", appError);
        alert("Failed to update status: " + appError.message);
        return;
    }

    // 2. Simulate Worker Message
    const jobTitle = selectedJob?.title || "a job";
    const message = newStatus === 'accepted'
        ? `🎉 Congratulations! Your application for "${jobTitle}" has been **ACCEPTED**. Check your email for next steps.`
        : `👋 Update: Your application for "${jobTitle}" has been **REJECTED**. Keep your head up and keep applying!`;
        
    console.log(`--- MESSAGE TO WORKER ${appData?.worker_id} ---: ${message}`);
    alert(`Status updated to ${newStatus.toUpperCase()}. Worker notified (simulated message).`);
    
    // 3. Refresh job data to update UI instantly
    fetchDashboardData();
  };


  if (loading) return <p className="text-center mt-10 text-xl font-medium">Loading your dashboard data...</p>

  // --- Main Render Switch ---

  if (currentUser?.role === 'worker') {
      return isMobile 
        ? <WorkerMobileDashboard applications={jobs} avgPay={avgPay} renderCityPay={renderCityPay} /> 
        : <WorkerDashboard applications={jobs} avgPay={avgPay} router={router} />;
  }

  return isMobile 
    ? <MobileDashboard jobs={jobs} selectedJob={selectedJob} setSelectedJob={setSelectedJob} handleUpdateStatus={handleUpdateStatus} renderCityPay={renderCityPay} avgPay={avgPay} ProsperoHeading={ProsperoHeading} PRIMARY_HEX={PRIMARY_HEX} /> 
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
      />;
}
