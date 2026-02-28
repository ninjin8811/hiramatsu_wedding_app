import PreparePage from "@user/_pages/PreparePage/PreparePage"
import { getGame, getItems } from "../../../_repositories/server"
import { UserPreparePath } from "@/app/_utils/page_link"
import { redirectPathByStatus } from "../../../_utils/redirectPathByStatus"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{
    gameId: string
    userId: string
  }>
}

export default async function Page(props: Props) {
  const { gameId, userId } = await props.params
  const game = await getGame(gameId)
  const items = await getItems()

  // game.users配列から該当するユーザーを取得
  const user = game.users.find(
    (u) => u.id.toLowerCase() == userId.toLowerCase(),
  )
  if (!user) {
    throw new Error(`User with ID ${userId} not found in game ${gameId}`)
  }

  const currentPath = UserPreparePath(gameId, userId)
  const redirectPath = redirectPathByStatus(game, userId, currentPath)
  if (redirectPath) return redirect(redirectPath)

  return (
    <PreparePage
      gameId={gameId}
      userId={userId}
      user={user}
      game={game}
      items={items}
    />
  )
}
