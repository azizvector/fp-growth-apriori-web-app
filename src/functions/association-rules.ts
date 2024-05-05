import { twoDecimalPlacesWithoutRound } from "./global";

export function generateAssociationRules(dataset: any[], itemset: any[], minConfidence: number) {
  let rules: any[] = [];
  for (let i = 1; i < itemset.length; i++) {
    let subsets = getSubsets(itemset, i);
    for (let antecedent of subsets) {
      let consequent = itemset.filter((item: any) => !antecedent.includes(item));
      let confidence = calculateConfidence(dataset, antecedent, consequent);
      if (confidence >= minConfidence) {
        confidence = twoDecimalPlacesWithoutRound(confidence * 100);
        rules.push({ antecedent, consequent, confidence });
      }
    }
  }
  return rules;
}

export function getSubsets(itemset: any[], k: number) {
  if (k === 1) {
    return itemset.map((item: any) => [item]);
  }
  let subsets: any[] = [];
  for (let i = 0; i <= itemset.length - k; i++) {
    let prefix = itemset.slice(i, i + 1);
    let suffixes: any[] = getSubsets(itemset.slice(i + 1), k - 1);
    for (let suffix of suffixes) {
      subsets.push(prefix.concat(suffix));
    }
  }
  return subsets;
}

export function calculateSupportPercentage(dataset: any[], candidate: any[]): number {
  let count: number = 0;
  for (let i: number = 0; i < dataset.length; i++) {
    let transaction: any[] = dataset[i];
    let isSubset: boolean = true;
    for (let j: number = 0; j < candidate.length; j++) {
      let item: any = candidate[j];
      if (!transaction.includes(item)) {
        isSubset = false;
        break;
      }
    }
    if (isSubset) {
      count++;
    }
  }
  return (count / dataset.length) * 100;
}

export function calculateConfidence(dataset: any[], antecedent: any[], consequent: any[]): number {
  let supportA: number = calculateSupport(dataset, antecedent);
  let supportAB: number = calculateSupport(dataset, antecedent.concat(consequent));
  return (supportAB / supportA);
}

export function calculateSupport(dataset: any[], itemset: any[]): number {
  let count: number = 0;
  for (let transaction of dataset) {
    if (itemset.every((item: any) => transaction.includes(item))) {
      count++;
    }
  }
  return count;
}

export function supportList(dataset: any[], frequentItemsets: any[][]): any[] {
  const supportList: any[] = [];
  for (let itemset of frequentItemsets) {
    const support = calculateSupportPercentage(dataset, itemset);
    supportList.push({
      itemset: itemset.length,
      candidate: itemset.toString(),
      support: twoDecimalPlacesWithoutRound(support),
    });
  }
  return supportList;
}

export function rulesList(dataset: any[], frequentItemsets: any[][], minConfidence: number): any[] {
  const rulesList: any[] = [];
  for (let itemset of frequentItemsets) {
    const rules = generateAssociationRules(dataset, itemset, minConfidence / 100);
    for (let rule of rules) {
      const confidence = calculateConfidence(dataset, rule.antecedent, rule.consequent);
      const supportB = calculateSupport(dataset, rule.consequent);
      const N = dataset.length;
      const liftRatio = twoDecimalPlacesWithoutRound(confidence / (supportB / N));
      let description = '';
      if (liftRatio > 1) {
        description = 'POSITIVE';
      } else if (liftRatio < 1) {
        description = 'NEGATIVE';
      } else {
        description = 'INDEPENDENT';
      }
      rulesList.push({
        rule: `${rule.antecedent.join(',')} -> ${rule.consequent.join(',')}`,
        confidence: rule.confidence,
        liftRatio,
        description,
      });
    }
  }
  return rulesList;
}