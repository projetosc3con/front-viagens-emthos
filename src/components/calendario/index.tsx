import React, { useState } from 'react';
import {
  parse,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  addMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Container } from './styles';

interface CalendarRangeProps {
  startDate: string; // formato: dd/MM/yyyy
  endDate: string;   // formato: dd/MM/yyyy
  /** Recebe a data clicada em "dd/MM/yyyy" */
  handleClick?: (date: string) => void;
}

const CalendarRange: React.FC<CalendarRangeProps> = ({
  startDate,
  endDate,
  handleClick
}) => {
  const parsedStartDate = parse(startDate, 'dd/MM/yyyy', new Date());
  const parsedEndDate = parse(endDate, 'dd/MM/yyyy', new Date());

  // calcula cada mês a renderizar
  const monthsToRender: Date[] = [];
  let cursor = startOfMonth(parsedStartDate);
  while (cursor <= parsedEndDate) {
    monthsToRender.push(cursor);
    cursor = addMonths(cursor, 1);
  }

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const month = monthsToRender[currentMonthIndex];
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goPrev = () =>
    setCurrentMonthIndex(i => Math.max(i - 1, 0));
  const goNext = () =>
    setCurrentMonthIndex(i =>
      Math.min(i + 1, monthsToRender.length - 1)
    );

  return (
    <Container>
      <div className="d-flex justify-content-center mb-2">
        <h5 style={{ margin: 0 }}>
          {format(month, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}{' '}
          <i className="bi bi-calendar3-range" />
        </h5>
        {monthsToRender.length > 1 && (
          <div className="d-flex ms-4">
            <button
              className="btn"
              onClick={goPrev}
              disabled={currentMonthIndex === 0}
            >
              <i className="bi bi-caret-left-fill" />
            </button>
            <button
              className="btn"
              onClick={goNext}
              disabled={
                currentMonthIndex ===
                monthsToRender.length - 1
              }
            >
              <i className="bi bi-caret-right-fill" />
            </button>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-center">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 40px)',
            gap: '4px'
          }}
        >
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div
              key={i}
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '0.75rem'
              }}
            >
              {d}
            </div>
          ))}

          {/* espaços em branco até o primeiro dia do mês */}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map(day => {
            const isInRange = isWithinInterval(day, {
              start: parsedStartDate,
              end: parsedEndDate
            });
            const label = format(day, 'd');
            const fullDate = format(day, 'dd/MM/yyyy');

            return (
              <div
                key={day.toISOString()}
                style={{
                  backgroundColor: isInRange
                    ? '#B85A5A'
                    : '#1e1e1e',
                  textAlign: 'center',
                  borderRadius: '4px',
                  padding: '4px',
                  cursor: isInRange ? 'pointer' : 'default'
                }}
                onClick={
                  isInRange
                    ? () => handleClick?.(fullDate)
                    : undefined
                }
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
};

export default CalendarRange;

