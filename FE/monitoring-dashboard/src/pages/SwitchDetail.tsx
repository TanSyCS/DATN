import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, TooltipProps } from 'recharts';
import switchDataRaw from '../../data-swtich.txt?raw';
import { ArrowLeft, Activity } from 'react-feather';

// Bảng màu hiện đại hơn
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

interface SwitchStats {
  bytes: {
    received: string;
    transmitted: string;
  };
  packets: {
    received: string;
    transmitted: string;
  };
  'receive-crc-error': string;
  'receive-frame-error': string;
  'receive-over-run-error': string;
  'receive-errors': string;
  'transmit-errors': string;
  'receive-drops': string;
  'transmit-drops': string;
  'collision-count': string;
  duration: {
    second: string;
    nanosecond: string;
  };
}

interface SwitchData {
  'opendaylight-port-statistics:flow-capable-node-connector-statistics': SwitchStats;
}

const parseSwitchData = (): SwitchData | null => {
  try {
    return JSON.parse(switchDataRaw);
  } catch {
    return null;
  }
};

const SwitchDetail = () => {
  const navigate = useNavigate();
  const data = parseSwitchData();
  
  if (!data) return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg border border-red-200 mt-8 text-center">
      <div className="text-red-600 flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xl font-semibold">Không có dữ liệu switch.</p>
        <button
          className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại Topology</span>
        </button>
      </div>
    </div>
  );
  
  const stats = data['opendaylight-port-statistics:flow-capable-node-connector-statistics'];

  const bytesData = [
    { name: 'Received', value: Number(stats.bytes.received) },
    { name: 'Transmitted', value: Number(stats.bytes.transmitted) },
  ];
  
  const packetsData = [
    { name: 'Received', value: Number(stats.packets.received) },
    { name: 'Transmitted', value: Number(stats.packets.transmitted) },
  ];
  
  const errorDropData = [
    { name: 'CRC Error', value: Number(stats['receive-crc-error']) },
    { name: 'Frame Error', value: Number(stats['receive-frame-error']) },
    { name: 'Overrun Error', value: Number(stats['receive-over-run-error']) },
    { name: 'Receive Errors', value: Number(stats['receive-errors']) },
    { name: 'Transmit Errors', value: Number(stats['transmit-errors']) },
    { name: 'Receive Drops', value: Number(stats['receive-drops']) },
    { name: 'Transmit Drops', value: Number(stats['transmit-drops']) },
  ];

  // Format large numbers with commas
  const formatNumber = (num: number | string): string => {
    const numberValue = typeof num === 'string' ? Number(num) : num;
    return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length && payload[0].value !== undefined) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium text-gray-700">{`${label}`}</p>
          <p className="text-blue-600 font-semibold">{`${formatNumber(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 mt-8 mb-12 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <button
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại Topology</span>
        </button>
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Switch Statistics
          </h2>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
          <div className="text-sm text-blue-600 font-medium">Total Bytes</div>
          <div className="text-2xl font-bold text-blue-800">
            {formatNumber(Number(stats.bytes.received) + Number(stats.bytes.transmitted))}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
          <div className="text-sm text-green-600 font-medium">Total Packets</div>
          <div className="text-2xl font-bold text-green-800">
            {formatNumber(Number(stats.packets.received) + Number(stats.packets.transmitted))}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 shadow-sm">
          <div className="text-sm text-yellow-600 font-medium">Total Errors</div>
          <div className="text-2xl font-bold text-yellow-800">
            {formatNumber(
              Number(stats['receive-errors']) + 
              Number(stats['transmit-errors']) + 
              Number(stats['receive-crc-error']) + 
              Number(stats['receive-frame-error']) + 
              Number(stats['receive-over-run-error'])
            )}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-sm">
          <div className="text-sm text-red-600 font-medium">Total Drops</div>
          <div className="text-2xl font-bold text-red-800">
            {formatNumber(Number(stats['receive-drops']) + Number(stats['transmit-drops']))}
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="font-semibold text-gray-700 mb-4 text-lg">Bytes Transferred</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bytesData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Bytes" radius={[4, 4, 0, 0]}>
                {bytesData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[0] : COLORS[1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="font-semibold text-gray-700 mb-4 text-lg">Packets Transferred</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={packetsData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Packets" radius={[4, 4, 0, 0]}>
                {packetsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[2] : COLORS[3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8">
        <div className="font-semibold text-gray-700 mb-4 text-lg">Error & Drop Histogram</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={errorDropData} margin={{ top: 10, right: 30, left: 0, bottom: 70 }}>
            <XAxis 
              dataKey="name" 
              interval={0} 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" align="center" layout="horizontal" wrapperStyle={{ marginTop: 32 }} />
            <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
              {errorDropData.map((_, idx) => (
                <Cell key={`bar-cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Detailed Stats Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="font-semibold text-gray-700 mb-4 text-lg">Chi tiết số liệu</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Thông số</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Giá trị</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Đơn vị</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Bytes Received</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats.bytes.received)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">bytes</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Bytes Transmitted</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats.bytes.transmitted)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">bytes</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Packets Received</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats.packets.received)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">packets</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Packets Transmitted</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats.packets.transmitted)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">packets</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">CRC Error</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['receive-crc-error'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">errors</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Frame Error</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['receive-frame-error'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">errors</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Overrun Error</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['receive-over-run-error'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">errors</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Receive Errors</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['receive-errors'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">errors</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Transmit Errors</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['transmit-errors'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">errors</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Receive Drops</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['receive-drops'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">drops</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Transmit Drops</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['transmit-drops'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">drops</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Collision Count</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{formatNumber(stats['collision-count'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">collisions</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Duration</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                  {stats.duration.second}s {stats.duration.nanosecond}ns
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">s / ns</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SwitchDetail;