# Portal User Type Permissions

Describes what each portal user type can do across different sections of DocSpace.

**Legend:**
- `+` — allowed
- `-` — not allowed
- `~` — allowed with restrictions

## My Documents

| Permission | DocSpace Owner | DocSpace Admin | Room Admin | User | Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| Create files and folders | + | + | + | + | - |
| Upload files and folders | + | + | + | + | - |
| Move files and folders | + | + | + | + | - |
| Copy files and folders | + | + | + | + | - |
| Rename files and folders | + | + | + | + | - |
| Download files and folders | + | + | + | + | - |
| Delete files and folders | + | + | + | + | - |

---

## Rooms

| Permission | DocSpace Owner | DocSpace Admin | Room Admin | User | Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| See all rooms | + | + | - | - | - |
| See own rooms (where user is owner) | + | + | + | - | - |
| Create rooms | + | + | + | - | - |
| See rooms they are invited to | + | + | + | + | + |
| Pin rooms to top | + | + | + | ~ | ~ |
| View members list | + | + | + | + | + |
| View room history | + | + | + | + | + |
| View room details | + | + | + | ~ | + |
| Edit own room | + | + | + | - | - |
| Invite external users to room | + | + | + | ~ | ~ |
| Invite internal users/groups to room | + | + | + | ~ | - |
| Assign member roles when inviting | + | + | + | ~ | ~ |
| Change member/group roles in room | + | + | + | - | - |
| Remove users/groups from room | + | + | + | - | - |
| Archive own room | + | + | + | - | - |
| Duplicate own room | + | + | + | - | - |
| Duplicate another user's room | + | + | - | - | - |
| Invite users/groups to another user's room | - | - | - | - | - |
| Assign/change roles in another user's room | - | - | - | - | - |
| Edit another user's room | - | - | - | - | - |
| Remove users/groups from another user's room | - | - | - | - | - |
| See sharing links of another user's public room | - | - | - | - | - |
| Change owner of another user's room | + | + | - | - | - |
| Archive another user's rooms | + | + | - | - | - |

**Test coverage:** `roomAccessDocSpaceAdmin.spec.ts`, `roomAccessRoomAdmin.spec.ts`, `roomAccessUser.spec.ts`, `roomAccessGuest.spec.ts`

---

## Archive

| Permission | DocSpace Owner | DocSpace Admin | Room Admin | User | Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| See all archived rooms | + | + | - | - | - |
| See own archived rooms (where user is owner) | + | + | + | - | - |
| Create rooms | - | - | - | - | - |
| See archived rooms they were invited to | + | + | + | + | + |
| Pin rooms to top | - | - | - | - | - |
| View members list | + | + | + | + | + |
| View room history | + | + | + | + | + |
| View room details | + | + | + | + | + |
| Edit room | - | - | - | - | - |
| Invite users to room | - | - | - | - | - |
| Assign/change member roles in room | - | - | - | - | - |
| Remove users from room | - | - | - | - | - |
| Remove users from another user's room | - | - | - | - | - |
| Duplicate own room to Rooms | + | + | + | - | - |
| Duplicate another user's room to Rooms | + | + | - | - | - |
| Restore any room | + | + | - | - | - |
| Restore own room | + | + | + | - | - |
| Delete own room | + | + | + | - | - |
| Delete any room | + | + | - | - | - |

---

## Accounts

| Permission | DocSpace Owner | DocSpace Admin | Room Admin | User | Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| Invite "DocSpace admin" | + | + | - | - | - |
| Invite "Room admin" | + | + | - | - | - |
| Invite "User" | + | + | + | - | - |
| Promote to "DocSpace admin" | + | - | - | - | - |
| Promote to "Room admin" | + | + | ~ | - | - |
| ↳ *Room Admin can request promotion via room; confirmed by Owner or DocSpace Admin in Accounts* | | | | | |
| Promote to "User" (if Guest) | + | + | + | - | - |
| Demote "DocSpace admin" to "Room admin" | + | - | - | - | - |
| Demote "DocSpace admin" to "User" | + | - | - | - | - |
| Demote "Room admin" to "User" | + | + | - | - | - |
| Demote "User" to "Guest" | + | + | - | - | - |
| Block "DocSpace admin" | + | - | - | - | - |
| Block "Room admin" | + | + | - | - | - |
| Block "User" | + | + | - | - | - |
| Block "Guest" | + | + | - | - | - |
| Overwrite user data (per block/unblock rules) | + | + | - | - | - |
| Delete "DocSpace admin" | + | - | - | - | - |
| Delete "Room admin" | + | + | - | - | - |
| Delete "User" | + | + | - | - | - |
| Delete "Guest" | + | + | - | - | - |
| Create groups | + | + | - | - | - |
| Edit groups | + | + | - | - | - |
| Change group membership | + | + | - | - | - |
| View groups list and contents | + | + | + | - | - |
| View other users' Guests list | + | + | - | - | - |
| View own Guests list | + | + | + | - | - |
| Add Guests to groups | + | + | - | - | - |

---

## Portal Settings

| Permission | DocSpace Owner | DocSpace Admin | Room Admin | User | Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| Delete portal | + | - | - | - | - |
| All other settings | + | + | - | - | - |

---

## Share

| Permission | DocSpace Owner | DocSpace Admin | Room Admin | User | Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| Share files with portal users | + | + | + | ~ | - |
| Share files with guests | + | + | + | ~ | - |
| Share files with guests not visible to user and unrelated to their rooms | + | + | - | - | - |
| View users and groups list in Contacts | + | + | + | - | - |

**Notes:**
- User can share files with portal users from My Documents (sharing is preserved regardless of Contacts section access)
- Room Admin and User cannot share files with guests they cannot see and who are not related to their rooms/context; this restriction is enforced at API level

---

<!-- Add other sections below as needed -->
