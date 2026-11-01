## ADDED Requirements

### Requirement: Independent club websites
The platform SHALL host the national app and shared backend, not a generic club website service. Clubs MAY maintain their own website repositories, domains and hosting. Onboarding SHALL require configuration rather than a per-club app/backend copy or website directory in this repository.

#### Scenario: Onboard an existing club website
- **WHEN** an operator creates a club and configures its approved website address
- **THEN** the app supports that club without importing, building or deploying its website code

### Requirement: Verified external website navigation
The app SHALL maintain an approved HTTPS website URL per club with authorized changes and audit history. A website URL SHALL NOT convey app permissions or carry authentication tokens; arbitrary caller-supplied redirect targets SHALL NOT be accepted.

#### Scenario: Player opens another club website
- **WHEN** a multi-club player selects Dublin's website in Dublin's app context
- **THEN** the app opens Dublin's approved external URL without granting that website access to private app records

#### Scenario: Website unavailable
- **WHEN** a club has no approved website or its site is unavailable
- **THEN** app operations remain usable independently of that website

### Requirement: Website links into app workflows
Independent websites SHALL be able to link to stable HTTPS app routes for a club, joining, events and administration. The app SHALL validate club/event identifiers, preserve permitted destinations through sign-in and enforce club authorization. Unknown identifiers SHALL show a safe unavailable state. Website-editor status SHALL NOT itself grant app-management permission.

#### Scenario: Visitor follows a tournament link
- **WHEN** a website visitor follows an app event link and signs in where required
- **THEN** the app opens the permitted event in the selected club context without treating the link as proof of membership

#### Scenario: Admin follows a website management link
- **WHEN** an editor follows a link to app administration
- **THEN** individual app sign-in and explicit club permissions determine access

### Requirement: App club content and optional public feeds
Authorized club groups SHALL manage app details, news, photographs, announcements and events according to scoped permissions. Independent website content management SHALL remain separate. Optional read-only public feeds SHALL expose only deliberately published fields and stable app links. Automatic website synchronization SHALL NOT be promised without an implemented connector.

#### Scenario: Publish app announcement
- **WHEN** an authorized club editor publishes an announcement
- **THEN** it appears in that club's app context and enabled public feeds without automatically editing an independent website

#### Scenario: Website consumes public events
- **WHEN** an independent website opts into the public event feed
- **THEN** it receives published event details and app links without private member records, reflections, drafts or privileged credentials

#### Scenario: Share published news
- **WHEN** an authorized editor shares a published item
- **THEN** the app supplies a public-safe canonical app/event link or approved external event link and share-ready text, with automated Facebook posting deferred until separately authorized

### Requirement: Accessible national app identity
Club profiles and navigation SHALL retain the national app identity and support keyboard operation, visible focus, text scaling, labelled controls and sufficient contrast.

#### Scenario: Keyboard navigation
- **WHEN** a player navigates club profiles and website links by keyboard
- **THEN** each action is reachable, visibly focused and labelled with its destination
