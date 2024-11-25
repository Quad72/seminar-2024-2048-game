import styles from './css/Cell.module.css';

interface CellProps {
  value: number | null;
}

const Cell = ({ value }: CellProps) => {
  const getClassName = () => {
    const styledCell = value !== null ? styles[`cell-${value}`] : undefined;
    return value !== null &&
      styles.cell !== undefined &&
      styledCell !== undefined
      ? `${styles.cell} ${styledCell}`
      : styles.cell;
  };

  return <div className={getClassName()}>{value !== null ? value : ''}</div>;
};

export default Cell;
