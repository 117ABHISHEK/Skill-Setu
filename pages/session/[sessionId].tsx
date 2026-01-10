import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import AIFeedback from '@/components/AIFeedback';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';

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

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function LiveSession() {
  const router = useRouter();
  const { sessionId: sessionIdQuery } = router.query;
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
      return;
    } else {
      toast.error('Invalid session ID');
      router.push('/sessions');
    }

    return () => {
      cleanup();
    };
  }, [sessionId]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    if (session && (session.status === 'created' || session.status === 'live')) {
      pollInterval = setInterval(() => {
        fetchSession();
      }, 3000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [session?.status]);

  useEffect(() => {
    if (session && (session.status === 'completed' || session.status === 'cancelled')) {
      if (!hasJoinedRef.current) {
         router.push('/dashboard');
      } else {
         handleEndSession(true);
      }
    }
  }, [session?.status]);

  useEffect(() => {
    if (session?.status === 'live' && !callFrame && !hasJoinedRef.current) {
      joinVideoCall();
    }
  }, [session?.status, callFrame]);

  useEffect(() => {
    if (session?.status === 'live' && session.startTime) {
      timerIntervalRef.current = setInterval(() => {
        const start = new Date(session.startTime!).getTime();
        const now = Date.now();
        setSessionTime(Math.floor((now - start) / 1000));
      }, 1000);

      monitoringIntervalRef.current = setInterval(() => {
        sendMonitoringSnapshot();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
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
      return;
    }
    try {
      const response = await api.get(`/session/${sessionId}`);
      if (response.data && response.data.session) {
        setSession(response.data.session);
      }
    } catch (error: any) {
      console.error('Session fetch error:', error);
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
    if (!session || !videoContainerRef.current) return;

    if (!window.JitsiMeetExternalAPI) {
      toast.error('Jitsi API not loaded. Retrying...');
      setTimeout(joinVideoCall, 2000);
      return;
    }

    const roomName = session.dailyRoomUrl.split('/').pop() || `SkillSetu-${session.sessionId}`;
    const domain = 'meet.jit.si';
    
    try {
      const options = {
        roomName: roomName,
        parentNode: videoContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat',
            'recording', 'livestreaming', 'etherpad', 'sharedvideo', 'settings',
            'raisehand', 'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'security'
          ],
        },
        userInfo: {
          displayName: currentUserId === (session.teacher._id || session.teacher) ? 'Teacher' : 'Learner'
        }
      };

      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      setCallFrame(jitsiApi);

      jitsiApi.addEventListeners({
        videoConferenceJoined: (event: any) => {
          console.log('Joined meeting:', event);
          hasJoinedRef.current = true;
          toast.success('Joined video call successfully!');
          updateParticipantPresence(jitsiApi);
        },
        participantJoined: () => {
          updateParticipantPresence(jitsiApi);
          toast('Another participant joined', { icon: '👋' });
        },
        participantLeft: (event: any) => {
          updateParticipantPresence(jitsiApi);
          toast(`Participant left the room`);
        },
        videoConferenceLeft: () => {
          hasJoinedRef.current = false;
          if (!otherParticipantPresentRef.current) {
            handleEndSession(true);
          }
        },
        dominantSpeakerChanged: (event: any) => {
          const now = Date.now();
          const teacherId = session?.teacher?._id || session?.teacher?.toString();
          const learnerId = session?.learner?._id || session?.learner?.toString();
          
          if (activeSpeakerIdRef.current && speakingStartTimeRef.current) {
            const duration = (now - speakingStartTimeRef.current) / 1000;
            if (activeSpeakerIdRef.current === teacherId) {
              teacherSpeakingTimeRef.current += duration;
            } else if (activeSpeakerIdRef.current === learnerId) {
              learnerSpeakingTimeRef.current += duration;
            }
          }
          
          activeSpeakerIdRef.current = event.id; // In Jitsi id is usually display name or random id
          speakingStartTimeRef.current = now;
        }
      });
    } catch (error: any) {
      console.error('Error joining call:', error);
      toast.error('Failed to join video call');
    }
  };

  const updateParticipantPresence = (jitsi: any) => {
    const participants = jitsi.getParticipantsInfo();
    const online = participants.map((p: any) => p.participantId);
    setOnlineParticipants(online);
    
    // In Jitsi we don't always have the custom userId in the participant object easily
    // So we'll assume if there's > 1 participant, the other is present
    otherParticipantPresentRef.current = participants.length > 1;
  };

  const sendMonitoringSnapshot = async () => {
    if (!callFrame || !session) return;

    try {
      const participants = callFrame.getParticipantsInfo();
      const teacherSpeakingTime = Math.round(teacherSpeakingTimeRef.current);
      const learnerSpeakingTime = Math.round(learnerSpeakingTimeRef.current);
      
      teacherSpeakingTimeRef.current = 0;
      learnerSpeakingTimeRef.current = 0;

      const snapshot = {
        transcript: "Two-way communication in progress via Jitsi...",
        speakerActivity: {
          participant1: { speaking: teacherSpeakingTime > 0, cameraOn: true },
          participant2: { speaking: learnerSpeakingTime > 0, cameraOn: true },
        },
        interactionMetrics: {
          teacherSpeakingTime,
          learnerSpeakingTime,
          questionCount: 1, // Placeholder
          hasTwoWayInteraction: teacherSpeakingTime > 0 && learnerSpeakingTime > 0,
        },
      };

      const response = await api.post(`/session/${sessionId}/monitor`, { snapshot });
      setLatestAIFeedback(response.data.analysis);
      fetchSession();
    } catch (error: any) {
      console.error('Monitoring error:', error);
    }
  };

  const toggleMic = () => callFrame?.executeCommand('toggleAudio');
  const toggleVideo = () => callFrame?.executeCommand('toggleVideo');
  const toggleScreenShare = () => callFrame?.executeCommand('toggleShareScreen');

  const handleEndSession = async (isAutomatic = false) => {
    if (!isAutomatic && !confirm('Are you sure you want to end the session?')) return;

    try {
      await api.post(`/session/${sessionId}/end`);
      if (!isAutomatic) toast.success('Session ended successfully');
      if (callFrame) callFrame.dispose();
      router.push('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.error === 'Session already ended') {
        if (callFrame) callFrame.dispose();
        router.push('/dashboard');
        return;
      }
      toast.error(error.response?.data?.error || 'Failed to end session');
    }
  };

  const cleanup = () => {
    if (callFrame) callFrame.dispose();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (aiStatus) {
      case 'valid': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">🟢 Session Valid</span>;
      case 'review': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">🟡 Under Review</span>;
      case 'fraud': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">🔴 Fraud Detected</span>;
    }
  };

  if (loading) return <Layout><Loading message="Loading session..." /></Layout>;
  if (!session) return <Layout><div className="flex items-center justify-center h-64 text-gray-600">Session not found</div></Layout>;

  const bothReady = session.readyStatus.teacher && session.readyStatus.learner;
  const isLive = session.status === 'live';

  return (
    <>
      <Head><title>Live Session - {session.skill} - Skill-Setu</title></Head>
      <Layout>
        <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">{session.skill.charAt(0)}</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">{session.skill} Session</h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{session.skillCategory}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {isLive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold text-purple-700 font-mono tracking-tighter">{formatTime(sessionTime)}</span>
                </div>
              )}
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 flex flex-col relative bg-gray-900">
              {!bothReady && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/80 backdrop-blur-sm">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-4xl">👋</span></div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to Start?</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {isReady ? 'Waiting for the other participant to join...' : 'Make sure your camera and microphone are ready before you start.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                      {!isReady && (
                        <button onClick={handleMarkReady} className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-lg">I'm Ready ✓</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 relative p-4 flex items-center justify-center min-h-[400px]">
                {(isLive || callFrame || hasJoinedRef.current) ? (
                  <div ref={videoContainerRef} className="w-full h-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-gray-800" style={{ minHeight: '400px' }} />
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-700"><span className="text-6xl text-gray-600 italic font-serif">S</span></div>
                    <p className="text-gray-500 font-medium font-mono uppercase tracking-widest text-xs animate-pulse">Syncing Session...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Participants</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${session.readyStatus.teacher ? 'bg-purple-50 border-purple-100 ring-2 ring-purple-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className="text-xs text-purple-600 font-bold mb-1">TEACHER</div>
                    <div className="font-bold text-gray-900 truncate">{session.teacher?.name || 'Teacher'}</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${session.readyStatus.learner ? 'bg-blue-50 border-blue-100 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className="text-xs text-blue-600 font-bold mb-1">LEARNER</div>
                    <div className="font-bold text-gray-900 truncate">{session.learner?.name || 'Learner'}</div>
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
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                       <div className="text-2xl mb-2">🧘</div>
                       <p className="text-[11px] text-gray-400 font-medium">Session analysis will start automatically after 5 minutes of interaction.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8">
                   <button onClick={() => handleEndSession()} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg transition-all active:scale-95">End Session</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating AI Feedback Panel */}
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
