import React, { useEffect } from "react";
import Particles from "react-tsparticles";
import produce from "immer";
import { useLocation } from "react-use";
import { Container } from "tsparticles/dist/Core/Container";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import "./App.css";
import particlesOptions from "./particles.json";
import { RecursivePartial } from "tsparticles/dist/Types/RecursivePartial";
import { IOptions } from "tsparticles/dist/Options/Interfaces/IOptions";
import io from "socket.io-client";

type ParticlesConfig = RecursivePartial<IOptions>;

const makeParticleConfig = (emoji: string, rotate: boolean) =>
  produce(particlesOptions, (draftParticles: any) => {
    const emittedParticle = draftParticles.emitters[0].particles;

    emittedParticle.shape.character[0].value = [emoji];

    if (rotate) {
      emittedParticle.rotate = {
        random: true,
        direction: "random",
        animation: {
          enable: true,
          speed: 10,
          sync: false,
        },
      };
    }
  });

interface MetaConfig {
  id: string;
  emoji: string;
  particles: ParticlesConfig;
  wave: boolean;
}

interface SendEvent {
  emoji?: string;
  rotate?: boolean;
  wave?: boolean;
}

function App() {
  const rLocation = useLocation();
  const [metaConfigs, setMetaConfigs] = React.useState<MetaConfig[]>([]);
  const [bigEmojiConfigs, setBigEmojiConfigs] = React.useState<MetaConfig[]>(
    []
  );

  const room = (rLocation.pathname || "").slice(1);

  console.log({ room });

  useEffect(() => {
    if (!room) {
      return;
    }

    const socket = io("/");

    socket.on("connect", function () {
      socket.emit("join", { room });
    });

    socket.on("emoji", (data: SendEvent) => {
      const { emoji, rotate, wave } = data;

      if (!emoji) {
        return;
      }

      const id = Math.random().toString();

      console.log({ id, emoji, rotate });
      const particles = makeParticleConfig(emoji, rotate ?? false);

      const metaConfig = {
        id,
        emoji,
        wave,
        particles,
      };

      const TIMEOUT = 10 * 1000;

      setMetaConfigs((v: any) => [...v, metaConfig]);
      setBigEmojiConfigs((v: any) => [...v, metaConfig]);

      setTimeout(() => {
        setMetaConfigs((v: any) => v.filter((vv: any) => vv.id !== id));
      }, TIMEOUT);

      setTimeout(() => {
        setBigEmojiConfigs((v: any) => v.filter((vv: any) => vv.id !== id));
      }, TIMEOUT / 2);
    });
  }, [room]);

  const lastBigEmoji =
    bigEmojiConfigs.length > 0 && bigEmojiConfigs[bigEmojiConfigs.length - 1];

  return (
    <div className="App">
      <TransitionGroup>
        {metaConfigs.map((config) => (
          <CSSTransition
            enter={false}
            key={config.id}
            timeout={1000}
            classNames="particles"
          >
            <div>
              <Particles key={config.id} options={config.particles} />
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>

      <TransitionGroup>
        {lastBigEmoji && (
          <CSSTransition
            key={lastBigEmoji.emoji}
            timeout={500}
            classNames="emoji"
          >
            <div className="emoji">
              <div className={lastBigEmoji.wave ? "wave" : "no"}>
                {lastBigEmoji.emoji}
              </div>
            </div>
          </CSSTransition>
        )}
      </TransitionGroup>

      {/* {showEmoji && bigEmoji && <div className="emoji">{bigEmoji}</div>} */}
    </div>
  );
}

export default App;
