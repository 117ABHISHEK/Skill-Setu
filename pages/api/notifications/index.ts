import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const userId = req.user?.userId;

      if (req.method === 'GET') {
        const notifications = await Notification.find({ recipient: userId })
          .sort({ createdAt: -1 })
          .limit(50);
        
        const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

        return res.status(200).json({ notifications, unreadCount });
      }

      if (req.method === 'PUT') {
        const { notificationId, action } = req.body;

        if (action === 'markRead') {
          if (notificationId) {
            await Notification.findOneAndUpdate(
              { _id: notificationId, recipient: userId },
              { read: true }
            );
          } else {
            // Mark all as read
            await Notification.updateMany(
              { recipient: userId, read: false },
              { read: true }
            );
          }
          return res.status(200).json({ message: 'Notifications updated' });
        }
      }

      if (req.method === 'DELETE') {
        const { notificationId } = req.query;
        if (notificationId) {
          await Notification.deleteOne({ _id: notificationId, recipient: userId });
        } else {
          await Notification.deleteMany({ recipient: userId });
        }
        return res.status(200).json({ message: 'Notifications deleted' });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Notification API Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
