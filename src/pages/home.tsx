const Home = () => {
  return (
    <div className="min-h-full bg-tertiary-100">
      <div className="mb-4 flex items-center justify-between bg-primary-400 p-4 ">
        <div className="flex items-center">
          <img
            src="https://reqres.in/img/faces/7-image.jpg"
            alt="mulhe"
            className="h-16 w-16 rounded-full"
          />
          <h1 className="ml-4 text-lg">Olá, Fulano!</h1>
        </div>
        <button className="rounded-full bg-secondary-500 py-2 px-4 hover:bg-slate-600">
          Logout
        </button>
      </div>
      <div className="flex flex-col bg-primary-400 p-4 text-xl">
        <div>Seus treinos ativos:</div>
        <div className="even flex flex-row flex-wrap">
          <WorkoutCard name="Treino A" description="Peito, ombro e tríceps" />
          <WorkoutCard name="Treino B" description="Peito, ombro e tríceps" />
          <WorkoutCard name="Treino C" description="Peito, ombro e tríceps" />
          <WorkoutCard name="Treino D" description="Peito, ombro e tríceps" />
        </div>
      </div>
    </div>
  );
};

const WorkoutCard = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => {
  return (
    <div className="m-2  min-w-fit flex-1 rounded-sm border-2 border-secondary-300 bg-secondary-500 p-6">
      <div className="text-xl font-bold">{name}</div>
      <div className="text-sm font-thin text-gray-600">{description}</div>
    </div>
  );
};

export default Home;
