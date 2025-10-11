'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import { MdWork, MdDescription, MdLink, MdSend } from 'react-icons/md'

const supabase = createClientComponentClient()

// --- Constants for Theme & Style (FIXED SCOPE) ---
const PRIMARY_HEX = '#fca311'; // Prospero Orange (Hope/Action)
const ACCENT_COLOR_TEXT = `text-[${PRIMARY_HEX}]`; // Defined here to be available globally in this file
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

const TextAreaField = (props: any) => (
    <motion.textarea
        {...props}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-opacity-60 focus:ring-amber-400 resize-none transition duration-200 font-medium text-gray-800 placeholder-gray-500"
        rows={props.rows || 4}
        whileFocus={{ boxShadow: `0 0 0 3px rgba(252, 163, 17, 0.6)` }}
    />
)

const InputField = (props: any) => (
    <motion.input
        {...props}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-opacity-60 focus:ring-amber-400 transition duration-200 font-medium text-gray-800 placeholder-gray-500"
        whileFocus={{ boxShadow: `0 0 0 3px rgba(252, 163, 17, 0.6)` }}
    />
)


export default function ApplicationPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params.id as string // The ID of the job being applied for

    const [jobDetails, setJobDetails] = useState<any>(null)
    const [workerId, setWorkerId] = useState<string | null>(null)
    const [coverLetter, setCoverLetter] = useState('')
    const [portfolioUrl, setPortfolioUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    // --- 1. Fetch Job Details and Current User ID ---
    useEffect(() => {
        const fetchApplicationData = async () => {
            if (!jobId) {
                setLoading(false);
                setErrorMessage('Invalid Job ID.');
                return;
            }

            // 1a. Attempt to get current user session/ID (Worker ID)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                setErrorMessage('You must be logged in to apply.');
                return;
            }
            setWorkerId(user.id);


            // 1b. Fetch Job Details
            const { data: job, error: jobError } = await supabase
                .from('jobs')
                .select('title, description, posted_by')
                .eq('id', jobId)
                .single();

            if (jobError || !job) {
                setErrorMessage(jobError?.message || 'Job listing not found.');
            } else {
                setJobDetails(job);
            }
            setLoading(false);
        }

        fetchApplicationData();
    }, [jobId]);
    
    // --- 2. Handle Application Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workerId || !jobId) {
            setErrorMessage("Worker or Job ID missing. Please log in.");
            return;
        }
        
        if (jobDetails?.posted_by === workerId) {
            setErrorMessage("You cannot apply for a job you posted.");
            return;
        }

        setSubmissionStatus('submitting');
        setErrorMessage('');

        const applicationData = {
            job_id: jobId,
            worker_id: workerId,
            cover_letter: coverLetter,
            portfolio_url: portfolioUrl,
        };

        const { error } = await supabase
            .from('applications')
            .insert(applicationData);

        if (error) {
            if (error.code === '23505') { // PostgreSQL unique constraint violation error code
                setErrorMessage("You have already submitted an application for this job.");
            } else {
                setErrorMessage(`Submission failed: ${error.message}`);
            }
            setSubmissionStatus('error');
        } else {
            setSubmissionStatus('success');
            setTimeout(() => {
                router.push(`/Feed/${workerId}?status=applied`); // Redirect back to the feed after success
            }, 3000);
        }
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
                <p className="text-xl font-medium text-gray-600">Loading Job Details...</p>
            </div>
        );
    }

    // --- Error State ---
    if (errorMessage && !jobDetails) {
        return (
            <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
                 <CardWrapper className="max-w-xl text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Job</h1>
                    <p className="text-gray-700">{errorMessage}</p>
                 </CardWrapper>
            </div>
        );
    }
    
    // --- Dynamic SEO/Context Content ---
    const jobTitle = jobDetails?.title || "Job Opportunity";
    const jobDescSnippet = jobDetails?.description ? jobDetails.description.substring(0, 100) + '...' : 'A fulfilling new role.';

    return (
        <div className="min-h-screen bg-stone-50 p-8 pt-12">
            <div className="max-w-3xl mx-auto">
                <h1 className={`${ProsperoHeading} text-center mb-2`} style={{ color: PRIMARY_HEX }}>
                    Secure Application Portal
                </h1>
                <p className="text-xl text-gray-600 text-center mb-8">
                    Applying for: **{jobTitle}**
                </p>

                <CardWrapper className="space-y-6">
                    {/* Job Context Section */}
                    <div className="border-b pb-4 mb-4 border-gray-200">
                        <h2 className={`${ProsperoSubHeading} mb-3 flex items-center`}>
                            <MdWork className={`mr-2 text-2xl ${ACCENT_COLOR_TEXT}`} />
                            Role Context
                        </h2>
                        <p className="text-base text-gray-700 font-medium">{jobDescSnippet}</p>
                        <p className="text-sm text-gray-500 mt-2">
                           Worker ID (Auto-filled): <span className="font-mono text-xs text-gray-900">{workerId}</span>
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
                        {jobDetails?.posted_by === workerId && (
                            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-xl font-bold">
                                You are the employer who posted this job. You cannot submit an application here.
                            </div>
                        )}

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-lg font-bold mb-2 text-gray-800 flex items-center">
                                <MdDescription className="mr-2" /> Your Motivation (Cover Letter)
                            </label>
                            <TextAreaField
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                                placeholder="Explain your fit for this role and how it aligns with your path to prosperity."
                                required
                                rows={6}
                                disabled={submissionStatus !== 'idle' || jobDetails?.posted_by === workerId}
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
                                disabled={submissionStatus !== 'idle' || jobDetails?.posted_by === workerId}
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={submissionStatus !== 'idle' || jobDetails?.posted_by === workerId || !coverLetter.trim()}
                            style={{ 
                                backgroundColor: submissionStatus === 'idle' && coverLetter.trim() && jobDetails?.posted_by !== workerId ? PRIMARY_HEX : '#9ca3af'
                            }}
                            className="w-full px-4 py-4 text-xl font-bold text-white rounded-xl shadow-xl transition duration-200 disabled:opacity-50 flex items-center justify-center mt-6"
                            whileTap={{ scale: submissionStatus === 'idle' ? 0.98 : 1 }}
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
