import { Tabs, TabList, TabPanels, Tab, Select, useBreakpointValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface AdminTabsProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  children: ReactNode;
}

const tabLabels = [
  'Категории',
  'Пользователи',
  'Запросы организаторов',
  'Мероприятия',
  'Достижения',
  'Теги',
];

/**
 * Tab navigation for Admin page with mobile support
 */
export function AdminTabs({ activeTab, onTabChange, children }: AdminTabsProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <>
      {isMobile && (
        <Select
          value={activeTab}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onTabChange(Number(e.target.value))}
          mb={4}
          size="md"
        >
          {tabLabels.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </Select>
      )}

      <Tabs
        variant="enclosed"
        colorScheme="blue"
        index={activeTab}
        onChange={onTabChange}
        display={isMobile ? 'none' : 'block'}
      >
        <TabList mb={4} flexWrap="wrap" gap={1}>
          {tabLabels.map((label) => (
            <Tab key={label}>{label}</Tab>
          ))}
        </TabList>
        <TabPanels>{children}</TabPanels>
      </Tabs>
    </>
  );
}
