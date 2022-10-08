const handleForm = (handle, fieldNames) => (e) => {
  e.preventDefault()

  const handlerArgs = fieldNames.reduce(
      (obj, name) => {
          return { ...obj, [name]: e.target[name].value }
      }, {}
  )

  handle(handlerArgs)
}

export { handleForm }