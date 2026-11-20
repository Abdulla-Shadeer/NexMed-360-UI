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

After login or a page refresh, an account with one available workspace opens it automatically. Accounts with several workspaces choose Patient mode, one Work mode per organization, or Platform Admin mode. Access roles and practitioner assignments do not create additional workspace entries. The selector lists only choices available to the current account. Manual workspace switches and logout use the shared confirmation dialog. Cancelling keeps the current workspace and session. Confirming a switch clears cached results and the current patient/encounter state.

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


## Patient Care without appointments

**Patient > Patient Care** (`/patient/view`) searches permitted patients by name/email or opens a patient ID. It shows patient details and the selected work organization, then offers Clinical history and Add clinical record. The existing Create EHR route (`/ehr/create`) opens the same patient selection with record entry selected. Both reuse existing clinical APIs, forms, history cards, and prescription controls. History displays source organization and practitioner, newest records first.

No booking, confirmation, arrival, session start, or encounter completion is required. The session toolbar is hidden on these two direct-care pages so it cannot automatically load/resume an appointment there. The existing appointment/session/encounter route remains available. Explicit patient selection overrides an active appointment context; changing patients clears the editor, and patient changes are locked during a save. Notes-only and prescription saves share one save/refresh path. Failed saves retain the draft. Record date/author come from the server.

Patient lookup needs `patients.read`; history needs `clinical-records.read`; writing needs `clinical-records.write` and an active owned clinical assignment within Work mode; prescribing separately needs `prescriptions.issue`. Disabled actions explain missing access. These do not grant access to another organization or patient. External FHIR records are still Phase 6; the full stored encounter lifecycle is deferred.

Manual review: search/open a registered patient with no appointment or schedule; save notes only and then a record with prescriptions; confirm refreshed history/source labels and patient self-history; choose a different patient and check the draft clears; find other-organization patients while keeping their clinical records private until approval; check missing grants; open direct care while an appointment encounter is active and confirm patient identity and appointment status remain correct.

Verified on 11 November 2026: **56 UI tests passed**, and the production build passed TypeScript/lint. No live browser journey was run. Use `npm run test:access` and `npm run build` to repeat the automated checks.


## Workspace and form corrections

Work mode uses the distinct union of the account's assigned access-role permissions for that organization only. Patient mode opens only patient pages/components and own-patient data. The existing mode/permission gates remain. A sole clinical assignment is automatic; a separate Clinical assignment control appears inside Work mode only when there are several genuinely different choices. Changing it uses confirmation and clears cached/patient/encounter state without changing organization permissions. Refresh preserves only a still-permitted choice. Equivalent old duplicate assignments are one clinical choice, not separate workspaces.

The shared user form now awaits a true success/failure result from every caller. Success clears personal, password, professional-role, and specialty fields while retaining the organization; Add Staff also clears role/location selections. Failure retains entered data. The form disables controls while pending and ignores rapid repeat submissions. The API also rejects duplicate practitioner assignments with a clear error, so replaying an old request cannot silently create another assignment or add grants.

Review your reported case: create a Nurse assignment, confirm the form clears, replay the same request and expect 409, assign its access roles through Manage Staff, then log in. The account sees one organization Work mode; Patient mode appears only if it has a Patient profile. No Nurse/access-role workspace entries appear. Confirm clinical writing works from Work mode and Patient mode cannot open staff pages. With multiple genuine clinical assignments, selection changes authorship context while work permissions stay the same.

Verified on 11 November 2026: **62 UI tests passed** and the full production build passed TypeScript/lint. No live browser was run. Use `npm run test:access` and `npm run build` for verification. The API README records the server checks and the unrun PostgreSQL concurrency case. Existing duplicate records were preserved rather than deleted from the database.


## Shared patient discovery and record sharing

Patient Care now searches the shared patient index across organizations. Results show identifying demographics only, with at most 30 matches; select the correct patient using their name, birth date, and Patient ID. Existing patients are reused rather than registered again. The record editor has a checked-by-default **Show in patient portal** option. This is separate from permission for another organization to read the record.

Staff with `clinical-records.read` and an active selected practitioner assignment can send a request from **Patient Care > Clinical history > Record sharing requests**. Enter purpose, optional clinical-record dates, and an access expiry (default 30 days). Patients use **Medical Records > Sharing Requests** to approve, reject, or revoke through the existing confirmation dialog. The request shows verified practitioner name/role/email and receiving organization/contact. Work mode can also view the organization's sent requests on this page.

Shared history/prescriptions use the existing screens, show source organization and author, and are labelled read only. Only published records recorded before approval and within the requested dates are included. Expiry and revocation are checked on backend reads. Cached data already viewed cannot be recalled. A patient without an active portal account receives a clear unsupported-activation message; no account is claimed by matching an email.

Manual review after applying the API migration:

1. Use a patient with a portal account and published records at organization A; include a hidden record and a prescription.
2. At organization B, find that patient by name/email/ID. Check that their A records and direct prescription URLs are unavailable before approval.
3. With an active practitioner assignment and clinical-read permission at B, send a dated request with purpose and expiry.
4. In the patient's Patient mode, open Sharing Requests, inspect requester/scope, and approve. At B, refresh clinical history and verify only eligible A records/prescriptions appear, labelled with their source. Source records must remain unchanged.
5. Revoke in Patient mode, then refresh B's history/detail/prescription pages: shared access stops. Repeat with rejection, expired access, another patient, another organization, and missing permissions. A newly created/backdated record must remain outside an older approval.
6. Save a new record with Show in patient portal unticked: the source organization can read it, while patient/shared history excludes it. Turn no permissions on implicitly.

Verified on 17 November 2026: **70 UI regressions passed** and the production build passed TypeScript/lint. No live browser/API/database journey was run. The API README records migration and backend verification details. Review `recordSharingRequests.tsx` → Patient Care integration → route gates/API paths → visibility checkbox/history labels → tests. FHIR remains separate upcoming work.

## Portal access and UI behavior

Patient signup uses the existing branded form and automatically signs in. A sole workspace opens directly; multiple modes show the selector; accounts without modes open Account home. Failed automatic login leaves one sign-in option without repeating registration. Account reveals Enable patient access through a toggle. Account and workspace details show assigned access-role names and the selected professional assignment.

Personal staff appointment/session views require the matching own-read permission plus a practitioner assignment in the selected organization. They include all permitted assignments without requiring one to be selected. Organization views require `appointments.read-organization` / `schedules.read-organization` or the matching `appointments.manage-organization` / `schedules.manage-organization` permission. Only management grants allow changes. Patient mode shows its linked appointments. Unauthorized menu entries and empty groups are hidden; direct pages use the same rules. Session history offers My/Organization choices only when both are allowed.

Session lists and edit screens show practitioner, professional role, organization, and location. Starting, ending, or cancelling a session refreshes current status, lists, and history. History shows stored dates, status, times, and encounter counts; detailed encounter history remains deferred.

Organization > Locations supports view/add/edit with type, parent, address, and active status. It requires organization management permission and unrestricted scope. Staff creation and Manage Staff offer Accept appointments for professional assignments, initially off. Booking search filters eligible assignments and can check date-specific slot availability. Professional titles do not decide eligibility or permissions.

The shared `ExpandableCard` wraps administrator/staff lists, sharing requests, clinical records, prescriptions, access roles, locations, sessions, and session history. Each list starts collapsed and allows one open item. Headers keep identifying details, status, dates, and source organizations visible where relevant; expanding shows existing details and actions. Existing confirmation dialogs are reused. Organization details uses the standard Manage Administrators quick action; organization rows omit Copy ID.

### Setup and manual checks

Apply the API's `AddPractitionerBookingEligibility` and `RenameOrganizationManagementPermissions` migrations to the checked development target before running the updated app. Enable Accept appointments for intended assignments and explicitly assign own-read or organization-read permissions where needed. See the API README for migration commands.

1. Sign up a patient and check automatic login, workspace routing, and the failed-login fallback. Check the patient-access toggle on Account.
2. Expand administrator/staff and other information lists. Check one open item, retained actions, and sharing approval/rejection/revocation confirmations.
3. Add/edit locations; try a foreign parent, a cycle, and a restricted manager.
4. Enable booking for an assignment. Check that opted-out assignments cannot be booked, including by submitting a known slot ID.
5. Compare an administrator without practitioner assignments, a practitioner with own-read grants, a user with both own/organization grants, an organization read-only viewer, and Patient mode. Check menus, direct pages, API boundaries, and absence of unauthorized editing.
6. Start/end/cancel a session and check immediate refresh. Check inclusive history dates, clinical-record pagination, and the existing consent flow.

### Recorded verification

On 20 November 2026, **82 UI tests, TypeScript, and lint passed** after the permission changes. A production build passed earlier in this implementation, before the final permission changes. No live browser/API/database journey was run. API tests and PostgreSQL verification limits are documented in the API README.

The next implementation is the bounded FHIR exchange in the refactor plan.
