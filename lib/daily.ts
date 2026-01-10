// Jitsi Meet configuration (Replaced Daily.co to avoid payment issues)
export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  config: any;
}

export async function createDailyRoom(
  sessionId: string,
  expiresInMinutes: number = 60
): Promise<DailyRoom> {
  // Jitsi doesn't need API calls to create rooms, just a unique name
  const roomName = `SkillSetu-${sessionId}`;
  return {
    id: roomName,
    name: roomName,
    url: `https://meet.jit.si/${roomName}`,
    config: {
      exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60
    }
  };
}

export async function getDailyRoomToken(roomName: string, userId: string, isOwner: boolean = false): Promise<string> {
  // Jitsi (public) doesn't use tokens
  return '';
}

export async function deleteDailyRoom(roomName: string): Promise<void> {
  // No action needed for Jitsi
  return;
}

export async function getRoomInfo(roomName: string): Promise<any> {
  return { name: roomName };
}
