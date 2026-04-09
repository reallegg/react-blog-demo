import { useEffect, useState } from 'react'

export default function FullNameWrongPractice() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  return (
    <div>
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="first name"
      />
      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="last name"
      />
      <p>fullName: {firstName} {lastName}</p>
    </div>
  )
}

// 为什么这个值不该存成单独 state
//  因为此时它不需要计算，只是展示作用
// 为什么它不是副作用
// 副作用应该是setfirstname和lastname，但是它的副作用通过onchange来处理好了，fullname取他们的结果即可
// 为什么直接算更合理
// fullname不需要额外的计算，只是拼接即可，这样少维护了一个值和少使用了一个usseeffect，让本页的性能和心智负担更少了