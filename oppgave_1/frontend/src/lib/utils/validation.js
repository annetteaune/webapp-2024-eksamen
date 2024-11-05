const isValid = (items) => {
  const invalidFields = [];
  // eslint-disable-next-line no-shadow
  const validate = (items) => {
    if (typeof items !== "object") {
      return;
    }
    if (Array.isArray(items)) {
      items.forEach((item) => validate(item));
    } else {
      items &&
        Object.entries(items)?.forEach(([key, value]) => {
          if (
            !value ||
            value === null ||
            value === undefined ||
            (Array.isArray(value) && value?.length === 0)
          ) {
            invalidFields.push(key);
          } else {
            validate(value);
          }
        });
    }
  };
  validate(items);
  return invalidFields.length === 0;
};
