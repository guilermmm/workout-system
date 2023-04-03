type Props = {
  children: React.ReactNode;
};

const FullPage: React.FC<Props> = ({ children }) => {
  return <div className="flex h-full flex-col bg-slate-100">{children}</div>;
};

export default FullPage;
