export const CountryIdValues = ["DEFAULT", "US", "AU"] as const;
export type CountryId = (typeof CountryIdValues)[number];
