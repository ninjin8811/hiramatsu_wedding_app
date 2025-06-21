import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import BackgroundImg from "../../../../../_images/Background.png";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className,
}) => {
  return (
    <div className={className}>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "200%",
          height: "200%",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
        }}
        animate={{
          x: ["-50%", "0%"],
          y: ["-50%", "0%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* 3x3グリッドで背景画像を配置 */}
        {Array.from({ length: 9 }, (_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          return (
            <Image
              key={index}
              src={BackgroundImg}
              alt="background"
              style={{
                position: "absolute",
                top: `${row * 33.33}%`,
                left: `${col * 33.33}%`,
                width: "33.33%",
                height: "33.33%",
                objectFit: "cover",
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default AnimatedBackground;
