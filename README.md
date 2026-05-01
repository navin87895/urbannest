# UrbanNest

Premium responsive real estate advisory demo website built with HTML, CSS, JavaScript and a Vercel-ready serverless API.

## Features

- Video hero with premium navigation
- Mobile-first lead popup
- Responsive property filters and draggable project rail
- Consultation flow section
- Builder partner grid
- Gallery, testimonials, blog and contact sections
- Local Node server for development
- Vercel serverless endpoint at `/api/enquiries`

## Run Locally

```bash
node server.js
```

Open:

```text
http://127.0.0.1:8080
```

## Deploy on Vercel

Import this GitHub repository in Vercel. No build command is required.

The site is static, and the enquiry form posts to:

```text
/api/enquiries
```

For production, connect the API route to a database, email service, or CRM.
