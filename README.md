# BookNSmash - Sports Events & Community Platform

A complete, production-ready React.js frontend for a sports events and community platform. Built with React 18, Tailwind CSS, and React Router.

## 🚀 Features

### ✅ Complete Modules Implemented

#### 1. **Authentication**
- Login page with email/password validation
- Registration form with password confirmation
- Forgot password flow
- Client-side form validation
- Success/error message handling

#### 2. **Home Page**
- Hero section with CTA buttons
- Sports category filters (8 sports)
- Upcoming events showcase
- Platform statistics
- Responsive design

#### 3. **Matches Module**
- Match listing with filters (sport, date, location)
- Match detail cards with availability
- Join match modal with slot information
- Create match form with comprehensive validation
- Skill level selection
- Price and venue management

#### 4. **Events & Tournaments**
- Event listing with filters
- Event detail pages with:
  - Tournament brackets (static)
  - Match schedule table
  - Registration form with validation
  - Participant tracking
  - Entry fee display

#### 5. **Venues Module**
- Venue listing with search and filters
- Venue detail pages featuring:
  - Image gallery with carousel
  - Amenities list
  - Sports available
  - Location map placeholder
  - Booking sidebar
  - Operating hours and pricing

#### 6. **Community Module**
- Player profiles with:
  - View/edit modes
  - Photo upload functionality
  - Stats display (matches, win rate)
  - Sports selection
  - Bio and contact information
- Team profiles with:
  - Team management
  - Member invitation system
  - Recent matches display
  - Win/loss records
  - Captain designation

#### 7. **Shop Module**
- Product listing with filters
- Product detail pages with:
  - Image gallery
  - Size and color selection
  - Quantity controls
  - Add to cart functionality
  - Vendor information
  - Reviews and ratings
- Shopping cart counter

#### 8. **Admin Dashboard**
- Statistics widgets (users, events, revenue, tournaments)
- Pending registration approvals
- Recent activity feed
- Quick action buttons
- Approval/rejection modals

#### 9. **Sponsorship**
- Sponsorship packages (Bronze, Silver, Gold)
- Benefits showcase
- Branding placement information
- Contact CTAs
- Pricing tiers

### 🎨 Design Features

- **Modern UI**: Clean, professional design with vibrant colors
- **Responsive**: Mobile-first approach, works on all devices
- **Animations**: Smooth transitions and micro-animations
- **Glassmorphism**: Modern glass effects on headers
- **Gradient Backgrounds**: Eye-catching gradient designs
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Comprehensive error states

### 🛠️ Technical Stack

- **React 18.2.0** - Latest React with concurrent features
- **React Router DOM 7.11.0** - Client-side routing
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Vite 7.2.4** - Fast build tool and dev server
- **ESLint** - Code quality and consistency

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ErrorState.jsx
│   │   ├── FormInput.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── Modal.jsx
│   └── layout/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Layout.jsx
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ForgotPassword.jsx
│   ├── matches/
│   │   ├── Matches.jsx
│   │   └── CreateMatch.jsx
│   ├── events/
│   │   ├── Events.jsx
│   │   └── EventDetail.jsx
│   ├── venues/
│   │   ├── Venues.jsx
│   │   └── VenueDetail.jsx
│   ├── community/
│   │   ├── Community.jsx
│   │   ├── PlayerProfile.jsx
│   │   └── TeamProfile.jsx
│   ├── shop/
│   │   ├── Shop.jsx
│   │   └── ProductDetail.jsx
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   ├── Home.jsx
│   └── Sponsorship.jsx
├── data/
│   └── mockData.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🚦 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🎯 Available Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password recovery
- `/matches` - Match listing
- `/matches/create` - Create new match
- `/events` - Events listing
- `/events/:id` - Event detail
- `/venues` - Venues listing
- `/venues/:id` - Venue detail
- `/community` - Community hub
- `/community/player/:id` - Player profile
- `/community/team/:id` - Team profile
- `/shop` - Shop listing
- `/shop/product/:id` - Product detail
- `/admin` - Admin dashboard
- `/sponsorship` - Sponsorship information

## 📊 Mock Data

The application uses comprehensive mock data located in `src/data/mockData.js`:

- 8 sports categories
- 4 upcoming events
- 4 matches
- 4 venues
- 6 products
- 2 players
- 2 teams
- 3 sponsorship packages

## 🎨 Customization

### Colors

The color scheme is defined in `tailwind.config.js`:
- Primary: Blue shades
- Secondary: Purple shades
- Accent colors for each sport

### Fonts

- **Display Font**: Outfit (headings)
- **Body Font**: Inter (body text)

## 🔄 Next Steps for Backend Integration

1. Replace mock data with API calls
2. Implement authentication with JWT tokens
3. Add real-time updates with WebSockets
4. Integrate payment gateway
5. Add image upload functionality
6. Implement search with backend
7. Add pagination for listings

## 📝 Code Quality

- ESLint configured for React best practices
- Consistent component structure
- Reusable common components
- Proper prop validation
- Clean code organization

## 🎭 Demo Flow

The application supports complete user flows:

1. **Browse → Event → Register**: View events, see details, register
2. **Browse → Match → Join**: Find matches, check availability, join
3. **Create Profile**: Player or team profile creation
4. **Shop**: Browse products, view details, add to cart
5. **Admin**: Manage registrations, view analytics

## 🌟 Highlights

- **Production-Ready**: Clean, scalable code structure
- **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- **Rich Interactions**: Modals, carousels, filters, and forms
- **Validation**: Comprehensive client-side validation
- **UX Polish**: Loading states, error handling, success messages
- **Accessibility**: Semantic HTML, proper ARIA labels
- **Performance**: Optimized with Vite, lazy loading ready

## 📄 License

This project is ready for commercial use.

## 👨‍💻 Development

Built with ❤️ using modern React best practices and professional frontend development standards.
