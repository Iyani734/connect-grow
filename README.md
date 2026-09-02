# Connect & Grow

Build a premium, modern web application that functions as a personal **Outreach CRM + Email Campaign Management Dashboard**.

The product is designed for a user who manages multiple businesses/services and regularly reaches out to potential clients, partners, schools, hotels, resorts, companies and brands.

The primary goal is to help the user manage outreach at scale while maintaining a complete history of every contact, preventing accidental duplicate outreach, managing multiple email accounts, tracking responses and visualizing whether outreach efforts are producing results.

The application should feel like a polished modern SaaS product — clean, visual, fast, intuitive and highly professional. It should not look like a generic admin dashboard.

## PRODUCT CONCEPT

The system allows the user to:

1. Add potential clients/prospects.
2. Organize prospects into outreach categories.
3. Create campaigns for different services or purposes.
4. Select the appropriate email account for each campaign.
5. Create and edit email templates.
6. Personalize emails using recipient/company variables.
7. Send emails individually or in bulk.
8. Schedule emails and control sending intervals.
9. Prevent duplicate outreach for the same purpose.
10. Track campaign activity and results.
11. Synchronize connected email accounts to detect replies and other email activity.
12. Track follow-ups.
13. Record outcomes such as Interested, Meeting, Won or Lost.
14. Analyze outreach performance through charts and KPIs.

---

# PRIMARY OUTREACH CATEGORIES

The system should support multiple outreach categories.

Example categories:

### Tour & Travel

* Hotel/resort partnership
* Hotel rate requests
* Tour operator partnerships
* Safari packages
* Destination partnerships

### Schools

* School trips
* Educational tours
* Student travel packages
* Software development

### Corporate / Brands

* Team retreats
* Employee trips
* Corporate travel
* Brand partnerships

### Software Development

* Website development
* Web applications
* Dashboards
* UI/UX design
* Custom software

The user must be able to create, edit and delete categories.

Categories should have their own color/icon for visual organization.

---

# IMPORTANT DUPLICATE-PREVENTION LOGIC

The application must prevent accidental duplicate outreach.

A prospect can receive multiple emails for different legitimate campaigns.

For example:

ABC International School

✓ School Trip Proposal
✓ Website Development Proposal

But the system must prevent:

✕ School Trip Proposal
✕ School Trip Proposal again

The uniqueness rule should be based on:

RECIPIENT + CAMPAIGN/PURPOSE

not simply the recipient email address.

The system should display a warning if the user attempts to send an email that has already been sent to that recipient for the same campaign/purpose.

Example warning:

"Already contacted"

"This recipient was contacted for the School Trips campaign on August 18, 2026."

Actions:

[View previous email]
[Cancel]
[Send anyway]

The user should have an intentional override option if necessary, but duplicate sending should never happen accidentally.

---

# PROSPECT DATABASE

Create a powerful prospect management interface.

Each prospect should support:

* Company name
* Contact person
* Email
* Phone
* Website
* Industry
* Country
* City
* Category
* Tags
* Notes
* Status
* Assigned campaign
* Last contacted
* Last response
* Next follow-up
* Outreach history

Lead statuses:

* New
* Contacted
* Opened
* Replied
* Interested
* Meeting
* Negotiating
* Won
* Lost
* Not Interested
* Do Not Contact

Allow filtering by:

* Category
* Campaign
* Status
* Country
* Date contacted
* Last activity
* Follow-up due
* Email engagement

Include search.

---

# COMPANY PROFILE / CONTACT TIMELINE

Clicking a prospect should open a detailed profile.

Example:

ABC International School

School
Nairobi, Kenya

Status:
INTERESTED

Contact:
John Doe
[john@example.com](mailto:john@example.com)

Then show a chronological activity timeline:

Aug 20
✉ School Trip Proposal sent

Aug 21
◉ Email opened

Aug 21
↩ John replied

Aug 22
📅 Follow-up scheduled

Aug 23
⭐ Lead marked Interested

The complete communication history should be visible from one screen.

---

# EMAIL CAMPAIGN BUILDER

Create a beautiful campaign creation workflow.

Step 1:
Campaign information

* Campaign name
* Category
* Purpose
* Description
* Sender email
* Recipient list

Step 2:
Email composition

Provide a rich email editor.

Allow the user to manually edit everything.

Support variables:

{{first_name}}
{{company_name}}
{{city}}
{{country}}

Example:

"Hello {{first_name}},

I'd love to discuss how we could organize a memorable school trip for {{company_name}}..."

Include:

* Subject
* Email body
* Attachments
* Signature
* Preview
* Send test email
* Save as template

Step 3:
Recipients

Allow:

* Individual recipient
* Multiple recipients
* CSV import
* Existing prospects
* Filtered prospects

Show duplicate warnings before sending.

Step 4:
Sending options

Allow:

* Send immediately
* Schedule campaign
* Send in batches
* Configure interval between emails
* Pause campaign
* Resume campaign
* Cancel campaign

Example:

Send 10 emails every 30 minutes.

Show a live campaign progress indicator.

---

# MULTIPLE EMAIL ACCOUNTS

The user may operate different businesses/services and therefore use different email addresses.

Create an Email Accounts section.

Each connected account should display:

* Email address
* Provider
* Connected status
* Associated categories
* Daily sending limit
* Emails sent today
* Emails remaining
* Last synchronization

Example:

Karla Safari Adventures
[info@company.com](mailto:info@company.com)
● Connected

Software Development
[hello@company.com](mailto:hello@company.com)
● Connected

School Outreach
[schools@company.com](mailto:schools@company.com)
● Connected

A campaign should automatically suggest the appropriate sender based on its category, while still allowing the user to change it.

Support Gmail/Google Workspace and Microsoft/Outlook integrations where technically available.

---

# EMAIL SYNCHRONIZATION

The application should support connecting the user's email accounts through secure OAuth authentication.

After connection, synchronize relevant email activity.

The system should attempt to identify:

* Sent emails
* Replies
* Bounces
* Delivery failures
* Email threads
* Follow-up responses

When a recipient replies, automatically associate the reply with the correct prospect and campaign whenever possible.

Example:

ABC School
School Trip Campaign

Status automatically changes:

CONTACTED → REPLIED

Display:

"John Doe replied 14 minutes ago."

Provide a button:

[Open conversation]

Email synchronization should use secure OAuth and should never require the user to enter or store their email password inside the application.

---

# CAMPAIGN ANALYTICS

Create a dedicated Analytics page.

Show:

Total prospects
Total emails sent
Delivered
Bounced
Opened
Clicked
Replies
Positive replies
Meetings
Won
Lost

Calculate:

Delivery rate
Open rate
Reply rate
Positive reply rate
Conversion rate

Create beautiful visualizations.

Charts:

### Outreach Over Time

Line chart showing emails sent per day/week/month.

### Replies Over Time

Line chart.

### Campaign Comparison

Bar chart comparing campaigns.

### Conversion Funnel

Prospects
↓
Emails Sent
↓
Delivered
↓
Opened
↓
Replied
↓
Interested
↓
Meeting
↓
Won

### Category Performance

Compare:

School Trips
Hotels
Corporate Retreats
Software Development

Show which category generates the highest response and conversion rates.

---

# MAIN DASHBOARD

The dashboard should immediately communicate performance.

Header:

"Good evening, [Name]"

"Here's how your outreach is performing."

Top KPI cards:

Emails Sent
Replies
Interested
Meetings
Clients Won

Each card should show:

Current value
Percentage change
Comparison to previous period

Example:

1,284
Emails Sent
↑ 18.4% vs last month

Below the KPI cards:

### Outreach Performance

Large interactive line chart.

### Campaign Performance

Cards/table containing:

Campaign
Recipients
Sent
Replies
Reply Rate
Interested
Won

### Follow-ups

Show:

Due Today
Overdue
Upcoming

### Recent Activity

Examples:

"ABC School replied"
"Serena Resort opened your email"
"Corporate Retreat campaign completed"
"5 follow-ups are due today"

---

# FOLLOW-UP MANAGEMENT

Create a dedicated Follow-ups page.

The user should be able to define follow-up sequences.

Example:

Initial email
↓
Wait 3 days
↓
Follow-up #1
↓
Wait 5 days
↓
Follow-up #2

However, never send a follow-up if the recipient has already replied.

Display:

* Follow-up due
* Days since last contact
* Previous email
* Campaign
* Recipient
* Follow-up status

Allow manual editing before sending.

---

# TEMPLATES

Create a reusable email template library.

Templates should contain:

* Template name
* Category
* Subject
* Body
* Variables
* Number of times used
* Reply rate
* Conversion rate

The analytics should eventually help the user understand which templates perform best.

Example:

"School Trip Introduction"

Used:
182 times

Reply rate:
14.8%

Won:
7

---

# CAMPAIGN DETAIL PAGE

Clicking a campaign should show:

Campaign name
Category
Sender
Created date
Status

Progress:

████████████░░ 82%

82 / 100 sent

Then:

Recipients
Sent
Delivered
Opened
Replies
Interested
Won

Below this show a recipient table:

| Recipient | Company | Status | Sent | Opened | Replied | Follow-up |

Each recipient should be clickable.

---

# IMPORT SYSTEM

Allow CSV upload.

CSV columns can include:

Company
Contact Name
Email
Phone
Website
Category
Country
City

Before importing:

1. Preview rows.
2. Detect invalid emails.
3. Detect duplicates.
4. Match existing prospects.
5. Allow user to choose what to do with duplicates.
6. Import valid records.

---

# ACTIVITY LOG

Create an activity page showing everything happening in the system.

Examples:

Campaign started
Email sent
Email opened
Email replied
Prospect created
Prospect updated
Follow-up scheduled
Campaign paused
Campaign completed
Email account synchronized

Allow filtering by date, category and activity type.

---

# DESIGN DIRECTION

The UI should be visually impressive.

Use a premium SaaS aesthetic.

Design principles:

* Clean
* Minimal
* Spacious
* Professional
* High information density without feeling cluttered
* Excellent typography
* Subtle borders
* Soft shadows
* Rounded cards
* Smooth transitions
* Beautiful charts
* Strong visual hierarchy
* Responsive on desktop, tablet and mobile

Use a modern light interface as the primary design.

Use a restrained accent color with neutral backgrounds.

Avoid excessive gradients, excessive glassmorphism, unnecessary animations and generic AI-dashboard styling.

The interface should feel closer to a premium product such as Linear, Attio, HubSpot or modern sales SaaS products than a traditional admin panel.

---

# NAVIGATION

Left sidebar:

✦ Outreach

Overview
Prospects
Campaigns
Follow-ups
Templates
Email Accounts
Analytics
Activity

Settings

At the bottom:

User profile
Workspace

---

# IMPORTANT UX DETAILS

The application must make complex outreach management feel simple.

Use:

* Command/search functionality
* Keyboard shortcuts where appropriate
* Bulk actions
* Smart filters
* Saved views
* Confirmation dialogs for destructive actions
* Clear empty states
* Toast notifications
* Loading states
* Skeleton loaders
* Error states
* Success states
* Responsive tables
* Pagination
* Sorting
* Filtering

Every important action should provide immediate visual feedback.

---

# DASHBOARD PERSONALIZATION

The user should be able to select the reporting period:

Today
7 days
30 days
90 days
This year
Custom

Analytics should update dynamically.

---

# FUTURE-READY ARCHITECTURE

Build the application so that it can eventually support:

* Multiple users
* Multiple workspaces
* Team members
* Role permissions
* CRM integrations
* WhatsApp integration
* LinkedIn lead tracking
* AI-assisted email personalization
* AI-generated campaign suggestions
* Lead scoring
* Automated follow-up sequences
* Advanced reporting
* Revenue attribution

Do not implement all future features now, but structure the application so they can be added later.

---

# TECHNICAL DIRECTION

Build this as a production-quality web application.

Recommended stack:

Frontend:
React
TypeScript
Tailwind CSS

Use a component-based architecture.

Use a modern charting library for analytics.

Backend/database should support:

* Users
* Workspaces
* Prospects
* Companies
* Contacts
* Campaigns
* Campaign recipients
* Emails
* Email accounts
* Templates
* Follow-ups
* Activities
* Tags
* Analytics/events

Create a proper relational data model.

The system must maintain a complete audit/history of outreach activity.

Do not fake the core functionality. Where an external integration is not configured, create a realistic integration state and clearly separate UI/demo data from real data.

---

# DEMO DATA

Populate the initial interface with realistic demo data so the dashboard looks alive.

Create example prospects from:

Schools
Hotels
Resorts
Corporate companies
Brands

Create example campaigns:

School Trips 2026
Hotel Partnership Outreach
Corporate Retreats
Website Development
UI/UX Services

Create realistic activity history, campaign statistics, replies and follow-ups.

The final product should look like something the user could genuinely use every day to manage their outreach business.

The most important experience is:

IMPORT PROSPECTS → SELECT CAMPAIGN → PERSONALIZE EMAIL → REVIEW DUPLICATES → SCHEDULE/SEND → TRACK RESPONSE → FOLLOW UP → RECORD RESULT → ANALYZE PERFORMANCE.

Make this workflow extremely fast, intuitive and visually satisfying.
Core structure I'd recommend

1. Overview Dashboard

Total prospects
Emails sent
Emails delivered
Open rate
Reply rate
Positive replies
Meetings/bookings generated
Conversion rate
Follow-ups due
Outreach activity over time
Performance by category

2. Outreach Categories

For example:

🦁 Tour Operators / Hotels
Request hotel/resort rates
Partnership proposals
Safari packages
🎓 Schools
School trip proposals
Educational tours
Software development
🏢 Companies / Brands
Team retreats
Employee trips
Corporate travel
Software development
💻 Software Development
Websites
Dashboards
Custom systems
UI/UX services

Each category can have its own sending email account.

3. Prospect / Contact Database

Each company should have a profile containing:

Company

Company name
Industry/category
Website
Country/city
Contact person
Email
Phone
Notes

Outreach history

Campaign
Subject
Email sent
Date sent
Status
Opened?
Replied?
Reply date
Follow-up count
Outcome

Most importantly, your database needs a rule like:

recipient + campaign/subject category = unique

So you could send:

School ABC

School trip proposal ✅
Website development proposal ✅
Corporate retreat proposal ❌ if irrelevant
School trip proposal again ❌

But if you deliberately create a new campaign, you can contact the same person for a genuinely different service.

4. Email Composer

This should be one of the nicest parts of the dashboard.

You select:

Campaign: School Trips
Sender: Karla Safari Adventures
Recipients: 50 schools
Template: School Trip 2026
Schedule: Send 10 every 30 minutes

Then you can edit the email before sending.

I'd also include:

Rich text editor
Variables such as {{company_name}}
{{contact_name}}
{{location}}
Preview
Test email
Save as template
Attachments
Schedule sending
Pause campaign
Cancel remaining emails
Randomized sending intervals

For example, instead of 100 identical emails:

Hello {{contact_name}},
We'd love to discuss...

the system automatically personalizes each recipient.

5. Multiple Email Accounts

This is important for your use case.

You could have:

Karla Safari Adventures
info@...

Software Development
hello@...

School Outreach
schools@...

The dashboard knows which account belongs to which campaign.

So when you select School Trips, it automatically selects the appropriate sender.

6. Email Tracking / Responses

Yes, this is technically possible if you connect your email accounts.

The system could synchronize with Gmail/Google Workspace or Microsoft Outlook and identify:

Sent
Delivered
Opened*
Clicked*
Replied
Bounced
Unsubscribed

Then your dashboard could show:

ABC International School

School Trip Campaign

🟢 Sent — Aug 20
🟢 Opened — Aug 20
🟢 Opened 3 times
🟢 Replied — Aug 21
⭐ Interested

You could then manually mark the lead:

Interested → Negotiating → Won → Lost

*Open tracking isn't perfectly reliable because modern email privacy features can distort open data. Replies and delivery/bounce events are much more reliable.

7. Campaign Analytics

This is where your idea becomes really valuable.

Imagine:

August Outreach

Campaign	Sent	Replies	Positive	Won
School Trips	180	27	12	4
Hotel Partnerships	120	18	8	3
Corporate Retreats	95	9	4	1
Software Development	150	21	7	2

Then visual charts:

Outreach Activity

Jan → Feb → Mar → Apr → May → Jun → Jul → Aug

and:

Conversion Funnel

1,000 Prospects
↓
850 Delivered
↓
410 Opened
↓
95 Replied
↓
31 Interested
↓
10 Clients

Now you're able to see whether your hard work is actually producing results.

The dashboard UI

I'd make it feel more like a modern SaaS product than an old-school CRM.

Left sidebar

✦ OutreachOS

Overview
Prospects
Campaigns
Email Accounts
Templates
Follow-ups
Analytics
Activity
Settings

Then the main dashboard.

At the top:

Good evening, Ian

Your outreach this month

[ 545 Sent ] [ 75 Replies ] [ 31 Interested ] [ 10 Won ]

Below:

Outreach Performance
──────────────────────────────
       📈 Line chart

Then:

Campaign Performance        Follow-ups

School Trips       15.2%    12 due today
Hotels             14.8%     7 due tomorrow
Software           11.4%     4 overdue
Corporate          9.6%

And a recent activity stream:

● ABC School replied
  School Trips · 8 min ago

● Serena Hotel opened email
  Hotel Partnership · 24 min ago

● XYZ Ltd campaign completed
  50/50 emails sent

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/34e1ee90-5651-4f41-a291-8c0f9c8fba5f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
