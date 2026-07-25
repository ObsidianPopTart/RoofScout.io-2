import type { DefaultSession } from "next-auth";

// Augments Auth.js's Session/User/JWT shapes with our multi-tenant fields.
// v1 assumes one active org per user, set at signup/login time.
//
// IMPORTANT: `next-auth`'s own `index.d.ts`/`jwt.d.ts` only re-export these
// types (`export type { Session, User } from "@auth/core/types"`) — they are
// not declared there. Module augmentation only merges with the module where
// an interface is *originally* declared, so this must target `@auth/core/*`,
// not `next-auth`/`next-auth/jwt` — augmenting the re-export barrel silently
// does nothing (confirmed by a real `tsc` failure: `token.id` stayed `unknown`).
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      orgId: string;
      orgName: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    orgId: string;
    orgName: string;
    role: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    orgId: string;
    orgName: string;
    role: string;
  }
}
