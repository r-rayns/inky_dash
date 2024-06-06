import './step-range.css';

export default function StepRange({ onIncrement, onDecrement, ...props }: StepRangeProps) {
  return (
    <>
      <div className="flex flex-row gap-2">
        <button type="button" className="step-button" onClick={onDecrement}>
          -
        </button>
        <input {...props}></input>
        <button type="button" className="step-button" onClick={onIncrement}>
          +
        </button>
      </div>
    </>
  );
}

interface StepRangeProps {
  onIncrement: () => void, 
  onDecrement: () => void,
  [key: string]: unknown
}