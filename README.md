This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## NFA Alerts v2

A business-critical Next.js/PWA web application with integrated Firebase backend, employee operations tools, and mobile-first design.

### Key Technologies

- **Framework:** Next.js 16.1.1 with App Router
- **UI:** React 19.2.3, Shadcn/ui (New York style), Tailwind CSS v4
- **Backend:** Firebase (Auth, Firestore, Storage, Functions, FCM)
- **Maps:** Google Maps API with geocoding
- **AI/Parsing:** OpenAI webhook integration
- **Testing:** Vitest, Playwright
- **Deployment:** Vercel

### Development Tools & MCP Servers

This project has **4 mandatory MCP servers** configured for optimal AI-assisted development:

1. **Firebase MCP** - Firebase project management and debugging
2. **Next.js DevTools MCP** - Next.js diagnostics and route analysis
3. **Vercel MCP** - Deployment logs and production debugging
4. **Shadcn MCP** - Component browsing and installation

See `docs/ai/CURSOR_MCP_AND_TOOLS.md` for complete MCP server documentation.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
