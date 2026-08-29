import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { RoomWithParticipantStatus } from "@backend/shared";

interface SeenUsersListProps {
  seenUsers: RoomWithParticipantStatus["room"]["participants"];
}

export function SeenUsersList({ seenUsers }: SeenUsersListProps) {
  if (seenUsers.length === 0) {
    return (
      <div className="text-xs text-muted-foreground p-2">
        No one has seen this message yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground mb-2">
        Seen by {seenUsers.length} {seenUsers.length === 1 ? "person" : "people"}
      </div>
      {seenUsers.map((participant) => (
        <div key={participant.userId} className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={participant.user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(participant.user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{participant.user.name}</span>
        </div>
      ))}
    </div>
  );
}
