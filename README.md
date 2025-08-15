# 🏢 Flex Living Reviews Dashboard

A comprehensive, production-ready review management system for property management companies. Aggregates reviews from multiple sources (Hostaway, Google Places), provides a management interface for approval workflows, and displays curated reviews on public property pages.

## ✨ Key Features

- **🔄 Multi-Source Integration**: Hostaway API + Google Places API with unified normalization
- **✅ Approval Workflow**: All reviews unapproved by default, manager approval required for public display
- **📊 Analytics Dashboard**: Real-time trends analysis, issue detection, and channel performance
- **⚡ Bulk Operations**: Efficient management with keyboard shortcuts and batch actions
- **🎨 Modern UI**: Professional design with Flex Living branding and responsive layout
- **🔧 Settings Management**: API credentials, auto-approval thresholds, and system configuration
- **🛡️ Data Validation**: Automated consistency checks and mapping verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Hostaway API credentials (optional - has mock fallback)
- Google Places API key (optional - for Google reviews)

### Installation

```bash
# Clone the repository
git clone https://github.com/Rohiths-basement/flex-global-review.git
cd flex-global-review

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API credentials

# Initialize database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Workflow Overview

### 1. **Review Aggregation**
```
Hostaway API ──┐
               ├──→ Normalization Layer ──→ Database Storage
Google Places ──┘
```
- Fetches reviews from multiple sources
- Normalizes data format (rating scales, dates, channels)
- Stores with approval status in SQLite database

### 2. **Management Dashboard** (`/dashboard`)
```
All Reviews → Filter/Sort → Bulk Actions → Approval → Public Display
```
- **View All Reviews**: Approved and unapproved from all sources
- **Filter & Sort**: By property, channel, rating, date, approval status
- **Bulk Operations**: Select multiple reviews for batch approval/rejection
- **Trends Analysis**: Real-time issue detection and performance metrics
- **Keyboard Shortcuts**: Power user efficiency features

### 3. **Public Property Pages** (`/properties/[slug]`)
```
Property Request → Approved Reviews Only → Display with Attribution
```
- Shows only manager-approved reviews
- Combines Hostaway + Google reviews seamlessly
- Proper Google attribution and compliance
- Responsive design with Flex Living branding

### 4. **Settings & Configuration** (`/dashboard/settings`)
```
API Management → Auto-Approval → Notifications → System Preferences
```
- **API Credentials**: Secure management of Hostaway/Google keys
- **Auto-Approval**: Configurable rating threshold for automatic approval
- **Notifications**: Email alerts and frequency settings
- **Bulk Operations**: Enable/disable advanced features

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Hostaway API  │────│  Normalization   │────│   Dashboard     │
└─────────────────┘    │     Layer        │    │      UI         │
                       │                  │    └─────────────────┘
┌─────────────────┐    │  - Rating conv.  │    ┌─────────────────┐
│ Google Places   │────│  - Channel map   │────│  Property Pages │
│      API        │    │  - Date format   │    │   (Public)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐
                       │   Database       │
                       │  (Approvals)     │
                       └──────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM + SQLite
- **Integrations**: Hostaway API + Google Places API
- **Validation**: Zod schemas for type-safe API calls
- **Testing**: Vitest + React Testing Library + Playwright

## 📚 API Endpoints

### Core Review APIs
- `GET /api/reviews/hostaway` - Fetch Hostaway reviews with filtering
- `GET /api/reviews/google` - Fetch Google Places reviews with caching
- `PATCH /api/reviews/:id` - Update review approval/pinned status

### Property & Listing APIs
- `GET /api/listings/[slug]` - Property details with approved reviews
- `GET /api/properties` - All properties with metrics

### Data Management
- `npm run validate:data` - Verify data mapping consistency

## ⌨️ Keyboard Shortcuts

- `Ctrl+D` - Navigate to Dashboard
- `Ctrl+L` - Navigate to Properties
- `Ctrl+,` - Open Settings
- `Ctrl+A` - Select All Reviews
- `Ctrl+Shift+A` - Bulk Approve Selected
- `Escape` - Clear Selection

## 🔧 Configuration

### Environment Variables
```bash
# Hostaway API (optional - has mock fallback)
HOSTAWAY_CLIENT_ID=your_client_id
HOSTAWAY_CLIENT_SECRET=your_client_secret

# Google Places API (optional)
GOOGLE_PLACES_API_KEY=your_api_key

# Database
DATABASE_URL="file:./dev.db"
```

### Auto-Approval Settings
Configure automatic approval for high-rated reviews in `/dashboard/settings`:
- Set rating threshold (1-5 stars)
- Enable/disable auto-approval
- Audit trail for all decisions

## 📊 Analytics & Insights

### Issue Detection
Automatically scans low-rated reviews for common problems:
- **Cleanliness**: dirty, clean, mess, stain
- **Noise**: loud, noise, quiet, sound  
- **Connectivity**: wifi, internet, connection
- **Maintenance**: broken, repair, fix, problem

### Trend Analysis
- Compares recent reviews (last 10) vs overall average
- Identifies improving/declining/stable trends
- Visual indicators and actionable insights

### Channel Performance
- Analyzes rating performance by booking platform
- Identifies best-performing channels
- Helps optimize marketing strategies

## 🛡️ Data Consistency & Validation

### Automated Validation
```bash
npm run validate:data
```
- Verifies mock data ↔ database mapping consistency
- Identifies orphaned or mismatched reviews
- Prevents approval/display discrepancies
- Can be integrated into CI/CD pipeline

### Error Prevention
- Normalized ID formats across all sources
- Consistent property-review mapping
- Real-time validation in API endpoints
- Comprehensive error handling and recovery

## 🚀 Deployment

### Development
```bash
npm run dev          # Start development server
npm run lint         # Check code quality
npm run validate:data # Verify data consistency
```

### Production
```bash
npm run build        # Build for production
npm start           # Start production server
```

### Database Management
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations  
npm run prisma:seed      # Seed with sample data
```

## 📖 Documentation

- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Comprehensive technical documentation
- **[DOCS.md](./DOCS.md)** - API reference and setup guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run validation (`npm run validate:data`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Flex Living

Flex Living is a modern property management platform focused on providing exceptional guest experiences through technology and data-driven insights. This review management system ensures consistent, high-quality review display across all properties while maintaining efficient management workflows.

---

**Built with ❤️ for property managers who care about guest experience**
