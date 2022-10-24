import { useEffect, useState } from "react"

const useForceRerender = (instance) => {
  const [_, setState] = useState(Math.random())
  const rerender = () => setState(Math.random())

  useEffect(() => {
    if (instance) {
      const unsubscribe = instance.subscribe(rerender)
      return () => unsubscribe()
    }
  }, [instance])

  return { rerender }
}

export { useForceRerender }