import { FPGrowth, Itemset } from 'node-fpgrowth';
import { calculateSupportPercentage, rulesList, supportList, twoDecimalPlacesWithoutRound } from '@/functions';

export function apriori(dataset: any[], minSupport: number, minConfidence: number): any {
  const startTime = performance.now();
  let uniqueItems: any[] = [];
  for (let i = 0; i < dataset.length; i++) {
    let transaction: any[] = dataset[i];
    for (let j = 0; j < transaction.length; j++) {
      let item: any = transaction[j];
      if (!(uniqueItems.some((element) => element === item))) {
        uniqueItems.push(item);
      }
    }
  }

  let frequentItemsets: any[] = [];
  let frequentItemsetsLength: any[] = [];
  for (let item of uniqueItems) {
    let support: number = calculateSupportPercentage(dataset, [item]);
    if (support >= minSupport) {
      frequentItemsetsLength.push([item]);
    }
  }
  
  frequentItemsets = frequentItemsets.concat(frequentItemsetsLength);
  
  let k: number = 2;
  let lastFrequentItemsets: any[] = frequentItemsetsLength;
  while (lastFrequentItemsets.length > 0) {
    let candidateItemsets: any[] = [];
    for (let i = 0; i < lastFrequentItemsets.length; i++) {
      for (let j = i + 1; j < lastFrequentItemsets.length; j++) {
        let itemset1: any[] = lastFrequentItemsets[i];
        let itemset2: any[] = lastFrequentItemsets[j];
        if (itemset1.slice(0, k - 2).every((v: any, i: number) => v === itemset2[i])) {
          candidateItemsets.push(itemset1.concat(itemset2[k - 2]));
        }
      }
    }
    let frequentItemsetsK: any[] = [];
    for (let candidate of candidateItemsets) {
      let support: number = calculateSupportPercentage(dataset, candidate);
      if (support >= minSupport) {
        frequentItemsetsK.push(candidate);
      }
    }
    frequentItemsets = frequentItemsets.concat(frequentItemsetsK);
    lastFrequentItemsets = frequentItemsetsK;
    k++;
  }
  const endTime = performance.now();
  const processingFrequentItemsets = twoDecimalPlacesWithoutRound(endTime - startTime);

  const startTime2 = performance.now();
  const supports: any[] = supportList(dataset, frequentItemsets);
  const rules: any[] = rulesList(dataset, frequentItemsets, minConfidence);
  const endTime2 = performance.now();
  const processingAssociationRules = twoDecimalPlacesWithoutRound(endTime2 - startTime2);

  return [supports, rules, processingFrequentItemsets, processingAssociationRules];
}

export function fpGrowth(dataset: any[], minSupport: number, minConfidence: number): any {
  class Node {
    public item: string | null;
    public frequency: number;
    public children: Record<string, Node>;
    public parent: Node | null;
    public next: Node | null;

    constructor(item: string | null, frequency: number) {
      this.item = item;
      this.frequency = frequency;
      this.children = {};
      this.parent = null;
      this.next = null;
    }
  }

  class FPTree {
    private root: Node;
    private headerTable: Record<string, Node>;

    constructor() {
      this.root = new Node(null, 0);
      this.headerTable = {};
    }

    public insertTransaction(transaction: string[], count = 1): void {
      let node: Node = this.root;

      for (const item of transaction) {
        if (item in node.children) {
          node = node.children[item];
          node.frequency += count;
        } else {
          const newNode = new Node(item, count);
          node.children[item] = newNode;
          newNode.parent = node;

          if (item in this.headerTable) {
            let currentNode: Node | null = this.headerTable[item];
            while (currentNode!.next !== null) {
              currentNode = currentNode!.next;
            }
            currentNode!.next = newNode;
          } else {
            this.headerTable[item] = newNode;
          }

          node = newNode;
        }
      }
    }

    public getConditionalPatternBase(item: string): string[][] {
      const conditionalPatternBase: string[][] = [];
      let currentNode: Node | null = this.headerTable[item];

      while (currentNode !== null) {
        const path: string[] = [];
        let frequency: number = currentNode.frequency;
        let node: Node | null = currentNode.parent;

        while (node !== this.root) {
          if (node!.item) {
            path.unshift(node!.item);
            node = node!.parent;
          }
        }

        if (path.length > 0) {
          for (let i = 0; i < frequency; i++) {
            conditionalPatternBase.push([...path]);
          }
        }

        currentNode = currentNode.next;
      }

      return conditionalPatternBase;
    }
  }

  function buildFPTree(transactions: string[][], minSupport: number, totalTransactions: number): [FPTree, string[]] {
    const itemSupport: Record<string, number> = {};

    for (const transaction of transactions) {
      for (const item of transaction) {
        if (item in itemSupport) {
          itemSupport[item]++;
        } else {
          itemSupport[item] = 1;
        }
      }
    }

    const frequentItems: string[] = Object.keys(itemSupport).filter(
      (item) => (itemSupport[item] / totalTransactions) * 100 >= minSupport
    );

    frequentItems.sort((a, b) => {
      const diff = itemSupport[b] - itemSupport[a];
      if (diff === 0) {
        return a.localeCompare(b);
      }
      return diff;
    });

    const fptree = new FPTree();

    for (const transaction of transactions) {
      const orderedTransaction: string[] = frequentItems.filter((item) =>
        transaction.includes(item)
      );
      fptree.insertTransaction(orderedTransaction);
    }

    return [fptree, frequentItems];
  }

  function mineFPTree(
    fptree: FPTree,
    frequentItems: string[],
    minSupport: number,
    totalTransactions: number,
    prefix: string[] = []
  ): string[][] {
    const frequentItemsets: string[][] = [];

    for (const item of frequentItems) {
      const newPattern: string[] = [...prefix, item];
      frequentItemsets.push(newPattern);

      const conditionalPatternBase: string[][] = fptree.getConditionalPatternBase(item);
      const [conditionalFPTree, conditionalFrequentItems] = buildFPTree(
        conditionalPatternBase,
        minSupport,
        totalTransactions
      );

      if (conditionalFrequentItems.length > 0) {
        const conditionalItemsets: string[][] = mineFPTree(
          conditionalFPTree,
          conditionalFrequentItems,
          minSupport,
          totalTransactions,
          newPattern
        );
        frequentItemsets.push(...conditionalItemsets);
      }
    }

    return frequentItemsets;
  }

  const startTime = performance.now();
  const [fptree, frequentItems] = buildFPTree(dataset, minSupport, dataset.length);
  const frequentItemsets = mineFPTree(fptree, frequentItems, minSupport, dataset.length);
  const endTime = performance.now();
  const processingFrequentItemsets = twoDecimalPlacesWithoutRound(endTime - startTime);

  const startTime2 = performance.now();
  const supports: any[] = supportList(dataset, frequentItemsets);
  const rules: any[] = rulesList(dataset, frequentItemsets, minConfidence);
  const endTime2 = performance.now();
  const processingAssociationRules = twoDecimalPlacesWithoutRound(endTime2 - startTime2);

  return [supports, rules, processingFrequentItemsets, processingAssociationRules];
}

export async function fpGrowthV2(dataset: any[], minSupport: number, minConfidence: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    let fpgrowth: FPGrowth<number> = new FPGrowth<number>(minSupport / 100);
    let frequentItemsets: any[] = [];

    fpgrowth.exec(dataset)
      .then((itemsets: Itemset<number>[]) => {
        for (const item of itemsets) {
          frequentItemsets.push(item.items);
        }
        const supports: any[] = supportList(dataset, frequentItemsets);
        const rules: any[] = rulesList(dataset, frequentItemsets, minConfidence);
        resolve([supports, rules]);
      })
      .catch((error) => {
        reject([]);
      });
  });
}
