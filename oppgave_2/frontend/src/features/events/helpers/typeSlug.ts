// konverterer typenavn til url-vennlig format, tar høyde for norske bokstaver og mellomrom
// fått hjelp av claude.ai
export const getTypeSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/\s+/g, "-");
};
