import { FormControl, FormLabel, Box, Input } from '@chakra-ui/react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('ru', ru);

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Date range pickers (from/to)
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  buttonSize = 'md',
}: DateRangeFilterProps) {
  return (
    <>
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
            placeholderText="Выберите дату и время"
            portalId="root-portal"
            customInput={
              <Input bg="rgba(255,255,255,0.9)" size={buttonSize} width="100%" borderRadius="1.3rem" />
            }
          />
        </Box>
      </FormControl>

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
            placeholderText="Выберите дату и время"
            portalId="root-portal"
            customInput={
              <Input bg="rgba(255,255,255,0.9)" size={buttonSize} width="100%" borderRadius="1.3rem" />
            }
          />
        </Box>
      </FormControl>
    </>
  );
}
