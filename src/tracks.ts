export const STEP = 10;

export interface TrackSpeeds {
  left: number;
  right: number;
}

const inc = (v: number) => Math.min(v + STEP, 100);
const dec = (v: number) => Math.max(v - STEP, -100);

export const faster = ({ left, right }: TrackSpeeds): TrackSpeeds => ({
  left: inc(left),
  right: inc(right),
});

export const slower = ({ left, right }: TrackSpeeds): TrackSpeeds => ({
  left: dec(left),
  right: dec(right),
});

// Turning slows down the inner track and speeds up the outer one. When the vehicle currently
// turns the other way by exactly one step, only the inner track is slowed to drive straight again.
export function turnLeft({ left, right }: TrackSpeeds): TrackSpeeds {
  const speedDiff = left - right;
  return {
    left: left < 100 || (left === 100 && right === 100) ? dec(left) : left,
    right: speedDiff !== STEP || left === 100 ? inc(right) : right,
  };
}

export function turnRight(speeds: TrackSpeeds): TrackSpeeds {
  const mirrored = turnLeft({ left: speeds.right, right: speeds.left });
  return { left: mirrored.right, right: mirrored.left };
}
