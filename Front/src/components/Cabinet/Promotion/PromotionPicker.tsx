import { useState, useEffect } from 'react';
import { FaRocket, FaRedo, FaCrown, FaArrowUp } from 'react-icons/fa';
import { getPromotionPrices, PromotionPriceInfo } from '../../../api/api';
import styles from './PromotionPicker.module.scss';

interface PromotionSelection {
  type: 'none' | 'one_time' | 'boost' | 'repeat' | 'premium';
  duration_days: number;
}

interface PromotionPickerProps {
  value: PromotionSelection;
  onChange: (val: PromotionSelection) => void;
}

const DEFAULT_PRICES: PromotionPriceInfo = {
  one_time: { byn: 2, usd_cents: 60, default_days: 1 },
  boost:    { byn: 5, usd_cents: 150, default_days: 3 },
  repeat:   { byn_per_day: 3, usd_cents_per_day: 90 },
  premium:  { byn_per_day: 5, usd_cents_per_day: 150 },
};

export function PromotionPicker({ value, onChange }: PromotionPickerProps) {
  const [prices, setPrices] = useState<PromotionPriceInfo>(DEFAULT_PRICES);

  useEffect(() => {
    getPromotionPrices().then(setPrices).catch(() => {});
  }, []);

  const calcRepeatPrice = (days: number) => prices.repeat.byn_per_day * days;
  const calcPremiumPrice = (days: number) => prices.premium.byn_per_day * days;

  const repeatDays = value.type === 'repeat' ? value.duration_days : 1;
  const premiumDays = value.type === 'premium' ? value.duration_days : 1;

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <FaCrown style={{ color: '#ca8a04' }} /> Продвижение мероприятия
      </div>

      <div className={styles.tiers}>
        <div
          className={`${styles.tier} ${styles.tierBoost} ${value.type === 'boost' ? styles.selected : ''}`}
          onClick={() => onChange({ type: 'boost', duration_days: 3 })}
        >
          <FaRocket className={styles.tierIcon} />
          <div className={styles.tierName}>Повышение</div>
          <div className={styles.tierPrice}>{prices.boost.byn} BYN</div>
          <div className={styles.tierDesc}>
            Поднимается в топ выдачи раз в сутки
          </div>
          <div className={styles.tierDesc}>Длительность: 3 дня</div>
        </div>

        <div
          className={`${styles.tier} ${styles.tierRepeat} ${value.type === 'repeat' ? styles.selected : ''}`}
          onClick={() => onChange({ type: 'repeat', duration_days: repeatDays })}
        >
          <FaRedo className={styles.tierIcon} />
          <div className={styles.tierName}>Повтор</div>
          <div className={styles.tierPrice}>{calcRepeatPrice(repeatDays)} BYN</div>
          <div className={styles.tierDesc}>
            Появляется каждые 20–25 мероприятий в выдаче
          </div>
          <div className={styles.tierIncludes}>Включает «Повышение»</div>
          <div className={styles.durationRow}>
            <span className={styles.durationLabel}>Дней:</span>
            <div className={styles.durationBtns}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  className={`${styles.durationBtn} ${repeatDays === d ? styles.active : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ type: 'repeat', duration_days: d });
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`${styles.tier} ${styles.tierPremium} ${value.type === 'premium' ? styles.selected : ''}`}
          onClick={() => onChange({ type: 'premium', duration_days: premiumDays })}
        >
          <FaCrown className={styles.tierIcon} />
          <div className={styles.tierName}>Премиум</div>
          <div className={styles.tierPrice}>{calcPremiumPrice(premiumDays)} BYN</div>
          <div className={styles.tierDesc}>
            Выделенная карточка с особым дизайном в выдаче
          </div>
          <div className={styles.tierIncludes}>
            Включает «Повтор» и «Повышение»
          </div>
          <div className={styles.durationRow}>
            <span className={styles.durationLabel}>Дней:</span>
            <div className={styles.durationBtns}>
              {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                <button
                  key={d}
                  className={`${styles.durationBtn} ${premiumDays === d ? styles.active : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ type: 'premium', duration_days: d });
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.oneTimeBtn} ${value.type === 'one_time' ? styles.selected : ''}`}
        onClick={() => onChange({ type: 'one_time', duration_days: 1 })}
      >
        <span className={styles.oneTimeLeft}>
          <FaArrowUp style={{ color: '#ca8a04' }} />
          Единоразовый подъём
        </span>
        <span className={styles.oneTimePrice}>{prices.one_time.byn} BYN</span>
      </div>

      <button
        className={`${styles.noneBtn} ${value.type === 'none' ? styles.selected : ''}`}
        onClick={() => onChange({ type: 'none', duration_days: 0 })}
      >
        Без продвижения
      </button>
    </div>
  );
}
