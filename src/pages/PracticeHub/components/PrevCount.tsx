import { useState } from "react";
import usePrevious from "../../../hooks/usePrevious";

export default function Demo() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count)

  return (
    <div>
      <p>current: {count}</p>
      <p>previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}