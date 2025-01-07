import { TalkableContextProvider } from "../../contexts/talkables/talkable"
import { Chats } from "./Chats"

export const TalkableHome = () => {
    return (
        <TalkableContextProvider>
            <Chats />
        </TalkableContextProvider>
    )
}