# TypeType 🚀

A modern, beautiful typing platform inspired by MonkeyType, built with Node.js, Express, and Socket.IO.

## What We Built

### 🎯 **Complete Typing Platform**
We've created a fully functional typing speed test platform that rivals MonkeyType with the following components:

#### **Backend Architecture**
- **Express.js Server** (`server.js`): Handles HTTP requests and serves static files
- **Socket.IO Integration**: Real-time communication for multiplayer features
- **RESTful API**: `/api/texts` and `/api/text/:id` endpoints for text management
- **Static File Serving**: Serves HTML, CSS, and JavaScript files from `/public`

#### **Frontend Implementation**
- **Modern HTML5** (`public/index.html`): Semantic structure with beautiful layout
- **Advanced CSS3** (`public/styles.css`): 
  - Gradient backgrounds and glassmorphism effects
  - Responsive design with mobile-first approach
  - Smooth animations and transitions
  - Dark theme with golden accents
- **Vanilla JavaScript** (`public/script.js`): 
  - Object-oriented TypingTest class
  - Real-time WPM and accuracy calculations
  - Word-by-word validation system
  - Timer functionality with countdown
  - Results display and sharing features

#### **Core Features Implemented**
1. **Real-time Typing Test**
   - 60-second countdown timer
   - Live WPM calculation
   - Real-time accuracy tracking
   - Word-by-word progression

2. **Visual Feedback System**
   - Current word highlighting (golden border)
   - Correct words (green color)
   - Incorrect words (red with underline)
   - Smooth transitions between states

3. **Statistics Dashboard**
   - Live WPM display
   - Real-time accuracy percentage
   - Countdown timer
   - Error tracking

4. **Results System**
   - Final WPM calculation
   - Overall accuracy percentage
   - Time taken
   - Total errors made
   - Shareable results

5. **User Experience**
   - Start/Restart functionality
   - New text selection
   - Responsive design for all devices
   - Keyboard-friendly navigation
   - Smooth animations

#### **Technical Highlights**
- **Real-time Updates**: Socket.IO for live progress tracking
- **Performance Optimized**: Efficient DOM manipulation and event handling
- **Cross-browser Compatible**: Works on all modern browsers
- **Mobile Responsive**: Touch-friendly interface
- **Accessibility**: Keyboard navigation and screen reader support

#### **Code Quality**
- **Modular Architecture**: Clean separation of concerns
- **Object-Oriented Design**: Well-structured JavaScript classes
- **Modern CSS**: Flexbox, Grid, and CSS custom properties
- **Error Handling**: Graceful fallbacks and user feedback
- **Documentation**: Comprehensive code comments

## Features

- ⚡ **Real-time typing tests** with 60-second timer
- 📊 **Live WPM (Words Per Minute) calculation**
- 🎯 **Accuracy tracking** with visual feedback
- 🌈 **Beautiful modern UI** with dark theme and gradients
- 📱 **Responsive design** that works on all devices
- 🔄 **Multiple text sources** with random selection
- 📈 **Detailed results** with shareable scores
- 🌐 **Real-time multiplayer** features (coming soon)
- ⌨️ **Word-by-word validation** with visual indicators

## Screenshots

The platform features a stunning gradient background with glassmorphism effects, real-time statistics, and smooth animations.

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd typetype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Visit `http://localhost:3000` to start typing!

## Usage

### Starting a Test
1. Click the **"Start Test"** button
2. Begin typing the highlighted text
3. Press **Space** to move to the next word
4. Complete the test within 60 seconds

### Understanding Results
- **WPM**: Words Per Minute - your typing speed
- **Accuracy**: Percentage of correctly typed characters
- **Time**: Time taken to complete the test
- **Errors**: Number of mistakes made

### Features
- **New Text**: Get a different random text to practice
- **Restart**: Start the same text again
- **Share Results**: Share your scores on social media

## Technology Stack

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Modern CSS with gradients and animations
- **Fonts**: Inter (Google Fonts)
- **Icons**: Font Awesome

## Project Structure

```
typetype/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/                # Static files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Modern CSS styling
│   └── script.js          # Frontend JavaScript
└── README.md              # This file
```

## API Endpoints

- `GET /` - Main application page
- `GET /api/texts` - Get all available texts
- `GET /api/text/:id` - Get specific text by ID

## Socket.IO Events

- `startTest` - User starts a typing test
- `typingProgress` - Real-time typing progress
- `testComplete` - User completes a test

## Customization

### Adding New Texts
Edit the `sampleTexts` array in `server.js` to add your own texts:

```javascript
const sampleTexts = [
  "Your custom text here...",
  "Another text for practice...",
  // Add more texts
];
```

### Changing Time Limit
Modify the `timeLimit` variable in `script.js`:

```javascript
this.timeLimit = 120; // 2 minutes instead of 60 seconds
```

### Styling
The CSS uses CSS custom properties for easy theming. Modify colors in `styles.css`:

```css
:root {
  --primary-color: #ffd700;
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] User accounts and leaderboards
- [ ] Different time modes (15s, 30s, 2min, 5min)
- [ ] Custom text input
- [ ] Typing sound effects
- [ ] Dark/Light theme toggle
- [ ] Mobile app version
- [ ] Multiplayer races
- [ ] Statistics tracking over time

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [MonkeyType](https://monkeytype.com)
- Built with modern web technologies
- Designed for typing enthusiasts

---

**Happy Typing!** ⌨️✨
