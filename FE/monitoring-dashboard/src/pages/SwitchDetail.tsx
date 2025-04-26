import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import switchDataRaw from '../../data-swtich.txt?raw';

const COLORS = ['#2563eb', '#059669', '#f59e42', '#ef4444', '#a21caf'];

const parseSwitchData = () => {
  try {
    return JSON.parse(switchDataRaw);
  } catch {
    return null;
  }
};

const SwitchDetail = () => {
  // Giả lập lấy id từ url, thực tế sẽ lấy từ useParams
  // const { id } = useParams();
  const navigate = useNavigate ? useNavigate() : () => {};
  const data = parseSwitchData();
  if (!data) return <div className="p-8 text-red-600">Không có dữ liệu switch.</div>;
  const stats = data['opendaylight-port-statistics:flow-capable-node-connector-statistics'];

  // Chuẩn hóa dữ liệu cho biểu đồ
  const bytesData = [
    { name: 'Received', value: Number(stats.bytes.received) },
    { name: 'Transmitted', value: Number(stats.bytes.transmitted) },
  ];
  const packetsData = [
    { name: 'Received', value: Number(stats.packets.received) },
    { name: 'Transmitted', value: Number(stats.packets.transmitted) },
  ];
  // Gom tất cả error và drop vào một mảng cho histogram
  const errorDropData = [
    { name: 'CRC Error', value: Number(stats['receive-crc-error']) },
    { name: 'Frame Error', value: Number(stats['receive-frame-error']) },
    { name: 'Overrun Error', value: Number(stats['receive-over-run-error']) },
    { name: 'Receive Errors', value: Number(stats['receive-errors']) },
    { name: 'Transmit Errors', value: Number(stats['transmit-errors']) },
    { name: 'Receive Drops', value: Number(stats['receive-drops']) },
    { name: 'Transmit Drops', value: Number(stats['transmit-drops']) },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate('/')}
      >
        ← Quay lại Topology
      </button>
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Switch Detail</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-semibold mb-2">Bytes</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bytesData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="font-semibold mb-2">Packets</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={packetsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Bỏ Pie chart error và drops, chỉ giữ lại histogram */}
        <div className="md:col-span-2">
          <div className="font-semibold mt-4 mb-2">Error & Drop Histogram</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={errorDropData}>
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value">
                {errorDropData.map((entry, idx) => (
                  <Cell key={`bar-cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8">
        <div className="font-semibold mb-2">Chi tiết số liệu</div>
        <table className="min-w-full text-left border rounded overflow-hidden">
          <thead>
            <tr className="bg-blue-50 text-blue-700">
              <th className="px-4 py-2 font-semibold">Thông số</th>
              <th className="px-4 py-2 font-semibold text-center">Giá trị</th>
              <th className="px-4 py-2 font-semibold text-center">Đơn vị</th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Bytes Received</td>
              <td className="text-center font-mono">{stats.bytes.received}</td>
              <td className="text-center">bytes</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Bytes Transmitted</td>
              <td className="text-center font-mono">{stats.bytes.transmitted}</td>
              <td className="text-center">bytes</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Packets Received</td>
              <td className="text-center font-mono">{stats.packets.received}</td>
              <td className="text-center">packets</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Packets Transmitted</td>
              <td className="text-center font-mono">{stats.packets.transmitted}</td>
              <td className="text-center">packets</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">CRC Error</td>
              <td className="text-center font-mono">{stats['receive-crc-error']}</td>
              <td className="text-center">errors</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Frame Error</td>
              <td className="text-center font-mono">{stats['receive-frame-error']}</td>
              <td className="text-center">errors</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Overrun Error</td>
              <td className="text-center font-mono">{stats['receive-over-run-error']}</td>
              <td className="text-center">errors</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Receive Errors</td>
              <td className="text-center font-mono">{stats['receive-errors']}</td>
              <td className="text-center">errors</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Transmit Errors</td>
              <td className="text-center font-mono">{stats['transmit-errors']}</td>
              <td className="text-center">errors</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Receive Drops</td>
              <td className="text-center font-mono">{stats['receive-drops']}</td>
              <td className="text-center">drops</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Transmit Drops</td>
              <td className="text-center font-mono">{stats['transmit-drops']}</td>
              <td className="text-center">drops</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Collision Count</td>
              <td className="text-center font-mono">{stats['collision-count']}</td>
              <td className="text-center">collisions</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="pr-4 py-2">Duration</td>
              <td className="text-center font-mono">{stats.duration.second}s {stats.duration.nanosecond}ns</td>
              <td className="text-center">s / ns</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SwitchDetail; 