import { Table } from '@/components';
import moment from 'moment';
import { twoDecimalPlacesWithoutRound } from '@/functions';
import { Tooltip } from 'react-tooltip';
import classNames from 'classnames';

export default function FPGrowth(props: any) {
  const { datas } = props;

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
        <div data-tooltip-id={`${index}-rule-tooltip-1`} className="truncate w-[398px] text-left hover:cursor-pointer">
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

  return (<>
    <div className="grid grid-cols-3 gap-11">
      <div className="col-span-1">
        <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
          <div className="flex flex-col items-start justify-between gap-4">
            <h3 className="mb-6 text-xl text-[#464E5F] font-semibold uppercase">
              Information
            </h3>
            <div className="space-y-1">
              <div className="text-gray-400">
                Algoritma
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.algorithm?.name}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Waktu Proses Frequent Itemsets
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.algorithm?.processing_frequent_itemsets} ms
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Waktu Proses Association Rules
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.algorithm?.processing_association_rules} ms
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Total Waktu Proses
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.algorithm?.processing_time} ms
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Support
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.summary?.min_support}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Confidence
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.summary?.min_confidence}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Tanggal Mulai
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.summary?.end_date ? moment(datas?.summary?.start_date).format('DD-MM-yyyy') : "Semua Tanggal"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Tanggal Akhir
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.summary?.end_date ? moment(datas?.summary?.end_date).format('DD-MM-yyyy') : "Semua Tanggal"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Tanggal Proses
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {moment(datas?.summary?.processed_date).format('DD-MM-yyyy')}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">
                Total Data
              </div>
              <div className="text-lg text-gray-500 font-semibold">
                {datas?.summary?.total_order}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
          <div className="mb-6 flex flex-col">
            <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
              Lift Ratio
            </h3>
            <p className="text-gray-400">
              Total {datas?.rules.length}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="border border-[#BDBDBD] rounded-lg">
              <Table
                data={datas?.rules}
                headers={headerLiftRatio}
                truncate={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-11">
      <div className="col-span-1">
        <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
          <div className="mb-6 flex flex-col">
            <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
              Support
            </h3>
            <p className="text-gray-400">
              Total {datas?.supports.length}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="border border-[#BDBDBD] rounded-lg">
              <Table
                data={datas?.supports}
                headers={headerSupport}
                truncate={true}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
          <div className="mb-6 flex flex-col">
            <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
              Confidence
            </h3>
            <p className="text-gray-400">
              Total {datas?.rules.length}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="border border-[#BDBDBD] rounded-lg">
              <Table
                data={datas?.rules}
                headers={headerConfidence}
                truncate={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>);
}