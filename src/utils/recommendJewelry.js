import { elementGemstoneMap } from "@/src/data/elementGemstoneMap";
import { fiveElements } from "@/src/data/fiveElements";
import { gemstoneDictionary } from "@/src/data/gemstoneDictionary";
import { jewelryFormDictionary } from "@/src/data/jewelryFormDictionary";
import { metalToneDictionary } from "@/src/data/metalToneDictionary";

const elementOrder = ["wood", "fire", "earth", "metal", "water"];

function safeBalance(elementBalance) {
  return elementOrder.reduce((acc, key) => {
    const value = Number(elementBalance?.[key] ?? 0);
    acc[key] = Number.isFinite(value) ? value : 0;
    return acc;
  }, {});
}

function sortElements(elementBalance) {
  const balance = safeBalance(elementBalance);
  return elementOrder
    .map((id) => [id, balance[id]])
    .sort((a, b) => a[1] - b[1] || elementOrder.indexOf(a[0]) - elementOrder.indexOf(b[0]));
}

function pickMostCommon(ids) {
  const counts = ids.reduce((acc, id) => {
    if (!id) return acc;
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function getElementDisplay(elementId) {
  return fiveElements[elementId]?.display ?? "수(水)";
}

export function getElementMeaning(elementId) {
  return fiveElements[elementId]?.keywords?.join(", ") ?? "흐름, 유연함, 감정 조절";
}

export function getGemstoneById(gemstoneId) {
  return gemstoneDictionary[gemstoneId];
}

export function recommendJewelry(elementBalance, options = {}) {
  const sortedElements = sortElements(elementBalance);
  const supportElement = options.supportElement ?? sortedElements[0]?.[0] ?? "water";
  const strongElement = options.strongElement ?? sortedElements[sortedElements.length - 1]?.[0] ?? "earth";
  const gemIds = elementGemstoneMap[supportElement] ?? elementGemstoneMap.water;
  const recommendedGems = gemIds.map((id) => gemstoneDictionary[id]).filter(Boolean);
  const primaryGems = recommendedGems.slice(0, 3);
  const primaryGem = primaryGems[0] ?? gemstoneDictionary.aquamarine;
  const primaryMetalId = pickMostCommon(primaryGems.flatMap((gem) => gem.recommendedMetals)) ?? primaryGem.recommendedMetals?.[0] ?? "white_gold";
  const primaryFormId = pickMostCommon(primaryGems.flatMap((gem) => gem.recommendedForms)) ?? primaryGem.recommendedForms?.[0] ?? "ring";
  const total = Object.values(safeBalance(elementBalance)).reduce((sum, count) => sum + count, 0);
  const lowCut = total >= 8 ? 1 : 0;
  const highCut = total >= 8 ? 3 : 2;
  const elementStates = elementOrder.reduce((acc, elementId) => {
    const count = safeBalance(elementBalance)[elementId];
    acc[elementId] = count <= lowCut ? "보완 포인트" : count >= highCut ? "강하게 드러남" : "균형권";
    return acc;
  }, {});

  return {
    supportElement,
    strongElement,
    supportElementInfo: fiveElements[supportElement],
    strongElementInfo: fiveElements[strongElement],
    recommendedGems,
    summaryGems: primaryGems,
    primaryGem,
    primaryMetal: metalToneDictionary[primaryMetalId] ?? metalToneDictionary.white_gold,
    primaryForm: jewelryFormDictionary[primaryFormId] ?? jewelryFormDictionary.ring,
    elementStates,
  };
}

