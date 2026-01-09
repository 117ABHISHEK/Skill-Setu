import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function transferTokens(fromUserId: string, toUserId: string, amount: number): Promise<boolean> {
  try {
    await dbConnect();

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return false;
    }

    if (fromUser.tokens < amount) {
      return false;
    }

    fromUser.tokens -= amount;
    toUser.tokens += amount;

    await fromUser.save();
    await toUser.save();

    return true;
  } catch (error) {
    console.error('Token Transfer Error:', error);
    return false;
  }
}

export async function addTokens(userId: string, amount: number, reason: string): Promise<boolean> {
  try {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    user.tokens += amount;
    await user.save();

    return true;
  } catch (error) {
    console.error('Add Tokens Error:', error);
    return false;
  }
}

export async function deductTokens(userId: string, amount: number): Promise<boolean> {
  try {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    if (user.tokens < amount) {
      return false;
    }

    user.tokens -= amount;
    await user.save();

    return true;
  } catch (error) {
    console.error('Deduct Tokens Error:', error);
    return false;
  }
}
