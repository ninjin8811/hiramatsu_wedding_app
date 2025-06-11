export function UserHomePath(gameId: string, userId: string) {
  return `/game/${gameId}/user/${userId}`;
}

export function UserTeamsPath(gameId: string, userId: string) {
  return `/game/${gameId}/user/${userId}/teams`;
}

export function UserPreparePath(gameId: string, userId: string) {
  return `/game/${gameId}/user/${userId}/prepare`;
}
export function UserPendingPath(gameId: string, userId: string) {
  return `/game/${gameId}/user/${userId}/pending`;
}

export function UserQuestionsPath(gameId: string, userId: string) {
  return `/game/${gameId}/user/${userId}/questions`;
}

export function UserResultPath(gameId: string, userId: string) {
  return `/game/${gameId}/user/${userId}/result`;
}
