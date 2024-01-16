import { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as TooltipJS,
  Legend,
} from 'chart.js';
import { Tab } from '@headlessui/react'
import classNames from 'classnames';
import { Table } from '@/components';
import moment from 'moment';
import { twoDecimalPlacesWithoutRound } from '@/functions';
import { Tooltip } from 'react-tooltip';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  TooltipJS,
  Legend
);

export default function Compare(props: any) {
  const { datas: { apriori, fp_growth } } = props;

  const headerSupport = [
    {
      fieldId: 'index',
      label: 'No',
      width: 60
    },
    {
      fieldId: 'candidate',
      label: 'Candidate',
      renderItem: (candidate: string, index: number) => (<>
        <Tooltip
          id={`${index}-support-tooltip-1`}
          content={`${candidate}`}
          place={"top"}
        />
        <div data-tooltip-id={`${index}-support-tooltip-1`} className="truncate w-[235px] text-left hover:cursor-pointer">
          {candidate}
        </div>
      </>)
    },
    {
      fieldId: 'itemset',
      label: 'Itemset',
      width: 80
    },
    {
      fieldId: 'support',
      label: 'Support',
      renderItem: (support: number) => (<>
        {twoDecimalPlacesWithoutRound(support)}%
      </>),
      width: 80,
    },
  ];

  const headerConfidence = [
    {
      fieldId: 'index',
      label: 'No',
      width: 60
    },
    {
      fieldId: 'rule',
      label: 'Rule',
      renderItem: (rule: string, index: number) => (<>
        <Tooltip
          id={`${index}-confidence-tooltip-1`}
          content={`${rule}`}
          place={"top"}
        />
        <div data-tooltip-id={`${index}-confidence-tooltip-1`} className="truncate w-[315px] text-left hover:cursor-pointer">
          {rule}
        </div>
      </>)
    },
    {
      fieldId: 'confidence',
      label: 'Confidence',
      renderItem: (confidence: number) => (<>
        {twoDecimalPlacesWithoutRound(confidence)}%
      </>),
      width: 80
    },
  ];

  const headerLiftRatio = [
    {
      fieldId: 'index',
      label: 'No',
      width: 60
    },
    {
      fieldId: 'rule',
      label: 'Rule',
      renderItem: (rule: string, index: number) => (<>
        <Tooltip
          id={`${index}-rule-tooltip-1`}
          content={`${rule}`}
          place={"top"}
        />
        <div data-tooltip-id={`${index}-rule-tooltip-1`} className="truncate w-[200px] text-left hover:cursor-pointer">
          {rule}
        </div>
      </>)
    },
    {
      fieldId: 'lift',
      label: 'Lift',
      width: 80,
      renderItem: (lift: number) => (<>
        {twoDecimalPlacesWithoutRound(lift)}
      </>),
    },
    {
      fieldId: 'description',
      label: 'Description',
      renderItem: (description: string, index: number) => (
        <span
          className={classNames(
            description === 'POSITIVE'
              ? 'bg-[#DCFCE4] text-[#27A590]'
              : description === 'NEGATIVE'
                ? 'bg-[#FFEBEB] text-[#BB1616]'
                : 'bg-[#E9E9E9] text-[#7C7C7C]',
            'inline-flex items-center rounded px-2 py-1 text-xs'
          )}
        >
          <Tooltip
            id={`${index}-fp-growth-description-1`}
            content={description === 'POSITIVE'
              ? 'Menunjukkan bahwa hubungan antara item atau variabel yang dianalisis lebih sering terjadi daripada kejadian acak secara umum. Menunjukkan bahwa ada keterkaitan yang positif dan signifikan antara item-item tersebut.'
              : description === 'NEGATIVE'
                ? 'Menunjukkan bahwa hubungan antara item atau variabel yang dianalisis kurang sering terjadi dibandingkan dengan kejadian acak secara umum. Menunjukkan bahwa ada keterkaitan yang negatif atau tidak signifikan antara item-item tersebut.'
                : 'Menunjukkan bahwa hubungan antara item atau variabel yang dianalisis memiliki tingkat kejadian yang sama dengan kejadian acak secara umum. Menunjukkan bahwa tidak ada hubungan khusus antara item-item tersebut.'}
            place={"top"}
          />
          <div data-tooltip-id={`${index}-fp-growth-description-1`} className="truncate w-[60px] text-center hover:cursor-pointer">
            {description}
          </div>
        </span>
      ),
      width: 110
    },
  ];

  const tabs = useMemo(
    () => {
      const itemTabs: any = [
        {
          label: "Ringkasan",
        },
        {
          label: "Detail",
        },
      ]
      return itemTabs;
    },
    []
  );

  const optionsBar = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const dataBar = useMemo(
    () => ({
      labels: ['Support', 'Confidence', 'Rules'],
      datasets: [
        {
          label: 'Apriori',
          data: [apriori?.supports?.length, apriori?.rules?.length, apriori?.rules?.length],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'FP-Growth',
          data: [fp_growth?.supports?.length, fp_growth?.rules?.length, fp_growth?.rules?.length],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    }),
    [apriori, fp_growth]
  );

  const processingFrequentItemsets = useMemo(
    () => ({
      labels: ['Apriori', 'FP-Growth'],
      datasets: [
        {
          label: 'ms',
          data: [apriori?.algorithm?.processing_frequent_itemsets, fp_growth?.algorithm?.processing_frequent_itemsets],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(53, 162, 235, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(53, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }),
    [apriori, fp_growth]
  );

  const processingAssociationRules = useMemo(
    () => ({
      labels: ['Apriori', 'FP-Growth'],
      datasets: [
        {
          label: 'ms',
          data: [apriori?.algorithm?.processing_association_rules, fp_growth?.algorithm?.processing_association_rules],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(53, 162, 235, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(53, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }),
    [apriori, fp_growth]
  );

  const processingTime = useMemo(
    () => ({
      labels: ['Apriori', 'FP-Growth'],
      datasets: [
        {
          label: 'ms',
          data: [apriori?.algorithm?.processing_time, fp_growth?.algorithm?.processing_time],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(53, 162, 235, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(53, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }),
    [apriori, fp_growth]
  );

  let percentAprioriProcessingTime = (apriori?.algorithm?.processing_time / (fp_growth?.algorithm?.processing_time + apriori?.algorithm?.processing_time)) * 100
  let percentFPGrowthProcessingTime = (fp_growth?.algorithm?.processing_time / (fp_growth?.algorithm?.processing_time + apriori?.algorithm?.processing_time)) * 100

  let percentAprioriProcessingFrequentItemsets = (apriori?.algorithm?.processing_frequent_itemsets / (fp_growth?.algorithm?.processing_frequent_itemsets + apriori?.algorithm?.processing_frequent_itemsets)) * 100
  let percentFPGrowthProcessingFrequentItemsets = (fp_growth?.algorithm?.processing_frequent_itemsets / (fp_growth?.algorithm?.processing_frequent_itemsets + apriori?.algorithm?.processing_frequent_itemsets)) * 100

  let percentAprioriProcessingAssociationRules = (apriori?.algorithm?.processing_association_rules / (fp_growth?.algorithm?.processing_association_rules + apriori?.algorithm?.processing_association_rules)) * 100
  let percentFPGrowthProcessingAssociationRules = (fp_growth?.algorithm?.processing_association_rules / (fp_growth?.algorithm?.processing_association_rules + apriori?.algorithm?.processing_association_rules)) * 100

  return (<>
    <Tab.Group>
      <div className="flex items-center justify-between gap-4">
        <Tab.List className="flex bg-white rounded-xl">
          {tabs.map((tab: any) => (
            <Tab
              key={tab.label}
              className={({ selected }) =>
                classNames(
                  'w-64 font-semibold uppercase px-6 py-4 rounded-xl focus:outline-none', {
                  'text-[#274C77] bg-[#D8E5F3]': selected,
                  'text-[#464E5F] hover:text-[#274C77]': !selected
                })
              }
            >
              {tab.label}
            </Tab>
          ))}
        </Tab.List>
      </div>
      <Tab.Panels>
        <Tab.Panel className="grid gap-11">
          <div className="grid grid-cols-2 gap-11">
            <div className="col-span-1">
              <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="flex flex-col items-start justify-between gap-4">
                  <h3 className="mb-6 text-xl text-[#464E5F] font-semibold uppercase">
                    {apriori?.algorithm?.name}
                  </h3>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Waktu Proses Frequent Itemsets
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {apriori?.algorithm?.processing_frequent_itemsets} ms
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Waktu Proses Association Rules
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {apriori?.algorithm?.processing_association_rules} ms
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Waktu Proses
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {apriori?.algorithm?.processing_time} ms
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Support Yang Dihasilkan
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {apriori?.supports?.length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Confidence Yang Dihasilkan
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {apriori?.rules?.length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Rules Yang Dihasilkan
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {apriori?.rules?.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="flex flex-col items-start justify-between gap-4">
                  <h3 className="mb-6 text-xl text-[#464E5F] font-semibold uppercase">
                    {fp_growth?.algorithm?.name}
                  </h3>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Waktu Proses Frequent Itemsets
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {fp_growth?.algorithm?.processing_frequent_itemsets} ms
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Waktu Proses Association Rules
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {fp_growth?.algorithm?.processing_association_rules} ms
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Waktu Proses
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {fp_growth?.algorithm?.processing_time} ms
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Support Yang Dihasilkan
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {fp_growth?.supports?.length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Confidence Yang Dihasilkan
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {fp_growth?.rules?.length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">
                      Total Rules Yang Dihasilkan
                    </div>
                    <div className="text-lg text-gray-500 font-semibold">
                      {fp_growth?.rules?.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 auto-rows-fr gap-11">
            <div className="col-span-2">
              <div className="h-full bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="flex flex-col">
                  <h3 className="mb-6 text-xl text-[#464E5F] font-semibold uppercase">
                    Hasil Proses
                  </h3>
                </div>
                <div className="flex flex-col">
                  <Bar options={optionsBar} data={dataBar} />
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="h-full bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="flex flex-col">
                  <h3 className="mb-12 text-xl text-[#464E5F] font-semibold uppercase">
                    Total Waktu Proses
                  </h3>
                </div>
                <div className="flex flex-col w-[290px] h-[290px]">
                  <Doughnut data={processingTime} />
                </div>
                <div className="flex justify-between flex-row mt-5">
                  <div>Apriori: {percentAprioriProcessingTime.toFixed(2)}% </div>
                  <div>FP-Growth: {percentFPGrowthProcessingTime.toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-11">
            <div className="col-span-1">
              <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="flex flex-col">
                  <h3 className="mb-12 text-xl text-[#464E5F] font-semibold uppercase">
                    Waktu Proses Association Rules
                  </h3>
                </div>
                <div className="flex flex-col w-[290px] h-[290px] mx-auto">
                  <Doughnut data={processingAssociationRules} />
                </div>
                <div className="flex justify-between flex-row mt-5">
                  <div>Apriori: {percentAprioriProcessingAssociationRules.toFixed(2)}% </div>
                  <div>FP-Growth: {percentFPGrowthProcessingAssociationRules.toFixed(2)}%</div>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="flex flex-col">
                  <h3 className="mb-12 text-xl text-[#464E5F] font-semibold uppercase">
                    Waktu Proses Frequent Itemsets
                  </h3>
                </div>
                <div className="flex flex-col w-[290px] h-[290px] mx-auto">
                  <Doughnut data={processingFrequentItemsets} />
                </div>
                <div className="flex justify-between flex-row mt-5">
                <div>Apriori: {percentAprioriProcessingFrequentItemsets.toFixed(2)}% </div>
                  <div>FP-Growth: {percentFPGrowthProcessingFrequentItemsets.toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>
        </Tab.Panel>
        <Tab.Panel>
          <div className="grid gap-11">
            <div className="grid grid-cols-2 gap-11">
              <div className="col-span-1">
                <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                  <div className="mb-6 flex flex-col">
                    <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
                      Lift Ratio Apriori
                    </h3>
                    <p className="text-gray-400">
                      Total {apriori?.rules.length}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="border border-[#BDBDBD] rounded-lg">
                      <Table
                        data={apriori?.rules}
                        headers={headerLiftRatio}
                        truncate={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="mb-6 flex flex-col">
                  <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
                    Lift Ratio FP-GROWTH
                  </h3>
                  <p className="text-gray-400">
                    Total {fp_growth?.rules.length}
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="border border-[#BDBDBD] rounded-lg">
                    <Table
                      data={fp_growth?.rules}
                      headers={headerLiftRatio}
                      truncate={true}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-11">
              <div className="col-span-1">
                <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                  <div className="mb-6 flex flex-col">
                    <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
                      Confidence Apriori
                    </h3>
                    <p className="text-gray-400">
                      Total {apriori?.rules.length}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="border border-[#BDBDBD] rounded-lg">
                      <Table
                        data={apriori?.rules}
                        headers={headerConfidence}
                        truncate={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="mb-6 flex flex-col">
                  <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
                    Confidence FP-GROWTH
                  </h3>
                  <p className="text-gray-400">
                    Total {fp_growth?.rules.length}
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="border border-[#BDBDBD] rounded-lg">
                    <Table
                      data={fp_growth?.rules}
                      headers={headerConfidence}
                      truncate={true}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-11">
              <div className="col-span-1">
                <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                  <div className="mb-6 flex flex-col">
                    <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
                      Support Apriori
                    </h3>
                    <p className="text-gray-400">
                      Total {apriori?.supports.length}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="border border-[#BDBDBD] rounded-lg">
                      <Table
                        data={apriori?.supports}
                        headers={headerSupport}
                        truncate={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
                <div className="mb-6 flex flex-col">
                  <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
                    Support FP-GROWTH
                  </h3>
                  <p className="text-gray-400">
                    Total {fp_growth?.supports.length}
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="border border-[#BDBDBD] rounded-lg">
                    <Table
                      data={fp_growth?.supports}
                      headers={headerSupport}
                      truncate={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  </>);
}