# АНГРЕН ТАКСИ — Admin Panel

Next.js 14 App Router admin panel for the Angren Taxi aggregator.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **UI**: Ant Design 5
- **State**: Redux Toolkit
- **Charts**: Recharts
- **HTTP**: Axios
- **Date**: date-fns

## Getting Started

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:**
- Email: `admin@angren-taxi.uz`
- Password: `Admin123!`

## Pages

| Route | Description |
|---|---|
| `/login` | Authentication |
| `/dashboard` | KPI metrics + charts |
| `/orders` | Orders management |
| `/drivers` | Drivers management |
| `/users` | Passengers management |
| `/analytics` | Revenue & orders analytics |
| `/finances` | Transactions & finance summary |
| `/support` | Support tickets |
| `/settings` | App settings & tariffs |
| `/security` | Audit log & security |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Notes

- All pages include mock data fallback when the backend is unavailable.
- Authentication state is persisted in `localStorage`.
