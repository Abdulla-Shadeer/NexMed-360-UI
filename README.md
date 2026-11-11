This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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


## Workspaces and access

After login or a page refresh, an account with one available workspace opens it automatically. Accounts with several workspaces choose patient mode, organization work, a practitioner assignment, or platform administration. The selector lists only choices available to the current account. Manual workspace switches and logout use the shared confirmation dialog. Cancelling keeps the current workspace and session. Confirming a switch clears cached results and the current patient/encounter state.

Navigation stays visible within the selected mode. A page that needs a missing permission shows the shared 403 view. Restricted actions are disabled with a short explanation. The API independently checks current permissions and organization ownership on every request.

Organization members with the required grants can manage access roles under Organization > Access Roles and memberships under Organization > Manage Staff. Role managers can define clinical permission groups, and staff managers can assign them, without receiving those clinical permissions themselves. Platform administrators can choose additional initial grants when assigning an organization administrator.

Run `npm run test:access` for workspace routes, request headers, automatic login entry, and switch/logout confirmation regressions, `npx tsc --noEmit` for types, and `npm run build` for the production build. Browser review should cover workspace switching, direct restricted URLs, revoked memberships, and patient history across two organizations.


Platform administrators can view, update, and remove organization administrators under **Organization > Manage Organization Admins**. Organization deletion is also available there and on organization list/details actions. Confirmation is required. Shared accounts and other organizations are kept when administrator access is removed; organizations with patient registrations or care history cannot be deleted.


The user and workspace providers have separate responsibilities. `UserProvider` keeps the basic account and token; login uses the user already returned by the login response, and page refresh calls `GetUser` once. `WorkspaceProvider` loads the small workspace list and fetches `Workspace/Current` for the selected key. Patient screens load `Patient/Me` on demand. `requestApi` handles HTTP and result errors; `useAppQuery` reads directly from the query cache. Staff screens use the selected workspace IDs instead of hidden defaults from user profiles.


Add Staff uses the existing Location selector for both ordinary staff and practitioner assignments. It lists active locations available to the current workspace. Restricted managers must select a location; unrestricted managers can choose All organization locations. Existing staff keep their current scope. Shared access-role definitions still require unrestricted organization access. Add Staff defaults to generic Member; practitioner professional titles do not grant permissions. The optional access-role picker starts empty and uses the existing checkbox component. Leaving it empty adds no permissions, and staff can be created without role templates. Selected organization roles are added to existing staff access without removing their current roles. Successful creation and Clear reset the role selection.


## Patient signup and patient access

Login links to `/signup`, which uses existing form/input/button components. A fresh signup collects patient details and password confirmation, creates a patient-only account, and offers Continue to login. An existing email returns an instruction to sign in; signup never attaches an existing account or patient by email.

A signed-in account without patient mode can use **Account > Enable patient access**. Account remains reachable from the workspace chooser even when the account has no workspaces. Only birth date and gender are sent; the server resolves the account identity. Success refreshes the workspace list without another login. A current work workspace stays selected; if patient mode is the only available choice, it opens automatically. Manual switching still uses the shared confirmation dialog. An enabled account does not show the activation form again.

Manual review: create a fresh patient account and sign in; reject a duplicate email; enable patient mode for a staff-only account; verify work grants remain; open Account with no selected workspace; refresh and switch modes; confirm existing patient history is unchanged. Email verification, welcome messages, invitations, and password recovery remain deferred.

Verified on 11 November 2026: **42 UI tests passed** and the full production build passed TypeScript/lint. No live browser journey was run. Use `npm run test:access` and `npm run build` for the automated checks.
