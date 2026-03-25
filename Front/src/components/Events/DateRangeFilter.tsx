import { FormControl, FormLabel, Box, Input } from '@chakra-ui/react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('ru', ru);

interface StartDateFilterProps {
  startDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}

export function StartDateFilter({ startDate, onStartDateChange, buttonSize = 'md' }: StartDateFilterProps) {
  return (
    <FormControl>
      <FormLabel fontSize="sm" color="rgba(66, 32, 6, 0.74)" fontWeight="700">Дата (от)</FormLabel>
      <Box width="100%">
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => onStartDateChange(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Время"
          dateFormat="dd.MM.yyyy HH:mm"
          locale="ru"
          placeholderText="Выберите дату"
          portalId="root-portal"
          customInput={
            <Input bg="rgba(255,255,255,0.9)" size={buttonSize} width="100%" borderRadius="1.3rem" />
          }
        />
      </Box>
    </FormControl>
  );
}

interface EndDateFilterProps {
  endDate: Date | null;
  onEndDateChange: (date: Date | null) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}

export function EndDateFilter({ endDate, onEndDateChange, buttonSize = 'md' }: EndDateFilterProps) {
  return (
    <FormControl>
      <FormLabel fontSize="sm" color="rgba(66, 32, 6, 0.74)" fontWeight="700">Дата (до)</FormLabel>
      <Box width="100%">
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => onEndDateChange(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Время"
          dateFormat="dd.MM.yyyy HH:mm"
          locale="ru"
          placeholderText="Выберите дату"
          portalId="root-portal"
          customInput={
            <Input bg="rgba(255,255,255,0.9)" size={buttonSize} width="100%" borderRadius="1.3rem" />
          }
        />
      </Box>
    </FormControl>
  );
}
