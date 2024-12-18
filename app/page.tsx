"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FilePlus, Settings } from "lucide-react";
import Draggable from "react-draggable";
import { useState, useEffect, useRef } from "react";

interface Card {
  id: number;
  x: number;
  y: number;
}

export default function Home() {
  const [wheel1Position, setWheel1Position] = useState<number>(0);
  const [wheel2Position, setWheel2Position] = useState<number>(0);
  const [wheel3Position, setWheel3Position] = useState<number>(0);
  const [cards, setCards] = useState<Card[]>([
    { id: 0, x: -150, y: -120 },
    { id: 1, x: 50, y: -120 },
    { id: 2, x: 50, y: 100 },
    { id: 3, x: -150, y: 100 },
  ]);
  const [activeCardId, setActiveCardId] = useState<number>(0);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  const canvasBounds = { width: 1000, height: 600 }; // Define canvas dimensions
  const cardSize = 80; // Card width/height (assuming square)
  const numberOfSegments = cards.length;

  // Ref to store the latest state
  const stateRef = useRef({
    wheel1Position,
    wheel2Position,
    wheel3Position,
    numberOfSegments,
  });

  useEffect(() => {
    // Update the ref whenever state changes
    stateRef.current = {
      wheel1Position,
      wheel2Position,
      wheel3Position,
      numberOfSegments,
    };
  }, [wheel1Position, wheel2Position, wheel3Position, numberOfSegments]);

  useEffect(() => {
    const timer = setInterval(() => {
      const {
        wheel1Position,
        wheel2Position,
        wheel3Position,
        numberOfSegments,
      } = stateRef.current;

      const segmentSize = 1080 / numberOfSegments;
      const totalWheelPosition =
        wheel1Position + wheel2Position + wheel3Position;
      const activeSegment =
        Math.floor(totalWheelPosition / segmentSize) % numberOfSegments;

      console.log("Total Position:", totalWheelPosition);
      console.log("Segment Size:", segmentSize);
      console.log("Active Segment:", activeSegment);

      setActiveCardId(activeSegment);
    }, 500);

    return () => clearInterval(timer);
  }, []); // No dependencies needed because stateRef is used

  useEffect(() => {
    const wheel1Interval = setInterval(() => {
      setWheel1Position((prev) => (prev + 3) % 360);
    }, 10);

    const wheel2Interval = setInterval(() => {
      setWheel2Position((prev) => (prev + 2) % 360);
    }, 20);

    const wheel3Interval = setInterval(() => {
      setWheel3Position((prev) => (prev + 1) % 360);
    }, 30);

    return () => {
      clearInterval(wheel1Interval);
      clearInterval(wheel2Interval);
      clearInterval(wheel3Interval);
    };
  }, []);

  const addCard = () => {
    const randomX = Math.random() * canvasBounds.width - canvasBounds.width / 2;
    const randomY =
      Math.random() * canvasBounds.height - canvasBounds.height / 2;

    setCards((prevCards) => [
      ...prevCards,
      {
        id: prevCards.length,
        x: Math.max(
          -canvasBounds.width / 2 + cardSize / 2,
          Math.min(canvasBounds.width / 2 - cardSize / 2, randomX),
        ),
        y: Math.max(
          -canvasBounds.height / 2 + cardSize / 2,
          Math.min(canvasBounds.height / 2 - cardSize / 2, randomY),
        ),
      },
    ]);
  };

  const onDrag = (id: number, newX: number, newY: number) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, x: newX, y: newY } : card,
      ),
    );
  };

  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    null
  ); // Default background

  const handleBackgroundChange = (value: string) => {
    setBackgroundImage(value === "none" ? null : value);
  };

  return (
    <div
      className="relative w-full h-screen"
      style={{
        backgroundImage: backgroundImage
          ? `url(/${backgroundImage})`
          : undefined,
        backgroundColor: backgroundImage ? undefined : "rgb(31, 41, 55)", // Tailwind slate-800
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative flex justify-center items-center bg-transparent w-full h-full overflow-hidden">
        {cards.map(({ id, x, y }) => (
          <Draggable
            key={id}
            position={{ x, y }} // Controlled position
            onStop={(e, data) => onDrag(id, data.x, data.y)} // Update card position on drag stop
          >
            <div>
              <Card
                className={`absolute w-40 rounded-sm text-white font-bold cursor-pointer ${
                  activeCardId === id ? "bg-orange-400" : "bg-zinc-800"
                }`}
              >
                <CardHeader className="py-2 border-b border-white">
                  <CardTitle className="text-center flex flex-row justify-between items-center font-mono text-xs">
                    Position {id + 1}
                    <Settings size={16} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Button className="w-full py-12 border-dashed border-2 border-white bg-transparent flex flex-col hover:bg-inherit">
                    <FilePlus size={32} />
                    <p>add image</p>
                  </Button>
                </CardContent>
                <CardFooter className="border-t pb-0 py-px text-xs font-normal">
                  <p className="w-full text-center font-mono">00000000000</p>
                </CardFooter>
              </Card>
            </div>
          </Draggable>
        ))}
      </div>

      {/* Button to toggle terminal */}
      <div className="absolute top-4 left-10">
        <button
          className="px-4 py-2 text-white rounded font-mono bg-black"
          onClick={() => setShowTerminal(true)}
        >
          open terminal &rarr;
        </button>
      </div>

      {/* Terminal View Overlay */}
      {showTerminal && (
        <div className="absolute top-20 left-10 w-[300px] bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold font-mono">
              live server status:
            </h2>
            <button
              className="px-2 py-1 bg-transparent font-bold rounded text-lg hover:text-red-500"
              onClick={() => setShowTerminal(false)}
            >
              X
            </button>
          </div>
          <div className="overflow-y-auto bg-gray-800 p-2 mb-2 rounded-sm text-green-400">
            <p className="font-mono text-sm">position_1: {wheel1Position}°</p>
            <p className="font-mono text-sm">position_2: {wheel2Position}°</p>
            <p className="font-mono text-sm">position_3: {wheel3Position}°</p>
            <p className="font-mono text-sm px-px">
              active_card: {activeCardId}
            </p>
          </div>
        </div>
      )}

      {/* Add Card Button */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <div className="flex flex-col gap-2">
                <button
                  className="px-6 py-1 bg-green-500 text-white rounded-full"
                  onClick={() => alert("Another Action")}
                >
                  Load
                </button>
                <button
                  className="px-6 py-1 bg-blue-500 text-white rounded-full"
                  onClick={() => alert("One More Action")}
                >
                  Save
                </button>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-center">
                <button
                  className="px-6 py-1 bg-red-500 text-white rounded-full"
                  onClick={() => window.location.reload()} // Trigger full page reload
                >
                  Reset
                </button>
              </div>
              
            </div>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-slate-50 rounded-sm text-black font-bold"
                onClick={addCard}
              >
                + add position
              </button>
              <div>
                <Select onValueChange={handleBackgroundChange}>
                  <SelectTrigger className="w-48 bg-gray-800 text-white h-10">
                    <SelectValue placeholder="Select Background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bg-1.jpg">Background 1</SelectItem>
                    <SelectItem value="bg-2.jpg">Background 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
