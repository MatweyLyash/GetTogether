import { Tabs, TabList, TabPanels, Tab, TabPanel, useBreakpointValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface CabinetTabsProps {
  tabIndex: number;
  onTabChange: (index: number) => void;
  tabs: { label: string; content: ReactNode }[];
}

/**
 * Tab navigation for Cabinet page
 */
export function CabinetTabs({ tabIndex, onTabChange, tabs }: CabinetTabsProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const fontSize = useBreakpointValue({ base: 'md', md: 'lg' });

  return (
    <Tabs
      variant="soft-rounded"
      index={tabIndex}
      onChange={onTabChange}
      size={isMobile ? 'sm' : 'md'}
      width="100%"
    >
      <TabList mb="1rem" flexWrap="wrap" gap="0.5rem">
        {tabs.map((tab) => {
          return (
            <Tab key={tab.label} fontSize={fontSize} px="1.25rem" py="0.85rem">
              {tab.label}
            </Tab>
          );
        })}
      </TabList>
      <TabPanels width="100%">
        {tabs.map((tab) => (
          <TabPanel key={tab.label} px={0} width="100%">
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
