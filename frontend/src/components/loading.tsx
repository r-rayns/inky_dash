import {SpinnerIcon} from "@/components/icons/spinner";

export default function Loading() {
  return (
    <div className="absolute top-1/2 md:top-1/3 left-1/2 ml-[-32px]">
      <SpinnerIcon className="w-[64px] h-[64px]"/>
    </div>
  )
}
