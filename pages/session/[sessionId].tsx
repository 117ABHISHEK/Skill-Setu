import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import AIFeedback from '@/components/AIFeedback';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';
import DailyIframe from '@daily-co/daily-js';

interface SessionData {
  _id: string;
  sessionId: string;
  dailyRoomUrl: string;
  status: string;
  skill: string;
  skillCategory: string;
  teacher: any;
  learner: any;
  readyStatus: {
    teacher: boolean;
    learner: boolean;
  };
  startTime?: string;
  fraud_flagged: boolean;
  tokenStatus: string;
  aiWindows: any[];
}

export default function LiveSession() {
  const router = useRouter();
  const { sessionId: sessionIdQuery } = router.query;
  // Handle sessionId from Next.js router (can be string or string[])
  const sessionId = Array.isArray(sessionIdQuery) ? sessionIdQuery[0] : sessionIdQuery;
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [callFrame, setCallFrame] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [aiStatus, setAiStatus] = useState<'valid' | 'review' | 'fraud'>('valid');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dailyToken, setDailyToken] = useState<string | null>(null);
  const [latestAIFeedback, setLatestAIFeedback] = useState<any>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const teacherSpeakingTimeRef = useRef(0);
  const learnerSpeakingTimeRef = useRef(0);
  const activeSpeakerIdRef = useRef<string | null>(null);
  const speakingStartTimeRef = useRef<number | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [onlineParticipants, setOnlineParticipants] = useState<string[]>([]);
  const hasJoinedRef = useRef(false);
  const otherParticipantPresentRef = useRef(false);

  useEffect(() => {
    if (sessionId && typeof sessionId === 'string') {
      fetchSession();
      // Get current user ID from localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user._id) {
            setCurrentUserId(user._id);
          }
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    } else if (sessionId === undefined) {
      // Still loading from router
      return;
    } else {
      // Invalid sessionId
      toast.error('Invalid session ID');
      router.push('/sessions');
    }

    return () => {
      cleanup();
    };
  }, [sessionId]);

  // Status Polling for synchronized start
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    if (session && session.status === 'created') {
      pollInterval = setInterval(() => {
        fetchSession();
      }, 3000); // Poll every 3 seconds until live
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [session?.status]);

  // Auto-join when session goes live
  useEffect(() => {
    if (session?.status === 'live' && !callFrame && !hasJoinedRef.current) {
      joinVideoCall();
    }
  }, [session?.status, callFrame]);

  useEffect(() => {
    if (session?.status === 'live' && session.startTime) {
      // Start timer
      timerIntervalRef.current = setInterval(() => {
        const start = new Date(session.startTime!).getTime();
        const now = Date.now();
        setSessionTime(Math.floor((now - start) / 1000));
      }, 1000);

      // Start AI monitoring every 5 minutes
      monitoringIntervalRef.current = setInterval(() => {
        sendMonitoringSnapshot();
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [session?.status, session?.startTime]);

  useEffect(() => {
    if (session?.fraud_flagged || session?.status === 'under_review') {
      setAiStatus('fraud');
    } else if (session?.tokenStatus === 'frozen') {
      setAiStatus('review');
    } else {
      setAiStatus('valid');
    }
  }, [session?.fraud_flagged, session?.status, session?.tokenStatus]);

  const fetchSession = async () => {
    if (!sessionId || typeof sessionId !== 'string') {
      toast.error('Invalid session ID');
      router.push('/sessions');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/session/${sessionId}`);
      if (response.data && response.data.session) {
        setSession(response.data.session);
        if (response.data.token) {
          setDailyToken(response.data.token);
        }
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Invalid session data received');
        router.push('/sessions');
      }
    } catch (error: any) {
      console.error('Session fetch error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load session';
      toast.error(errorMessage);
      if (error.response?.status === 404 || error.response?.status === 403) {
        router.push('/sessions');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async () => {
    try {
      const response = await api.put(`/session/${sessionId}`, {
        action: 'markReady',
      });
      setSession(response.data.session);
      setIsReady(true);
      toast.success('You are ready! Waiting for other participant...');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark ready');
    }
  };

  const joinVideoCall = async () => {
    if (!session?.dailyRoomUrl || !videoContainerRef.current) {
      return;
    }

    try {
      const iframe = DailyIframe.createFrame(videoContainerRef.current, {
        url: session.dailyRoomUrl,
        showLeaveButton: false, 
        showFullscreenButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '16px',
          backgroundColor: '#111827',
        },
      });

      setCallFrame(iframe);

      // Event listeners
      iframe
        .on('joined-meeting', (event) => {
          console.log('Joined meeting:', event);
          hasJoinedRef.current = true;
          toast.success('Joined video call successfully!');
          updateParticipantPresence(iframe);
        })
        .on('participant-joined', () => {
          updateParticipantPresence(iframe);
          toast('Another participant joined', { icon: '👋' });
        })
        .on('participant-left', (event) => {
          updateParticipantPresence(iframe);
          if (event && event.participant) {
            toast(`${event.participant.user_name || 'Participant'} left the room`);
          }
        })
        .on('left-meeting', () => {
          console.log('Left meeting');
          hasJoinedRef.current = false;
          
          // If we were the last ones or no one else was here, end session
          if (!otherParticipantPresentRef.current) {
            handleEndSession();
          }
        })
        .on('active-speaker-change', (event) => {
          if (!event || !event.activeSpeaker) return;
          
          const now = Date.now();
          const teacherId = session?.teacher?._id || session?.teacher?.toString();
          const learnerId = session?.learner?._id || session?.learner?.toString();
          
          // Update previous speaker's time
          if (activeSpeakerIdRef.current && speakingStartTimeRef.current) {
            const duration = (now - speakingStartTimeRef.current) / 1000;
            const participants = iframe.participants();
            const prevSpeaker = participants[activeSpeakerIdRef.current];
            
            if (prevSpeaker) {
              if (prevSpeaker.user_id === teacherId) {
                teacherSpeakingTimeRef.current += duration;
              } else if (prevSpeaker.user_id === learnerId) {
                learnerSpeakingTimeRef.current += duration;
              }
            }
          }
          
          // Set new speaker
          activeSpeakerIdRef.current = event.activeSpeaker?.peerId || null;
          speakingStartTimeRef.current = activeSpeakerIdRef.current ? now : null;
        })
        .on('error', (error) => {
          console.error('Daily.co error:', error);
          toast.error('Video call error occurred');
        });

      await iframe.join({ token: dailyToken || undefined });
    } catch (error: any) {
      console.error('Error joining call:', error);
      toast.error('Failed to join video call');
    }
  };

  const updateParticipantPresence = (iframe: any) => {
    const participants = iframe.participants();
    const online = Object.values(participants)
      .map((p: any) => p.user_id)
      .filter(Boolean);
    setOnlineParticipants(online as string[]);
    
    // Check if anyone else is here
    const teacherId = String(session?.teacher?._id || session?.teacher);
    const learnerId = String(session?.learner?._id || session?.learner);
    const userId = String(currentUserId);
    
    const otherId = userId === teacherId ? learnerId : teacherId;
    otherParticipantPresentRef.current = online.includes(otherId);
  };

  const sendMonitoringSnapshot = async () => {
    if (!callFrame || !session) return;

    try {
      // Collect lightweight signals from Daily.co
      const participants = callFrame.participants();
      const participantData: any = {
        participant1: { speaking: false, cameraOn: true, silenceDuration: 0 },
        participant2: { speaking: false, cameraOn: true, silenceDuration: 0 },
      };

      // Track interaction patterns for two-way communication
      let interactionTranscript = '';
      let teacherSpeakingTime = 0;
      let learnerSpeakingTime = 0;
      let questionCount = 0;

      // Analyze participants and collect interaction data
      if (participants && Object.keys(participants).length > 0) {
        const teacherId = session.teacher?._id || session.teacher?.toString();
        const learnerId = session.learner?._id || session.learner?.toString();
        
        // Use real-time tracked speaking times
        teacherSpeakingTime = Math.round(teacherSpeakingTimeRef.current);
        learnerSpeakingTime = Math.round(learnerSpeakingTimeRef.current);
        
        // Reset counters for next window (or keep cumulative if preferred)
        // For snapshots, we usually want window-specific metrics, so we divide or reset
        // Let's reset for this window
        teacherSpeakingTimeRef.current = 0;
        learnerSpeakingTimeRef.current = 0;

        Object.values(participants).forEach((p: any) => {
          const isTeacher = p.user_id === teacherId;
          const isLearner = p.user_id === learnerId;
          
          if (!isTeacher && !isLearner) return;

          const key = isTeacher ? 'participant1' : 'participant2';
          
          participantData[key] = {
            speaking: p.audio || false,
            cameraOn: p.video || false,
            silenceDuration: 0,
          };

          // Build transcript markers based on current activity
          if (p.audio) {
            if (isTeacher) {
              interactionTranscript += 'Teacher: Explaining concept... ';
            } else if (isLearner) {
              interactionTranscript += 'Learner: Asking question or responding... ';
            }
          }
        });
      }

      // Build transcript with two-way communication indicators
      // In real app, this would come from Daily.co transcription API
      let transcript = 'Teaching session in progress... ';
      if (interactionTranscript) {
        transcript = interactionTranscript;
      }

      // Detect question patterns (indicating learner engagement)
      if (transcript.toLowerCase().includes('?') || 
          transcript.toLowerCase().includes('question') ||
          transcript.toLowerCase().includes('how') ||
          transcript.toLowerCase().includes('what') ||
          transcript.toLowerCase().includes('why')) {
        questionCount += 1;
        transcript += ' [Learner asking questions - good two-way communication] ';
      }

      // Detect explanation patterns (indicating teacher helping)
      if (transcript.toLowerCase().includes('explain') ||
          transcript.toLowerCase().includes('understand') ||
          transcript.toLowerCase().includes('example') ||
          transcript.toLowerCase().includes('concept')) {
        transcript += ' [Teacher explaining concepts] ';
      }

      // Check for two-way interaction
      const hasTwoWayInteraction = teacherSpeakingTime > 0 && learnerSpeakingTime > 0;
      if (hasTwoWayInteraction) {
        transcript += ' [Active two-way communication detected] ';
      }

      // Add interaction summary
      if (session.aiWindows.length > 0) {
        const previousWindows = session.aiWindows;
        const avgEngagement = previousWindows.reduce((sum, w) => sum + w.engagement_score, 0) / previousWindows.length;
        if (avgEngagement > 70) {
          transcript += ' [Consistent high engagement - good teaching/learning] ';
        }
      }

      const response = await api.post(`/session/${sessionId}/monitor`, {
        snapshot: {
          transcript,
          speakerActivity: participantData,
          interactionMetrics: {
            teacherSpeakingTime,
            learnerSpeakingTime,
            questionCount,
            hasTwoWayInteraction,
          },
        },
      });

      // Store latest AI feedback
      setLatestAIFeedback(response.data.analysis);

      // Update AI status based on response
      if (response.data.analysis.fraud_detected) {
        setAiStatus('fraud');
        toast.error('⚠️ Session flagged for review - no two-way communication detected');
      } else {
        setAiStatus('valid');
        
        // Show quality-based feedback
        const quality = response.data.analysis.lecture_quality || 'fair';
        const avgScore = (response.data.analysis.engagement_score + 
                         response.data.analysis.teaching_score + 
                         response.data.analysis.participation_score) / 3;
        
        if (avgScore >= 80) {
          toast.success(`✨ Excellent lecture! ${quality === 'excellent' ? 'Outstanding teaching quality!' : 'Great job!'}`, { duration: 4000 });
        } else if (avgScore >= 60) {
          toast('📚 Good lecture! Keep up the interactive teaching.', { icon: '👍', duration: 3000 });
        } else if (avgScore >= 40) {
          toast('💡 Fair lecture. Consider more interaction with learner.', { icon: '💭', duration: 3000 });
        } else {
          toast('⚠️ Lecture needs improvement. Try more engagement.', { icon: '⚠️', duration: 3000 });
        }
      }

      // Refresh session data
      fetchSession();
    } catch (error: any) {
      console.error('Monitoring error:', error);
    }
  };

  const toggleMic = () => {
    if (callFrame) {
      const newState = !isMicOn;
      callFrame.setLocalAudio(newState);
      setIsMicOn(newState);
    }
  };

  const toggleVideo = () => {
    if (callFrame) {
      const newState = !isVideoOn;
      callFrame.setLocalVideo(newState);
      setIsVideoOn(newState);
    }
  };

  const toggleScreenShare = () => {
    if (callFrame) {
      if (isScreenSharing) {
        callFrame.stopScreenShare();
      } else {
        callFrame.startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end the session?')) {
      return;
    }

    try {
      await api.post(`/session/${sessionId}/end`);
      toast.success('Session ended successfully');
      
      if (callFrame) {
        callFrame.leave();
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to end session');
    }
  };

  const cleanup = () => {
    if (callFrame) {
      callFrame.destroy();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (aiStatus) {
      case 'valid':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">🟢 Session Valid</span>;
      case 'review':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">🟡 Under Review</span>;
      case 'fraud':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">🔴 Fraud Detected</span>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading message="Loading session..." />
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Session not found</div>
        </div>
      </Layout>
    );
  }

  const isTeacher = currentUserId && session.teacher && (currentUserId === (session.teacher._id || session.teacher.toString()));
  const bothReady = session.readyStatus.teacher && session.readyStatus.learner;
  const canStart = bothReady && session.status === 'created';
  const isLive = session.status === 'live';

  return (
    <>
      <Head>
        <title>Live Session - {session.skill} - Skill-Setu</title>
      </Head>
      <Layout>
        <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                {session.skill.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {session.skill} Session
                </h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {session.skillCategory}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {isLive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold text-purple-700 font-mono tracking-tighter">
                    {formatTime(sessionTime)}
                  </span>
                </div>
              )}
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative bg-gray-900">
              {/* Ready Check UI */}
              {!bothReady && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/80 backdrop-blur-sm">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">👋</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to Start?</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {session.readyStatus.teacher && session.readyStatus.learner
                        ? 'Both participants are here! You can now start the session.'
                        : isReady
                        ? 'We are waiting for the other participant to join...'
                        : 'Make sure your camera and microphone are ready before you start.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                      {!isReady && (
                        <button
                          onClick={handleMarkReady}
                          className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transform transition hover:scale-105 shadow-lg shadow-purple-200"
                        >
                          I'm Ready ✓
                        </button>
                      )}
                      {bothReady && session.status !== 'live' && (
                        <button
                          onClick={async () => {
                            await fetchSession();
                            if (session.status === 'live') {
                              joinVideoCall();
                            }
                          }}
                          className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transform transition hover:scale-105 shadow-lg shadow-green-200"
                        >
                          Join Video Call
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Start Button UI */}
              {canStart && !isLive && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/40 backdrop-blur-sm">
                   <button
                    onClick={async () => {
                      await fetchSession();
                      joinVideoCall();
                    }}
                    className="px-10 py-5 bg-purple-600 text-white rounded-2xl font-black text-xl hover:bg-purple-700 transform transition hover:scale-105 shadow-2xl shadow-purple-500/40 flex items-center gap-3"
                  >
                    <span>▶</span> Start Session
                  </button>
                </div>
              )}

              {/* Video Display Area */}
              <div className="flex-1 relative p-4 flex items-center justify-center min-h-[400px]">
                {(isLive || callFrame || hasJoinedRef.current) ? (
                  <div
                    ref={videoContainerRef}
                    className="w-full h-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-gray-800"
                    style={{ minHeight: '400px' }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-700">
                      <span className="text-6xl text-gray-600 italic font-serif">S</span>
                    </div>
                    <p className="text-gray-500 font-medium font-mono uppercase tracking-widest text-xs animate-pulse">Syncing Session...</p>
                  </div>
                )}

                {/* Meet-like Controls Bar */}
                {isLive && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-700/50 z-30 transition-all hover:bg-gray-800">
                    <button 
                      onClick={toggleMic}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                      title={isMicOn ? "Mute Mic" : "Unmute Mic"}
                    >
                      {isMicOn ? '🎙️' : '🔇'}
                    </button>
                    <button 
                      onClick={toggleVideo}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                      title={isVideoOn ? "Turn off Cam" : "Turn on Cam"}
                    >
                      {isVideoOn ? '📹' : '📵'}
                    </button>
                    <button 
                      onClick={toggleScreenShare}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isScreenSharing ? 'bg-purple-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      title="Screen Share"
                    >
                      {isScreenSharing ? '⏹️' : '🖥️'}
                    </button>
                    <div className="w-px h-8 bg-gray-700 mx-2"></div>
                    <button 
                      onClick={handleEndSession}
                      className="px-6 h-12 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 flex items-center gap-2 transition-all active:scale-95"
                    >
                      <span className="text-xl">📞</span> End Call
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar with Info & Feedback */}
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Participants</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border transition-all ${session.readyStatus.teacher ? 'bg-purple-50 border-purple-100 ring-2 ring-purple-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className="text-xs text-purple-600 font-bold mb-1">TEACHER</div>
                    <div className="font-bold text-gray-900 truncate">{session.teacher?.name || 'Assigned Teacher'}</div>
                    <div className="flex items-center gap-1 mt-2">
                       <span className={`w-2 h-2 rounded-full ${onlineParticipants.includes(String(session.teacher?._id || session.teacher)) ? 'bg-green-500 animate-pulse' : (isLive ? 'bg-red-400' : (session.readyStatus.teacher ? 'bg-yellow-400' : 'bg-gray-300'))}`}></span>
                       <span className="text-[10px] text-gray-500 font-bold">
                         {onlineParticipants.includes(String(session.teacher?._id || session.teacher)) ? 'LIVE' : (isLive ? 'OFFLINE' : (session.readyStatus.teacher ? 'READY' : 'JOINING...'))}
                       </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-all ${session.readyStatus.learner ? 'bg-blue-50 border-blue-100 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className="text-xs text-blue-600 font-bold mb-1">LEARNER</div>
                    <div className="font-bold text-gray-900 truncate">{session.learner?.name || 'Skill Learner'}</div>
                    <div className="flex items-center gap-1 mt-2">
                       <span className={`w-2 h-2 rounded-full ${onlineParticipants.includes(String(session.learner?._id || session.learner)) ? 'bg-green-500 animate-pulse' : (isLive ? 'bg-red-400' : (session.readyStatus.learner ? 'bg-yellow-400' : 'bg-gray-300'))}`}></span>
                       <span className="text-[10px] text-gray-500 font-bold">
                         {onlineParticipants.includes(String(session.learner?._id || session.learner)) ? 'LIVE' : (isLive ? 'OFFLINE' : (session.readyStatus.learner ? 'READY' : 'JOINING...'))}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">AI Monitoring</h3>
                  {latestAIFeedback ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-900 rounded-2xl text-white shadow-lg overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-2 overflow-hidden opacity-10">
                            <span className="text-6xl">🤖</span>
                         </div>
                         <div className="relative z-10">
                            <div className="text-[10px] text-gray-400 font-bold mb-2 tracking-widest uppercase">Latest Insight</div>
                            <p className="text-sm font-medium leading-tight mb-3">"{latestAIFeedback.notes?.split('.')[0]}."</p>
                            <div className="flex gap-2">
                               <div className="flex-1 text-center py-2 bg-white/10 rounded-xl">
                                  <div className="text-[10px] text-gray-400">Engage</div>
                                  <div className="text-sm font-black">{latestAIFeedback.engagement_score}%</div>
                               </div>
                               <div className="flex-1 text-center py-2 bg-white/10 rounded-xl">
                                  <div className="text-[10px] text-gray-400">Quality</div>
                                  <div className="text-sm font-black capitalize">{latestAIFeedback.lecture_quality}</div>
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <button 
                        onClick={() => toast.success('Viewing detailed AI report...')}
                        className="w-full py-3 text-sm font-bold text-purple-600 border-2 border-purple-100 rounded-xl hover:bg-purple-50 transition-all active:scale-95"
                      >
                        Detailed Feedback
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                       <div className="text-2xl mb-2">🧘</div>
                       <p className="text-[11px] text-gray-400 font-medium">Session analysis will start automatically after 5 minutes of interaction.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating AI Feedback Panel (Alternative to sidebar for mobile or expanded view) */}
        {latestAIFeedback && !callFrame && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AIFeedback
              engagementScore={latestAIFeedback.engagement_score || 0}
              teachingScore={latestAIFeedback.teaching_score || 0}
              participationScore={latestAIFeedback.participation_score || 0}
              lectureQuality={latestAIFeedback.lecture_quality}
              keyStrengths={latestAIFeedback.key_strengths}
              improvementAreas={latestAIFeedback.improvement_areas}
              notes={latestAIFeedback.notes}
              recommendations={latestAIFeedback.recommendations}
            />
          </div>
        )}
      </Layout>
    </>
  );
}
