export const join = (array: string[], separator = ", ") => {
  return array.length === 0
    ? ""
    : array.length === 1
    ? array[0]!
    : array.slice(0, -1).join(separator) + " e " + array.slice(-1);
};

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const classList = (...classes: (string | Record<string, boolean>)[]) => {
  return classes
    .map(c => {
      return typeof c === "string"
        ? c
        : Object.entries(c)
            .filter(([, v]) => v)
            .map(([k]) => k);
    })
    .flat()
    .join(" ");
};
