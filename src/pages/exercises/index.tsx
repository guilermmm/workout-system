import type { Exercise } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { z } from "zod";
import Alert from "../../components/Alert";
import FullPage from "../../components/FullPage";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import TextInput from "../../components/TextInput";
import Header from "../../components/admin/Header";
import Navbar from "../../components/admin/Navbar";
import MagnifyingGlassIcon from "../../components/icons/MagnifyingGlassIcon";
import TrashIcon from "../../components/icons/TrashIcon";
import XMarkIcon from "../../components/icons/XMarkIcon";
import { env } from "../../env/server.mjs";
import { getServerAuthSession } from "../../server/auth";
import { useClickOutside, useLocalStorage } from "../../utils";
import { api } from "../../utils/api";
import PencilSquareIcon from "../../components/icons/PencilSquareIcon";

const organizeByParser = z.union([z.literal("name"), z.literal("category")]);

const Dashboard = () => {
  const { data: session } = useSession();

  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");

  const [organizeBy, setOrganizeBy] = useLocalStorage(
    "exercises-organize-by",
    organizeByParser,
    "category",
  );

  const groups = api.exercise.getGroups.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const filteredGroups = useMemo(
    () =>
      searchInput === ""
        ? groups.data
        : groups.data
            ?.map(group => {
              const searchLower = searchInput.toLowerCase();

              if (group.category.toLowerCase().includes(searchLower)) {
                return group;
              } else {
                const filteredExercises = group.exercises.filter(e =>
                  e.name.toLowerCase().includes(searchLower),
                );
                return { category: group.category, exercises: filteredExercises };
              }
            })
            .filter(g => g.exercises.length > 0),
    [groups, searchInput],
  );

  const filteredExercises = useMemo(
    () => filteredGroups?.flatMap(g => g.exercises) ?? groups.data?.flatMap(g => g.exercises),
    [filteredGroups, groups],
  );

  const errorAlertRef = useClickOutside<HTMLDivElement>(() => void groups.refetch());

  const [toBeRemoved, setToBeRemoved] = useState<{ id: string; name: string } | null>(null);

  const removeAlertRef = useClickOutside<HTMLDivElement>(() => setToBeRemoved(null));

  const [newExercise, setNewExercise] = useState({ name: "", category: "" });

  const [editedExercise, setEditedExercise] = useState({ name: "", category: "", id: "" });

  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const newExerciseModalRef = useClickOutside<HTMLDivElement>(() => setShowExerciseModal(false));

  const addExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      void groups.refetch();
      setNewExercise({ name: "", category: "" });
      setShowExerciseModal(false);
    },
  });

  const addMutationErrorRef = useClickOutside<HTMLDivElement>(() => addExercise.reset());

  const editExercise = api.exercise.update.useMutation({
    onSuccess: () => {
      void groups.refetch();
      setEditedExercise({ name: "", category: "", id: "" });
      setShowExerciseModal(false);
    },
  });

  const showEditModal = editedExercise.id !== "";

  const editMutationErrorRef = useClickOutside<HTMLDivElement>(() => editExercise.reset());

  const removeExercise = api.exercise.delete.useMutation({
    onSuccess: () => {
      setToBeRemoved(null);
      void groups.refetch();
    },
  });

  const removeMutationErrorRef = useClickOutside<HTMLDivElement>(() => removeExercise.reset());

  return (
    <FullPage>
      {toBeRemoved && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title={`Tem certeza que deseja remover ${toBeRemoved.name}?`}
          text={`Todos os treinos que contém ${toBeRemoved.name} serão afetados, e não será possível desfazer esta ação`}
          ref={removeAlertRef}
        >
          <button
            className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-white shadow-md"
            onClick={() => removeExercise.mutate({ id: toBeRemoved.id })}
          >
            Salvar alterações
          </button>
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={() => setToBeRemoved(null)}
          >
            Cancelar
          </button>
        </Alert>
      )}
      {addExercise.error && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não foi possível criar o exercício"
          text="Não foi possível criar o exercício, tente novamente mais tarde"
          ref={addMutationErrorRef}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={addExercise.reset}
          >
            OK
          </button>
        </Alert>
      )}
      {removeExercise.error && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não foi possível remover o exercício"
          text="Não foi possível remover o exercício, tente novamente mais tarde"
          ref={removeMutationErrorRef}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={removeExercise.reset}
          >
            OK
          </button>
        </Alert>
      )}
      {editExercise.error && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não foi possível editar o exercício"
          text="Não foi possível editar o exercício, tente novamente mais tarde"
          ref={editMutationErrorRef}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={editExercise.reset}
          >
            OK
          </button>
        </Alert>
      )}
      {groups.isError && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não conseguimos buscar estes dados"
          text="Não foi possível buscar os dados necessários para acessar esta página, verifique sua conexão e tente novamente"
          ref={errorAlertRef}
        >
          <button
            className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-white shadow-md"
            onClick={() => void groups.refetch()}
          >
            Tentar novamente
          </button>
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={router.back}
          >
            Voltar à página anterior
          </button>
        </Alert>
      )}
      <Header user={session?.user} />
      <div className="m-2 flex items-center gap-2">
        <div className="relative grow">
          <input
            type="text"
            className="h-12 w-full rounded-full border-2 pl-4 pr-12"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
        </div>
        <div>
          <div className="inline-flex">
            <span className="mr-1 text-sm font-medium text-gray-900">Alfabética</span>
            <label className="relative cursor-pointer items-center">
              <input
                type="checkbox"
                checked={organizeBy === "category"}
                onChange={e => setOrganizeBy(e.target.checked ? "category" : "name")}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
            </label>
            <span className="ml-1 text-sm font-medium text-gray-900">Categoria</span>
          </div>
        </div>
      </div>
      <div className="mb-2 flex justify-end px-2">
        <button
          className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-sm text-white shadow-md"
          onClick={() => setShowExerciseModal(true)}
        >
          Adicionar novo exercício
        </button>
      </div>
      <div className="relative grow overflow-y-scroll">
        <div className="mx-4 flex h-full flex-1 grow flex-col items-center gap-4">
          {groups.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            filteredGroups && (
              <div className="flex w-full max-w-[32rem] flex-col gap-1">
                {organizeBy === "category"
                  ? filteredGroups.map(category => (
                      <CategoryCard
                        {...category}
                        key={category.category}
                        handleRemoveExercise={e => () => setToBeRemoved(e)}
                        handleEditExercise={e => () => setEditedExercise(e)}
                      />
                    ))
                  : filteredExercises?.map(exercise => (
                      <ExerciseCard
                        {...exercise}
                        key={exercise.id}
                        showCategory
                        handleRemoveExercise={e => () => setToBeRemoved(e)}
                        handleEditExercise={e => () => setEditedExercise(e)}
                      />
                    ))}
              </div>
            )
          )}
          {showExerciseModal && (
            <Modal
              ref={newExerciseModalRef}
              buttons={
                <>
                  <button
                    onClick={() => addExercise.mutate(newExercise)}
                    className="rounded-md bg-blue-500 px-3 py-1 text-white shadow-md"
                  >
                    Adicionar
                  </button>
                  <button
                    className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                    onClick={() => setShowExerciseModal(false)}
                  >
                    Cancelar
                  </button>
                </>
              }
            >
              <h1 className="self-center font-medium sm:self-auto">Adicionar exercício</h1>
              <TextInput
                label="Nome"
                className="rounded-md bg-white"
                value={newExercise.name}
                onChange={name => setNewExercise({ ...newExercise, name })}
              />
              <TextInput
                label="Categoria"
                list="categories"
                className="rounded-md bg-white"
                value={newExercise.category}
                onChange={category => setNewExercise({ ...newExercise, category })}
              />
              <datalist id="categories">
                {groups.data?.map(group => (
                  <option key={group.category} value={group.category} />
                ))}
              </datalist>
            </Modal>
          )}

          {showEditModal && (
            <Modal
              ref={newExerciseModalRef}
              buttons={
                <>
                  <button
                    onClick={() => editExercise.mutate(editedExercise)}
                    className="rounded-md bg-blue-500 px-3 py-1 text-white shadow-md"
                  >
                    Salvar
                  </button>
                  <button
                    className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                    onClick={() => setEditedExercise({ name: "", category: "", id: "" })}
                  >
                    Cancelar
                  </button>
                </>
              }
            >
              <h1 className="self-center font-medium sm:self-auto">Editar exercício</h1>
              <TextInput
                label="Nome"
                className="rounded-md bg-white"
                value={editedExercise.name}
                onChange={name => setEditedExercise({ ...editedExercise, name })}
              />
              <TextInput
                label="Categoria"
                list="categories"
                className="rounded-md bg-white"
                value={editedExercise.category}
                onChange={category => setEditedExercise({ ...editedExercise, category })}
              />
              <datalist id="categories">
                {groups.data?.map(group => (
                  <option key={group.category} value={group.category} />
                ))}
              </datalist>
            </Modal>
          )}
        </div>
      </div>
      <Navbar />
    </FullPage>
  );
};

const ExerciseCard = ({
  id,
  name,
  category,
  showCategory = false,
  handleRemoveExercise,
  handleEditExercise,
}: {
  id: string;
  name: string;
  category: string;
  showCategory?: boolean;
  handleRemoveExercise: (e: { id: string; name: string }) => () => void;
  handleEditExercise: (e: { id: string; name: string; category: string }) => () => void;
}) => {
  return (
    <div className="flex max-w-[calc(100vw_-_2rem)] flex-1 flex-row items-center justify-between rounded-md bg-blue-500">
      <div className="flex w-full flex-col justify-between truncate px-3 py-2">
        <div className="text-md truncate text-white">{name}</div>
        {showCategory && <div className="truncate text-sm text-slate-100">{category}</div>}
      </div>
      <div className="flex items-center justify-center gap-1 px-3">
        <button onClick={handleEditExercise({ id, name, category })}>
          <PencilSquareIcon className="h-6 w-6 text-gold-500" />
        </button>
        <button onClick={handleRemoveExercise({ id, name })}>
          <TrashIcon className="h-6 w-6 text-red-500" />
        </button>
      </div>
    </div>
  );
};

const CategoryCard = ({
  category,
  exercises,
  handleRemoveExercise,
  handleEditExercise,
}: {
  category: string;
  exercises: Exercise[];
  handleRemoveExercise: (e: { id: string; name: string }) => () => void;
  handleEditExercise: (e: { id: string; name: string; category: string }) => () => void;
}) => {
  return (
    <div className="flex flex-1 flex-col" key={category}>
      <div className="w-min">
        <div className="text-lg font-medium text-slate-800">{category}</div>
        <div className="mb-2 h-1 w-full bg-gold-500" />
      </div>
      <div className="flex flex-col gap-1">
        {exercises.map(exercise => (
          <ExerciseCard
            {...exercise}
            key={exercise.id}
            handleRemoveExercise={handleRemoveExercise}
            handleEditExercise={handleEditExercise}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
