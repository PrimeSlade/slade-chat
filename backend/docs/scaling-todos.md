# Scaling TODOs

## Invite Friends Flow

- [ ] Introduce a narrow `FriendshipReadPort` for rooms to depend on, instead of injecting broad `UsersService`.
- [ ] Add a targeted friendship query in Users/Friendship module: filter by `myId` + candidate IDs to avoid fetching all friends.
- [ ] Keep room-domain logic in `RoomsService` only: membership checks, room type checks, dedupe, and eligibility decisions.
- [ ] Add idempotent behavior contract for concurrent invites to the same room/member pair.

## Database and Query Performance

- [ ] Verify and tune indexes for friendship lookup hot paths (`status`, `senderId`, `receiverId`).
- [ ] Benchmark `GET /rooms/:roomId/invite-candidates` and `POST /rooms/:roomId/members` for users with large friend graphs.
- [ ] Add query-level limits/guardrails for high-cardinality scenarios.

## Testing

- [ ] Add stress/integration tests for large friend lists and concurrent invite requests.
- [ ] Add regression tests for authorization boundaries (non-member invite attempts, direct-room invite attempts).
- [ ] Add contract tests for API response stability of invite endpoints.
