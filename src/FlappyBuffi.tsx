import React, { useState, useEffect, useRef } from "react";
import "./flappybuffi.css";

function FlappyBuffi() {
  const [gameState, setGameState] = useState<string>("Start");
  const [score, setScore] = useState<number>(0);
  const [pipeSprites, setPipeSprites] = useState<Array<PipeSprite>>([]);
  const [message, setMessage] = useState(
    "Press the Enter key to start the game. Use the Space key to flap and avoid the pipes"
  );

  const backgroundRef = useRef<HTMLDivElement>(null);
  const buffiRef = useRef<HTMLImageElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  let pipe_gap = 35;
  let pipe_seperation = 0;
  interface PipeSprite {
    upper?: HTMLDivElement;
    lower?: HTMLDivElement;
    increase_score?: number;
  }

  // game controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && gameState === "Play") {
        // DO NOTHING
      }

      if (e.key === "Enter" && gameState === "Start") {
        setGameState("Play");
        setScore(0);
        setPipeSprites([]);
        setMessage(
          "Press the Enter key to start the game. Use the Space key to flap and avoid the pipes"
        );
        const buffi = buffiRef.current!;
        buffi.style.top = "50%";
        buffi.style.left = "10%";
        play();
      }

      if (e.key === "Enter" && gameState !== "Play") {
        setGameState("Play");
        setScore(0);
        setPipeSprites([]);
        setMessage("Game Over, Restarting Game...");
        const buffi = buffiRef.current!;
        buffi.style.top = "50%";
        buffi.style.left = "10%";
        const pipes = document.querySelectorAll(".pipe_sprite_inv");
        pipes.forEach((pipe) => pipe.remove());
        const pipes2 = document.querySelectorAll(".pipe_sprite");
        pipes2.forEach((pipe) => pipe.remove());
        play();
      }

      if (gameState === "Over") {
        setGameState("Play");
        setScore(0);
        setPipeSprites([]);
        const pipes = document.querySelectorAll(".pipe_sprite_inv");
        pipes.forEach((pipe) => pipe.remove());
        const pipes2 = document.querySelectorAll(".pipe_sprite");
        pipes2.forEach((pipe) => pipe.remove());
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState]);

  const play = () => {
    const buffi = buffiRef.current!;
    const birdStartY = parseFloat(
      getComputedStyle(buffi).getPropertyValue("top")
    );

    let birdY = birdStartY;
    let birdVel = 0;

    document.addEventListener("keydown", handleKeyDown);
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === " ") {
        birdVel = -5;
        buffi.classList.add("flap");
        setTimeout(() => buffi.classList.remove("flap"), 200);
      }
    }

    const gameLoop = setInterval(() => {
      birdY += birdVel;
      buffi.style.top = `${birdY}px`;
      birdVel += 0.2;

      if (
        birdY < 0 ||
        birdY + buffi.offsetHeight > backgroundRef.current!.offsetHeight
      ) {
        endGame();
      }

      spawnPipes();
      if (score % 10 === 0 && score > 0 && pipeSprites.length === 0) {
        spawnPipes();
      }
      if (score % 10 === 0 && score > 0) {
        pipe_gap -= 0.5;
        pipe_seperation += 0.5;
        if (pipe_gap < 20) {
          pipe_gap = 20;
        }
        if (pipe_seperation > 115) {
          pipe_seperation = 115;
        }
      }
    }, 20);

    function endGame() {
      setGameState("Over");
      clearInterval(gameLoop);
      document.removeEventListener("keydown", handleKeyDown);
      setMessage("Game Over. Press Enter to Restart Game.");
    }
    return () => clearInterval(gameLoop);
  };

  useEffect(() => {
    const pipeInterval = setInterval(() => {
      pipeSprites.forEach((pipe) => {
        if (pipe.upper && pipe.lower) {
          pipe.upper.style.left = `${parseFloat(pipe.upper.style.left) - 1}vw`;
          pipe.lower.style.left = `${parseFloat(pipe.lower.style.left) - 1}vw`;
          if (parseFloat(pipe.upper.style.left) < 5) {
            if (pipe.increase_score === 1) {
              setScore((prevScore) => prevScore + 1);
              pipe.increase_score = 0;
            }
          }
        }
      });

      pipeSprites.forEach((pipe) => {
        if (pipe.upper && pipe.lower) {
          if (
            isColliding(buffiRef.current!, pipe.upper.getBoundingClientRect())
          ) {
            setGameState("Over");
          }
          if (
            isColliding(buffiRef.current!, pipe.lower.getBoundingClientRect())
          ) {
            setGameState("Over");
          }
        }
      });
    }, 20);
    return () => clearInterval(pipeInterval);
  }, [pipeSprites]);

  function isColliding(a: HTMLImageElement, b: DOMRect) {
    const aRect = a.getBoundingClientRect();
    return !(
      aRect.bottom < b.top ||
      aRect.top > b.bottom ||
      aRect.right < b.left ||
      aRect.left > b.right
    );
  }

  function spawnPipes() {
    if (pipe_seperation > 115) {
      pipe_seperation = 0;
      const pipe_gap_height = 25;
      const pipe_posi =
        Math.floor(Math.random() * (100 - pipe_gap_height - 8)) + 8;

      const pipe_sprite_inv = document.createElement("div");
      pipe_sprite_inv.className = "pipe_sprite_inv";
      pipe_sprite_inv.style.top = "0";
      pipe_sprite_inv.style.left = "100vw";
      pipe_sprite_inv.style.height = `${pipe_posi}vh`;

      const pipe_sprite = document.createElement("div");
      pipe_sprite.className = "pipe_sprite";
      pipe_sprite.style.top = `${pipe_posi + pipe_gap_height}vh`;
      pipe_sprite.style.left = "100vw";
      pipe_sprite.style.height = `${100 - (pipe_posi + pipe_gap_height)}vh`;

      const background = backgroundRef.current;
      if (background) {
        background.appendChild(pipe_sprite_inv);
        background.appendChild(pipe_sprite);
        setPipeSprites((prevPipeSprites) => {
          const newPipeSprites = [
            ...prevPipeSprites,
            {
              upper: pipe_sprite_inv,
              lower: pipe_sprite,
              increase_score: 1,
            },
          ];
          return newPipeSprites;
        });
      }
    }
    pipe_seperation++;
  }

  return (
    <div className="background" ref={backgroundRef}>
      <img className="buffi" ref={buffiRef} src="./bufficorn.png" alt="buffi" />
      {gameState !== "Play" && (
        <div className="message" ref={messageRef}>
          {message}
        </div>
      )}
      {gameState !== "Over" && <div className="score">{score}</div>}
      {gameState !== "Over" && <div className="game-title">Bufficorn Race</div>}
    </div>
  );
}

export default FlappyBuffi;
