import raw from "../../data/catalog.json";
import { buildSizes } from "./ring";
import type { Alloy, CatalogOptions, Category, EngravingFont, Finish, GrooveType, Product, Profile, StoneSetting } from "./types";

export const fallbackCategories = raw.categories as Category[];
export const fallbackProducts = raw.products as Product[];
export const fallbackProfiles = raw.profiles as Profile[];
export const fallbackAlloys = raw.alloys as Alloy[];
export const fallbackFinishes = raw.finishes as Finish[];
export const fallbackStones = raw.stones as StoneSetting[];
export const fallbackFonts = raw.fonts as EngravingFont[];
export const fallbackGrooves = raw.grooves as GrooveType[];
export const fallbackSizes = buildSizes();

export const fallbackOptions = (): CatalogOptions => ({
  profiles: fallbackProfiles,
  alloys: fallbackAlloys,
  finishes: fallbackFinishes,
  stones: fallbackStones,
  fonts: fallbackFonts,
  grooves: fallbackGrooves,
  sizes: fallbackSizes,
});
