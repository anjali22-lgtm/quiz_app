import { useEffect, useState } from "react";
import "./App.css";

const categories = [
  { name: "General Knowledge", id: 9 },
  { name: "Computers", id: 18 },
  { name: "Mathematics", id: 19 },
  { name: "Science", id: 17 },
];

const difficulties = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

function App() {
  const [page, setPage] = useState("home"); // "home", "setup", "quiz"
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);

  const [userAnswers, setUserAnswers] = useState([]);

  // 🔹 Fetch questions
  useEffect(() => {
    if (!quizStarted) return;

    setLoading(true);

    fetch(
      `https://opentdb.com/api.php?amount=5&type=multiple&category=${selectedCategory}&difficulty=${selectedDifficulty}`
    )
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => {
          const options = [...q.incorrect_answers];
          options.splice(
            Math.floor(Math.random() * (options.length + 1)),
            0,
            q.correct_answer
          );

          return {
            question: q.question,
            options,
            answer: q.correct_answer,
          };
        });

        setQuestions(formatted);
        setLoading(false);
      });
  }, [quizStarted, selectedCategory, selectedDifficulty]);

  // 🔹 Handle answer click
  function handleAnswer(option) {
    const currentQuestion = questions[current];

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        correctAnswer: currentQuestion.answer,
        userAnswer: option,
      },
    ]);

    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }

    setCurrent(current + 1);
  }

  // 🔹 HOME PAGE
  if (page === "home") {
    return (
      <div className="app-bg">
        <div className="quiz-card text-center">
          <h1 className="mb-3">🎉 Welcome to React Quiz App 🎉</h1>
          <p className="mb-4">
            Test your knowledge with fun quizzes! Click below to start.
          </p>
          <button
            className="btn btn-primary w-100"
            onClick={() => setPage("setup")}
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // 🔹 SETUP PAGE (Category + Difficulty)
  if (page === "setup") {
    return (
      <div className="app-bg">
        <div className="quiz-card text-center">
          <h2 className="mb-3">Quiz Setup</h2>

          {/* Category */}
          <select
            className="form-select mb-3"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            className="form-select mb-3"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">-- Select Difficulty --</option>
            {difficulties.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary w-100"
            disabled={!selectedCategory || !selectedDifficulty}
            onClick={() => {
              setQuizStarted(true); // triggers fetch
              setPage("quiz");       // go to quiz page
            }}
          >
            Start Quiz
          </button>

          <button
            className="btn btn-link mt-2"
            onClick={() => setPage("home")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // 🔹 LOADING SCREEN
  if (loading) {
    return (
      <div className="app-bg">
        <div className="quiz-card text-center">
          <h3>Loading questions...</h3>
        </div>
      </div>
    );
  }

  // 🔹 RESULT SCREEN
  if (current === questions.length) {
    const wrongAnswers = userAnswers.filter(
      (item) => item.userAnswer !== item.correctAnswer
    );

    return (
      <div className="app-bg">
        <div className="quiz-card">
          <h2 className="text-center">📊 Quiz Result</h2>
          <h4 className="text-center mt-2">
            Score: {score} / {questions.length}
          </h4>

          {wrongAnswers.length > 0 ? (
            <>
              <h5 className="text-danger mt-4">❌ Wrong Answers</h5>
              {wrongAnswers.map((item, index) => (
                <div key={index} className="mt-3 p-2 border rounded">
                  <p dangerouslySetInnerHTML={{ __html: item.question }}></p>
                  <p className="text-danger">
                    Your Answer:{" "}
                    <span dangerouslySetInnerHTML={{ __html: item.userAnswer }} />
                  </p>
                  <p className="text-success">
                    Correct Answer:{" "}
                    <span dangerouslySetInnerHTML={{ __html: item.correctAnswer }} />
                  </p>
                </div>
              ))}
            </>
          ) : (
            <h5 className="text-success mt-4 text-center">
              🎉 Perfect Score! All answers correct
            </h5>
          )}

          <button
            className="btn btn-primary w-100 mt-4"
            onClick={() => {
              setQuizStarted(false);
              setPage("setup");
              setCurrent(0);
              setScore(0);
              setQuestions([]);
              setUserAnswers([]);
            }}
          >
            Back to Setup
          </button>

          <button
            className="btn btn-link w-100 mt-2"
            onClick={() => {
              setQuizStarted(false);
              setPage("home");
              setCurrent(0);
              setScore(0);
              setQuestions([]);
              setUserAnswers([]);
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // 🔹 QUIZ SCREEN
  return (
    <div className="app-bg">
      <div className="quiz-card">
        <h5 className="text-muted">
          Question {current + 1} / {questions.length}
        </h5>

        <h3
          className="question mt-3"
          dangerouslySetInnerHTML={{ __html: questions[current].question }}
        />

        {questions[current].options.map((opt, index) => (
          <button
            key={index}
            className="option-btn"
            onClick={() => handleAnswer(opt)}
            dangerouslySetInnerHTML={{ __html: opt }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
