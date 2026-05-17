# UTEShop E-Commerce Platform - Frontend Architecture

Welcome to the frontend repository for **UTEShop**, a state-of-the-art academic marketplace built with React, Vite, Redux Toolkit, and Tailwind CSS. This documentation outlines the architectural standards, design system tokens, and authentication workflows established for the platform.

---

## 🎨 Design System: Academic Modernism

UTEShop implements the **"Academic Modernism"** design system, engineered to balance academic precision, scholarly aesthetics, and highly accessible user interfaces.

### Core Tokens & Color Palette
Our design tokens are strictly defined in `tailwind.config.js` and should be utilized via Tailwind utility classes across all components:

- **Primary (`#004ac6`)**: Used for primary call-to-action buttons, active states, key branding elements, and prominent highlights.
- **Primary Container (`#2563eb`)**: Used for secondary prominent containers, brand accents, and interactive card backgrounds.
- **Secondary (`#505f76`)**: Used for navigational elements, subheadings, and secondary actions.
- **Surface (`#faf8ff`)**: The default app background color, offering a soft, eye-pleasing canvas for long academic study sessions.
- **Surface Container Lowest (`#ffffff`)**: Used for primary content cards, modal dialogs, form wrappers, and structural layouts.
- **Outline Variant (`#c3c6d7`)**: Used for subtle structural borders, input outlines, and dividers.

### Typography
- **Font Family**: `Manrope`, sans-serif.
- **Hierarchy**: From `display` (48px, bold/extrabold) down to `body-sm` (14px) and `label-caps` (12px uppercase tracking-widest).

---

## 🏗️ Project Structure & Architectural Patterns

The codebase follows a modular, feature-scoped structure designed for long-term scalability and maintainability:

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Global navigation bar with search and auth state indicators
│   │   ├── Footer.jsx         # Global academic footer with discipline links & copyright
│   │   ├── Layout.jsx         # Standard page wrapper ensuring structural consistency
│   │   ├── InputField.jsx     # Reusable, accessible form input component with icon support
│   │   └── PrimaryButton.jsx  # Standardized CTA button component with loading spinners
│   ├── pages/
│   │   ├── Home.jsx           # Dynamic homepage with hero banners, discipline categories, flash deals
│   │   ├── Search.jsx         # Advanced marketplace search with multi-parameter filtering & pagination
│   │   ├── ProductDetail.jsx  # Immersive product gallery, specification tables, trust badges, and sticky FABs
│   │   ├── Login.jsx          # High-end split-layout authentication login page with Google OAuth
│   │   ├── Register.jsx       # Split-layout account registration flow
│   │   ├── ForgotPassword.jsx # Step 1 of account recovery: Email entry
│   │   ├── VerifyOTP.jsx      # Step 2: 6-digit OTP verification with countdown timer
│   │   ├── ResetPassword.jsx  # Step 3: Secure password reset with visual requirement guides
│   │   └── Profile.jsx        # Customer identity management, avatar uploads, and order history navigation
│   ├── redux/
│   │   ├── store.js           # Redux store configuration
│   │   └── authSlice.js       # Global authentication state management, async thunks, and error handling
│   ├── index.css              # Tailwind directives and custom micro-animation utility classes
│   └── main.jsx               # React entry point & Router provider
├── index.html                 # Main HTML template with Google Fonts & FontAwesome CDN attachments
├── tailwind.config.js         # Authoritative design token configuration
└── package.json               # Project dependencies and Vite build scripts
```

---

## 🔐 Authentication & State Management

UTEShop relies on **Redux Toolkit** (`authSlice`) as the single source of truth for user authentication and session management.

### Authentication Workflows
1. **Login Flow**: Users can authenticate via standard Email/Password credentials or via Google OAuth (`@react-oauth/google`). Successful login persists the JWT token and user profile into Redux state and `localStorage`.
2. **Registration Flow**: Captures user details and dispatches an OTP verification code before finalizing account creation.
3. **Password Recovery Flow**: A multi-step, highly secure process (`ForgotPassword` -> `VerifyOTP` -> `ResetPassword`) ensuring robust account protection.
4. **Profile Management**: Authenticated users can update personal details, upload profile avatars, and review their verified customer tier.

---

## 🚀 Getting Started & Scripts

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Available Scripts

In the project directory, you can run:

#### `npm run dev`
Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

#### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm run lint`
Runs ESLint across the project to ensure code quality and adherence to React best practices.

#### `npm run preview`
Serves the production build locally for previewing before deployment.

---

## 🛡️ License & Framework
Built for the **UTEShop Marketplace**. Powered by the Academic Modernism Framework v1.0.
