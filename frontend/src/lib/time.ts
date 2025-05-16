import { pluraliseUnitIfNeeded } from '@/lib/utils';

export const constructTimeString = (seconds: number, text = ''): string => {
  let timeString = text;
  let remainingSeconds = 0;
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    remainingSeconds = seconds % 3600;
    timeString = `${ hours } ${ pluraliseUnitIfNeeded(hours, 'hour') }`;
  } else if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    remainingSeconds = seconds % 60;
    timeString = `${ timeString } ${ minutes } ${ pluraliseUnitIfNeeded(minutes, 'minute') }`;
  } else if (seconds > 0) {
    timeString = `${ timeString } ${ seconds } ${ pluraliseUnitIfNeeded(seconds, 'second') }`
    remainingSeconds = 0;
  }

  if (remainingSeconds > 0) {
    timeString = constructTimeString(remainingSeconds, `${ timeString }, `)
  }

  return timeString;
}
