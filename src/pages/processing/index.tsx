import { fpGrowth, apriori } from '@/functions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { Input, Date as DateInput, Table, Button, Select } from '@/components';
import Layout from '@/layouts';
import * as yup from "yup";
import moment from 'moment';
import axios from "axios";
import { sum } from 'lodash';

type FormData = yup.InferType<typeof schema>;
const schema = yup.object({
  start_date: yup.date().nullable().notRequired(),
  end_date: yup.date().nullable().notRequired(),
  min_support: yup.number().transform((value) => (isNaN(value) ? undefined : value)).required("Min Support harus diisi"),
  min_confidence: yup.number().transform((value) => (isNaN(value) ? undefined : value)).required("Min Confidence harus diisi"),
  algorithm: yup.object().shape({ key: yup.number(), label: yup.string() }).default(undefined).required("Algoritma harus diisi"),
  total_record: yup.number(),
}).required();

export default function Dashboard() {
  const { push } = useRouter();
  const [datas, setDatas] = useState<any[]>([]);
  const [count, setCount] = useState<any>(0);
  const [loadingTable, setLoadingTable] = useState<boolean>(true);
  const { control, register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const header = [
    {
      fieldId: 'index',
      label: 'No',
      width: 60
    },
    {
      fieldId: 'algorithm',
      label: 'Algoritma',
      renderItem: (algorithm: string) => (<>
        {algorithm}
      </>),
      width: 150
    },
    {
      fieldId: 'processed_date',
      label: 'Tanggal Proses',
      renderItem: (processed_date: string) => (<>
        {moment(processed_date).format('DD-MM-yyyy hh:mm')}
      </>),
      width: 140
    },
    {
      fieldId: 'min_support',
      label: 'Min Support',
      renderItem: (min_support: string) => (<>
        {min_support}%
      </>),
      width: 66
    },
    {
      fieldId: 'min_confidence',
      label: 'Min Confidence',
      renderItem: (min_confidence: string) => (<>
        {min_confidence}%
      </>),
      width: 66
    },
    {
      fieldId: 'total_order',
      label: 'Total Data',
      width: 80
    },
  ];

  const algorithmOptions = [
    {
      key: 1,
      label: 'Apriori'
    },
    {
      key: 2,
      label: 'FP-Growth'
    },
    {
      key: 3,
      label: 'Apriori & FP-Growth'
    },
  ];

  useEffect(() => {
    getSummary();
  }, []);

  useEffect(() => {
    const start_date = watch("start_date");
    const end_date = watch("end_date");
    getTotalTransaction(start_date, end_date);
  }, [watch("start_date"), watch("end_date")]);

  const handleRowClick = (item: any) => {
    push(`/processing/${item.summary_id}`);
  };

  const getSummary = async () => {
    setLoadingTable(true)
    try {
      const { data } = await axios.get("/api/process");
      setDatas(data)
      setLoadingTable(false)
    } catch (error: any) {
      console.error(error.response.data.message);
    }
  }

  const getTotalTransaction = async (start_date: Date | null | undefined, end_date: Date | null | undefined) => {
    const startDate = start_date ? moment(start_date).toDate() : null
    const endDate = end_date ? moment(end_date).toDate() : null
    try {
      const { data } = await axios.get("/api/count/transaction", {
        params: {
          start_date: startDate ? moment(startDate).format('yyyy-MM-DD') : null,
          end_date: endDate ? moment(endDate).format('yyyy-MM-DD') : null
        }
      });
      setCount(data.count)
    } catch (error: any) {
      console.error(error.response.data.message);
    }
  }

  const onSubmit = async (fields: FormData) => {
    const startDate = fields.start_date ? moment(fields.start_date).toDate() : null
    const endDate = fields.end_date ? moment(fields.end_date).toDate() : null
    await handleCalculate({ start_date: startDate, end_date: endDate, ...fields });
    await getSummary();
  };

  const onSubmitApriori = async (dataset: any[], minSupport: number, minConfidence: number, summaryId: number, algorithm: string | undefined) => {
    const [supports, rules, processingFrequentItemsets, processingAssociationRules] = await apriori(dataset, minSupport, minConfidence);
    try {
      const res = await axios.post("/api/algorithm", {
        summary_id: summaryId,
        name: "Apriori",
        processing_frequent_itemsets: processingFrequentItemsets,
        processing_association_rules: processingAssociationRules,
        processing_time: sum([processingFrequentItemsets, processingAssociationRules])
      })
      const algorithm_id = res.data.algorithm_id
      const supportsList: any[] = supports.map((obj: any) => ({ algorithm_id, ...obj }))
      const rulesList: any[] = rules.map((obj: any) => ({ algorithm_id, ...obj }))
      await axios.post("/api/support", { supports: supportsList })
      await axios.post("/api/rule", { rules: rulesList })
    } catch (err) {
      console.log('error: ', err);
    }
  };

  const onSubmitFpGrowth = async (dataset: any[], minSupport: number, minConfidence: number, summaryId: number, algorithm: string | undefined) => {
    const [supports, rules, processingFrequentItemsets, processingAssociationRules] = await fpGrowth(dataset, minSupport, minConfidence);
    try {
      const res = await axios.post("/api/algorithm", {
        summary_id: summaryId,
        name: "FP-Growth",
        processing_frequent_itemsets: processingFrequentItemsets,
        processing_association_rules: processingAssociationRules,
        processing_time: sum([processingFrequentItemsets, processingAssociationRules])
      })
      const algorithm_id = res.data.algorithm_id
      const supportsList: any[] = supports.map((obj: any) => ({ algorithm_id, ...obj }))
      const rulesList: any[] = rules.map((obj: any) => ({ algorithm_id, ...obj }))
      await axios.post("/api/support", { supports: supportsList })
      await axios.post("/api/rule", { rules: rulesList })
    } catch (err) {
      console.log('error: ', err);
    }
  };

  const handleCalculate = async (fields: FormData) => {
    const { start_date, end_date, min_support, min_confidence, algorithm } = fields

    const { data } = await axios.get("/api/transaction", {
      params: {
        start_date: start_date ? moment(start_date).format('yyyy-MM-DD') : null,
        end_date: start_date ? moment(end_date).format('yyyy-MM-DD') : null
      }
    })

    const dataset: any[] = []
    data.forEach((element: any) => {
      const splited = element.products.split(",")
      dataset.push(splited)
    });

    try {
      const res = await axios.post("/api/process", {
        start_date: start_date ? moment(start_date).format('yyyy-MM-DD') : null,
        end_date: start_date ? moment(end_date).format('yyyy-MM-DD') : null,
        min_support,
        min_confidence,
        total_order: data.length,
        algorithm: algorithm.label
      })
      const summary_id = res.data.summary_id
      if (algorithm.key === 1) {
        await onSubmitApriori(dataset, min_support, min_confidence, summary_id, algorithm.label);
      } else if (algorithm.key === 2) {
        await onSubmitFpGrowth(dataset, min_support, min_confidence, summary_id, algorithm.label);
      } else {
        await onSubmitApriori(dataset, min_support, min_confidence, summary_id, algorithm.label);
        await onSubmitFpGrowth(dataset, min_support, min_confidence, summary_id, algorithm.label);
      }
    } catch (err) {
      console.log('error: ', err);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-11">
      <div className="col-span-1">
        <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-xl text-[#464E5F] font-semibold uppercase">
              Proses Apriori & FP-Growth
            </h3>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <DateInput
              label="Tanggal Mulai"
              placeholder="Tanggal Mulai"
              dateFormat="DD-MM-yyyy"
              timeFormat={false}
              name="start_date"
              control={control}
              error={errors.start_date?.message}
            />
            <DateInput
              label="Tanggal Akhir"
              placeholder="Tanggal Akhir"
              dateFormat="DD-MM-yyyy"
              timeFormat={false}
              name="end_date"
              control={control}
              error={errors.end_date?.message}
            />
            <Input
              mask="99"
              maskChar={null}
              type='masked'
              label="Min Support"
              placeholder='Min Support'
              name='min_support'
              prefix="%"
              register={register}
              error={errors.min_support?.message}
            />
            <Input
              mask="99"
              maskChar={null}
              type='masked'
              label="Min Confidence"
              placeholder='Min Confidence'
              name='min_confidence'
              prefix="%"
              register={register}
              error={errors.min_confidence?.message}
            />
            <Select
              label="Algoritma"
              name="algorithm"
              placeholder="Pilih Algoritma"
              options={algorithmOptions}
              control={control}
              error={errors.algorithm?.message}
            />
            <Input
              label="Total Data"
              name='total_record'
              register={register}
              value={count}
              disabled={true}
            />
            <div className="pt-4">
              <Button
                type="submit"
                title="Proses"
                color="primary"
                loading={isSubmitting}
              />
            </div>
          </form>
        </div>
      </div>
      <div className="col-span-2">
        <div className="bg-white py-9 px-8 rounded-xl shadow-[0px_0px_20px_rgba(56,71,109,0.03)]">
          <div className="mb-6 flex flex-col">
            <h3 className="mb-1.5 text-xl text-[#464E5F] font-semibold uppercase">
              Proses
            </h3>
            <p className="text-gray-400">
              Total {datas.length}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="border border-[#BDBDBD] rounded-lg">
              <Table
                data={datas}
                headers={header}
                truncate={true}
                action={true}
                onRowClick={handleRowClick}
                loading={loadingTable}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Dashboard.getLayout = (page: any) => <Layout>{page}</Layout>;