# Visual design

## ADDED Requirements

### Requirement: One shared design system
The website and the member app SHALL draw colours, type, spacing, radius, focus and elevation from one shared set of design tokens in the shared UI package. Each application SHALL keep its own entry stylesheet and SHALL NOT define its own palette, fonts or spacing scale outside those tokens. Light and dark appearance SHALL both be defined through the tokens and SHALL follow the viewer's system setting.

#### Scenario: Consistent appearance across the two sites
- **WHEN** the website and the member app render the same button, card or form field
- **THEN** both use the same token values and look the same apart from the club or platform name

#### Scenario: Dark mode follows the device
- **WHEN** a viewer's device is set to dark appearance
- **THEN** both sites render with the dark token set and remain readable

### Requirement: Independent, scoped stylesheets
Each application SHALL own its stylesheet, built from the shared utility framework and tokens. Styles for one screen SHALL NOT leak into another. Legacy per-section stylesheets SHALL be migrated into the shared system before the redesign is accepted.

#### Scenario: A screen change does not restyle another screen
- **WHEN** the attendance screen styles are changed
- **THEN** the membership and booking screens render unchanged

### Requirement: Shared layout structure
The member app SHALL present every signed-in area inside one application shell with a page header, a primary navigation, and content organised into titled sections. On wide screens navigation SHALL be a persistent side panel. On phone-width screens navigation SHALL collapse into a menu button that opens a full-width list. Forms SHALL use a two-column grid on wide screens and a single column on phones. Lists of records SHALL use tables on wide screens and stacked cards on phones.

#### Scenario: Phone navigation
- **WHEN** a member opens the app on a 360-pixel-wide phone
- **THEN** the navigation is available from a menu button and every screen fits without horizontal page scrolling

#### Scenario: Records on a phone
- **WHEN** a manager views the people list on a phone
- **THEN** each person appears as a card showing the full name, nickname when recorded, and membership status

### Requirement: Accessible forms and controls
Every input SHALL have a visible label. Required and optional fields SHALL be marked in text, not colour alone. Validation messages SHALL be linked to their field and announced to assistive technology. Interactive targets SHALL be at least 44 by 44 CSS pixels on touch screens. Focus SHALL be visible on every control.

#### Scenario: Validation error on a name field
- **WHEN** a manager submits a player with only a first name
- **THEN** the second name field shows a message linked to the field, and screen readers announce it

### Requirement: Contrast and motion
Text and interface colours SHALL meet WCAG 2.2 AA contrast minimums in both light and dark appearance. Animation and transitions SHALL be disabled or reduced when the viewer requests reduced motion.

#### Scenario: Reduced motion
- **WHEN** a viewer has requested reduced motion
- **THEN** page transitions and menu animations do not play

### Requirement: Responsive without horizontal scrolling
Every page SHALL fit the viewport width from 360 pixels upward. Only data tables MAY scroll horizontally, and only inside their own container.

#### Scenario: Wide table on a phone
- **WHEN** a table is wider than the phone screen
- **THEN** only the table scrolls, and the page itself does not

### Requirement: Verified visually and automatically
Browser checks SHALL cover the signed-in shell, the people and membership screens, and the public website at phone and desktop widths. Automated accessibility checks SHALL run on those screens. Screenshots SHALL be produced for owner review before each visual release.

#### Scenario: Owner review before release
- **WHEN** a visual release is prepared
- **THEN** the owner receives screenshots of the phone and desktop versions of the membership and people screens
