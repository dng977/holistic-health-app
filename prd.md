# Holistic Health – Product Requirements Document (PRD)

## Project Overview

### Purpose
The Holistic Health app empowers users to holistically monitor and improve their wellness through comprehensive tracking of six key health aspects: nutrition, recovery, physical activity, mental wellbeing, social engagement, and environmental factors. The application features robust offline functionality with seamless cloud synchronization, ensuring users maintain uninterrupted access to their health data regardless of connectivity status.

**App Name**: Holistic Health  
**Platform**: React Native (iOS & Android)  
**Technology Stack**:  
- **React Native** (for cross-platform mobile development)  
- **Expo** (for development workflow and deployment)  
- **SQLite** (for offline data persistence)  
- **Supabase** (for backend services, authentication, and data synchronization)  
- **Zustand** (for state management)  
- **React Hook Form** (for form handling)  
- **NativeWind** (for utility-first styling)  


---

## 1. **Product Goals and Objectives**

### 1.1. **Primary Goal**
- Create a mobile app that supports health tracking for Nutrition, Recovery, Physical Activity, Mental Activity, Social Activity, and Environment.
- Ensure offline functionality with SQLite for local storage and sync with a backend server (Supabase) when connected to the internet.
- Provide personalized reminders for users to engage in healthy habits.

### 1.2. **Secondary Goals**
- Provide educational content on health, nutrition, and well-being.
- Ensure a smooth, user-friendly experience for both Android and iOS platforms.
- Allow easy customization and tracking of various health habits.

---

## 2. **User Stories**

### 2.1. **User Story 1: Account Management**
- **As a user**, I want to create an account and log in, so I can securely track my health data and access personalized recommendations.
- **Acceptance Criteria**:  
  - User can register using an email and password or SSO (Google, Facebook, etc.).
  - User can log in using the same credentials.
  - Users can reset their password via email.

### 2.2. **User Story 2: Habit Tracking**
- **As a user**, I want to track my Nutrition, Recovery, Physical Activity, Mental Activity, Social Activity, and Environment habits so I can monitor my health and well-being.
- **Acceptance Criteria**:  
  - User can add, edit, and delete habits for Nutrition, Recovery, Physical Activity, Mental Activity, Social Activity, and Environment.
  - User can log daily activity for each habit.
  - The app provides visual feedback on progress.
  - Historical trend views and insights.

### 2.3. **User Story 3: Offline Functionality**
- **As a user**, I want to use the app without an internet connection, so I can track my habits on the go.
- **Acceptance Criteria**:  
  - All health data is stored locally in SQLite.
  - Data is synced with the server (Supabase) once the device is connected to the internet.
  
### 2.4. **User Story 4: Educational Content**
- **As a user**, I want to see educational content integrated with each habit so I can understand why that habit is important for my health.
- **Acceptance Criteria**:  
  - Each habit includes relevant educational content explaining its importance and benefits.
  - Educational information is concise and directly tied to habit implementation.
  - Users can access more detailed information about each habit when needed.

---

## 3. **Features & Functionality**

### 3.1. **Habit Tracking**

Each of the following areas will have:

- Daily/weekly tracking interface
- Completion status indicators
- Historical trend views (charts, insights)
- Embedded educational content that explains the significance of each habit and how to integrate it into daily life

**Health Aspects:**
- **Nutrition**
- **Recovery**
- **Physical Activity**
- **Mental Activity**
- **Social Activity**
- **Environment**

#### a. **Nutrition**

- Daily check-ins for food groups: Water, Protein, Vegetables, Healthy Fats, Fruits, Grains, Fermented Foods, Sugar (limit)
- Nutrient State page to track RDA (Recommended Daily Allowance) fulfillment
- In-app tips on how different food types contribute to health (e.g., immunity, energy, digestion)

#### b. **Recovery**

- Sleep tracker (quality & duration)
- Meditation log (type/duration)
- Fasting log (e.g., intermittent 16:8, 24h fast)
- Explanations on how recovery practices promote cellular repair, emotional resilience, and metabolic health

#### c. **Physical Activity**

- Daily movement log
- Strength training, flexibility, and cardio sessions
- Breathing exercises
- Guides explaining how physical activity supports vitality, hormone balance, and stress reduction

#### d. **Mental Activity**

- Track cognitive challenges (learning, games, problem-solving)
- Log creative expressions (writing, drawing, music, etc.)
- Mindfulness practices and purpose reflection
- Insight into how mental stimulation supports brain health and emotional well-being

#### e. **Social Activity**

- Log laughter, conversations, touch, and community involvement
- Highlights on how social interaction affects stress levels and life satisfaction

#### f. **Environment**

- Check-ins for nature exposure, toxin reduction, lighting, noise control, and decluttering
- Explanatory content about how surroundings influence mental health, sleep, and productivity

### 3.2. Insights, Metrics & Reports

- **User Level**: Increases based on frequency of engagement and data entry, encouraging consistency and long-term use
- **Health Score**: Aggregated score that combines progress from each of the 6 health aspects, reflecting overall well-being
- **Health Chart**: Visual chart displaying a combined view of performance across all health aspects for holistic progress tracking

### 3.3. **Educational Content**
- Each habit includes embedded educational content explaining its importance and health benefits.
- Concise explanations and tips directly tied to habit implementation.
- Option to expand and view more detailed information about each habit.
- Educational content is contextual to the specific habit the user is viewing or tracking.

### 3.4. **Offline Support**
- Store all user data in **SQLite** for offline access.
- **Sync** with **Supabase** backend once online to upload data and retrieve updates.

### 3.5. **Notifications & Reminders**
- Daily check-in reminders (local notifications)
- Customizable based on goals

---

## 4. **Technical Requirements**

### 4.1. **Architecture**
- **State Management**: Zustand or TanStack for efficient state management.
- **Offline Storage**: SQLite for persistent local storage.
- **Backend Sync**: Supabase for managing user data, authentication, and syncing offline data.

### 4.2. **User Interface (UI)**
- **NativeWind** for utility-first styling based on Tailwind CSS.
- Responsive design for both phone and tablet views.
- Dark mode and light mode options.

### 4.3. **APIs**
- Supabase for authentication, data storage, and real-time sync.
- RESTful APIs for handling user data (e.g., user profiles, habit logs, educational content).

---

## 5. **Non-Functional Requirements**

### 5.1. **Performance**
- The app should have minimal load times, especially for habit tracking and syncing.
- The app should work smoothly even with limited device resources (low RAM or CPU).

### 5.2. **Security**
- Passwords and sensitive data must be encrypted during transmission.
- The app should implement secure authentication using Supabase’s authentication features.

### 5.3. **Usability**
- The app should be easy to navigate with intuitive UI elements.
- Provide helpful tooltips and onboarding screens to guide new users.

---

## 6. **User Interface Design**

### 6.1. **Onboarding Screens**
- **Screen 1**: Welcome screen with app introduction.
- **Screen 2**: User registration or login screen.
- **Screen 3**: Explanation of health habit tracking features.

#### 6.2. **Common UI Components**

##### Top Bar (Header)
- Profile icon on the left (for accessing profile settings)
- User's name displayed in the center
- User's level displayed on the right (number in a star icon)
- Consistent across all pages
- Elevation shadow for visual hierarchy

##### Pie Charts
- Interactive, visually appealing pie charts for each page
- Color-coded segments representing different aspects/habits
- Inner fill showing completion percentage for each segment
- Animated transitions when data changes
- Touch interaction to select individual segments

##### Tab Navigation
- Home tab in the center with distinctive "H" icon ✓
- Six health aspect tabs with appropriate icons ✓
- Visual indication of active tab

#### 6.3. **Page Structure and Component Architecture**

##### Activity Adding Page
- Accessible from any aspect page via the FloatingActionButton
- Form for adding a new activity record with the following fields:
  1. Aspect selection (dropdown, pre-selected based on the originating page)
  2. Aspect element selection (dropdown, filtered based on selected aspect)
  3. Duration input (in minutes)
  4. Notes field (optional)
  5. Submit button
- Consistent styling with the rest of the app
- Responsive design for different screen sizes

##### Common Components

###### TopBar Component
- Present on all pages throughout the app
- Contains user profile icon, username, and level
- Shows the current page title
- Consistent styling across all pages

###### FloatingActionButton Component
- Floating Plus button positioned in the bottom right corner above the navigation tabs
- Present on all aspect pages
- Opens the activity adding page when pressed
- Consistent styling across all pages
- Allows users to quickly add a new activity for the current aspect

###### AspectPage Component (Base Component)
- Base component/entity that all health aspect pages extend
- Standardized structure for consistent user experience
- Contains the following sections:
  1. TopBar (inherited from TopBar component)
  2. Aspect-specific pie chart showing sub-categories
  3. Activity log section (includes recent activity)
  4. FloatingActionButton for adding new activities

##### Page-Specific UI Designs

###### Home Page (Unique Structure)
- TopBar with user profile
- Main pie chart showing all health aspects:
  - Nutrition (Orange)
  - Recovery (Blue)
  - Physical Activity (Pink)
  - Mental Activity (Purple)
  - Social Activity (Cyan)
  - Environment (Light Green)
- Today's focus areas cards below the chart
- Quick action buttons for common tasks

###### Nutrition Page (Extends AspectPage)
- Inherits structure from AspectPage component
- Pie chart showing food groups:
  - Water
  - Protein
  - Vegetables
  - Healthy Fats
  - Fruits
  - Grains
  - Fermented Foods
  - Sugar (limit)
- Nutrition-specific habits tracking interface
- Nutrition activity history

###### Recovery Page (Extends AspectPage)
- Inherits structure from AspectPage component
- Pie chart showing recovery aspects:
  - Sleep (quality & duration)
  - Meditation
  - Fasting
- Recovery-specific habits tracking interface
- Recovery activity history

###### Physical Activity Page (Extends AspectPage)
- Inherits structure from AspectPage component
- Pie chart showing activity types:
  - Daily Movement
  - Strength Training
  - Flexibility
  - Cardio
  - Breathing Exercises
- Physical activity habits tracking interface
- Physical activity history

###### Mental Activity Page (Extends AspectPage)
- Inherits structure from AspectPage component
- Pie chart showing mental aspects:
  - Cognitive Challenges
  - Creative Expression
  - Mindfulness
  - Learning
- Mental activity habits tracking interface
- Mental activity history

###### Social Activity Page (Extends AspectPage)
- Inherits structure from AspectPage component
- Pie chart showing social aspects:
  - Social Interactions
  - Laughter
  - Meaningful Conversations
  - Community Engagement
- Social activity habits tracking interface
- Social activity history

###### Environment Page (Extends AspectPage)
- Inherits structure from AspectPage component
- Pie chart showing environmental aspects:
  - Nature Exposure
  - Toxin Reduction
  - Lighting Quality
  - Air Quality
- Environment habits tracking interface
- Environment activity history

---

### 6.4. **UI/UX Design Guidelines**

##### Color Scheme
- Primary: #4CAF50 (Green) - Representing health and vitality
- Secondary colors for each health aspect:
  - Nutrition: #FF9800 (Orange)
  - Recovery: #2196F3 (Blue)
  - Physical: #E91E63 (Pink)
  - Mental: #9C27B0 (Purple)
  - Social: #00BCD4 (Cyan)
  - Environment: #8BC34A (Light Green)
- Neutral colors:
  - Background: #F5F5F5
  - Cards/Surfaces: #FFFFFF
  - Text: #212121 (primary), #757575 (secondary)

##### Typography
- Primary Font: System font (San Francisco on iOS, Roboto on Android)
- Headings: Bold, 18-24pt
- Body Text: Regular, 14-16pt
- Accent Text: Medium, 12-14pt

##### Component Design
- Cards with subtle shadows (elevation: 2-4dp)
- Rounded corners (8dp radius)
- Clear visual hierarchy with consistent spacing (8dp, 16dp, 24dp)
- Accessible touch targets (minimum 44×44 points)
- Visual feedback for all interactive elements


## 7. **Milestones**

### 7.1. **Phase 1: UI Design Implementation**
- Create all UI components with mock data
- Implement TopBar component for consistent header across all pages
- Create base AspectPage component that all aspect pages will extend
- Build pie charts for home and all health aspect pages
- Implement consistent habits tracking and history sections for all aspect pages
- Establish consistent visual design across the app
- Develop responsive layouts for different screen sizes

### 7.2. **Phase 2: Data Models & Storage & Authentication**
- Implement data models for all health aspects
- Set up SQLite for offline-first storage
- Configure Supabase for cloud synchronization
- Implement authentication system with secure token handling

### 7.3. **Phase 3: Functionality Implementation**
- Connect UI components to data models and database
- Implement CRUD operations for all health aspects (create, read, update, delete)
- Develop data synchronization between UI and local/cloud storage
- Implement interactive features (habit tracking, completion marking, progress visualization)
- Build notification and reminder system with user preferences

### 7.4. **Phase 4: Deployment**
- Test app on multiple devices and fix any bugs
- Deploy the app on the App Store and Google Play Store

---

## 8. **Success Metrics**
- User engagement: Track how often users log their habits and interact with the app.
- Retention: Measure how many users return to the app after a week or month.
- Feedback: Collect user feedback through in-app surveys or ratings.
