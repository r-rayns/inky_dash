import {Minus, Plus} from "lucide-react";
import type {SliderProps} from "@radix-ui/react-slider";
import {Slider} from "@/components/ui/slider";
import {Button} from "@/components/ui/button";

export default function StepRange({onIncrement, onDecrement, ...props}: StepRangeProps) {
  return (
    <>
      <div className="flex flex-row gap-2">
        <Button type="button" variant="ghostIcon" size="icon" onClick={onDecrement}>
          <Minus/>
        </Button>
        <Slider {...props}></Slider>
        <Button type="button" variant="ghostIcon" size="icon" onClick={onIncrement}>
          <Plus/>
        </Button>
      </div>
    </>
  );
}

interface StepRangeProps extends SliderProps {
  onIncrement: () => void,
  onDecrement: () => void,
}
