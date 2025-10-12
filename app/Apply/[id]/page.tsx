'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import { MdWork, MdDescription, MdLink, MdSend, MdInfoOutline } from 'react-icons/md'

const supabase = createClientComponentClient()

// --- TYPE DEFINITIONS ---
interface JobDetails {
    id: string;
    title: string;
    description: string | null;
    posted_by: string; // The user ID of the employer
}
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

// --- Constants & Style ---
const PRIMARY_HEX = '#fca311'; 
const ACCENT_COLOR_TEXT = `text-[${PRIMARY_HEX}]`; 
const ProsperoHeading = "text-3xl font-extrabold tracking-tight text-gray-900";
const ProsperoSubHeading = "text-xl font-bold tracking-tight text-gray-800";


// Custom Motion Card Wrapper
const CardWrapper = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 ${className}`}
    >
        {children}
    </motion.div>
)

const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <motion.textarea
        {...props}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-opacity-60 focus:ring-amber-400 resize-none transition duration-200 font-medium text-gray-800 placeholder-gray-500"
        rows={props.rows || 4}
        whileFocus={{ boxShadow: `0 0 0 3px rgba(252, 163, 17, 0.6)` }}
    />
)

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <motion.input
        {...props}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-opacity-60 focus:ring-amber-400 transition duration-200 font-medium text-gray-800 placeholder-gray-500"
        whileFocus={{ boxShadow: `0 0 0 3px rgba(252, 163, 17, 0.6)` }}
    />
)


// --- Main Component ---
export default function ApplicationPage() {
    const params = useParams()
    const router = useRouter()
    
    const jobId = (params.id as string) || null 

    const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
    const [workerId, setWorkerId] = useState<string | null>(null)
    const [workerName, setWorkerName] = useState<string | null>(null) // 🟢 NEW STATE FOR NAME
    const [coverLetter, setCoverLetter] = useState('')
    const [portfolioUrl, setPortfolioUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    // --- 1. Fetch Job Details and Current User ID/Name ---
    useEffect(() => {
        const fetchApplicationData = async () => {
            if (!jobId) {
                setLoading(false);
                setErrorMessage('Invalid Job ID provided in the URL.');
                return;
            }

            // 1a. Get current user session/ID (Worker ID)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                router.replace('/Signin'); 
                return;
            }
            setWorkerId(user.id);
            const currentWorkerId = user.id;

            // 1b. Fetch Worker Name
            const { data: workerProfile } = await supabase
                .from('users') // Assuming 'users' holds the name
                .select('name')
                .eq('id', currentWorkerId)
                .single();

            setWorkerName(workerProfile?.name || 'Worker Profile');

            // 1c. Fetch Job Details
            const { data: job, error: jobError } = await supabase
                .from('jobs')
                .select('id, title, description, posted_by')
                .eq('id', jobId)
                .returns<JobDetails[]>()
                .single();

            if (jobError || !job) {
                setErrorMessage(jobError?.message || 'Job listing not found or accessible.');
                setLoading(false);
                return;
            }
            
            // 1d. Check if Worker is the Employer
            if (job.posted_by === currentWorkerId) {
                setErrorMessage("You are the employer who posted this job and cannot submit an application here.");
            }

            setJobDetails(job);
            setLoading(false);
        }

        fetchApplicationData();
    }, [jobId, router]);
    
    // --- 2. Handle Application Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!workerId || !jobDetails || jobDetails.posted_by === workerId) {
            setErrorMessage("Cannot submit application due to missing user data or invalid job status.");
            return;
        }

        if (!coverLetter.trim()) {
            setErrorMessage("The cover letter is required.");
            return;
        }

        setSubmissionStatus('submitting');
        setErrorMessage('');

        const applicationData = {
            job_id: jobDetails.id,
            worker_id: workerId,
            cover_letter: coverLetter,
            portfolio_url: portfolioUrl || null,
        };

        const { error } = await supabase
            .from('applications')
            .insert(applicationData);

        if (error) {
            if (error.code === '23505') { 
                setErrorMessage("You have already submitted an application for this job.");
            } else {
                console.error('Application submission error:', error);
                setErrorMessage(`Submission failed. Please check the console for details.`);
            }
            setSubmissionStatus('error');
        } else {
            setSubmissionStatus('success');
            setTimeout(() => {
                router.push(`/Feed/${workerId}?status=applied`); 
            }, 2500);
        }
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
                <p className="text-xl font-medium text-gray-600 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Job Details...
                </p>
            </div>
        );
    }

    // --- Error State (Critical failure or Job not found) ---
    if (!jobDetails || errorMessage && submissionStatus === 'idle') {
        return (
            <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
                 <CardWrapper className="max-w-xl text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Application Access Denied</h1>
                    <p className="text-gray-700">{errorMessage || 'The requested job is not available or you are not authorized to view it.'}</p>
                    <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 transition duration-150 underline mt-4 block">
                        &larr; Back to Job Feed
                    </button>
                 </CardWrapper>
            </div>
        );
    }
    
    // --- Render Form ---
    const isEmployerApplying = jobDetails.posted_by === workerId;
    const isDisabled = submissionStatus !== 'idle' || isEmployerApplying;

    return (
        <div className="min-h-screen bg-stone-50 p-8 pt-12">
            <div className="max-w-3xl mx-auto">
                <h1 className={`${ProsperoHeading} text-center mb-2`} style={{ color: PRIMARY_HEX }}>
                    Secure Application Portal
                </h1>
                <p className="text-xl text-gray-600 text-center mb-8">
                    Applying for: <span className='text-orange-500 font-bold'>{jobDetails.title}</span> 
                </p>

                <CardWrapper className="space-y-6">
                    {/* Job Context Section */}
                    <div className="border-b pb-4 mb-4 border-gray-200">
                        <h2 className={`${ProsperoSubHeading} mb-3 flex items-center`}>
                            <MdWork className={`mr-2 text-2xl ${ACCENT_COLOR_TEXT}`} />
                            Role Context
                        </h2>
                        <p className="text-base text-gray-700 font-medium">
                            {jobDetails.description?.substring(0, 150) + '...' || 'Description unavailable.'}
                        </p>
                        {/* 🟢 CHANGED: Display Worker Name instead of ID */}
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                           <MdInfoOutline className="mr-1" /> Applying as: <span className="font-bold text-gray-900 ml-1">{workerName}</span>
                        </p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Status/Error Messages */}
                        {submissionStatus === 'submitting' && (
                            <div className="p-4 bg-amber-100 text-amber-800 rounded-xl font-bold">Submitting Application...</div>
                        )}
                        {submissionStatus === 'success' && (
                            <div className="p-4 bg-green-100 text-green-800 rounded-xl font-bold">Application Successful! Redirecting...</div>
                        )}
                        {submissionStatus === 'error' && (
                            <div className="p-4 bg-red-100 text-red-800 rounded-xl font-bold">{errorMessage}</div>
                        )}
                        {isEmployerApplying && (
                            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-xl font-bold">
                                You are the employer who posted this job. Application is disabled.
                            </div>
                        )}

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-lg font-bold mb-2 text-gray-800 flex items-center">
                                <MdDescription className="mr-2" /> Your Motivation (Cover Letter) <span className="text-red-500 ml-1">*</span>
                            </label>
                            <TextAreaField
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                                placeholder="Explain your fit for this role and how it aligns with your path to prosperity."
                                required
                                rows={6}
                                disabled={isDisabled}
                            />
                        </div>

                        {/* Portfolio URL */}
                        <div>
                            <label className="block text-lg font-bold mb-2 text-gray-800 flex items-center">
                                <MdLink className="mr-2" /> Portfolio / Link (Optional)
                            </label>
                            <InputField
                                type="url"
                                value={portfolioUrl}
                                onChange={e => setPortfolioUrl(e.target.value)}
                                placeholder="Link to a resume, LinkedIn, or sample of your work."
                                disabled={isDisabled}
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isDisabled || !coverLetter.trim()}
                            style={{ 
                                backgroundColor: isDisabled || !coverLetter.trim() ? '#9ca3af' : PRIMARY_HEX
                            }}
                            className="w-full px-4 py-4 text-xl font-bold text-white rounded-xl shadow-xl transition duration-200 disabled:opacity-50 flex items-center justify-center mt-6"
                            whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                        >
                            <MdSend className="mr-2" /> 
                            {submissionStatus === 'submitting' ? 'Sending...' : 'Submit Application'}
                        </motion.button>
                    </form>
                </CardWrapper>

                <div className="mt-8 text-center">
                    <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 transition duration-150 underline">
                        &larr; Back to Job Feed
                    </button>
                </div>
            </div>
        </div>
    );
}