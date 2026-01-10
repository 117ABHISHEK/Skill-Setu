import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { analyzeSessionSnapshot } from '@/lib/ai';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const userId = req.user?.userId;

      const validation = validateInput(req, res, ['sessionId', 'snapshot']);
      if (validation) return;

      const { sessionId, snapshot } = req.body;

      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      // Analyze snapshot with AI
      const aiAnalysis = await analyzeSessionSnapshot(
        snapshot,
        session.skill,
        session.skillCategory
      );

      // Create monitoring snapshot
      const monitoringSnapshot = {
        timestamp: new Date(),
        transcript: snapshot.transcript,
        speakerActivity: snapshot.speakerActivity,
        engagement_score: aiAnalysis.engagement_score,
        teaching_score: aiAnalysis.teaching_score,
        participation_score: aiAnalysis.participation_score,
        fraud_detected: aiAnalysis.fraud_detected,
        notes: aiAnalysis.notes,
        aiAnalysis: aiAnalysis,
      };

      session.monitoring_snapshots.push(monitoringSnapshot);

      // If fraud detected, freeze session
      if (aiAnalysis.fraud_detected) {
        session.fraud_flagged = true;
        session.status = 'under_review';
      }

      await session.save();

      res.status(200).json({
        message: 'Snapshot analyzed',
        analysis: aiAnalysis,
        sessionStatus: session.status,
      });
    } catch (error: any) {
      console.error('Session Monitoring Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
