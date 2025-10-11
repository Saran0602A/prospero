'use client'

import { useState, useEffect, useMemo, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useInfiniteQuery, useQueryClient, InfiniteData } from '@tanstack/react-query'
import { formatDistanceToNow, parseISO } from 'date-fns'

import { MdThumbUpAlt, MdOutlineThumbUpAlt, MdOutlineComment, MdWork, MdSend, MdOutlineCategory, MdPinDrop, MdStarRate, MdAttachMoney, MdAccountCircle, MdSearch, MdClose } from 'react-icons/md'
import { FaHashtag, FaMoneyBillWave, FaUserTie, FaUserShield } from 'react-icons/fa'
import { BiCalendar } from 'react-icons/bi'
import { motion } from 'framer-motion'
import Link from 'next/link'

// --- 1. TYPE DEFINITIONS ---

interface UserProfile {
  id: string;
  name: string | null;
  role: 'worker' | 'employer' | null;
  avatar_url: string | null;
  trust_score: number | null;
  rating: number | null;
}
interface Job {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  pay: number | null;
  deadline: string | null;
  posted_by: string | null;
  rating: number | null;
  status: 'open' | 'in_progress' | 'completed';
}
interface Post {
  id: number;
  user_id: string;
  content: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
}

// New Reaction Type based on schema
type ReactionType = 'like' | 'love' | 'care' | 'insightful' | 'support';

// --- EXTENDED TYPES for TanStack Query Results (Joins/Aggregates) ---

interface JobWithAggregates extends Job {
  applications_count: number;
  posted_by: Pick<UserProfile, 'id' | 'name'> | null; 
}
interface PostWithUser extends Post {
  user: Pick<UserProfile, 'id' | 'name' | 'avatar_url'> | null;
  hashtags: { hashtag_id: { tag: string } }[] | null;
}
interface CommentWithUser {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  user: Pick<UserProfile, 'id' | 'name' | 'avatar_url'> | null;
}

type JobPage = JobWithAggregates[];
type PostPage = PostWithUser[];

// --- Constants & Setup ---
const supabase = createClientComponentClient()
const PRIMARY_HEX = '#fca311'
const ACCENT_COLOR_TEXT = `text-[${PRIMARY_HEX}]`;
const POSTS_LIMIT = 5;
const JOBS_LIMIT = 5;

const ProsperoHeading = "text-3xl font-extrabold tracking-tight text-gray-900";
const ProsperoSubHeading = "text-xl font-bold tracking-tight text-gray-800";
const ProsperoBody = "text-base text-gray-700 leading-normal"; 

const MotionLink = motion(Link);

// --- UI Utility Components ---

const CardWrapper = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`group bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 transition-all duration-300 hover:shadow-2xl ${className}`}
    >
        {children}
    </motion.div>
)

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <motion.input
        {...props}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-opacity-60 focus:ring-amber-400 transition duration-200 font-medium text-gray-800 placeholder-gray-500 pl-12" 
        whileFocus={{ boxShadow: `0 0 0 3px rgba(252, 163, 17, 0.6)` }}
    />
)

const SearchInputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <motion.input
        {...props}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-opacity-60 focus:ring-amber-400 transition duration-200 font-medium text-gray-800 placeholder-gray-500 pl-12" 
        whileFocus={{ boxShadow: `0 0 0 3px rgba(252, 163, 17, 0.6)` }}
    />
)

const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <motion.textarea
        {...props}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-opacity-60 focus:ring-amber-400 resize-none transition duration-200 font-medium text-gray-800 placeholder-gray-500"
        rows={props.rows || 4}
        whileFocus={{ boxShadow: `0 0 0 3px rgba(252, 163, 17, 0.6)` }}
    />
)


// --- 2. AddPost Component ---
function AddPost({ currentUser, onPost }: { currentUser: UserProfile | null, onPost: (content: string, category: string, hashtags: string[], imageUrl: string) => Promise<void> }) {
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('')
    const [hashtags, setHashtags] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async () => {
        setError('')
        setSuccess('')
        const tags = hashtags.split(',').map(t => t.trim()).filter(Boolean)
        if (!content.trim() && !imageUrl.trim()) return setError('Post cannot be empty!')
        if (!currentUser) return setError('You must be logged in to post.')

        try {
            setLoading(true)
            await onPost(content, category, tags, imageUrl)
            setContent('')
            setCategory('')
            setHashtags('')
            setImageUrl('')
            setSuccess('Post published successfully!')
        } catch (err: any) {
            setError(err.message || 'Error creating post')
        } finally {
            setLoading(false)
            setTimeout(() => setSuccess(''), 3000)
            setTimeout(() => setError(''), 3000)
        }
    }

    return (
        <CardWrapper>
            <h2 className={`${ProsperoSubHeading} mb-4 flex items-center`}>
                <FaUserTie className={`mr-2 text-blue-500 text-2xl ${ACCENT_COLOR_TEXT}`} />
                Connect with the Community
            </h2>

            <TextAreaField
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Share your thoughts, ask questions, or announce a win, ${currentUser?.name || 'user'}...`}
                rows={4}
            />

            <InputField
                type="url"
                placeholder="Paste Image URL here (Optional)"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="mt-3 pl-4"
            />

            <div className="grid grid-cols-2 gap-3 mt-3">
                <InputField
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Topic (e.g., Training, Housing)"
                    className="pl-4"
                />
                <InputField
                    value={hashtags}
                    onChange={e => setHashtags(e.target.value)}
                    placeholder="Tags (e.g., #jobs, #hope)"
                    className="pl-4"
                />
            </div>

            {(error || success) && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm mt-3 font-medium p-3 rounded-xl ${error ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}
                >
                    {error || success}
                </motion.p>
            )}

            <motion.button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && !imageUrl.trim()) || !currentUser}
                className={`w-full mt-4 px-4 py-3 text-lg font-bold text-white rounded-xl shadow-lg transition duration-200 ease-in-out bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center`}
                whileTap={{ scale: 0.95 }}
            >
                {loading ? 'Publishing...' : 'Post & Share'}
            </motion.button>
        </CardWrapper>
    )
}

// --- 3. AddJobForm Component ---
function AddJobForm({ currentUser, onJob }: { currentUser: UserProfile | null, onJob: (jobData: Omit<Job, 'id' | 'status'> & { posted_by: string }) => Promise<void> }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [location, setLocation] = useState('')
    const [pay, setPay] = useState<number | undefined>()
    const [rating, setRating] = useState<number | undefined>()
    const [deadline, setDeadline] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setError('')
        if (!title || !pay || !category || !location) {
            return setError('Please fill in all *required fields (Title, Category, Location, Pay).')
        }
        if (currentUser?.role !== 'employer' || !currentUser.id) return setError('Only verified employers can post jobs.')

        setLoading(true)
        try {
            await onJob({
                title, description: description || null, category, location, pay, rating: rating || null,
                deadline: deadline || null,
                posted_by: currentUser.id
            })
            setTitle(''); setDescription(''); setCategory(''); setLocation('');
            setPay(undefined); setRating(undefined); setDeadline('');
            alert("Job posted successfully! It will appear shortly.");
        } catch (err: any) {
            setError(err.message || 'Error posting job')
        } finally {
            setLoading(false)
            setTimeout(() => setError(''), 3000)
        }
    }

    return (
        <CardWrapper>
            <h2 className={`${ProsperoSubHeading} mb-4 flex items-center`}>
                <MdWork style={{ color: PRIMARY_HEX }} className="mr-2 text-2xl" />
                Post a Job for the Community
            </h2>
            <p className="text-sm text-gray-500 mb-4">Post roles suitable for members seeking opportunity. (* Required)</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <InputField value={title} onChange={e => setTitle(e.target.value)} placeholder="Role Title*" className="pl-4" />
                <InputField value={category} onChange={e => setCategory(e.target.value)} placeholder="Job Category*" className="pl-4" />
                <InputField value={location} onChange={e => setLocation(e.target.value)} placeholder="Location*" className="pl-4" />
                <InputField type="number" value={pay ?? ''} onChange={e => setPay(Number(e.target.value))} placeholder="Hourly Pay / Compensation*" className="pl-4" />
            </div>
            <TextAreaField
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description and flexibility details."
                rows={3}
            />
            <div className="grid grid-cols-3 gap-3 mt-3">
                <InputField type="number" value={rating ?? ''} onChange={e => setRating(Number(e.target.value))} placeholder="Required Rating (0-5, optional)" className="pl-4" />
                <InputField type="date" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="Application Deadline" className="pl-4" />
            </div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-700 text-sm mt-3 font-medium p-3 rounded-xl bg-red-100">{error}</motion.p>}

            <motion.button
                onClick={handleSubmit}
                disabled={loading || !title || !pay || !category || !location || currentUser?.role !== 'employer'}
                style={{ backgroundColor: loading || !title || !pay || !category || !location || currentUser?.role !== 'employer' ? '#9ca3af' : PRIMARY_HEX }}
                className={`w-full mt-4 px-4 py-3 text-lg font-bold text-white rounded-xl shadow-lg transition duration-200 ease-in-out hover:brightness-110 disabled:opacity-50 flex items-center justify-center`}
                whileTap={{ scale: 0.95 }}
            >
                {loading ? 'Posting Job...' : 'Publish Job'}
            </motion.button>
        </CardWrapper>
    )
}

// --- 4. JobCard Component ---
function JobCard({ job, currentUser, index }: { job: JobWithAggregates, currentUser: UserProfile | null, index: number }) {
    const [applied, setApplied] = useState(false);
    const isPoster = currentUser && currentUser.id === job.posted_by?.id; 
    const isClosed = job.status !== 'open' || (job.deadline && new Date(job.deadline) < new Date());
    const canApply = !applied && !isClosed && !isPoster && currentUser?.role === 'worker';
    
    useEffect(() => {
        if (currentUser?.role !== 'worker' || !job.id) return
        const checkApplied = async () => {
            const { data } = await supabase
                .from('applications')
                .select('id')
                .eq('job_id', job.id)
                .eq('worker_id', currentUser.id)
                .maybeSingle()
            setApplied(!!data)
        }
        checkApplied()
    }, [currentUser, job.id])

    const cardVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1, x: 0, transition: { delay: i * 0.08, duration: 0.5 },
        }),
    }

    let buttonContent = 'Apply Now';
    let linkHref = `/Apply/${job.id}`;

    if (isPoster) {
        buttonContent = 'Posted By Me';
        linkHref = `/Dashboard/${currentUser?.id}`;
    } else if (applied) {
        buttonContent = 'Application Submitted';
    } else if (isClosed) {
        buttonContent = job.status === 'open' ? 'Deadline Passed' : 'Role Closed';
        linkHref = '#';
    } else if (currentUser?.role !== 'worker') {
         buttonContent = 'Log in to Apply';
         linkHref = '/Signin';
    }

    const buttonStyle = {
        backgroundColor: canApply ? PRIMARY_HEX : '#9ca3af'
    };
    const buttonClassName = `mt-4 w-full px-4 py-3 text-lg font-bold rounded-xl text-white transition duration-200 ease-in-out`;

    return (
        <motion.div
            className={`bg-white p-6 rounded-2xl shadow border border-gray-100 mb-6 transition-all duration-300 ${isClosed ? 'opacity-60' : 'hover:shadow-2xl'}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
        >
            <div className="flex justify-between items-start mb-4 border-b pb-3 border-gray-100">
                <div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{job.title}</h3>
                    <span className="text-sm text-gray-500 flex items-center mt-1 font-medium">
                        <MdOutlineCategory className={`mr-1 ${ACCENT_COLOR_TEXT}`} />{job.category}
                    </span>
                    
                    <Link href={`/profile/${job.posted_by?.id}`} className="text-xs text-blue-500 hover:underline flex items-center mt-1">
                        <FaUserTie className="mr-1" /> Posted by {job.posted_by?.name || 'User'}
                    </Link>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{job.description}</p>

            <div className="grid grid-cols-2 gap-y-3 text-base text-gray-700 mb-6 font-medium border-t pt-4 border-gray-100">
                <p className="flex items-center"><FaMoneyBillWave className={`mr-2 text-green-600 text-lg`} /> <span className="font-bold">Pay:</span> ${job.pay}</p>
                <p className="flex items-center"><MdPinDrop className={`mr-2 text-blue-500 text-lg`} /> <span className="font-bold">Location:</span> {job.location}</p>
                <p className="flex items-center"><BiCalendar className={`mr-2 text-gray-500 text-lg`} /> <span className="font-bold">Deadline:</span> {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</p>
                <p className="flex items-center"><MdAttachMoney className={`mr-2 ${ACCENT_COLOR_TEXT} text-lg`} /> <span className="font-bold">Applicants:</span> {job.applications_count} </p>
            </div>

            <MotionLink
                href={linkHref}
                style={buttonStyle}
                className={`${buttonClassName} flex items-center justify-center shadow-lg ${!canApply && !isPoster ? 'pointer-events-none opacity-50' : ''}`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ filter: 'brightness(1.1)' }}
            >
                {buttonContent}
            </MotionLink>
        </motion.div>
    )
}

// --- 5. PostCard Component (Working Multi-Reaction System) ---
function PostCard({ post, currentUser, index }: { post: PostWithUser, currentUser: UserProfile | null, index: number }) {
    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
    const [showComments, setShowComments] = useState(false);
    const [loadingReaction, setLoadingReaction] = useState(false);

    // Check initial liked status
    useEffect(() => {
        const checkReaction = async () => {
            if (!currentUser) return;
            const { data } = await supabase
                .from('reactions')
                .select('reaction')
                .eq('post_id', post.id)
                .eq('user_id', currentUser.id)
                .maybeSingle(); 
            setUserReaction((data?.reaction as ReactionType) || null);
        };
        checkReaction();
    }, [currentUser, post.id]);

    // CORE FIX: Handles INSERT or DELETE for the 'like' reaction
    const toggleLike = async () => {
        if (!currentUser || loadingReaction) return;

        setLoadingReaction(true);
        // If the user already has a 'like' reaction, we want to UNLIKE (delete it).
        const isCurrentlyLiked = userReaction === 'like'; 
        const newReactionStatus = isCurrentlyLiked ? null : 'like';

        setUserReaction(newReactionStatus); // Optimistic update

        try {
            if (newReactionStatus) {
                // LIKE: Insert a new reaction record
                const { error } = await supabase
                    .from('reactions')
                    .insert({
                        post_id: post.id as any, 
                        user_id: currentUser.id,
                        reaction: 'like', // Explicitly setting the type
                    });
                if (error) throw error;
            } else {
                // UNLIKE: Delete the existing reaction record
                const { error } = await supabase
                    .from('reactions')
                    .delete()
                    .eq('post_id', post.id)
                    .eq('user_id', currentUser.id);
                if (error) throw error;
            }
        } catch (error) {
            console.error("Reaction update failed:", error);
            setUserReaction(isCurrentlyLiked ? 'like' : null); // Rollback
        } finally {
            setLoadingReaction(false);
        }
    };
    
    // Determine button state
    const liked = userReaction === 'like';

    const cardVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1, x: 0, transition: { delay: i * 0.08, duration: 0.5 },
        }),
    }

    return (
        <motion.div
            className={`bg-white p-6 rounded-2xl shadow border border-gray-100 mb-6 transition-shadow duration-300 hover:shadow-2xl`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
        >
            <div className="flex items-start mb-3">
                {post.user?.avatar_url ? (
                    <img src={post.user.avatar_url} width={48} height={48} className="rounded-full object-cover border-2 border-gray-100" alt="avatar" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-extrabold text-xl border-2 border-gray-300">
                        {post.user?.name ? post.user.name[0].toUpperCase() : 'U'}
                    </div>
                )}
                <div className="ml-3">
                    <Link href={`/profile/${post.user?.id}`} className="font-extrabold text-lg text-gray-900 leading-snug tracking-tight hover:text-blue-600 transition-colors">
                        {post.user?.name || 'Anonymous User'}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        {post.created_at ? formatDistanceToNow(parseISO(post.created_at), { addSuffix: true }) : 'just now'}
                    </p>
                </div>
            </div>

            {post.content && <p className={`${ProsperoBody} mb-4 whitespace-pre-wrap`}>{post.content}</p>}

            {post.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img
                        src={post.image_url}
                        alt="Post illustration"
                        className="w-full object-cover max-h-80"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.onerror = null; }}
                    />
                </div>
            )}
            <div className="flex flex-wrap gap-2 mb-4 border-t pt-3 border-gray-100">
                {post.category && (
                    <span style={{ backgroundColor: PRIMARY_HEX + '1A', color: PRIMARY_HEX }} className={`px-3 py-1 rounded-full text-xs font-bold`}>
                        <MdOutlineCategory className="inline mr-1" />{post.category}
                    </span>
                )}
                {post.hashtags?.map((h) => (
                    <span key={h.hashtag_id.tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        <FaHashtag className="inline mr-1" />{h.hashtag_id.tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-6 border-t pt-3">
                <motion.button
                    onClick={toggleLike}
                    disabled={!currentUser || loadingReaction}
                    className={`flex items-center gap-1.5 py-1 px-3 rounded-full transition-colors font-medium 
                    ${liked ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'}
                    ${!currentUser || loadingReaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                    whileTap={{ scale: 0.95 }}
                >
                    {loadingReaction ? '...' : liked ? <MdThumbUpAlt className="text-xl" /> : <MdOutlineThumbUpAlt className="text-xl" />}
                    {loadingReaction ? 'Updating' : 'Like'}
                </motion.button>
                <motion.button
                    onClick={() => setShowComments(prev => !prev)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 py-1 px-3 rounded-full hover:bg-gray-100 transition-colors font-medium"
                    whileTap={{ scale: 0.95 }}
                >
                    <MdOutlineComment className="text-xl" /> Comment
                </motion.button>
            </div>
            {showComments && <CommentsSection postId={post.id} currentUser={currentUser} />}
        </motion.div>
    )
}

// --- 6. Comments Section ---
function CommentsSection({ postId, currentUser }: { postId: number, currentUser: UserProfile | null }) {
    const [comments, setComments] = useState<CommentWithUser[]>([])
    const [text, setText] = useState('')
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [commentsParent] = useAutoAnimate<HTMLDivElement>()

    useEffect(() => {
        const fetchComments = async () => {
             setCommentsLoading(true)
             const { data } = await supabase
                 .from('comments')
                 .select('*, user:user_id(id,name,avatar_url)')
                 .eq('post_id', postId)
                 .order('created_at', { ascending: true })
             setComments((data as CommentWithUser[]) || [])
             setCommentsLoading(false)
         }
         fetchComments()
     }, [postId])

    const handleComment = async () => {
        if (!text.trim() || !currentUser) return
        
        const { data } = await supabase
          .from('comments')
          .insert({ post_id: postId, user_id: currentUser.id, content: text })
          .select('*, user:user_id(id,name,avatar_url)') 
          
        if (!data?.[0]) return
        
        const newComment: CommentWithUser = { 
            ...(data[0] as CommentWithUser), 
            created_at: new Date().toISOString() 
        }

        setComments(prev => [...prev, newComment])
        setText('')
    }
    
    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold mb-3 text-gray-700 border-b pb-2">Comments ({comments.length})</h4>
            
            {commentsLoading && <p className="text-sm text-gray-400">Loading comments...</p>}

            <div ref={commentsParent} className="max-h-60 overflow-y-auto pr-2 mb-4">
                {comments.map(comment => (
                    <motion.div 
                        key={comment.id} 
                        className="flex items-start gap-3 mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {comment.user?.avatar_url ? (
                            <img src={comment.user.avatar_url} width={36} height={36} className="rounded-full object-cover" alt="avatar" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 font-bold">
                                {comment.user?.name ? comment.user.name[0].toUpperCase() : 'U'}
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-extrabold text-gray-800 leading-tight">
                                {comment.user?.name || 'Anonymous'}
                                <span className='ml-2 text-xs font-normal text-gray-400'>
                                    {comment.created_at ? formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true }) : 'just now'}
                                </span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex gap-2 mt-2">
                <InputField
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a comment..."
                className="pl-4"
                />
                <motion.button
                onClick={handleComment}
                disabled={!text.trim() || !currentUser}
                className={`px-4 py-3 text-white rounded-lg font-semibold transition duration-150 ease-in-out bg-blue-600 hover:bg-blue-700 
                disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center`}
                whileTap={{ scale: !text.trim() || !currentUser ? 1 : 0.95 }}
                >
                <MdSend className="text-lg" />
                </motion.button>
            </div>
        </div>
    )
}

// --- 7. Main FeedPage Component ---
export default function FeedPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
    const [view, setView] = useState<'posts' | 'jobs'>('jobs')
    const [searchQuery, setSearchQuery] = useState('')
    const [parent] = useAutoAnimate<HTMLDivElement>()
    const queryClient = useQueryClient()
    const router = useRouter()

    // --- FIX: Fetch current user profile reliably from session ---
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) {
                setCurrentUser(null) 
                return
            }

            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single()
                
            setCurrentUser((user as UserProfile) || null)
        }
        
        fetchUser()
    }, [])

    const currentUserId = currentUser?.id || 'guest'; 

    // --- Data Fetching Hooks (TanStack Query) ---

    const { data: postsPages, isFetching: isFetchingPosts, fetchNextPage: fetchNextPostsPage, hasNextPage: hasNextPostsPage } = useInfiniteQuery<PostPage, Error, InfiniteData<PostPage>>({
        queryKey: ['posts', currentUserId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await supabase
                .from('posts')
                .select(`*, user:user_id(id,name,avatar_url), hashtags:post_hashtags!inner(hashtag_id(tag))`)
                .order('created_at', { ascending: false })
                .range(pageParam as number, (pageParam as number) + POSTS_LIMIT - 1)
            return (data as PostWithUser[]) || []
        },
        getNextPageParam: (lastPage, allPages) => lastPage.length === POSTS_LIMIT ? allPages.length * POSTS_LIMIT : undefined,
        initialPageParam: 0,
    })
    const allPosts = postsPages?.pages.flat() || []

    const { data: jobsPages, isFetching: isFetchingJobs, fetchNextPage: fetchNextJobsPage, hasNextPage: hasNextJobsPage } = useInfiniteQuery<JobPage, Error, InfiniteData<JobPage>>({
        queryKey: ['jobs', currentUserId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await supabase
                .from('jobs')
                .select(`*, applications_count:applications(count), posted_by(id, name)`) 
                .order('rating', { ascending: false })
                .range(pageParam as number, (pageParam as number) + JOBS_LIMIT - 1)

            return (data || []).map(job => {
                const applications_count = (job as any).applications_count?.[0]?.count || 0 
                return { ...(job as any), applications_count }
            }) as JobWithAggregates[]
        },
        getNextPageParam: (lastPage, allPages) => lastPage.length === JOBS_LIMIT ? allPages.length * JOBS_LIMIT : undefined,
        initialPageParam: 0,
    })
    const allJobs = jobsPages?.pages.flat() || []

    // --- Client-Side Filtering ---
    const filteredJobs = useMemo(() => {
        if (!searchQuery) return allJobs;
        const query = searchQuery.toLowerCase();
        return allJobs.filter(job => 
            job.title.toLowerCase().includes(query) ||
            job.category?.toLowerCase().includes(query) ||
            job.location?.toLowerCase().includes(query) ||
            job.posted_by?.name?.toLowerCase().includes(query)
        );
    }, [allJobs, searchQuery]);

    const filteredPosts = useMemo(() => {
        if (!searchQuery) return allPosts;
        const query = searchQuery.toLowerCase();
        return allPosts.filter(post => 
            (post.content && post.content.toLowerCase().includes(query)) ||
            post.hashtags?.some(h => h.hashtag_id.tag.toLowerCase().includes(query)) ||
            post.user?.name?.toLowerCase().includes(query)
        );
    }, [allPosts, searchQuery]);


    // --- Add Post/Job Handlers ---
    const handleNewPost = async (content: string, category: string, hashtagsArr: string[], imageUrl: string) => {
        if (!currentUser) throw new Error('Authentication required.')
        
        const { data } = await supabase.from('posts').insert({ user_id: currentUser.id, content, category, image_url: imageUrl || null }).select()
        if (!data?.[0]) throw new Error('Failed to create post.')
        const newPost = data[0]

        let postHashtags = []
        if (hashtagsArr?.length) {
            for (let tag of hashtagsArr) {
                const { data: tagData } = await supabase.from('hashtags').upsert({ tag }, { onConflict: 'tag' }).select()
                if (tagData?.[0]) {
                    await supabase.from('post_hashtags').insert({ post_id: newPost.id, hashtag_id: tagData[0].id })
                    postHashtags.push({ hashtag_id: { tag: tagData[0].tag } })
                }
            }
        }

        const postWithUser: PostWithUser = {
            ...newPost, 
            user: { id: currentUser.id, name: currentUser.name, avatar_url: currentUser.avatar_url },
            hashtags: postHashtags as any
        }

        queryClient.setQueryData<InfiniteData<PostPage>>(['posts', currentUserId], (old) => {
            if (!old) return { pages: [[postWithUser]], pageParams: [0] };
            return {
                ...old,
                pages: [[postWithUser], ...old.pages],
            }
        })
    }

    const handleNewJob = async (jobData: Omit<Job, 'id' | 'status'> & { posted_by: string }) => {
        if (!currentUser || currentUser.role !== 'employer') throw new Error('Permission denied.')
        
        const { data } = await supabase.from('jobs').insert(jobData).select()
        if (!data?.[0]) throw new Error('Failed to create job.')

        const newJob: JobWithAggregates = {
            ...(data[0] as Job),
            applications_count: 0, 
            posted_by: { id: currentUser.id, name: currentUser.name },
            status: 'open',
        }

        queryClient.setQueryData<InfiniteData<JobPage>>(['jobs', currentUserId], (old) => {
            if (!old) return { pages: [[newJob]], pageParams: [0] };
            return {
                ...old,
                pages: [[newJob], ...old.pages],
            }
        })
    }


    // --- Left Column Profile Card Component ---
    const ProfileCard = () => (
        <CardWrapper className="shadow-2xl border-gray-200 p-8 mr-4">
            <div className="flex flex-col items-center border-b pb-5 mb-5 border-gray-100">
                {currentUser?.avatar_url ? (
                    <img
                        src={currentUser.avatar_url} 
                        width={90}
                        height={90} 
                        className="rounded-full object-cover border-4 border-white shadow-lg"
                        alt="avatar" 
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-extrabold text-4xl border-4 border-gray-300 shadow-lg">
                        {currentUser?.name ? currentUser.name[0].toUpperCase() : 'G'}
                    </div>
                )}
                <h3 className="text-2xl font-extrabold tracking-tight mt-4 text-gray-900">{currentUser?.name || 'Guest User'}</h3>
                <p className="text-base text-gray-500 font-medium mt-1">{currentUser?.role || 'New Member'}</p>
            </div>
            
            <div className="space-y-4 text-base">
                <div className="flex justify-between items-center text-gray-700 pb-1 border-b border-dashed border-gray-100">
                    <span className="flex items-center font-bold"><FaUserShield className={`mr-3 text-blue-500 text-lg`} /> Trust Score:</span>
                    <span className="font-extrabold text-lg" style={{ color: PRIMARY_HEX }}>{currentUser?.trust_score ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center font-bold"><MdStarRate className={`mr-3 text-yellow-500 text-lg`} /> Average Rating:</span>
                    <span className="font-extrabold text-lg">{(currentUser?.rating)?.toFixed(1) ?? 'N/A'}</span>
                </div>
            </div>

            <motion.div whileHover={{ scale: 1.0 }}>
                <Link 
                    href={currentUser ? `/profile/${currentUser.id}` : '/Signin'} 
                    className="text-base font-extrabold mt-6 block text-center py-3 rounded-xl transition-colors shadow-lg" 
                    style={{ color: PRIMARY_HEX, border: `2px solid ${PRIMARY_HEX}` }}
                >
                    {currentUser ? 'View Full Profile' : 'Sign In to View Profile'}
                </Link>
            </motion.div>
        </CardWrapper>
    );

    // --- Loading State ---
    const isInitialLoading = isFetchingJobs && isFetchingPosts && allJobs.length === 0 && allPosts.length === 0;

    if (isInitialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <p className="text-xl text-gray-600 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Feed...
                </p>
            </div>
        )
    }


    return (
        <div className="min-h-screen p-4 bg-stone-50 font-sans">
            <div className="max-w-7xl mx-auto flex gap-8">

                {/* Left Column: Profile & Resources (25% width) */}
                <div className="hidden lg:block w-1/4 sticky top-4 space-y-8 h-fit">
                    <ProfileCard />
                </div>

                {/* Right Column: Feed Content (Main focus, 75% width) */}
                <div className="w-full lg:w-3/4">
                    <h1 className="text-3xl font-extrabold text-[#000000] tracking-tight mb-6">
                        Pros<span className="text-[#14213d] font-medium">pero</span><sup className="text-[#14213d] font-bold text-xl">.</sup>
                    </h1>

                    {/* Search Bar */}
                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
                        <div className="relative flex items-center">
                            <SearchInputField
                                type="text"
                                placeholder={view === 'jobs' ? "Search jobs by title, location, or poster..." : "Search posts by content, hashtag, or user..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <motion.button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-12 text-gray-400 hover:text-gray-600 transition"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <MdClose className="text-2xl" />
                                </motion.button>
                            )}
                            <MdSearch className="absolute right-4 text-gray-500 text-2xl" />
                        </div>
                    </motion.div>

                    {/* View Toggles (Tabs) */}
                    <div className="flex gap-2 mb-8 p-1 rounded-2xl bg-white shadow-xl border border-gray-200">
                        <motion.button
                            onClick={() => { setView('jobs'); setSearchQuery(''); }}
                            style={{ backgroundColor: view === 'jobs' ? PRIMARY_HEX : 'transparent', color: view === 'jobs' ? 'white' : '#1f2937' }}
                            className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition duration-200 ease-in-out shadow-lg`}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.01 }}
                        >
                            Job Opportunities
                        </motion.button>
                        <motion.button
                            onClick={() => { setView('posts'); setSearchQuery(''); }}
                            style={{ backgroundColor: view === 'posts' ? PRIMARY_HEX : 'transparent', color: view === 'posts' ? 'white' : '#1f2937' }}
                            className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition duration-200 ease-in-out shadow-lg`}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.01 }}
                        >
                            Community Discussion
                        </motion.button>
                    </div>

                    {/* Content Feed Container */}
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        ref={parent}
                    >
                        {view === 'jobs' && (
                            <>
                                {currentUser?.role === 'employer' && <AddJobForm currentUser={currentUser} onJob={handleNewJob} />}

                                {filteredJobs.map((job, index) => (
                                    <JobCard key={job.id} job={job} currentUser={currentUser} index={index} />
                                ))}

                                {filteredJobs.length === 0 && (
                                    <p className="text-center text-gray-500 mt-10 p-6 bg-white rounded-2xl shadow border border-gray-200">
                                        {searchQuery ? `No jobs found matching "${searchQuery}".` : "No current job openings match your search criteria."}
                                    </p>
                                )}
                                
                                {hasNextJobsPage && (
                                    <motion.button
                                        onClick={() => fetchNextJobsPage()}
                                        disabled={isFetchingJobs}
                                        className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl mt-4 hover:bg-gray-300 disabled:opacity-50"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isFetchingJobs ? 'Loading more...' : 'Load More Jobs'}
                                    </motion.button>
                                )}
                            </>
                        )}

                        {view === 'posts' && (
                            <>
                                <AddPost currentUser={currentUser} onPost={handleNewPost} />

                                {filteredPosts.map((post, index) => (
                                    <PostCard key={post.id} post={post} currentUser={currentUser} index={index} />
                                ))}

                                {filteredPosts.length === 0 && (
                                    <p className="text-center text-gray-500 mt-10 p-6 bg-white rounded-2xl shadow border border-gray-200">
                                        {searchQuery ? `No posts found matching "${searchQuery}".` : "Be the first to share hope and advice with the community."}
                                    </p>
                                )}

                                {hasNextPostsPage && (
                                    <motion.button
                                        onClick={() => fetchNextPostsPage()}
                                        disabled={isFetchingPosts}
                                        className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl mt-4 hover:bg-gray-300 disabled:opacity-50"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isFetchingPosts ? 'Loading more...' : 'Load More Posts'}
                                    </motion.button>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}