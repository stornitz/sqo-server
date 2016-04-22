# SQO-Server
Share Quickly Online Server _(InDev)_

# API Endpoints
- GET - `/i<hash>`
- GET - `/p<hash>`
- GET - `/about`
- DELETE - `/i<hash>`
- DELETE - `/p<hash>`
- POST - `/api/up`
- POST - `/api/hist`

## View
### GET - `/i<hash>`
Display an image.

Exact (JS) regex: `^\/i([a-zA-Z0-9]+)(?:\.(?:[pP][nN]|[jJ][pP][eE]?)[gG])?$`
### GET - `/p<hash>`
Display a paste.

Exact (JS) regex `^\/p([a-zA-Z0-9]+)`
### GET - `/about`
Information about the SQO Server
## API
### DELETE - `/i<hash>`
Delete an image
**Require Auth.**

Exact (JS) regex: `^\/i([a-zA-Z0-9]+)(?:\.(?:[pP][nN]|[jJ][pP][eE]?)[gG])?$`
### DELETE - `/p<hash>`
Delete a paste

Exact (JS) regex `^\/p([a-zA-Z0-9]+)`

**Require Auth.**

### POST - `/api/up`
Upload a new file (image or text _(=paste)_).

**Require Auth.**

### POST - `/api/hist`
Get the user uploded files history (links, number of views).

**Require Auth.**