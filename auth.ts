import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Mock database - em produção, use um banco real
const users = [
  {
    id: "1",
    email: "admin@locamaster.com.br",
    password: "password123", // Senha em texto plano para desenvolvimento
    name: "Pablo Silva",
    role: "admin",
    company: "LocaMaster Pro",
    avatar: "/avatars/admin.jpg"
  },
  {
    id: "2", 
    email: "manager@locamaster.com.br",
    password: "password123", // Senha em texto plano para desenvolvimento
    name: "Maria Santos",
    role: "manager", 
    company: "LocaMaster Pro",
    avatar: "/avatars/manager.jpg"
  },
  {
    id: "3",
    email: "cliente@construtoraalpha.com.br", 
    password: "password123", // Senha em texto plano para desenvolvimento
    name: "João Silva Santos",
    role: "client",
    company: "Construtora Alpha Ltda",
    avatar: "/avatars/client.jpg"
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "seu@email.com"
        },
        password: { 
          label: "Senha", 
          type: "password",
          placeholder: "Sua senha"
        }
      },
      async authorize(credentials) {
        console.log("Tentativa de login:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Credenciais faltando");
          return null
        }

        // Encontrar usuário
        const user = users.find(u => u.email === credentials.email)
        if (!user) {
          console.log("Usuário não encontrado:", credentials.email);
          return null
        }

        // Verificar senha (desenvolvimento - comparação direta)
        const isValidPassword = credentials.password === user.password;
        console.log("Senha válida:", isValidPassword, "| Enviada:", credentials.password, "| Esperada:", user.password);

        if (!isValidPassword) {
          console.log("Senha incorreta");
          return null
        }

        console.log("Login bem-sucedido para:", user.email, "| Role:", user.role);

        // Retornar dados do usuário
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          avatar: user.avatar
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.company = user.company
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub || ''
      session.user.role = token.role as string
      session.user.company = token.company as string
      session.user.avatar = token.avatar as string
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect admin/manager to dashboard, clients to client portal
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here"
}
