const DAILY_API_KEY = process.env.DAILY_API_KEY || '';
const DAILY_API_URL = 'https://api.daily.co/v1';

if (!DAILY_API_KEY) {
  console.warn('DAILY_API_KEY not set. Video functionality will be limited.');
}

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  config: {
    exp?: number; // Expiration time in seconds
    max_participants?: number;
    enable_chat?: boolean;
    enable_screenshare?: boolean;
  };
}

export async function createDailyRoom(
  sessionId: string,
  expiresInMinutes: number = 60
): Promise<DailyRoom> {
  if (!DAILY_API_KEY) {
    throw new Error('Daily.co API key not configured');
  }

  const expiresAt = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `skill-setu-${sessionId}`,
        privacy: 'public', // Using public to test if private rooms are restricted
        properties: {
          exp: expiresAt,
          max_participants: 2,
          enable_chat: true,
          enable_screenshare: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Daily.co API error: ${error}`);
    }

    const room = await response.json();
    return {
      id: room.id || room.name,
      name: room.name,
      url: room.url,
      config: room.config || room.properties || {
        exp: room.properties?.exp,
        max_participants: room.properties?.max_participants,
        enable_chat: room.properties?.enable_chat,
        enable_screenshare: room.properties?.enable_screenshare,
      },
    };
  } catch (error) {
    console.error('Daily.co Room Creation Error:', error);
    throw error;
  }
}

export async function getDailyRoomToken(roomName: string, userId: string, isOwner: boolean = false): Promise<string> {
  if (!DAILY_API_KEY) {
    throw new Error('Daily.co API key not configured');
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: userId,
          is_owner: isOwner,
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Daily.co Token Error: ${error}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Daily.co Token Generation Error:', error);
    throw error;
  }
}

export async function deleteDailyRoom(roomName: string): Promise<void> {
  if (!DAILY_API_KEY) {
    return;
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Daily.co Room Deletion Error: ${error}`);
    }
  } catch (error) {
    console.error('Daily.co Room Deletion Error:', error);
    throw error;
  }
}

export async function getRoomInfo(roomName: string): Promise<any> {
  if (!DAILY_API_KEY) {
    throw new Error('Daily.co API key not configured');
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Daily.co Room Info Error: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Daily.co Room Info Error:', error);
    throw error;
  }
}
