# Content migration from Wix

## ADDED Requirements

### Requirement: Source manifest and dry run
Every Wix page read during the migration SHALL be recorded in a manifest with its source address, date, title, destination, publication status, and any error. No imported item SHALL be published before the owner approves the manifest.

#### Scenario: Dry run shows what will be published
- **WHEN** the import runs in dry-run mode
- **THEN** the manifest lists every post, event and page with its planned destination, and nothing is published

### Requirement: Past events are never shown as upcoming
Imported events SHALL keep their original dates. An event whose date has passed SHALL appear only in the event archive.

#### Scenario: Old training is archived
- **WHEN** a 2025 training page is imported
- **THEN** it appears in the term archive and not in the upcoming sessions

### Requirement: Old addresses keep working
Each Wix address that is in the manifest SHALL redirect permanently to its new address in one step. Redirects SHALL be checked before the Wix subscription is ended.

#### Scenario: Old post link
- **WHEN** a visitor opens an old `/home/post/…` address
- **THEN** they are sent to the matching news item

### Requirement: Image rights kept with each image
Each re-hosted image SHALL keep its source address and attribution in the manifest. An image without a confirmed reuse right SHALL NOT be published.

#### Scenario: Image without rights
- **WHEN** an imported image has no confirmed reuse right
- **THEN** the post is published without it and the manifest records the reason
