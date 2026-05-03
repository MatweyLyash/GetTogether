import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  Heading,
  Text,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { FaEye, FaUsers, FaChartLine, FaSignInAlt } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getOrganizerStats, OrganizerStats } from '../../../api/api';

const GT = {
  primary: '#facc15',
  primaryStrong: '#eab308',
  primaryDark: '#ca8a04',
  ink: '#422006',
  inkSoft: 'rgba(66, 32, 6, 0.72)',
  border: 'rgba(234, 179, 8, 0.18)',
  bg: '#fffdf5',
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}

function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <Box
      p="1.25rem"
      borderRadius="1.5rem"
      bg="rgba(255,255,255,0.92)"
      border={`1px solid ${GT.border}`}
      boxShadow="0 8px 20px rgba(140, 91, 14, 0.06)"
    >
      <Flex align="center" gap="0.75rem" mb="0.5rem">
        <Box color={GT.primaryDark} fontSize="1.15rem">{icon}</Box>
        <Text color={GT.inkSoft} fontSize="0.82rem" fontWeight="600">
          {label}
        </Text>
      </Flex>
      <Text color={GT.ink} fontSize="1.6rem" fontWeight="800" fontFamily="Outfit, sans-serif" lineHeight="shorter">
        {value}
      </Text>
      {hint && (
        <Text color="rgba(66,32,6,0.5)" fontSize="0.72rem" mb={0}>
          {hint}
        </Text>
      )}
    </Box>
  );
}

interface StatsTabProps {
  isLoading: boolean;
}

export function StatsTab({ isLoading: parentLoading }: StatsTabProps) {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrganizerStats();
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка загрузки статистики';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading || parentLoading) {
    return (
      <Flex justify="center" py="3rem">
        <Spinner size="xl" color={GT.primaryStrong} thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p="2rem" borderRadius="2xl" bg="rgba(255,255,255,0.9)" border={`1px solid ${GT.border}`}>
        <Text color="red.600">{error}</Text>
      </Box>
    );
  }

  if (!stats) return null;

  const { totals, viewsByDay, events } = stats;

  const topEvents = [...events]
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 10)
    .map((e) => ({
      name: e.title.length > 18 ? e.title.slice(0, 17) + '…' : e.title,
      Просмотры: e.total_views,
      Уникальные: e.unique_views,
      Регистрации: e.registrations,
    }));

  const chartData = viewsByDay.map((d) => ({
    date: d.date.slice(5),
    Просмотры: d.views,
    'Уникальные': d.unique_views,
  }));

  const content = (
    <VStack spacing="1.5rem" align="stretch" width="100%">
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing="1rem">
        <StatCard
          icon={<FaEye />}
          label="Просмотры"
          value={totals.views}
          hint={`${totals.uniqueViews} уникальных`}
        />
        <StatCard
          icon={<FaUsers />}
          label="Регистрации"
          value={totals.registrations}
        />
        <StatCard
          icon={<FaChartLine />}
          label="Конверсия"
          value={`${totals.conversion}%`}
          hint="просмотры → регистрации"
        />
        <StatCard
          icon={<FaSignInAlt />}
          label="Мероприятий"
          value={events.length}
        />
      </SimpleGrid>

      <Box
        p="1.5rem"
        borderRadius="1.5rem"
        bg="rgba(255,255,255,0.92)"
        border={`1px solid ${GT.border}`}
        boxShadow="0 8px 20px rgba(140, 91, 14, 0.06)"
      >
        <Heading as="h4" size="sm" color={GT.ink} mb="1rem" fontFamily="Outfit, sans-serif">
          Просмотры за 30 дней
        </Heading>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.12)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: GT.inkSoft }} />
              <YAxis tick={{ fontSize: 11, fill: GT.inkSoft }} />
              <Tooltip
                contentStyle={{
                  background: GT.bg,
                  border: `1px solid ${GT.border}`,
                  borderRadius: '0.75rem',
                  fontSize: '0.82rem',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              <Line
                type="monotone"
                dataKey="Просмотры"
                stroke={GT.primaryStrong}
                strokeWidth={2.5}
                dot={{ r: 3, fill: GT.primaryStrong }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Уникальные"
                stroke={GT.primaryDark}
                strokeWidth={2}
                dot={{ r: 3, fill: GT.primaryDark }}
                strokeDasharray="5 3"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Text color={GT.inkSoft} fontSize="0.88rem" py="2rem" textAlign="center">
            Пока нет данных о просмотрах
          </Text>
        )}
      </Box>

      <Box
        p="1.5rem"
        borderRadius="1.5rem"
        bg="rgba(255,255,255,0.92)"
        border={`1px solid ${GT.border}`}
        boxShadow="0 8px 20px rgba(140, 91, 14, 0.06)"
      >
        <Heading as="h4" size="sm" color={GT.ink} mb="1rem" fontFamily="Outfit, sans-serif">
          Топ мероприятий по просмотрам
        </Heading>
        {topEvents.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(200, topEvents.length * 48)}>
            <BarChart data={topEvents} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: GT.inkSoft }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: GT.inkSoft }}
                width={130}
              />
              <Tooltip
                contentStyle={{
                  background: GT.bg,
                  border: `1px solid ${GT.border}`,
                  borderRadius: '0.75rem',
                  fontSize: '0.82rem',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              <Bar dataKey="Просмотры" fill="#facc15" radius={[0, 6, 6, 0]} barSize={16} />
              <Bar dataKey="Уникальные" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={16} />
              <Bar dataKey="Регистрации" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Text color={GT.inkSoft} fontSize="0.88rem" py="2rem" textAlign="center">
            Создайте мероприятие, чтобы увидеть статистику
          </Text>
        )}
      </Box>

      {events.length > 0 && (
        <Box
          p="1.5rem"
          borderRadius="1.5rem"
          bg="rgba(255,255,255,0.92)"
          border={`1px solid ${GT.border}`}
          boxShadow="0 8px 20px rgba(140, 91, 14, 0.06)"
          overflowX="auto"
        >
          <Heading as="h4" size="sm" color={GT.ink} mb="1rem" fontFamily="Outfit, sans-serif">
            Подробная статистика по мероприятиям
          </Heading>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${GT.border}` }}>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: GT.inkSoft }}>Мероприятие</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: GT.inkSoft }}>Просмотры</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: GT.inkSoft }}>Уникальные</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: GT.inkSoft }}>Регистрации</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: GT.inkSoft }}>Конверсия</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} style={{ borderBottom: `1px solid rgba(234,179,8,0.1)` }}>
                  <td style={{ padding: '0.5rem', color: GT.ink, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.title}
                  </td>
                  <td style={{ textAlign: 'center', padding: '0.5rem', color: GT.ink }}>{e.total_views}</td>
                  <td style={{ textAlign: 'center', padding: '0.5rem', color: GT.inkSoft }}>{e.unique_views}</td>
                  <td style={{ textAlign: 'center', padding: '0.5rem', color: GT.ink }}>{e.registrations}</td>
                  <td style={{ textAlign: 'center', padding: '0.5rem', color: GT.primaryDark, fontWeight: 700 }}>
                    {e.conversion}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </VStack>
  );

  return content;
}
