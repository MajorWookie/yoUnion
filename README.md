# Younion - Financial Data for Employees

Younion is a React Native app built with Expo that helps employees understand their public company's financial data through intuitive interfaces and plain-English summaries.

## 🚀 Features

- **Company Search**: Find any publicly traded company by name or ticker symbol
- **Financial Insights**: Interactive income statement visualizations with simple and detailed views
- **SEC Filings**: Access and browse 10-K, 10-Q, 8-K, and DEF 14A filings
- **CEO Pay Ratios**: Understand executive compensation relative to median employee pay
- **User Profiles**: Personalized experience with employment context
- **Offline Support**: Access last viewed company data without internet

## 🛠 Tech Stack

- **Frontend**: Expo SDK 53, React Native 0.79, React 19, TypeScript
- **UI Framework**: Tamagui with dark/light theme support
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (UI state) + TanStack Query (server state)
- **Charts**: Victory Native with react-native-svg
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **Data Source**: SEC EDGAR API via sec-api.io

## 📁 Project Structure

```
app/
├── (auth)/
│   ├── login.tsx           # Sign in screen
│   ├── signup.tsx          # Sign up screen
│   └── onboarding.tsx      # User onboarding flow
├── (tabs)/
│   ├── index.tsx           # Home - company search
│   └── profile.tsx         # User profile & settings
└── company/
    └── [ticker]/
        ├── index.tsx       # Company overview
        └── filings.tsx     # SEC filings list

components/
├── ui/                     # Reusable UI components
└── charts/                 # Chart components

lib/
├── api/                    # API layer with typed functions
├── stores/                 # Zustand stores
├── schemas.ts              # Zod validation schemas
└── supabase.ts            # Supabase client config

supabase/
├── migrations/            # Database schema migrations
└── functions/            # Edge functions for data processing
```

## 🏗 Database Schema

### Core Tables
- `companies` - Public company information
- `filings` - SEC filing metadata  
- `financial_statements` - Parsed financial data
- `financial_lines` - Individual line items
- `ceo_pay_ratio` - Executive compensation ratios
- `profiles` - User profile information

### Data Processing
- `filing_sections` - Parsed filing content
- `embeddings` - Vector embeddings for RAG search

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account (for backend)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd younion
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Fill in your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Set up database**
Run the migration files in your Supabase dashboard or via CLI:
```bash
# Apply migrations
supabase db reset

# Seed sample data
supabase db seed
```

4. **Start development server**
```bash
npm run dev
```

## 📱 Usage

### Search Companies
1. Open the app and search for any public company
2. Results show company name, ticker, and basic info
3. Tap to view detailed company overview

### View Financial Data
1. Company overview shows CEO info and pay ratio
2. Interactive pie chart displays income statement data
3. Toggle between Annual/Quarterly periods
4. Switch between Simple and Detailed chart views

### Browse SEC Filings
1. Access all company filings (10-K, 10-Q, 8-K, DEF 14A)
2. Filter by filing type
3. View filing details and sections

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test companies.test.ts
```

## 🏗 Building

```bash
# Web build
npm run build:web

# Create development build
eas build --profile development

# Create production build
eas build --profile production
```

## 🚢 Deployment

The app is configured for deployment via Expo Application Services (EAS):

```bash
# Submit to app stores
eas submit

# Deploy web version
npm run build:web
# Deploy to your hosting platform
```

## 📊 Data Processing Pipeline

1. **Ingestion**: SEC filings streamed via sec-api.io WebSocket
2. **Parsing**: HTML/XBRL content extracted and cleaned
3. **Normalization**: Financial data mapped to standard line codes
4. **Embeddings**: Text content vectorized for RAG search
5. **Storage**: Structured data stored in Supabase Postgres

## 🔒 Security & Privacy

- Row Level Security (RLS) enabled for user data
- API keys stored securely in environment variables
- User PII encrypted at rest (AES-256)
- TLS encryption for all data in transit
- Hard delete option for user account removal

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@younion.app or open an issue in the GitHub repository.

## 🗺 Roadmap

- [ ] Advanced financial ratio calculations
- [ ] Peer company comparisons  
- [ ] Push notifications for new filings
- [ ] AI-powered financial insights
- [ ] Insider trading activity tracking
- [ ] Custom watchlists and alerts

---

Built with ❤️ for employees who want to understand their company's financial story.