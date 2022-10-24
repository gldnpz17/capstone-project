const camelCaseToTitleCase = (name) => {
  // Adds a space in front of every capital letter.
  const result = name.replace(/([A-Z])/g, " $1");
  // Capitalize the first letter and adds the rest.
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export { camelCaseToTitleCase }