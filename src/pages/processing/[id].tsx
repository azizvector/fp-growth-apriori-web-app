import Layout from '@/layouts';
import { Button, Table } from '@/components';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import moment from 'moment';
import { twoDecimalPlacesWithoutRound } from '@/functions';
import { Tooltip } from 'react-tooltip';
import classNames from 'classnames';
import { Tab } from '@headlessui/react'
import Apriori from '../../components/details/apriori'
import FPGrowth from '../../components/details/fp-growth'
import Compare from '../../components/details/compare'

export default function Dashboard() {
  const { query, push, back } = useRouter();
  const { id } = query;

  const [datas, setDatas] = useState<any>({});

  const tabs = useMemo(
    () => {
      let filteredTabs: any = []
      const itemTabs: any = [
        {
          label: "Apriori",
          page: <Apriori datas={datas.apriori} />
        },
        {
          label: "FP-Growth",
          page: <FPGrowth datas={datas.fp_growth} />
        },
        {
          label: "Perbandingan",
          page: <Compare datas={datas} />
        }
      ]

      if (datas.apriori && datas.fp_growth) {
        filteredTabs = itemTabs
      } else {
        if (datas.apriori) filteredTabs = itemTabs.filter((data: any) => data.label === "Apriori")
        if (datas.fp_growth) filteredTabs = itemTabs.filter((data: any) => data.label === "FP-Growth")
      }

      return filteredTabs;
    },
    [datas]
  );

  useEffect(() => {
    const getSummaryDetails: any = async () => {
      try {
        const { data } = await axios.get(`/api/process/${id}`);
        setDatas(data)
      } catch (error: any) {
        console.error(error.response.data.message);
      }
    }
    if (id) getSummaryDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/process/${id}`);
      push("/");
    } catch (error: any) {
      console.error(error.response.data.message);
    }
  };

  console.log("tabs.length", tabs.length);
  
  return (
    <div className="grid gap-11">
      <Tab.Group>
        <div className="flex items-center justify-between gap-4">
          <Tab.List className={classNames(
            'flex', {
            'bg-white rounded-xl': tabs.length === 3,
          })}>
            {tabs.length === 3 ? <>{
              tabs.map((tab: any) => (
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
              ))}</> : <>{
                tabs.map((tab: any) => (
                  <Tab
                    key={tab.label}
                    className={({ selected }) =>
                      classNames(
                        'text-3xl font-semibold uppercase pointer-events-none focus:outline-none', {
                        'text-[#464E5F]': selected,
                      })
                    }
                  >
                    {tab.label}
                  </Tab>
                ))
              }</>
            }
          </Tab.List>
          <div className="flex items-center justify-between gap-4 ml-4">
            <Button
              title="Kembali"
              color="secondary"
              onClick={() => back()}
            />
            <Button
              title="Hapus"
              color="danger"
              onClick={handleDelete}
            />
          </div>
        </div>
        {/* <div className="grid grid-cols-1 gap-11">
          <div className="col-span-1">
            <div className="text-[#464E5F] bg-gray-50 py-9 px-8 rounded-xl space-y-3">
              <span className="text-lg font-semibold">Catatan!</span>
              <div className="space-y-1.5">
                <span className="font-medium">Positive Correlation</span>
                <div>Jika lift ratio lebih besar dari 1, itu menunjukkan bahwa hubungan antara item atau variabel yang dianalisis lebih sering terjadi daripada kejadian acak secara umum. Menunjukkan bahwa ada keterkaitan yang positif dan signifikan antara item-item tersebut.</div>
              </div>
              <div className="space-y-1.5">
                <span className="font-medium">Negative Correlation</span>
                <div>Jika lift ratio kurang dari 1, itu menunjukkan bahwa hubungan antara item atau variabel yang dianalisis kurang sering terjadi dibandingkan dengan kejadian acak secara umum. Menunjukkan bahwa ada keterkaitan yang negatif atau tidak signifikan antara item-item tersebut.</div>
              </div>
              <div className="space-y-1.5">
                <span className="font-medium">Independent Correlation</span>
                <div>Jika lift ratio sama dengan 1, itu menunjukkan bahwa hubungan antara item atau variabel yang dianalisis memiliki tingkat kejadian yang sama dengan kejadian acak secara umum. Menunjukkan bahwa tidak ada hubungan khusus antara item-item tersebut.</div>
              </div>
            </div>
          </div>
        </div> */}
        <Tab.Panels>
          {tabs.map((tab: any, idx: number) => (
            <Tab.Panel
              key={idx}
              className="grid gap-11"
            >
              {tab.page}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div >
  );
}

Dashboard.getLayout = (page: any) => <Layout>{page}</Layout>;