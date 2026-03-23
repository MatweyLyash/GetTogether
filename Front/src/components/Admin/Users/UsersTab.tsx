import { useState } from 'react';
import { TabPanel, VStack, Heading, Input, Select, Table, Thead, Tbody, Tr, Th, Td, HStack, Button, Badge, useBreakpointValue } from '@chakra-ui/react';

interface User {
  id: string;
  login: string;
  role_id: number;
  telegram: string | null;
  is_blocked: boolean;
}

interface UsersTabProps {
  users: User[];
  isLoading: boolean;
  onBan: (userId: string, isBanned: boolean) => Promise<void>;
  onUnassignOrganizer: (userId: string) => Promise<void>;
}

export function UsersTab({ users, isLoading, onBan, onUnassignOrganizer }: UsersTabProps) {
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter ? u.role_id === Number(roleFilter) : true;
    const matchesSearch = u.login.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (roleId: number) => {
    const roles: Record<number, { label: string; color: string }> = {
      1: { label: 'Пользователь', color: 'blue' },
      2: { label: 'Организатор', color: 'green' },
      3: { label: 'Админ', color: 'red' },
    };
    const role = roles[roleId] || { label: 'Неизвестно', color: 'gray' };
    return <Badge colorScheme={role.color}>{role.label}</Badge>;
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    await onBan(userId, isBanned);
  };

  return (
    <TabPanel className="tabPanel">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Пользователи</Heading>

        <HStack spacing={3} flexWrap="wrap">
          <Input
            placeholder="Поиск по имени"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
            size={buttonSize}
            maxW="250px"
          />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} bg="white" size={buttonSize} maxW="200px">
            <option value="">Все роли</option>
            <option value="1">Пользователи</option>
            <option value="2">Организаторы</option>
            <option value="3">Админы</option>
          </Select>
        </HStack>

        <div className="tableContainer">
          <Table variant="simple" size={buttonSize}>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Логин</Th>
                <Th>Роль</Th>
                <Th>Telegram</Th>
                <Th>Статус</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td fontWeight="medium">{user.login}</Td>
                  <Td>{getRoleBadge(user.role_id)}</Td>
                  <Td>{user.telegram || '—'}</Td>
                  <Td>
                    <Badge colorScheme={user.is_blocked ? 'red' : 'green'}>
                      {user.is_blocked ? 'Заблокирован' : 'Активен'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size={buttonSize}
                        colorScheme={user.is_blocked ? 'green' : 'red'}
                        onClick={() => handleBan(user.id, user.is_blocked)}
                        isLoading={isLoading}
                      >
                        {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                      </Button>
                      {user.role_id === 2 && (
                        <Button
                          size={buttonSize}
                          colorScheme="orange"
                          onClick={() => onUnassignOrganizer(user.id)}
                          isLoading={isLoading}
                        >
                          Снять роль
                        </Button>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </VStack>
    </TabPanel>
  );
}
