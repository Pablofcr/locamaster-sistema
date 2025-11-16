import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      company: string
      avatar: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    company: string
    avatar: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
    company: string
    avatar: string
  }
}
