import type React from "react"
import { useState, useEffect, useRef } from "react"
import { SkipForward, Play, Pause, HelpCircle } from "lucide-react"
import { audioFiles } from "../utils/audio"
import { AITimer } from "./AITimer"
import questions from "../data/q2.json"
import "../styles/KBCGame.css"

const prizeTiers = [10000000, 5000000, 2500000, 1250000, 675000, 250000, 75000, 25000, 10000, 5000, 2500, 1000]

const KBCGame: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [wonAmount, setWonAmount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false)
  const [skipQuestionUsed, setSkipQuestionUsed] = useState(false)
  const [removedOptions, setRemovedOptions] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [showAITimer, setShowAITimer] = useState(false)
  const [quitMessage, setQuitMessage] = useState<string | null>(null)

  const correctAudioRef = useRef<HTMLAudioElement | null>(null)
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null)
  const aiAskAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Preload audio files
    const correctAudio = new Audio(audioFiles.correct)
    const wrongAudio = new Audio(audioFiles.wrong)
    const aiAskAudio = new Audio(audioFiles.aiAsk)
    correctAudioRef.current = correctAudio
    wrongAudioRef.current = wrongAudio
    aiAskAudioRef.current = aiAskAudio
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isTimerRunning && timeLeft > 0 && selectedAnswer === null) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimeUp()
    }

    return () => {
      clearInterval(timer)
    }
  }, [isTimerRunning, timeLeft, selectedAnswer])

  const handleTimeUp = () => {
    setIsTimerRunning(false)
    setShowResult(true)
    if (wrongAudioRef.current) {
      wrongAudioRef.current.play()
    }
  }

  const handleAnswer = (selectedIndex: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(selectedIndex)
      const isCorrect = selectedIndex === questions[currentQuestion].correctAnswer
      setIsAnswerCorrect(isCorrect)
      setIsTimerRunning(false)

      if (isCorrect) {
        const currentPrize = prizeTiers[currentQuestion]
        setWonAmount(currentPrize)
        if (correctAudioRef.current) {
          correctAudioRef.current.play()
        }
      } else {
        if (wrongAudioRef.current) {
          wrongAudioRef.current.play()
        }
        // Set won amount to the current prize tier directly
        const currentPrize = prizeTiers[prizeTiers.length - 1 - currentQuestion]
        setWonAmount(currentPrize)
        setShowResult(true)
      }
    }
  }

  const handleNextQuestion = () => {
    setRemovedOptions([]) //This line is added to reset removed options for the next question.
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerCorrect(null)
      setTimeLeft(45)
      setIsTimerRunning(true)
    } else {
      setShowResult(true)
    }
  }

  const handleQuit = () => {
    const confirmQuit = window.confirm("Do you really want to quit?")
    if (confirmQuit) {
      // On quit, player gets the current tier's amount
      const currentPrize = currentQuestion > 0 ? prizeTiers[prizeTiers.length - currentQuestion] : 0
      setWonAmount(currentPrize)
      setQuitMessage(`You won ₹${currentPrize.toLocaleString()} points.`)
      setShowResult(true)
    }
  }

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const useFiftyFifty = () => {
    if (!fiftyFiftyUsed) {
      const correctAnswer = questions[currentQuestion].correctAnswer
      let availableOptions = [0, 1, 2, 3].filter((opt) => opt !== correctAnswer)
      availableOptions = availableOptions.sort(() => Math.random() - 0.5).slice(0, 2)
      setRemovedOptions(availableOptions)
      setFiftyFiftyUsed(true)
    }
  }

  const useSkipQuestion = () => {
    if (!skipQuestionUsed) {
      handleNextQuestion()
      setSkipQuestionUsed(true)
    }
  }

  const useAssistantLifeline = () => {
    setShowAITimer(true)
  }

  const closeAITimer = () => {
    setShowAITimer(false)
  }

  const progressPercentage = ((45 - timeLeft) / 45) * 100

  return (
    <div className="kbc-game">
      <div className="question-section">
        <div id="question">
          <div className="timer-div">
            <div className="progress-bar" id="progress-bar-left">
              <div id="progress-left" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="timer">
              <span>{timeLeft}</span>
            </div>
            <div className="progress-bar" id="progress-bar-right">
              <div id="progress-right" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          <div className="question-text">{questions[currentQuestion].question}</div>
        </div>

        <div className="options">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`option ${selectedAnswer === index ? "selected" : ""} ${
                removedOptions.includes(index) ? "removed" : ""
              } ${
                isAnswerCorrect !== null
                  ? index === questions[currentQuestion].correctAnswer
                    ? "correct"
                    : selectedAnswer === index
                      ? "wrong"
                      : ""
                  : ""
              }`}
              disabled={removedOptions.includes(index) || isAnswerCorrect !== null}
            >
              {String.fromCharCode(65 + index)}: {option}
            </button>
          ))}
        </div>

        <div className="button-container">
          {isAnswerCorrect === null ? (
            <>
              <button
                onClick={() => handleAnswer(selectedAnswer!)}
                className="lock-button"
                disabled={selectedAnswer === null}
              >
                Lock
              </button>
              <button onClick={handleQuit} className="quit-button">
                Quit
              </button>
            </>
          ) : (
            <button onClick={handleNextQuestion} className="next-button">
              Next
            </button>
          )}
        </div>

        {showResult && (
          <div className="result-overlay">
            <img src="/assets/logo.png" alt="Logo" className="logo" />
            {isAnswerCorrect ? (
              <h2>Correct!</h2>
            ) : (
              <>
                <h2>Wrong Answer!</h2>
                <p>You won: ₹{wonAmount.toLocaleString()} points</p>
              </>
            )}
            {quitMessage && <p>{quitMessage}</p>}
          </div>
        )}
        {showAITimer && <AITimer onClose={closeAITimer} />}
      </div>

      <div className="prize-tier">
        <div className="lifelines">
          <button
            onClick={useFiftyFifty}
            className={`lifeline ${fiftyFiftyUsed ? "used" : ""}`}
            disabled={fiftyFiftyUsed}
          >
            50:50
          </button>
          <button onClick={toggleTimer} className="lifeline pause-button">
            {isTimerRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button
            onClick={useSkipQuestion}
            className={`lifeline ${skipQuestionUsed ? "used" : ""}`}
            disabled={skipQuestionUsed}
          >
            <SkipForward className="h-6 w-6" />
          </button>
          <button
            onClick={useAssistantLifeline}
            className={`lifeline ${showAITimer ? "used" : ""}`}
            disabled={showAITimer}
          >
            <HelpCircle className="h-6 w-6" />
          </button>
        </div>
        <div className="prize-list">
          {prizeTiers.map((prize, index) => (
            <div key={index} className={`prize ${prizeTiers.length - 1 - index === currentQuestion ? "current" : ""}`}>
              ₹{prize.toLocaleString()} points
            </div>
          ))}
        </div>
      </div>

      <audio ref={correctAudioRef} src={audioFiles.correct} />
      <audio ref={wrongAudioRef} src={audioFiles.wrong} />
      <audio ref={aiAskAudioRef} src={audioFiles.aiAsk} />
    </div>
  )
}

export default KBCGame

