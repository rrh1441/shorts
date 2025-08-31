import React from "react";
import { Composition } from "remotion";
import { AnimatedText } from "./ui-components/components/AnimatedText";

const Demo: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatedText
        text={text}
        animationType="fade"
        fontSize={72}
        fontWeight="bold"
        textAlign="center"
        color="#111827"
      />
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVertical"
        component={() => <Demo text="Remotion UI Demo (Vertical)" />}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemoHorizontal"
        component={() => <Demo text="Remotion UI Demo (Horizontal)" />}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
