interface CellProps {
  value: number | null;
}

const Cell = ({ value }: CellProps) => {
  const getClassName = () => {
    switch (value) {
      case 2:
        return 'cell cell-2';
      case 4:
        return 'cell cell-4';
      case 8:
        return 'cell cell-8';
      case 16:
        return 'cell cell-16';
      case 32:
        return 'cell cell-32';
      case 64:
        return 'cell cell-64';
      case 128:
        return 'cell cell-128';
      case 256:
        return 'cell cell-256';
      case 512:
        return 'cell cell-512';
      case 1024:
        return 'cell cell-1024';
      case 2048:
        return 'cell cell-2048';
      default:
        return 'cell';
    }
  };

  return <div className={getClassName()}>{value !== null ? value : ''}</div>;
};

export default Cell;
