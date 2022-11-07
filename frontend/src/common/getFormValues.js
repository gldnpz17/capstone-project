const getFormValues = (target) => {
  const names = []
  const fields = target.querySelectorAll("input, textarea, select")
  for (let i = 0; i < fields.length; i++) {
    names.push(fields[i].name)
  }

  return names.reduce((obj, name) => ({ 
    ...obj,
    [name]: target[name].value
  }), {})
}

export { getFormValues }