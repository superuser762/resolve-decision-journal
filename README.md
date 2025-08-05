# Resolve - Your Decision Journal

A mobile-first decision journal app built with Next.js and Capacitor, designed to help you make better, more mindful decisions through structured logging and reflection.

## Features

### Core Features
- **Decision Logging**: Create structured decision logs with pros, cons, and gut feeling analysis
- **Status Tracking**: Track decisions from "Pending" to "Decision Made" to "Reviewing Outcome"
- **Key Factors**: Categorize decisions by factors like Career, Finance, Relationship, Health, etc.
- **Reflection System**: Add reflections and outcome reviews to learn from past decisions
- **Free Tier**: Up to 3 active decision logs (upgrade to Resolve+ for unlimited)

### Mobile Features (Native App)
- **📷 Camera Integration**: Attach photos to provide context for your decisions
- **🔔 Push Notifications**: Schedule reminders to review pending decisions
- **📱 Native Experience**: Full mobile app experience with native device integration

### Premium Features (Resolve+ - $49.99/year)
- Unlimited decision logs
- Advanced analytics and insights
- Cloud sync across devices
- Biometric security
- Data export capabilities

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Mobile**: Capacitor for native mobile deployment
- **Storage**: Local storage (with future cloud sync)
- **Build**: Static export for mobile deployment

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd resolve-app
npm install
```

2. **Run development server**:
```bash
npm run dev
```
Visit `http://localhost:8000` to see the web version.

3. **Build for production**:
```bash
npm run build
```

### Mobile Development

1. **Add mobile platforms**:
```bash
# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios
```

2. **Sync web assets to mobile**:
```bash
npx cap sync
```

3. **Open in native IDEs**:
```bash
# Open Android Studio
npx cap open android

# Open Xcode (macOS only)
npx cap open ios
```

### Mobile Permissions

The app requests the following permissions:
- **Camera**: For attaching photos to decision logs
- **Notifications**: For decision reminders and push notifications
- **Storage**: For local data persistence

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Dashboard page
│   └── new-decision/      # New decision form page
├── components/            # React components
│   ├── DecisionLogCard.tsx    # Decision log display card
│   ├── DecisionLogForm.tsx    # Decision creation/editing form
│   └── ui/                    # shadcn/ui components
├── hooks/                 # Custom React hooks
│   ├── useDecisionLogs.ts     # Decision data management
│   └── useMobileServices.ts   # Mobile features (camera, notifications)
└── lib/                   # Utility functions
```

## Key Components

### Decision Log Structure
```typescript
interface DecisionLog {
  id: string
  title: string
  pros: string[]
  cons: string[]
  gutFeeling: number        // 0-100 scale
  keyFactors: string[]      // Career, Finance, etc.
  status: 'Pending' | 'Decision Made' | 'Reviewing Outcome'
  reflection?: string
  outcome?: string
  createdAt: string
  updatedAt: string
}
```

### Mobile Services
- Camera integration for photo attachments
- Local notifications for decision reminders
- Push notifications for engagement
- Native platform detection

## Building for Production

### Web Deployment
```bash
npm run build
# Deploy the 'out' folder to your web hosting service
```

### Android APK
1. Build the web app: `npm run build`
2. Sync to Capacitor: `npx cap sync android`
3. Open Android Studio: `npx cap open android`
4. Build APK or AAB in Android Studio

### iOS App Store
1. Build the web app: `npm run build`
2. Sync to Capacitor: `npx cap sync ios`
3. Open Xcode: `npx cap open ios`
4. Build and archive in Xcode

## Configuration

### Capacitor Configuration
Edit `capacitor.config.ts` to customize:
- App ID and name
- Web directory
- Plugin configurations

### Environment Variables
Create `.env.local` for:
- Push notification keys
- Analytics tokens
- Feature flags

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and mobile
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and feature requests, please open an issue on GitHub.

---

**Resolve** - Make better decisions, one log at a time. 🎯
