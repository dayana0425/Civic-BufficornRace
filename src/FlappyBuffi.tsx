import React, { useState, useEffect, useRef } from "react";
import "./style.css";

function FlappyBuffi() {
  const [moveSpeed, setMoveSpeed] = useState<number>(5);
  const [gravity, setGravity] = useState<number>(0.5);
  const [gameState, setGameState] = useState<string>("Start");
  const [score, setScore] = useState<number>(0);
  const [pipeSprites, setPipeSprites] = useState<Array<PipeSprite>>([]);

  const backgroundRef = useRef<HTMLDivElement>(null);
  const birdRef = useRef<HTMLImageElement>(null);
  const scoreValRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  interface PipeSprite {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width?: number;
    height?: number;
    increase_score?: number;
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && gameState !== "Play") {
        setGameState("Play");
        setScore(0);
        setPipeSprites([]);
        messageRef.current!.innerHTML = "";
        scoreValRef.current!.innerHTML = "0";
        play();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState]);

  useEffect(() => {
    const background = backgroundRef.current!.getBoundingClientRect();
    const bird = birdRef.current!;
    const birdProps = bird.getBoundingClientRect();
    let animationId: number;

    function move() {
      if (gameState !== "Play") return;
      const newPipeSprites = pipeSprites
        .map((pipe) => {
          const element = document.getElementById(`pipe-${pipe.left}`);
          const pipeSpriteProps = element!.getBoundingClientRect();
          const birdProps = bird.getBoundingClientRect();

          if (pipeSpriteProps.right <= 0) {
            element!.remove();
            return null;
          } else if (
            birdProps.left < pipeSpriteProps.left + pipeSpriteProps.width &&
            birdProps.left + birdProps.width > pipeSpriteProps.left &&
            birdProps.top < pipeSpriteProps.top + pipeSpriteProps.height &&
            birdProps.top + birdProps.height > pipeSpriteProps.top
          ) {
            setGameState("End");
            messageRef.current!.innerHTML = "Press Enter To Restart";
            messageRef.current!.style.left = "28vw";
            return null;
          } else {
            if (
              pipeSpriteProps.right < birdProps.left &&
              pipeSpriteProps.right + moveSpeed >= birdProps.left &&
              pipe.increase_score === 1
            ) {
              setScore(score + 1);
              pipe.increase_score = 0;
            }
            element!.style.left = pipeSpriteProps.left - moveSpeed + "px";

            return {
              ...pipe,
              left: pipeSpriteProps.left - moveSpeed,
              right: pipeSpriteProps.left - moveSpeed + pipeSpriteProps.width,
            };
          }
        })
        .filter((pipe) => pipe !== null) as Array<PipeSprite>;
      setPipeSprites(newPipeSprites);
      animationId = requestAnimationFrame(move);
    }

    animationId = requestAnimationFrame(move);

    function applyGravity() {
      if (gameState !== "Play") return;
      let birdDy = 0;
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowUp" || e.key === " ") {
          birdDy = -7.6;
        }
      }
      document.addEventListener("keydown", handleKeyDown);
      if (birdProps.top <= 0 || birdProps.bottom >= background.bottom) {
        setGameState("End");
        messageRef.current!.innerHTML = "Press Enter To Restart";
        messageRef.current!.style.left = "28vw";
        return;
      }
      bird.style.top =
        birdProps.top + birdDy
          ? birdProps.top + birdDy + gravity + "px"
          : birdProps.top + gravity + "px";
      requestAnimationFrame(applyGravity);
    }
    applyGravity();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState, pipeSprites, moveSpeed, gravity, score]);

  function play() {
    function move() {
      if (gameState !== "Play") return;
      const background = backgroundRef.current!.getBoundingClientRect();
      const bird = birdRef.current!;
      const birdProps = bird.getBoundingClientRect();
      const newPipeSprites = pipeSprites
        .map((pipe) => {
          const element = document.getElementById(`pipe-${pipe.left}`);
          const pipeSpriteProps = element!.getBoundingClientRect();
          const birdProps = bird.getBoundingClientRect();

          if (pipeSpriteProps.right <= 0) {
            element!.remove();
            return null;
          } else if (
            birdProps.left < pipeSpriteProps.left + pipeSpriteProps.width &&
            birdProps.left + birdProps.width > pipeSpriteProps.left &&
            birdProps.top < pipeSpriteProps.top + pipeSpriteProps.height &&
            birdProps.top + birdProps.height > pipeSpriteProps.top
          ) {
            setGameState("End");
            messageRef.current!.innerHTML = "Press Enter To Restart";
            messageRef.current!.style.left = "28vw";
            return null;
          } else {
            if (
              pipeSpriteProps.right < birdProps.left &&
              pipeSpriteProps.right + moveSpeed >= birdProps.left &&
              pipe.increase_score === 1
            ) {
              setScore(score + 1);
              pipe.increase_score = 0;
            }
            element!.style.left = pipeSpriteProps.left - moveSpeed + "px";
            return {
              ...pipe,
              left: pipeSpriteProps.left - moveSpeed,
              right: pipeSpriteProps.left - moveSpeed + pipeSpriteProps.width,
            };
          }
        })
        .filter((pipe) => pipe !== null) as Array<PipeSprite>;
      setPipeSprites(newPipeSprites);
      requestAnimationFrame(move);
    }
    move();

    function applyGravity() {
      if (gameState !== "Play") return;
      const bird = birdRef.current!;
      const birdProps = bird.getBoundingClientRect();
      let birdDy = 0;
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowUp" || e.key === " ") {
          birdDy = -7.6;
        }
      }
      document.addEventListener("keydown", handleKeyDown);
      const background = backgroundRef.current!.getBoundingClientRect();
      if (birdProps.top <= 0 || birdProps.bottom >= background.bottom) {
        setGameState("End");
        messageRef.current!.innerHTML = "Press Enter To Restart";
        messageRef.current!.style.left = "28vw";
        return;
      }
      bird.style.top =
        birdProps.top + birdDy
          ? birdProps.top + birdDy + gravity + "px"
          : birdProps.top + gravity + "px";
      requestAnimationFrame(applyGravity);
    }
    applyGravity();

    function generatePipe() {
      if (gameState !== "Play") return;
      const pipe = document.createElement("div");
      const pipeTop = document.createElement("div");
      const pipeBottom = document.createElement("div");
      const pipeTopHeight = Math.floor(Math.random() * 300) + 50;
      const pipeBottomHeight = 500 - pipeTopHeight;
      pipe.classList.add("pipe");
      pipeTop.classList.add("pipe-top");
      pipeBottom.classList.add("pipe-bottom");
      pipe.style.left = "100vw";
      pipeTop.style.height = pipeTopHeight + "px";
      pipeBottom.style.height = pipeBottomHeight + "px";
      pipe.id = `pipe-${pipeSprites[pipeSprites.length - 1].left}`;
      pipe.appendChild(pipeTop);
      pipe.appendChild(pipeBottom);
      backgroundRef.current!.appendChild(pipe);
      setPipeSprites([
        ...pipeSprites,
        {
          left: 100,
          increase_score: 1,
        },
      ]);
      requestAnimationFrame(generatePipe);
    }
    generatePipe();
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
