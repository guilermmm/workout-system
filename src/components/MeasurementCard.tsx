const MeasurementCard = ({ title, value }: { title: string; value: string }) => (
  <div className="w-full rounded-md border-1 bg-slate-50 p-2 shadow-md">
    <div className="text-sm text-blue-600">{title}</div>
    <div className="h-full w-full text-sm text-gray-900">
      {Number.parseFloat(value) !== 0 ? value : "-"}
    </div>
  </div>
);

export default MeasurementCard;
