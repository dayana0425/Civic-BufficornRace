import React, { useState, useEffect, useRef } from "react";
import "./style.css";

function FlappyBuffi() {
  const [gameState, setGameState] = useState<string>("Start");
  const [score, setScore] = useState<number>(0);
  const [pipeSprites, setPipeSprites] = useState<Array<PipeSprite>>([]);

  const backgroundRef = useRef<HTMLDivElement>(null);
  const birdRef = useRef<HTMLImageElement>(null);
  const scoreValRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  interface PipeSprite {
    increase_score?: number;
    upper?: HTMLDivElement;
    lower?: HTMLDivElement;
    vel: number;
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && gameState !== "Play") {
        setGameState("Play");
        setScore(0);
        setPipeSprites([]);
        if (messageRef.current) {
          messageRef.current.innerHTML = "";
        }
        if (scoreValRef.current) {
          scoreValRef.current.innerHTML = "0";
        }
        play();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState]);

  const play = () => {
    // Get the bird element and its starting position
    const bird = birdRef.current!;
    const birdStartY = parseFloat(
      getComputedStyle(bird).getPropertyValue("top")
    );

    // Set up the bird's initial position and velocity
    let birdY = birdStartY;
    let birdVel = 0;

    document.addEventListener("keydown", handleKeyDown);
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === " ") {
        // If spacebar is pressed, flap the bird and update its velocity
        birdVel = -5;
        bird.classList.add("flap");
        setTimeout(() => bird.classList.remove("flap"), 200);
      }
    }
    // Game loop to update bird and pipe positions
    const gameLoop = setInterval(() => {
      birdY += birdVel;
      bird.style.top = `${birdY}px`;
      birdVel += 0.2;

      // Check if bird has hit the ground or the ceiling
      if (
        birdY < 0 ||
        birdY + bird.offsetHeight > backgroundRef.current!.offsetHeight
      ) {
        endGame();
      }

      spawnPipes();
      if (score % 10 === 0 && score > 0 && pipeSprites.length === 0) {
        spawnPipes();
      }
    }, 20);

    // Function to end the game and clean up
    function endGame() {
      clearInterval(gameLoop);
      document.removeEventListener("keydown", handleKeyDown);
      setGameState("Over");
      messageRef.current!.innerHTML = "Game Over";
    }
    return () => clearInterval(gameLoop);
  };

  useEffect(() => {
    const gameLoop = setInterval(() => {
      pipeSprites.forEach((pipe) => {
        if (pipe.upper && pipe.lower) {
          // Update pipe position
          pipe.upper.style.left = `${parseFloat(pipe.upper.style.left) - 1}vw`;
          pipe.lower.style.left = `${parseFloat(pipe.lower.style.left) - 1}vw`;

          // Check if pipe is passed the bird
          if (parseFloat(pipe.upper.style.left) < 5) {
            if (pipe.increase_score === 1) {
              setScore((prevScore) => prevScore + 1);
              pipe.increase_score = 0;
            }
          }
        }
      });

      // check collision
      pipeSprites.forEach((pipe) => {
        if (pipe.upper && pipe.lower) {
          if (
            isColliding(birdRef.current!, pipe.upper.getBoundingClientRect()) ||
            isColliding(birdRef.current!, pipe.lower.getBoundingClientRect())
          ) {
            setGameState("Over");
            messageRef.current!.innerHTML = "Game Over";
            
            // Remove all pipes
            pipeSprites.forEach((pipe) => {
              if (pipe.upper && pipe.lower) {
                pipe.upper.remove();
                pipe.lower.remove();
              }
            })

          }
        }
      });
    }, 20);
    return () => clearInterval(gameLoop);
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

  // Constant value for the gap between two pipes
  let pipe_gap = 35;
  let pipe_seperation = 0;

  function spawnPipes() {
    // Create a new pipe element
    if (pipe_seperation > 115) {
      pipe_seperation = 0;

      // Calculate random position of pipes on y axis
      let pipe_posi = Math.floor(Math.random() * 43) + 8;
      let pipe_sprite_inv = document.createElement("div");
      pipe_sprite_inv.className = "pipe_sprite_inv";
      pipe_sprite_inv.style.top = pipe_posi - pipe_gap + "vh";
      pipe_sprite_inv.style.left = "100vw";

      let pipe_sprite = document.createElement("div");
      pipe_sprite.className = "pipe_sprite";
      pipe_sprite.style.top = pipe_posi + pipe_gap + "vh";
      pipe_sprite.style.left = "100vw";

      // Append the created pipe element as a child of the background element
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
              vel: 1,
            },
          ];
          return newPipeSprites;
        });
      }
    }
    pipe_seperation++;
  }

  return (
    <div className="App">
      <div className="background" ref={backgroundRef}>
        <img className="bird" ref={birdRef} src="./bufficorn.png" alt="bird" />
        <div className="message" ref={messageRef}>
          Press Space To Start
        </div>
        <div className="score">{score}</div>
      </div>
    </div>
  );
}

export default FlappyBuffi;
